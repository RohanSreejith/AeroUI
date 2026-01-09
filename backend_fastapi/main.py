from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models import SystemState, VehicleStateModel, MediaStateModel
import asyncio

app = FastAPI()

# CORS configuration to match Django (allow all for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State Manager
state_manager = SystemState.get_instance()

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

# --- REST Endpoints ---

@app.get("/api/vehicle", response_model=VehicleStateModel)
async def get_vehicle_state():
    return state_manager.vehicle

@app.post("/api/vehicle", response_model=VehicleStateModel)
async def update_vehicle_state(state: VehicleStateModel):
    state_manager.vehicle = state
    state_manager.save()
    # Notify WebSocket clients
    await manager.broadcast({"type": "VEHICLE_UPDATE", "data": state.dict()})
    return state_manager.vehicle

@app.get("/api/media", response_model=MediaStateModel)
async def get_media_state():
    return state_manager.media

@app.post("/api/media", response_model=MediaStateModel)
async def update_media_state(state: MediaStateModel):
    state_manager.media = state
    state_manager.save()
    # Notify WebSocket clients
    await manager.broadcast({"type": "MEDIA_UPDATE", "data": state.dict()})
    return state_manager.media

# --- WebSocket Endpoint ---

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial state on connection
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "data": {
                "vehicle": state_manager.vehicle.dict(),
                "media": state_manager.media.dict()
            }
        })
        while True:
            # We mostly expect the client to listen, but if they send data, we can handle it
            data = await websocket.receive_json()
            # Handle incoming updates if necessary (e.g. from the Qt UI directly)
            # For now, we assume one-way sync (UI actions -> REST -> Broadcast), 
            # OR UI actions -> WS -> Broadcast. 
            # Let's support basic state updates via WS too for lower latency.
            if data.get("type") == "UPDATE_VEHICLE":
                state_manager.vehicle = VehicleStateModel(**data["data"])
                state_manager.save()
                await manager.broadcast({"type": "VEHICLE_UPDATE", "data": state_manager.vehicle.dict()})
            elif data.get("type") == "UPDATE_MEDIA":
                state_manager.media = MediaStateModel(**data["data"])
                state_manager.save()
                await manager.broadcast({"type": "MEDIA_UPDATE", "data": state_manager.media.dict()})

    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
