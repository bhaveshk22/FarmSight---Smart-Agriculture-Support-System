'use client';

import { useEffect, useState } from 'react';
import { fetchCrops, predictYield } from '@/utils/api';

interface Crop {
  id: string;
  crop_name: string;
  crop_year: number;
  season: string;
  area: number;
  annual_rainfall: number;
  fertilizer: number;
  pesticide: number;
  predicted_yield?: number;
  created_at: string;
  updated_at?: string | null;
  tags: string[];
}

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const data = await fetchCrops()
      console.log(data, "data");
      setCrops(data.crops)
    })()

  }, []);

  const handlePredict = async (cropId: string) => {
    try {
      setLoadingId(cropId);
      const result = await predictYield(cropId);
      setPrediction(result.predicted_yield);
      setLoadingId(null);
    } catch (error) {
      console.error(error);
      alert('Prediction failed');
      setLoadingId(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🌾 Crop List & Yield Prediction</h1>
      {crops.map((crop) => (
        <div key={crop.id} className="border p-4 mb-4 rounded-xl shadow-md">
          <p><strong>Name:</strong> {crop.crop_name}</p>
          <p><strong>Season:</strong> {crop.season}</p>
          <p><strong>Area:</strong> {crop.area} ha</p>
          <p><strong>Fertilizer:</strong> {crop.fertilizer}</p>
          <p><strong>Pesticide:</strong> {crop.pesticide}</p>
          <button
            onClick={() => handlePredict(crop.id)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 mt-3 rounded"
          >
            {loadingId === crop.id ? 'Predicting...' : 'Predict Yield'}
          </button>
        </div>
      ))}

      {prediction !== null && (
        <div className="mt-6 text-lg text-blue-700 font-semibold">
          📈 Predicted Yield: <span className="text-black">{prediction.toFixed(2)} tons/ha</span>
        </div>
      )}
    </div>
  );
}
