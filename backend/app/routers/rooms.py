# backend/app/routers/rooms.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..schemas import RoomCreateResponse, RoomRead
from ..services.room_service import create_room, get_room

router = APIRouter()

@router.post("/rooms", response_model=RoomCreateResponse)
async def create_room_api(db: AsyncSession = Depends(get_db)):
    room_id = await create_room(db)
    return {"roomId": room_id}

@router.get("/rooms/{room_id}", response_model=RoomRead)
async def read_room(room_id: str, db: AsyncSession = Depends(get_db)):
    room = await get_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"roomId": str(room.room_id), "code_state": room.code_state}
