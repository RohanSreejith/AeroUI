#ifndef NETWORKMANAGER_H
#define NETWORKMANAGER_H

#include <QObject>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QWebSocket>
#include <QJsonDocument>
#include <QJsonObject>

class NetworkManager : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QJsonObject vehicleState READ vehicleState NOTIFY vehicleStateChanged)
    Q_PROPERTY(QJsonObject mediaState READ mediaState NOTIFY mediaStateChanged)

public:
    explicit NetworkManager(QObject *parent = nullptr);

    Q_INVOKABLE void updateVehicleState(const QJsonObject &state);
    Q_INVOKABLE void updateMediaState(const QJsonObject &state);
    Q_INVOKABLE void connectToServer(const QString &url);

    QJsonObject vehicleState() const { return m_vehicleState; }
    QJsonObject mediaState() const { return m_mediaState; }

signals:
    void vehicleStateChanged();
    void mediaStateChanged();

private slots:
    void onWebSocketMessage(const QString &message);
    void onWebSocketConnected();
    void onWebSocketDisconnected();

private:
    QNetworkAccessManager *m_nam;
    QWebSocket *m_webSocket;
    QJsonObject m_vehicleState;
    QJsonObject m_mediaState;
};

#endif // NETWORKMANAGER_H
