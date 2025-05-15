'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Droplets, MapPin, Thermometer, Wind, CloudRain } from 'lucide-react';
import { fetchWeatherData, fetchAnnualRainfall } from '@/lib/weatherService';

const API_KEY = "fe4feefa8543e06d4f3c66d92c61b69c";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  iconCode: string | null;
  location: string;
  date: Date;
}

export default function WeatherApp() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [annualRainfall, setAnnualRainfall] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWeatherInfo = async (lat?: number, lon?: number, cityName?: string) => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (cityName) {
        result = await fetchWeatherData(API_KEY, cityName);
      } else if (lat && lon) {
        result = await fetchWeatherData(API_KEY, undefined, lat, lon);
        const rain = await fetchAnnualRainfall(lat, lon);
        setAnnualRainfall(rain);
      }

      if (result) {
        setWeather(result);
        setLocation(result.location);
      }

    } catch (err) {
      setError('Unable to retrieve weather data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (city.trim() !== '') getWeatherInfo(undefined, undefined, city);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await getWeatherInfo(position.coords.latitude, position.coords.longitude);
        },
        () => setError("Location access denied.")
      );
    } else {
      setError("Geolocation not supported.");
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-md space-y-6">
      <h2 className="text-xl font-semibold text-center">🌦️ Weather & Rainfall</h2>
      <div className="flex space-x-2">
        <Input
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {weather && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="text-blue-600" />
            <p>{location}</p>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="text-red-500" />
            <p>{weather.temperature}°C - {weather.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="text-green-500" />
            <p>Wind: {weather.windSpeed} m/s</p>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="text-indigo-500" />
            <p>Humidity: {weather.humidity}%</p>
          </div>
          {annualRainfall !== null && (
            <div className="flex items-center gap-2">
              <Droplets className="text-blue-400" />
              <p>Annual Rainfall: {annualRainfall.toFixed(1)} mm/year</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
