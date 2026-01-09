import QtQuick
import QtQuick.Layouts
import AeroUI 1.0

Rectangle {
    id: root
    property var mState: NetworkManager.mediaState || {}
    property alias playButtonRef: playButton
    property alias prevButtonRef: prevButton
    property alias nextButtonRef: nextButton
    
    color: "#1f2937"
    radius: 20
    border.color: "#374151"
    border.width: 1
    
    function formatTime(ms) {
        if (!ms || ms < 0) return "0:00"
        var totalSeconds = Math.floor(ms / 1000)
        var minutes = Math.floor(totalSeconds / 60)
        var seconds = totalSeconds % 60
        return minutes + ":" + (seconds < 10 ? "0" : "") + seconds
    }
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 12

        // Header
        Text {
            text: "NOW PLAYING"
            color: "#9ca3af"
            font.pixelSize: 11
            font.bold: true
            Layout.alignment: Qt.AlignHCenter
        }

        // Album Art
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 120
            radius: 15
            gradient: Gradient {
                GradientStop { position: 0.0; color: "#6366f1" }
                GradientStop { position: 1.0; color: "#8b5cf6" }
            }
            
            Text {
                anchors.centerIn: parent
                text: "♫"
                color: "white"
                font.pixelSize: 50
                opacity: 0.6
            }
        }

        // Track Info
        Column {
            Layout.fillWidth: true
            spacing: 4
            
            Text {
                width: parent.width
                text: root.mState.title || "No Track"
                color: "white"
                font.pixelSize: 16
                font.bold: true
                elide: Text.ElideRight
                horizontalAlignment: Text.AlignHCenter
            }
            
            Text {
                width: parent.width
                text: root.mState.artist || "Unknown Artist"
                color: "#9ca3af"
                font.pixelSize: 13
                elide: Text.ElideRight
                horizontalAlignment: Text.AlignHCenter
            }
        }

        // Progress Bar
        Rectangle {
            Layout.fillWidth: true
            height: 3
            radius: 1.5
            color: "#374151"
            
            Rectangle {
                width: (root.mState.duration > 0) ? (parent.width * (root.mState.position / root.mState.duration)) : 0
                height: parent.height
                radius: parent.radius
                color: "#60a5fa"
            }
        }

        // Time Labels
        RowLayout {
            Layout.fillWidth: true
            
            Text {
                text: formatTime(root.mState.position)
                color: "#6b7280"
                font.pixelSize: 10
            }
            
            Item { Layout.fillWidth: true }
            
            Text {
                text: formatTime(root.mState.duration)
                color: "#6b7280"
                font.pixelSize: 10
            }
        }

        // Controls
        Row {
            Layout.alignment: Qt.AlignHCenter
            spacing: 25
            
            // Previous
            Rectangle {
                id: prevButton
                width: 36
                height: 36
                radius: 18
                color: "#374151"
                border.color: "#4b5563"
                
                Text {
                    anchors.centerIn: parent
                    text: "⏮"
                    color: "#9ca3af"
                    font.pixelSize: 16
                }
                
                MouseArea {
                    anchors.fill: parent
                    onClicked: NetworkManager.prevTrack()
                }
            }
            
            // Play/Pause
            Rectangle {
                id: playButton
                width: 46
                height: 46
                radius: 23
                color: "#2563eb"
                border.color: "#60a5fa"
                border.width: 2
                
                Text {
                    anchors.centerIn: parent
                    text: root.mState.is_playing ? "⏸" : "▶"
                    color: "white"
                    font.pixelSize: 18
                }
                
                MouseArea {
                    anchors.fill: parent
                    onClicked: NetworkManager.togglePlayback()
                }
            }
            
            // Next
            Rectangle {
                id: nextButton
                width: 36
                height: 36
                radius: 18
                color: "#374151"
                border.color: "#4b5563"
                
                Text {
                    anchors.centerIn: parent
                    text: "⏭"
                    color: "#9ca3af"
                    font.pixelSize: 16
                }
                
                MouseArea {
                    anchors.fill: parent
                    onClicked: NetworkManager.nextTrack()
                }
            }
        }
        
        Item { Layout.fillHeight: true }
    }
}
