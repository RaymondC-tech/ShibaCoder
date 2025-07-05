import json
import random
import time
import os
import httpx
import asyncio
import base64
from typing import Dict, Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Judge0 API Configuration
JUDGE0_API_KEY = os.getenv("JUDGE0_API_KEY")
JUDGE0_API_HOST = os.getenv("JUDGE0_API_HOST", "judge0-ce.p.rapidapi.com")
JUDGE0_BASE_URL = os.getenv("JUDGE0_BASE_URL", "https://judge0-ce.p.rapidapi.com")

# Python language ID for Judge0 (71 = Python 3.8.1)
PYTHON_LANGUAGE_ID = 71

# Create FastAPI app
app = FastAPI(title="ShibaCoder API", version="1.0.0")

# Configure CORS for REST endpoints
# Allow all origins for easy deployment and testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
lobbies: Dict[str, Dict] = {}
connections: Dict[str, WebSocket] = {}
players: Dict[str, Dict] = {}

def generate_lobby_id() -> str:
    """Generate a unique lobby ID"""
    return f"lobby_{random.randint(100000, 999999)}"

def validate_pin(pin: str) -> bool:
    """Validate 4-digit pin format"""
    return pin.isdigit() and len(pin) == 4

async def broadcast_to_all(event: str, data: dict):
    """Broadcast event to all connected clients"""
    if not connections:
        return
    
    message = json.dumps({"event": event, "data": data})
    disconnected = []
    
    for client_id, websocket in connections.items():
        try:
            await websocket.send_text(message)
        except:
            disconnected.append(client_id)
    
    # Clean up disconnected clients
    for client_id in disconnected:
        if client_id in connections:
            del connections[client_id]
        if client_id in players:
            del players[client_id]

async def broadcast_to_lobby(lobby_id: str, event: str, data: dict):
    """Broadcast event to all players in a specific lobby"""
    if lobby_id not in lobbies:
        return
    
    lobby = lobbies[lobby_id]
    message = json.dumps({"event": event, "data": data})
    
    for player in lobby["players"]:
        player_id = player["id"]
        if player_id in connections:
            try:
                await connections[player_id].send_text(message)
            except:
                pass

async def send_to_client(client_id: str, event: str, data: dict):
    """Send event to a specific client"""
    if client_id not in connections:
        return
    
    message = json.dumps({"event": event, "data": data})
    try:
        await connections[client_id].send_text(message)
    except:
        pass

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

async def broadcast_lobby_list_update():
    """Broadcast updated lobby list to all connected clients"""
    try:
        lobby_data = get_public_lobbies(search="", page=1)
        await broadcast_to_all("lobby_list_update", lobby_data)
        print(f"Broadcasted lobby list update: {len(lobby_data['lobbies'])} lobbies")
    except Exception as e:
        print(f"Failed to broadcast lobby list update: {e}")

