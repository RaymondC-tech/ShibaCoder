# ShibaCoder

Real-time 1v1 competitive programming battles with adorable Shiba Inu mascot.

## Project Structure

```
shibacoder/
├── frontend/          # React + Vite frontend
├── backend/           # FastAPI backend
├── pitch-deck/        # Presentation materials
└── SHIBACODER_MVP.md  # Development blueprint
```

## Quick Start

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

### Backend (FastAPI)

```bash
cd backend
pip install fastapi uvicorn python-socketio
uvicorn main:app --reload --port 8000
```

Backend will run on http://localhost:8000

## Tech Stack

### Frontend
- **React** (via Vite for fast HMR)
- **Socket.IO Client** for real-time communication
- **Monaco Editor** for code editing
- **CSS Modules** for styling

### Backend
- **FastAPI** for REST API and WebSocket support
- **Python-SocketIO** for real-time events

## Core Features

- Real-time 1v1 coding battles
- Live opponent progress tracking
- Monaco code editor with syntax highlighting
- Test case visualization
- Simple room-based matchmaking
