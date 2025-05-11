# api/__init__.py
from fastapi import APIRouter
from api.endpoints import crops,modelPredict
api_router = APIRouter()
# Include all endpoint routers
# api_router.include_router(health.router)
api_router.include_router(crops.router)
api_router.include_router(modelPredict.router)