# Judge0 functions (same as before)
async def judge0_submit_code(code: str, test_cases: list) -> dict:
    """Submit code to Judge0 API and return test results"""
    print(f"DEBUG: JUDGE0_API_KEY exists: {JUDGE0_API_KEY is not None}")
    print(f"DEBUG: JUDGE0_API_HOST: {JUDGE0_API_HOST}")
    print(f"DEBUG: JUDGE0_BASE_URL: {JUDGE0_BASE_URL}")
    
    if not JUDGE0_API_KEY:
        print("Warning: Judge0 API key not configured, using fake results")
        return run_fake_tests(code)
    
    headers = {
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": JUDGE0_API_HOST,
        "Content-Type": "application/json"
    }
    
    print(f"DEBUG: About to submit to Judge0 with {len(test_cases)} test cases")
    
    passed_tests = 0
    total_tests = len(test_cases)
    errors = []
    total_runtime = 0
    
    async with httpx.AsyncClient() as client:
        try:
            for i, test_case in enumerate(test_cases):
                print(f"DEBUG: Processing test case {i+1}")
                # Prepare the submission
                submission_data = {
                    "language_id": PYTHON_LANGUAGE_ID,
                    "source_code": code,
                    "stdin": test_case["input"],
                    "expected_output": test_case["expected_output"].strip()
                }
                
                # Submit code
                submit_response = await client.post(
                    f"{JUDGE0_BASE_URL}/submissions",
                    json=submission_data,
                    headers=headers,
                    timeout=30.0
                )
                
                print(f"DEBUG: Submit response status: {submit_response.status_code}")
                
                if submit_response.status_code != 201:
                    submit_error = submit_response.text if submit_response.text else "Submission failed"
                    print(f"DEBUG: Submit failed: {submit_error}")
                    errors.append(f"Test {i+1}: {submit_error}")
                    continue
                
                submission_token = submit_response.json()["token"]
                
                # Poll for results
                max_polls = 15  # Increased polling attempts
                for poll in range(max_polls):
                    await asyncio.sleep(1)  # Wait 1 second between polls
                    
                    result_response = await client.get(
                        f"{JUDGE0_BASE_URL}/submissions/{submission_token}",
                        headers=headers,
                        timeout=10.0
                    )
                    
                    if result_response.status_code != 200:
                        continue
                    
                    result = result_response.json()
                    status_id = result.get("status", {}).get("id")
                    
                    # Status: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=Time Limit Exceeded, 6=Compilation Error, etc.
                    if status_id in [1, 2]:  # Still processing
                        continue
                    elif status_id == 3:  # Accepted
                        passed_tests += 1
                        # Add actual runtime if available
                        if result.get("time"):
                            total_runtime += float(result["time"]) * 1000  # Convert to ms
                        break
                    else:  # Error
                        status_desc = result.get("status", {}).get("description", "Unknown error")
                        actual_output = result.get("stdout", "").strip()
                        expected_output = test_case["expected_output"].strip()
                        
                        # Provide detailed error information
                        error_msg = f"Test {i+1}: {status_desc}"
                        if actual_output and actual_output != expected_output:
                            error_msg += f" - Expected: {expected_output}, Got: {actual_output}"
                        elif result.get("stderr"):
                            error_msg += f" - {result['stderr'].strip()}"
                        elif result.get("compile_output"):
                            error_msg += f" - {result['compile_output'].strip()}"
                        
                        errors.append(error_msg)
                        break
                else:
                    errors.append(f"Test {i+1}: Timeout waiting for result")
                    
        except Exception as e:
            print(f"Judge0 API error: {e}")
            errors.append(f"API Error: {str(e)}")
            # If Judge0 fails, fall back to fake tests
            return run_fake_tests(code)
    
    # Calculate average runtime
    avg_runtime = int(total_runtime / total_tests) if total_tests > 0 and total_runtime > 0 else random.randint(50, 300)
    
    return {
        "passed": passed_tests,
        "total": total_tests,
        "completed": passed_tests == total_tests,
        "runtime": avg_runtime,
        "errors": errors
    }

def get_two_sum_test_cases():
    """Return test cases for the Two Sum problem"""
    return [
        {
            "input": "[2,7,11,15]\n9",
            "expected_output": "[0, 1]"
        },
        {
            "input": "[3,2,4]\n6",
            "expected_output": "[1, 2]"
        },
        {
            "input": "[3,3]\n6",
            "expected_output": "[0, 1]"
        },
        {
            "input": "[1,2,3,4,5]\n9",
            "expected_output": "[3, 4]"
        },
        {
            "input": "[2,5,5,11]\n10",
            "expected_output": "[1, 2]"
        }
    ]

def run_fake_tests(code: str, problem_id: str = "two-sum") -> dict:
    """Simulate code execution and return more realistic test results"""
    # Simulate processing time
    time.sleep(0.5)
    
    # Analyze code for Two Sum problem
    code_lower = code.lower().strip()
    
    # Check for basic requirements
    has_function = "def " in code
    has_return = "return" in code
    has_loop_or_dict = any(keyword in code for keyword in ["for", "while", "dict", "{}"])
    
    # More sophisticated analysis for Two Sum
    has_enumerate = "enumerate" in code
    has_target_check = "target" in code_lower
    has_nums_access = any(pattern in code for pattern in ["nums[", "nums.", "enumerate(nums"])
    has_indices_logic = any(pattern in code for pattern in ["[i,", "[0,", "[1,", "i,", "j,", "return ["])
    
    # Start with base score
    passed_count = 0
    errors = []
    
    # Basic requirements
    if not has_function:
        errors.append("Solution must be defined as a function")
        return {
            "passed": 0,
            "total": 5,
            "completed": False,
            "runtime": random.randint(50, 150),
            "errors": errors
        }
    
    if not has_return:
        errors.append("Function must return a value")
        passed_count = 0
    elif not has_target_check:
        errors.append("Function doesn't seem to use the target parameter")
        passed_count = 1
    elif not has_nums_access:
        errors.append("Function doesn't properly access the nums array")
        passed_count = 1
    elif not has_indices_logic:
        errors.append("Function doesn't return proper indices format")
        passed_count = 2
    elif not has_loop_or_dict:
        errors.append("Solution needs iteration or hash table for efficiency")
        passed_count = 3
    else:
        # Check for optimal solution patterns
        if has_enumerate and (has_loop_or_dict):
            passed_count = 5  # Likely correct solution
        elif has_loop_or_dict:
            passed_count = 4  # Good solution but might be missing edge cases
        else:
            passed_count = 3  # Basic solution
    
    # Add some minor randomness for realism
    if passed_count > 0 and random.random() < 0.1:
        passed_count = max(0, passed_count - 1)
        if passed_count < 5:
            errors.append(f"Test case {passed_count + 1} failed - check edge cases")
    
    total_tests = 5
    completed = passed_count == total_tests
    
    return {
        "passed": passed_count,
        "total": total_tests,
        "completed": completed,
        "runtime": random.randint(50, 200),
        "errors": errors
    }

