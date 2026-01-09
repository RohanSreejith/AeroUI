#include <QCommandLineParser>
#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include "GestureController.h"
#include "NetworkManager.h"
#include "CameraManager.h"

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);
    
    QCoreApplication::setOrganizationName("Hackerfx");
    QCoreApplication::setApplicationName("AeroUI-Embedded");

    QQmlApplicationEngine engine;

    // Register Singletons
    qmlRegisterSingletonType<GestureController>("AeroUI", 1, 0, "GestureController", 
        [](QQmlEngine *, QJSEngine *) -> QObject * {
            return new GestureController();
        });

    qmlRegisterSingletonType<NetworkManager>("AeroUI", 1, 0, "NetworkManager", 
        [](QQmlEngine *, QJSEngine *) -> QObject * {
            NetworkManager *nm = new NetworkManager();
            nm->connectToServer("ws://localhost:8000/ws");
            return nm;
        });
        
    qmlRegisterSingletonType<CameraManager>("AeroUI", 1, 0, "CameraManager", 
        [](QQmlEngine *, QJSEngine *) -> QObject * {
            CameraManager *cm = new CameraManager();
            cm->start();
            return cm;
        });

    const QUrl url(QStringLiteral("qrc:/qml/Main.qml"));
    
    // For local file loading during dev (if not using qrc)
    // const QUrl url = QUrl::fromLocalFile("d:/Personal Projects/Hackerfx/Gesture_Detection/embedded_ui/qml/Main.qml");

    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                     &app, [url](QObject *obj, const QUrl &objUrl) {
        if (!obj && url == objUrl)
            QCoreApplication::exit(-1);
    }, Qt::QueuedConnection);

    // engine.addImportPath(QCoreApplication::applicationDirPath() + "/qml");
    engine.load(QUrl::fromLocalFile(QCoreApplication::applicationDirPath() + "/../qml/Main.qml")); 

    return app.exec();
}
