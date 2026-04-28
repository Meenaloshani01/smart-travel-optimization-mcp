import React from 'react'
import { motion } from 'framer-motion'
import { 
  Navigation, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Car,
  TrendingUp,
  Activity
} from 'lucide-react'

interface TrafficData {
  congestionLevel: 'low' | 'moderate' | 'high' | 'severe'
  averageSpeed: number
  incidents: number
  estimatedDelay: number
  alternativeRoutes: number
}

interface TrafficStatusProps {
  trafficData?: TrafficData
  isLoading?: boolean
}

const TrafficStatus: React.FC<TrafficStatusProps> = ({
  trafficData,
  isLoading = false
}) => {
  const defaultTraffic: TrafficData = {
    congestionLevel: 'moderate',
    averageSpeed: 45,
    incidents: 2,
    estimatedDelay: 8,
    alternativeRoutes: 3
  }

  const traffic = trafficData || defaultTraffic

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-emerald-400'
      case 'moderate': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'severe': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getCongestionBg = (level: string) => {
    switch (level) {
      case 'low': return 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/20'
      case 'moderate': return 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/20'
      case 'high': return 'from-orange-500/10 to-orange-600/10 border-orange-500/20'
      case 'severe': return 'from-red-500/10 to-red-600/10 border-red-500/20'
      default: return 'from-gray-500/10 to-gray-600/10 border-gray-500/20'
    }
  }

  const getCongestionIcon = (level: string) => {
    switch (level) {
      case 'low': return CheckCircle
      case 'moderate': return Clock
      case 'high': return AlertTriangle
      case 'severe': return AlertTriangle
      default: return Activity
    }
  }

  const CongestionIcon = getCongestionIcon(traffic.congestionLevel)
  const congestionColor = getCongestionColor(traffic.congestionLevel)
  const congestionBg = getCongestionBg(traffic.congestionLevel)

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
      className={`bg-gradient-to-br ${congestionBg} backdrop-blur-md border rounded-lg p-4`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-white/80">Traffic Status</h3>
          <p className="text-xs text-white/60">Real-time conditions</p>
        </div>
        <CongestionIcon className={`w-6 h-6 ${congestionColor}`} />
      </div>

      {/* Main Status */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`text-2xl font-bold ${congestionColor}`}>
          {traffic.congestionLevel.charAt(0).toUpperCase() + traffic.congestionLevel.slice(1)}
        </div>
        <div className="text-sm text-white/70">
          <div>{traffic.averageSpeed} km/h avg speed</div>
          <div>{traffic.estimatedDelay} min delay</div>
        </div>
      </div>

      {/* Traffic Details */}
      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
        <div className="flex items-center space-x-2">
          <Car className="w-3 h-3 text-blue-400" />
          <span className="text-white/60">Speed</span>
          <span className="text-white font-medium">{traffic.averageSpeed} km/h</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-3 h-3 text-orange-400" />
          <span className="text-white/60">Incidents</span>
          <span className="text-white font-medium">{traffic.incidents}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3 text-purple-400" />
          <span className="text-white/60">Delay</span>
          <span className="text-white font-medium">{traffic.estimatedDelay} min</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Navigation className="w-3 h-3 text-green-400" />
          <span className="text-white/60">Alt Routes</span>
          <span className="text-white font-medium">{traffic.alternativeRoutes}</span>
        </div>
      </div>

      {/* Traffic Level Indicator */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-white/60">Congestion Level</span>
          <span className={`font-medium ${congestionColor}`}>
            {Math.round((traffic.averageSpeed / 60) * 100)}%
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div 
            className={`h-2 rounded-full ${
              traffic.congestionLevel === 'low' ? 'bg-emerald-400' :
              traffic.congestionLevel === 'moderate' ? 'bg-yellow-400' :
              traffic.congestionLevel === 'high' ? 'bg-orange-400' :
              'bg-red-400'
            }`}
            initial={{ width: 0 }}
            animate={{ 
              width: `${
                traffic.congestionLevel === 'low' ? 25 :
                traffic.congestionLevel === 'moderate' ? 50 :
                traffic.congestionLevel === 'high' ? 75 :
                100
              }%` 
            }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default TrafficStatus