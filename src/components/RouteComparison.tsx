import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Route, 
  Clock, 
  IndianRupee, 
  Shield, 
  Leaf, 
  Star,
  ChevronDown,
  ChevronUp,
  Navigation,
  TrendingUp
} from 'lucide-react'

interface RouteOption {
  id: string
  name: string
  duration: number // in minutes
  cost: number // in rupees
  distance: number // in km
  safetyRating: number // 1-10
  ecoRating: number // 1-10
  comfortRating: number // 1-10
  trafficLevel: 'low' | 'moderate' | 'high'
  transportMode: string
  highlights: string[]
  warnings?: string[]
}

interface RouteComparisonProps {
  routes?: RouteOption[]
  selectedRoute?: string
  onRouteSelect?: (routeId: string) => void
}

const RouteComparison: React.FC<RouteComparisonProps> = ({
  routes,
  selectedRoute,
  onRouteSelect
}) => {
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)

  const defaultRoutes: RouteOption[] = [
    {
      id: 'route-1',
      name: 'Fastest Route',
      duration: 30,
      cost: 1500,
      distance: 25,
      safetyRating: 8.5,
      ecoRating: 6.0,
      comfortRating: 9.0,
      trafficLevel: 'moderate',
      transportMode: 'Car',
      highlights: ['Fastest option', 'Highway route', 'Toll roads'],
      warnings: ['Heavy traffic during peak hours']
    },
    {
      id: 'route-2',
      name: 'Scenic Route',
      duration: 45,
      cost: 800,
      distance: 35,
      safetyRating: 9.2,
      ecoRating: 8.5,
      comfortRating: 8.0,
      trafficLevel: 'low',
      transportMode: 'Train',
      highlights: ['Beautiful scenery', 'Less traffic', 'Eco-friendly'],
      warnings: []
    },
    {
      id: 'route-3',
      name: 'Budget Route',
      duration: 60,
      cost: 250,
      distance: 28,
      safetyRating: 7.8,
      ecoRating: 9.0,
      comfortRating: 6.5,
      trafficLevel: 'low',
      transportMode: 'Bus',
      highlights: ['Most affordable', 'Public transport', 'Frequent service'],
      warnings: ['Longer travel time', 'Multiple stops']
    }
  ]

  const routeOptions = routes || defaultRoutes

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-emerald-400'
      case 'moderate': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-emerald-400'
    if (rating >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-2 mb-4">
        <Route className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Route Comparison</h3>
        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
          {routeOptions.length} options
        </span>
      </div>

      {routeOptions.map((route, index) => (
        <motion.div
          key={route.id}
          className={`border rounded-lg overflow-hidden transition-all cursor-pointer ${
            selectedRoute === route.id
              ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/20'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          }`}
          onClick={() => onRouteSelect?.(route.id)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Main Route Info */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  selectedRoute === route.id ? 'bg-blue-400' : 'bg-white/40'
                }`} />
                <div>
                  <h4 className="font-semibold text-white">{route.name}</h4>
                  <p className="text-xs text-white/60">{route.transportMode} • {route.distance} km</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setExpandedRoute(expandedRoute === route.id ? null : route.id)
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                {expandedRoute === route.id ? (
                  <ChevronUp className="w-4 h-4 text-white/60" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/60" />
                )}
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                </div>
                <div className="text-sm font-medium text-white">{formatDuration(route.duration)}</div>
                <div className="text-xs text-white/60">Duration</div>
              </div>
              
              <div>
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <IndianRupee className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-sm font-medium text-white">₹{route.cost.toLocaleString()}</div>
                <div className="text-xs text-white/60">Cost</div>
              </div>
              
              <div>
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                </div>
                <div className={`text-sm font-medium ${getRatingColor(route.safetyRating)}`}>
                  {route.safetyRating}/10
                </div>
                <div className="text-xs text-white/60">Safety</div>
              </div>
              
              <div>
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <TrendingUp className={`w-3 h-3 ${getTrafficColor(route.trafficLevel)}`} />
                </div>
                <div className={`text-sm font-medium ${getTrafficColor(route.trafficLevel)}`}>
                  {route.trafficLevel}
                </div>
                <div className="text-xs text-white/60">Traffic</div>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {expandedRoute === route.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-white/10"
              >
                <div className="p-4 space-y-4">
                  {/* Detailed Ratings */}
                  <div>
                    <h5 className="text-sm font-medium text-white/80 mb-2">Detailed Ratings</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Leaf className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-white/60">Eco-Friendly</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-white/10 rounded-full h-1">
                            <div 
                              className="h-1 bg-green-400 rounded-full"
                              style={{ width: `${route.ecoRating * 10}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${getRatingColor(route.ecoRating)}`}>
                            {route.ecoRating}/10
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="w-3 h-3 text-purple-400" />
                          <span className="text-xs text-white/60">Comfort</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-white/10 rounded-full h-1">
                            <div 
                              className="h-1 bg-purple-400 rounded-full"
                              style={{ width: `${route.comfortRating * 10}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${getRatingColor(route.comfortRating)}`}>
                            {route.comfortRating}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  {route.highlights.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-white/80 mb-2">Highlights</h5>
                      <div className="space-y-1">
                        {route.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                            <span className="text-xs text-emerald-400">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {route.warnings && route.warnings.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-white/80 mb-2">Considerations</h5>
                      <div className="space-y-1">
                        {route.warnings.map((warning, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-amber-400 rounded-full" />
                            <span className="text-xs text-amber-400">{warning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default RouteComparison