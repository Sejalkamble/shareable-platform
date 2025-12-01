
from typing import Dict, List
from fastapi import WebSocket
import asyncio
import json
import logging

logger = logging.getLogger(__name__)

class WSManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            conns = self.rooms.get(room_id)
            if conns is None:
                self.rooms[room_id] = [websocket]
            else:
                conns.append(websocket)
            logger.info("Connected websocket. room=%s clients=%d", room_id, len(self.rooms[room_id]))

    async def disconnect(self, room_id: str, websocket: WebSocket):
        async with self._lock:
            conns = self.rooms.get(room_id, [])
            if websocket in conns:
                conns.remove(websocket)
            if not conns:
                self.rooms.pop(room_id, None)
            logger.info("Disconnected websocket. room=%s remaining=%d", room_id, len(self.rooms.get(room_id, [])))

    async def broadcast(self, room_id: str, message: dict, sender: WebSocket = None):
        conns = self.rooms.get(room_id, [])
        encoded = json.dumps(message)

        for ws in list(conns):
            if sender is not None and ws == sender:
                continue
            try:
                await ws.send_text(encoded)
            except Exception:
                pass
