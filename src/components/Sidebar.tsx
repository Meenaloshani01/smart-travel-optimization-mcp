import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Clock, 
  IndianRupee, 
  Search, 
  Car,
  Bus,
  Train,
  Bike,
  ChevronLeft,
  Navigation,
  Loader,
  AlertCircle,
  Calendar,
  Users,
  Zap,
  TrendingUp,
  Star,
  Filter,
  Settings
} from 'lucide-react'
import DistanceCalculator from './DistanceCalculator'

interface SidebarProps {
  travelPlanning: any
  apiConnected: boolean
  onLocationUpdate?: (from: string, to: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ travelPlanning, apiConnected, onLocationUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    time: '',
    date: '',
    budget: '',
    passengers: '1',
    preferences: {
      avoidTolls: false,
      preferScenic: false,
      ecoFriendly: false
    }
  })

  const handleSearch = async () => {
    console.log('🔍 Start Planning clicked!')
    console.log('Form data:', formData)
    
    if (!formData.from || !formData.to) {
      console.log('❌ Missing source or destination')
      travelPlanning.addNotification('error', 'Please enter both source and destination')
      return
    }

    // Update locations for map
    if (onLocationUpdate) {
      onLocationUpdate(formData.from, formData.to)
    }

    try {
      console.log('✅ Creating travel request...')
      
      // Geocode addresses to get realistic coordinates
      const geocodeCity = (cityName: string) => {
        const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
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
          'ahmedabad': { lat: 23.0225, lng: 72.5714 },
          'jaipur': { lat: 26.9124, lng: 75.7873 },
          'kochi': { lat: 9.9312, lng: 76.2673 },
          'mysore': { lat: 12.2958, lng: 76.6394 },
          'coimbatore': { lat: 11.0168, lng: 76.9558 },
          'madurai': { lat: 9.9252, lng: 78.1198 },
          'trichy': { lat: 10.7905, lng: 78.7047 },
          'salem': { lat: 11.6643, lng: 78.1460 }
        }
        
        const key = cityName.toLowerCase().trim()
        return cityCoordinates[key] || { lat: 20.5937, lng: 78.9629 } // Default to center of India
      }
      
      const sourceCoords = geocodeCity(formData.from)
      const destCoords = geocodeCity(formData.to)
      
      // Create travel request
      const request = {
        source: {
          latitude: sourceCoords.lat,
          longitude: sourceCoords.lng,
          address: formData.from
        },
        destination: {
          latitude: destCoords.lat,
          longitude: destCoords.lng,
          address: formData.to
        },
        time_constraints: formData.time ? {
          departure_time: new Date(`${new Date().toDateString()} ${formData.time}`).toISOString()
        } : undefined,
        budget_constraints: formData.budget ? {
          max_cost: parseFloat(formData.budget)
        } : undefined
      }

      console.log('📤 Sending request:', request)
      const result = await travelPlanning.createTravelPlan(request)
      console.log('📥 Received result:', result)
      
    } catch (error) {
      console.error('❌ Search failed:', error)
      travelPlanning.addNotification('error', `Search failed: ${error.message}`)
    }
  }

  const transportModes = [
    { icon: Car, name: 'Car', time: '30 min', cost: '₹1,500', color: 'text-blue-400' },
    { icon: Bus, name: 'Bus', time: '45 min', cost: '₹250', color: 'text-emerald-400' },
    { icon: Train, name: 'Train', time: '35 min', cost: '₹800', color: 'text-purple-400' },
    { icon: Bike, name: 'Bike', time: '60 min', cost: '₹0', color: 'text-amber-400' },
  ]

  return (
    <motion.div 
      className={`${isExpanded ? 'w-80' : 'w-12'} bg-white/5 backdrop-blur-md border-l border-white/10 transition-all duration-300 flex flex-col relative z-20`}
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Toggle Button */}
      <button
        className="absolute -left-6 top-4 w-6 h-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronLeft className={`w-3 h-3 text-white transition-transform ${isExpanded ? '' : 'rotate-180'}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="p-6 flex flex-col h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-1">Plan Journey</h2>
              <p className="text-sm text-white/60">Find your optimal route</p>
              {!apiConnected && (
                <div className="mt-2 flex items-center space-x-2 text-amber-400 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>Demo mode - limited functionality</span>
                </div>
              )}
            </div>
            
              {/* Search Form */}
              <div className="space-y-4 mb-6">
                {/* From Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-xs text-white/60 mb-2 font-medium">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-emerald-400" />
                    <input
                      type="text"
                      placeholder="Enter starting point"
                      value={formData.from}
                      onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                    />
                  </div>
                </motion.div>

                {/* To Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-xs text-white/60 mb-2 font-medium">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-red-400" />
                    <input
                      type="text"
                      placeholder="Enter destination"
                      value={formData.to}
                      onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all"
                    />
                  </div>
                </motion.div>

                {/* Advanced Options Toggle */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    <span>More Options</span>
                    <motion.div
                      animate={{ rotate: showAdvanced ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▼
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 space-y-3 overflow-hidden"
                      >
                        {/* Date and Time Row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-white/60 mb-2 font-medium">Date</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-2.5 w-3 h-3 text-blue-400" />
                              <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full pl-9 pr-2 py-2 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-blue-400 transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-white/60 mb-2 font-medium">Time</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-2.5 w-3 h-3 text-blue-400" />
                              <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                className="w-full pl-9 pr-2 py-2 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-blue-400 transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Budget */}
                        <div>
                          <label className="block text-xs text-white/60 mb-2 font-medium">Max Budget (Optional)</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-2.5 w-3 h-3 text-amber-400" />
                            <input
                              type="number"
                              placeholder="e.g., 3000"
                              value={formData.budget}
                              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-white/40 focus:outline-none focus:border-amber-400 transition-all"
                            />
                          </div>
                        </div>

                        {/* Preferences */}
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.preferences.avoidTolls}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                preferences: { ...prev.preferences, avoidTolls: e.target.checked }
                              }))}
                              className="w-3 h-3 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                            />
                            <span className="text-white/80 text-xs">Avoid tolls</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.preferences.ecoFriendly}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                preferences: { ...prev.preferences, ecoFriendly: e.target.checked }
                              }))}
                              className="w-3 h-3 text-green-500 bg-white/10 border-white/20 rounded focus:ring-green-500"
                            />
                            <span className="text-white/80 text-xs">Eco-friendly options</span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Search Button */}
                <motion.button 
                  onClick={handleSearch}
                  disabled={travelPlanning.isLoading || !formData.from || !formData.to}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all transform hover:scale-105 disabled:hover:scale-100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {travelPlanning.isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Planning...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Find Routes</span>
                      <Zap className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>

            {/* Distance Calculator */}
            {formData.from && formData.to && (
              <div className="mb-6">
                <DistanceCalculator
                  from={formData.from}
                  to={formData.to}
                />
              </div>
            )}

            {/* Current Plan Info */}
            {travelPlanning.hasActivePlan && (
              <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                <h3 className="text-sm font-medium text-white/80 mb-2">Current Plan</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Duration:</span>
                    <span className="text-white">{travelPlanning.getRouteInfo(travelPlanning.selectedRoute)?.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Cost:</span>
                    <span className="text-white">{travelPlanning.getRouteInfo(travelPlanning.selectedRoute)?.cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Safety:</span>
                    <span className="text-white">{travelPlanning.selectedRoute?.safety_rating}/10</span>
                  </div>
                </div>
                
                {travelPlanning.alternativeRoutes.length > 0 && (
                  <button 
                    onClick={travelPlanning.optimizePlan}
                    className="mt-3 w-full bg-emerald-500/20 text-emerald-400 py-2 rounded text-sm hover:bg-emerald-500/30 transition-colors"
                  >
                    Optimize Plan
                  </button>
                )}
              </div>
            )}

            {/* Quick Route History */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white/80">Recent Routes</h3>
                <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {/* Sample recent routes - in real app, load from localStorage */}
                {[
                  { from: 'Chennai', to: 'Bangalore', time: '2h ago', cost: '₹1,200' },
                  { from: 'Mumbai', to: 'Pune', time: '1d ago', cost: '₹800' }
                ].map((route, index) => (
                  <motion.div
                    key={index}
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded cursor-pointer transition-colors"
                    whileHover={{ x: 2 }}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, from: route.from, to: route.to }))
                      travelPlanning.addNotification('info', `Loaded route: ${route.from} → ${route.to}`)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white truncate">
                        {route.from} → {route.to}
                      </div>
                      <Star className="w-3 h-3 text-white/40 hover:text-yellow-400 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60 mt-1">
                      <span>{route.time}</span>
                      <span>{route.cost}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Transport Options */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white/80 mb-3">Transport Options</h3>
              <div className="space-y-2">
                {(travelPlanning.transportOptions.length > 0 ? travelPlanning.transportOptions : transportModes).map((mode, index) => (
                  <motion.div
                    key={mode.mode || mode.name}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors"
                    whileHover={{ x: 4 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {mode.icon ? (
                          <mode.icon className={mode.color} />
                        ) : (
                          <Car className="w-4 h-4 text-blue-400" />
                        )}
                        <span className="text-sm font-medium text-white">{mode.mode || mode.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-white">
                          {mode.estimated_time ? `${Math.round(mode.estimated_time / 60)}m` : mode.time}
                        </div>
                        <div className="text-xs text-white/60">
                          {mode.cost !== undefined && mode.cost !== null ? 
                            (typeof mode.cost === 'number' ? `$${mode.cost.toFixed(2)}` : mode.cost) : 
                            'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Active Alerts */}
            {travelPlanning.activeAlerts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-white/80 mb-2">Active Alerts</h3>
                {travelPlanning.activeAlerts.map((alert: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 mb-2 ${
                      alert.severity === 'high' ? 'bg-red-500/10 border-red-400' :
                      alert.severity === 'medium' ? 'bg-amber-500/10 border-amber-400' :
                      'bg-blue-500/10 border-blue-400'
                    }`}
                  >
                    <div className="text-sm font-medium text-white">{alert.type.toUpperCase()}</div>
                    <div className="text-xs text-white/70 mt-1">{alert.message}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Navigation className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">System Status</span>
              </div>
              <div className="text-xs text-white/60">
                {apiConnected ? 'Connected to Smart Travel API' : 'Running in demo mode'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Sidebar