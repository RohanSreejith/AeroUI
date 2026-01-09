import QtQuick
import QtQuick.Window
import QtQuick.Controls
import AeroUI 1.0

Window {
    id: window
    width: 1280
    height: 720
    visible: true
    title: "AeroUI Embedded"
    color: "#000000"
    visibility: Window.FullScreen

    // Fonts
    FontLoader { id: roboto; source: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxM.woff" }

    // Logic Connectors
    Connections {
        target: GestureController
        function onGestureDetected(gesture) {
            console.log("Gesture Detected:", gesture)
            notification.show(gesture)
        }
    }

    // Main Layout Loader
    Loader {
        id: mainLoader
        anchors.fill: parent
        source: "Dashboard.qml"
    }
    
    // Camera Preview Overlay
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
        
        VideoOutput {
            anchors.fill: parent
            fillMode: VideoOutput.PreserveAspectCrop
            // connection to C++ sink
            videoSink: CameraManager.videoSink
            
            // Mirror effect
            transform: Scale { origin.x: cameraBox.width/2; origin.y: cameraBox.height/2; xScale: -1; }
        }
        
        Text {
            anchors.bottom: parent.bottom
            anchors.left: parent.left
            anchors.margins: 5
            text: "GESTURE ACTIVE"
            color: "#00FF00"
            font.pixelSize: 10
        }
    }

    // Overlay Notification for Gestures
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
