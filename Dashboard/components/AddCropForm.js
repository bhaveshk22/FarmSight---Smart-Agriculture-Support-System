"use client";

import React, { useState } from 'react';
import axios from 'axios';

const AddCropForm = () => {
  const [formData, setFormData] = useState({
    crop_name: '',
    crop_year: '',
    season: '',
    area: '',
    annual_rainfall: '',
    fertilizer: '',
    pesticide: '',
    tags: '',
  });

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cropId, setCropId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset prediction when form changes
    if (prediction) {
      setPrediction(null);
      setShowConfirmation(false);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const preparePayload = () => {
    return {
      ...formData,
      crop_year: parseInt(formData.crop_year),
      area: parseFloat(formData.area),
      annual_rainfall: parseFloat(formData.annual_rainfall),
      fertilizer: parseFloat(formData.fertilizer),
      pesticide: parseFloat(formData.pesticide),
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      // First, add the crop to get an ID
      const payload = preparePayload();
      const response = await axios.post('http://127.0.0.1:8000/api/crops', payload);
      
      // Store the crop ID for prediction
      const newCropId = response.data.id;
      setCropId(newCropId);
      
      // Now get prediction using the new crop ID
      const predictionResponse = await axios.post('http://127.0.0.1:8000/api/model/predict', {
        crop_id: newCropId
      });
      
      // Set prediction data
      setPrediction(predictionResponse.data);
      
      // Update the crop record with the predicted yield
      if (predictionResponse.data && predictionResponse.data.predicted_yield !== undefined) {
        await axios.put(`http://127.0.0.1:8000/api/crops/${newCropId}`, {
          predicted_yield: predictionResponse.data.predicted_yield
        });
      }
      
      setShowConfirmation(true);
      setStatus({ type: 'success', message: 'Crop added and yield predicted! Database updated with prediction.' });
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process crop data.';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      crop_name: '',
      crop_year: '',
      season: '', 
      area: '',
      annual_rainfall: '',
      fertilizer: '',
      pesticide: '',
      tags: '',
    });
    setPrediction(null);
    setShowConfirmation(false);
    setCropId(null);
  };

  const handleAddAnother = () => {
    resetForm();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10 border border-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">🌾 Add New Crop</h2>

      {status && (
        <div className={`mb-4 p-4 rounded-lg text-sm font-medium ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status.message}
        </div>
      )}

      {showConfirmation && prediction ? (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">Yield Prediction Results</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Crop</p>
                <p className="font-medium">{formData.crop_name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Year</p>
                <p className="font-medium">{formData.crop_year}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Season</p>
                <p className="font-medium">{formData.season}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Area</p>
                <p className="font-medium">{formData.area} ha</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-100 mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Predicted Yield</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {prediction.predicted_yield ? `${prediction.predicted_yield.toFixed(2)} tonnes` : 'Calculating...'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddAnother}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Add Another Crop
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'crop_name', label: 'Crop Name' },
            { name: 'crop_year', label: 'Crop Year', type: 'number' },
            { name: 'season', label: 'Season' },
            { name: 'area', label: 'Area (ha)', type: 'number' },
            { name: 'annual_rainfall', label: 'Annual Rainfall (mm)', type: 'number' },
            { name: 'fertilizer', label: 'Fertilizer (kg)', type: 'number' },
            { name: 'pesticide', label: 'Pesticide (kg)', type: 'number' },
            { name: 'tags', label: 'Tags (comma-separated)' },
          ].map(({ name, label, type = 'text' }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type={type}
                name={name}
                id={name}
                value={formData[name]}
                onChange={handleChange}
                required={name !== 'tags'}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}

          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition flex justify-center items-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Add Crop & Predict Yield'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddCropForm;