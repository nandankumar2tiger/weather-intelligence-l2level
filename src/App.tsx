import React, { useState, useEffect } from "react";
import { CitySearch } from "./components/CitySearch";
import { CurrentWeather } from "./components/CurrentWeather";
import { ForecastDaily } from "./components/ForecastDaily";
import { TrendChart } from "./components/TrendChart";
import { Recommendations } from "./components/Recommendations";
import { getWeatherDetails, WeatherIcon } from "./components/WeatherIcons";
import { GeocodingResult, WeatherData, FavoriteCity } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { CloudSun, HelpCircle, Star, CloudRain, RefreshCw, Sparkles, Navigation } from "lucide-react";

// Default city: Paris, France
const DEFAULT_CITY: GeocodingResult = {
  id: 2988507,
  name: "Paris",
  latitude: 48.8566,
  longitude: 2.3522,
  country: "France",
  country_code: "FR",
  admin1: "Île-de-France",
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState<GeocodingResult | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCelsius, setIsCelsius] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  // 1. Load favorites and unit preference from localStorage on mount
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("weather_favorites");
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }

      const storedUnit = localStorage.getItem("weather_unit_celsius");
      if (storedUnit !== null) {
        setIsCelsius(storedUnit === "true");
      }
    } catch (e) {
      console.error("Failed to load initial settings from localStorage", e);
    }
  }, []);

  // 2. Fetch weather for the default city or the first favorite on mount
  useEffect(() => {
    let initialCity = DEFAULT_CITY;
    try {
      const storedFavs = localStorage.getItem("weather_favorites");
      if (storedFavs) {
        const parsed = JSON.parse(storedFavs);
        if (parsed && parsed.length > 0) {
          // Default to first favorite if available
          const firstFav = parsed[0];
          initialCity = {
            id: Date.now(),
            name: firstFav.name,
            latitude: firstFav.latitude,
            longitude: firstFav.longitude,
            country: firstFav.country,
            admin1: firstFav.admin1,
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    fetchWeather(initialCity);
  }, []);

  const fetchWeather = async (city: GeocodingResult) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Unable to load forecast data from Open-Meteo. Please try again.");
      }
      const data = await res.json();
      setWeatherData(data);
      setSelectedCity(city);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while loading weather data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelected = (city: GeocodingResult) => {
    fetchWeather(city);
  };

  const handleToggleFavorite = (cityToToggle: FavoriteCity) => {
    let updated: FavoriteCity[];
    const exists = favorites.some(
      (f) => f.latitude === cityToToggle.latitude && f.longitude === cityToToggle.longitude
    );

    if (exists) {
      updated = favorites.filter(
        (f) => !(f.latitude === cityToToggle.latitude && f.longitude === cityToToggle.longitude)
      );
    } else {
      updated = [...favorites, cityToToggle];
    }

    setFavorites(updated);
    localStorage.setItem("weather_favorites", JSON.stringify(updated));
  };

  const handleUnitToggle = () => {
    const nextUnit = !isCelsius;
    setIsCelsius(nextUnit);
    localStorage.setItem("weather_unit_celsius", String(nextUnit));
  };

  // Obtain background colors based on weather code and isDay
  const weatherDetails = weatherData
    ? getWeatherDetails(weatherData.current.weather_code, weatherData.current.is_day)
    : getWeatherDetails(0, 1);

  return (
    <div
      id="app-root-container"
      className={`min-h-screen bg-gradient-to-b ${weatherDetails.bgAtmosphere} weather-transition-bg transition-colors duration-1000 py-8 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-between`}
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Upper Brand Header Block */}
        <header id="main-header" className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl shadow-md text-white">
              <CloudSun className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
                Weather Intelligence
              </h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono mt-0.5">
                Smarter Meteorological Forecasts & Recommendations
              </p>
            </div>
          </div>

          {/* Unit Toggle & Refresh block */}
          <div className="flex items-center gap-3" id="header-controls">
            {selectedCity && (
              <button
                id="refresh-weather-btn"
                onClick={() => fetchWeather(selectedCity)}
                title="Refresh current data"
                className="p-3 bg-white/70 hover:bg-white backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-sm text-slate-500 hover:text-sky-500 hover:border-sky-200 transition-all cursor-pointer flex items-center justify-center"
              >
                <RefreshCw className={`h-4.5 w-4.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}

            {/* Premium Unit Selector Button */}
            <button
              id="temp-unit-toggle"
              onClick={handleUnitToggle}
              className="px-4 py-2.5 bg-white/70 hover:bg-white backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-sm text-sm font-bold text-slate-700 flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Unit:</span>
              <div className="relative w-12 h-6 bg-slate-100 rounded-full p-0.5 flex items-center transition-colors">
                <motion.div
                  className="w-5 h-5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-extrabold"
                  animate={{ x: isCelsius ? 0 : 22 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {isCelsius ? "C" : "F"}
                </motion.div>
                <span className="absolute right-2.5 text-[9px] font-mono text-slate-400 font-bold pointer-events-none select-none">
                  {isCelsius ? "F" : "C"}
                </span>
              </div>
            </button>
          </div>
        </header>

        {/* Search Engine and quick-favorites list */}
        <CitySearch
          onCitySelected={handleCitySelected}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          currentCity={selectedCity}
        />

        {/* Favorite quick-pills below search */}
        {favorites.length > 0 && (
          <div className="w-full max-w-xl mx-auto -mt-3 mb-8 flex flex-wrap gap-1.5 justify-center" id="favorites-bar">
            {favorites.slice(0, 6).map((fav) => (
              <button
                key={`${fav.latitude}-${fav.longitude}`}
                onClick={() =>
                  handleCitySelected({
                    id: Date.now() + Math.random(),
                    name: fav.name,
                    latitude: fav.latitude,
                    longitude: fav.longitude,
                    country: fav.country,
                    admin1: fav.admin1,
                  })
                }
                className={`px-3 py-1 bg-white/50 hover:bg-white/90 backdrop-blur-md border border-slate-200/40 hover:border-sky-300 rounded-full text-xs font-semibold text-slate-600 hover:text-sky-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group ${
                  selectedCity?.latitude === fav.latitude && selectedCity?.longitude === fav.longitude
                    ? "border-sky-400 bg-sky-50/50 text-sky-600"
                    : ""
                }`}
              >
                <Star className="h-3 w-3 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>{fav.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Core Content Loading/Error States */}
        <main id="core-content" className="relative">
          <AnimatePresence mode="wait">
            {loading && !weatherData ? (
              <motion.div
                key="loading-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full min-h-[400px] flex flex-col justify-center items-center py-20 bg-white/25 backdrop-blur-md border border-white/15 rounded-3xl shadow-lg"
                id="loading-spinner-panel"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                  <CloudSun className="h-6 w-6 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-6 tracking-tight">
                  Consulting Atmosphere...
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-1.5 max-w-xs text-center leading-relaxed">
                  Fetching current readings, astronomy variables, and 7-day projections from Open-Meteo services.
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full bg-red-50/50 border border-red-200 rounded-3xl p-8 shadow-md text-center max-w-2xl mx-auto my-12"
                id="error-boundary-panel"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4 font-mono text-2xl font-bold">
                  ⚠️
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Meteorological Fetch Failed
                </h3>
                <p className="text-sm text-red-600/90 font-sans mt-2 max-w-md mx-auto leading-relaxed">
                  {error}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => selectedCity && fetchWeather(selectedCity)}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-4 w-4" /> Retry Connection
                  </button>
                  <button
                    onClick={() => fetchWeather(DEFAULT_CITY)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow transition-all cursor-pointer"
                  >
                    Load Default City
                  </button>
                </div>
              </motion.div>
            ) : weatherData && selectedCity ? (
              <motion.div
                key="weather-content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
                id="weather-dashboard-container"
              >
                {/* Loader Overlay when refetching in background */}
                {loading && (
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-3xl pointer-events-none">
                    <div className="bg-slate-950/80 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold font-sans">
                      <RefreshCw className="h-4 w-4 animate-spin text-sky-400" />
                      Syncing...
                    </div>
                  </div>
                )}

                {/* Grid row 1: Current Weather & Trend Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-5 flex flex-col">
                    <CurrentWeather
                      weather={weatherData}
                      city={selectedCity}
                      isCelsius={isCelsius}
                    />
                  </div>
                  <div className="lg:col-span-7 flex flex-col">
                    <TrendChart
                      weather={weatherData}
                      isCelsius={isCelsius}
                    />
                  </div>
                </div>

                {/* Recommendations board */}
                <Recommendations
                  weather={weatherData}
                  isCelsius={isCelsius}
                />

                {/* 7-Day Forecast Grid */}
                <ForecastDaily
                  weather={weatherData}
                  isCelsius={isCelsius}
                />
              </motion.div>
            ) : (
              <div className="text-center py-20 text-slate-400" id="empty-state">
                <HelpCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-sans text-sm">Please search for a city to load weather details.</p>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer copyright */}
      <footer id="main-footer" className="text-center py-8 border-t border-slate-200/30 text-[11px] font-sans font-medium text-slate-400 max-w-7xl mx-auto w-full mt-12 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>
          © 2026 Weather Intelligence. Powered by Open-Meteo Geocoding & Forecast Public APIs.
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <span>Real-time heuristic advisories optimized for travel & transit</span>
        </div>
      </footer>
    </div>
  );
}
