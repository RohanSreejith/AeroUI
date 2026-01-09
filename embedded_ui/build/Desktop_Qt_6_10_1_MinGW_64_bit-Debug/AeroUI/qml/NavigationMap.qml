import QtQuick

Item {
    Rectangle {
        anchors.fill: parent
        color: "#1f2937"
        
        // Grid pattern
        Repeater {
            model: 10
            Item {
                Rectangle { x: index * 100; width: 1; height: parent.parent.height; color: "#33ffffff" }
                Rectangle { y: index * 100; height: 1; width: parent.parent.width; color: "#33ffffff" }
            }
        }
        
        // Route Line
        PathView {
            // Placeholder for route visualization
        }
        
        Column {
            anchors.centerIn: parent
            spacing: 10
            Text { 
                text: "Turn Right" 
                color: "white" 
                font.pixelSize: 32 
                font.bold: true
                anchors.horizontalCenter: parent.horizontalCenter
            }
            Text { 
                text: "Lexington Ave" 
                color: "#60a5fa" 
                font.pixelSize: 24
                anchors.horizontalCenter: parent.horizontalCenter
            }
        }
    }
}
