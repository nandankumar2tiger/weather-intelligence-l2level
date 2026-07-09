import React, { useState, useEffect, useRef } from "react";
import { WeatherData } from "../types";
import { getWeatherDetails } from "./WeatherIcons";
import { TrendingUp, Thermometer, CloudRain } from "lucide-react";
import { motion } from "motion/react";

interface TrendChartProps {
  weather: WeatherData;
  isCelsius: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  weather,
  isCelsius,
}) => {
  const daily = weather.daily;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 260 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // ResizeObserver to keep chart responsive
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      // Enforce a sensible minimum width and height
      setDimensions({
        width: Math.max(width, 280),
        height: 260,
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const rawMaxTemps = daily.temperature_2m_max;
  const rawMinTemps = daily.temperature_2m_min;

  // Convert values if units are Fahrenheit
  const getTemp = (tempC: number) => {
    return isCelsius ? tempC : (tempC * 9) / 5 + 32;
  };

  const maxTemps = rawMaxTemps.map(getTemp);
  const minTemps = rawMinTemps.map(getTemp);

  // Calculate scaling boundaries
  const absoluteMax = Math.max(...maxTemps);
  const absoluteMin = Math.min(...minTemps);
  const tempRange = absoluteMax - absoluteMin;
  
  // Pad the range slightly so lines don't hit the absolute edges
  const yPad = tempRange === 0 ? 5 : tempRange * 0.15;
  const yMaxLimit = absoluteMax + yPad;
  const yMinLimit = absoluteMin - yPad;
  const ySpread = yMaxLimit - yMinLimit;

  // Layout boundaries inside the SVG
  const padding = { top: 30, right: 25, bottom: 40, left: 45 };
  const chartWidth = dimensions.width - padding.left - padding.right;
  const chartHeight = dimensions.height - padding.top - padding.bottom;

  // Map indexes and temps to SVG coordinates
  const getX = (index: number) => {
    return padding.left + (index / (maxTemps.length - 1)) * chartWidth;
  };

  const getY = (temp: number) => {
    // Invert Y because SVG coordinates increase downwards
    const normalized = (temp - yMinLimit) / ySpread;
    return padding.top + chartHeight - normalized * chartHeight;
  };

  // Generate SVG path for a line
  const generateLinePath = (temps: number[]) => {
    return temps
      .map((temp, index) => {
        const x = getX(index);
        const y = getY(temp);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  // Generate SVG path for the shaded range area
  const generateAreaPath = () => {
    const topPoints = maxTemps.map((temp, index) => `${getX(index)},${getY(temp)}`);
    // Min temperatures are traversed in reverse for the bottom path of the polygon
    const bottomPoints = minTemps
      .map((temp, index) => `${getX(index)},${getY(temp)}`)
      .reverse();
    
    return `M ${topPoints.join(" L ")} L ${bottomPoints.join(" L ")} Z`;
  };

  const maxPath = generateLinePath(maxTemps);
  const minPath = generateLinePath(minTemps);
  const areaPath = generateAreaPath();

  // Generate horizontal grid lines and y-axis ticks
  const yTicksCount = 4;
  const yTicks = Array.from({ length: yTicksCount }).map((_, i) => {
    const tempVal = yMinLimit + (i / (yTicksCount - 1)) * ySpread;
    return {
      temp: tempVal,
      y: getY(tempVal),
    };
  });

  // Handle touch and mouse move event to detect hovered day slice
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - svgRect.left;
    
    // Find closest index based on X coordinate
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < maxTemps.length; i++) {
      const xPos = getX(i);
      const distance = Math.abs(xPos - relativeX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    // Only trigger hover if we are reasonably close to the point
    if (minDistance < chartWidth / (maxTemps.length - 1) / 1.5) {
      setHoveredIndex(closestIndex);
    } else {
      setHoveredIndex(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden"
      id="weather-trend-chart-card"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5 font-sans">
            <TrendingUp className="h-4 w-4 text-sky-500" />
            <span>Temperature & Trend Analysis</span>
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Visualize maximum and minimum temperatures over 7 days
          </p>
        </div>

        {/* Legend indicators */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-orange-400 rounded-full inline-block" />
            <span className="text-slate-600">Day High</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-sky-400 rounded-full inline-block" />
            <span className="text-slate-600">Night Low</span>
          </span>
        </div>
      </div>

      {/* Interactive Chart Drawing */}
      <div className="relative h-[260px] w-full" id="chart-viewport">
        <svg
          width="100%"
          height="100%"
          className="overflow-visible select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Gradients Definitions */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="maxLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
            <linearGradient id="minLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis Labels */}
          {yTicks.map((tick, i) => (
            <g key={`grid-${i}`} className="opacity-40">
              <line
                x1={padding.left}
                y1={tick.y}
                x2={dimensions.width - padding.right}
                y2={tick.y}
                stroke="#cbd5e1"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                className="text-[10px] font-mono fill-slate-500 font-medium"
                textAnchor="end"
              >
                {Math.round(tick.temp)}°
              </text>
            </g>
          ))}

          {/* Area shade representing temperature range */}
          <path d={areaPath} fill="url(#areaGradient)" className="transition-all duration-300" />

          {/* Max Temperature Line */}
          <path
            d={maxPath}
            fill="none"
            stroke="url(#maxLineGrad)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Min Temperature Line */}
          <path
            d={minPath}
            fill="none"
            stroke="url(#minLineGrad)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* X Axis Labels */}
          {daily.time.map((dateStr, index) => {
            const x = getX(index);
            const date = new Date(dateStr);
            const label = index === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
            const isToday = index === 0;

            return (
              <text
                key={`xlabel-${index}`}
                x={x}
                y={dimensions.height - 12}
                className={`text-[10px] font-sans font-medium text-center ${
                  isToday ? "fill-sky-500 font-bold" : "fill-slate-500"
                }`}
                textAnchor="middle"
              >
                {label}
              </text>
            );
          })}

          {/* Draw interactive hover tracking line */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={dimensions.height - padding.bottom}
                stroke="#38bdf8"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                className="pointer-events-none"
              />
              {/* Highlight Max Point */}
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(maxTemps[hoveredIndex])}
                r={6}
                fill="#f97316"
                stroke="#fff"
                strokeWidth={2}
                className="pointer-events-none shadow"
              />
              {/* Highlight Min Point */}
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(minTemps[hoveredIndex])}
                r={6}
                fill="#38bdf8"
                stroke="#fff"
                strokeWidth={2}
                className="pointer-events-none shadow"
              />
            </g>
          )}

          {/* Interactive touch targets over data columns */}
          {daily.time.map((_, index) => (
            <rect
              key={`target-${index}`}
              x={getX(index) - chartWidth / (maxTemps.length - 1) / 2}
              y={padding.top}
              width={chartWidth / (maxTemps.length - 1)}
              height={chartHeight}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoveredIndex(index)}
            />
          ))}
        </svg>

        {/* Dynamic HTML Tooltip inside parent */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/50 flex flex-col gap-1 text-xs transition-all duration-150"
            style={{
              left: `${Math.min(
                Math.max(getX(hoveredIndex) - 70, 10),
                dimensions.width - 150
              )}px`,
              top: `${Math.min(
                Math.max(getY(maxTemps[hoveredIndex]) - 80, 5),
                dimensions.height - 110
              )}px`,
            }}
            id="chart-tooltip"
          >
            <div className="font-semibold text-[10px] text-slate-300 font-sans uppercase tracking-wider">
              {new Date(daily.time[hoveredIndex]).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 font-sans font-medium text-slate-100">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
              High: <span className="font-bold font-mono">{Math.round(maxTemps[hoveredIndex])}°{isCelsius ? "C" : "F"}</span>
            </div>
            <div className="flex items-center gap-1.5 font-sans font-medium text-slate-100">
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
              Low: <span className="font-bold font-mono">{Math.round(minTemps[hoveredIndex])}°{isCelsius ? "C" : "F"}</span>
            </div>
            {daily.precipitation_probability_max[hoveredIndex] > 0 && (
              <div className="flex items-center gap-1 text-blue-300 text-[10px] mt-0.5 font-semibold font-mono">
                <CloudRain className="h-3 w-3 shrink-0" />
                Rain Prob: {daily.precipitation_probability_max[hoveredIndex]}%
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
