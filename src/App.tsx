import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import LoadingScreen from './components/LoadingScreen'
import LandingPage from './components/LandingPage'
import ErrorBoundary from './components/ErrorBoundary'
import QuickActions from './components/QuickActions'
import TravelStats from './components/TravelStats'
import FloatingNotifications from './components/FloatingNotifications'
import RouteMap from './components/RouteMap'
import WeatherWidget from './components/WeatherWidget'
import TrafficStatus from './components/TrafficStatus'
import RouteComparison from './components/RouteComparison'
import RouteHistory from './components/RouteHistory'
import AlertCenter from './components/AlertCenter'
import TravelAssistant from './components/TravelAssistant'
import { motion, AnimatePresence } from 'framer-motion'
import { useTravelPlanning } from './hooks/useTravelPlanning'
import { travelApi } from './services/api'
import { 
  MapPin, 
  Clock, 
  IndianRupee, 
  Shield, 
  Zap, 
  TrendingUp,
  Navigation,
  Star,
  Users,
  Bookmark,
  Share2,
  Download,
  RefreshCw,
  Map
} from 'lucide-react'

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [apiConnected, setApiConnected] = useState(false)
  const [selectedTransport, setSelectedTransport] = useState<string | null>(null)
  const [showRouteDetails, setShowRouteDetails] = useState(false)
  const [favoriteRoutes, setFavoriteRoutes] = useState<string[]>([])
  const [showMap, setShowMap] = useState(true)
  const [currentRoute, setCurrentRoute] = useState<{
    start: { lat: number; lng: number; name: string } | null
    end: { lat: number; lng: number; name: string } | null
  }>({ start: null, end: null })
  const travelPlanning = useTravelPlanning()

  const handleEnterApp = () => {
    setShowLanding(false)
  }

  // Check API connection on startup
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        console.log('🔍 Checking API connection to http://localhost:5000/health...')
        const response = await travelApi.healthCheck()
        console.log('✅ API Response:', response)
        setApiConnected(true)
        console.log('✅ Connected to Smart Travel API')
      } catch (error: any) {
        console.error('❌ Failed to connect to API:', error)
        console.error('❌ Error details:', error.message)
        console.error('❌ Is backend running on http://localhost:5000?')
        setApiConnected(false)
      }
    }

    // Check immediately when app loads
    checkApiConnection()
    
    // Also check every 5 seconds if not connected
    const interval = setInterval(() => {
      if (!apiConnected) {
        checkApiConnection()
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [apiConnected])

  const handleTransportSelect = (mode: string) => {
    setSelectedTransport(mode)
    travelPlanning.addNotification('info', `Selected ${mode} as preferred transport`)
  }

  const handleSaveRoute = () => {
    if (travelPlanning.selectedRoute) {
      const routeId = travelPlanning.selectedRoute.id
      if (!favoriteRoutes.includes(routeId)) {
        setFavoriteRoutes([...favoriteRoutes, routeId])
        travelPlanning.addNotification('success', 'Route saved to favorites!')
      }
    }
  }

  const handleShareRoute = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Smart Travel Route',
        text: 'Check out this optimized travel route!',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      travelPlanning.addNotification('success', 'Route link copied to clipboard!')
    }
  }

  const handleRefreshPlan = () => {
    if (travelPlanning.currentRequest) {
      travelPlanning.createTravelPlan(travelPlanning.currentRequest)
    }
  }

  // Function to update route locations for map
  const updateRouteLocations = (from: string, to: string) => {
    // Extended coordinates for Indian cities and popular destinations
    const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
      // Major Indian Cities
      'puducherry': { lat: 11.9416, lng: 79.8083 },
      'pondicherry': { lat: 11.9416, lng: 79.8083 },
      'ooty': { lat: 11.4064, lng: 76.6932 },
      'udhagamandalam': { lat: 11.4064, lng: 76.6932 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'madras': { lat: 13.0827, lng: 80.2707 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'bengaluru': { lat: 12.9716, lng: 77.5946 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'bombay': { lat: 19.0760, lng: 72.8777 },
      'delhi': { lat: 28.7041, lng: 77.1025 },
      'new delhi': { lat: 28.6139, lng: 77.2090 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'calcutta': { lat: 22.5726, lng: 88.3639 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'jaipur': { lat: 26.9124, lng: 75.7873 },
      'surat': { lat: 21.1702, lng: 72.8311 },
      'lucknow': { lat: 26.8467, lng: 80.9462 },
      'kanpur': { lat: 26.4499, lng: 80.3319 },
      'nagpur': { lat: 21.1458, lng: 79.0882 },
      'indore': { lat: 22.7196, lng: 75.8577 },
      'thane': { lat: 19.2183, lng: 72.9781 },
      'bhopal': { lat: 23.2599, lng: 77.4126 },
      'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
      'pimpri chinchwad': { lat: 18.6298, lng: 73.7997 },
      'patna': { lat: 25.5941, lng: 85.1376 },
      'vadodara': { lat: 22.3072, lng: 73.1812 },
      'ghaziabad': { lat: 28.6692, lng: 77.4538 },
      'ludhiana': { lat: 30.9010, lng: 75.8573 },
      'agra': { lat: 27.1767, lng: 78.0081 },
      'nashik': { lat: 19.9975, lng: 73.7898 },
      'faridabad': { lat: 28.4089, lng: 77.3178 },
      'meerut': { lat: 28.9845, lng: 77.7064 },
      'rajkot': { lat: 22.3039, lng: 70.8022 },
      'kalyan dombivali': { lat: 19.2403, lng: 73.1305 },
      'vasai virar': { lat: 19.4912, lng: 72.8054 },
      'varanasi': { lat: 25.3176, lng: 82.9739 },
      'srinagar': { lat: 34.0837, lng: 74.7973 },
      'aurangabad': { lat: 19.8762, lng: 75.3433 },
      'dhanbad': { lat: 23.7957, lng: 86.4304 },
      'amritsar': { lat: 31.6340, lng: 74.8723 },
      'navi mumbai': { lat: 19.0330, lng: 73.0297 },
      'allahabad': { lat: 25.4358, lng: 81.8463 },
      'prayagraj': { lat: 25.4358, lng: 81.8463 },
      'ranchi': { lat: 23.3441, lng: 85.3096 },
      'howrah': { lat: 22.5958, lng: 88.2636 },
      'coimbatore': { lat: 11.0168, lng: 76.9558 },
      'jabalpur': { lat: 23.1815, lng: 79.9864 },
      'gwalior': { lat: 26.2183, lng: 78.1828 },
      'vijayawada': { lat: 16.5062, lng: 80.6480 },
      'jodhpur': { lat: 26.2389, lng: 73.0243 },
      'madurai': { lat: 9.9252, lng: 78.1198 },
      'raipur': { lat: 21.2514, lng: 81.6296 },
      'kota': { lat: 25.2138, lng: 75.8648 },
      'chandigarh': { lat: 30.7333, lng: 76.7794 },
      'guwahati': { lat: 26.1445, lng: 91.7362 },
      'solapur': { lat: 17.6599, lng: 75.9064 },
      'hubli dharwad': { lat: 15.3647, lng: 75.1240 },
      'bareilly': { lat: 28.3670, lng: 79.4304 },
      'moradabad': { lat: 28.8386, lng: 78.7733 },
      'mysore': { lat: 12.2958, lng: 76.6394 },
      'mysuru': { lat: 12.2958, lng: 76.6394 },
      'gurgaon': { lat: 28.4595, lng: 77.0266 },
      'gurugram': { lat: 28.4595, lng: 77.0266 },
      'aligarh': { lat: 27.8974, lng: 78.0880 },
      'jalandhar': { lat: 31.3260, lng: 75.5762 },
      'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
      'trichy': { lat: 10.7905, lng: 78.7047 },
      'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
      'salem': { lat: 11.6643, lng: 78.1460 },
      'warangal': { lat: 17.9689, lng: 79.5941 },
      'mira bhayandar': { lat: 19.2952, lng: 72.8544 },
      'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
      'trivandrum': { lat: 8.5241, lng: 76.9366 },
      'bhiwandi': { lat: 19.3002, lng: 73.0635 },
      'saharanpur': { lat: 29.9680, lng: 77.5552 },
      'gorakhpur': { lat: 26.7606, lng: 83.3732 },
      'guntur': { lat: 16.3067, lng: 80.4365 },
      'bikaner': { lat: 28.0229, lng: 73.3119 },
      'amravati': { lat: 20.9374, lng: 77.7796 },
      'noida': { lat: 28.5355, lng: 77.3910 },
      'jamshedpur': { lat: 22.8046, lng: 86.2029 },
      'bhilai nagar': { lat: 21.1938, lng: 81.3509 },
      'cuttack': { lat: 20.4625, lng: 85.8828 },
      'firozabad': { lat: 27.1592, lng: 78.3957 },
      'kochi': { lat: 9.9312, lng: 76.2673 },
      'cochin': { lat: 9.9312, lng: 76.2673 },
      'bhavnagar': { lat: 21.7645, lng: 72.1519 },
      'dehradun': { lat: 30.3165, lng: 78.0322 },
      'durgapur': { lat: 23.5204, lng: 87.3119 },
      'asansol': { lat: 23.6739, lng: 86.9524 },
      'nanded waghala': { lat: 19.1383, lng: 77.2975 },
      'kolhapur': { lat: 16.7050, lng: 74.2433 },
      'ajmer': { lat: 26.4499, lng: 74.6399 },
      'akola': { lat: 20.7002, lng: 77.0082 },
      'gulbarga': { lat: 17.3297, lng: 76.8343 },
      'jamnagar': { lat: 22.4707, lng: 70.0577 },
      'ujjain': { lat: 23.1765, lng: 75.7885 },
      'loni': { lat: 28.7333, lng: 77.2833 },
      'siliguri': { lat: 26.7271, lng: 88.3953 },
      'jhansi': { lat: 25.4484, lng: 78.5685 },
      'ulhasnagar': { lat: 19.2215, lng: 73.1645 },
      'nellore': { lat: 14.4426, lng: 79.9865 },
      'jammu': { lat: 32.7266, lng: 74.8570 },
      'sangli miraj kupwad': { lat: 16.8524, lng: 74.5815 },
      'belgaum': { lat: 15.8497, lng: 74.4977 },
      'mangalore': { lat: 12.9141, lng: 74.8560 },
      'ambattur': { lat: 13.1143, lng: 80.1548 },
      'tirunelveli': { lat: 8.7139, lng: 77.7567 },
      'malegaon': { lat: 20.5579, lng: 74.5287 },
      'gaya': { lat: 24.7914, lng: 85.0002 }
    }

    const fromKey = from.toLowerCase().trim()
    const toKey = to.toLowerCase().trim()

    // Try to find exact match first, then partial match
    let startCoords = cityCoordinates[fromKey]
    let endCoords = cityCoordinates[toKey]

    // If exact match not found, try partial matching
    if (!startCoords) {
      const partialMatch = Object.keys(cityCoordinates).find(key => 
        key.includes(fromKey) || fromKey.includes(key)
      )
      if (partialMatch) {
        startCoords = cityCoordinates[partialMatch]
      }
    }

    if (!endCoords) {
      const partialMatch = Object.keys(cityCoordinates).find(key => 
        key.includes(toKey) || toKey.includes(key)
      )
      if (partialMatch) {
        endCoords = cityCoordinates[partialMatch]
      }
    }

    // Default to center of India if not found
    if (!startCoords) startCoords = { lat: 20.5937, lng: 78.9629 }
    if (!endCoords) endCoords = { lat: 21.5937, lng: 79.9629 }

    setCurrentRoute({
      start: { ...startCoords, name: from },
      end: { ...endCoords, name: to }
    })
  }

  // Listen for travel plan updates to update map
  useEffect(() => {
    if (travelPlanning.currentRequest) {
      const fromAddress = travelPlanning.currentRequest.source?.address || ''
      const toAddress = travelPlanning.currentRequest.destination?.address || ''
      if (fromAddress && toAddress) {
        updateRouteLocations(fromAddress, toAddress)
      }
    }
  }, [travelPlanning.currentRequest])

  if (showLanding) {
    return <LandingPage onEnterApp={handleEnterApp} />
  }

  return (
    <motion.div 
      className="h-screen w-screen overflow-hidden relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            x: [-50, 50, -50],
            y: [-50, 50, -50],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>
      {/* API Connection Status */}
      {!apiConnected && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
          ⚠️ Backend API not connected - using demo mode
        </div>
      )}

      {/* Notifications */}
      <FloatingNotifications 
        notifications={travelPlanning.notifications}
        onDismiss={(id) => {
          // Add dismiss functionality to travel planning hook if needed
        }}
      />
      
      {/* AI Travel Assistant */}
      <TravelAssistant 
        travelPlanning={travelPlanning}
        currentRoute={currentRoute}
      />
      
      {/* Alert Center */}
      <AlertCenter
        alerts={(travelPlanning.activeAlerts || []).map(alert => ({
          id: alert.id || Date.now().toString() + Math.random(),
          type: (alert.type || 'info') as any,
          title: (alert.type || 'info').charAt(0).toUpperCase() + (alert.type || 'info').slice(1) + ' Alert',
          message: alert.message || 'No message',
          timestamp: alert.created_at ? new Date(alert.created_at) : new Date(),
          location: alert.location?.address,
          severity: (alert.severity || 'low') as any,
          actionable: true
        }))}
        onDismiss={(alertId) => {
          travelPlanning.addNotification('info', 'Alert dismissed')
        }}
      />
      
      {/* Header */}
      <Header />
      
      {/* Main content area */}
      <div className="flex h-[calc(100vh-64px)] relative">
        {/* Main Content Area - Results and Map */}
        <motion.div 
          className="flex-1 relative p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="h-full flex flex-col space-y-4">
            {/* Toggle Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowMap(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    !showMap 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  📊 Results
                </button>
                <button
                  onClick={() => setShowMap(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showMap 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  🗺️ Map View
                </button>
              </div>
              
              {travelPlanning.hasActivePlan && (
                <QuickActions
                  onSave={handleSaveRoute}
                  onShare={handleShareRoute}
                  onRefresh={handleRefreshPlan}
                  hasActivePlan={travelPlanning.hasActivePlan}
                />
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
              <AnimatePresence mode="wait">
                {showMap ? (
                  <motion.div
                    key="map"
                    className="h-full"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RouteMap
                      startLocation={currentRoute.start}
                      endLocation={currentRoute.end}
                      routeData={travelPlanning.hasActivePlan ? {
                        duration: travelPlanning.getRouteInfo(travelPlanning.selectedRoute)?.duration || '30m',
                        cost: travelPlanning.getRouteInfo(travelPlanning.selectedRoute)?.cost || '₹1,500',
                        distance: '25 km',
                        mode: selectedTransport || 'Car'
                      } : undefined}
                      isLoading={travelPlanning.isLoading}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    className="h-full p-6 overflow-y-auto"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                  >
                    {travelPlanning.hasActivePlan ? (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-1">Travel Plan Results</h2>
                          <p className="text-white/60 text-sm">Optimized route for your journey</p>
                        </div>
                        
                        {/* Route Information Cards */}
                        <TravelStats
                          duration={travelPlanning.getRouteInfo(travelPlanning.selectedRoute)?.duration || '30m'}
                          cost={travelPlanning.getRouteInfo(travelPlanning.selectedRoute)?.cost || '₹1,500'}
                          safetyRating={travelPlanning.selectedRoute?.safety_rating || 8.5}
                          efficiency={Math.round((travelPlanning.selectedRoute?.safety_rating || 8.5) * 10)}
                        />

                        {/* Weather and Traffic Status Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <WeatherWidget
                            location={currentRoute.start?.name || 'Current Location'}
                            isLoading={travelPlanning.isLoading}
                          />
                          <TrafficStatus
                            isLoading={travelPlanning.isLoading}
                          />
                        </div>

                        {/* Route Comparison */}
                        <RouteComparison
                          selectedRoute={travelPlanning.selectedRoute?.id}
                          onRouteSelect={(routeId) => {
                            // Find and select the route
                            const allRoutes = [
                              travelPlanning.selectedRoute,
                              ...travelPlanning.alternativeRoutes
                            ].filter(Boolean)
                            const route = allRoutes.find(r => r?.id === routeId)
                            if (route) {
                              travelPlanning.selectRoute(route)
                            }
                          }}
                        />

                        {/* Route Details Toggle */}
                        <div>
                          <button
                            onClick={() => setShowRouteDetails(!showRouteDetails)}
                            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
                          >
                            <Navigation className="w-4 h-4" />
                            <span className="font-medium">Route Details</span>
                            <motion.div
                              animate={{ rotate: showRouteDetails ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              ▼
                            </motion.div>
                          </button>
                          
                          <AnimatePresence>
                            {showRouteDetails && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                                    <span className="text-white">Start: {currentRoute.start?.name || 'Current Location'}</span>
                                  </div>
                                  <div className="flex items-center space-x-3 ml-6">
                                    <div className="w-1 h-8 bg-white/20 rounded"></div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                    <span className="text-white">Destination: {currentRoute.end?.name || 'Target Location'}</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Interactive Transport Options */}
                        {travelPlanning.transportOptions.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                              Transport Options
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                              {travelPlanning.transportOptions.map((option, index) => (
                                <motion.div
                                  key={index}
                                  className={`cursor-pointer rounded-xl p-4 border transition-all ${
                                    selectedTransport === option.mode
                                      ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/20'
                                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                                  }`}
                                  onClick={() => handleTransportSelect(option.mode)}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        selectedTransport === option.mode ? 'bg-blue-500/30' : 'bg-white/10'
                                      }`}>
                                        <span className="text-xl">
                                          {option.mode === 'car' ? '🚗' : 
                                           option.mode === 'bus' ? '🚌' : 
                                           option.mode === 'train' ? '🚊' : '🚲'}
                                        </span>
                                      </div>
                                      <div>
                                        <div className="text-white font-semibold capitalize">{option.mode}</div>
                                        <div className="text-white/60 text-sm">
                                          {Math.round(option.estimated_time / 60)} minutes
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-white font-bold text-lg">
                                        ₹{(option.cost || 0).toFixed(0)}
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                        <span className="text-white/60 text-xs">
                                          {(option.comfort_rating || 0)}/10
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {selectedTransport === option.mode && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      className="mt-4 pt-4 border-t border-white/10"
                                    >
                                      <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                          <div className="text-emerald-400 font-medium">Eco-Friendly</div>
                                          <div className="text-white/60 text-sm">{(option.environmental_impact || 0)}/10</div>
                                        </div>
                                        <div>
                                          <div className="text-blue-400 font-medium">Comfort</div>
                                          <div className="text-white/60 text-sm">{(option.comfort_rating || 0)}/10</div>
                                        </div>
                                        <div>
                                          <div className="text-purple-400 font-medium">Availability</div>
                                          <div className="text-white/60 text-sm capitalize">{option.availability || 'unknown'}</div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Alerts Section */}
                        {travelPlanning.activeAlerts.length > 0 && (
                          <motion.div 
                            className="bg-gradient-to-r from-amber-500/10 to-red-500/10 rounded-xl p-4 border border-amber-500/20"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center">
                              ⚠️ Travel Alerts
                            </h3>
                            {travelPlanning.activeAlerts.map((alert, index) => (
                              <div key={index} className="bg-amber-500/20 border-l-4 border-amber-400 p-3 rounded mb-2 last:mb-0">
                                <div className="text-amber-400 font-medium capitalize">{alert.type}</div>
                                <div className="text-white/80 text-sm">{alert.message}</div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center max-w-md">
                          <motion.div 
                            className="text-8xl mb-6"
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 4,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          >
                            🗺️
                          </motion.div>
                          <h2 className="text-3xl font-bold text-white mb-4">Plan Your Journey</h2>
                          <p className="text-white/60 text-lg mb-8">
                            Enter your travel details in the sidebar to discover optimized routes with real-time pricing
                          </p>
                          
                          {/* Quick Stats */}
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-2xl font-bold text-blue-400">10+</div>
                              <div className="text-xs text-white/60">Transport Modes</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-2xl font-bold text-emerald-400">₹</div>
                              <div className="text-xs text-white/60">Indian Pricing</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-2xl font-bold text-amber-400">AI</div>
                              <div className="text-xs text-white/60">Optimized</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        
        {/* Sidebar */}
        <ErrorBoundary fallback={
          <div className="w-80 bg-white/5 backdrop-blur-md border-l border-white/10 p-6">
            <div className="text-red-400 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <div className="text-lg font-medium mb-2">Sidebar Error</div>
              <div className="text-sm text-white/60">Please refresh the page</div>
            </div>
          </div>
        }>
          <Sidebar 
            travelPlanning={travelPlanning}
            apiConnected={apiConnected}
            onLocationUpdate={updateRouteLocations}
          />
        </ErrorBoundary>
      </div>
    </motion.div>
  )
}

export default App