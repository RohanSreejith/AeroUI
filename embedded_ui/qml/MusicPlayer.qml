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
            Layout.preferredHeight: 160  // Reduced to fit larger buttons
            radius: 20
            border.color: "#33ffffff"
            border.width: 1
            
            gradient: Gradient {
                GradientStop { position: 0.0; color: "#4f46e5" } // Indigo-600
                GradientStop { position: 1.0; color: "#0f172a" } // Slate-900 (matches bg roughly)
            }
            
            Text {
                anchors.centerIn: parent
                text: "♫"
                color: "white"
                font.pixelSize: 60
                opacity: 0.3
            }
        }

        // Track Info
        Column {
            Layout.fillWidth: true
            spacing: 8  // More breathing room
            
            Text {
                width: parent.width
                text: root.mState.title || "No Track"
                color: "white"
                font.pixelSize: 24  // Larger Title
                font.bold: true
                elide: Text.ElideRight
                horizontalAlignment: Text.AlignHCenter
            }
            
            Text {
                width: parent.width
                text: root.mState.artist || "Unknown Artist"
                color: "#94a3b8"
                font.pixelSize: 16  // Larger Artist
                font.letterSpacing: 1
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
            spacing: 15  // Tighter grouping
            
            // Previous
            Rectangle {
                id: prevButton
                width: 60
                height: 60
                radius: 16
                color: "#1e293b" // Slate-800
                border.color: "#33ffffff"
                border.width: 1
                
                gradient: Gradient {
                    GradientStop { position: 0.0; color: "#334155" }
                    GradientStop { position: 1.0; color: "#0f172a" }
                }
                
                Text {
                    anchors.centerIn: parent
                    text: "⏮"
                    color: "white"
                    font.pixelSize: 24
                }
                
                MouseArea {
                    anchors.fill: parent
                    onClicked: NetworkManager.prevTrack()
                }
            }
            
            // Play/Pause
            Rectangle {
                id: playButton
                width: 80
                height: 80
                radius: 24
                border.color: "#60a5fa"
                border.width: 1
                
                gradient: Gradient {
                    GradientStop { position: 0.0; color: "#3b82f6" } // Blue-500
                    GradientStop { position: 1.0; color: "#1d4ed8" } // Blue-700
                }
                
                // Inner highlight
                Rectangle {
                    anchors.fill: parent
                    anchors.margins: 2
                    radius: parent.radius - 2
                    color: "transparent"
                    border.color: "#40ffffff"
                    border.width: 1
                }
                
                Text {
                    anchors.centerIn: parent
                    text: root.mState.is_playing ? "⏸" : "▶"
                    color: "white"
                    font.pixelSize: 32
                }
                
                MouseArea {
                    anchors.fill: parent
                    onClicked: NetworkManager.togglePlayback()
                }
            }
            
            // Next
            Rectangle {
                id: nextButton
                width: 60
                height: 60
                radius: 16
                color: "#1e293b"
                border.color: "#33ffffff"
                border.width: 1
                
                gradient: Gradient {
                    GradientStop { position: 0.0; color: "#334155" }
                    GradientStop { position: 1.0; color: "#0f172a" }
                }
                
                Text {
                    anchors.centerIn: parent
                    text: "⏭"
                    color: "white"
                    font.pixelSize: 24
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
