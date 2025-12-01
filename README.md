# shareable-platform
# Shareable Platform - Real-Time Code Collaboration

A real-time code collaboration platform built with FastAPI (backend) and React + Vite (frontend). Users can join rooms, edit code collaboratively, and see live updates.

---

## Table of Contents

- [Features](#features)  
- [Project Structure](#project-structure)  
- [Installation & Running](#installation--running)  
- [Architecture & Design Choices](#architecture--design-choices)  
- [Improvements](#improvements)  
- [Limitations](#limitations)  
- [Demo](#demo)

---

## Features


## Features

- Real-time collaborative code editing using **WebSockets**  
- Room-based collaboration with unique room IDs  
- Async FastAPI backend with **PostgreSQL** database  
- Frontend built with **React + Vite**  
- Monaco Editor integrated for rich code editing experience  
- Backend designed to support **RBAC and permissions**  

---

## Project Structure



---

## Installation & Running

### Backend

1. Create a virtual environment (if not already):

```bash
cd backend
python -m venv venv
venv\Scripts\activate  
pip install -r requirements.txt
uvicorn app.main:app --reload

http://127.0.0.1:8000
. if you can check on the api then use swagger
http://127.0.0.1:8000/docs  

if you can check websocket then go to https://websocketking.com/
example
Room id - e0550691-0a38-411a-946d-c46582709e0d
this url you can check 

STEP 1 — Open TWO WebSocketKing tabs

Open Tab 1 and Tab 2 with SAME URL:

ws://127.0.0.1:8000/ws/e0550691-0a38-411a-946d-c46582709e0d


Press Connect on both tabs.

You should see:

Connected
{
  "type": "initial_state",
  "payload": { "code": "" }
}


This means both users joined the same room.

🟩 STEP 2 — Send update from TAB 1

In Tab 1, send this message:

{
  "event": "update_code",
  "payload": {
    "code": "print('Hello from User 1')"
  }


Click Send.

🟧 STEP 3 — Check TAB 2 output

Now Tab 2 should automatically receive:

{
  "type": "code_update",
  "payload": {
    "code": "print('Hello from User 1')"
  }




If you see this → Broadcast working! 🎉
WebSocket endpoints are available for real-time code collaboration

FRONTEND
cd "E:/shareble platform/frontend"
npm install

npm run dev
http://localhost:5173


Architecture & Design Choices
FastAPI: Async framework for high-performance backend and WebSocket support.
WebSockets: Enables real-time code sync across multiple clients in a room.
PostgreSQL + SQLAlchemy (async): Stores user info, rooms, and code snapshots.
React + Vite: Fast frontend development with hot reload.
Monaco Editor: Provides IDE-like experience inside browser.
RBAC-ready: Backend structure supports roles and permissions for future enhancements.

Improvements (Future Work)

Implement authentication and JWT
Multi-file code support per room
Code execution sandbox for running code safely
Autosave, versioning, and history tracking for rooms
Deployment on cloud platforms: Render, Railway (backend) / Vercel, Netlify (frontend)
Optimized error handling and scalability

Optional Demo
Backend: http://127.0.0.1:8000/docs
Frontend: http://localhost:5173/