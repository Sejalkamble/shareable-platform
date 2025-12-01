from pydantic import BaseModel
from typing import Optional

class RoomCreateResponse(BaseModel):
    roomId: str

class RoomRead(BaseModel):
    roomId: str
    code_state: Optional[str] = ""

class AutoCompleteRequest(BaseModel):
    code: str
    cursorPosition: int
    language: str

class AutoCompleteResponse(BaseModel):
    suggestion: str
