"use client";

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis, LabelList
} from 'recharts';
import Papa from 'papaparse';
import _ from 'lodash';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react';
import { predictYield } from '@/utils/api';

// Define TypeScript interfaces for our data based on the API schema
interface Crop {
  id: string;
  crop_name: string;
  crop_year: number;
  season: string;
  area: number;
  annual_rainfall: number;
  fertilizer: number;
  pesticide: number;
  predicted_yield: number | null;
  created_at: string;
  updated_at: string | null;
  tags: string[];
  status?: string;
  message?: string | null;
}

interface CropsListResponse {
  status: string;
  message: string | null;
  crops: Crop[];
  count: number;
}

interface CropPredictionRequest {
  crop_id: string;
}

interface CropCreateRequest {
  crop_name: string;
  crop_year: number;
  season: string;
  area: number;
  annual_rainfall: number;
  fertilizer: number;
  pesticide: number;
  tags?: string[] | null;
}

// Define the base API URL
const API_BASE_URL = 'http://localhost:8000/api';

// Process the data for visualization
const processData = (data: CropsListResponse) => {
  const crops = data.crops;

  // Process data for Pie Chart - Crop distribution
  const cropDistribution = _.chain(crops)
    .groupBy('crop_name')
    .map((group, name) => ({
      name,
      value: group.length
    }))
    .value();

  // Process data for Bar Chart - Yield comparison (where predicted_yield exists)
  const yieldComparison = crops.filter(crop => crop.predicted_yield !== null)
    .map(crop => ({
      id: crop.id.substring(0, 6),
      crop_name: crop.crop_name,
      predicted_yield: crop.predicted_yield != null ? parseFloat((crop.predicted_yield * 1000).toFixed(3)) : null,
      rainfall: crop.annual_rainfall,
      pesticide: crop.pesticide
    }));

  // Process data for Line Chart - Rainfall and Fertilizer by Year
  const rainfallByYear = _.chain(crops)
    .groupBy('crop_year')
    .map((group, year) => ({
      year: parseInt(year),
      rainfall: _.meanBy(group, 'annual_rainfall'),
      fertilizer: _.meanBy(group, 'fertilizer') / 1000, // Scale down for visualization
      pesticide: _.meanBy(group, 'pesticide')
    }))
    .sortBy('year')
    .value();

  // Process data for Scatter Chart - Correlation between factors
  const correlationData = crops.map(crop => ({
    x: crop.annual_rainfall,
    y: crop.pesticide,
    z: crop.predicted_yield || 0,
    name: crop.crop_name
  }));

  return {
    cropDistribution,
    yieldComparison,
    rainfallByYear,
    correlationData
  };
};

// Define colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Initial empty state for data
const emptyData: CropsListResponse = {
  status: "success",
  message: null,
  crops: [],
  count: 0
};

