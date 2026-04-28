import React from 'react'
import { motion } from 'framer-motion'
import { 
  Bookmark, 
  Share2, 
  Download, 
  RefreshCw,
  MapPin,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react'

interface QuickActionsProps {
  onSave: () => void
  onShare: () => void
  onRefresh: () => void
  hasActivePlan: boolean
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  onSave, 
  onShare, 
  onRefresh, 
  hasActivePlan 
}) => {
  const actions = [
    {
      icon: RefreshCw,
      label: 'Refresh',
      onClick: onRefresh,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 hover:bg-blue-500/30'
    },
    {
      icon: Bookmark,
      label: 'Save',
      onClick: onSave,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20 hover:bg-amber-500/30'
    },
    {
      icon: Share2,
      label: 'Share',
      onClick: onShare,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20 hover:bg-emerald-500/30'
    }
  ]

  if (!hasActivePlan) return null

  return (
    <motion.div 
      className="flex space-x-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          onClick={action.onClick}
          className={`p-2 ${action.bgColor} rounded-lg transition-all ${action.color}`}
          title={action.label}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <action.icon className="w-4 h-4" />
        </motion.button>
      ))}
    </motion.div>
  )
}

export default QuickActions