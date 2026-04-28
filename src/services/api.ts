import axios from 'axios'
import { io, Socket } from 'socket.io-client'

// API Configuration
const API_BASE_URL = 'http://localhost:5000'
const WS_URL = 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// WebSocket connection
let socket: Socket | null = null

export const connectWebSocket = () => {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    })
    
    socket.on('connect', () => {
      console.log('✅ Connected to Smart Travel API')
    })
    
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Smart Travel API')
    })
    
    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
    })
  }
  
  return socket
}

// Types
export interface Location {
  latitude: number
  longitude: number
  elevation?: number
  address?: string
  place_id?: string
}

export interface TravelRequest {
  id?: string
  user_id?: string
  source: Location
  destination: Location
  time_constraints?: {
    departure_time?: string
    arrival_time?: string
    flexibility_minutes?: number
  }
  budget_constraints?: {
    max_cost?: number
    preferred_cost?: number
    currency?: string
  }
  preferences?: {
    transport_modes?: string[]
    avoid_highways?: boolean
    avoid_tolls?: boolean
    prefer_scenic?: boolean
    accessibility_required?: boolean
  }
}

export interface Route3D {
  id: string
  segments: RouteSegment[]
  total_distance: number
  total_duration: number
  total_cost: number
  safety_rating: number
  weather_impact?: any
  traffic_conditions?: any[]
  estimated_delay?: number
  risk_factors?: string[]
  cost_breakdown?: Record<string, number>
}

export interface RouteSegment {
  coordinates: Array<{
    latitude: number
    longitude: number
    elevation: number
    timestamp?: string
  }>
  transport_mode: string
  distance_meters: number
  duration_seconds: number
  cost: number
  instructions?: string[]
  traffic_conditions?: any[]
}

export interface TravelPlan {
  id: string
  request_id: string
  recommended_route: Route3D
  alternative_routes: Route3D[]
  transport_recommendations: TransportOption[]
  alerts: Alert[]
  confidence_score: number
  created_at: string
  expires_at: string
}

export interface TransportOption {
  mode: string
  estimated_time: number
  cost: number
  comfort_rating: number
  environmental_impact: number
  availability: string
  schedule?: string[]
  booking_url?: string
}

export interface Alert {
  type: string
  severity: string
  message: string
  location?: Location
  expires_at?: string
  created_at?: string
}

// API Functions
export const travelApi = {
  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health')
      return response.data
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  },

  // Create travel plan
  async createTravelPlan(travelRequest: TravelRequest): Promise<TravelPlan> {
    try {
      console.log('🌐 API: Making request to /api/v1/travel/plan')
      console.log('🌐 API: Request data:', travelRequest)
      
      const response = await api.post('/api/v1/travel/plan', travelRequest)
      
      console.log('🌐 API: Response received:', response.data)
      return response.data
    } catch (error) {
      console.error('🌐 API: Request failed:', error)
      console.error('🌐 API: Error response:', error.response?.data)
      console.error('🌐 API: Error status:', error.response?.status)
      throw error
    }
  },

  // Get route alternatives
  async getRouteAlternatives(source: string, destination: string): Promise<Route3D[]> {
    try {
      const response = await api.get('/api/v1/travel/routes', {
        params: { source, destination }
      })
      return response.data.routes || []
    } catch (error) {
      console.error('Failed to get route alternatives:', error)
      throw error
    }
  },

  // Optimize existing plan
  async optimizePlan(planId: string): Promise<TravelPlan> {
    try {
      const response = await api.post('/api/v1/travel/optimize', { plan_id: planId })
      return response.data
    } catch (error) {
      console.error('Failed to optimize plan:', error)
      throw error
    }
  },

  // Get real-time traffic data
  async getTrafficData(routeId: string) {
    try {
      const response = await api.get('/api/v1/realtime/traffic', {
        params: { route_id: routeId }
      })
      return response.data
    } catch (error) {
      console.error('Failed to get traffic data:', error)
      throw error
    }
  },

  // Get weather conditions
  async getWeatherConditions(lat: number, lng: number) {
    try {
      const response = await api.get('/api/v1/realtime/weather', {
        params: { lat, lng }
      })
      return response.data
    } catch (error) {
      console.error('Failed to get weather conditions:', error)
      throw error
    }
  },

  // Get transport modes
  async getTransportModes(source: string, destination: string) {
    try {
      const response = await api.get('/api/v1/transport/modes', {
        params: { source, destination }
      })
      return response.data
    } catch (error) {
      console.error('Failed to get transport modes:', error)
      throw error
    }
  },

  // Analyze safety
  async analyzeSafety(route: Route3D, timeOfDay: string = 'day') {
    try {
      const response = await api.post('/api/v1/safety/analyze', {
        route,
        time_of_day: timeOfDay
      })
      return response.data
    } catch (error) {
      console.error('Failed to analyze safety:', error)
      throw error
    }
  }
}

// WebSocket event handlers
export const websocketEvents = {
  // Subscribe to route updates
  subscribeToRoute(routeId: string, callback: (data: any) => void) {
    const ws = connectWebSocket()
    ws.emit('subscribe_to_route', { route_id: routeId })
    ws.on('route_updated', callback)
    return () => ws.off('route_updated', callback)
  },

  // Send location update
  updateLocation(userId: string, latitude: number, longitude: number) {
    const ws = connectWebSocket()
    ws.emit('location_update', {
      user_id: userId,
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    })
  },

  // Listen for travel plan updates
  onTravelPlanCreated(callback: (plan: TravelPlan) => void) {
    const ws = connectWebSocket()
    ws.on('travel_plan_created', callback)
    return () => ws.off('travel_plan_created', callback)
  },

  // Listen for plan optimizations
  onPlanOptimized(callback: (plan: TravelPlan) => void) {
    const ws = connectWebSocket()
    ws.on('plan_optimized', callback)
    return () => ws.off('plan_optimized', callback)
  },

  // Listen for location updates
  onLocationUpdated(callback: (data: any) => void) {
    const ws = connectWebSocket()
    ws.on('location_updated', callback)
    return () => ws.off('location_updated', callback)
  }
}

// Utility functions
export const utils = {
  // Format duration from seconds to readable string
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  },

  // Format cost to currency string
  formatCost(cost: number, currency: string = 'INR'): string {
    if (currency === 'INR') {
      return `₹${cost.toLocaleString('en-IN')}`
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(cost)
  },

  // Format distance from meters to readable string
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  },

  // Get transport mode icon
  getTransportIcon(mode: string): string {
    const icons: Record<string, string> = {
      car: '🚗',
      bus: '🚌',
      train: '🚊',
      bike: '🚲',
      walk: '🚶',
      rideshare: '🚕'
    }
    return icons[mode] || '🚗'
  },

  // Get safety color based on rating
  getSafetyColor(rating: number): string {
    if (rating >= 8) return '#10b981' // Green
    if (rating >= 6) return '#f59e0b' // Amber
    return '#ef4444' // Red
  },

  // Get traffic color based on congestion level
  getTrafficColor(congestionLevel: number): string {
    if (congestionLevel < 0.3) return '#10b981' // Green
    if (congestionLevel < 0.6) return '#f59e0b' // Amber
    return '#ef4444' // Red
  }
}

export default api