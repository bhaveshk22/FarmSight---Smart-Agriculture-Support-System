from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Base response model
class BaseResponse(BaseModel):
    """Base response model."""
    status: str

class SuccessResponse(BaseResponse):
    """Generic success response model."""
    status: str = "success"
    message: Optional[str] = None

class ErrorResponse(BaseResponse):
    """Error response model."""
    status: str = "error"
    detail: str

# Request model for creating a new crop
class CropCreateRequest(BaseModel):
    crop_name: str = Field(..., description="Name of the crop")
    crop_year: int = Field(..., description="Year of cultivation")
    season: str = Field(..., description="Season of cultivation")
    area: float = Field(..., description="Area in hectares")
    annual_rainfall: float = Field(..., description="Annual rainfall in mm")
    fertilizer: float = Field(..., description="Fertilizer used (kg/ha)")
    pesticide: float = Field(..., description="Pesticide used (kg/ha)")
    tags: Optional[List[str]] = Field(default_factory=list, description="Tags for filtering")

# Model for updating an existing crop (partial update)
class CropUpdateModel(BaseModel):
    crop_name: str = None
    crop_year: int = None
    season: str = None
    area: float = None
    annual_rainfall: float= None
    fertilizer: float = None
    pesticide: float = None
    predicted_yield:Optional[float]
    tags: Optional[List[str]] = None

# Response model for a single crop
class CropResponse(SuccessResponse):
    id: str
    crop_name: str
    crop_year: int
    season: str
    area: float
    annual_rainfall: float
    fertilizer: float
    pesticide: float
    predicted_yield: Optional[float] = None
    created_at: str
    updated_at: Optional[str] = None
    tags: List[str] = []

# Response model for listing multiple crops
class CropsListResponse(SuccessResponse):
    crops: List[CropResponse]
    count: int


class ClimateInput(BaseModel):
    Crop: str
    Crop_Year: int
    Season: str
    Area: float
    Annual_Rainfall: float
    Fertilizer: float
    Pesticide: float
#Crop Prediction Request
class CropPredictionRequest(BaseModel):
    crop_id: str  # ID of the crop in MongoDB