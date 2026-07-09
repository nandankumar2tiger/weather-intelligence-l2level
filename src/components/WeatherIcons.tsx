import React from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  Snowflake,
  CloudLightning,
  Moon,
  type LucideIcon,
} from "lucide-react";

interface WeatherDetails {
  icon: LucideIcon;
  description: string;
  gradient: string;
  textColor: string;
  iconColor: string;
  bgAtmosphere: string; // for background styling of panels
}

export function getWeatherDetails(code: number, isDay: number = 1): WeatherDetails {
  const isNight = isDay === 0;

  // WMO Weather interpretation codes (WW)
  switch (code) {
    case 0: // Clear sky
      return {
        icon: isNight ? Moon : Sun,
        description: isNight ? "Clear Night" : "Clear Sky",
        gradient: isNight ? "from-slate-800 to-indigo-950" : "from-amber-400 to-orange-500",
        textColor: isNight ? "text-indigo-200" : "text-amber-600",
        iconColor: isNight ? "text-indigo-300 animate-pulse" : "text-amber-500 hover:rotate-45 transition-transform duration-700",
        bgAtmosphere: isNight ? "from-indigo-950 via-slate-900 to-slate-950" : "from-amber-50/40 via-sky-50/30 to-slate-50",
      };

    case 1: // Mainly clear
    case 2: // Partly cloudy
      return {
        icon: CloudSun,
        description: code === 1 ? "Mainly Clear" : "Partly Cloudy",
        gradient: isNight ? "from-slate-700 to-slate-900" : "from-sky-400 to-amber-300",
        textColor: isNight ? "text-slate-300" : "text-sky-700",
        iconColor: isNight ? "text-indigo-200" : "text-sky-500",
        bgAtmosphere: isNight ? "from-slate-900 via-slate-950 to-indigo-950" : "from-sky-50/50 via-blue-50/20 to-slate-50",
      };

    case 3: // Overcast
      return {
        icon: Cloud,
        description: "Overcast",
        gradient: "from-slate-400 to-slate-600",
        textColor: "text-slate-700",
        iconColor: "text-slate-500",
        bgAtmosphere: "from-slate-100 via-zinc-100/40 to-slate-50",
      };

    case 45: // Fog
    case 48: // Depositing rime fog
      return {
        icon: CloudFog,
        description: code === 45 ? "Foggy" : "Ice Fog",
        gradient: "from-zinc-300 to-slate-400",
        textColor: "text-zinc-700",
        iconColor: "text-zinc-500",
        bgAtmosphere: "from-zinc-100/80 via-slate-100/40 to-slate-50",
      };

    case 51: // Drizzle: Light
    case 53: // Drizzle: Moderate
    case 55: // Drizzle: Dense
      return {
        icon: CloudDrizzle,
        description: "Drizzle",
        gradient: "from-teal-300 to-cyan-500",
        textColor: "text-teal-700",
        iconColor: "text-teal-500",
        bgAtmosphere: "from-teal-50/30 via-slate-50 to-slate-100/30",
      };

    case 56: // Freezing Drizzle: Light
    case 57: // Freezing Drizzle: Dense
    case 66: // Freezing Rain: Light
    case 67: // Freezing Rain: Heavy
      return {
        icon: Snowflake,
        description: "Freezing Rain",
        gradient: "from-blue-300 to-indigo-400",
        textColor: "text-indigo-700",
        iconColor: "text-blue-400 animate-bounce",
        bgAtmosphere: "from-blue-50/40 via-indigo-50/10 to-slate-50",
      };

    case 61: // Rain: Slight
    case 63: // Rain: Moderate
    case 65: // Rain: Heavy
      return {
        icon: CloudRain,
        description: code === 61 ? "Light Rain" : code === 63 ? "Moderate Rain" : "Heavy Rain",
        gradient: "from-blue-400 to-blue-600",
        textColor: "text-blue-700",
        iconColor: "text-blue-500",
        bgAtmosphere: "from-blue-50/30 via-sky-50/20 to-slate-50",
      };

    case 71: // Snow fall: Slight
    case 73: // Snow fall: Moderate
    case 75: // Snow fall: Heavy
    case 77: // Snow grains
    case 85: // Snow showers: Slight
    case 86: // Snow showers: Heavy
      return {
        icon: Snowflake,
        description: "Snowfall",
        gradient: "from-sky-200 to-sky-400",
        textColor: "text-sky-700",
        iconColor: "text-sky-400 animate-pulse",
        bgAtmosphere: "from-sky-50/50 via-zinc-100/30 to-slate-50",
      };

    case 80: // Rain showers: Slight
    case 81: // Rain showers: Moderate
    case 82: // Rain showers: Violent
      return {
        icon: CloudRainWind,
        description: "Passing Showers",
        gradient: "from-sky-400 to-indigo-500",
        textColor: "text-indigo-700",
        iconColor: "text-sky-500",
        bgAtmosphere: "from-sky-50/30 via-indigo-50/10 to-slate-50",
      };

    case 95: // Thunderstorm: Slight or moderate
    case 96: // Thunderstorm with hail: Slight
    case 99: // Thunderstorm with hail: Heavy
      return {
        icon: CloudLightning,
        description: code === 95 ? "Thunderstorm" : "Severe Storm",
        gradient: "from-amber-500 via-indigo-800 to-slate-900",
        textColor: "text-amber-500",
        iconColor: "text-amber-500 animate-pulse",
        bgAtmosphere: "from-slate-900 via-indigo-950/80 to-slate-950",
      };

    default:
      return {
        icon: CloudSun,
        description: "Variable Weather",
        gradient: "from-slate-400 to-slate-600",
        textColor: "text-slate-600",
        iconColor: "text-slate-500",
        bgAtmosphere: "from-slate-50 via-slate-100/20 to-slate-100",
      };
  }
}

interface WeatherIconProps {
  code: number;
  isDay?: number;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = 1,
  className = "",
  size = 24,
}) => {
  const { icon: Icon, iconColor } = getWeatherDetails(code, isDay);
  return <Icon size={size} className={`${iconColor} ${className}`} id={`weather-icon-${code}`} />;
};
