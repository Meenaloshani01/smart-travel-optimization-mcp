import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
}

interface FloatingNotificationsProps {
  notifications: Notification[]
  onDismiss?: (id: string) => void
}

const FloatingNotifications: React.FC<FloatingNotificationsProps> = ({ 
  notifications, 
  onDismiss 
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'error': return AlertCircle
      case 'warning': return AlertTriangle
      case 'info': return Info
      default: return Info
    }
  }

  const getColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-500/90 border-emerald-400 text-white'
      case 'error': return 'bg-red-500/90 border-red-400 text-white'
      case 'warning': return 'bg-amber-500/90 border-amber-400 text-white'
      case 'info': return 'bg-blue-500/90 border-blue-400 text-white'
      default: return 'bg-blue-500/90 border-blue-400 text-white'
    }
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = getIcon(notification.type)
          const colors = getColors(notification.type)
          
          return (
            <motion.div
              key={notification.id}
              className={`${colors} px-4 py-3 rounded-lg border backdrop-blur-md shadow-lg`}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
              layout
            >
              <div className="flex items-start space-x-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium break-words">
                    {notification.message}
                  </p>
                </div>
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(notification.id)}
                    className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default FloatingNotifications