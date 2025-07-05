import socketio
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

@app.get("/")
def read_root():
    return {"message": "ShibaCoder API"}

# Basic Socket.IO event handlers
@sio.event
async def connect(sid, environ=None):
    print(f"Client {sid} connected")

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")

# Mount Socket.IO app
socket_app = socketio.ASGIApp(sio, app)