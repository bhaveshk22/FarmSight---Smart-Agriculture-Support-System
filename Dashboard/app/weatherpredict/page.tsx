"use client"

import { useState, useEffect, JSX } from 'react';
import { Search, Loader, MapPin, Droplets, Wind, Thermometer, Cloud, Sun, CloudRain, X } from 'lucide-react';

// Define TypeScript interfaces for our data structures
interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  iconCode: number | null;
  date: Date;
}

interface WeatherAPIResponse {
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
  }>;
  name: string;
  sys: {
    country?: string;
  };
}

// WeatherPopup component that can be integrated into any main window
const WeatherPopupDemo: React.FC = () => {
  // State to control popup visibility
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  // Toggle popup visibility
  const togglePopup = (): void => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Main Application</h1>
      
      {/* Example content */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Application Content</h2>
        <p className="text-gray-600 mb-4">
          This is where your main application content would go. The weather popup can be triggered 
          from anywhere in your application.
        </p>
        
        {/* Button to trigger weather popup */}
        <button 
          onClick={togglePopup}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center"
        >
          <Sun size={16} className="mr-2" />
          Open Weather Widget
        </button>
      </div>
      
      {/* Weather Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative max-w-md w-full mx-4 bg-white rounded-lg shadow-xl">
            {/* Close button */}
            <button 
              onClick={togglePopup}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 z-10"
            >
              <X size={20} />
            </button>
            
            {/* Embed the WeatherApp component */}
            <WeatherApp />
          </div>
        </div>
      )}
    </div>
  );
};

// Weather app component that can be used independently or within a popup
const WeatherApp: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'current' | 'search'>('current'); // 'current' or 'search'

  // API key from OpenWeatherMap - REPLACE THIS WITH YOUR ACTUAL API KEY
  const API_KEY: string = 'fe4feefa8543e06d4f3c66d92c61b69c'; // Replace with your API key

  // Fetch weather data from the real OpenWeatherMap API
  const fetchWeatherData = (lat?: number, lon?: number, cityName?: string | null): void => {
    setLoading(true);
    setError(null);
    
    // Build the API URL based on search type
    let url: string;
    if (cityName) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
    } else if (lat !== undefined && lon !== undefined) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else {
      const errorMessage: string = "No location specified";
      setError(errorMessage);
      setLoading(false);
      return;
    }
    
    // Make the actual API call
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json() as Promise<WeatherAPIResponse>;
      })
      .then((data: WeatherAPIResponse) => {
        // Process the weather data with better error checking
        const processedWeather: WeatherData = {
          temperature: data.main?.temp || 0,
          humidity: data.main?.humidity || 0,
          windSpeed: data.wind?.speed || 0,
          condition: data.weather?.[0]?.main || 'Unknown',
          description: data.weather?.[0]?.description || 'Weather information unavailable',
          iconCode: data.weather?.[0]?.id || null, // Extract the icon code with fallback
          date: new Date()
        };
        
        setWeather(processedWeather);
        setLocation(data.name + ", " + (data.sys?.country || ""));
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error("Error fetching weather data:", err);
        const errorMessage: string = "Failed to fetch weather data. Please try again or check the city name.";
        setError(errorMessage);
        setLoading(false);
      });
  };

  // Get user's current location when component loads
  useEffect(() => {
    if (mode === 'current') {
      getUserLocation();
    }
  }, [mode]);

  // Get user's location using browser geolocation API
  const getUserLocation = (): void => {
    setLoading(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData(latitude, longitude);
        },
        (err) => {
          const errorMessage: string = "Unable to get your location. Please allow location access or search by city.";
          setError(errorMessage);
          setLoading(false);
        }
      );
    } else {
      const errorMessage: string = "Geolocation is not supported by your browser. Please search by city.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Handle city search
  const handleCitySearch = (): void => {
    if (city.trim() === '') return;
    fetchWeatherData(undefined, undefined, city);
  };

  // Format date string
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Get weather icon based on weather condition code
  const getWeatherIcon = (iconCode: number | null): JSX.Element => {
    console.log("Weather condition code:", iconCode); // Add logging to help debug
    
    // Map OpenWeatherMap condition codes to Lucide icons
    // See https://openweathermap.org/weather-conditions for all codes
    if (!iconCode) return <Sun className="text-yellow-500" size={48} />;
    
    // Clear sky
    if (iconCode === 800) {
      return <Sun className="text-yellow-500" size={48} />;
    }
    
    // Clouds (801-804)
    if (iconCode >= 801 && iconCode <= 804) {
      return <Cloud className="text-gray-500" size={48} />;
    }
    
    // Rain (500-531)
    if (iconCode >= 500 && iconCode <= 531) {
      return <CloudRain className="text-blue-500" size={48} />;
    }
    
    // Thunderstorm (200-232)
    if (iconCode >= 200 && iconCode <= 232) {
      return (
        <div className="relative">
          <Cloud className="text-gray-700" size={48} />
          <div className="absolute bottom-0 right-0 text-yellow-400 text-xl">⚡</div>
        </div>
      );
    }
    
    // Default
    return <Cloud className="text-gray-500" size={48} />;
  };

  // Handle input key press (for search)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleCitySearch();
    }
  };

  return (
    <div className="flex flex-col w-full p-4 bg-gray-50 rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Weather Info</h1>
      
      {/* Toggle between current location and city search */}
      <div className="flex mb-4 bg-white rounded-lg p-1">
        <button 
          className={`flex-1 py-2 rounded-md ${mode === 'current' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
          onClick={() => setMode('current')}
        >
          <div className="flex items-center justify-center">
            <MapPin size={16} className="mr-1" />
            My Location
          </div>
        </button>
        <button 
          className={`flex-1 py-2 rounded-md ${mode === 'search' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
          onClick={() => setMode('search')}
        >
          <div className="flex items-center justify-center">
            <Search size={16} className="mr-1" />
            Search City
          </div>
        </button>
      </div>
      
      {/* City search input */}
      {mode === 'search' && (
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="text"
              value={city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter city name"
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button 
              onClick={handleCitySearch}
              className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="flex flex-col items-center">
            <Loader className="animate-spin h-10 w-10 text-blue-500" />
            <p className="mt-4 text-gray-600">Getting weather data...</p>
          </div>
        </div>
      )}

      {/* Weather display */}
      {!loading && weather && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{location}</h2>
              <p className="text-sm text-gray-500">{formatDate(weather.date)}</p>
            </div>
            <div className="flex justify-center">
              {getWeatherIcon(weather.iconCode)}
            </div>
          </div>
          
          <div className="mt-4">
            <div className="text-4xl font-bold mb-4">{weather.temperature.toFixed(1)}°C</div>
            <p className="text-lg mb-2 capitalize">{weather.description || weather.condition}</p>
            <p className="text-sm text-gray-500">Weather ID: {weather.iconCode || 'N/A'}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center">
                <Droplets className="text-blue-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Humidity</p>
                  <p className="font-medium">{weather.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center">
                <Wind className="text-blue-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Wind Speed</p>
                  <p className="font-medium">{weather.windSpeed} m/s</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="mt-6 flex justify-center">
            <button 
              onClick={mode === 'current' ? getUserLocation : handleCitySearch}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center"
            >
              <Thermometer size={16} className="mr-2" />
              Refresh Weather
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-center text-xs text-gray-500">
        Powered by OpenWeatherMap API
      </div>
    </div>
  );
};

export default WeatherPopupDemo;