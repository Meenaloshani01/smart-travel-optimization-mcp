import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import random
import math

logger = logging.getLogger(__name__)

class TrafficCondition:
    def __init__(self, segment_id: str, congestion_level: float, speed_kmh: float, 
                 incident_type: Optional[str] = None):
        self.segment_id = segment_id
        self.congestion_level = congestion_level  # 0.0 to 1.0
        self.speed_kmh = speed_kmh
        self.incident_type = incident_type
        self.timestamp = datetime.utcnow()
        self.color_code = self._get_color_code()
    
    def _get_color_code(self) -> str:
        """Get color code for traffic visualization"""
        if self.congestion_level < 0.3:
            return "#10b981"  # Green - free flow
        elif self.congestion_level < 0.6:
            return "#f59e0b"  # Amber - moderate
        else:
            return "#ef4444"  # Red - heavy congestion
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'segment_id': self.segment_id,
            'congestion_level': self.congestion_level,
            'speed_kmh': self.speed_kmh,
            'incident_type': self.incident_type,
            'color_code': self.color_code,
            'timestamp': self.timestamp.isoformat()
        }

class TrafficAnalyzerMCP:
    """Traffic analysis with real-time visualization data"""
    
    def __init__(self):
        self.name = "traffic_analyzer"
        self.last_used = None
        self.error_count = 0
        
        # Mock traffic data cache
        self.traffic_cache = {}
        self.cache_duration = 300  # 5 minutes
        
        logger.info("Traffic Analyzer MCP initialized")
    
    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Main execution method for traffic analysis"""
        try:
            self.last_used = datetime.utcnow()
            
            action = params.get('action', 'analyze_traffic')
            
            if action == 'analyze_traffic':
                return await self.analyze_traffic(
                    params.get('routes', []),
                    params.get('include_3d_overlay', False)
                )
            elif action == 'predict_congestion':
                return await self.predict_congestion(
                    params['route'],
                    params.get('time', datetime.utcnow())
                )
            elif action == 'get_incidents':
                return await self.get_traffic_incidents(
                    params.get('bounds', {})
                )
            else:
                raise ValueError(f"Unknown action: {action}")
                
        except Exception as e:
            self.error_count += 1
            logger.error(f"Traffic Analyzer error: {str(e)}")
            raise
    
    async def analyze_traffic(self, routes: List[Dict[str, Any]], include_3d_overlay: bool = False) -> Dict[str, Any]:
        """Analyze traffic with 3D overlay data for visualization"""
        try:
            traffic_analysis = []
            
            for route in routes:
                route_id = route.get('id', 'unknown')
                
                # Get or generate traffic conditions for this route
                conditions = await self._get_route_traffic_conditions(route_id, route)
                
                # Calculate overall route metrics
                avg_congestion = sum(c.congestion_level for c in conditions) / len(conditions) if conditions else 0
                avg_speed = sum(c.speed_kmh for c in conditions) / len(conditions) if conditions else 50
                
                # Estimate delay
                estimated_delay = self._calculate_delay(conditions, route)
                
                route_analysis = {
                    'route_id': route_id,
                    'average_congestion': avg_congestion,
                    'average_speed': avg_speed,
                    'estimated_delay_seconds': estimated_delay,
                    'traffic_conditions': [c.to_dict() for c in conditions],
                    'overall_status': self._get_traffic_status(avg_congestion),
                    'last_updated': datetime.utcnow().isoformat()
                }
                
                # Add 3D overlay data if requested
                if include_3d_overlay:
                    route_analysis['3d_overlay'] = self._generate_3d_overlay_data(conditions, route)
                
                traffic_analysis.append(route_analysis)
            
            return {
                'traffic_analysis': traffic_analysis,
                'total_routes_analyzed': len(routes),
                'analysis_timestamp': datetime.utcnow().isoformat(),
                'data_freshness': 'real_time'
            }
            
        except Exception as e:
            logger.error(f"Error analyzing traffic: {str(e)}")
            return self._get_mock_traffic_analysis(routes)
    
    async def predict_congestion(self, route: Dict[str, Any], target_time: datetime) -> Dict[str, Any]:
        """Predict future traffic conditions"""
        try:
            route_id = route.get('id', 'unknown')
            
            # Calculate time difference
            time_diff = target_time - datetime.utcnow()
            hours_ahead = time_diff.total_seconds() / 3600
            
            # Get current conditions
            current_conditions = await self._get_route_traffic_conditions(route_id, route)
            
            # Predict future conditions based on time patterns
            predicted_conditions = []
            for condition in current_conditions:
                predicted_congestion = self._predict_congestion_level(
                    condition.congestion_level, 
                    target_time.hour,
                    target_time.weekday()
                )
                
                predicted_speed = self._predict_speed(
                    condition.speed_kmh,
                    predicted_congestion
                )
                
                predicted_condition = TrafficCondition(
                    condition.segment_id,
                    predicted_congestion,
                    predicted_speed
                )
                predicted_conditions.append(predicted_condition)
            
            # Calculate prediction confidence
            confidence = max(0.1, 1.0 - (hours_ahead / 24))  # Decreases with time
            
            return {
                'route_id': route_id,
                'prediction_time': target_time.isoformat(),
                'predicted_conditions': [c.to_dict() for c in predicted_conditions],
                'confidence': confidence,
                'hours_ahead': hours_ahead,
                'prediction_generated': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error predicting congestion: {str(e)}")
            return {'error': str(e)}
    
    async def get_traffic_incidents(self, bounds: Dict[str, float]) -> Dict[str, Any]:
        """Get traffic incidents in the specified area"""
        try:
            # Mock incidents data
            incidents = [
                {
                    'id': 'incident_001',
                    'type': 'accident',
                    'severity': 'moderate',
                    'location': {
                        'latitude': 37.7749 + random.uniform(-0.01, 0.01),
                        'longitude': -122.4194 + random.uniform(-0.01, 0.01)
                    },
                    'description': 'Multi-vehicle accident blocking right lane',
                    'estimated_clearance': (datetime.utcnow() + timedelta(minutes=30)).isoformat(),
                    'impact_radius_meters': 500,
                    'reported_at': datetime.utcnow().isoformat()
                },
                {
                    'id': 'incident_002',
                    'type': 'construction',
                    'severity': 'low',
                    'location': {
                        'latitude': 37.7849 + random.uniform(-0.01, 0.01),
                        'longitude': -122.4094 + random.uniform(-0.01, 0.01)
                    },
                    'description': 'Road work - lane closure',
                    'estimated_clearance': (datetime.utcnow() + timedelta(hours=4)).isoformat(),
                    'impact_radius_meters': 200,
                    'reported_at': (datetime.utcnow() - timedelta(hours=2)).isoformat()
                }
            ]
            
            return {
                'incidents': incidents,
                'total_incidents': len(incidents),
                'bounds': bounds,
                'last_updated': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting incidents: {str(e)}")
            return {'incidents': [], 'error': str(e)}
    
    async def _get_route_traffic_conditions(self, route_id: str, route: Dict[str, Any]) -> List[TrafficCondition]:
        """Get traffic conditions for a specific route"""
        # Check cache first
        cache_key = f"{route_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M')}"
        if cache_key in self.traffic_cache:
            return self.traffic_cache[cache_key]
        
        # Generate traffic conditions for route segments
        conditions = []
        segments = route.get('segments', [])
        
        for i, segment in enumerate(segments):
            segment_id = f"{route_id}_segment_{i}"
            
            # Generate realistic traffic conditions based on time of day
            current_hour = datetime.utcnow().hour
            congestion_level = self._generate_congestion_level(current_hour)
            speed_kmh = self._generate_speed(congestion_level)
            
            # Randomly add incidents
            incident_type = None
            if random.random() < 0.1:  # 10% chance of incident
                incident_type = random.choice(['accident', 'construction', 'weather'])
                congestion_level = min(1.0, congestion_level + 0.3)
                speed_kmh *= 0.6
            
            condition = TrafficCondition(segment_id, congestion_level, speed_kmh, incident_type)
            conditions.append(condition)
        
        # Cache the conditions
        self.traffic_cache[cache_key] = conditions
        
        return conditions
    
    def _generate_congestion_level(self, hour: int) -> float:
        """Generate realistic congestion level based on time of day"""
        # Rush hour patterns
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            return random.uniform(0.6, 0.9)  # High congestion
        elif 10 <= hour <= 16:
            return random.uniform(0.3, 0.6)  # Moderate congestion
        else:
            return random.uniform(0.1, 0.4)  # Low congestion
    
    def _generate_speed(self, congestion_level: float) -> float:
        """Generate speed based on congestion level"""
        max_speed = 60  # km/h
        min_speed = 10  # km/h
        
        # Inverse relationship between congestion and speed
        speed = max_speed - (congestion_level * (max_speed - min_speed))
        return max(min_speed, speed + random.uniform(-5, 5))
    
    def _predict_congestion_level(self, current_level: float, target_hour: int, weekday: int) -> float:
        """Predict congestion level for future time"""
        # Base prediction on current level
        predicted = current_level
        
        # Adjust for time of day patterns
        if 7 <= target_hour <= 9 or 17 <= target_hour <= 19:
            predicted = min(1.0, predicted + 0.2)  # Rush hour increase
        elif 22 <= target_hour or target_hour <= 6:
            predicted = max(0.1, predicted - 0.3)  # Night decrease
        
        # Adjust for weekday vs weekend
        if weekday >= 5:  # Weekend
            predicted = max(0.1, predicted - 0.2)
        
        return max(0.0, min(1.0, predicted))
    
    def _predict_speed(self, current_speed: float, predicted_congestion: float) -> float:
        """Predict speed based on predicted congestion"""
        max_speed = 60
        min_speed = 10
        
        predicted_speed = max_speed - (predicted_congestion * (max_speed - min_speed))
        return max(min_speed, predicted_speed)
    
    def _calculate_delay(self, conditions: List[TrafficCondition], route: Dict[str, Any]) -> int:
        """Calculate estimated delay in seconds"""
        if not conditions:
            return 0
        
        total_delay = 0
        segments = route.get('segments', [])
        
        for i, condition in enumerate(conditions):
            if i < len(segments):
                segment = segments[i]
                distance_km = segment.get('distance_meters', 1000) / 1000
                
                # Calculate delay based on reduced speed
                normal_speed = 50  # km/h
                actual_speed = condition.speed_kmh
                
                normal_time = (distance_km / normal_speed) * 3600  # seconds
                actual_time = (distance_km / actual_speed) * 3600  # seconds
                
                delay = max(0, actual_time - normal_time)
                total_delay += delay
        
        return int(total_delay)
    
    def _get_traffic_status(self, avg_congestion: float) -> str:
        """Get overall traffic status description"""
        if avg_congestion < 0.3:
            return "free_flow"
        elif avg_congestion < 0.6:
            return "moderate"
        elif avg_congestion < 0.8:
            return "heavy"
        else:
            return "severe"
    
    def _generate_3d_overlay_data(self, conditions: List[TrafficCondition], route: Dict[str, Any]) -> Dict[str, Any]:
        """Generate 3D overlay data for traffic visualization"""
        overlay_segments = []
        
        for i, condition in enumerate(conditions):
            overlay_segments.append({
                'segment_index': i,
                'color': condition.color_code,
                'opacity': 0.7,
                'height_multiplier': 1.0 + condition.congestion_level,  # Higher bars for more congestion
                'animation_speed': 1.0 - condition.congestion_level,  # Slower animation for more congestion
                'particle_density': int(condition.congestion_level * 100)  # More particles for more traffic
            })
        
        return {
            'segments': overlay_segments,
            'legend': {
                'green': 'Free flow',
                'amber': 'Moderate traffic',
                'red': 'Heavy congestion'
            },
            'animation_enabled': True
        }
    
    def _get_mock_traffic_analysis(self, routes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate mock traffic analysis when service fails"""
        return {
            'traffic_analysis': [{
                'route_id': route.get('id', 'mock_route'),
                'average_congestion': 0.4,
                'average_speed': 45,
                'estimated_delay_seconds': 300,
                'traffic_conditions': [],
                'overall_status': 'moderate',
                'last_updated': datetime.utcnow().isoformat()
            } for route in routes],
            'total_routes_analyzed': len(routes),
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'data_freshness': 'mock_data'
        }