import React from 'react'
import { motion } from 'framer-motion'
import { Calculator, MapPin, Clock, IndianRupee } from 'lucide-react'

interface DistanceCalculatorProps {
  from?: string
  to?: string
  onCalculate?: (result: {
    distance: number
    duration: number
    cost: number
  }) => void
}

const DistanceCalculator: React.FC<DistanceCalculatorProps> = ({
  from,
  to,
  onCalculate
}) => {
  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const getCityCoordinates = (cityName: string) => {
    const coordinates: { [key: string]: { lat: number; lng: number } } = {
      'puducherry': { lat: 11.9416, lng: 79.8083 },
      'pondicherry': { lat: 11.9416, lng: 79.8083 },
      'ooty': { lat: 11.4064, lng: 76.6932 },
      'udhagamandalam': { lat: 11.4064, lng: 76.6932 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'bengaluru': { lat: 12.9716, lng: 77.5946 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'delhi': { lat: 28.7041, lng: 77.1025 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'kochi': { lat: 9.9312, lng: 76.2673 },
      'mysore': { lat: 12.2958, lng: 76.6394 },
      'coimbatore': { lat: 11.0168, lng: 76.9558 }
    }
    
    const key = cityName.toLowerCase().trim()
    return coordinates[key] || null
  }

  const calculateRoute = () => {
    if (!from || !to) return null

    const fromCoords = getCityCoordinates(from)
    const toCoords = getCityCoordinates(to)

    if (!fromCoords || !toCoords) return null

    const distance = calculateDistance(
      fromCoords.lat, fromCoords.lng,
      toCoords.lat, toCoords.lng
    )

    // Calculate realistic travel time (average 50 km/h)
    const duration = distance / 50

    // Calculate cost (₹6 per km including fuel, tolls, etc.)
    const cost = distance * 6

    return {
      distance: Math.round(distance * 10) / 10,
      duration: Math.round(duration * 10) / 10,
      cost: Math.round(cost)
    }
  }

  const result = calculateRoute()

  if (!from || !to || !result) {
    return (
      <motion.div 
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Calculator className="w-8 h-8 text-white/40 mx-auto mb-2" />
        <p className="text-white/60 text-sm">Enter cities to see distance calculation</p>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border border-white/10 rounded-lg p-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center space-x-2 mb-3">
        <Calculator className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-medium text-white">Route Calculation</h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span className="text-white/60">Distance</span>
          </div>
          <span className="text-white font-medium">{result.distance} km</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 text-blue-400" />
            <span className="text-white/60">Est. Time</span>
          </div>
          <span className="text-white font-medium">
            {result.duration < 1 
              ? `${Math.round(result.duration * 60)}m` 
              : `${Math.floor(result.duration)}h ${Math.round((result.duration % 1) * 60)}m`
            }
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IndianRupee className="w-3 h-3 text-amber-400" />
            <span className="text-white/60">Est. Cost</span>
          </div>
          <span className="text-white font-medium">₹{result.cost.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-xs text-white/50">
          * Estimates based on direct distance and average road conditions
        </p>
      </div>
    </motion.div>
  )
}

export default DistanceCalculator