import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# import numpy as np
import pandas as pd
import pickle

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model and Columns
model_path = os.path.join('Model', 'model.pkl')
dataset_path = os.path.join('Model', 'dataset.csv')
with open(model_path, 'rb') as f:
    model = pickle.load(f)

def load_expected_columns(dataset_path):
    df = pd.read_csv(dataset_path)
    return list(df.columns)


class ClimateInput(BaseModel):
    Crop: str
    Crop_Year: int
    Season: str
    Area: float
    Annual_Rainfall: float
    Fertilizer: float
    Pesticide: float

# Transform a single crop_yield-style row into the full dataset format
def transform_user_input(row, expected_columns):
    columns = ['Crop', 'Crop_Year', 'Season', 'Area',
               'Annual_Rainfall', 'Fertilizer', 'Pesticide']

    if not isinstance(row, list) or len(row) != len(columns):
        raise ValueError("Row must match the expected format of crop_yield.")

    # Create DataFrame from single row
    df = pd.DataFrame([row], columns=columns)

    # Select relevant features
    features = df[['Crop_Year', 'Annual_Rainfall', 'Fertilizer', 'Pesticide', 'Crop']]

    # One-hot encode
    crop_dummies = pd.get_dummies(features['Crop'], prefix='Crop')
    # state_dummies = pd.get_dummies(features['State'], prefix='State')

    transformed = pd.concat([
        features[['Crop_Year', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']],
        crop_dummies,
        # state_dummies
    ], axis=1)

    # Add any missing columns and set them to 0
    for col in expected_columns:
        if col not in transformed.columns:
            transformed[col] = 0

    # Reorder to match expected column order
    transformed = transformed[expected_columns]

    return transformed

@app.post("/predict")
def predict(input_data: ClimateInput):
    try:
        user_input = [
            input_data.Crop,
            input_data.Crop_Year,   
            input_data.Season,
            input_data.Area,
            input_data.Annual_Rainfall,
            input_data.Fertilizer,
            input_data.Pesticide,
        ]
        expected_columns=load_expected_columns(dataset_path)
        transformed_input = transform_user_input(user_input, expected_columns)
        prediction = model.predict(transformed_input)

        return {"predicted_yield": float(prediction[0])}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
