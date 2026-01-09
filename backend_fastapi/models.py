import json
import os
from pydantic import BaseModel
from typing import Optional

STATE_FILE = "state.json"

class VehicleStateModel(BaseModel):
    driver_temp: int = 22
    passenger_temp: int = 22
    fan_speed: int = 3
    volume: int = 50

class MediaStateModel(BaseModel):
    title: str = "Not Playing"
    artist: str = "Unknown"
    album_art: str = ""
    is_playing: bool = False
    progress: int = 0
    duration: int = 180

class SystemState:
    _instance = None

    def __init__(self):
        self.vehicle = VehicleStateModel()
        self.media = MediaStateModel()
        self.load()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load(self):
        if os.path.exists(STATE_FILE):
            try:
                with open(STATE_FILE, 'r') as f:
                    data = json.load(f)
                    self.vehicle = VehicleStateModel(**data.get('vehicle', {}))
                    self.media = MediaStateModel(**data.get('media', {}))
            except Exception as e:
                print(f"Failed to load state: {e}")

    def save(self):
        try:
            with open(STATE_FILE, 'w') as f:
                json.dump({
                    "vehicle": self.vehicle.dict(),
                    "media": self.media.dict()
                }, f, indent=4)
        except Exception as e:
            print(f"Failed to save state: {e}")
