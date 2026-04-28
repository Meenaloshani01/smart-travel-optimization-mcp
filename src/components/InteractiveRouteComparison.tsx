import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Clock, 
  IndianRupee, 
  Shield, 
  Leaf, 
  Zap,
  Star,
  ChevronRight,
  Award,
  Target
} from 'lucide-react'

interface RouteOption {
  id: string
  name: string
  duration: number // minutes
  cost: number // rupees
  safety: number // 0-10
  eco: number // 0-10
  comfort: number // 0-10
  traffic: 'low' | 'medium' | 'high'
  highlights: string[]
}

interface InteractiveRouteComparisonProps {
  onRouteSelect: (routeId: string) => void
}

const InteractiveRouteComparison: React.FC<InteractiveRouteComparisonProps> = ({ onRouteSelect }) => {
  const [priorities, setPriorities] = useState({
    time: 30,
    cost: 25,
    safety: 25,
    eco: 20
  })
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null)

  // Sample routes - in real app, these would come from MCP tools
  const routes: RouteOption[] = [
    {
      id: 'route-1',
      name: 'Fastest Route',
      duration: 180,
      cost: 1500,
      safety: 8.5,
      eco: 6.0,
      comfort: 8.0,
      traffic: 'low',
      highlights: ['Highway route', 'Minimal stops', 'Good road conditions']
    },
    {
      id: 'route-2',
      name: 'Economical Route',
      duration: 240,
      cost: 600,
      safety: 7.5,
      eco: 8.5,
      comfort: 6.5,
      traffic: 'medium',
      highlights: ['Public transport', 'Eco-friendly', 'Budget-friendly']
    },
    {
      id: 'route-3',
      name: 'Scenic Route',
      duration: 210,
      cost: 1200,
      safety: 9.0,
      eco: 7.0,
      comfort: 9.0,
      traffic: 'low',
      highlights: ['Beautiful views', 'Safe roads', 'Comfortable journey']
    },
    {
      id: 'route-4',
      name: 'Balanced Route',
      duration: 200,
      cost: 1000,
      safety: 8.0,
      eco: 7.5,
      comfort: 7.5,
      traffic: 'medium',
      highlights: ['Good balance', 'Reliable timing', 'Moderate cost']
    }
  ]

  const calculateScore = (route: RouteOption) => {
    // Normalize values to 0-1 scale
    const timeScore = 1 - (route.duration / 300) // Lower is better
    const costScore = 1 - (route.cost / 2000) // Lower is better
    const safetyScore = route.safety / 10
    const ecoScore = route.eco / 10

    // Calculate weighted score
    const score = (
      timeScore * (priorities.time / 100) +
      costScore * (priorities.cost / 100) +
      safetyScore * (priorities.safety / 100) +
      ecoScore * (priorities.eco / 100)
    ) * 100

    return Math.round(score)
  }

  const sortedRoutes = [...routes].sort((a, b) => calculateScore(b) - calculateScore(a))
  const bestRoute = sortedRoutes[0]

  const handlePriorityChange = (key: keyof typeof priorities, value: number) => {
    const remaining = 100 - value
    const otherKeys = Object.keys(priorities).filter(k => k !== key) as Array<keyof typeof priorities>
    const otherTotal = otherKeys.reduce((sum, k) => sum + priorities[k], 0)
    
    const newPriorities = { ...priorities, [key]: value }
    
    // Distribute remaining percentage proportionally
    otherKeys.forEach(k => {
      newPriorities[k] = Math.round((priorities[k] / otherTotal) * remaining)
    })
    
    setPriorities(newPriorities)
  }

  const getTrafficColor = (traffic: string) => {
    switch (traffic) {
      case 'low': return 'text-emerald-400'
      case 'medium': return 'text-amber-400'
      case 'high': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Smart Route Comparison</h2>
          <p className="text-white/60 text-sm">Adjust priorities to find your perfect route</p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-lg border border-blue-400/30">
          <Award className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-medium">AI Optimized</span>
        </div>
      </div>

      {/* Priority Sliders */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-400" />
          Your Priorities
        </h3>
        <div className="space-y-4">
          {/* Time Priority */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm">Time</span>
              </div>
              <span className="text-white font-medium">{priorities.time}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={priorities.time}
              onChange={(e) => handlePriorityChange('time', parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-blue"
            />
          </div>

          {/* Cost Priority */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                <span className="text-white text-sm">Cost</span>
              </div>
              <span className="text-white font-medium">{priorities.cost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={priorities.cost}
              onChange={(e) => handlePriorityChange('cost', parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-emerald"
            />
          </div>

          {/* Safety Priority */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm">Safety</span>
              </div>
              <span className="text-white font-medium">{priorities.safety}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={priorities.safety}
              onChange={(e) => handlePriorityChange('safety', parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-purple"
            />
          </div>

          {/* Eco Priority */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Leaf className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm">Eco-Friendly</span>
              </div>
              <span className="text-white font-medium">{priorities.eco}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={priorities.eco}
              onChange={(e) => handlePriorityChange('eco', parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-green"
            />
          </div>
        </div>
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedRoutes.map((route, index) => {
          const score = calculateScore(route)
          const isBest = route.id === bestRoute.id
          const isSelected = route.id === selectedRoute
          const isHovered = route.id === hoveredRoute

          return (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredRoute(route.id)}
              onMouseLeave={() => setHoveredRoute(null)}
              onClick={() => {
                setSelectedRoute(route.id)
                onRouteSelect(route.id)
              }}
              className={`relative cursor-pointer rounded-xl p-5 border-2 transition-all ${
                isBest
                  ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-400/50 shadow-lg shadow-yellow-500/20'
                  : isSelected
                  ? 'bg-white/10 border-blue-400 shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Best Route Badge */}
              {isBest && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg"
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span>BEST MATCH</span>
                </motion.div>
              )}

              {/* Route Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{route.name}</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`text-xs font-medium ${getTrafficColor(route.traffic)}`}>
                      {route.traffic.toUpperCase()} TRAFFIC
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{score}</div>
                  <div className="text-xs text-white/60">Match Score</div>
                </div>
              </div>

              {/* Route Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-white/60">Duration</span>
                  </div>
                  <div className="text-white font-semibold">{Math.floor(route.duration / 60)}h {route.duration % 60}m</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-white/60">Cost</span>
                  </div>
                  <div className="text-white font-semibold">₹{route.cost}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-white/60">Safety</span>
                  </div>
                  <div className="text-white font-semibold">{route.safety}/10</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Leaf className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-white/60">Eco Score</span>
                  </div>
                  <div className="text-white font-semibold">{route.eco}/10</div>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-1 mb-4">
                {route.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-white/70">
                    <ChevronRight className="w-3 h-3 text-blue-400" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Select Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-2 rounded-lg font-medium text-sm transition-all ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isSelected ? 'Selected' : 'Select Route'}
              </motion.button>

              {/* Hover Effect */}
              <AnimatePresence>
                {isHovered && !isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* MCP Tools Used */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Powered by MCP Tools</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['route_planner', 'budget_calculator', 'safety_analyzer', 'traffic_analyzer', 'time_predictor'].map((tool) => (
            <span
              key={tool}
              className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InteractiveRouteComparison
