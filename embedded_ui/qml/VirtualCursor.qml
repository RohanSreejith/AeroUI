import QtQuick
import AeroUI 1.0

Item {
    id: root
    anchors.fill: parent
    
    // Click animation state
    property bool isClicking: false
    
    // Listen for click events
    Connections {
        target: GestureController
        function onClickDetected() {
            root.isClicking = true
            clickAnimation.restart()
        }
    }
    
    // Virtual cursor that follows hand position
    Rectangle {
        id: cursor
        width: 30
        height: 30
        radius: 15
        color: root.isClicking ? "#FF5722" : "#4CAF50"  // Red when clicking, green otherwise
        border.color: "#FFFFFF"
        border.width: root.isClicking ? 5 : 3
        opacity: 0.8
        
        // Position based on GestureController cursor properties
        x: GestureController.cursorX * parent.width - width / 2
        y: GestureController.cursorY * parent.height - height / 2
        
        // Smooth animation
        Behavior on x {
            SmoothedAnimation {
                velocity: 2000
            }
        }
        
        Behavior on y {
            SmoothedAnimation {
                velocity: 2000
            }
        }
        
        Behavior on color {
            ColorAnimation { duration: 150 }
        }
        
        Behavior on border.width {
            NumberAnimation { duration: 150 }
        }
        
        // Pulsing effect
        SequentialAnimation on scale {
            running: !root.isClicking
            loops: Animation.Infinite
            NumberAnimation { from: 1.0; to: 1.2; duration: 500; easing.type: Easing.InOutQuad }
            NumberAnimation { from: 1.2; to: 1.0; duration: 500; easing.type: Easing.InOutQuad }
        }
        
        // Inner dot
        Rectangle {
            anchors.centerIn: parent
            width: 8
            height: 8
            radius: 4
            color: "#FFFFFF"
        }
        
        // Click ripple effect
        Rectangle {
            id: clickRipple
            anchors.centerIn: parent
            width: parent.width
            height: parent.height
            radius: width / 2
            color: "transparent"
            border.color: "#FFFFFF"
            border.width: 3
            opacity: 0
            scale: 1
        }
    }
    
    // Click animation
    SequentialAnimation {
        id: clickAnimation
        ParallelAnimation {
            NumberAnimation { target: clickRipple; property: "scale"; from: 1; to: 2.5; duration: 300 }
            NumberAnimation { target: clickRipple; property: "opacity"; from: 1; to: 0; duration: 300 }
        }
        ScriptAction { script: root.isClicking = false }
    }
    
    // Trail effect (optional)
    Repeater {
        model: 5
        Rectangle {
            width: 20 - index * 3
            height: 20 - index * 3
            radius: (20 - index * 3) / 2
            color: root.isClicking ? "#FF5722" : "#4CAF50"
            opacity: 0.3 - index * 0.05
            x: cursor.x + cursor.width / 2 - width / 2
            y: cursor.y + cursor.height / 2 - height / 2
            
            Behavior on x {
                SmoothedAnimation {
                    velocity: 1500 - index * 200
                }
            }
            
            Behavior on y {
                SmoothedAnimation {
                    velocity: 1500 - index * 200
                }
            }
            
            Behavior on color {
                ColorAnimation { duration: 150 }
            }
        }
    }
}
