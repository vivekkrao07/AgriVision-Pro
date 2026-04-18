import React, { useState, useEffect } from 'react';
import { CloudRain, Thermometer, Droplets, MapPin, Wind, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WeatherContext = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState('Determining location...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking weather and location data
    // In a real app, this would use navigator.geolocation and an API
    setTimeout(() => {
      setWeather({
        temp: 24,
        humidity: 78,
        condition: 'High Humidity',
        wind: 12,
        risk: 'High risk of fungal disease due to humidity'
      });
      setLocation('Chennai, Tamil Nadu');
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
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
    >
      <div className="weather-header">
        <div className="location-info">
          <MapPin size={14} className="text-green" />
          <span>{location}</span>
        </div>
        <div className="weather-badge">Live Context</div>
      </div>

      <div className="weather-grid">
        <div className="weather-stat">
          <Thermometer size={16} />
          <div className="stat-details">
            <span className="stat-val">{weather.temp}°C</span>
            <span className="stat-label">Temp</span>
          </div>
        </div>
        <div className="weather-stat">
          <Droplets size={16} />
          <div className="stat-details">
            <span className="stat-val">{weather.humidity}%</span>
            <span className="stat-label">Humidity</span>
          </div>
        </div>
        <div className="weather-stat">
          <Wind size={16} />
          <div className="stat-details">
            <span className="stat-val">{weather.wind} km/h</span>
            <span className="stat-label">Wind</span>
          </div>
        </div>
      </div>

      <div className="weather-insight-box">
        <AlertCircle size={14} className="text-yellow" />
        <p>{weather.risk}</p>
      </div>
    </motion.div>
  );
};

export default WeatherContext;
