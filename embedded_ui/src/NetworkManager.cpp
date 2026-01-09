#include "NetworkManager.h"
#include <QNetworkRequest>
#include <QDebug>

NetworkManager::NetworkManager(QObject *parent)
    : QObject(parent)
{
    m_nam = new QNetworkAccessManager(this);
    m_webSocket = new QWebSocket();

    connect(m_webSocket, &QWebSocket::textMessageReceived, this, &NetworkManager::onWebSocketMessage);
    connect(m_webSocket, &QWebSocket::connected, this, &NetworkManager::onWebSocketConnected);
    connect(m_webSocket, &QWebSocket::disconnected, this, &NetworkManager::onWebSocketDisconnected);
}

void NetworkManager::connectToServer(const QString &url)
{
    qDebug() << "Connecting to WebSocket:" << url;
    m_webSocket->open(QUrl(url));
}

void NetworkManager::updateVehicleState(const QJsonObject &state)
{
    // Optimistic update
    m_vehicleState = state;
    emit vehicleStateChanged();

    // Send to Backend via REST or WS? Plan said REST state changes from UI.
    // Let's use REST for persistence and WS for broadcast.
    QNetworkRequest request(QUrl("http://localhost:8000/api/vehicle"));
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    m_nam->post(request, QJsonDocument(state).toJson());
}

void NetworkManager::updateMediaState(const QJsonObject &state)
{
    m_mediaState = state;
    emit mediaStateChanged();

    QNetworkRequest request(QUrl("http://localhost:8000/api/media"));
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    m_nam->post(request, QJsonDocument(state).toJson());
}

void NetworkManager::onWebSocketMessage(const QString &message)
{
    QJsonDocument doc = QJsonDocument::fromJson(message.toUtf8());
    QJsonObject obj = doc.object();
    QString type = obj["type"].toString();
    QJsonObject data = obj["data"].toObject();

    if (type == "VEHICLE_UPDATE") {
        m_vehicleState = data;
        emit vehicleStateChanged();
    } else if (type == "MEDIA_UPDATE") {
        m_mediaState = data;
        emit mediaStateChanged();
    } else if (type == "INITIAL_STATE") {
        m_vehicleState = data["vehicle"].toObject();
        m_mediaState = data["media"].toObject();
        emit vehicleStateChanged();
        emit mediaStateChanged();
    }
}

void NetworkManager::onWebSocketConnected()
{
    qDebug() << "WebSocket Connected";
}

void NetworkManager::onWebSocketDisconnected()
{
    qDebug() << "WebSocket Disconnected";
    // Reconnect logic could go here
}
