from fastapi import APIRouter, HTTPException
from bson import ObjectId
from core.db.mongo import get_crop_by_id  # import your async helper
from models.schemas import CropPredictionRequest
from core.prediction.predict import transform_user_input
import pickle
import pandas as pd

router = APIRouter(prefix="/api/model", tags=["Model"])

# Load model and dataset
model_path = r"C:\Z Local Disk (D)\\Final year project\\FarmSight---Smart-Agriculture-Support-System\\Model\\model.pkl"
dataset_path = r"C:\Z Local Disk (D)\\Final year project\\FarmSight---Smart-Agriculture-Support-System\\Model\\dataset.csv"

with open(model_path, 'rb') as f:
    model = pickle.load(f)

def load_expected_columns(path: str):
    df = pd.read_csv(path)
    return list(df.columns)

@router.post("/predict")
async def predict(request: CropPredictionRequest):  # ✅ async def
    try:
        # ✅ Use your helper function that uses `motor`
        crop_data = await get_crop_by_id(request.crop_id)
        if not crop_data:
            raise HTTPException(status_code=404, detail="Crop not found in the database")

        user_input = [
            crop_data["crop_name"],
            crop_data["crop_year"],
            crop_data["season"],
            crop_data["area"],
            crop_data["annual_rainfall"],
            crop_data["fertilizer"],
            crop_data["pesticide"]
        ]

        expected_columns = load_expected_columns(dataset_path)
        transformed_input = transform_user_input(user_input, expected_columns)
        prediction = model.predict(transformed_input)

        return {"predicted_yield": float(prediction[0])}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
