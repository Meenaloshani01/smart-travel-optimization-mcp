import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  Thermometer,
  Droplets,
  Eye,
  Gauge
} from 'lucide-react'

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  pressure: number
  feelsLike: number
}

interface WeatherWidgetProps {
  location?: string
  weatherData?: WeatherData
  isLoading?: boolean
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  location = 'Current Location',
  weatherData,
  isLoading = false
}) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData>({
    temperature: 28,
    condition: 'partly_cloudy',
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    pressure: 1013,
    feelsLike: 32
  })

  useEffect(() => {
    if (weatherData) {
      setCurrentWeather(weatherData)
    }
  }, [weatherData])

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return Sun
      case 'cloudy':
      case 'overcast':
        return Cloud
      case 'rainy':
      case 'rain':
        return CloudRain
      case 'snowy':
      case 'snow':
        return CloudSnow
      default:
        return Cloud
    }
  }

  const getWeatherColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return 'text-yellow-400'
      case 'cloudy':
      case 'overcast':
        return 'text-gray-400'
      case 'rainy':
      case 'rain':
        return 'text-blue-400'
      case 'snowy':
      case 'snow':
        return 'text-blue-200'
      default:
        return 'text-gray-400'
    }
  }

  const WeatherIcon = getWeatherIcon(currentWeather.condition)
  const weatherColor = getWeatherColor(currentWeather.condition)

  if (isLoading) {
    return (
      <motion.div 
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-8 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded"></div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border border-white/10 rounded-lg p-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-white/80">Weather</h3>
          <p className="text-xs text-white/60 truncate">{location}</p>
        </div>
        <WeatherIcon className={`w-6 h-6 ${weatherColor}`} />
      </div>

      {/* Main Temperature */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-3xl font-bold text-white">
          {currentWeather.temperature}°C
        </div>
        <div className="text-sm text-white/70">
          <div>Feels like {currentWeather.feelsLike}°C</div>
          <div className="capitalize">{currentWeather.condition.replace('_', ' ')}</div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Droplets className="w-3 h-3 text-blue-400" />
          <span className="text-white/60">Humidity</span>
          <span className="text-white font-medium">{currentWeather.humidity}%</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Wind className="w-3 h-3 text-green-400" />
          <span className="text-white/60">Wind</span>
          <span className="text-white font-medium">{currentWeather.windSpeed} km/h</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Eye className="w-3 h-3 text-purple-400" />
          <span className="text-white/60">Visibility</span>
          <span className="text-white font-medium">{currentWeather.visibility} km</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Gauge className="w-3 h-3 text-orange-400" />
          <span className="text-white/60">Pressure</span>
          <span className="text-white font-medium">{currentWeather.pressure} mb</span>
        </div>
      </div>

      {/* Travel Impact */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60">Travel Impact</span>
          <span className={`font-medium ${
            currentWeather.condition === 'rainy' ? 'text-amber-400' :
            currentWeather.condition === 'snowy' ? 'text-red-400' :
            'text-emerald-400'
          }`}>
            {currentWeather.condition === 'rainy' ? 'Moderate' :
             currentWeather.condition === 'snowy' ? 'High' :
             'Low'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default WeatherWidget