from sqlalchemy import Column, Text
from sqlalchemy.dialects.postgresql import UUID
from .database import Base
import uuid

class Room(Base):
    __tablename__ = "rooms"

    room_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4 )
    code_state = Column(Text, default="")
