# Build Instructions for AeroUI Embedded

Since `cmake` was not found in your system PATH, you will need to point to your Qt and CMake installation directly or use an IDE.

## Option 1: Using Qt Creator (Recommended)
This is the easiest way if you have the Qt SDK installed.

1. **Open Qt Creator**.
2. Go to **File > Open File or Project...**
3. Navigate to: 
   `D:\Personal Projects\Hackerfx\Gesture_Detection\embedded_ui\CMakeLists.txt`
4. Select it and click **Open**.
5. When asked to **Configure Project**, select your Desktop Kit (e.g., "Desktop Qt 6.5.0 MSVC2019 64bit").
6. Click **Configure**.
7. Click the green **Play** button (Run) in the bottom left, or press `Ctrl+R`.

## Option 2: Command Line (Windows)
If you prefer the terminal, you need to locate your Qt environment.

1. **Open "Qt 6.x Command Prompt"** (Search for it in the Start Menu).
   *This sets up `cmake`, `ninja`, and `qt` paths for you.*

2. **Navigate to the project**:
   ```powershell
   cd "D:\Personal Projects\Hackerfx\Gesture_Detection\embedded_ui"
   ```

3. **Create a build directory**:
   ```powershell
   mkdir build
   cd build
   ```

4. **Configure with CMake**:
   ```powershell
   qt-cmake ..
   ```
   *(Note: `qt-cmake` is a wrapper provided by Qt to automatically find libraries. If not available, use `cmake ..` but you might need to specify `-DCMAKE_PREFIX_PATH=C:\Qt\6.x\msvc2019_64`)*

5. **Build**:
   ```powershell
   cmake --build .
   ```

6. **Run**:
   ```powershell
   .\appAeroUI_Embedded.exe
   ```

## Prerequisites
- **Qt 6**: [Download Qt Online Installer](https://www.qt.io/download-qt-installer)
- **CMake**: Usually included in Qt installation.
- **C++ Compiler**: Visual Studio 2019/2022 (MSVC) or MinGW.
