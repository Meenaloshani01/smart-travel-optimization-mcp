import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  Star, 
  Clock, 
  IndianRupee, 
  MapPin,
  Trash2,
  RotateCcw,
  Calendar
} from 'lucide-react'

interface HistoryRoute {
  id: string
  from: string
  to: string
  date: string
  duration: string
  cost: string
  mode: string
  isFavorite: boolean
}

interface RouteHistoryProps {
  onRouteSelect?: (route: HistoryRoute) => void
  onClearHistory?: () => void
}

const RouteHistory: React.FC<RouteHistoryProps> = ({
  onRouteSelect,
  onClearHistory
}) => {
  const [history, setHistory] = useState<HistoryRoute[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('travel-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Failed to load travel history:', error)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('travel-history', JSON.stringify(history))
  }, [history])

  const toggleFavorite = (routeId: string) => {
    setHistory(prev => prev.map(route => 
      route.id === routeId 
        ? { ...route, isFavorite: !route.isFavorite }
        : route
    ))
  }

  const removeRoute = (routeId: string) => {
    setHistory(prev => prev.filter(route => route.id !== routeId))
  }

  const clearAllHistory = () => {
    setHistory([])
    onClearHistory?.()
  }

  const filteredHistory = showFavoritesOnly 
    ? history.filter(route => route.isFavorite)
    : history

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (history.length === 0) {
    return (
      <motion.div 
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <History className="w-12 h-12 text-white/40 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-white mb-2">No Travel History</h3>
        <p className="text-white/60 text-sm">Your recent routes will appear here</p>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Travel History</h3>
          </div>
          <button
            onClick={clearAllHistory}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Clear all history"
          >
            <Trash2 className="w-4 h-4 text-white/60" />
          </button>
        </div>
        
        {/* Filter Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFavoritesOnly(false)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              !showFavoritesOnly 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setShowFavoritesOnly(true)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              showFavoritesOnly 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Favorites ({history.filter(r => r.isFavorite).length})
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="max-h-80 overflow-y-auto">
        <AnimatePresence>
          {filteredHistory.map((route, index) => (
            <motion.div
              key={route.id}
              className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => onRouteSelect?.(route)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-white truncate">
                    {route.from} → {route.to}
                  </div>
                  {route.isFavorite && (
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(route.id)
                    }}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Star className={`w-3 h-3 ${
                      route.isFavorite 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-white/40'
                    }`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeRoute(route.id)
                    }}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-white/40 hover:text-red-400" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs text-white/60">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{route.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <IndianRupee className="w-3 h-3" />
                  <span>{route.cost}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(route.date)}</span>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-white/50 capitalize">
                  {route.mode} • {formatDate(route.date)}
                </span>
                <RotateCcw className="w-3 h-3 text-white/40" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredHistory.length === 0 && showFavoritesOnly && (
          <div className="p-6 text-center">
            <Star className="w-8 h-8 text-white/40 mx-auto mb-2" />
            <p className="text-white/60 text-sm">No favorite routes yet</p>
            <p className="text-white/40 text-xs mt-1">Star routes to save them as favorites</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default RouteHistory