#include "GestureController.h"
#include <cmath>
#include <QDebug>

GestureController::GestureController(QObject *parent)
    : QObject(parent), m_isCameraVisible(true), m_lastGestureTime(0), m_lastClickTime(0)
{
}

void GestureController::setIsCameraVisible(bool visible)
{
    if (m_isCameraVisible != visible) {
        m_isCameraVisible = visible;
        emit isCameraVisibleChanged();
    }
}

void GestureController::processLandmarks(const QVector<Landmark> &landmarks)
{
    if (landmarks.isEmpty()) return;

    Landmark wrist = landmarks[0];
    Landmark indexTip = landmarks[8];
    Landmark thumbTip = landmarks[4];
    qint64 now = QDateTime::currentMSecsSinceEpoch();

    // 1. UPDATE CURSOR (Index Finger Tip)
    // Mirror X for UI
    float handX = 1.0f - indexTip.x;
    float handY = indexTip.y;

    // Pinch for Click (Thumb close to Index)
    float pinchDist = std::hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
    bool isPinching = pinchDist < 0.05;

    emit cursorMoved(handX, handY, isPinching);

    if (isPinching) {
        triggerClick(handX, handY);
    }

    // 2. DETECT MOTION (Velocity Check)
    m_gestureHistory.push_back(QPointF(handX, handY));
    if (m_gestureHistory.size() > 60) {
        m_gestureHistory.pop_front(); // Keep ~2 secs
    }

    bool isMoving = false;
    if (m_gestureHistory.size() > 5) {
        QPointF start = m_gestureHistory.first();
        QPointF end = m_gestureHistory.last();
        // Check dist over whole history or recent? TS checks start vs end of last 5 frames? 
        // TS: recent = gestureHistory.current.slice(-5); dist of first vs last.
        // Let's implement looking at last 5 frames.
        int count = m_gestureHistory.size();
        int lookback = std::min(count, 5);
        QPointF p1 = m_gestureHistory[count - lookback];
        QPointF p2 = m_gestureHistory[count - 1];
        float dist = std::hypot(p2.x() - p1.x(), p2.y() - p1.y());
        
        if (dist > 0.02) isMoving = true;
    }

    // 3. BRANCH LOGIC
    if (isMoving) {
        detectRotation(now);
        detectSwipe(now);
    } else {
        // Debounce static pose
        if (now - m_lastGestureTime > 500) {
            detectStaticPose(landmarks, now);
        }
    }
}

