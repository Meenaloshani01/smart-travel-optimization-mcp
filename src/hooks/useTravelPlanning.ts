import { useState, useEffect, useCallback } from 'react'
import { travelApi, websocketEvents, TravelRequest, TravelPlan, Route3D, utils } from '../services/api'

interface TravelPlanningState {
  // Request state
  currentRequest: TravelRequest | null
  isPlanning: boolean
  planningError: string | null
  
  // Plan state
  currentPlan: TravelPlan | null
  selectedRoute: Route3D | null
  
  // Real-time data
  trafficData: any
  weatherData: any
  
  // UI state
  isLoading: boolean
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    timestamp: Date
  }>
}

export const useTravelPlanning = () => {
  const [state, setState] = useState<TravelPlanningState>({
    currentRequest: null,
    isPlanning: false,
    planningError: null,
    currentPlan: null,
    selectedRoute: null,
    trafficData: null,
    weatherData: null,
    isLoading: false,
    notifications: []
  })

  // Add notification
  const addNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    }
    
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, notification].slice(-5) // Keep last 5
    }))
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notification.id)
      }))
    }, 5000)
  }, [])

  // Create travel plan
  const createTravelPlan = useCallback(async (request: TravelRequest) => {
    console.log('🚀 createTravelPlan called with:', request)
    console.log('📍 Source:', request.source)
    console.log('📍 Destination:', request.destination)
    
    setState(prev => ({ ...prev, isPlanning: true, planningError: null, isLoading: true }))
    
    try {
      // Validate coordinates
      if (!request.source?.latitude || !request.source?.longitude) {
        throw new Error('Invalid source coordinates')
      }
      if (!request.destination?.latitude || !request.destination?.longitude) {
        throw new Error('Invalid destination coordinates')
      }
      
      // Add default values
      const fullRequest: TravelRequest = {
        user_id: 'user_' + Date.now(),
        time_constraints: {
          departure_time: new Date().toISOString(),
          flexibility_minutes: 15
        },
        budget_constraints: {
          max_cost: 2000,
          currency: 'INR'
        },
        preferences: {
          transport_modes: ['car', 'bus', 'train'],
          avoid_highways: false,
          avoid_tolls: false,
          prefer_scenic: false,
          accessibility_required: false
        },
        ...request
      }
      
      console.log('📤 Making API call with full request:', fullRequest)
      const plan = await travelApi.createTravelPlan(fullRequest)
      console.log('📥 API response received:', plan)
      
      if (!plan || !plan.recommended_route) {
        throw new Error('Invalid response from server')
      }
      
      setState(prev => ({
        ...prev,
        currentRequest: fullRequest,
        currentPlan: plan,
        selectedRoute: plan.recommended_route,
        isPlanning: false,
        isLoading: false
      }))
      
      console.log('✅ State updated successfully')
      console.log('📊 Current plan:', plan)
      console.log('📊 Has active plan:', !!plan)
      console.log('📊 Selected route:', plan.recommended_route)
      
      addNotification('success', 'Travel plan created successfully!')
      
      // Save to route history
      const historyRoute = {
        id: plan.id,
        from: fullRequest.source.address || 'Unknown',
        to: fullRequest.destination.address || 'Unknown',
        date: new Date().toISOString(),
        duration: utils.formatDuration(plan.recommended_route.total_duration),
        cost: utils.formatCost(plan.recommended_route.total_cost),
        mode: 'Mixed',
        isFavorite: false
      }
      
      // Save to localStorage
      const existingHistory = JSON.parse(localStorage.getItem('travel-history') || '[]')
      const updatedHistory = [historyRoute, ...existingHistory.slice(0, 9)] // Keep last 10
      localStorage.setItem('travel-history', JSON.stringify(updatedHistory))
      
      // Load real-time data
      if (plan.recommended_route?.id) {
        loadTrafficData(plan.recommended_route.id)
      }
      if (plan.recommended_route?.segments?.[0]?.coordinates?.[0]) {
        const coord = plan.recommended_route.segments[0].coordinates[0]
        loadWeatherData(coord.latitude, coord.longitude)
      }
      
      return plan
      
    } catch (error: any) {
      console.error('❌ API call failed:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create travel plan'
      setState(prev => ({
        ...prev,
        planningError: errorMessage,
        isPlanning: false,
        isLoading: false
      }))
      
      addNotification('error', errorMessage)
      throw error
    }
  }, [addNotification])

  // Select different route
  const selectRoute = useCallback((route: Route3D) => {
    setState(prev => ({ ...prev, selectedRoute: route }))
    
    // Load traffic data for new route
    loadTrafficData(route.id)
    addNotification('info', `Switched to ${route.id}`)
  }, [])

  // Optimize current plan
  const optimizePlan = useCallback(async () => {
    if (!state.currentPlan) return
    
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const optimizedPlan = await travelApi.optimizePlan(state.currentPlan.id)
      
      setState(prev => ({
        ...prev,
        currentPlan: optimizedPlan,
        selectedRoute: optimizedPlan.recommended_route,
        isLoading: false
      }))
      
      addNotification('success', 'Plan optimized based on current conditions!')
      
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }))
      addNotification('error', 'Failed to optimize plan')
    }
  }, [state.currentPlan, addNotification])

  // Load traffic data
  const loadTrafficData = useCallback(async (routeId: string) => {
    try {
      const traffic = await travelApi.getTrafficData(routeId)
      setState(prev => ({ ...prev, trafficData: traffic }))
    } catch (error) {
      console.error('Failed to load traffic data:', error)
    }
  }, [])

  // Load weather data
  const loadWeatherData = useCallback(async (lat: number, lng: number) => {
    try {
      const weather = await travelApi.getWeatherConditions(lat, lng)
      setState(prev => ({ ...prev, weatherData: weather }))
      
      // Show weather alert if needed
      if (weather.impact_on_travel !== 'minimal') {
        addNotification('warning', `Weather may impact travel: ${weather.conditions}`)
      }
    } catch (error) {
      console.error('Failed to load weather data:', error)
    }
  }, [addNotification])

  // Clear current plan
  const clearPlan = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentRequest: null,
      currentPlan: null,
      selectedRoute: null,
      trafficData: null,
      weatherData: null,
      planningError: null
    }))
  }, [])

  // Get formatted route info
  const getRouteInfo = useCallback((route: Route3D | null) => {
    if (!route) return null
    
    return {
      duration: utils.formatDuration(route.total_duration),
      cost: utils.formatCost(route.total_cost),
      distance: utils.formatDistance(route.total_distance),
      safetyRating: route.safety_rating,
      safetyColor: utils.getSafetyColor(route.safety_rating),
      estimatedDelay: route.estimated_delay ? utils.formatDuration(route.estimated_delay) : null
    }
  }, [])

  // Set up WebSocket listeners
  useEffect(() => {
    // Temporarily disable WebSocket to prevent connection errors
    // TODO: Re-enable when WebSocket issues are resolved
    /*
    const unsubscribePlanCreated = websocketEvents.onTravelPlanCreated((plan) => {
      addNotification('info', 'Travel plan updated in real-time')
    })
    
    const unsubscribePlanOptimized = websocketEvents.onPlanOptimized((plan) => {
      setState(prev => ({
        ...prev,
        currentPlan: plan,
        selectedRoute: plan.recommended_route
      }))
      addNotification('success', 'Plan automatically optimized!')
    })
    
    return () => {
      unsubscribePlanCreated()
      unsubscribePlanOptimized()
    }
    */
  }, [addNotification])

  // Auto-refresh traffic data every 2 minutes
  useEffect(() => {
    if (!state.selectedRoute) return
    
    const interval = setInterval(() => {
      loadTrafficData(state.selectedRoute!.id)
    }, 120000) // 2 minutes
    
    return () => clearInterval(interval)
  }, [state.selectedRoute, loadTrafficData])

  return {
    // State
    ...state,
    
    // Actions
    createTravelPlan,
    selectRoute,
    optimizePlan,
    clearPlan,
    
    // Utilities
    getRouteInfo,
    addNotification,
    
    // Computed values
    hasActivePlan: !!state.currentPlan,
    alternativeRoutes: state.currentPlan?.alternative_routes || [],
    transportOptions: state.currentPlan?.transport_recommendations || [],
    activeAlerts: state.currentPlan?.alerts?.filter(alert => 
      !alert.expires_at || new Date(alert.expires_at) > new Date()
    ) || []
  }
}