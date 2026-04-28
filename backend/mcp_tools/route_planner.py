import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import aiohttp
import math

logger = logging.getLogger(__name__)

class Coordinate3D:
    def __init__(self, latitude: float, longitude: float, elevation: float = 0.0):
        self.latitude = latitude
        self.longitude = longitude
        self.elevation = elevation
        self.timestamp = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'latitude': self.latitude,
            'longitude': self.longitude,
            'elevation': self.elevation,
            'timestamp': self.timestamp.isoformat()
        }

class RouteSegment3D:
    def __init__(self, coordinates: List[Coordinate3D], transport_mode: str, 
                 distance_meters: float, duration_seconds: int, cost: float):
        self.coordinates = coordinates
        self.transport_mode = transport_mode
        self.distance_meters = distance_meters
        self.duration_seconds = duration_seconds
        self.cost = cost
        self.instructions = []
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

class Route3D:
    def __init__(self, route_id: str, segments: List[RouteSegment3D]):
        self.id = route_id
        self.segments = segments
        self.total_distance = sum(seg.distance_meters for seg in segments)
        self.total_duration = sum(seg.duration_seconds for seg in segments)
        self.total_cost = sum(seg.cost for seg in segments)
        self.safety_rating = 8.0  # Default safety rating
        self.created_at = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'segments': [seg.to_dict() for seg in self.segments],
            'total_distance': self.total_distance,
            'total_duration': self.total_duration,
            'total_cost': self.total_cost,
            'safety_rating': self.safety_rating,
            'created_at': self.created_at.isoformat()
        }
    
    def get_elevation_profile(self) -> List[Dict[str, float]]:
        """Generate elevation profile for 3D visualization"""
        profile = []
        distance = 0
        
        for segment in self.segments:
            for coord in segment.coordinates:
                profile.append({
                    'distance': distance,
                    'elevation': coord.elevation,
                    'latitude': coord.latitude,
                    'longitude': coord.longitude
                })
                distance += segment.distance_meters / len(segment.coordinates)
        
        return profile

