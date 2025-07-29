import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Thermometer, MapPin, Clock, Calendar } from 'lucide-react';

const Weather = () => {
  const [city, setCity] = useState('casablanca');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [villes, setVilles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVilles, setFilteredVilles] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const recuperVille = () => {
    fetch(`https://raw.githubusercontent.com/mboussaid/Maroc_Regions_Villes_API/refs/heads/main/json/Villes.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Problème API Ville");
        }
        return response.json();
      })
      .then((data) => {
        const sortedVilles = data
          .map((item) => ({ value: item.ville, label: item.ville }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setVilles(sortedVilles);
        setFilteredVilles(sortedVilles);
      })
      .catch((error) => {
        console.log(error);
        setError(error.message);
      });
  };

  const recuperWeather = (city) => {
    setLoading(true);
    Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
    ])
      .then(async ([weatherRes, forecastRes]) => {
        if (!weatherRes.ok || !forecastRes.ok) {
          throw new Error("Problème API");
        }
        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();
        return [weatherData, forecastData];
      })
      .then(([weatherData, forecastData]) => {
        setWeather(weatherData);
        setForecast(forecastData);
        setError(null);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setError(error.message);
        setWeather(null);
        setForecast(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    recuperVille();
  }, []);

  useEffect(() => {
    if (city) {
      recuperWeather(city);
    }
  }, [city]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = villes.filter(ville =>
        ville.label.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredVilles(filtered);
      setShowDropdown(true);
    } else {
      setFilteredVilles(villes);
      setShowDropdown(false);
    }
  };

  const selectCity = (selectedCity) => {
    setCity(selectedCity);
    setSearchQuery(selectedCity);
    setShowDropdown(false);
  };

  const getWeatherIcon = (weatherMain, size = 80) => {
    const iconProps = { size, className: "text-white drop-shadow-lg" };
    
    switch (weatherMain?.toLowerCase()) {
      case 'clear':
        return <Sun {...iconProps} className="text-yellow-300 drop-shadow-lg" />;
      case 'clouds':
        return <Cloud {...iconProps} />;
      case 'rain':
        return <CloudRain {...iconProps} className="text-blue-300 drop-shadow-lg" />;
      default:
        return <Cloud {...iconProps} />;
    }
  };

  const getBackgroundGradient = () => {
    if (!weather) return 'from-blue-400 via-purple-500 to-pink-500';
    
    const main = weather.weather[0].main.toLowerCase();
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;
    
    if (main === 'clear') {
      return isNight 
        ? 'from-indigo-900 via-purple-900 to-pink-900'
        : 'from-blue-400 via-cyan-500 to-teal-500';
    } else if (main === 'rain') {
      return 'from-gray-600 via-blue-700 to-indigo-800';
    } else if (main === 'clouds') {
      return 'from-gray-500 via-slate-600 to-blue-600';
    }
    return 'from-blue-400 via-purple-500 to-pink-500';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDailyForecast = () => {
    if (!forecast) return [];
    
    const daily = {};
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!daily[date] || new Date(item.dt * 1000).getHours() === 12) {
        daily[date] = item;
      }
    });
    
    return Object.values(daily).slice(0, 5);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000 p-4`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl animate-fade-in">
            Météo Maroc
          </h1>
          <div className="flex items-center justify-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span className="text-lg font-medium">{formatTime(currentTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={20} />
              <span className="text-lg">{formatDate(currentTime)}</span>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="relative max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="Rechercher une ville..."
              className="w-full px-6 py-4 text-lg rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/30 focus:bg-white/30 transition-all duration-300"
            />
            <MapPin className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70" size={24} />
          </div>
          
          {showDropdown && filteredVilles.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50">
              {filteredVilles.slice(0, 8).map((ville) => (
                <div
                  key={ville.value}
                  onClick={() => selectCity(ville.value)}
                  className="px-6 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  {ville.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white"></div>
          </div>
        )}

        {error && (
          <div className="text-center mb-8">
            <div className="bg-red-500/20 backdrop-blur-md border border-red-300/30 text-white px-6 py-4 rounded-2xl inline-block">
              {error}
            </div>
          </div>
        )}

        {weather && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Weather Card */}
            <div className="lg:col-span-2">
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                    <MapPin size={28} />
                    {weather.name}
                  </h2>
                  <p className="text-white/80 text-lg capitalize">{weather.weather[0].description}</p>
                </div>
                
                <div className="flex items-center justify-center mb-8">
                  {getWeatherIcon(weather.weather[0].main, 120)}
                  <div className="ml-8">
                    <div className="text-7xl font-bold text-white mb-2">
                      {Math.round(weather.main.temp)}°
                    </div>
                    <div className="text-white/70 text-xl">
                      Ressenti {Math.round(weather.main.feels_like)}°
                    </div>
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <Droplets className="mx-auto mb-2 text-blue-300" size={24} />
                    <div className="text-white/70 text-sm">Humidité</div>
                    <div className="text-white font-bold text-lg">{weather.main.humidity}%</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <Wind className="mx-auto mb-2 text-green-300" size={24} />
                    <div className="text-white/70 text-sm">Vent</div>
                    <div className="text-white font-bold text-lg">{weather.wind.speed} m/s</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <Eye className="mx-auto mb-2 text-purple-300" size={24} />
                    <div className="text-white/70 text-sm">Visibilité</div>
                    <div className="text-white font-bold text-lg">{weather.visibility ? (weather.visibility/1000).toFixed(1) + ' km' : 'N/A'}</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <Thermometer className="mx-auto mb-2 text-red-300" size={24} />
                    <div className="text-white/70 text-sm">Pression</div>
                    <div className="text-white font-bold text-lg">{weather.main.pressure} hPa</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Temperature Range */}
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 border border-white/30">
                <h3 className="text-white font-bold text-xl mb-4">Aujourd'hui</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white/70 text-sm">Maximum</div>
                    <div className="text-white font-bold text-2xl">{Math.round(weather.main.temp_max)}°</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/70 text-sm">Minimum</div>
                    <div className="text-white font-bold text-2xl">{Math.round(weather.main.temp_min)}°</div>
                  </div>
                </div>
              </div>

              {/* 5-Day Forecast */}
              {forecast && (
                <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 border border-white/30">
                  <h3 className="text-white font-bold text-xl mb-4">Prévisions 5 jours</h3>
                  <div className="space-y-3">
                    {getDailyForecast().map((day, index) => {
                      const date = new Date(day.dt * 1000);
                      const dayName = index === 0 ? 'Aujourd\'hui' : 
                                    date.toLocaleDateString('fr-FR', { weekday: 'short' });
                      
                      return (
                        <div key={day.dt} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            {getWeatherIcon(day.weather[0].main, 32)}
                            <span className="text-white font-medium">{dayName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white">
                            <span className="font-bold">{Math.round(day.main.temp_max)}°</span>
                            <span className="text-white/60">{Math.round(day.main.temp_min)}°</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sun Times */}
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 border border-white/30">
                <h3 className="text-white font-bold text-xl mb-4">Soleil</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Lever du soleil</span>
                    <span className="text-white font-medium">
                      {new Date(weather.sys.sunrise * 1000).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Coucher du soleil</span>
                    <span className="text-white font-medium">
                      {new Date(weather.sys.sunset * 1000).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hourly Forecast */}
        {forecast && !loading && (
          <div className="mt-8">
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 border border-white/30">
              <h3 className="text-white font-bold text-xl mb-6">Prévisions horaires</h3>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {forecast.list.slice(0, 8).map((hour) => {
                  const time = new Date(hour.dt * 1000);
                  return (
                    <div key={hour.dt} className="flex-shrink-0 text-center bg-white/10 rounded-2xl p-4 min-w-[100px]">
                      <div className="text-white/70 text-sm mb-2">
                        {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="mb-2 flex justify-center">
                        {getWeatherIcon(hour.weather[0].main, 40)}
                      </div>
                      <div className="text-white font-bold text-lg">
                        {Math.round(hour.main.temp)}°
                      </div>
                      <div className="text-white/60 text-xs mt-1">
                        {Math.round(hour.pop * 100)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-white/60">
          <p>Données météorologiques fournies par OpenWeatherMap</p>
          <p className="text-sm mt-2">Mise à jour en temps réel</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Weather;