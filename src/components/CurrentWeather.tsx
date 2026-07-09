import React from "react";
import {
  Wind,
  Droplets,
  Gauge,
  Cloudy,
  Thermometer,
  Calendar,
  Compass,
  ArrowDown,
  ArrowUp,
  MapPin,
  Clock,
  Sun,
  CloudRain,
  Moon
} from "lucide-react";
import { WeatherData, GeocodingResult } from "../types";
import { getWeatherDetails } from "./WeatherIcons";
import { motion } from "motion/react";

interface CurrentWeatherProps {
  weather: WeatherData;
  city: GeocodingResult;
  isCelsius: boolean;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  weather,
  city,
  isCelsius,
}) => {
  const current = weather.current;
  const daily = weather.daily;

  // Format temperature based on selection
  const formatTemp = (tempC: number) => {
    if (isCelsius) {
      return `${Math.round(tempC)}°C`;
    }
    return `${Math.round((tempC * 9) / 5 + 32)}°F`;
  };

  const weatherDetails = getWeatherDetails(current.weather_code, current.is_day);
  const Icon = weatherDetails.icon;

  // Formatting date
  const localDate = new Date(current.time);
  const formattedDate = localDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const formattedTime = localDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate high and low for today (index 0)
  const tempMax = daily.temperature_2m_max[0];
  const tempMin = daily.temperature_2m_min[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="current-weather-panel"
      className="w-full bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden relative"
    >
      {/* Absolute Decorative Background Glow matching weather condition */}
      <div className={`absolute -right-24 -top-24 w-72 h-72 bg-gradient-to-br ${weatherDetails.gradient} opacity-20 blur-3xl pointer-events-none rounded-full`} />
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-gradient-to-br from-sky-400 to-indigo-500 opacity-5 blur-2xl pointer-events-none rounded-full" />

      {/* Header section (Location & Date/Time) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200/50 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-slate-800">
            <MapPin className="h-5 w-5 text-sky-500 shrink-0" />
            <h2 className="text-xl md:text-2xl font-bold font-sans tracking-tight">
              {city.name}
            </h2>
            {city.country && (
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 uppercase tracking-wide">
                {city.country_code || city.country.slice(0, 3)}
              </span>
            )}
          </div>
          {city.admin1 && (
            <p className="text-xs text-slate-500 mt-1 ml-7">
              {city.admin1}, {city.country}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ml-7 md:ml-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>Local Update: {formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Main Core Weather Block */}
      <div className="flex flex-col gap-6 py-6 relative z-10">
        {/* Hero Weather visual */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/45 p-5 rounded-2xl border border-slate-100/60 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`p-4 bg-gradient-to-br ${weatherDetails.gradient} bg-opacity-15 rounded-3xl shadow-md shrink-0`}>
              <Icon size={64} className={weatherDetails.iconColor} />
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-800 font-sans tracking-tighter">
                {formatTemp(current.temperature_2m)}
              </div>
              <p className="text-sm font-semibold text-slate-700 mt-0.5 capitalize">
                {weatherDetails.description}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 shrink-0">
            <span className="flex items-center gap-1">
              <ArrowUp className="h-4 w-4 text-red-500" />
              High: <span className="font-bold text-slate-800">{formatTemp(tempMax)}</span>
            </span>
            <span className="h-3.5 w-[1px] bg-slate-300 sm:hidden" />
            <span className="flex items-center gap-1">
              <ArrowDown className="h-4 w-4 text-blue-500" />
              Low: <span className="font-bold text-slate-800">{formatTemp(tempMin)}</span>
            </span>
          </div>
        </div>

        {/* Modern Weather KPI Grid */}
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Metric 1: Apparent temp */}
            <div className="bg-slate-50/50 hover:bg-slate-100/40 p-3.5 rounded-2xl border border-slate-100 transition-all">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Thermometer className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Feels Like</span>
              </div>
              <div className="text-base font-bold text-slate-800 font-mono">
                {formatTemp(current.apparent_temperature)}
              </div>
            </div>

            {/* Metric 2: Humidity */}
            <div className="bg-slate-50/50 hover:bg-slate-100/40 p-3.5 rounded-2xl border border-slate-100 transition-all">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Droplets className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Humidity</span>
              </div>
              <div className="text-base font-bold text-slate-800 font-mono">
                {current.relative_humidity_2m}%
              </div>
            </div>

            {/* Metric 3: Wind Speed */}
            <div className="bg-slate-50/50 hover:bg-slate-100/40 p-3.5 rounded-2xl border border-slate-100 transition-all">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Wind className="h-4 w-4 text-teal-500 shrink-0" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Wind Speed</span>
              </div>
              <div className="text-base font-bold text-slate-800 font-mono">
                {current.wind_speed_10m} <span className="text-xs">km/h</span>
              </div>
            </div>

            {/* Metric 4: Pressure */}
            <div className="bg-slate-50/50 hover:bg-slate-100/40 p-3.5 rounded-2xl border border-slate-100 transition-all">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Gauge className="h-4 w-4 text-purple-500 shrink-0" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Pressure</span>
              </div>
              <div className="text-base font-bold text-slate-800 font-mono">
                {current.pressure_msl} <span className="text-xs">hPa</span>
              </div>
            </div>

            {/* Metric 5: Cloud Cover */}
            <div className="bg-slate-50/50 hover:bg-slate-100/40 p-3.5 rounded-2xl border border-slate-100 transition-all">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Cloudy className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Cloud Cover</span>
              </div>
              <div className="text-base font-bold text-slate-800 font-mono">
                {current.cloud_cover}%
              </div>
            </div>

            {/* Metric 6: Precipitation Sum */}
            <div className="bg-slate-50/50 hover:bg-slate-100/40 p-3.5 rounded-2xl border border-slate-100 transition-all">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <CloudRain className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Precipitation</span>
              </div>
              <div className="text-base font-bold text-slate-800 font-mono">
                {current.precipitation} <span className="text-xs">mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Astro Indicators (Sunrise & Sunset & UV) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200/50 relative z-10 text-xs text-slate-600 font-sans">
        <div className="flex items-center gap-3 bg-slate-50/30 p-2.5 rounded-xl border border-slate-200/20">
          <Sun className="h-5 w-5 text-amber-500 animate-pulse shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Sunrise</div>
            <div className="font-bold text-slate-700 font-mono">
              {new Date(daily.sunrise[0]).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50/30 p-2.5 rounded-xl border border-slate-200/20">
          <Moon className="h-5 w-5 text-indigo-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Sunset</div>
            <div className="font-bold text-slate-700 font-mono">
              {new Date(daily.sunset[0]).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50/30 p-2.5 rounded-xl border border-slate-200/20">
          <Compass className="h-5 w-5 text-rose-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Max UV Index</div>
            <div className="font-bold text-slate-700 font-mono">
              {daily.uv_index_max[0]} <span className="font-normal text-slate-400">({daily.uv_index_max[0] > 7 ? "Very High" : daily.uv_index_max[0] > 5 ? "High" : daily.uv_index_max[0] > 2 ? "Moderate" : "Low"})</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
