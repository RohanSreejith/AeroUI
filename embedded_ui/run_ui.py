import sys
import os
import cv2
import time
import math
import numpy as np
from PySide6.QtGui import QGuiApplication
from PySide6.QtQml import QQmlApplicationEngine, qmlRegisterSingletonInstance
from PySide6.QtCore import QObject, QUrl, Signal, Slot, Property, QThread, Qt
from PySide6.QtQuick import QQuickView

# --- Gesture Recognition Logic (Mocking the C++ port in Python) ---
class GestureThread(QThread):
    gesture_detected = Signal(str)
    frame_captured = Signal() # Signal when a new frame is ready
    
    def __init__(self, camera_index=0): # Scan from 0
        super().__init__()
        self.running = True
        self.mp_hands = None
        self.hands = None
        self.cap = None
        self.latest_frame = None
        self.camera_index = camera_index
        self.black_frame_count = 0
        self.current_brightness = 0.0 # Debug info
        self.manual_test_pattern = False # User override
        
        # Rotation gesture tracking
        from collections import deque
        self.hand_history = deque(maxlen=10)  # Track last 10 hand positions
        self.rotation_accumulator = 0.0  # Accumulated rotation angle
        self.last_rotation_time = time.time()
        self.rotation_threshold = 180  # Degrees needed to trigger rotation gesture
        
        try:
            import mediapipe as mp
            from mediapipe.tasks import python
            from mediapipe.tasks.python import vision
            
            # Use the new MediaPipe Tasks API
            base_options = python.BaseOptions(model_asset_path='hand_landmarker.task')
            options = vision.HandLandmarkerOptions(
                base_options=base_options,
                num_hands=1,
                min_hand_detection_confidence=0.7,
                min_hand_presence_confidence=0.7,
                min_tracking_confidence=0.5
            )
            self.hands = vision.HandLandmarker.create_from_options(options)
            self.mp_hands = mp  # Store for landmark constants
            print("MediaPipe HandLandmarker initialized successfully (Tasks API).")
        except Exception as e:
            print(f"WARNING: MediaPipe initialization failed. Gesture recognition will be DISABLED. Error: {e}")
            self.mp_hands = None
            self.hands = None

    def change_camera(self):
        # Cycle through indices 0 to 3 to find a working camera
        self.camera_index = (self.camera_index + 1) % 4
        if self.cap and self.cap.isOpened():
            self.cap.release()
            
    def toggle_test_pattern(self):
        self.manual_test_pattern = not self.manual_test_pattern

    def run(self):
        # Even if MediaPipe fails, we can still run the loop to keep the thread alive for Camera Feed
        if not self.hands:
            print("GestureThread running (MediaPipe Disabled - Camera Only Mode)")
        else:
            print("GestureThread running (MediaPipe Enabled)")

        while self.running:
            print(f"Attempting to open camera index {self.camera_index} (Auto Backend)...")
            # Remove specific backend flags to allow OpenCV to auto-negotiate
            self.cap = cv2.VideoCapture(self.camera_index)
            
            # Test Pattern Logic
            self.use_test_pattern = self.manual_test_pattern
            if not self.use_test_pattern:
                if not self.cap.isOpened():
                     print(f"ERROR: Could not open camera {self.camera_index}. Switching to Test Pattern.")
                     self.use_test_pattern = True
                else:
                     print(f"Camera {self.camera_index} opened successfully.")
            
            frame_count = 0
            current_idx = self.camera_index
            
            # Inner loop: Check if camera index changed
            while self.running and self.camera_index == current_idx:
                # Check for manual override update
                if self.manual_test_pattern != self.use_test_pattern and self.manual_test_pattern:
                     self.use_test_pattern = True
                
                if self.use_test_pattern:
                    # Generate a moving color gradient
                    image = cv2.merge([
                        ((math.sin(frame_count * 0.1) + 1) * 127 * np.ones((480, 640), dtype=np.uint8)).astype(np.uint8),
                        ((math.cos(frame_count * 0.1) + 1) * 127 * np.ones((480, 640), dtype=np.uint8)).astype(np.uint8),
                        np.zeros((480, 640), dtype=np.uint8)
                    ])
                    # Add text
                    cv2.putText(image, f"TEST PATTERN (Idx: {self.camera_index})", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                    success = True
                    self.current_brightness = 128.0
                    time.sleep(0.033)
                else:
                    success, image = self.cap.read()
                
                if not success:
                    if frame_count % 100 == 0:
                         print("Warning: Failed to read frame from camera.")
                    frame_count += 1
                    time.sleep(0.1)
                    continue

                # Flip for selfie view
                image = cv2.flip(image, 1)
                
                # Calculate mean brightness for debug/auto-switch
                mean_val = np.mean(image)
                self.current_brightness = mean_val
                
                # Add Debug Overlay to the image itself
                cv2.putText(image, f"Cam: {self.camera_index} | Bright: {mean_val:.1f}", (10, 30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                # Check for Black Frames (Auto-Switch Logic)
                if not self.use_test_pattern:
                     # Skip first 10 frames to allow auto-exposure to settle
                     if frame_count > 10: 
                         if mean_val < 2.0: # Extremely low threshold for PITCH BLACK
                             self.black_frame_count += 1
                             if self.black_frame_count > 15: # ~0.5 seconds
                                 print(f"WARNING: Camera {self.camera_index} is black (Val: {mean_val:.2f}). Auto-switching...")
                                 self.black_frame_count = 0
                                 self.change_camera()
                                 break # Break inner loop
                         else:
                             self.black_frame_count = 0

                # Store frame for GUI display (RGB)
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                self.latest_frame = image_rgb
                self.frame_captured.emit()
                
                frame_count += 1

                if self.hands:
                    try:
                        # Convert to MediaPipe Image format
                        import mediapipe as mp
                        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
                        
                        # Detect hand landmarks
                        detection_result = self.hands.detect(mp_image)
                        
                        if detection_result.hand_landmarks:
                            for hand_landmarks in detection_result.hand_landmarks:
                                fingers = []
                                landmarks = hand_landmarks
                                
                                # Thumb (compare X coordinates)
                                if landmarks[4].x < landmarks[3].x:  # THUMB_TIP vs THUMB_IP
                                    fingers.append(1)
                                else:
                                    fingers.append(0)
                                
                                # Fingers (Index to Pinky) - compare Y coordinates
                                tip_indices = [8, 12, 16, 20]  # INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP
                                pip_indices = [6, 10, 14, 18]  # INDEX_PIP, MIDDLE_PIP, RING_PIP, PINKY_PIP
                                
                                for tip_idx, pip_idx in zip(tip_indices, pip_indices):
                                    if landmarks[tip_idx].y < landmarks[pip_idx].y:
                                        fingers.append(1)
                                    else:
                                        fingers.append(0)
                                
                                total_fingers = sum(fingers)
                                if total_fingers == 0:
                                    self.gesture_detected.emit("FIST")
                                elif total_fingers == 5:
                                    self.gesture_detected.emit("OPEN_PALM")
                    except Exception as e:
                        pass  # Silently ignore detection errors
                            
                time.sleep(0.05) # Limit FPS
            
            if self.cap:
                self.cap.release()

    def stop(self):
        self.running = False
        if self.cap:
            self.cap.release()
        self.wait()

class GestureController(QObject):
    isCameraVisibleChanged = Signal()
    gestureDetected = Signal(str)
    frameReady = Signal() # Signal for QML to repaint

    def __init__(self):
        super().__init__()
        self._isCameraVisible = True
        self._currentGesture = ""
        
        # Start Detection Thread
        self.thread = GestureThread()
        self.thread.gesture_detected.connect(self.on_gesture_from_thread)
        # We need to bridge the thread signal to the main thread logic if we want to update the provider here,
        # but the provider is in main scope. 
        # Actually, let's let the main polling loop handle it or connect it here?
        # The provider is global in main. Let's just emit frameReady and let QML poll? 
        # No, simpler: Connect in main.
        self.thread.start()

    @Slot(str)
    def on_gesture_from_thread(self, gesture):
        # Debounce or just pass through
        # if self._currentGesture != gesture: (removed debounce for simulation responsiveness)
        self._currentGesture = gesture
        print(f"Gesture Detected: {gesture}")
        self.gestureDetected.emit(gesture)
            
    # Allow manual simulation/override
    @Slot(str)
    def simulateGesture(self, gesture):
        print(f"[RunUI] simulateGesture Called with: {gesture}") # Visual feedback for inputs
        self.on_gesture_from_thread(gesture)

    @Slot()
    def cycleCamera(self):
        print("[RunUI] Cycling Camera Index...")
        self.thread.change_camera()

    @Slot()
    def toggleTestPattern(self):
        print("[RunUI] Toggling Test Pattern...")
        self.thread.toggle_test_pattern()

    @Property(bool, notify=isCameraVisibleChanged)
    def isCameraVisible(self):
        return self._isCameraVisible

    @isCameraVisible.setter
    def isCameraVisible(self, val):
        if self._isCameraVisible != val:
            self._isCameraVisible = val
            self.isCameraVisibleChanged.emit()

    @Slot()
    def toggleCamera(self):
        self.isCameraVisible = not self.isCameraVisible

class NetworkManager(QObject):
    vehicleStateChanged = Signal()
    mediaStateChanged = Signal()
    volumeChanged = Signal() # Explicit signal for volume

    def __init__(self):
        super().__init__()
        self._vehicle_state = {"driver_temp": 22, "volume": 50} # Start at 50%
        self._media_state = {"title": "Lennon's Ghost", "artist": "The Beatles", "is_playing": True}
        self._last_volume = 50

    @Property(int, notify=volumeChanged)
    def volume(self):
        return self._vehicle_state["volume"]

    @Property("QVariantMap", notify=vehicleStateChanged)
    def vehicleState(self):
        # Always return a copy to ensure QML detects 'change' 
        return dict(self._vehicle_state)

    @Property("QVariantMap", notify=mediaStateChanged)
    def mediaState(self):
        return self._media_state
        
    def handle_gesture(self, gesture_name):
        print(f"[NetworkManager] Handling Gesture: {gesture_name}")
        changed = False
        
        if gesture_name == "FIST":
            # Mute
            if self._vehicle_state["volume"] > 0:
                self._last_volume = self._vehicle_state["volume"]
                # Create a new dict to force QML update
                new_state = self._vehicle_state.copy()
                new_state["volume"] = 0
                self._vehicle_state = new_state
                print(f"[NetworkManager] Muted. Volume is now: {self._vehicle_state['volume']}")
                changed = True
                
        elif gesture_name == "OPEN_PALM":
            # Unmute
            if self._vehicle_state["volume"] == 0:
                new_state = self._vehicle_state.copy()
                new_state["volume"] = self._last_volume
                self._vehicle_state = new_state
                print(f"[NetworkManager] Unmuted. Volume is now: {self._vehicle_state['volume']}")
                changed = True
                
        if changed:
            print("[NetworkManager] Emitting State Change Signal")
            self.vehicleStateChanged.emit()
            self.volumeChanged.emit()

class CameraManager(QObject):
    def __init__(self):
        super().__init__()

if __name__ == "__main__":
    app = QGuiApplication(sys.argv)
    
    # Mock Objects
    gesture_controller = GestureController()
    network_manager = NetworkManager()
    camera_manager = CameraManager()
    
    # Wire Gestures to Logic
    gesture_controller.gestureDetected.connect(network_manager.handle_gesture)

    # Register Singletons Instance
    qmlRegisterSingletonInstance(GestureController, "AeroUI", 1, 0, "GestureController", gesture_controller)
    qmlRegisterSingletonInstance(NetworkManager, "AeroUI", 1, 0, "NetworkManager", network_manager)
    qmlRegisterSingletonInstance(CameraManager, "AeroUI", 1, 0, "CameraManager", camera_manager)

    # Use QQuickView for better compatibility with Item/Rectangle roots
    view = QQuickView()
    view.setResizeMode(QQuickView.SizeRootObjectToView)
    view.setTitle("AeroUI Embedded - Gesture Enabled")
    
    # --- Image Provider for Live Feed ---
    from PySide6.QtQuick import QQuickImageProvider
    from PySide6.QtGui import QImage, QPainter, QColor

    class LiveImageProvider(QQuickImageProvider):
        def __init__(self):
            super().__init__(QQuickImageProvider.Image)
            self._image = QImage(640, 480, QImage.Format_RGB888)
            self._image.fill(QColor("black"))

        def requestImage(self, id, size, requestedSize):
            return self._image

        def update_image(self, cv_img):
            # Expects RGB image
            height, width, channel = cv_img.shape
            bytes_per_line = 3 * width
            q_img = QImage(cv_img.data, width, height, bytes_per_line, QImage.Format_RGB888)
            self._image = q_img.copy() # Layout might need copy to persist

    image_provider = LiveImageProvider()
    view.engine().addImageProvider("live_camera", image_provider)

    # Connect Thread to Provider
    def update_camera_feed():
        if gesture_controller.thread.latest_frame is not None:
             image_provider.update_image(gesture_controller.thread.latest_frame)
             gesture_controller.frameReady.emit()

    gesture_controller.thread.frame_captured.connect(update_camera_feed)
    
    # Load QML
    qml_file = os.path.join(os.path.dirname(__file__), "qml/SimpleMain.qml")
    view.setSource(QUrl.fromLocalFile(qml_file))

    if view.status() == QQuickView.Error:
        print("Error loading QML:")
        for error in view.errors():
            print(error.toString())
        gesture_controller.thread.stop()
        sys.exit(-1)

    view.show()
    ret = app.exec()
    gesture_controller.thread.stop()
    sys.exit(ret)
