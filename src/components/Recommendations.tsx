import React from "react";
import { WeatherData } from "../types";
import {
  Umbrella,
  Compass,
  Car,
  Shirt,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sun,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";

interface RecommendationsProps {
  weather: WeatherData;
  isCelsius: boolean;
}

interface AdvisoryItem {
  id: string;
  title: string;
  status: "success" | "warning" | "danger" | "info";
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  iconBg: string;
  recommendation: string;
  description: string;
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  weather,
  isCelsius,
}) => {
  const current = weather.current;
  const daily = weather.daily;

  // Key meteorological variables for today
  const currentTemp = current.temperature_2m;
  const rainProb = daily.precipitation_probability_max[0];
  const rainSum = daily.precipitation_sum[0];
  const maxWind = daily.wind_speed_10m_max[0];
  const uvMax = daily.uv_index_max[0];
  const weatherCode = current.weather_code;

  const getAdvisories = (): AdvisoryItem[] => {
    const list: AdvisoryItem[] = [];

    // --- 1. UMBRELLA ADVISORY ---
    let umbrellaStatus: "success" | "warning" | "danger" = "success";
    let umbrellaRec = "No umbrella needed today.";
    let umbrellaDesc = "Excellent! Clear or overcast conditions without rain in sight.";

    if (rainProb >= 50 || rainSum > 2) {
      umbrellaStatus = "danger";
      umbrellaRec = "Take an umbrella! Rain is highly likely.";
      umbrellaDesc = `Precipitation probability is peaking at ${rainProb}% with active rain predicted today.`;
    } else if (rainProb >= 25) {
      umbrellaStatus = "warning";
      umbrellaRec = "Consider carrying an umbrella.";
      umbrellaDesc = `Slight chance of rain (${rainProb}% probability). You might experience localized passing showers.`;
    }

    list.push({
      id: "umbrella",
      title: "Rain & Umbrella Protection",
      status: umbrellaStatus,
      icon: Umbrella,
      colorClass:
        umbrellaStatus === "danger"
          ? "text-blue-600"
          : umbrellaStatus === "warning"
          ? "text-sky-500"
          : "text-slate-400",
      bgClass:
        umbrellaStatus === "danger"
          ? "bg-blue-50/50 border-blue-200/50"
          : umbrellaStatus === "warning"
          ? "bg-sky-50/40 border-sky-200/30"
          : "bg-slate-50/30 border-slate-100",
      iconBg:
        umbrellaStatus === "danger"
          ? "bg-blue-100/80"
          : umbrellaStatus === "warning"
          ? "bg-sky-100/50"
          : "bg-slate-100/60",
      recommendation: umbrellaRec,
      description: umbrellaDesc,
    });

    // --- 2. OUTDOOR ACTIVITIES ---
    let outdoorStatus: "success" | "warning" | "danger" = "success";
    let outdoorRec = "Perfect conditions for outdoor activities!";
    let outdoorDesc = "Clear weather with pleasant temperatures. Great time for a walk, hike, or running.";

    const isRainyOrStormy = [51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode);
    const isFoggy = [45, 48].includes(weatherCode);

    if (isRainyOrStormy) {
      outdoorStatus = "danger";
      outdoorRec = "Not recommended today.";
      outdoorDesc = "Active storms or rain showers make outdoor exercises and adventures unsuitable.";
    } else if (currentTemp > 32) {
      outdoorStatus = "warning";
      outdoorRec = "Exercise caution due to high heat.";
      outdoorDesc = "Temperatures are very hot. Limit outdoor activities to early morning or late evening, and stay hydrated.";
    } else if (currentTemp < 5) {
      outdoorStatus = "warning";
      outdoorRec = "Dress warmly for outdoor activities.";
      outdoorDesc = "Brrrr! Low ambient temperature makes staying outdoors chilly. Wear insulated layers.";
    } else if (isFoggy) {
      outdoorStatus = "warning";
      outdoorRec = "Moderate outdoor suitability.";
      outdoorDesc = "Mist or fog reduces horizontal visibility. Safe for low-speed exercises, but be cautious.";
    } else if (weatherCode === 3) {
      outdoorRec = "Good for outdoor activities.";
      outdoorDesc = "Overcast sky, but completely dry. Excellent temperature for physical exercises.";
    }

    list.push({
      id: "outdoor",
      title: "Outdoor Suitability",
      status: outdoorStatus,
      icon: Compass,
      colorClass:
        outdoorStatus === "success"
          ? "text-emerald-600"
          : outdoorStatus === "warning"
          ? "text-amber-500"
          : "text-rose-500",
      bgClass:
        outdoorStatus === "success"
          ? "bg-emerald-50/40 border-emerald-200/50"
          : outdoorStatus === "warning"
          ? "bg-amber-50/40 border-amber-200/30"
          : "bg-rose-50/40 border-rose-200/30",
      iconBg:
        outdoorStatus === "success"
          ? "bg-emerald-100/80"
          : outdoorStatus === "warning"
          ? "bg-amber-100/50"
          : "bg-rose-100/60",
      recommendation: outdoorRec,
      description: outdoorDesc,
    });

    // --- 3. TRAVEL & DRIVING ---
    let travelStatus: "success" | "warning" | "danger" = "success";
    let travelRec = "Safe travel conditions.";
    let travelDesc = "Favorable driving and transit visibility. Standard highway rules apply.";

    if (weatherCode >= 95) {
      travelStatus = "danger";
      travelRec = "Severe transit caution advised.";
      travelDesc = "Thunderstorms with lightning and potential hail can reduce visibility and trigger localized road flooding.";
    } else if (isFoggy) {
      travelStatus = "danger";
      travelRec = "Low driving visibility!";
      travelDesc = "Heavy fog reduces line-of-sight safety. Slow down, use low-beam fog lights, and double your braking distance.";
    } else if (maxWind >= 45) {
      travelStatus = "warning";
      travelRec = "High wind travel advisory.";
      travelDesc = `Strong gusts up to ${maxWind} km/h. High-profile vehicles should exert extra caution on open lanes.`;
    } else if (isRainyOrStormy) {
      travelStatus = "warning";
      travelRec = "Wet roadways. Drive carefully.";
      travelDesc = "Wet asphalt decreases tire friction. Reduce speeds slightly to avoid hydroplaning risks.";
    }

    list.push({
      id: "travel",
      title: "Travel & Driving Transit",
      status: travelStatus,
      icon: Car,
      colorClass:
        travelStatus === "success"
          ? "text-sky-600"
          : travelStatus === "warning"
          ? "text-amber-500"
          : "text-rose-600",
      bgClass:
        travelStatus === "success"
          ? "bg-sky-50/40 border-sky-200/50"
          : travelStatus === "warning"
          ? "bg-amber-50/40 border-amber-200/30"
          : "bg-rose-50/40 border-rose-200/30",
      iconBg:
        travelStatus === "success"
          ? "bg-sky-100/80"
          : travelStatus === "warning"
          ? "bg-amber-100/50"
          : "bg-rose-100/60",
      recommendation: travelRec,
      description: travelDesc,
    });

    // --- 4. WARDROBE RECOMMENDATION ---
    let wardrobeStatus: "success" | "warning" | "info" = "info";
    let wardrobeRec = "Casual single-layer clothing.";
    let wardrobeDesc = "Warm conditions. T-shirt, shorts, or light breathable fabrics are perfect.";

    if (currentTemp >= 28) {
      wardrobeRec = "Breathable clothing & Sunglasses.";
      wardrobeDesc = `Hot temperatures (${Math.round(currentTemp)}°C). Opt for loose cotton/linen clothes and hydrate frequently.`;
    } else if (currentTemp >= 16) {
      wardrobeRec = "Standard light layers.";
      wardrobeDesc = `Pleasant climate (${Math.round(currentTemp)}°C). A regular shirt, polo, or lightweight pullover is highly suitable.`;
    } else if (currentTemp >= 8) {
      wardrobeStatus = "warning";
      wardrobeRec = "Sweaters, jackets, or windbreakers.";
      wardrobeDesc = `Chilly atmosphere (${Math.round(currentTemp)}°C). A jacket or windbreaker is recommended to stay comfortable.`;
    } else {
      wardrobeStatus = "warning";
      wardrobeRec = "Heavy insulated coats & Scarves.";
      wardrobeDesc = `Cold environment (${Math.round(currentTemp)}°C). Wear thick fleece or down jackets, thermal underwear, and beanies.`;
    }

    list.push({
      id: "wardrobe",
      title: "Wardrobe & Apparel",
      status: wardrobeStatus,
      icon: Shirt,
      colorClass: wardrobeStatus === "warning" ? "text-indigo-500" : "text-sky-500",
      bgClass:
        wardrobeStatus === "warning"
          ? "bg-indigo-50/30 border-indigo-200/20"
          : "bg-sky-50/30 border-sky-200/20",
      iconBg: wardrobeStatus === "warning" ? "bg-indigo-100/50" : "bg-sky-100/50",
      recommendation: wardrobeRec,
      description: wardrobeDesc,
    });

    // --- 5. UV INDEX PROTECTION ---
    if (uvMax >= 5) {
      list.push({
        id: "uv",
        title: "UV & Skin Protection",
        status: uvMax >= 8 ? "danger" : "warning",
        icon: Sun,
        colorClass: uvMax >= 8 ? "text-rose-600" : "text-amber-500",
        bgClass: uvMax >= 8 ? "bg-rose-50/40 border-rose-200/30" : "bg-amber-50/40 border-amber-200/30",
        iconBg: uvMax >= 8 ? "bg-rose-100/60" : "bg-amber-100/50",
        recommendation: uvMax >= 8 ? "Very High UV Alert! SPF 40+ Sunscreen." : "Moderate UV Protection Required.",
        description: `Max UV is reaching ${uvMax} today. Wear sunglasses, a wide-brimmed hat, and apply sunscreen if outdoors.`,
      });
    }

    return list;
  };

  const advisories = getAdvisories();

  return (
    <div id="weather-recommendations-panel" className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">
          💡 Weather Intelligence Recommendations
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {advisories.map((item, index) => {
          const ItemIcon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-4 border rounded-2xl ${item.bgClass} flex gap-4 shadow-sm items-start`}
              id={`rec-item-${item.id}`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${item.iconBg}`}>
                <ItemIcon className={`h-6 w-6 ${item.colorClass}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    {item.title}
                  </h4>
                  {item.status === "danger" ? (
                    <span className="flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                      <ShieldAlert className="h-3 w-3 shrink-0" />
                      Alert
                    </span>
                  ) : item.status === "warning" ? (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      Caution
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <CheckCircle className="h-3 w-3 shrink-0" />
                      Favorable
                    </span>
                  )}
                </div>

                <p className="text-sm font-extrabold text-slate-800 mt-1">
                  {item.recommendation}
                </p>

                <p className="text-xs text-slate-600 font-sans mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
