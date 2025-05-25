from pydantic import BaseModel, Field
from pydantic import GetCoreSchemaHandler, GetJsonSchemaHandler
from pydantic_core import core_schema
from typing import Any, List, Optional, Dict
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler: GetCoreSchemaHandler) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.is_instance_schema(cls),
            serialization=core_schema.to_string_ser_schema()
        )

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler) -> dict:
        json_schema = handler(core_schema)
        json_schema.update(type="string")
        return json_schema


class CropModel(BaseModel):
    """Model for storing crop prediction input and result."""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    crop_name: str = Field(..., description="Crop type, e.g., Rice")
    crop_year: int = Field(..., description="Year of cultivation")
    season: str = Field(..., description="Season of cropping")
    soil_type: str = Field(..., description="Type of the soil")
    area: float = Field(..., description="Cultivated area in hectares")
    annual_rainfall: float = Field(..., description="Annual rainfall in mm")
    fertilizer_n: float = Field(..., description="Fertilizer (N) used (kg/ha)")
    fertilizer_p: float = Field(..., description="Fertilizer (P) used (kg/ha)")
    fertilizer_k: float = Field(..., description="Fertilizer (K) used (kg/ha)")
    pesticide: float = Field(..., description="Pesticide used in kg/ha")
    predicted_yield: Optional[float] = Field(None, description="Model-predicted crop yield")
    tags: List[str] = Field(default_factory=list, description="Optional tags (e.g., region, priority)")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class CropUpdateModel(BaseModel):
    """Model for updating crop record fields."""
    crop_name: Optional[str] = None
    crop_year: Optional[int] = None
    season: Optional[str] = None
    soil_type: Optional[str] = None
    area: Optional[float] = None
    annual_rainfall: Optional[float] = None
    fertilizer_n: Optional[float] = None
    fertilizer_p: Optional[float] = None
    fertilizer_k: Optional[float] = None
    pesticide: Optional[float] = None
    predicted_yield: Optional[float] = None
    tags: Optional[List[str]] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
