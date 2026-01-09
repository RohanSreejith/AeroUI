import mediapipe as mp
print(f"MediaPipe File: {mp.__file__}")
print(f"Dir: {dir(mp)}")
try:
    print(f"Solutions: {mp.solutions}")
except AttributeError:
    print("No solutions attribute")