void GestureController::detectSwipe(qint64 now)
{
    if (m_gestureHistory.size() < 5) return;
    if (now - m_lastGestureTime < 500) return;

    QPointF start = m_gestureHistory.first();
    QPointF end = m_gestureHistory.last();
    float dx = end.x() - start.x();
    float dy = end.y() - start.y();
    float dist = std::hypot(dx, dy);

    // Linearity check
    float arcLen = 0;
    for (int i = 1; i < m_gestureHistory.size(); ++i) {
        arcLen += std::hypot(m_gestureHistory[i].x() - m_gestureHistory[i-1].x(), 
                             m_gestureHistory[i].y() - m_gestureHistory[i-1].y());
    }
    float linearity = (arcLen > 0) ? dist / arcLen : 0;

    // Must be linear (> 0.8) and fast enough (dist > 0.1)
    if (linearity > 0.8f && dist > 0.1f) {
        if (std::abs(dx) > std::abs(dy)) {
            // Horizontal
            if (dx > 0) {
                 m_currentGesture = "SWIPE_RIGHT";
                 emit gestureDetected("SWIPE_RIGHT");
            } else {
                 m_currentGesture = "SWIPE_LEFT";
                 emit gestureDetected("SWIPE_LEFT");
            }
            m_lastGestureTime = now;
            m_gestureHistory.clear();
        }
    }

void GestureController::detectRotation(qint64 now)
{
    if (m_gestureHistory.size() < 20) return;
    if (now - m_lastGestureTime < 300) return;

    // Use a copy or reference? copying is safer if multithreaded but here single thread.
    const auto &points = m_gestureHistory;
    int n = points.size();

    // 1. Centroid
    float sumX = 0, sumY = 0;
    for (const auto &p : points) {
        sumX += p.x();
        sumY += p.y();
    }
    float cx = sumX / n;
    float cy = sumY / n;

    // 2. Linearity
    float arcLen = 0;
    for (int i = 1; i < n; ++i) {
        arcLen += std::hypot(points[i].x() - points[i-1].x(), points[i].y() - points[i-1].y());
    }
    float netDisp = std::hypot(points.last().x() - points.first().x(), points.last().y() - points.first().y());
    float linearity = (arcLen > 0) ? netDisp / arcLen : 1.0f;

    // 3. Radius Consistency
    float rSum = 0;
    for (const auto &p : points) {
        rSum += std::hypot(p.x() - cx, p.y() - cy);
    }
    float avgR = rSum / n;

    float varSum = 0;
    for (const auto &p : points) {
        float r = std::hypot(p.x() - cx, p.y() - cy);
        varSum += std::pow(r - avgR, 2);
    }
    float stdDev = std::sqrt(varSum / n);

    // 4. Accumulated Angle
    float totalAngle = 0;
    for (int i = 1; i < n; ++i) {
        float a1 = std::atan2(points[i-1].y() - cy, points[i-1].x() - cx);
        float a2 = std::atan2(points[i].y() - cy, points[i].x() - cx);
        float delta = a2 - a1;
        // Normalize delta
        if (delta > M_PI) delta -= 2 * M_PI;
        if (delta < -M_PI) delta += 2 * M_PI;
        totalAngle += delta;
    }

    // STRICT RULES from TS:
    // Linearity < 0.5, AvgR > 0.04, StdDev < 0.05
    if (linearity < 0.5f && avgR > 0.04f && stdDev < 0.05f) {
        if (totalAngle > 4.0f) {
            m_currentGesture = "ROTATE_CW";
            emit gestureDetected("ROTATE_CW");
            m_lastGestureTime = now;
            m_gestureHistory.clear();
        } else if (totalAngle < -4.0f) {
            m_currentGesture = "ROTATE_CCW";
            emit gestureDetected("ROTATE_CCW");
            m_lastGestureTime = now;
            m_gestureHistory.clear();
        }
    }
}

void GestureController::detectStaticPose(const QVector<Landmark> &landmarks, qint64 now)
{
    Landmark wrist = landmarks[0];
    int tipIds[] = {8, 12, 16, 20};
    int pipIds[] = {6, 10, 14, 18};
    int foldedCount = 0;

    for (int i = 0; i < 4; ++i) {
        Landmark tip = landmarks[tipIds[i]];
        Landmark pip = landmarks[pipIds[i]];
        float dTip = std::hypot(tip.x - wrist.x, tip.y - wrist.y);
        float dPip = std::hypot(pip.x - wrist.x, pip.y - wrist.y);
        if (dTip < dPip) foldedCount++;
    }

    // Thumb
    Landmark tTip = landmarks[4];
    Landmark tIp = landmarks[3];
    float dtTip = std::hypot(tTip.x - wrist.x, tTip.y - wrist.y);
    float dtIp = std::hypot(tIp.x - wrist.x, tIp.y - wrist.y);
    if (dtTip < dtIp) foldedCount++;

    if (foldedCount == 5) {
        if (m_currentGesture != "FIST_CLOSED") {
            m_currentGesture = "FIST_CLOSED";
            emit gestureDetected("FIST_CLOSED");
            m_lastGestureTime = now;
        }
    } else if (foldedCount <= 1) {
        // Check Index Extended
        Landmark iTip = landmarks[8];
        Landmark iPip = landmarks[6];
        float diTip = std::hypot(iTip.x - wrist.x, iTip.y - wrist.y);
        float diPip = std::hypot(iPip.x - wrist.x, iPip.y - wrist.y);
        
        if (diTip > diPip) {
            if (m_currentGesture != "FIST_OPEN") {
                m_currentGesture = "FIST_OPEN";
                emit gestureDetected("FIST_OPEN");
                m_lastGestureTime = now;
            }
        }
    }
}

void GestureController::triggerClick(float x, float y)
{
    qint64 now = QDateTime::currentMSecsSinceEpoch();
    if (now - m_lastClickTime < 500) return;
    emit clickTriggered(x, y);
    m_lastClickTime = now;
}
