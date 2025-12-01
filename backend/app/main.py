# import json
# from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
# from fastapi.middleware.cors import CORSMiddleware
# from .routers import rooms as rooms_router, autocomplete as ac_router
# from .services.ws_manager import WSManager
# from .database import engine, Base, get_db
# from sqlalchemy.ext.asyncio import AsyncSession
# from .services.room_service import get_room, update_code
# from app.routers import rooms, autocomplete, websocket
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from .routers import rooms as rooms_router, autocomplete as ac_router, websocket as ws_router
# from .database import engine, Base

# app = FastAPI(title="Collab Code Backend")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Include all routers
# app.include_router(rooms_router.router)
# app.include_router(ac_router.router)
# app.include_router(ws_router.router)

# @app.on_event("startup")
# async def on_startup():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)
# backend/app/main.py
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import rooms as rooms_router, autocomplete as ac_router, websocket as ws_router
from .database import engine, Base
from .config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("collab")

app = FastAPI(title="Collab Code Backend")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms_router.router)
app.include_router(ac_router.router)
app.include_router(ws_router.router)

@app.on_event("startup")
async def on_startup():
    logger.info("Creating DB tables if needed")
    async with engine.begin() as conn:
        # In production prefer alembic migrations instead of create_all
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Startup complete")
