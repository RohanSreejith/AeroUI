import QtQuick
import QtQuick.Layouts

Rectangle {
    id: mapRoot
    clip: true
    color: "#0f172a" // Background color if you pan too far

    function pan(dx, dy) {
        flick.contentX -= dx * 4  // Sensitvity multiplier
        flick.contentY -= dy * 4
    }

    Flickable {
        id: flick
        anchors.fill: parent
        contentWidth: mapContainer.width * mapContainer.scale
        contentHeight: mapContainer.height * mapContainer.scale
        
        // Panning (Flickable handles drag)
        interactive: true
        boundsBehavior: Flickable.StopAtBounds

        // Container for Zooming
        Item {
            id: mapContainer
            width: mapImage.width
            height: mapImage.height

            // The Map Texture
            Image {
                id: mapImage
                source: "../assets/map_texture.png"
                width: 2048 // Assume high res or stretch
                height: 2048
                fillMode: Image.PreserveAspectCrop
                smooth: true
                antialiasing: true
            }

            // "You Are Here" Marker (Standard Blue Dot)
            Rectangle {
                id: myLocation
                width: 30
                height: 30
                radius: 15
                color: "#3b82f6"
                border.color: "white"
                border.width: 3
                // Place roughly in center of the map
                x: (mapContainer.width / 2) - width/2
                y: (mapContainer.height / 2) - height/2

                // Pulse Effect
                Rectangle {
                    anchors.centerIn: parent
                    width: parent.width * 2.5
                    height: parent.height * 2.5
                    radius: width / 2
                    color: "#3b82f6"
                    opacity: 0.3
                    z: -1
                    
                    SequentialAnimation on opacity {
                        loops: Animation.Infinite
                        NumberAnimation { from: 0.3; to: 0.0; duration: 1500; easing.type: Easing.OutQuad }
                        NumberAnimation { from: 0.0; to: 0.3; duration: 1500; easing.type: Easing.InQuad }
                    }
                    SequentialAnimation on scale {
                        loops: Animation.Infinite
                        NumberAnimation { from: 0.8; to: 1.2; duration: 1500; easing.type: Easing.OutQuad }
                        NumberAnimation { from: 1.2; to: 0.8; duration: 1500; easing.type: Easing.InQuad }
                    }
                }
            }
            
            // Initial Transform
            transform: Scale {
                id: mapScale
                origin.x: flick.contentX + flick.width / 2
                origin.y: flick.contentY + flick.height / 2
                xScale: 1.0
                yScale: 1.0
            }
        }

        // Pinch Area
        PinchArea {
            anchors.fill: parent
            
            property real initialScale
            property real initialWidth
            property real initialHeight

            onPinchStarted: {
                initialScale = mapScale.xScale
            }

            onPinchUpdated: (pinch) => {
                // Determine new scale
                var scale = initialScale * pinch.scale
                
                // Limits
                if (scale < 0.5) scale = 0.5
                if (scale > 3.0) scale = 3.0
                
                // Set scale
                mapScale.xScale = scale
                mapScale.yScale = scale
                
                // Optional: Adjust content position to zoom towards center?
                // Flickable + Scale Transform is simpler if we just scale.
                // For proper pinch-zoom-center, we usually need simpler Item-based transform, 
                // but Flickable + Scale works for basic needs.
                
                // Update content sizing
                flick.contentWidth = mapContainer.width * scale
                flick.contentHeight = mapContainer.height * scale
            }
        }
        
        Component.onCompleted: {
            // Center the view initially
            flick.contentX = (mapContainer.width - flick.width) / 2
            flick.contentY = (mapContainer.height - flick.height) / 2
        }
    }
    
    // UI Overlay (Optional)
    Rectangle {
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.margins: 20
        anchors.topMargin: 80 // Below camera if top-left
        width: 40
        height: 40
        radius: 20
        color: "#1f2937"
        border.color: "#374151"
        
        Text {
            anchors.centerIn: parent
            text: "📍" // Compass/Recenter
            font.pixelSize: 20
        }
        MouseArea {
            anchors.fill: parent
            onClicked: {
                // Recenter
                flick.contentX = (mapContainer.width * mapScale.xScale - flick.width) / 2
                flick.contentY = (mapContainer.height * mapScale.yScale - flick.height) / 2
                mapScale.xScale = 1.0
                mapScale.yScale = 1.0
            }
        }
    }
}
