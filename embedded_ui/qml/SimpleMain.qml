import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import AeroUI 1.0

Rectangle {
    id: root
    width: 1280
    height: 720
    color: "#111827"

    // Load the full Dashboard component
    Dashboard {
        anchors.fill: parent
    }
    
    // --- Live Camera Feed Overlay ---
    Rectangle {
        id: cameraOverlay
        width: 320
        height: 240
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.margins: 20
        anchors.topMargin: 80 // Below header
        color: "black"
        border.color: "white"
        border.width: 2
        radius: 10
        visible: GestureController.isCameraVisible
        z: 99 // On top of everything
        
        property int frameCounter: 0

        Image {
            id: camFeed
            anchors.fill: parent
            fillMode: Image.PreserveAspectCrop
            source: "image://live_camera/feed?id=" + parent.frameCounter
            cache: false 
        }
        
        Text {
            anchors.bottom: parent.bottom
            anchors.horizontalCenter: parent.horizontalCenter
            text: "LIVE FEED"
            color: "red"
            font.pixelSize: 10
            anchors.bottomMargin: 5
        }
    }
    
    Connections {
        target: GestureController
        function onFrameReady() {
            if (cameraOverlay.visible) {
               cameraOverlay.frameCounter += 1;
            }
        }
    }

    // --- Overlay for Simulation Feedback (since Dashboard doesn't show it natively yet) ---
    Rectangle {
        anchors.bottom: parent.bottom
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottomMargin: 10
        width: 400
        height: 30
        radius: 15
        color: "#cc000000" // Semi-transparent black
        border.color: "#33ffffff"
        visible: true 

        Row {
            anchors.centerIn: parent
            spacing: 10
            Text {
                text: "GESTURE:"
                color: "#888888"
                font.bold: true
            }
            Text {
                text: (gestureDisplay.text || "NONE")
                color: gestureDisplay.text !== "NONE" ? "#22c55e" : "#888888"
                font.bold: true
            }
            Text {
                text: "(Sim: 'F'/'O' | Cam: 'C' | Test: 'T')"
                color: "#555555"
                font.pixelSize: 11
                anchors.verticalCenter: parent.verticalCenter
            }
        }
    }
    
    // Invisible item to hold state
    Text { id: gestureDisplay; visible: false; text: "NONE" }
    
    Connections {
        target: GestureController
        function onGestureDetected(gesture) {
            gestureDisplay.text = gesture;
            delayTimer.restart();
        }
    }
    
    Timer {
        id: delayTimer
        interval: 1000
        onTriggered: gestureDisplay.text = "NONE"
    }

    // Keyboard Simulation Hook
    focus: true
    Keys.onPressed: (event) => {
        if (event.key === Qt.Key_F) {
            GestureController.simulateGesture("FIST");
        } else if (event.key === Qt.Key_O) {
            GestureController.simulateGesture("OPEN_PALM");
        } else if (event.key === Qt.Key_C) {
            GestureController.cycleCamera();
        } else if (event.key === Qt.Key_T) {
            GestureController.toggleTestPattern();
        }
    }
}
