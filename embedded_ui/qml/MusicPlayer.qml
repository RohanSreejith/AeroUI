import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

Item {
    property string title: "Track"
    property string artist: "Artist"
    property bool isPlaying: false
    property int volume: 50
    property bool controlActive: false

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20

        // Info
        RowLayout {
            Layout.fillWidth: true
            spacing: 20
            
            Rectangle {
                width: 80; height: 80
                color: "#374151"
                radius: 10
                Text { anchors.centerIn: parent; text: "♫"; color: "gray"; font.pixelSize: 40 }
            }

            ColumnLayout {
                Text { 
                    text: controlActive ? "VOLUME CONTROL ACTIVE" : "NOW PLAYING"
                    color: controlActive ? "#60a5fa" : "#818cf8"
                    font.pixelSize: 10
                    font.bold: true
                }
                Text { 
                    text: title
                    color: "white"
                    font.pixelSize: 24
                    font.bold: true
                    elide: Text.ElideRight
                    Layout.fillWidth: true
                }
                Text { 
                    text: artist
                    color: "gray"
                    font.pixelSize: 16
                }
            }
        }

        Item { Layout.fillHeight: true }

        // Progress / Volume Bar
        Rectangle {
            Layout.fillWidth: true
            height: 4
            color: "#374151"
            radius: 2
            
            Rectangle {
                width: parent.width * (volume / 100)
                height: parent.height
                color: "white"
                radius: 2
            }
        }

        // Controls
        RowLayout {
            Layout.fillWidth: true
            Layout.alignment: Qt.AlignHCenter
            spacing: 40
            
            Text { text: "⏮"; color: "gray"; font.pixelSize: 30; MouseArea { anchors.fill: parent; onClicked: console.log("Prev") } }
            
            Rectangle {
                width: 60; height: 60; radius: 30
                color: "white"
                Text { 
                    anchors.centerIn: parent
                    text: isPlaying ? "⏸" : "▶"
                    color: "black"
                    font.pixelSize: 24
                }
                MouseArea { anchors.fill: parent; onClicked: console.log("Play/Pause") }
            }
            
            Text { text: "⏭"; color: "gray"; font.pixelSize: 30; MouseArea { anchors.fill: parent; onClicked: console.log("Next") } }
        }
    }
}
