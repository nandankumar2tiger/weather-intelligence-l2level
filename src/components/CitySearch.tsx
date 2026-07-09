import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Star, History, X, Loader2 } from "lucide-react";
import { GeocodingResult, FavoriteCity } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CitySearchProps {
  onCitySelected: (city: GeocodingResult) => void;
  favorites: FavoriteCity[];
  onToggleFavorite: (city: FavoriteCity) => void;
  currentCity?: GeocodingResult | null;
}

export const CitySearch: React.FC<CitySearchProps> = ({
  onCitySelected,
  favorites,
  onToggleFavorite,
  currentCity,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<GeocodingResult[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("weather_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recent searches", e);
    }
  }, []);

  // Handle outside clicks to close the suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions with a debounce as the user types
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query
          )}&count=6&language=en&format=json`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch suggestions");
        }
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setSuggestions(data.results);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        // We don't block the user with typing errors unless they search explicitly
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const saveRecentSearch = (city: GeocodingResult) => {
    try {
      let searches = [...recentSearches];
      // Filter out duplicates
      searches = searches.filter((s) => s.id !== city.id);
      searches.unshift(city); // Add to top
      searches = searches.slice(0, 5); // Keep last 5
      setRecentSearches(searches);
      localStorage.setItem("weather_recent_searches", JSON.stringify(searches));
    } catch (e) {
      console.error("Failed to save recent search", e);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=5&language=en&format=json`
      );
      if (!response.ok) {
        throw new Error("Network response was not OK");
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const bestMatch = data.results[0];
        onCitySelected(bestMatch);
        saveRecentSearch(bestMatch);
        setIsFocused(false);
        setQuery(""); // Clear on select
      } else {
        setError(`No city found matching "${query}". Please check the spelling.`);
      }
    } catch (err) {
      setError("Unable to search right now. Please check your internet connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCity = (city: GeocodingResult) => {
    onCitySelected(city);
    saveRecentSearch(city);
    setQuery("");
    setSuggestions([]);
    setIsFocused(false);
  };

  const removeRecentSearch = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = recentSearches.filter((item) => item.id !== id);
    setRecentSearches(filtered);
    localStorage.setItem("weather_recent_searches", JSON.stringify(filtered));
  };

  // Check if current city is already favorited
  const isCurrentCityFavorited = currentCity
    ? favorites.some(
        (f) =>
          f.latitude === currentCity.latitude &&
          f.longitude === currentCity.longitude
      )
    : false;

  return (
    <div className="w-full max-w-xl mx-auto mb-6" ref={dropdownRef} id="city-search-container">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            id="city-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search for cities (e.g., London, Tokyo, Paris)..."
            className="w-full pl-11 pr-10 py-3.5 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md focus:shadow-lg focus:border-sky-500 focus:outline-none transition-all duration-300 text-slate-800 font-sans text-sm md:text-base placeholder-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          id="city-search-submit"
          type="submit"
          disabled={loading}
          className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:from-sky-400 disabled:to-blue-400 text-white font-medium rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all duration-300 flex items-center gap-2 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline">Search</span>
            </>
          )}
        </button>

        {currentCity && (
          <button
            id="toggle-fav-btn"
            type="button"
            onClick={() =>
              onToggleFavorite({
                name: currentCity.name,
                country: currentCity.country,
                admin1: currentCity.admin1,
                latitude: currentCity.latitude,
                longitude: currentCity.longitude,
              })
            }
            title={isCurrentCityFavorited ? "Remove from Favorites" : "Add to Favorites"}
            className={`p-3.5 rounded-2xl border shadow-md flex items-center justify-center transition-all duration-300 cursor-pointer ${
              isCurrentCityFavorited
                ? "bg-amber-500/10 border-amber-300 text-amber-500 hover:bg-amber-500/20"
                : "bg-white/70 backdrop-blur-md border-slate-200/80 text-slate-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50/20"
            }`}
          >
            <Star className={`h-5 w-5 ${isCurrentCityFavorited ? "fill-current" : ""}`} />
          </button>
        )}
      </form>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 p-3 bg-red-50/90 border border-red-200 text-red-600 rounded-xl text-xs md:text-sm shadow-sm flex items-start gap-2.5"
            id="search-error-box"
          >
            <span className="font-semibold shrink-0">⚠️ Error:</span>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Autocomplete suggestions and History Dropdown */}
      <AnimatePresence>
        {isFocused && (query.trim().length >= 2 || recentSearches.length > 0 || favorites.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="absolute left-0 right-0 z-50 mt-2 max-w-xl mx-auto bg-white/95 backdrop-blur-lg rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden divide-y divide-slate-100"
            id="search-dropdown"
          >
            {/* Dynamic Suggestions (API Results) */}
            {query.trim().length >= 2 && (
              <div className="py-2">
                <div className="px-4 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Suggestions
                </div>
                {loading && suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                    Searching cities...
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between text-sm text-slate-700 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="h-4 w-4 text-sky-500 shrink-0" />
                        <div>
                          <span className="font-medium text-slate-800">{city.name}</span>
                          {(city.admin1 || city.country) && (
                            <span className="text-xs text-slate-500 ml-1.5">
                              • {[city.admin1, city.country].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                      </span>
                    </button>
                  ))
                ) : (
                  !loading && (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      No matching cities found.
                    </div>
                  )
                )}
              </div>
            )}

            {/* Favorite Cities Quick Search */}
            {query.trim().length < 2 && favorites.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-[11px] font-semibold text-amber-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-current" /> Favorites
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-2">
                  {favorites.map((fav) => (
                    <button
                      key={`${fav.latitude}-${fav.longitude}`}
                      type="button"
                      onClick={() => {
                        onCitySelected({
                          id: Date.now() + Math.random(),
                          name: fav.name,
                          latitude: fav.latitude,
                          longitude: fav.longitude,
                          country: fav.country,
                          admin1: fav.admin1,
                        });
                        setIsFocused(false);
                      }}
                      className="px-3 py-2 bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-100 rounded-xl text-left text-xs text-slate-700 transition-all flex items-center gap-2 cursor-pointer group"
                    >
                      <MapPin className="h-3.5 w-3.5 text-amber-400 group-hover:text-amber-500 shrink-0" />
                      <div className="truncate">
                        <div className="font-medium text-slate-800 truncate">{fav.name}</div>
                        {fav.country && <div className="text-[10px] text-slate-400 truncate">{fav.country}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {query.trim().length < 2 && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" /> Recent Searches
                </div>
                {recentSearches.map((city) => (
                  <div
                    key={`recent-${city.id}`}
                    onClick={() => {
                      onCitySelected(city);
                      setIsFocused(false);
                    }}
                    className="px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-sm text-slate-700 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <History className="h-4 w-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-medium text-slate-700">{city.name}</span>
                        {(city.admin1 || city.country) && (
                          <span className="text-xs text-slate-400 ml-1.5">
                            {[city.admin1, city.country].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => removeRecentSearch(city.id, e)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                      title="Clear from history"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Default Quick Search helper if nothing is searched / favorited yet */}
            {query.trim().length < 2 && recentSearches.length === 0 && favorites.length === 0 && (
              <div className="p-4 text-center">
                <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-sans">
                  Type a city name above to look up weather.
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {["Tokyo", "New York", "London", "Sydney", "Paris"].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setQuery(name)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-lg text-[11px] text-slate-600 transition-all font-medium cursor-pointer"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
