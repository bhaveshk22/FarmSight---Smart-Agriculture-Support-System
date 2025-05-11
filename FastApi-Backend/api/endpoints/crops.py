from fastapi import APIRouter, status, HTTPException, Query
import logging
from typing import Optional, List
from bson.errors import InvalidId
from models.schemas import (
    CropCreateRequest, CropResponse, CropsListResponse, SuccessResponse
)
from models.database import CropModel, CropUpdateModel
from core.db.mongo import (
    get_all_crops, get_crop_by_id, get_crop_by_name,
    create_crop, update_crop, delete_crop
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/crops", tags=["Crops"])

@router.get("/list", status_code=status.HTTP_200_OK, response_model=CropsListResponse)
async def list_crops_endpoint(
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(100, description="Maximum number of records to return"),
    tag: Optional[str] = Query(None, description="Filter crops by tag")
):
    """
    List stored crops from the database.
    """
    try:
        crops = await get_all_crops(skip=skip, limit=limit, tag_filter=tag)

        return {
            "status": "success",
            "crops": [
                {
                    "id": str(crop["_id"]),
                    "crop_name": crop["crop_name"],
                    "crop_year": crop["crop_year"],
                    "season": crop["season"],
                    "area": crop["area"],
                    "annual_rainfall": crop["annual_rainfall"],
                    "fertilizer": crop["fertilizer"],
                    "pesticide": crop["pesticide"],
                    "predicted_yield": crop.get("predicted_yield"),
                    "created_at": crop["created_at"].isoformat(),
                    "updated_at": crop.get("updated_at", "").isoformat() if crop.get("updated_at") else None,
                    "tags": crop.get("tags", [])
                }
                for crop in crops
            ],
            "count": len(crops)
        }
    except Exception as e:
        logger.error(f"Error in list_crops endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list crops: {str(e)}"
        )

@router.get("/{crop_id}", status_code=status.HTTP_200_OK, response_model=CropResponse)
async def get_crop_endpoint(crop_id: str):
    """
    Get a single crop record by ID.
    """
    try:
        crop = await get_crop_by_id(crop_id)
        if not crop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crop with ID {crop_id} not found"
            )

        return {
            "status": "success",
            "id": str(crop["_id"]),
            "crop_name": crop["crop_name"],
            "crop_year": crop["crop_year"],
            "season": crop["season"],
            "area": crop["area"],
            "annual_rainfall": crop["annual_rainfall"],
            "fertilizer": crop["fertilizer"],
            "pesticide": crop["pesticide"],
            "predicted_yield": crop.get("predicted_yield"),
            "created_at": crop["created_at"].isoformat(),
            "updated_at": crop.get("updated_at", "").isoformat() if crop.get("updated_at") else None,
            "tags": crop.get("tags", [])
        }
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Crop ID format: {crop_id}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_crop endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get crop: {str(e)}"
        )

@router.post("", status_code=status.HTTP_201_CREATED, response_model=CropResponse)
async def create_crop_endpoint(request: CropCreateRequest):
    """
    Create a new crop record.
    """
    try:
        existing_crop = await get_crop_by_name(request.crop_name)
        if existing_crop:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Crop with name '{request.crop_name}' already exists"
            )

        crop_model = CropModel(
            crop_name=request.crop_name,
            crop_year=request.crop_year,
            season=request.season,
            area=request.area,
            annual_rainfall=request.annual_rainfall,
            fertilizer=request.fertilizer,
            pesticide=request.pesticide,
            tags=request.tags or []
        )

        created_crop = await create_crop(crop_model)
        if not created_crop:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create crop record"
            )

        return {
            "status": "success",
            "id": str(created_crop["_id"]),
            "crop_name": created_crop["crop_name"],
            "crop_year": created_crop["crop_year"],
            "season": created_crop["season"],
            "area": created_crop["area"],
            "annual_rainfall": created_crop["annual_rainfall"],
            "fertilizer": created_crop["fertilizer"],
            "pesticide": created_crop["pesticide"],
            "created_at": created_crop["created_at"].isoformat(),
            "updated_at": created_crop.get("updated_at", "").isoformat() if created_crop.get("updated_at") else None,
            "tags": created_crop.get("tags", [])
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_crop endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create crop: {str(e)}"
        )

@router.put("/{crop_id}", status_code=status.HTTP_200_OK, response_model=CropResponse)
async def update_crop_endpoint(crop_id: str, request: CropUpdateModel):
    """
    Update an existing crop record.
    """
    try:
        existing_crop = await get_crop_by_id(crop_id)
        if not existing_crop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crop with ID {crop_id} not found"
            )

        updated_crop = await update_crop(crop_id, request)
        if not updated_crop:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update crop record"
            )

        return {
            "status": "success",
            "id": str(updated_crop["_id"]),
            "crop_name": updated_crop["crop_name"],
            "crop_year": updated_crop["crop_year"],
            "season": updated_crop["season"],
            "area": updated_crop["area"],
            "annual_rainfall": updated_crop["annual_rainfall"],
            "fertilizer": updated_crop["fertilizer"],
            "pesticide": updated_crop["pesticide"],
            "predicted_yield": updated_crop.get("predicted_yield"),
            "created_at": updated_crop["created_at"].isoformat(),
            "updated_at": updated_crop.get("updated_at", "").isoformat() if updated_crop.get("updated_at") else None,
            "tags": updated_crop.get("tags", [])
        }
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Crop ID format: {crop_id}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_crop endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update crop: {str(e)}"
        )

@router.delete("/{crop_id}", status_code=status.HTTP_200_OK, response_model=SuccessResponse)
async def delete_crop_endpoint(crop_id: str):
    """
    Delete a crop record.
    """
    try:
        existing_crop = await get_crop_by_id(crop_id)
        if not existing_crop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crop with ID {crop_id} not found"
            )

        success = await delete_crop(crop_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete crop record"
            )

        return {
            "status": "success",
            "message": f"Crop with ID {crop_id} successfully deleted"
        }
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Crop ID format: {crop_id}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_crop endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete crop: {str(e)}"
        )