export default function CropDataDashboard() {
  const [data, setData] = useState<CropsListResponse>(emptyData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [chartType, setChartType] = useState<string>('distribution');
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  // Fetch data from API
  const fetchCrops = async () => {
    setLoading(true);
    try {
      // Use the correct endpoint from the API documentation
      const response = await fetch(`${API_BASE_URL}/crops/list`);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const fetchedData = await response.json();
      console.log("Fetched data:", fetchedData); // Debug logging
      setData(fetchedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  const handleEdit = (cropId: string) => {
    router.push(`/crops/addnewcrop?id=${cropId}`);
  };

  // Initial data fetch
  useEffect(() => {
    fetchCrops();
  }, []);

  // Process the data
  const processedData = processData(data);

  // Handler for file uploads (CSV import)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileData(text);

        // Parse CSV
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: async (results) => {
            console.log('Parsed CSV:', results);

            // Map CSV to your database structure and create crop entries one by one
            try {
              const crops = results.data as any[];

              for (const cropData of crops) {
                // Map to the correct structure based on API schema
                const cropRequest: CropCreateRequest = {
                  crop_name: cropData.crop_name,
                  crop_year: parseInt(cropData.crop_year),
                  season: cropData.season,
                  area: parseFloat(cropData.area),
                  annual_rainfall: parseFloat(cropData.annual_rainfall),
                  fertilizer: parseFloat(cropData.fertilizer),
                  pesticide: parseFloat(cropData.pesticide),
                  tags: cropData.tags ? cropData.tags.split(',').map((tag: string) => tag.trim()) : []
                };

                // Create each crop using the proper endpoint
                const response = await fetch(`${API_BASE_URL}/crops, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(cropRequest),
                }`);

                if (!response.ok) {
                  throw new Error(`Failed to import crop: ${cropData.crop_name}`);
                }
              }

              // Refresh data after import
              await fetchCrops();

              alert('Data imported successfully');
            } catch (err) {
              console.error('Error importing data:', err);
              alert('Failed to import data');
            }
          }
        });
      };
      reader.readAsText(file);
    }
  };

  // Export data to CSV
  const exportToCsv = () => {
    const csvData = Papa.unparse(data.crops);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'crop_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete a crop
  const deleteCrop = async (cropId: string) => {
    if (window.confirm('Are you sure you want to delete this crop record?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/crops/${cropId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete crop');
        }

        // Refresh data after deletion
        await fetchCrops();

      } catch (err) {
        console.error('Error deleting crop:', err);
        alert('Failed to delete crop');
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading crop data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-6 rounded-lg shadow-md">
          <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-xl font-bold mt-4 text-red-700">Error</h2>
          <p className="mt-2 text-gray-700">{error}</p>
          <button
            onClick={() => fetchCrops()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">FarmSight Crop Data Dashboard</h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Select Chart Type:</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="distribution">Crop Distribution</option>
            <option value="yield">Yield Comparison</option>
            <option value="rainfall">Rainfall & Inputs By Year</option>
            <option value="correlation">Factor Correlation</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={exportToCsv}
            variant="default"
            size="sm"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>

          <div className="flex flex-col">
            <label className="text-sm font-medium">Import CSV:</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="text-sm border rounded p-1"
            />
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-white p-4 rounded-lg shadow-md h-96">
        {data.crops.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No crop data available</p>
          </div>
        ) : (
          <>
            {chartType === 'distribution' && (
              <>
                <h2 className="text-lg font-semibold mb-4">Crop Distribution</h2>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={processedData.cropDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {processedData.cropDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}

            {chartType === 'yield' && (
              <>
                <h2 className="text-lg font-semibold mb-4">Yield Comparison</h2>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={processedData.yieldComparison}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="predicted_yield" name="Predicted Yield (kg)" fill="#8884d8" />
                    <Bar dataKey="rainfall" name="Rainfall (mm)" fill="#82ca9d" />
                    <Bar dataKey="pesticide" name="Pesticide" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}

            {chartType === 'rainfall' && (
              <>
                <h2 className="text-lg font-semibold mb-4">Rainfall & Inputs By Year</h2>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart
                    data={processedData.rainfallByYear}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rainfall" name="Annual Rainfall" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="fertilizer" name="Avg Fertilizer (÷1000)" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="pesticide" name="Avg Pesticide" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}

            {chartType === 'correlation' && (
              <>
                <h2 className="text-lg font-semibold mb-4">Factor Correlation</h2>
                <ResponsiveContainer width="100%" height="90%">
                  <ScatterChart
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Annual Rainfall"
                      unit="mm"
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Pesticide"
                      unit="units"
                    />
                    <ZAxis
                      type="number"
                      dataKey="z"
                      range={[60, 400]}
                      name="Yield"
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter
                      name="Crops"
                      data={processedData.correlationData}
                      fill="#8884d8"
                    >
                      <LabelList dataKey="name" position="top" />
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </>
            )}
          </>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-700">Total Crops</h3>
          <p className="text-2xl font-bold">{data.count}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-700">Crop Types</h3>
          <p className="text-2xl font-bold">{new Set(data.crops.map(c => c.crop_name)).size}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-700">Avg. Rainfall</h3>
          <p className="text-2xl font-bold">
            {data.crops.length ? (_.meanBy(data.crops, 'annual_rainfall')).toFixed(1) + ' mm' : 'N/A'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-700">Avg. Predicted Yield</h3>
          <p className="text-2xl font-bold">
            {data.crops.filter(c => c.predicted_yield !== null).length ?
              (_.meanBy(data.crops.filter(c => c.predicted_yield !== null), 'predicted_yield')).toFixed(2) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Filter by Crop Name */}
      <div className="mt-8">
        <div className="mb-4 flex gap-4 items-center">
          <h2 className="text-lg font-semibold">Crop Data</h2>
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium">Filter by Crop:</label>
            <select
              value={selectedCrop || ''}
              onChange={(e) => setSelectedCrop(e.target.value || null)}
              className="p-1 border rounded text-sm"
            >
              <option value="">All Crops</option>
              {Array.from(new Set(data.crops.map(c => c.crop_name))).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              const newCrop = window.prompt('Enter crop name to search:');
              if (newCrop) {
                fetch(`${API_BASE_URL} / crops / name / ${newCrop}`)
                  .then(response => {
                    if (response.ok) return response.json();
                    throw new Error('Crop not found');
                  })
                  .then(crops => {
                    if (crops.length > 0) {
                      alert(`Found ${crops.length} entries for "${newCrop}"`);
                      setSelectedCrop(newCrop);
                    } else {
                      alert(`No crops found with name "${newCrop}"`);
                    }
                  })
                  .catch(err => {
                    console.error(err);
                    alert('Error searching for crop');
                  });
              }
            }}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
          >
            Search by Name
          </button>
        </div>

        <div className="overflow-x-auto h-[90vh] hide-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Season</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rainfall</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fertilizer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pesticide</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Yield (tonne)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.crops.length > 0 ? (
                data.crops
                  .filter(crop => !selectedCrop || crop.crop_name === selectedCrop)
                  .map((crop, index) => (
                    <tr key={crop.id}>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{index + 1}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{crop.crop_name}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{crop.crop_year}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{crop.season}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{crop.area}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{crop.annual_rainfall}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{crop.fertilizer}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">{crop.pesticide}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {crop.predicted_yield != null ? parseFloat((crop.predicted_yield).toFixed(3)) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { handleEdit(crop.id) }}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCrop(crop.id)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-gray-500">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div >
    </div >
  );
}