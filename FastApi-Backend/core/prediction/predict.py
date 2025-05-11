import pandas as pd

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
