import React, { useState, useEffect, useCallback } from 'react';
import { Thermometer, Droplets, MapPin, Wind, AlertCircle, CheckCircle2, Edit2, Search, X, Navigation, Clock } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const WeatherContext = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState('Determining location...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Manual location state
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  // Mouse interaction state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const backgroundGlow = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(250px circle at ${x}px ${y}px, var(--accent-glow), transparent 80%)`
  );

  const fetchWeatherOnly = async (lat, lon) => {
    try {
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
      const weatherData = await weatherRes.json();

      const current = weatherData.current;
      const temp = current.temperature_2m;
      const humidity = current.relative_humidity_2m;
      const wind = current.wind_speed_10m;

      let riskMsg = "Optimal conditions for growth and field operations.";
      let riskLevel = "low";

      if (wind > 20) {
        riskMsg = "High winds detected. Delay chemical spraying to prevent pesticide drift.";
        riskLevel = "medium";
      } else if (temp > 35) {
        riskMsg = "Extreme heat stress. Ensure adequate irrigation to protect yields.";
        riskLevel = "medium";
      } else if (temp < 10) {
        riskMsg = "Frost risk. Monitor vulnerable crops closely.";
        riskLevel = "medium";
      }

      setWeather({ temp, humidity, wind, risk: riskMsg, riskLevel });
      setError(false);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch weather data:", err);
      setError(true);
      setLoading(false);
    }
  };

  const fetchWeatherData = async (lat, lon) => {
    try {
      const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      const geoData = await geoRes.json();
      setLocation(`${geoData.city || geoData.locality || 'Unknown Area'}, ${geoData.principalSubdivision || geoData.countryCode}`);
      await fetchWeatherOnly(lat, lon);
    } catch (err) {
      console.error("Failed to reverse geocode:", err);
      // Still try to get weather even if location naming fails
      await fetchWeatherOnly(lat, lon);
    }
  };

  const handleManualSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchError('');

    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const locationData = data.results[0];
        const countryLabel = locationData.admin1 || locationData.country_code || '';
        setLocation(`${locationData.name}${countryLabel ? ', ' + countryLabel : ''}`);

        await fetchWeatherOnly(locationData.latitude, locationData.longitude);
        setIsEditingLocation(false);
        setSearchQuery('');
      } else {
        setSearchError('City not found');
        setLoading(false);
      }
    } catch (err) {
      setSearchError('Search failed');
      setLoading(false);
    }
  };

  const detectLocation = useCallback(() => {
    setLoading(true);
    const fallbackLocation = () => {
      fetchWeatherData(28.6139, 77.2090); // New Delhi
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation denied or failed. Using fallback.");
          fallbackLocation();
        },
        { timeout: 10000 }
      );
    } else {
      fallbackLocation();
    }
  }, []);

  useEffect(() => {
    detectLocation();

    // Timer for live clock
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [detectLocation]);

  if (loading && !weather) {
    return (
      <div className="weather-card skeleton">
        <div className="skeleton-line" style={{ width: '60%' }}></div>
        <div className="skeleton-line" style={{ width: '40%' }}></div>
      </div>
    );
  }

  return (
    <motion.div
      className="weather-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 15px 35px rgba(16, 185, 129, 0.25)",
        borderColor: "rgba(16, 185, 129, 0.5)"
      }}
      onMouseMove={handleMouseMove}
      style={{
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        position: 'relative',
        overflow: 'hidden',
        background: backgroundGlow
      }}
    >
      {/* Dynamic Glow Layer */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: backgroundGlow,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      {/* Animated Shine Effect */}
      <motion.div
        initial={{ left: '-100%' }}
        whileHover={{ left: '100%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          top: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
      <div className="weather-header" style={{ flexWrap: 'wrap', gap: '10px' }}>

        <AnimatePresence mode="wait">
          {isEditingLocation ? (
            <motion.form
              key="search"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: 0 }}
              className="location-search-form"
              onSubmit={handleManualSearch}
              style={{ display: 'flex', width: '100%', gap: '8px', alignItems: 'center' }}
            >
              <input
                type="text"
                placeholder="Enter city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '14px' }}
              />
              <button type="submit" style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer' }}>
                <Search size={16} />
              </button>
              <button type="button" onClick={() => { setIsEditingLocation(false); setSearchError(''); }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="location-info"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MapPin size={14} style={{ color: '#34d399' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{location}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <Clock size={10} /> {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
              <button
                onClick={() => setIsEditingLocation(true)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', opacity: 0.6, cursor: 'pointer', display: 'flex', padding: '2px' }}
                title="Change location"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={detectLocation}
                style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'flex', padding: '2px', marginLeft: '4px' }}
                title="Detect my location"
              >
                <Navigation size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!isEditingLocation && <div className="weather-badge live-pulse" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.2)' }}>Live API</div>}
      </div>

      {searchError && (
        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '-5px', marginBottom: '10px' }}>
          {searchError}
        </div>
      )}

      {error ? (
        <div className="weather-insight-box" style={{ marginTop: '10px' }}>
          <AlertCircle size={14} className="text-red" />
          <p>Weather data unavailable at the moment.</p>
        </div>
      ) : weather ? (
        <>
          <div className="weather-grid" style={{ opacity: loading ? 0.5 : 1 }}>
            <motion.div
              className="weather-stat"
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.05)" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Thermometer size={16} />
              <div className="stat-details">
                <span className="stat-val">{Math.round(weather.temp)}°C</span>
                <span className="stat-label">Temp</span>
              </div>
            </motion.div>
            <motion.div
              className="weather-stat"
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.05)" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Droplets size={16} />
              <div className="stat-details">
                <span className="stat-val">{weather.humidity}%</span>
                <span className="stat-label">Humidity</span>
              </div>
            </motion.div>
            <motion.div
              className="weather-stat"
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.05)" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Wind size={16} />
              <div className="stat-details">
                <span className="stat-val">{weather.wind} km/h</span>
                <span className="stat-label">Wind</span>
              </div>
            </motion.div>
          </div>

          <div className="weather-insight-box" style={{ background: weather.riskLevel === 'high' ? 'rgba(239, 68, 68, 0.1)' : weather.riskLevel === 'medium' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(16, 185, 129, 0.1)', opacity: loading ? 0.5 : 1 }}>
            {weather.riskLevel === 'low' ? (
              <CheckCircle2 size={14} style={{ color: '#34d399' }} />
            ) : (
              <AlertCircle size={14} className={weather.riskLevel === 'high' ? 'text-red' : 'text-yellow'} />
            )}
            <p style={{ color: weather.riskLevel === 'high' ? '#fca5a5' : weather.riskLevel === 'medium' ? '#fde047' : '#86efac' }}>
              {weather.risk}
            </p>
          </div>
        </>
      ) : null}
    </motion.div>
  );
};

export default WeatherContext;
