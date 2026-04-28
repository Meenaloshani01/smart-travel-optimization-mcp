import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Navigation, 
  MapPin, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Radio
} from 'lucide-react'

interface LiveTrackingProps {
  isActive?: boolean
  currentLocation?: { lat: number; lng: number }
  destination?: { lat: number; lng: number }
  onLocationUpdate?: (location: { lat: number; lng: number }) => void
}

const LiveTracking: React.FC<LiveTrackingProps> = ({
  isActive = false,
  currentLocation,
  destination,
  onLocationUpdate
}) => {
  const [tracking, setTracking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [eta, setEta] = useState('2h 30m')
  const [distanceRemaining, setDistanceRemaining] = useState(145)

  useEffect(() => {
    if (!tracking) return

    // Simulate location updates
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 100))
      setDistanceRemaining(prev => Math.max(prev - 3, 0))
      
      // Update ETA
      const remainingMinutes = Math.floor(distanceRemaining / 50 * 60)
      const hours = Math.floor(remainingMinutes / 60)
      const minutes = remainingMinutes % 60
      setEta(`${hours}h ${minutes}m`)
    }, 5000)

    return () => clearInterval(interval)
  }, [tracking, distanceRemaining])

  const startTracking = () => {
    setTracking(true)
    // Request geolocation permission
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          onLocationUpdate?.(location)
        },
        (error) => {
          console.error('Geolocation error:', error)
        },
        { enableHighAccuracy: true, maximumAge: 10000 }
      )
    }
  }

  const stopTracking = () => {
    setTracking(false)
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border border-white/10 rounded-lg p-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Radio className={`w-5 h-5 ${tracking ? 'text-emerald-400 animate-pulse' : 'text-white/60'}`} />
          <h3 className="text-lg font-semibold text-white">Live Tracking</h3>
        </div>
        <button
          onClick={tracking ? stopTracking : startTracking}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            tracking 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
          }`}
        >
          {tracking ? 'Stop' : 'Start'}
        </button>
      </div>

      {tracking ? (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">Journey Progress</span>
              <span className="text-sm font-medium text-white">{progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div 
                className="h-2 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-white/60">ETA</span>
              </div>
              <div className="text-lg font-bold text-white">{eta}</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-white/60">Remaining</span>
              </div>
              <div className="text-lg font-bold text-white">{distanceRemaining} km</div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-white/80">On track • No delays</span>
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-white/60 mb-2">Upcoming</div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-white/80">Rest stop in 45 km</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span className="text-white/80">Toll plaza in 78 km</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <Navigation className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60 text-sm mb-4">
            Start tracking to see real-time updates
          </p>
          <div className="text-xs text-white/40">
            • Live location updates<br/>
            • ETA predictions<br/>
            • Traffic alerts
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default LiveTracking