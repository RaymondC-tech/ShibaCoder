import socketio
import random
import time
from typing import Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create Socket.IO server
sio = socketio.AsyncServer(
    cors_allowed_origins=["http://localhost:5173"],
    logger=True,
    engineio_logger=True
)

# Create FastAPI app
app = FastAPI(title="ShibaCoder API", version="1.0.0")

# Configure CORS for REST endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
lobbies: Dict[str, Dict] = {}
players: Dict[str, Dict] = {}

def generate_lobby_id() -> str:
    """Generate a unique lobby ID"""
    return f"lobby_{random.randint(100000, 999999)}"

def validate_pin(pin: str) -> bool:
    """Validate 4-digit pin format"""
    return pin.isdigit() and len(pin) == 4

@app.get("/")
def read_root():
    return {"message": "ShibaCoder API"}

# Socket.IO event handlers
@sio.event
async def connect(sid, environ=None):
    print(f"Client {sid} connected")
    players[sid] = {
        "id": sid,
        "name": None,
        "lobby": None,
        "connected_at": time.time()
    }

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")
    if sid in players:
        del players[sid]

@sio.event
async def create_lobby(sid, data):
    """Create a new lobby"""
    try:
        # Validate required fields
        lobby_name = data.get("name", "").strip()
        lobby_type = data.get("type", "public")
        pin = data.get("pin", "")
        
        if not lobby_name:
            await sio.emit("error", {"message": "Lobby name is required"}, room=sid)
            return
        
        if lobby_type not in ["public", "private"]:
            await sio.emit("error", {"message": "Lobby type must be 'public' or 'private'"}, room=sid)
            return
        
        # Validate pin for private lobbies
        if lobby_type == "private":
            if not pin:
                await sio.emit("error", {"message": "Pin is required for private lobbies"}, room=sid)
                return
            if not validate_pin(pin):
                await sio.emit("error", {"message": "Pin must be exactly 4 digits"}, room=sid)
                return
        
        # Generate unique lobby ID
        lobby_id = generate_lobby_id()
        while lobby_id in lobbies:
            lobby_id = generate_lobby_id()
        
        # Get player name or generate one
        player_name = players[sid].get("name") or f"Player{sid[:8]}"
        
        # Create lobby
        lobbies[lobby_id] = {
            "id": lobby_id,
            "name": lobby_name,
            "type": lobby_type,
            "pin": pin if lobby_type == "private" else None,
            "status": "waiting",
            "players": [{
                "id": sid,
                "name": player_name,
                "ready": False
            }],
            "maxPlayers": 2,
            "createdAt": time.time()
        }
        
        # Update player info
        players[sid]["name"] = player_name
        players[sid]["lobby"] = lobby_id
        
        # Join Socket.IO room
        await sio.enter_room(sid, lobby_id)
        
        print(f"Lobby '{lobby_name}' ({lobby_id}) created by {player_name}")
        
        await sio.emit("lobby_created", {
            "lobbyId": lobby_id,
            "lobbyData": lobbies[lobby_id]
        }, room=sid)
        
    except Exception as e:
        await sio.emit("error", {"message": f"Failed to create lobby: {str(e)}"}, room=sid)

# Mount Socket.IO app
socket_app = socketio.ASGIApp(sio, app)