import QtQuick
import QtQuick.Controls
import QtQuick.Window
import AeroUI 1.0

ApplicationWindow {
    id: window
    width: 1280
    height: 720
    visible: true
    title: "AeroUI Embedded"
    color: "black"
    
    // Direct instantiation of Dashboard to bypass Loader issues
    Dashboard {
        anchors.fill: parent
    }

    // Simplified Camera Placeholder (No VideoOutput to avoid type errors)
    Rectangle {
        id: cameraBox
        width: 320; height: 240
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: 20
        color: "black"
        border.color: "white"
        border.width: 4
        radius: 12
        visible: GestureController.isCameraVisible
        
        Text {
            anchors.centerIn: parent
            text: "CAMERA FEED\n(Stub Mode)"
            color: "white"
            horizontalAlignment: Text.AlignHCenter
        }
    }

    // Notification Overlay
    Rectangle {
        id: notification
        anchors.centerIn: parent
        width: 300; height: 100
        color: "#AA000000"
        radius: 20
        opacity: 0
        
        Text {
            id: notifText
            anchors.centerIn: parent
            color: "white"
            font.pixelSize: 32
            font.bold: true
        }

        function show(text) {
            notifText.text = text
            anim.restart()
        }

        SequentialAnimation {
            id: anim
            NumberAnimation { target: notification; property: "opacity"; to: 1; duration: 200 }
            PauseAnimation { duration: 1000 }
            NumberAnimation { target: notification; property: "opacity"; to: 0; duration: 500 }
        }
    }
}
