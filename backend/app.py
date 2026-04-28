from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
import logging
import uuid

# Import MCP tools
from mcp_tools.route_planner import RoutePlannerMCP
from mcp_tools.traffic_analyzer import TrafficAnalyzerMCP
from mcp_tools.time_predictor import TimePredictorMCP
from mcp_tools.budget_calculator import BudgetCalculatorMCP
from mcp_tools.transport_recommender import TransportRecommenderMCP
from mcp_tools.weather_checker import WeatherCheckerMCP
from mcp_tools.safety_analyzer import SafetyAnalyzerMCP
from mcp_tools.alert_manager import AlertManagerMCP
from mcp_tools.location_tracker import LocationTrackerMCP
from mcp_tools.report_generator import ReportGeneratorMCP

# Import services
from services.travel_optimizer import TravelOptimizer
from services.mcp_router import MCPRouter
from models.travel_request import TravelRequest
from models.travel_plan import TravelPlan
from database.db_manager import DatabaseManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'smart-travel-secret-key'
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000", "http://localhost:3001"])

# Initialize MCP Router with all tools
mcp_router = MCPRouter()
travel_optimizer = TravelOptimizer(mcp_router)
db_manager = DatabaseManager()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/v1/travel/plan', methods=['POST'])
def create_travel_plan():
    """Create optimized travel plan from user request"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['source', 'destination']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create travel request
        travel_request = TravelRequest.from_dict(data)
        
        # Generate optimized travel plan
        travel_plan = asyncio.run(travel_optimizer.optimize_travel(travel_request))
        
        # Convert to dict - check if it's already a dict or TravelPlan object
        if hasattr(travel_plan, 'to_dict'):
            plan_dict = travel_plan.to_dict()
        else:
            # It's already a dictionary
            plan_dict = travel_plan
        
        # Emit real-time update
        socketio.emit('travel_plan_created', plan_dict)
        
        return jsonify(plan_dict)
        
    except Exception as e:
        logger.error(f"Error creating travel plan: {str(e)}")
        return jsonify({'error': 'Failed to create travel plan'}), 500

@app.route('/api/v1/travel/routes', methods=['GET'])
def get_route_alternatives():
    """Get alternative routes with 3D coordinate data"""
    try:
        source = request.args.get('source')
        destination = request.args.get('destination')
        
        if not source or not destination:
            return jsonify({'error': 'Source and destination are required'}), 400
        
        # Get routes from route planner
        routes = asyncio.run(mcp_router.execute_tool('route_planner', {
            'source': source,
            'destination': destination,
            'include_3d': True
        }))
        
        return jsonify(routes)
        
    except Exception as e:
        logger.error(f"Error getting routes: {str(e)}")
        return jsonify({'error': 'Failed to get routes'}), 500

@app.route('/api/v1/travel/optimize', methods=['POST'])
def optimize_existing_plan():
    """Re-optimize existing plan based on current conditions"""
    try:
        data = request.get_json()
        plan_id = data.get('plan_id')
        
        if not plan_id:
            return jsonify({'error': 'Plan ID is required'}), 400
        
        # Re-optimize the plan
        optimized_plan = asyncio.run(travel_optimizer.re_optimize_plan(plan_id))
        
        # Emit real-time update
        socketio.emit('plan_optimized', optimized_plan.to_dict())
        
        return jsonify(optimized_plan.to_dict())
        
    except Exception as e:
        logger.error(f"Error optimizing plan: {str(e)}")
        return jsonify({'error': 'Failed to optimize plan'}), 500

@app.route('/api/v1/realtime/traffic', methods=['GET'])
def get_traffic_data():
    """Get current traffic conditions for visualization"""
    try:
        route_id = request.args.get('route_id')
        
        if not route_id:
            return jsonify({'error': 'Route ID is required'}), 400
        
        # Get traffic data
        traffic_data = asyncio.run(mcp_router.execute_tool('traffic_analyzer', {
            'route_id': route_id,
            'include_3d_overlay': True
        }))
        
        return jsonify(traffic_data)
        
    except Exception as e:
        logger.error(f"Error getting traffic data: {str(e)}")
        return jsonify({'error': 'Failed to get traffic data'}), 500

@app.route('/api/v1/realtime/weather', methods=['GET'])
def get_weather_conditions():
    """Get weather data for route visualization"""
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        
        if lat is None or lng is None:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
        
        # Get weather data
        weather_data = asyncio.run(mcp_router.execute_tool('weather_checker', {
            'latitude': lat,
            'longitude': lng,
            'include_3d_effects': True
        }))
        
        return jsonify(weather_data)
        
    except Exception as e:
        logger.error(f"Error getting weather data: {str(e)}")
        return jsonify({'error': 'Failed to get weather data'}), 500

@app.route('/api/v1/transport/modes', methods=['GET'])
def get_transport_modes():
    """Get available transport modes for a route"""
    try:
        source = request.args.get('source')
        destination = request.args.get('destination')
        
        if not source or not destination:
            return jsonify({'error': 'Source and destination are required'}), 400
        
        # Get transport recommendations
        transport_modes = asyncio.run(mcp_router.execute_tool('transport_recommender', {
            'source': source,
            'destination': destination
        }))
        
        return jsonify(transport_modes)
        
    except Exception as e:
        logger.error(f"Error getting transport modes: {str(e)}")
        return jsonify({'error': 'Failed to get transport modes'}), 500

@app.route('/api/v1/safety/analyze', methods=['POST'])
def analyze_safety():
    """Analyze safety for a route"""
    try:
        data = request.get_json()
        route_data = data.get('route')
        
        if not route_data:
            return jsonify({'error': 'Route data is required'}), 400
        
        # Analyze safety
        safety_analysis = asyncio.run(mcp_router.execute_tool('safety_analyzer', {
            'route': route_data,
            'time_of_day': data.get('time_of_day', 'day')
        }))
        
        return jsonify(safety_analysis)
        
    except Exception as e:
        logger.error(f"Error analyzing safety: {str(e)}")
        return jsonify({'error': 'Failed to analyze safety'}), 500

# WebSocket Events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info('Client connected')
    emit('connected', {'status': 'Connected to Smart Travel API'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info('Client disconnected')

@socketio.on('subscribe_to_route')
def handle_route_subscription(data):
    """Subscribe to real-time updates for specific route"""
    route_id = data.get('route_id')
    if route_id:
        # Join room for route updates
        from flask_socketio import join_room
        join_room(f"route_{route_id}")
        emit('subscribed', {'route_id': route_id})

@socketio.on('location_update')
def handle_location_update(data):
    """Process user location updates for tracking"""
    try:
        # Update location in location tracker
        asyncio.run(mcp_router.execute_tool('location_tracker', {
            'user_id': data.get('user_id'),
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude'),
            'timestamp': datetime.utcnow().isoformat()
        }))
        
        # Emit location update to subscribers
        emit('location_updated', data, broadcast=True)
        
    except Exception as e:
        logger.error(f"Error updating location: {str(e)}")
        emit('error', {'message': 'Failed to update location'})

if __name__ == '__main__':
    logger.info("Starting Smart Travel Optimization System...")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)