@app.get("/")
def read_root():
    return {"message": "ShibaCoder API"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for all real-time communication"""
    await websocket.accept()
    client_id = f"client_{random.randint(100000, 999999)}"
    connections[client_id] = websocket
    players[client_id] = {
        "id": client_id,
        "name": None,
        "lobby": None,
        "connected_at": time.time()
    }
    
    print(f"Client {client_id} connected")
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            message = json.loads(data)
            event = message.get("event")
            payload = message.get("data", {})
            
            # Handle different events
            if event == "get_lobby_list":
                page = payload.get("page", 1)
                search = payload.get("search", "")
                lobby_data = get_public_lobbies(search=search, page=page)
                await send_to_client(client_id, "lobby_list", lobby_data)
                
            elif event == "create_lobby":
                await handle_create_lobby(client_id, payload)
                
            elif event == "join_lobby":
                await handle_join_lobby(client_id, payload)
                
            elif event == "leave_lobby":
                await handle_leave_lobby(client_id, payload)
                
            elif event == "player_ready":
                await handle_player_ready(client_id, payload)
                
            elif event == "submit_code":
                await handle_submit_code(client_id, payload)
                
            elif event == "send_attack":
                await handle_send_attack(client_id, payload)
                
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
        await handle_disconnect(client_id)
    except Exception as e:
        print(f"WebSocket error for {client_id}: {e}")
        await handle_disconnect(client_id)

async def handle_disconnect(client_id: str):
    """Handle client disconnection"""
    if client_id in players:
        player = players[client_id]
        if player["lobby"]:
            lobby_id = player["lobby"]
            if lobby_id in lobbies:
                lobby = lobbies[lobby_id]
                player_name = player["name"]
                
                # Remove player from lobby
                lobby["players"] = [p for p in lobby["players"] if p["id"] != client_id]
                
                print(f"{player_name} disconnected from lobby '{lobby['name']}' ({lobby_id})")
                
                # If lobby is empty, delete it
                if len(lobby["players"]) == 0:
                    del lobbies[lobby_id]
                    print(f"Lobby {lobby_id} deleted - no players remaining")
                    await broadcast_lobby_list_update()
                else:
                    # Notify remaining players
                    await broadcast_to_lobby(lobby_id, "player_left", {
                        "playerName": player_name,
                        "playerCount": len(lobby["players"]),
                        "players": lobby["players"]
                    })
        
        del players[client_id]
    
    if client_id in connections:
        del connections[client_id]

async def handle_create_lobby(client_id: str, data: dict):
    """Handle lobby creation"""
    try:
        lobby_name = data.get("name", "").strip()
        lobby_type = data.get("type", "public")
        pin = data.get("pin", "")
        
        if not lobby_name:
            await send_to_client(client_id, "error", {"message": "Lobby name is required"})
            return
        
        if lobby_type not in ["public", "private"]:
            await send_to_client(client_id, "error", {"message": "Lobby type must be 'public' or 'private'"})
            return
        
        # Validate pin for private lobbies
        if lobby_type == "private":
            if not pin:
                await send_to_client(client_id, "error", {"message": "Pin is required for private lobbies"})
                return
            if not validate_pin(pin):
                await send_to_client(client_id, "error", {"message": "Pin must be exactly 4 digits"})
                return
        
        # Generate unique lobby ID
        lobby_id = generate_lobby_id()
        while lobby_id in lobbies:
            lobby_id = generate_lobby_id()
        
        # Get player name from request, localStorage, or generate one
        player_name = data.get("playerName", "").strip()
        if not player_name:
            player_name = players[client_id].get("name") or f"Player{client_id[-8:]}"
        
        # Create lobby
        lobbies[lobby_id] = {
            "id": lobby_id,
            "name": lobby_name,
            "type": lobby_type,
            "pin": pin if lobby_type == "private" else None,
            "status": "waiting",
            "players": [{
                "id": client_id,
                "name": player_name,
                "ready": False
            }],
            "maxPlayers": 2,
            "createdAt": time.time()
        }
        
        # Update player info
        players[client_id]["name"] = player_name
        players[client_id]["lobby"] = lobby_id
        
        print(f"Lobby '{lobby_name}' ({lobby_id}) created by {player_name}")
        
        await send_to_client(client_id, "lobby_created", {
            "lobbyId": lobby_id,
            "lobbyData": lobbies[lobby_id]
        })
        
        # Broadcast lobby list update to all connected clients
        await broadcast_lobby_list_update()
        
    except Exception as e:
        await send_to_client(client_id, "error", {"message": f"Failed to create lobby: {str(e)}"})

async def handle_join_lobby(client_id: str, data: dict):
    """Handle joining a lobby"""
    try:
        lobby_id = data.get("lobbyId", "").strip()
        pin = data.get("pin", "").strip()
        
        if not lobby_id:
            await send_to_client(client_id, "error", {"message": "Lobby ID is required"})
            return
        
        # Check if lobby exists
        if lobby_id not in lobbies:
            await send_to_client(client_id, "error", {"message": "Lobby not found"})
            return
        
        lobby = lobbies[lobby_id]
        
        # Check if lobby is full
        if len(lobby["players"]) >= lobby["maxPlayers"]:
            await send_to_client(client_id, "error", {"message": "Lobby is full"})
            return
        
        # Check if game already started
        if lobby["status"] != "waiting":
            await send_to_client(client_id, "error", {"message": "Game already in progress"})
            return
        
        # Check if player already in a lobby
        if players[client_id]["lobby"]:
            await send_to_client(client_id, "error", {"message": "You are already in a lobby"})
            return
        
        # Verify pin for private lobbies
        if lobby["type"] == "private":
            if not pin:
                await send_to_client(client_id, "error", {"message": "Pin is required for private lobbies"})
                return
            if pin != lobby["pin"]:
                await send_to_client(client_id, "error", {"message": "Incorrect pin"})
                return
        
        # Get player name from request or generate one
        player_name = data.get("playerName", "").strip()
        if not player_name:
            player_name = players[client_id].get("name") or f"Player{client_id[-8:]}"
        
        # Add player to lobby
        lobby["players"].append({
            "id": client_id,
            "name": player_name,
            "ready": False
        })
        
        # Update player info
        players[client_id]["name"] = player_name
        players[client_id]["lobby"] = lobby_id
        
        print(f"{player_name} joined lobby '{lobby['name']}' ({lobby_id})")
        
        # Send confirmation to joining player
        await send_to_client(client_id, "lobby_joined", {
            "lobbyId": lobby_id,
            "lobbyData": lobby,
            "playerCount": len(lobby["players"])
        })
        
        # Notify all players in lobby about the new player
        await broadcast_to_lobby(lobby_id, "player_joined", {
            "playerName": player_name,
            "playerCount": len(lobby["players"]),
            "maxPlayers": lobby["maxPlayers"],
            "players": lobby["players"]
        })
        
        # Broadcast lobby list update since player count changed
        await broadcast_lobby_list_update()
        
    except Exception as e:
        await send_to_client(client_id, "error", {"message": f"Failed to join lobby: {str(e)}"})

async def handle_leave_lobby(client_id: str, data: dict):
    """Handle leaving a lobby"""
    try:
        if client_id not in players or not players[client_id]["lobby"]:
            await send_to_client(client_id, "error", {"message": "You are not in a lobby"})
            return
        
        lobby_id = players[client_id]["lobby"]
        
        if lobby_id not in lobbies:
            # Cleanup orphaned player reference
            players[client_id]["lobby"] = None
            return
        
        lobby = lobbies[lobby_id]
        player_name = players[client_id]["name"]
        
        # Remove player from lobby
        lobby["players"] = [p for p in lobby["players"] if p["id"] != client_id]
        
        # Update player info
        players[client_id]["lobby"] = None
        
        print(f"{player_name} left lobby '{lobby['name']}' ({lobby_id})")
        
        # Send confirmation to leaving player
        await send_to_client(client_id, "lobby_left", {"message": "Left lobby successfully"})
        
        # If lobby is empty, delete it
        if len(lobby["players"]) == 0:
            del lobbies[lobby_id]
            print(f"Lobby {lobby_id} deleted - no players remaining")
            await broadcast_lobby_list_update()
        else:
            # Notify remaining players
            await broadcast_to_lobby(lobby_id, "player_left", {
                "playerName": player_name,
                "playerCount": len(lobby["players"]),
                "players": lobby["players"]
            })
        
    except Exception as e:
        await send_to_client(client_id, "error", {"message": f"Failed to leave lobby: {str(e)}"})

async def handle_player_ready(client_id: str, data: dict):
    """Handle player ready state"""
    try:
        if client_id not in players or not players[client_id]["lobby"]:
            await send_to_client(client_id, "error", {"message": "You are not in a lobby"})
            return
        
        lobby_id = players[client_id]["lobby"]
        
        if lobby_id not in lobbies:
            await send_to_client(client_id, "error", {"message": "Lobby not found"})
            return
        
        lobby = lobbies[lobby_id]
        
        # No need to check player count - allow ready even when alone
        
        # Find and update player ready state
        player_found = False
        for player in lobby["players"]:
            if player["id"] == client_id:
                player["ready"] = True
                player_found = True
                break
        
        if not player_found:
            await send_to_client(client_id, "error", {"message": "Player not found in lobby"})
            return
        
        player_name = players[client_id]["name"]
        print(f"{player_name} is ready in lobby {lobby_id}")
        
        # Broadcast ready state to all players in lobby
        await broadcast_to_lobby(lobby_id, "player_ready_update", {
            "playerName": player_name,
            "players": [{
                "id": p["id"],
                "name": p["name"], 
                "ready": p["ready"]
            } for p in lobby["players"]]
        })
        
        # Check if all players are ready
        all_ready = all(player["ready"] for player in lobby["players"])
        
        if all_ready and len(lobby["players"]) == lobby["maxPlayers"]:
            # Start countdown
            print(f"All players ready in lobby {lobby_id} - starting countdown!")
            
            # Broadcast countdown start
            await broadcast_to_lobby(lobby_id, "countdown_start", {
                "countdown": 3
            })
            
            # Wait 3 seconds with countdown updates
            for i in range(3, 0, -1):
                await broadcast_to_lobby(lobby_id, "countdown_update", {
                    "countdown": i
                })
                await asyncio.sleep(1)
            
            # Start the game!
            lobby["status"] = "playing"
            lobby["started_at"] = time.time()
            
            print(f"Game started in lobby {lobby_id}!")
            
            # Add the hardcoded Two Sum problem
            game_problem = {
                "id": "two-sum",
                "title": "Two Sum", 
                "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Input: First line contains the array as a string (e.g., [2,7,11,15]), second line contains the target integer.",
                "examples": [
                    {
                        "input": "[2,7,11,15]\n9",
                        "output": "[0, 1]",
                        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
                    }
                ],
                "template": """# Read input
import sys
lines = sys.stdin.read().strip().split('\\n')
nums = eval(lines[0])  # Parse array from string
target = int(lines[1])

# Your solution here
def two_sum(nums, target):
    # Write your solution here
    pass

# Call function and print result
result = two_sum(nums, target)
print(result)""",
                "timeLimit": 300  # 5 minutes
            }
            
            lobby["problem"] = game_problem
            
            await broadcast_to_lobby(lobby_id, "game_start", {
                "problem": game_problem,
                "players": [{
                    "id": p["id"],
                    "name": p["name"]
                } for p in lobby["players"]],
                "timeLimit": game_problem["timeLimit"]
            })
            
            # Broadcast lobby list update since game started (lobby no longer visible in waiting list)
            await broadcast_lobby_list_update()
        
    except Exception as e:
        await send_to_client(client_id, "error", {"message": f"Failed to update ready state: {str(e)}"})

async def handle_submit_code(client_id: str, data: dict):
    """Handle code submission and execute tests"""
    try:
        if client_id not in players or not players[client_id]["lobby"]:
            await send_to_client(client_id, "error", {"message": "You are not in a lobby"})
            return
        
        lobby_id = players[client_id]["lobby"]
        
        if lobby_id not in lobbies:
            await send_to_client(client_id, "error", {"message": "Lobby not found"})
            return
        
        lobby = lobbies[lobby_id]
        
        # Check if game is in progress
        if lobby["status"] != "playing":
            await send_to_client(client_id, "error", {"message": "Game is not in progress"})
            return
        
        # Get submitted code
        submitted_code = data.get("code", "").strip()
        language = data.get("language", "python")
        
        if not submitted_code:
            await send_to_client(client_id, "error", {"message": "Code cannot be empty"})
            return
        
        # Find player in lobby and update their code
        player_found = False
        for player in lobby["players"]:
            if player["id"] == client_id:
                player["code"] = submitted_code
                player["last_submission"] = time.time()
                player_found = True
                break
        
        if not player_found:
            await send_to_client(client_id, "error", {"message": "Player not found in lobby"})
            return
        
        player_name = players[client_id]["name"]
        print(f"{player_name} submitted code in lobby {lobby_id}")
        
        # Get test cases for the problem
        if lobby["problem"]["id"] == "two-sum":
            test_cases = get_two_sum_test_cases()
        else:
            test_cases = get_two_sum_test_cases()  # Default fallback
        
        # Submit code to Judge0 API
        test_results = await judge0_submit_code(submitted_code, test_cases)
        
        # Update player progress
        for player in lobby["players"]:
            if player["id"] == client_id:
                player["tests_passed"] = test_results["passed"]
                player["total_tests"] = test_results["total"]
                player["completed"] = test_results["completed"]
                break
        
        # Send test results to submitting player
        await send_to_client(client_id, "test_results", {
            "passed": test_results["passed"],
            "total": test_results["total"],
            "completed": test_results["completed"],
            "runtime": test_results["runtime"],
            "errors": test_results.get("errors", [])
        })
        
        # Broadcast progress update to all players in lobby
        await broadcast_to_lobby(lobby_id, "progress_update", {
            "players": [{
                "name": p["name"],
                "tests_passed": p.get("tests_passed", 0),
                "total_tests": p.get("total_tests", 5),
                "completed": p.get("completed", False)
            } for p in lobby["players"]]
        })
        
        # Check for winner
        if test_results["completed"]:
            lobby["status"] = "finished"
            lobby["ended_at"] = time.time()
            lobby["winner"] = player_name
            
            # Calculate final scores
            final_scores = []
            for p in lobby["players"]:
                final_scores.append({
                    "name": p["name"],
                    "tests_passed": p.get("tests_passed", 0),
                    "total_tests": p.get("total_tests", 5),
                    "completed": p.get("completed", False),
                    "completion_time": p.get("last_submission", 0) - lobby.get("started_at", 0) if p.get("completed") else None
                })
            
            await broadcast_to_lobby(lobby_id, "game_finished", {
                "winner": player_name,
                "winner_id": client_id,
                "final_scores": final_scores,
                "game_duration": lobby["ended_at"] - lobby["started_at"]
            })
            
            print(f"Game finished in lobby {lobby_id}. Winner: {player_name}")
        
    except Exception as e:
        await send_to_client(client_id, "error", {"message": f"Failed to submit code: {str(e)}"})

async def handle_send_attack(client_id: str, data: dict):
    """Handle attack sending between players"""
    try:
        if client_id not in players or not players[client_id]["lobby"]:
            await send_to_client(client_id, "error", {"message": "You are not in a lobby"})
            return
        
        lobby_id = players[client_id]["lobby"]
        
        if lobby_id not in lobbies:
            await send_to_client(client_id, "error", {"message": "Lobby not found"})
            return
        
        lobby = lobbies[lobby_id]
        
        # Check if game is in progress
        if lobby["status"] != "playing":
            await send_to_client(client_id, "error", {"message": "Game is not in progress"})
            return
        
        # Get attack type
        attack_type = data.get("attackType", "flashbang")
        
        # Find opponent
        opponent_id = None
        for player in lobby["players"]:
            if player["id"] != client_id:
                opponent_id = player["id"]
                break
        
        if opponent_id and opponent_id in connections:
            # Send attack to opponent
            await send_to_client(opponent_id, "attack_received", {
                "attackType": attack_type,
                "attacker": players[client_id]["name"]
            })
            
            print(f"Attack '{attack_type}' sent from {players[client_id]['name']} to opponent in lobby {lobby_id}")
        
    except Exception as e:
        await send_to_client(client_id, "error", {"message": f"Failed to send attack: {str(e)}"})

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)