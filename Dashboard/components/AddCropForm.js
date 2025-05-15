
"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
// Import weather utility functions
import { fetchAnnualRainfall } from '@/lib/weatherService';

const AddCropForm = () => {
  const currentYear = 2025; // Default to current year
  const [formData, setFormData] = useState({
    crop_name: '',
    crop_year: currentYear.toString(),
    season: '',
    area: '',
    annual_rainfall: '',
    fertilizer: '',
    pesticide: '',
    tags: '',
    location: '',
    lat: null,
    lon: null,
  });

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cropId, setCropId] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [rainfallLoading, setRainfallLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const cropId = searchParams.get('id');
    if (cropId) {
      // Fetch existing crop data by ID from backend
      fetchCropData(cropId);
    }
  }, []);

  const fetchCropData = async (cropId) => {
    setLoading(true);
    setStatus(null);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/crops/${cropId}`);
      const crop = response.data;

      // Set form with fetched data, adapt keys if needed
      setFormData({
        crop_name: crop.crop_name || '',
        crop_year: crop.crop_year ? crop.crop_year.toString() : currentYear.toString(),
        season: crop.season || '',
        area: crop.area || '',
        annual_rainfall: crop.annual_rainfall || '',
        fertilizer: crop.fertilizer || '',
        pesticide: crop.pesticide || '',
        tags: crop.tags ? crop.tags.join(', ') : '',
        location: crop.location || '',
        lat: crop.coordinates?.lat || null,
        lon: crop.coordinates?.lon || null,
      });

      setCropId(cropId); // set current cropId in state (optional)
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to load crop data for editing.' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };



  // Generate years for dropdown (current year + 5 future years)
  const yearOptions = [];
  for (let i = 0; i <= 5; i++) {
    yearOptions.push(currentYear + i);
  }

  useEffect(() => {
    // Auto-detect user's location if they allow it
    if ("geolocation" in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          getCurrentLocation();
        }
      });
    }
  }, []);

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocode to get location name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          // Extract location name (city + country)
          const locationName = data.address ?
            `${data.address.city || data.address.town || data.address.village || data.address.hamlet || ''}, ${data.address.country || ''}` :
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          setFormData(prev => ({
            ...prev,
            location: locationName,
            lat: latitude,
            lon: longitude
          }));

          // Fetch rainfall data based on coordinates
          fetchRainfallData(latitude, longitude);
        } catch (error) {
          console.error("Error getting location details:", error);
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLoadingLocation(false);
      }
    );
  };

  const fetchRainfallData = async (lat, lon) => {
    setRainfallLoading(true);
    try {
      const rainfallValue = await fetchAnnualRainfall(lat, lon);
      setFormData(prev => ({
        ...prev,
        annual_rainfall: rainfallValue.toFixed(2)
      }));
    } catch (error) {
      console.error("Error fetching rainfall data:", error);
    } finally {
      setRainfallLoading(false);
    }
  };

  const handleLocationSearch = async () => {
    if (!formData.location) return;

    setLoadingLocation(true);
    try {
      // Geocode the location name to get coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(lat),
          lon: parseFloat(lon)
        }));

        // Fetch rainfall data for the location
        fetchRainfallData(lat, lon);
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
    } finally {
      setLoadingLocation(false);
    }
  };

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
      location: formData.location,
      coordinates: formData.lat && formData.lon ? { lat: formData.lat, lon: formData.lon } : null
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const payload = preparePayload();

      let response;
      if (cropId) {
        // Update existing crop
        response = await axios.put(`http://127.0.0.1:8000/api/crops/${cropId}`, payload);
      } else {
        // Add new crop
        response = await axios.post('http://127.0.0.1:8000/api/crops', payload);
        setCropId(response.data.id);
      }

      // Now predict yield for the crop (use existing cropId or new one)
      const idForPrediction = cropId || response.data.id;
      const predictionResponse = await axios.post('http://127.0.0.1:8000/api/model/predict', {
        crop_id: idForPrediction,
      });

      setPrediction(predictionResponse.data);

      // Update crop with predicted yield
      if (predictionResponse.data && predictionResponse.data.predicted_yield !== undefined) {
        await axios.put(`http://127.0.0.1:8000/api/crops/${idForPrediction}`, {
          predicted_yield: predictionResponse.data.predicted_yield,
        });
      }

      setShowConfirmation(true);
      setStatus({ type: 'success', message: cropId ? 'Crop updated and yield predicted!' : 'Crop added and yield predicted! Database updated with prediction.' });
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
      crop_year: currentYear.toString(),
      season: '',
      area: '',
      annual_rainfall: '',
      fertilizer: '',
      pesticide: '',
      tags: '',
      location: '',
      lat: null,
      lon: null,
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">🌾 Add New Crop</h2>
        <Link href="/" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Return to Homepage
        </Link>
      </div>

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

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 text-sm">Location</p>
                <p className="font-medium">{formData.location || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Annual Rainfall</p>
                <p className="font-medium">{formData.annual_rainfall} mm</p>
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
          {/* Location section */}
          <div className="col-span-1 md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100 mb-2">
            <h3 className="text-lg font-medium text-blue-800 mb-5 h-6">📍 Location Information</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-grow">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-none flex gap-2">
                <button
                  type="button"
                  onClick={handleLocationSearch}
                  disabled={loadingLocation || !formData.location}
                  className=" mt-6 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition disabled:bg-blue-300"
                >
                  {loadingLocation ? 'Searching...' : 'Search'}
                </button>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                  className=" mt-6 bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {loadingLocation ? 'Detecting...' : 'Use Current'}
                </button>
              </div>
            </div>
            {formData.lat && formData.lon && (
              <p className="text-sm text-blue-600 mt-2">
                Coordinates: {formData.lat.toFixed(4)}, {formData.lon.toFixed(4)}
              </p>
            )}
          </div>

          {/* Main form fields */}
          <div>
            <label htmlFor="crop_name" className="block text-sm font-medium text-gray-700 mb-1">
              Crop Name
            </label>
            <input
              type="text"
              name="crop_name"
              id="crop_name"
              value={formData.crop_name}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="crop_year" className="block text-sm font-medium text-gray-700 mb-1">
              Crop Year
            </label>
            <select
              name="crop_year"
              id="crop_year"
              value={formData.crop_year}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
              Season
            </label>
            <select
              name="season"
              id="season"
              value={formData.season}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Season</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
              <option value="Rainy">Rainy</option>
              <option value="Dry">Dry</option>
            </select>
          </div>

          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
              Area (ha)
            </label>
            <input
              type="number"
              name="area"
              id="area"
              value={formData.area}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="annual_rainfall" className="block text-sm font-medium text-gray-700 mb-1">
              Annual Rainfall (mm)
            </label>
            <div className="relative">
              <input
                type="number"
                name="annual_rainfall"
                id="annual_rainfall"
                value={formData.annual_rainfall}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {rainfallLoading && (
                <div className="absolute right-3 top-2">
                  <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
              )}
            </div>
            {formData.lat && formData.lon && (
              <p className="text-xs text-gray-500 mt-1">Automatically fetched based on location</p>
            )}
          </div>

          <div>
            <label htmlFor="fertilizer" className="block text-sm font-medium text-gray-700 mb-1">
              Fertilizer (kg)
            </label>
            <input
              type="number"
              name="fertilizer"
              id="fertilizer"
              value={formData.fertilizer}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="pesticide" className="block text-sm font-medium text-gray-700 mb-1">
              Pesticide (kg)
            </label>
            <input
              type="number"
              name="pesticide"
              id="pesticide"
              value={formData.pesticide}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              id="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="organic, irrigated, etc."
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition flex justify-center items-center"
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
                'Predict Yield'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddCropForm;