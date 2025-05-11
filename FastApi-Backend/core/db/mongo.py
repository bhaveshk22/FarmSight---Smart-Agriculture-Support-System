import motor.motor_asyncio
from typing import List, Optional, Dict, Any
import logging
from bson import ObjectId
from datetime import datetime

from config import settings
from models.database import CropModel, CropUpdateModel  

logger = logging.getLogger(__name__)

MONGO_URI=settings.MONGODB_CONNECTION_STRING
# MongoDB setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client["FarmSight"]
crop_collection = db["crops"]  # collection renamed

async def get_all_crops(skip: int = 0, limit: int = 100, tag_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieve all crop prediction records.
    """
    filter_query = {}
    if tag_filter:
        filter_query["tags"] = tag_filter
    try:
        cursor = crop_collection.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        return [doc async for doc in cursor]
    except Exception as e:
        logger.error(f"Database query failed: {e}")
        return []

async def get_crop_by_id(crop_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a crop record by its MongoDB ID.
    """
    try:
        return await crop_collection.find_one({"_id": ObjectId(crop_id)})
    except Exception as e:
        logger.error(f"Error retrieving crop by ID: {e}")
        return None

async def get_crop_by_name(name: str) -> Optional[Dict[str, Any]]:
    """
    Get a crop record by name.
    """
    return await crop_collection.find_one({"name": name})

async def create_crop(crop_data: CropModel) -> Dict[str, Any]:
    """
    Create a new crop record.
    """
    crop_dict = {k: v for k, v in crop_data.dict(by_alias=True).items() if v is not None}
    crop_dict["created_at"] = datetime.utcnow()
    result = await crop_collection.insert_one(crop_dict)
    return await get_crop_by_id(result.inserted_id)


async def update_crop(crop_id: str, update_data: CropUpdateModel) -> Optional[Dict[str, Any]]:
    """
    Update an existing crop record.
    """
    try:
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()

        if update_dict:
            await crop_collection.update_one(
                {"_id": ObjectId(crop_id)},
                {"$set": update_dict}
            )
        return await get_crop_by_id(crop_id)
    except Exception as e:
        logger.error(f"Error updating crop: {e}")
        return None

async def delete_crop(crop_id: str) -> bool:
    """
    Delete a crop record.
    """
    try:
        result = await crop_collection.delete_one({"_id": ObjectId(crop_id)})
        return result.deleted_count > 0
    except Exception as e:
        logger.error(f"Error deleting crop: {e}")
        return False
