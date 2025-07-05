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

def get_public_lobbies(search: str = "", page: int = 1, per_page: int = 4) -> Dict:
    """Get paginated list of public lobbies with search"""
    # Filter public lobbies in waiting status
    public_lobbies = [
        lobby for lobby in lobbies.values() 
        if lobby["type"] == "public" and lobby["status"] == "waiting"
    ]
    
    # Apply search filter if provided
    if search:
        search_lower = search.lower()
        public_lobbies = [
            lobby for lobby in public_lobbies
            if search_lower in lobby["name"].lower()
        ]
    
    # Sort by creation time (newest first)
    public_lobbies.sort(key=lambda x: x["createdAt"], reverse=True)
    
    # Apply pagination
    total_lobbies = len(public_lobbies)
    total_pages = max(1, (total_lobbies + per_page - 1) // per_page)
    
    # Ensure page is valid
    page = max(1, min(page, total_pages))
    
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    page_lobbies = public_lobbies[start_idx:end_idx]
    
    # Return lobby data without sensitive info
    return {
        "lobbies": [{
            "id": lobby["id"],
            "name": lobby["name"],
            "playerCount": len(lobby["players"]),
            "maxPlayers": lobby["maxPlayers"],
            "status": lobby["status"],
            "createdAt": lobby["createdAt"]
        } for lobby in page_lobbies],
        "pagination": {
            "currentPage": page,
            "totalPages": total_pages,
            "totalLobbies": total_lobbies,
            "perPage": per_page
        },
        "search": search
    }

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
    
    # Handle player leaving lobby on disconnect
    if sid in players:
        player = players[sid]
        if player["lobby"]:
            lobby_id = player["lobby"]
            if lobby_id in lobbies:
                lobby = lobbies[lobby_id]
                player_name = player["name"]
                
                # Remove player from lobby
                lobby["players"] = [p for p in lobby["players"] if p["id"] != sid]
                
                print(f"{player_name} disconnected from lobby '{lobby['name']}' ({lobby_id})")
                
                # If lobby is empty, delete it
                if len(lobby["players"]) == 0:
                    del lobbies[lobby_id]
                    print(f"Lobby {lobby_id} deleted - no players remaining")
                else:
                    # Notify remaining players
                    await sio.emit("player_left", {
                        "playerName": player_name,
                        "playerCount": len(lobby["players"]),
                        "players": lobby["players"]
                    }, room=lobby_id)
        
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

@sio.event
async def get_lobby_list(sid, data):
    """Get paginated list of public lobbies with search"""
    try:
        # Extract parameters with defaults
        page = data.get("page", 1) if data else 1
        search = data.get("search", "").strip() if data else ""
        
        # Validate page number
        if not isinstance(page, int) or page < 1:
            page = 1
        
        # Get lobby list
        lobby_data = get_public_lobbies(search=search, page=page)
        
        print(f"Client {sid} requested lobby list - page {page}, search: '{search}', found {len(lobby_data['lobbies'])} lobbies")
        
        await sio.emit("lobby_list", lobby_data, room=sid)
        
    except Exception as e:
        await sio.emit("error", {"message": f"Failed to get lobby list: {str(e)}"}, room=sid)

@sio.event
async def join_lobby(sid, data):
    """Join an existing lobby"""
    try:
        # Validate required fields
        lobby_id = data.get("lobbyId", "").strip()
        pin = data.get("pin", "").strip()
        
        if not lobby_id:
            await sio.emit("error", {"message": "Lobby ID is required"}, room=sid)
            return
        
        # Check if lobby exists
        if lobby_id not in lobbies:
            await sio.emit("error", {"message": "Lobby not found"}, room=sid)
            return
        
        lobby = lobbies[lobby_id]
        
        # Check if lobby is full
        if len(lobby["players"]) >= lobby["maxPlayers"]:
            await sio.emit("error", {"message": "Lobby is full"}, room=sid)
            return
        
        # Check if game already started
        if lobby["status"] != "waiting":
            await sio.emit("error", {"message": "Game already in progress"}, room=sid)
            return
        
        # Check if player already in a lobby
        if players[sid]["lobby"]:
            await sio.emit("error", {"message": "You are already in a lobby"}, room=sid)
            return
        
        # Verify pin for private lobbies
        if lobby["type"] == "private":
            if not pin:
                await sio.emit("error", {"message": "Pin is required for private lobbies"}, room=sid)
                return
            if pin != lobby["pin"]:
                await sio.emit("error", {"message": "Incorrect pin"}, room=sid)
                return
        
        # Get player name or generate one
        player_name = players[sid].get("name") or f"Player{sid[:8]}"
        
        # Add player to lobby
        lobby["players"].append({
            "id": sid,
            "name": player_name,
            "ready": False
        })
        
        # Update player info
        players[sid]["name"] = player_name
        players[sid]["lobby"] = lobby_id
        
        # Join Socket.IO room
        await sio.enter_room(sid, lobby_id)
        
        print(f"{player_name} joined lobby '{lobby['name']}' ({lobby_id})")
        
        # Send confirmation to joining player
        await sio.emit("lobby_joined", {
            "lobbyId": lobby_id,
            "lobbyData": lobby,
            "playerCount": len(lobby["players"])
        }, room=sid)
        
        # Notify all players in lobby about the new player
        await sio.emit("player_joined", {
            "playerName": player_name,
            "playerCount": len(lobby["players"]),
            "maxPlayers": lobby["maxPlayers"],
            "players": lobby["players"]
        }, room=lobby_id)
        
        # If lobby is now full, could potentially start game here
        if len(lobby["players"]) == lobby["maxPlayers"]:
            print(f"Lobby {lobby_id} is now full ({len(lobby['players'])}/{lobby['maxPlayers']})")
        
    except Exception as e:
        await sio.emit("error", {"message": f"Failed to join lobby: {str(e)}"}, room=sid)

@sio.event
async def leave_lobby(sid, data=None):
    """Leave current lobby"""
    try:
        if sid not in players or not players[sid]["lobby"]:
            await sio.emit("error", {"message": "You are not in a lobby"}, room=sid)
            return
        
        lobby_id = players[sid]["lobby"]
        
        if lobby_id not in lobbies:
            # Cleanup orphaned player reference
            players[sid]["lobby"] = None
            return
        
        lobby = lobbies[lobby_id]
        player_name = players[sid]["name"]
        
        # Remove player from lobby
        lobby["players"] = [p for p in lobby["players"] if p["id"] != sid]
        
        # Update player info
        players[sid]["lobby"] = None
        
        # Leave Socket.IO room
        await sio.leave_room(sid, lobby_id)
        
        print(f"{player_name} left lobby '{lobby['name']}' ({lobby_id})")
        
        # Send confirmation to leaving player
        await sio.emit("lobby_left", {"message": "Left lobby successfully"}, room=sid)
        
        # If lobby is empty, delete it
        if len(lobby["players"]) == 0:
            del lobbies[lobby_id]
            print(f"Lobby {lobby_id} deleted - no players remaining")
        else:
            # Notify remaining players
            await sio.emit("player_left", {
                "playerName": player_name,
                "playerCount": len(lobby["players"]),
                "players": lobby["players"]
            }, room=lobby_id)
        
    except Exception as e:
        await sio.emit("error", {"message": f"Failed to leave lobby: {str(e)}"}, room=sid)

@sio.event
async def player_ready(sid, data=None):
    """Handle player ready state"""
    try:
        if sid not in players or not players[sid]["lobby"]:
            await sio.emit("error", {"message": "You are not in a lobby"}, room=sid)
            return
        
        lobby_id = players[sid]["lobby"]
        
        if lobby_id not in lobbies:
            await sio.emit("error", {"message": "Lobby not found"}, room=sid)
            return
        
        lobby = lobbies[lobby_id]
        
        # Check if lobby has enough players
        if len(lobby["players"]) < 2:
            await sio.emit("error", {"message": "Need 2 players to start game"}, room=sid)
            return
        
        # Find and update player ready state
        player_found = False
        for player in lobby["players"]:
            if player["id"] == sid:
                player["ready"] = True
                player_found = True
                break
        
        if not player_found:
            await sio.emit("error", {"message": "Player not found in lobby"}, room=sid)
            return
        
        player_name = players[sid]["name"]
        print(f"{player_name} is ready in lobby {lobby_id}")
        
        # Broadcast ready state to all players in lobby
        await sio.emit("player_ready_update", {
            "playerName": player_name,
            "players": [{
                "id": p["id"],
                "name": p["name"], 
                "ready": p["ready"]
            } for p in lobby["players"]]
        }, room=lobby_id)
        
        # Check if all players are ready
        all_ready = all(player["ready"] for player in lobby["players"])
        
        if all_ready and len(lobby["players"]) == lobby["maxPlayers"]:
            # Start the game!
            lobby["status"] = "playing"
            lobby["started_at"] = time.time()
            
            print(f"Game started in lobby {lobby_id} - all players ready!")
            
            # Add the hardcoded Two Sum problem
            game_problem = {
                "id": "two-sum",
                "title": "Two Sum", 
                "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                "examples": [
                    {
                        "input": "nums = [2,7,11,15], target = 9",
                        "output": "[0,1]",
                        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
                    }
                ],
                "template": """def two_sum(nums, target):
    # Write your solution here
    pass""",
                "timeLimit": 300  # 5 minutes
            }
            
            await sio.emit("game_start", {
                "problem": game_problem,
                "players": [{
                    "id": p["id"],
                    "name": p["name"]
                } for p in lobby["players"]],
                "timeLimit": game_problem["timeLimit"]
            }, room=lobby_id)
        
    except Exception as e:
        await sio.emit("error", {"message": f"Failed to update ready state: {str(e)}"}, room=sid)

# Mount Socket.IO app
socket_app = socketio.ASGIApp(sio, app)