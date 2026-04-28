import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Bell,
  X,
  Clock,
  MapPin,
  Zap
} from 'lucide-react'

interface Alert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success' | 'traffic' | 'weather' | 'safety'
  title: string
  message: string
  timestamp: Date
  location?: string
  severity: 'low' | 'medium' | 'high'
  actionable?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface AlertCenterProps {
  alerts?: Alert[]
  onDismiss?: (alertId: string) => void
  onDismissAll?: () => void
}

const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts = [],
  onDismiss,
  onDismissAll
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localAlerts, setLocalAlerts] = useState<Alert[]>([])

  // Merge external alerts with local alerts
  useEffect(() => {
    setLocalAlerts(prev => {
      const existingIds = prev.map(a => a.id)
      const newAlerts = alerts.filter(a => !existingIds.includes(a.id))
      return [...prev, ...newAlerts]
    })
  }, [alerts])

  // Auto-dismiss alerts after 10 seconds for low severity
  useEffect(() => {
    const timers = localAlerts
      .filter(alert => alert.severity === 'low')
      .map(alert => 
        setTimeout(() => {
          dismissAlert(alert.id)
        }, 10000)
      )

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [localAlerts])

  const dismissAlert = (alertId: string) => {
    setLocalAlerts(prev => prev.filter(a => a.id !== alertId))
    onDismiss?.(alertId)
  }

  const dismissAll = () => {
    setLocalAlerts([])
    onDismissAll?.()
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return XCircle
      case 'warning': return AlertTriangle
      case 'success': return CheckCircle
      case 'traffic': return Clock
      case 'weather': return Zap
      case 'safety': return AlertTriangle
      default: return Info
    }
  }

  const getAlertColor = (type: string, severity: string) => {
    if (severity === 'high') {
      return 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400'
    }
    
    switch (type) {
      case 'error': return 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400'
      case 'warning': return 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400'
      case 'success': return 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400'
      case 'traffic': return 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400'
      case 'weather': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400'
      case 'safety': return 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400'
      default: return 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const highPriorityAlerts = localAlerts.filter(a => a.severity === 'high')
  const otherAlerts = localAlerts.filter(a => a.severity !== 'high')

  if (localAlerts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      {/* Alert Summary Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-3 mb-2 flex items-center justify-between hover:bg-black/80 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-white" />
          <span className="text-white font-medium">
            {localAlerts.length} Alert{localAlerts.length !== 1 ? 's' : ''}
          </span>
          {highPriorityAlerts.length > 0 && (
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.div>
      </motion.button>

      {/* Expanded Alert List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-medium">Active Alerts</h3>
              {localAlerts.length > 1 && (
                <button
                  onClick={dismissAll}
                  className="text-xs text-white/60 hover:text-white transition-colors"
                >
                  Dismiss All
                </button>
              )}
            </div>

            {/* Alert List */}
            <div className="max-h-80 overflow-y-auto">
              {/* High Priority Alerts First */}
              {highPriorityAlerts.map((alert, index) => {
                const AlertIcon = getAlertIcon(alert.type)
                const colorClasses = getAlertColor(alert.type, alert.severity)
                
                return (
                  <motion.div
                    key={alert.id}
                    className={`p-3 border-b border-white/5 bg-gradient-to-r ${colorClasses}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start space-x-3">
                      <AlertIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-white truncate">
                            {alert.title}
                          </h4>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors"
                          >
                            <X className="w-3 h-3 text-white/60" />
                          </button>
                        </div>
                        <p className="text-xs text-white/80 mb-2">{alert.message}</p>
                        
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <div className="flex items-center space-x-2">
                            {alert.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{alert.location}</span>
                              </div>
                            )}
                            <span>{formatTime(alert.timestamp)}</span>
                          </div>
                          {alert.severity === 'high' && (
                            <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-xs font-medium">
                              HIGH
                            </span>
                          )}
                        </div>
                        
                        {alert.action && (
                          <button
                            onClick={alert.action.onClick}
                            className="mt-2 text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                          >
                            {alert.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* Other Alerts */}
              {otherAlerts.map((alert, index) => {
                const AlertIcon = getAlertIcon(alert.type)
                const colorClasses = getAlertColor(alert.type, alert.severity)
                
                return (
                  <motion.div
                    key={alert.id}
                    className={`p-3 border-b border-white/5 bg-gradient-to-r ${colorClasses}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: (highPriorityAlerts.length + index) * 0.05 }}
                  >
                    <div className="flex items-start space-x-3">
                      <AlertIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-white truncate">
                            {alert.title}
                          </h4>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors"
                          >
                            <X className="w-3 h-3 text-white/60" />
                          </button>
                        </div>
                        <p className="text-xs text-white/80 mb-2">{alert.message}</p>
                        
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <div className="flex items-center space-x-2">
                            {alert.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{alert.location}</span>
                              </div>
                            )}
                            <span>{formatTime(alert.timestamp)}</span>
                          </div>
                        </div>
                        
                        {alert.action && (
                          <button
                            onClick={alert.action.onClick}
                            className="mt-2 text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                          >
                            {alert.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AlertCenter