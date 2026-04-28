import React from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  IndianRupee, 
  Shield, 
  TrendingUp,
  Zap,
  MapPin,
  Users,
  Leaf
} from 'lucide-react'

interface TravelStatsProps {
  duration?: string
  cost?: string
  safetyRating?: number
  efficiency?: number
  distance?: string
  passengers?: number
  ecoScore?: number
}

const TravelStats: React.FC<TravelStatsProps> = ({
  duration = '30m',
  cost = '₹1,500',
  safetyRating = 8.5,
  efficiency = 85,
  distance = '25km',
  passengers = 1,
  ecoScore = 7
}) => {
  const stats = [
    {
      icon: Clock,
      label: 'Duration',
      value: duration,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/20'
    },
    {
      icon: IndianRupee,
      label: 'Cost',
      value: cost,
      color: 'text-emerald-400',
      bgColor: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500/20'
    },
    {
      icon: Shield,
      label: 'Safety',
      value: `${safetyRating}/10`,
      color: 'text-amber-400',
      bgColor: 'from-amber-500/20 to-amber-600/20',
      borderColor: 'border-amber-500/20'
    },
    {
      icon: TrendingUp,
      label: 'Efficiency',
      value: `${efficiency}%`,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/20'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className={`bg-gradient-to-br ${stat.bgColor} rounded-xl p-4 border ${stat.borderColor} relative overflow-hidden`}
          whileHover={{ scale: 1.02, y: -2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.1, 
            duration: 0.5,
            type: "spring", 
            stiffness: 300 
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white transform translate-x-8 -translate-y-8"></div>
          </div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className={`text-xs ${stat.color} font-medium opacity-80`}>
                {stat.label.toUpperCase()}
              </span>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-white/60 mt-1">
              {stat.label === 'Duration' && 'Estimated time'}
              {stat.label === 'Cost' && 'Total expense'}
              {stat.label === 'Safety' && 'Safety score'}
              {stat.label === 'Efficiency' && 'Route efficiency'}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default TravelStats