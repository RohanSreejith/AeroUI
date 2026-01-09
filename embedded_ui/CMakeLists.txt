cmake_minimum_required(VERSION 3.16)

project(AeroUI_Embedded VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Qt6 REQUIRED COMPONENTS Quick Network Multimedia)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

qt_add_executable(appAeroUI_Embedded
    src/main.cpp
    src/GestureController.cpp
    src/GestureController.h
    src/NetworkManager.cpp
    src/NetworkManager.h
    src/CameraManager.cpp
    src/CameraManager.h
)

qt_add_qml_module(appAeroUI_Embedded
    URI AeroUI
    VERSION 1.0
    QML_FILES 
        qml/Main.qml
        qml/Dashboard.qml
        qml/MusicPlayer.qml
        qml/NavigationMap.qml
)

target_link_libraries(appAeroUI_Embedded
    PRIVATE Qt6::Quick Qt6::Network Qt6::Multimedia
)