class RoutePlannerMCP:
    """Route planning with 3D coordinate generation"""
    
    def __init__(self):
        self.name = "route_planner"
        self.last_used = None
        self.error_count = 0
        
        # Mock Google Maps API key (in real implementation, use environment variable)
        self.api_key = "mock_google_maps_api_key"
        self.base_url = "https://maps.googleapis.com/maps/api"
        
        logger.info("Route Planner MCP initialized")
    
    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Main execution method for route planning"""
        try:
            self.last_used = datetime.utcnow()
            
            action = params.get('action', 'find_routes')
            
            if action == 'find_routes':
                return await self.find_routes(
                    params['source'], 
                    params['destination'],
                    params.get('include_3d', False)
                )
            elif action == 'optimize_route':
                return await self.optimize_route(
                    params['route'],
                    params.get('constraints', {})
                )
            else:
                raise ValueError(f"Unknown action: {action}")
                
        except Exception as e:
            self.error_count += 1
            logger.error(f"Route Planner error: {str(e)}")
            raise
    
    async def find_routes(self, source: str, destination: str, include_3d: bool = False) -> Dict[str, Any]:
        """Find alternative routes with elevation and 3D data"""
        try:
            # Parse source and destination
            source_coords = await self._geocode_address(source)
            dest_coords = await self._geocode_address(destination)
            
            # Generate multiple route alternatives
            routes = []
            
            # Route 1: Fastest route
            fastest_route = await self._generate_route(
                source_coords, dest_coords, "fastest", include_3d
            )
            routes.append(fastest_route)
            
            # Route 2: Shortest route
            shortest_route = await self._generate_route(
                source_coords, dest_coords, "shortest", include_3d
            )
            routes.append(shortest_route)
            
            # Route 3: Scenic route (if available)
            scenic_route = await self._generate_route(
                source_coords, dest_coords, "scenic", include_3d
            )
            routes.append(scenic_route)
            
            return {
                'routes': [route.to_dict() for route in routes],
                'source_coordinates': source_coords,
                'destination_coordinates': dest_coords,
                'total_routes': len(routes),
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error finding routes: {str(e)}")
            return await self._get_mock_routes(source, destination, include_3d)
    
    async def optimize_route(self, route_data: Dict[str, Any], constraints: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize existing route with 3D visualization data"""
        try:
            # Extract route information
            route_id = route_data.get('id', 'optimized_route')
            
            # Apply optimization based on constraints
            optimization_type = constraints.get('type', 'time')
            
            if optimization_type == 'time':
                # Optimize for time
                optimized_segments = await self._optimize_for_time(route_data)
            elif optimization_type == 'cost':
                # Optimize for cost
                optimized_segments = await self._optimize_for_cost(route_data)
            elif optimization_type == 'safety':
                # Optimize for safety
                optimized_segments = await self._optimize_for_safety(route_data)
            else:
                optimized_segments = route_data.get('segments', [])
            
            # Create optimized route
            optimized_route = Route3D(f"{route_id}_optimized", optimized_segments)
            
            return {
                'optimized_route': optimized_route.to_dict(),
                'optimization_type': optimization_type,
                'improvements': {
                    'time_saved': 300,  # 5 minutes
                    'cost_saved': 2.50,
                    'safety_improved': 0.5
                },
                'optimized_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error optimizing route: {str(e)}")
            return {'error': str(e)}
    
    async def _geocode_address(self, address: str) -> Dict[str, float]:
        """Convert address to coordinates (mock implementation)"""
        # Mock geocoding - in real implementation, use Google Geocoding API
        mock_coordinates = {
            'current location': {'lat': 37.7749, 'lng': -122.4194, 'elevation': 50},
            'san francisco': {'lat': 37.7749, 'lng': -122.4194, 'elevation': 50},
            'los angeles': {'lat': 34.0522, 'lng': -118.2437, 'elevation': 100},
            'new york': {'lat': 40.7128, 'lng': -74.0060, 'elevation': 10},
            'chicago': {'lat': 41.8781, 'lng': -87.6298, 'elevation': 180},
            'seattle': {'lat': 47.6062, 'lng': -122.3321, 'elevation': 60}
        }
        
        address_lower = address.lower()
        for key, coords in mock_coordinates.items():
            if key in address_lower:
                return coords
        
        # Default coordinates if address not found
        return {'lat': 37.7749, 'lng': -122.4194, 'elevation': 50}
    
    async def _generate_route(self, source: Dict[str, float], destination: Dict[str, float], 
                            route_type: str, include_3d: bool) -> Route3D:
        """Generate a route between two points"""
        # Calculate basic route parameters
        distance = self._calculate_distance(source, destination)
        
        # Generate route coordinates
        coordinates = self._generate_route_coordinates(source, destination, route_type, include_3d)
        
        # Determine transport mode and costs
        transport_mode = "driving"
        base_cost = distance * 0.5  # $0.50 per km
        
        # Adjust based on route type
        if route_type == "fastest":
            duration = int(distance * 60)  # 1 minute per km
            cost = base_cost * 1.2  # Higher cost for faster route
        elif route_type == "shortest":
            duration = int(distance * 80)  # 1.33 minutes per km
            cost = base_cost
        elif route_type == "scenic":
            duration = int(distance * 100)  # 1.67 minutes per km
            cost = base_cost * 0.9  # Slightly cheaper
        else:
            duration = int(distance * 70)
            cost = base_cost
        
        # Create route segment
        segment = RouteSegment3D(
            coordinates=coordinates,
            transport_mode=transport_mode,
            distance_meters=distance * 1000,
            duration_seconds=duration,
            cost=cost
        )
        
        # Create route
        route_id = f"{route_type}_route_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        route = Route3D(route_id, [segment])
        
        return route
    
    def _generate_route_coordinates(self, source: Dict[str, float], destination: Dict[str, float], 
                                  route_type: str, include_3d: bool) -> List[Coordinate3D]:
        """Generate coordinates along the route"""
        coordinates = []
        
        # Number of points along the route
        num_points = 20 if include_3d else 10
        
        for i in range(num_points + 1):
            progress = i / num_points
            
            # Linear interpolation between source and destination
            lat = source['lat'] + (destination['lat'] - source['lat']) * progress
            lng = source['lng'] + (destination['lng'] - source['lng']) * progress
            
            # Calculate elevation based on route type
            if include_3d:
                if route_type == "scenic":
                    # Scenic route has more elevation variation
                    elevation = source['elevation'] + math.sin(progress * math.pi * 2) * 50
                else:
                    # Linear elevation change
                    elevation = source['elevation'] + (destination['elevation'] - source['elevation']) * progress
            else:
                elevation = 0.0
            
            coordinates.append(Coordinate3D(lat, lng, elevation))
        
        return coordinates
    
    def _calculate_distance(self, source: Dict[str, float], destination: Dict[str, float]) -> float:
        """Calculate distance between two points in kilometers"""
        # Haversine formula
        R = 6371  # Earth's radius in kilometers
        
        lat1, lng1 = math.radians(source['lat']), math.radians(source['lng'])
        lat2, lng2 = math.radians(destination['lat']), math.radians(destination['lng'])
        
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    async def _optimize_for_time(self, route_data: Dict[str, Any]) -> List[RouteSegment3D]:
        """Optimize route for minimum time"""
        # Mock optimization - reduce duration by 10%
        segments = []
        for seg_data in route_data.get('segments', []):
            coordinates = [Coordinate3D(**coord) for coord in seg_data['coordinates']]
            segment = RouteSegment3D(
                coordinates=coordinates,
                transport_mode=seg_data['transport_mode'],
                distance_meters=seg_data['distance_meters'],
                duration_seconds=int(seg_data['duration_seconds'] * 0.9),  # 10% faster
                cost=seg_data['cost'] * 1.1  # Slightly more expensive
            )
            segments.append(segment)
        return segments
    
    async def _optimize_for_cost(self, route_data: Dict[str, Any]) -> List[RouteSegment3D]:
        """Optimize route for minimum cost"""
        # Mock optimization - reduce cost by 15%
        segments = []
        for seg_data in route_data.get('segments', []):
            coordinates = [Coordinate3D(**coord) for coord in seg_data['coordinates']]
            segment = RouteSegment3D(
                coordinates=coordinates,
                transport_mode=seg_data['transport_mode'],
                distance_meters=seg_data['distance_meters'],
                duration_seconds=int(seg_data['duration_seconds'] * 1.1),  # 10% slower
                cost=seg_data['cost'] * 0.85  # 15% cheaper
            )
            segments.append(segment)
        return segments
    
    async def _optimize_for_safety(self, route_data: Dict[str, Any]) -> List[RouteSegment3D]:
        """Optimize route for maximum safety"""
        # Mock optimization - improve safety rating
        segments = []
        for seg_data in route_data.get('segments', []):
            coordinates = [Coordinate3D(**coord) for coord in seg_data['coordinates']]
            segment = RouteSegment3D(
                coordinates=coordinates,
                transport_mode=seg_data['transport_mode'],
                distance_meters=seg_data['distance_meters'] * 1.05,  # Slightly longer
                duration_seconds=int(seg_data['duration_seconds'] * 1.15),  # 15% slower
                cost=seg_data['cost']
            )
            segments.append(segment)
        return segments
    
    async def _get_mock_routes(self, source: str, destination: str, include_3d: bool) -> Dict[str, Any]:
        """Generate mock routes when API fails"""
        return {
            'routes': [
                {
                    'id': 'mock_route_1',
                    'segments': [{
                        'coordinates': [
                            {'latitude': 37.7749, 'longitude': -122.4194, 'elevation': 50},
                            {'latitude': 37.7849, 'longitude': -122.4094, 'elevation': 60}
                        ],
                        'transport_mode': 'driving',
                        'distance_meters': 15000,
                        'duration_seconds': 1800,
                        'cost': 12.50
                    }],
                    'total_distance': 15000,
                    'total_duration': 1800,
                    'total_cost': 12.50,
                    'safety_rating': 8.5
                }
            ],
            'source_coordinates': {'lat': 37.7749, 'lng': -122.4194},
            'destination_coordinates': {'lat': 37.7849, 'lng': -122.4094},
            'total_routes': 1,
            'status': 'mock_data'
        }