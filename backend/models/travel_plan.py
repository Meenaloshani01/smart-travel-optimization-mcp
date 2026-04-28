from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

@dataclass
class Coordinate3D:
    latitude: float
    longitude: float
    elevation: float
    timestamp: Optional[datetime] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'latitude': self.latitude,
            'longitude': self.longitude,
            'elevation': self.elevation,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Coordinate3D':
        timestamp = None
        if 'timestamp' in data and data['timestamp']:
            timestamp = datetime.fromisoformat(data['timestamp'])
        
        return cls(
            latitude=data['latitude'],
            longitude=data['longitude'],
            elevation=data['elevation'],
            timestamp=timestamp
        )

@dataclass
class RouteSegment3D:
    coordinates: List[Coordinate3D]
    transport_mode: str
    distance_meters: float
    duration_seconds: int
    cost: float
    instructions: List[str] = None
    traffic_conditions: List[Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.instructions is None:
            self.instructions = []
        if self.traffic_conditions is None:
            self.traffic_conditions = []
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'coordinates': [coord.to_dict() for coord in self.coordinates],
            'transport_mode': self.transport_mode,
            'distance_meters': self.distance_meters,
            'duration_seconds': self.duration_seconds,
            'cost': self.cost,
            'instructions': self.instructions,
            'traffic_conditions': self.traffic_conditions
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RouteSegment3D':
        coordinates = [Coordinate3D.from_dict(coord) for coord in data.get('coordinates', [])]
        
        return cls(
            coordinates=coordinates,
            transport_mode=data['transport_mode'],
            distance_meters=data['distance_meters'],
            duration_seconds=data['duration_seconds'],
            cost=data['cost'],
            instructions=data.get('instructions', []),
            traffic_conditions=data.get('traffic_conditions', [])
        )

@dataclass
class WeatherImpact:
    conditions: str
    temperature_celsius: float
    precipitation_chance: float
    visibility_km: float
    wind_speed_kmh: float
    impact_on_travel: str
    delay_estimate_seconds: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'WeatherImpact':
        return cls(**data)

@dataclass
class RouteVisualizationData:
    elevation_profile: List[Dict[str, float]]
    traffic_overlay: Dict[str, Any]
    weather_effects: Dict[str, Any]
    safety_indicators: List[Dict[str, Any]]
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RouteVisualizationData':
        return cls(**data)

@dataclass
class Route3D:
    id: str
    segments: List[RouteSegment3D]
    total_distance: float = 0
    total_duration: int = 0
    total_cost: float = 0
    safety_rating: float = 8.0
    weather_impact: Optional[WeatherImpact] = None
    visualization_data: Optional[RouteVisualizationData] = None
    traffic_conditions: List[Dict[str, Any]] = None
    estimated_delay: int = 0
    risk_factors: List[str] = None
    cost_breakdown: Dict[str, float] = None
    created_at: Optional[datetime] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.traffic_conditions is None:
            self.traffic_conditions = []
        if self.risk_factors is None:
            self.risk_factors = []
        if self.cost_breakdown is None:
            self.cost_breakdown = {}
        
        # Calculate totals if not provided
        if self.total_distance == 0:
            self.total_distance = sum(seg.distance_meters for seg in self.segments)
        if self.total_duration == 0:
            self.total_duration = sum(seg.duration_seconds for seg in self.segments)
        if self.total_cost == 0:
            self.total_cost = sum(seg.cost for seg in self.segments)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'segments': [seg.to_dict() for seg in self.segments],
            'total_distance': self.total_distance,
            'total_duration': self.total_duration,
            'total_cost': self.total_cost,
            'safety_rating': self.safety_rating,
            'weather_impact': self.weather_impact.to_dict() if self.weather_impact else None,
            'visualization_data': self.visualization_data.to_dict() if self.visualization_data else None,
            'traffic_conditions': self.traffic_conditions,
            'estimated_delay': self.estimated_delay,
            'risk_factors': self.risk_factors,
            'cost_breakdown': self.cost_breakdown,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Route3D':
        segments = [RouteSegment3D.from_dict(seg) for seg in data.get('segments', [])]
        
        weather_impact = None
        if data.get('weather_impact'):
            weather_impact = WeatherImpact.from_dict(data['weather_impact'])
        
        visualization_data = None
        if data.get('visualization_data'):
            visualization_data = RouteVisualizationData.from_dict(data['visualization_data'])
        
        created_at = None
        if data.get('created_at'):
            created_at = datetime.fromisoformat(data['created_at'])
        
        return cls(
            id=data['id'],
            segments=segments,
            total_distance=data.get('total_distance', 0),
            total_duration=data.get('total_duration', 0),
            total_cost=data.get('total_cost', 0),
            safety_rating=data.get('safety_rating', 8.0),
            weather_impact=weather_impact,
            visualization_data=visualization_data,
            traffic_conditions=data.get('traffic_conditions', []),
            estimated_delay=data.get('estimated_delay', 0),
            risk_factors=data.get('risk_factors', []),
            cost_breakdown=data.get('cost_breakdown', {}),
            created_at=created_at
        )
    
    def get_elevation_profile(self) -> List[Dict[str, float]]:
        """Generate elevation profile for 3D visualization"""
        profile = []
        distance = 0
        
        for segment in self.segments:
            segment_distance = segment.distance_meters / len(segment.coordinates) if segment.coordinates else 0
            
            for coord in segment.coordinates:
                profile.append({
                    'distance': distance,
                    'elevation': coord.elevation,
                    'latitude': coord.latitude,
                    'longitude': coord.longitude
                })
                distance += segment_distance
        
        return profile
    
    def get_traffic_overlay_data(self) -> Dict[str, Any]:
        """Generate traffic overlay data for 3D map"""
        overlay_data = {
            'segments': [],
            'overall_status': 'unknown',
            'average_speed': 50,
            'congestion_level': 0.3
        }
        
        if self.traffic_conditions:
            total_congestion = 0
            total_speed = 0
            
            for i, condition in enumerate(self.traffic_conditions):
                overlay_data['segments'].append({
                    'segment_index': i,
                    'congestion_level': condition.get('congestion_level', 0.3),
                    'speed_kmh': condition.get('speed_kmh', 50),
                    'color_code': condition.get('color_code', '#10b981'),
                    'incident_type': condition.get('incident_type')
                })
                
                total_congestion += condition.get('congestion_level', 0.3)
                total_speed += condition.get('speed_kmh', 50)
            
            if self.traffic_conditions:
                avg_congestion = total_congestion / len(self.traffic_conditions)
                avg_speed = total_speed / len(self.traffic_conditions)
                
                overlay_data['average_speed'] = avg_speed
                overlay_data['congestion_level'] = avg_congestion
                
                if avg_congestion < 0.3:
                    overlay_data['overall_status'] = 'free_flow'
                elif avg_congestion < 0.6:
                    overlay_data['overall_status'] = 'moderate'
                else:
                    overlay_data['overall_status'] = 'heavy'
        
        return overlay_data

@dataclass
class TransportOption:
    mode: str  # car, bus, train, bike, walk, rideshare
    estimated_time: int  # seconds
    cost: float
    comfort_rating: float  # 1-10
    environmental_impact: float  # 1-10 (10 = most eco-friendly)
    availability: str  # available, limited, unavailable
    schedule: Optional[List[str]] = None  # For public transport
    booking_url: Optional[str] = None
    
    def __post_init__(self):
        if self.schedule is None:
            self.schedule = []
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TransportOption':
        return cls(**data)

@dataclass
class Alert:
    type: str  # traffic, weather, safety, construction, incident
    severity: str  # low, medium, high, critical
    message: str
    location: Optional[Coordinate3D] = None
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': self.type,
            'severity': self.severity,
            'message': self.message,
            'location': self.location.to_dict() if self.location else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Alert':
        location = None
        if data.get('location'):
            location = Coordinate3D.from_dict(data['location'])
        
        expires_at = None
        if data.get('expires_at'):
            expires_at = datetime.fromisoformat(data['expires_at'])
        
        created_at = None
        if data.get('created_at'):
            created_at = datetime.fromisoformat(data['created_at'])
        
        return cls(
            type=data['type'],
            severity=data['severity'],
            message=data['message'],
            location=location,
            expires_at=expires_at,
            created_at=created_at
        )

@dataclass
class VisualizationData:
    route_3d_data: Dict[str, Any]
    traffic_overlay: Dict[str, Any]
    weather_effects: Dict[str, Any]
    safety_indicators: List[Dict[str, Any]]
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'VisualizationData':
        return cls(**data)

@dataclass
class TravelPlan:
    id: str
    request_id: str
    recommended_route: Route3D
    alternative_routes: List[Route3D]
    transport_recommendations: List[TransportOption]
    alerts: List[Alert]
    confidence_score: float
    created_at: datetime
    expires_at: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert plan to dictionary for API serialization"""
        return {
            'id': self.id,
            'request_id': self.request_id,
            'recommended_route': self.recommended_route.to_dict(),
            'alternative_routes': [route.to_dict() for route in self.alternative_routes],
            'transport_recommendations': [opt.to_dict() for opt in self.transport_recommendations],
            'alerts': [alert.to_dict() for alert in self.alerts],
            'confidence_score': self.confidence_score,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TravelPlan':
        """Create from dictionary for API deserialization"""
        recommended_route = Route3D.from_dict(data['recommended_route'])
        alternative_routes = [Route3D.from_dict(route) for route in data.get('alternative_routes', [])]
        transport_recommendations = [TransportOption.from_dict(opt) for opt in data.get('transport_recommendations', [])]
        alerts = [Alert.from_dict(alert) for alert in data.get('alerts', [])]
        
        return cls(
            id=data['id'],
            request_id=data['request_id'],
            recommended_route=recommended_route,
            alternative_routes=alternative_routes,
            transport_recommendations=transport_recommendations,
            alerts=alerts,
            confidence_score=data['confidence_score'],
            created_at=datetime.fromisoformat(data['created_at']),
            expires_at=datetime.fromisoformat(data['expires_at'])
        )
    
    def to_3d_visualization_data(self) -> VisualizationData:
        """Convert plan to 3D visualization format"""
        return VisualizationData(
            route_3d_data=self.recommended_route.get_elevation_profile(),
            traffic_overlay=self.recommended_route.get_traffic_overlay_data(),
            weather_effects=self.recommended_route.weather_impact.to_dict() if self.recommended_route.weather_impact else {},
            safety_indicators=[
                {
                    'type': 'safety_rating',
                    'value': self.recommended_route.safety_rating,
                    'risk_factors': self.recommended_route.risk_factors
                }
            ]
        )
    
    def is_expired(self) -> bool:
        """Check if travel plan has expired"""
        return datetime.utcnow() > self.expires_at
    
    def get_active_alerts(self) -> List[Alert]:
        """Get alerts that are still active"""
        now = datetime.utcnow()
        return [alert for alert in self.alerts if not alert.expires_at or alert.expires_at > now]