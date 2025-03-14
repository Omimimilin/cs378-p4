import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const cities = [
  { name: 'Austin', lat: 30.2672, lon: -97.7431 },
  { name: 'Dallas', lat: 32.7767, lon: -96.7970 },
  { name: 'Houston', lat: 29.7604, lon: -95.3698 }
];

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [error, setError] = useState('');
  const [newCity, setNewCity] = useState('');

  useEffect(() => {
    fetchWeather(cities[0].lat, cities[0].lon);
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`);
      const data = await res.json();
      setWeatherData(data.hourly.time.slice(0, 12).map((time, index) => ({
        time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: ((data.hourly.temperature_2m[index] * 9/5) + 32).toFixed(1)
      })));
      setError('');
    } catch (err) {
      setError('Failed to load weather data.');
    }
  };

  const handleCityClick = (city) => {
    fetchWeather(city.lat, city.lon);
  };

  const handleAddCity = async () => {
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${newCity}&count=1`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const city = data.results[0];
        cities.push({ name: city.name, lat: city.latitude, lon: city.longitude });
        setNewCity('');
        fetchWeather(city.latitude, city.longitude);
      } else {
        setError(`Could not find weather for ${newCity}`);
      }
    } catch (err) {
      setError('Error fetching city data.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
    <div className="w-100" style={{ maxWidth: '600px' }}>
      <div className="btn-group w-100">
        {cities.map((city) => (
          <button key={city.name} className="btn btn-secondary" onClick={() => handleCityClick(city)}>
            {city.name}
          </button>
        ))}
      </div>
      <div className="mt-3 d-flex">
        <input
          type="text"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          className="form-control"
          placeholder="Add city"
        />
        <button onClick={handleAddCity} className="btn btn-primary ml-2">+</button>
      </div>
      {error && <div className="text-danger mt-2">{error}</div>}
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th className="w-50">Time</th>
            <th className="w-50">Temperature</th>
          </tr>
        </thead>
        <tbody>
          {weatherData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.time}</td>
              <td>{entry.temperature} F</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default WeatherApp;
