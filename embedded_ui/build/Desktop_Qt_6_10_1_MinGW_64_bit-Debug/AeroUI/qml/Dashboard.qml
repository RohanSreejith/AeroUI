import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtMultimedia
import AeroUI 1.0

Item {
    id: root
    width: 1280
    height: 720

    // State Bindings directly from C++ Singleton
    property var vState: NetworkManager.vehicleState
    property var mState: NetworkManager.mediaState

    // Local State
    property string activeControl: "temp" // 'temp' or 'volume'
    property date currentTime: new Date()

    Timer {
        interval: 1000; running: true; repeat: true
        onTriggered: root.currentTime = new Date()
    }

    // --- Header ---
    RowLayout {
        id: header
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.margins: 20
        height: 60

        Text {
            text: Qt.formatTime(root.currentTime, "h:mm")
            color: "white"
            font.pixelSize: 36
            font.bold: true
        }
        Text {
            text: Qt.formatTime(root.currentTime, "AP")
            color: "gray"
            font.pixelSize: 20
            Layout.alignment: Qt.AlignBottom
            Layout.bottomMargin: 5
        }

        Item { Layout.fillWidth: true }

        Row {
            spacing: 20
            // Volume Status
            Rectangle {
                width: 100; height: 36; radius: 18
                color: root.activeControl === "volume" ? "#332563eb" : "transparent"
                border.color: root.activeControl === "volume" ? "#2563eb" : "transparent"
                Row {
                    anchors.centerIn: parent
                    spacing: 5
                    Text { text: "VOL"; color: "gray"; font.pixelSize: 12 }
                    Text { text: (vState["volume"] || 50) + "%"; color: "#60a5fa"; font.bold: true }
                }
            }
            // Temp Status
            Row {
                spacing: 5
                Text { text: "1°C"; color: "white"; font.pixelSize: 18 }
            }
            // Camera Toggle
            Rectangle {
                width: 40; height: 40; radius: 20
                color: GestureController.isCameraVisible ? "#2563eb" : "transparent"
                border.color: "gray"
                MouseArea {
                    anchors.fill: parent
                    onClicked: GestureController.isCameraVisible = !GestureController.isCameraVisible
                }
                Text { anchors.centerIn: parent; text: "CAM"; color: "white"; font.pixelSize: 10 }
            }
        }
    }

    // --- Main Grid ---
    GridLayout {
        anchors.top: header.bottom
        anchors.bottom: footer.top
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.margins: 20
        columns: 12
        columnSpacing: 20

        // LEFT: Map (Span 7)
        Rectangle {
            Layout.columnSpan: 7
            Layout.fillHeight: true
            Layout.fillWidth: true
            color: "#111827" // gray-900ish
            radius: 20
            border.color: "#33ffffff"
            clip: true
            
            // Map Placeholder
            NavigationMap { anchors.fill: parent }
        }

        // RIGHT: Media & Shortcuts (Span 5)
        ColumnLayout {
            Layout.columnSpan: 5
            Layout.fillHeight: true
            Layout.fillWidth: true
            spacing: 20

            // Media Player
            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                color: "#111827"
                radius: 20
                border.color: "#33ffffff"
                
                MusicPlayer { 
                    anchors.fill: parent 
                    title: mState["title"] || "Not Playing"
                    artist: mState["artist"] || "Unknown"
                    isPlaying: mState["is_playing"] || false
                    volume: vState["volume"] || 50
                    controlActive: root.activeControl === "volume"
                }
            }

            // Shortcuts
            RowLayout {
                Layout.preferredHeight: 120
                spacing: 20
                
                // Temp Shortcut
                Rectangle {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    radius: 20
                    color: root.activeControl === "temp" ? "#2563eb" : "#1f2937"
                    border.color: root.activeControl === "temp" ? "#60a5fa" : "#33ffffff"
                    
                    Column {
                        anchors.centerIn: parent
                        Text { text: "TEMP"; color: "white"; font.bold: true }
                        Text { text: "CONTROL"; color: "gray"; font.pixelSize: 10 }
                    }
                    MouseArea { anchors.fill: parent; onClicked: root.activeControl = "temp" }
                }

                // Volume Shortcut
                Rectangle {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    radius: 20
                    color: root.activeControl === "volume" ? "#2563eb" : "#1f2937"
                    border.color: root.activeControl === "volume" ? "#60a5fa" : "#33ffffff"
                    
                    Column {
                        anchors.centerIn: parent
                        Text { text: "VOL"; color: "white"; font.bold: true }
                        Text { text: "CONTROL"; color: "gray"; font.pixelSize: 10 }
                    }
                    MouseArea { anchors.fill: parent; onClicked: root.activeControl = "volume" }
                }
            }
        }
    }

    // --- Footer ---
    Rectangle {
        id: footer
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.margins: 20
        anchors.bottomMargin: 20
        height: 100
        radius: 20
        color: "#111827"
        border.color: root.activeControl === "temp" ? "#3b82f6" : "#33ffffff"

        Row {
            anchors.centerIn: parent
            spacing: 20
            Text { text: "FAN"; color: "gray" }
            Text { 
                text: (vState["driver_temp"] || 22) + "°C"
                color: "white"
                font.pixelSize: 40
                font.weight: Font.Thin
            }
            Text { text: "AUTO"; color: "gray" }
        }
    }
}
