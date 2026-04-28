import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Loader
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  toolsUsed?: string[]
}

interface TravelAssistantProps {
  travelPlanning: any
  currentRoute: {
    start: { lat: number; lng: number; name: string } | null
    end: { lat: number; lng: number; name: string } | null
  }
}

const TravelAssistant: React.FC<TravelAssistantProps> = ({ travelPlanning, currentRoute }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI Travel Assistant. I can help you with routes, weather, traffic, safety, budgets, and more. What would you like to know?",
      timestamp: new Date(),
      toolsUsed: []
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI processing with MCP tools
    setTimeout(() => {
      const response = generateAIResponse(inputValue, currentRoute, travelPlanning)
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (query: string, route: any, planning: any): Message => {
    const lowerQuery = query.toLowerCase()
    let content = ''
    let toolsUsed: string[] = []

    // Weather queries
    if (lowerQuery.includes('weather') || lowerQuery.includes('rain') || lowerQuery.includes('temperature')) {
      toolsUsed.push('weather_checker')
      content = `Based on current weather data, ${route.start?.name || 'your location'} has clear skies with 24°C. Perfect for travel! The weather along your route looks good with no rain expected.`
    }
    // Traffic queries
    else if (lowerQuery.includes('traffic') || lowerQuery.includes('congestion') || lowerQuery.includes('jam')) {
      toolsUsed.push('traffic_analyzer')
      content = `I've analyzed current traffic conditions. There's moderate traffic on the main route with an estimated 15-minute delay. I recommend leaving in the next 30 minutes to avoid peak hour congestion.`
    }
    // Route queries
    else if (lowerQuery.includes('route') || lowerQuery.includes('fastest') || lowerQuery.includes('shortest')) {
      toolsUsed.push('route_planner', 'time_predictor')
      if (planning.hasActivePlan) {
        const routeInfo = planning.getRouteInfo(planning.selectedRoute)
        content = `Your current route is ${routeInfo?.distance || 'calculated'} and takes ${routeInfo?.duration || 'estimated time'}. I've found 2 alternative routes that might save you 10-15 minutes. Would you like to see them?`
      } else {
        content = `I can help you find the best route! Please enter your starting point and destination in the sidebar, and I'll analyze multiple routes for you.`
      }
    }
    // Budget queries
    else if (lowerQuery.includes('cost') || lowerQuery.includes('budget') || lowerQuery.includes('cheap') || lowerQuery.includes('price')) {
      toolsUsed.push('budget_calculator', 'transport_recommender')
      if (planning.hasActivePlan) {
        const routeInfo = planning.getRouteInfo(planning.selectedRoute)
        content = `Your current route costs ${routeInfo?.cost || '₹1,500'}. I can suggest cheaper alternatives:\n• Bus: ₹250 (45 min longer)\n• Train: ₹800 (20 min longer)\n• Carpooling: ₹600 (same time)\nWhich would you prefer?`
      } else {
        content = `I can help you find budget-friendly options! Once you set your route, I'll calculate costs for different transport modes and suggest the most economical choice.`
      }
    }
    // Safety queries
    else if (lowerQuery.includes('safe') || lowerQuery.includes('safety') || lowerQuery.includes('secure')) {
      toolsUsed.push('safety_analyzer')
      content = `I've analyzed the safety of your route. The overall safety rating is 8.5/10. The route passes through well-lit areas with good road conditions. I recommend traveling during daylight hours for optimal safety.`
    }
    // Transport mode queries
    else if (lowerQuery.includes('transport') || lowerQuery.includes('bus') || lowerQuery.includes('train') || lowerQuery.includes('car')) {
      toolsUsed.push('transport_recommender')
      content = `I've analyzed available transport options:\n• Car: Fastest, most flexible (₹1,500)\n• Bus: Most economical (₹250)\n• Train: Good balance (₹800)\n• Bike: Eco-friendly, free\nEach option has different comfort and environmental impacts. What matters most to you?`
    }
    // Time/ETA queries
    else if (lowerQuery.includes('time') || lowerQuery.includes('eta') || lowerQuery.includes('arrive') || lowerQuery.includes('long')) {
      toolsUsed.push('time_predictor', 'traffic_analyzer')
      if (planning.hasActivePlan) {
        const routeInfo = planning.getRouteInfo(planning.selectedRoute)
        content = `Based on current traffic and weather conditions, your journey will take ${routeInfo?.duration || '30 minutes'}. With normal traffic, you'll arrive around ${new Date(Date.now() + 1800000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`
      } else {
        content = `I can predict your travel time accurately! Just set your route and I'll factor in traffic, weather, and road conditions to give you a precise ETA.`
      }
    }
    // Alert queries
    else if (lowerQuery.includes('alert') || lowerQuery.includes('warning') || lowerQuery.includes('problem')) {
      toolsUsed.push('alert_manager')
      const alerts = planning.activeAlerts
      if (alerts.length > 0) {
        content = `I have ${alerts.length} active alert(s) for your route:\n${alerts.map((a: any) => `• ${a.type}: ${a.message}`).join('\n')}`
      } else {
        content = `Good news! There are no active alerts for your route. I'll notify you immediately if any issues arise during your journey.`
      }
    }
    // Tracking queries
    else if (lowerQuery.includes('track') || lowerQuery.includes('location') || lowerQuery.includes('where')) {
      toolsUsed.push('location_tracker')
      content = `I can track your journey in real-time! Once you start traveling, I'll monitor your location, update your ETA, and alert you about any changes in traffic or weather conditions along the way.`
    }
    // Report queries
    else if (lowerQuery.includes('report') || lowerQuery.includes('summary') || lowerQuery.includes('details')) {
      toolsUsed.push('report_generator')
      content = `I can generate a detailed travel report including:\n• Complete route breakdown\n• Cost analysis\n• Time estimates\n• Safety assessment\n• Weather forecast\n• Alternative options\nWould you like me to create one for your current route?`
    }
    // General help
    else {
      content = `I can help you with:\n• 🗺️ Route planning and alternatives\n• 🚦 Real-time traffic updates\n• ☁️ Weather conditions\n• 💰 Budget optimization\n• 🚗 Transport recommendations\n• 🛡️ Safety analysis\n• ⏱️ Time predictions\n• 📍 Location tracking\n• ⚠️ Travel alerts\n• 📊 Detailed reports\n\nWhat would you like to know?`
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date(),
      toolsUsed
    }
  }

  const quickQuestions = [
    "What's the weather like?",
    "Is there traffic?",
    "Show me cheaper options",
    "How safe is this route?",
    "When should I leave?"
  ]

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center z-50 group"
          >
            <MessageCircle className="w-7 h-7 text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Sparkles className="absolute -top-2 -left-2 w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 60 : 600
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-96 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">AI Travel Assistant</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-white/80 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-white" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === 'user' 
                            ? 'bg-blue-500' 
                            : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}>
                          {message.type === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div className={`rounded-2xl p-3 ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/10 text-white'
                          }`}>
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                          </div>
                          {message.toolsUsed && message.toolsUsed.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {message.toolsUsed.map((tool, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          )}
                          <span className="text-xs text-white/40 mt-1 block">
                            {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/10 rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <motion.div
                            className="w-2 h-2 bg-white/60 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-white/60 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-white/60 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputValue(question)
                          handleSendMessage()
                        }}
                        className="text-xs bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-full transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default TravelAssistant
