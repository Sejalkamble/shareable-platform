from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import Room
import uuid

async def create_room(db: AsyncSession) -> str:
    room = Room()
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return str(room.room_id)

async def get_room(db: AsyncSession, room_id: str):
    try:
        uid = uuid.UUID(room_id)
    except Exception:
        return None
    q = await db.execute(select(Room).where(Room.room_id == uid))
    room = q.scalars().first()
    return room

async def update_code(db: AsyncSession, room_id: str, code: str):
    room = await get_room(db, room_id)
    if not room:
        return None
    room.code_state = code
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room
