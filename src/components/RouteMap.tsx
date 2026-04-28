import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Zap, Clock, IndianRupee, AlertCircle } from 'lucide-react'

// Dynamically import Leaflet to avoid SSR issues
let L: any = null
if (typeof window !== 'undefined') {
  import('leaflet').then((leaflet) => {
    L = leaflet.default
    // Fix for default markers in Leaflet with Vite
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
  })
}

interface RouteMapProps {
  startLocation?: {
    lat: number
    lng: number
    name: string
  }
  endLocation?: {
    lat: number
    lng: number
    name: string
  }
  routeData?: {
    duration: string
    cost: string
    distance: string
    mode: string
  }
  isLoading?: boolean
}

const RouteMap: React.FC<RouteMapProps> = ({
  startLocation,
  endLocation,
  routeData,
  isLoading = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  // Load Leaflet CSS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
      document.head.appendChild(link)
      
      // Load Leaflet library
      import('leaflet').then((leaflet) => {
        L = leaflet.default
        setLeafletLoaded(true)
        
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        })
      }).catch((error) => {
        console.error('Failed to load Leaflet:', error)
        setMapError('Failed to load map library')
      })
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !leafletLoaded || !L) return

    try {
      // Initialize map
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [20.5937, 78.9629], // Center of India
          zoom: 5,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true
        })

        // Add tile layer with a nice style
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current)
      }

      const map = mapInstanceRef.current

      // Clear existing markers and routes
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer)
        }
      })

      // Add markers and route if locations are provided
      if (startLocation && endLocation) {
        // Create custom icons
        const startIcon = L.divIcon({
          html: `
            <div style="
              background: #10b981; 
              width: 24px; 
              height: 24px; 
              border-radius: 50%; 
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="color: white; font-size: 12px; font-weight: bold;">S</div>
            </div>
          `,
          className: 'custom-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })

        const endIcon = L.divIcon({
          html: `
            <div style="
              background: #ef4444; 
              width: 24px; 
              height: 24px; 
              border-radius: 50%; 
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="color: white; font-size: 12px; font-weight: bold;">E</div>
            </div>
          `,
          className: 'custom-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })

        // Add markers
        const startMarker = L.marker([startLocation.lat, startLocation.lng], { icon: startIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: system-ui; padding: 8px;">
              <strong style="color: #10b981;">📍 Start Location</strong><br/>
              <span style="color: #666;">${startLocation.name}</span>
            </div>
          `)

        const endMarker = L.marker([endLocation.lat, endLocation.lng], { icon: endIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: system-ui; padding: 8px;">
              <strong style="color: #ef4444;">🎯 Destination</strong><br/>
              <span style="color: #666;">${endLocation.name}</span>
            </div>
          `)

        // Create route line (simplified straight line for demo)
        const routeLine = L.polyline([
          [startLocation.lat, startLocation.lng],
          [endLocation.lat, endLocation.lng]
        ], {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 5'
        }).addTo(map)

        // Fit map to show both markers
        const group = new L.FeatureGroup([startMarker, endMarker, routeLine])
        map.fitBounds(group.getBounds().pad(0.1))

        // Add route info popup at midpoint
        if (routeData) {
          const midLat = (startLocation.lat + endLocation.lat) / 2
          const midLng = (startLocation.lng + endLocation.lng) / 2
          
          L.marker([midLat, midLng], {
            icon: L.divIcon({
              html: `
                <div style="
                  background: rgba(59, 130, 246, 0.9);
                  color: white;
                  padding: 8px 12px;
                  border-radius: 8px;
                  font-size: 12px;
                  font-weight: 500;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                  border: 2px solid white;
                  min-width: 120px;
                  text-align: center;
                ">
                  <div style="margin-bottom: 4px;">🚗 ${routeData.mode}</div>
                  <div>${routeData.duration} • ${routeData.cost}</div>
                </div>
              `,
              className: 'route-info-marker',
              iconSize: [120, 50],
              iconAnchor: [60, 25]
            })
          }).addTo(map)
        }
      }
    } catch (error) {
      console.error('Map initialization error:', error)
      setMapError('Failed to initialize map')
    }

    return () => {
      // Cleanup function
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        } catch (error) {
          console.error('Map cleanup error:', error)
        }
      }
    }
  }, [startLocation, endLocation, routeData, leafletLoaded])

  return (
    <motion.div 
      className="relative h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Loading Overlay */}
      {isLoading && (
        <motion.div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm">Loading route...</p>
          </div>
        </motion.div>
      )}

      {/* Map Error */}
      {mapError && (
        <motion.div 
          className="absolute inset-0 bg-red-500/10 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center text-red-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-3" />
            <p className="text-sm">{mapError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-xs transition-colors"
            >
              Reload Page
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading Leaflet */}
      {!leafletLoaded && !mapError && (
        <motion.div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm">Loading map...</p>
          </div>
        </motion.div>
      )}

      {/* Map Controls Overlay */}
      {startLocation && endLocation && (
        <motion.div 
          className="absolute top-4 left-4 bg-black/70 backdrop-blur-md rounded-lg p-3 text-white text-sm max-w-xs"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <Navigation className="w-4 h-4 text-blue-400" />
            <span className="font-medium">Route Overview</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="truncate">{startLocation.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="truncate">{endLocation.name}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Route Stats Overlay */}
      {routeData && (
        <motion.div 
          className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md rounded-lg p-3 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>{routeData.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <IndianRupee className="w-3 h-3 text-emerald-400" />
              <span>{routeData.cost}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-purple-400" />
              <span>{routeData.distance}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* No Route Placeholder */}
      {!startLocation || !endLocation ? (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-white/40" />
            <p className="text-lg font-medium mb-2">Interactive Route Map</p>
            <p className="text-sm">Enter start and end locations to view route</p>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  )
}

export default RouteMap