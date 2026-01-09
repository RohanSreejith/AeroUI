#ifndef CAMERAMANAGER_H
#define CAMERAMANAGER_H

#include <QObject>
#include <QCamera>
#include <QMediaCaptureSession>
#include <QVideoSink>
#include <QVideoFrame>

class CameraManager : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QVideoSink* videoSink READ videoSink CONSTANT)

public:
    explicit CameraManager(QObject *parent = nullptr);
    QVideoSink* videoSink() const { return m_videoSink; }

    Q_INVOKABLE void start();
    Q_INVOKABLE void stop();

private slot:
    void processFrame();

private:
    QCamera *m_camera;
    QMediaCaptureSession *m_session;
    QVideoSink *m_videoSink;
};

#endif // CAMERAMANAGER_H
