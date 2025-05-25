import pandas as pd

# Transform a single crop_yield-style row into the full dataset format
import pandas as pd

def transform_user_input(row, expected_columns):

    # Check correct input format
    if not isinstance(row, list) or len(row) != 10:
        raise ValueError("Row must contain exactly 10 elements: "
                         "[Crop, Crop_Year, Season, soil_type, Area, Annual_Rainfall, "
                         "fertilizer_n, fertilizer_p, fertilizer_k, Pesticide]")

    # Unpack values
    crop, crop_year, season, soil_type, area, rainfall, fert_n, fert_p, fert_k, pesticide = row

    # Combine fertilizers
    total_fertilizer = fert_n + fert_p + fert_k

    # Create simplified row (excluding soil_type and separate fertilizers)
    transformed_row = [crop, crop_year, season, area, rainfall, total_fertilizer, pesticide]

    # Column names for simplified row
    columns = ['Crop', 'Crop_Year', 'Season', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']

    # Create DataFrame
    df = pd.DataFrame([transformed_row], columns=columns)

    # Select relevant features
    features = df[['Crop_Year', 'Annual_Rainfall', 'Fertilizer', 'Pesticide', 'Crop']]

    # One-hot encode Crop
    crop_dummies = pd.get_dummies(features['Crop'], prefix='Crop')

    # Concatenate final DataFrame
    transformed = pd.concat([
        features[['Crop_Year', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']],
        crop_dummies
    ], axis=1)

    # Add any missing columns and set them to 0
    for col in expected_columns:
        if col not in transformed.columns:
            transformed[col] = 0

    # Reorder to match expected column order
    transformed = transformed[expected_columns]

    return transformed

