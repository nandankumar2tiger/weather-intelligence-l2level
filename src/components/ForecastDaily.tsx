import React from "react";
import { WeatherData } from "../types";
import { getWeatherDetails, WeatherIcon } from "./WeatherIcons";
import { CloudRain, Wind, ThermometerSnowflake } from "lucide-react";
import { motion } from "motion/react";

interface ForecastDailyProps {
  weather: WeatherData;
  isCelsius: boolean;
}

export const ForecastDaily: React.FC<ForecastDailyProps> = ({
  weather,
  isCelsius,
}) => {
  const daily = weather.daily;

  const formatTemp = (tempC: number) => {
    if (isCelsius) {
      return `${Math.round(tempC)}°`;
    }
    return `${Math.round((tempC * 9) / 5 + 32)}°`;
  };

  const getDayLabel = (dateStr: string, index: number) => {
    if (index === 0) return "Today";
    if (index === 1) return "Tomorrow";

    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getFullDayLabel = (dateStr: string, index: number) => {
    if (index === 0) return "Today";
    if (index === 1) return "Tomorrow";

    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <div id="daily-forecast-container" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span>📅 7-Day Weather Forecast</span>
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          7 days starting {new Date(daily.time[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Grid containing the cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {daily.time.map((dateStr, index) => {
          const code = daily.weather_code[index];
          const tempMax = daily.temperature_2m_max[index];
          const tempMin = daily.temperature_2m_min[index];
          const prob = daily.precipitation_probability_max[index];
          const details = getWeatherDetails(code, 1); // default to daytime details for forecast summary

          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`p-4 rounded-2xl bg-white/50 border border-slate-100 hover:border-sky-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between items-center text-center cursor-pointer relative overflow-hidden group ${
                index === 0 ? "bg-sky-50/40 border-sky-100/50" : ""
              }`}
              id={`forecast-card-${index}`}
            >
              {/* Card mini highlighting for today */}
              {index === 0 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500" />
              )}

              {/* Day Labels */}
              <div className="w-full">
                <span className="block text-sm font-bold text-slate-800 tracking-tight md:hidden">
                  {getDayLabel(dateStr, index)}
                </span>
                <span className="hidden md:block text-sm font-bold text-slate-800 tracking-tight">
                  {getFullDayLabel(dateStr, index)}
                </span>
                <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                  {new Date(dateStr).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                </span>
              </div>

              {/* Icon Visual */}
              <div className="my-4 p-2 bg-slate-50 rounded-xl group-hover:bg-sky-50 transition-colors">
                <WeatherIcon code={code} size={32} />
              </div>

              {/* Description */}
              <span className="block text-xs text-slate-600 font-medium truncate w-full mb-3" title={details.description}>
                {details.description}
              </span>

              {/* Temperature block */}
              <div className="w-full pt-2 border-t border-slate-100 flex justify-center items-baseline gap-1.5">
                <span className="text-sm font-extrabold text-slate-800">
                  {formatTemp(tempMax)}
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-slate-400">
                  {formatTemp(tempMin)}
                </span>
              </div>

              {/* Extra details (Precipitation & wind) */}
              <div className="mt-2.5 w-full flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
                {prob > 0 && (
                  <span className="flex items-center gap-0.5 text-blue-500 font-bold" title="Precipitation Probability">
                    <CloudRain className="h-3 w-3" />
                    {prob}%
                  </span>
                )}
                {prob === 0 && (
                  <span className="flex items-center gap-0.5 text-slate-400" title="Dry Weather">
                    ☀️ Dry
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
