import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import AeroUI 1.0

Rectangle {
    id: root
    width: 1280
    height: 720
    color: "#111827"

    property bool isPinching: false
    property bool isPinchingMap: false
    property real lastCursorX: 0
    property real lastCursorY: 0
    Dashboard {
        id: dashboard
        anchors.fill: parent
    }
    
    // Handle gesture clicks
    Connections {
        target: GestureController
        function onClickDetected() {
            // Get cursor position in screen coordinates
            var cursorX = GestureController.cursorX * root.width
            var cursorY = GestureController.cursorY * root.height
            
            console.log("Click detected at cursor position:", cursorX, cursorY)
            
            // Check if cursor is over temp button
            if (dashboard.tempButtonRef) {
                var tempPos = dashboard.tempButtonRef.mapToItem(root, 0, 0)
                var tempBounds = {
                    x: tempPos.x,
                    y: tempPos.y,
                    width: dashboard.tempButtonRef.width,
                    height: dashboard.tempButtonRef.height
                }
                console.log("TEMP button bounds:", tempBounds.x, tempBounds.y, tempBounds.width, tempBounds.height)
                
                if (cursorX >= tempPos.x && cursorX <= tempPos.x + dashboard.tempButtonRef.width &&
                    cursorY >= tempPos.y && cursorY <= tempPos.y + dashboard.tempButtonRef.height) {
                    console.log("✓ Clicked TEMP button via gesture")
                    dashboard.activeControl = "temp"
                    return
                }
            }
            
            // Check if cursor is over volume button
            if (dashboard.volumeButtonRef) {
                var volPos = dashboard.volumeButtonRef.mapToItem(root, 0, 0)
                var volBounds = {
                    x: volPos.x,
                    y: volPos.y,
                    width: dashboard.volumeButtonRef.width,
                    height: dashboard.volumeButtonRef.height
                }
                console.log("VOL button bounds:", volBounds.x, volBounds.y, volBounds.width, volBounds.height)
                
                if (cursorX >= volPos.x && cursorX <= volPos.x + dashboard.volumeButtonRef.width &&
                    cursorY >= volPos.y && cursorY <= volPos.y + dashboard.volumeButtonRef.height) {
                    console.log("✓ Clicked VOLUME button via gesture")
                    dashboard.activeControl = "volume"
                    return
                }
            }
            
            // Check Music Player Controls
            console.log("Checking Music Player buttons...")
            
            // Play/Pause
            if (dashboard.musicPlayerPlayButtonRef) {
                var pos = dashboard.musicPlayerPlayButtonRef.mapToItem(root, 0, 0)
                console.log("PLAY Button Bounds:", pos.x, pos.y, dashboard.musicPlayerPlayButtonRef.width, dashboard.musicPlayerPlayButtonRef.height)
                
                if (cursorX >= pos.x && cursorX <= pos.x + dashboard.musicPlayerPlayButtonRef.width &&
                    cursorY >= pos.y && cursorY <= pos.y + dashboard.musicPlayerPlayButtonRef.height) {
                    console.log("✓ Clicked PLAY button via gesture")
                    NetworkManager.togglePlayback()
                    return
                }
            } else {
                console.log("PLAY button ref is null/undefined")
            }

            // Previous Track
            if (dashboard.musicPlayerPrevButtonRef) {
                var pos = dashboard.musicPlayerPrevButtonRef.mapToItem(root, 0, 0)
                console.log("PREV Button Bounds:", pos.x, pos.y, dashboard.musicPlayerPrevButtonRef.width, dashboard.musicPlayerPrevButtonRef.height)

                if (cursorX >= pos.x && cursorX <= pos.x + dashboard.musicPlayerPrevButtonRef.width &&
                    cursorY >= pos.y && cursorY <= pos.y + dashboard.musicPlayerPrevButtonRef.height) {
                    console.log("✓ Clicked PREV button via gesture")
                    NetworkManager.prevTrack()
                    return
                }
            } else {
                console.log("PREV button ref is null/undefined")
            }

            // Next Track
            if (dashboard.musicPlayerNextButtonRef) {
                var pos = dashboard.musicPlayerNextButtonRef.mapToItem(root, 0, 0)
                console.log("NEXT Button Bounds:", pos.x, pos.y, dashboard.musicPlayerNextButtonRef.width, dashboard.musicPlayerNextButtonRef.height)

                if (cursorX >= pos.x && cursorX <= pos.x + dashboard.musicPlayerNextButtonRef.width &&
                    cursorY >= pos.y && cursorY <= pos.y + dashboard.musicPlayerNextButtonRef.height) {
                    console.log("✓ Clicked NEXT button via gesture")
                    NetworkManager.nextTrack()
                    return
                }
            } else {
                console.log("NEXT button ref is null/undefined")
            }
            
            console.log("✗ Click missed all buttons")
        }
    }
    
    // Virtual hand pointer overlay
    VirtualCursor {
        anchors.fill: parent
        z: 100  // On top of everything including camera
    }
    
    // --- Live Camera Feed Overlay ---
    Rectangle {
        id: cameraOverlay
        width: 240
        height: 180
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.margins: 20
        anchors.topMargin: 100 // Inside Nav Box
        anchors.leftMargin: 40
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
                text: "(F/O: Mute | P: Click | Arrows: Move Cursor | C: Cam | T: Test)"
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
            
            if (gesture === "PINCH_CLICK") {
                root.isPinching = true
                root.isPinchingMap = false // Reset first
                
                if (dashboard.map) {
                     var mapPos = dashboard.map.mapToItem(root, 0, 0)
                     var cx = GestureController.cursorX * root.width
                     var cy = GestureController.cursorY * root.height
                     var mapW = dashboard.map.width
                     var mapH = dashboard.map.height
                     
                     console.log("PINCH CHECK: Cursor(", cx, cy, ") MapBounds(", mapPos.x, mapPos.y, mapW, mapH, ")")
                     
                     if (cx >= mapPos.x && cx <= mapPos.x + mapW &&
                         cy >= mapPos.y && cy <= mapPos.y + mapH) {
                         console.log(" -> INSIDE MAP")
                         root.isPinchingMap = true
                     } else {
                         console.log(" -> OUTSIDE MAP")
                     }
                }

                // Existing click logic seems to be handled by onClickDetected signal 
                // or similar mechanism. We just track state here.
                if (typeof onClickDetected === "function") {
                    onClickDetected() 
                }
            }
            if (gesture === "PINCH_END") {
                root.isPinching = false
                root.isPinchingMap = false
            }
        }
        
        function onCursorMoved(x, y) {
             var px = x * root.width
             var py = y * root.height

             if (root.isPinchingMap) {
                  var dx = px - root.lastCursorX
                  var dy = py - root.lastCursorY
                  dashboard.map.pan(dx, dy)
             }
             
             root.lastCursorX = px
             root.lastCursorY = py
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
        } else if (event.key === Qt.Key_P) {
            GestureController.simulateGesture("PINCH_CLICK");
        } else if (event.key === Qt.Key_Left) {
            GestureController.setCursorPosition(
                Math.max(0, GestureController.cursorX - 0.02),
                GestureController.cursorY
            );
        } else if (event.key === Qt.Key_Right) {
            GestureController.setCursorPosition(
                Math.min(1, GestureController.cursorX + 0.02),
                GestureController.cursorY
            );
        } else if (event.key === Qt.Key_Up) {
            GestureController.setCursorPosition(
                GestureController.cursorX,
                Math.max(0, GestureController.cursorY - 0.02)
            );
        } else if (event.key === Qt.Key_Down) {
            GestureController.setCursorPosition(
                GestureController.cursorX,
                Math.min(1, GestureController.cursorY + 0.02)
            );
        }
    }
}
