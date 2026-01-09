#ifndef GESTURECONTROLLER_H
#define GESTURECONTROLLER_H

#include <QObject>
#include <QVector>
#include <QPointF>
#include <QDateTime>

struct Landmark {
    float x, y, z;
};

class GestureController : public QObject
{
    Q_OBJECT
    Q_PROPERTY(bool isCameraVisible READ isCameraVisible WRITE setIsCameraVisible NOTIFY isCameraVisibleChanged)
    Q_PROPERTY(QString currentGesture READ currentGesture NOTIFY gestureDetected)

public:
    explicit GestureController(QObject *parent = nullptr);

    bool isCameraVisible() const { return m_isCameraVisible; }
    QString currentGesture() const { return m_currentGesture; }

public slots:
    void setIsCameraVisible(bool visible);
    void processLandmarks(const QVector<Landmark> &landmarks);

signals:
    void isCameraVisibleChanged();
    void gestureDetected(QString gesture);
    void cursorMoved(float x, float y, bool isPinching);
    void clickTriggered(float x, float y);

private:
    void detectRotation(qint64 now);
    void detectSwipe(qint64 now);
    void detectStaticPose(const QVector<Landmark> &landmarks, qint64 now);
    void triggerClick(float x, float y);

    bool m_isCameraVisible;
    QString m_currentGesture;
    
    // History
    QVector<QPointF> m_gestureHistory;
    qint64 m_lastGestureTime;
    qint64 m_lastClickTime;
    
    // Previous State for velocity calc
    QPointF m_lastHandPos;
};

#endif // GESTURECONTROLLER_H
