import React from 'react'
import { motion } from 'framer-motion'
import { Navigation, Loader } from 'lucide-react'

const LoadingScreen: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        {/* Animated Logo */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-2xl"
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotateY: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Navigation className="w-10 h-10 text-white" />
          </motion.div>
          
          {/* Orbital rings */}
          <motion.div
            className="absolute inset-0 border-2 border-blue-400/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ width: '120px', height: '120px', top: '-10px', left: '-10px' }}
          />
          <motion.div
            className="absolute inset-0 border-2 border-emerald-400/20 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{ width: '140px', height: '140px', top: '-20px', left: '-20px' }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl font-bold gradient-text mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Smart Travel
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-white/70 text-lg mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          AI-Powered Route Optimization
        </motion.p>

        {/* Loading Animation */}
        <motion.div
          className="flex items-center justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Loader className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-white/60">Initializing 3D Engine...</span>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="w-64 h-2 bg-white/10 rounded-full mx-auto mt-6 overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 1.2, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Loading Steps */}
        <motion.div
          className="mt-8 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {[
            'Loading 3D Map Engine...',
            'Connecting to Traffic APIs...',
            'Initializing AI Optimizer...',
            'Ready to Navigate!'
          ].map((step, index) => (
            <motion.div
              key={step}
              className="text-sm text-white/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8 + index * 0.3 }}
            >
              {step}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default LoadingScreen