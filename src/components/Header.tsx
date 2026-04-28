import React from 'react'
import { motion } from 'framer-motion'
import { Navigation, Zap, Bell, Settings, Sparkles } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <motion.header 
      className="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-20 relative"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      
      {/* Logo and Title */}
      <motion.div 
        className="flex items-center space-x-3"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <motion.div 
          className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50"
          animate={{ 
            boxShadow: [
              "0 10px 30px rgba(59,130,246,0.5)",
              "0 10px 40px rgba(147,51,234,0.5)",
              "0 10px 30px rgba(59,130,246,0.5)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          whileHover={{ rotate: 360 }}
        >
          <Navigation className="w-5 h-5 text-white" />
          
          {/* Sparkle Effect */}
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </motion.div>
        </motion.div>
        
        <div>
          <motion.h1 
            className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            Smart Travel
          </motion.h1>
          <p className="text-xs text-white/50">AI-Powered Planning</p>
        </div>
      </motion.div>
      
      {/* Status and Actions */}
      <div className="flex items-center space-x-4">
        {/* Live Status with Pulse */}
        <motion.div 
          className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(16, 185, 129, 0.15)" }}
        >
          <motion.div 
            className="w-2 h-2 bg-emerald-400 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-sm text-emerald-400 font-medium">Live</span>
        </motion.div>
        
        {/* Action Buttons with 3D Effect */}
        <div className="flex items-center space-x-2">
          <motion.button 
            className="relative p-2 hover:bg-white/10 rounded-xl transition-colors group"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            <motion.div
              className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.button>
          
          <motion.button 
            className="p-2 hover:bg-white/10 rounded-xl transition-colors group"
            whileHover={{ scale: 1.1, y: -2, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
