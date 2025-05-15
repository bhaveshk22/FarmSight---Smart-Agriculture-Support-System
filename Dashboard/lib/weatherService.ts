    export const fetchWeatherData = async (
    apiKey: string,
    city?: string,
    lat?: number,
    lon?: number
    ) => {
    const query = city
        ? `q=${encodeURIComponent(city)}`
        : `lat=${lat}&lon=${lon}`;

    const url = `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch weather");

    const data = await response.json();

    return {
        temperature: data.main?.temp || 0,
        humidity: data.main?.humidity || 0,
        windSpeed: data.wind?.speed || 0,
        condition: data.weather?.[0]?.main || 'Unknown',
        description: data.weather?.[0]?.description || 'Unavailable',
        iconCode: data.weather?.[0]?.id || null,
        location: `${data.name}, ${data.sys?.country || ''}`,
        date: new Date()
    };
    };

    // Simulated annual rainfall (replace with historical data logic in paid tier)
    export const fetchAnnualRainfall = async (
    lat: number,
    lon: number
    ): Promise<number> => {
    // Dummy logic to simulate rainfall value (e.g. average or fixed)
    return 850 + Math.random() * 200; // e.g., mm/year
    };
