
# backend/app/routers/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from typing import Any
import json
from ..services.ws_manager import WSManager
from ..services.room_service import get_room, update_code
from ..database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from ..config import settings
import asyncio
import logging

# router = APIRouter()
# ws_manager = WSManager()
# logger = logging.getLogger(__name__)



# @router.websocket("/ws/{room_id}")
# async def websocket_endpoint(websocket: WebSocket, room_id: str, db=Depends(get_db)):
#     await ws_manager.connect(room_id, websocket)

#     # Load initial code state
#     room = await get_room(db, room_id)
#     initial_code = room.code_state if room else ""

#     await websocket.send_json({
#         "type": "initial_state",
#         "payload": {"code": initial_code}
#     })

#     try:
#         while True:
#             data = await websocket.receive_text()
#             message = json.loads(data)

#             if message["type"] == "code_update":
#                 code = message["payload"]["code"]

#                 # Save to DB
#                 await update_code(db, room_id, code)

#                 # Broadcast to other users
#                 await ws_manager.broadcast(
#                     room_id,
#                     json.dumps({
#                         "type": "code_update",
#                         "payload": {"code": code}
#                     }),
#                     sender=websocket
#                 )

#     except WebSocketDisconnect:
#         await ws_manager.disconnect(room_id, websocket)

# backend/app/routers/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from ..database import SessionLocal  # <-- we will use this
from ..services.ws_manager import WSManager
from ..services.room_service import get_room, update_code

router = APIRouter()
ws_manager = WSManager()
logger = logging.getLogger(__name__)


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """Main WebSocket endpoint used by frontend."""
    
    # 1️⃣ Accept and register connection
    await ws_manager.connect(room_id, websocket)

    # 2️⃣ Create DB session manually (Fix for issue!)
    async with SessionLocal() as db:  # THIS FIXES THE WEBSOCKET CLOSING
        # 3️⃣ Load initial code from DB
        room = await get_room(db, room_id)
        initial_code = room.code_state if room else ""

        # Send initial code to frontend
        await websocket.send_json({
            "type": "initial_state",
            "payload": {"code": initial_code}
        })

        try:
            # 4️⃣ WebSocket loop (always running)
            while True:
                data = await websocket.receive_text()
                message = json.loads(data)

                # Handle code events
                if message["type"] == "code_update":
                    code = message["payload"]["code"]

                    # ⚡ Save latest code in DB
                    await update_code(db, room_id, code)
                    await db.commit()

                    # ⚡ Send update to other users in the room
                    await ws_manager.broadcast(
                        room_id,
                        {
                            "type": "code_update",
                            "payload": {"code": code}
                        },
                        sender=websocket
                    )

        except WebSocketDisconnect:
            # 5️⃣ Cleanup on disconnect
            await ws_manager.disconnect(room_id, websocket)
            logger.info(f"WebSocket disconnected room={room_id}")
