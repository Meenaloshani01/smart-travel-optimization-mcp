import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Share2, 
  Mail,
  Printer,
  Clock,
  MapPin,
  IndianRupee,
  Leaf,
  TrendingUp
} from 'lucide-react'

interface TripReportProps {
  tripData?: {
    from: string
    to: string
    distance: number
    duration: number
    cost: number
    mode: string
    date: string
  }
  onDownload?: () => void
  onShare?: () => void
}

const TripReport: React.FC<TripReportProps> = ({
  tripData,
  onDownload,
  onShare
}) => {
  const generateReport = () => {
    // Generate PDF report
    console.log('Generating trip report...')
    onDownload?.()
  }

  const shareReport = () => {
    // Share report via email/social
    console.log('Sharing trip report...')
    onShare?.()
  }

  if (!tripData) {
    return (
      <motion.div 
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <FileText className="w-12 h-12 text-white/40 mx-auto mb-3" />
        <p className="text-white/60 text-sm">Complete a trip to generate report</p>
      </motion.div>
    )
  }

  const carbonSaved = tripData.mode === 'train' || tripData.mode === 'bus' 
    ? (tripData.distance * 0.12).toFixed(1) 
    : '0'

  return (
    <motion.div 
      className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Trip Report</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={generateReport}
              className="p-2 hover:bg-white/10 rounded transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={shareReport}
              className="p-2 hover:bg-white/10 rounded transition-colors"
              title="Share Report"
            >
              <Share2 className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="p-4 space-y-4">
        {/* Trip Summary */}
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-3">Trip Summary</h4>
          <div className="bg-white/5 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Route</span>
              <span className="text-white font-medium">{tripData.from} → {tripData.to}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Date</span>
              <span className="text-white">{new Date(tripData.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Transport</span>
              <span className="text-white capitalize">{tripData.mode}</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-3">Statistics</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-white/60">Distance</span>
              </div>
              <div className="text-lg font-bold text-white">{tripData.distance} km</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-white/60">Duration</span>
              </div>
              <div className="text-lg font-bold text-white">
                {Math.floor(tripData.duration / 60)}h {tripData.duration % 60}m
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <IndianRupee className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-white/60">Total Cost</span>
              </div>
              <div className="text-lg font-bold text-white">₹{tripData.cost}</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Leaf className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-white/60">CO₂ Saved</span>
              </div>
              <div className="text-lg font-bold text-white">{carbonSaved} kg</div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-3">Cost Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Base Fare</span>
              <span className="text-white">₹{Math.floor(tripData.cost * 0.7)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Fuel/Charges</span>
              <span className="text-white">₹{Math.floor(tripData.cost * 0.2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Tolls</span>
              <span className="text-white">₹{Math.floor(tripData.cost * 0.1)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/10 font-medium">
              <span className="text-white">Total</span>
              <span className="text-white">₹{tripData.cost}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={generateReport}
            className="flex items-center justify-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={shareReport}
            className="flex items-center justify-center space-x-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 py-2 rounded-lg text-sm transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Email Report</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default TripReport