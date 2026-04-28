import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Navigation, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Radio,
  TrendingUp,
  Zap,
  Activity
} from 'lucide-react'

interface JourneySegment {
  id: string
  name: string
  distance: string
  status: 'completed' | 'current' | 'upcoming'
  eta: string
  alerts?: string[]
}

interface LiveJourneyTrackerProps {
  isActive: boolean
  onStart: () => void
  onStop: () => void
}

const LiveJourneyTracker: React.FC<LiveJourneyTrackerProps> = ({ isActive, onStart, onStop }) => {
  const [currentProgress, setCurrentProgress] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [liveAlerts, setLiveAlerts] = useState<string[]>([])

  // Simulate journey progress
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        if (prev >= 100) {
          onStop()
          return 100
        }
        return prev + 1
      })
      
      // Simulate speed changes
      setCurrentSpeed(Math.floor(Math.random() * 30) + 40) // 40-70 km/h
      
      // Simulate random alerts
      if (Math.random() > 0.95) {
        const alerts = [
          'Traffic ahead - 5 min delay',
          'Weather update: Light rain',
          'Speed camera ahead',
          'Rest area in 2 km'
        ]
        setLiveAlerts(prev => [...prev, alerts[Math.floor(Math.random() * alerts.length)]].slice(-3))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, onStop])

  const segments: JourneySegment[] = [
    {
      id: '1',
      name: 'Starting Point',
      distance: '0 km',
      status: currentProgress > 0 ? 'completed' : 'current',
      eta: 'Departed'
    },
    {
      id: '2',
      name: 'Highway Entry',
      distance: '15 km',
      status: currentProgress > 25 ? 'completed' : currentProgress > 0 ? 'current' : 'upcoming',
      eta: currentProgress > 25 ? 'Passed' : '12 min',
      alerts: currentProgress > 20 && currentProgress < 30 ? ['Toll booth ahead'] : undefined
    },
    {
      id: '3',
      name: 'Rest Stop',
      distance: '45 km',
      status: currentProgress > 60 ? 'completed' : currentProgress > 25 ? 'current' : 'upcoming',
      eta: currentProgress > 60 ? 'Passed' : '35 min'
    },
    {
      id: '4',
      name: 'City Exit',
      distance: '70 km',
      status: currentProgress > 85 ? 'completed' : currentProgress > 60 ? 'current' : 'upcoming',
      eta: currentProgress > 85 ? 'Passed' : '55 min',
      alerts: currentProgress > 80 && currentProgress < 90 ? ['Heavy traffic reported'] : undefined
    },
    {
      id: '5',
      name: 'Destination',
      distance: '85 km',
      status: currentProgress >= 100 ? 'completed' : currentProgress > 85 ? 'current' : 'upcoming',
      eta: currentProgress >= 100 ? 'Arrived!' : '1h 10min'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500'
      case 'current': return 'bg-blue-500 animate-pulse'
      case 'upcoming': return 'bg-white/20'
      default: return 'bg-white/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case 'current': return <Radio className="w-4 h-4 text-blue-400 a