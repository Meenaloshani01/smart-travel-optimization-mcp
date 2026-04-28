import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid

from models.travel_request import TravelRequest
from models.travel_plan import TravelPlan, Route3D, TransportOption, Alert
from services.mcp_router import MCPRouter, ToolRequest

logger = logging.getLogger(__name__)

class TravelOptimizer:
    """Main service for optimizing travel plans using MCP tools"""
    
    def __init__(self, mcp_router: MCPRouter):
        self.mcp_router = mcp_router
        self.active_plans = {}  # Store active travel plans
        
        logger.info("Travel Optimizer initialized")
    
    async def optimize_travel(self, travel_request: TravelRequest) -> TravelPlan:
        """Generate optimized travel plan from user request"""
        try:
            logger.info(f"Optimizing travel for request: {travel_request.id}")
            
            # TEMPORARY: Return a realistic mock plan for testing
            from models.travel_plan import RouteSegment3D, Coordinate3D
            import math
            
            # Create simple coordinates
            start_coord = Coordinate3D(
                latitude=travel_request.source.latitude,
                longitude=travel_request.source.longitude,
                elevation=0.0
            )
            
            end_coord = Coordinate3D(
                latitude=travel_request.destination.latitude,
                longitude=travel_request.destination.longitude,
                elevation=0.0
            )
            
            # Calculate realistic distance using Haversine formula
            def calculate_distance(lat1, lon1, lat2, lon2):
                R = 6371000  # Earth's radius in meters
                phi1 = math.radians(lat1)
                phi2 = math.radians(lat2)
                delta_phi = math.radians(lat2 - lat1)
                delta_lambda = math.radians(lon2 - lon1)
                
                a = math.sin(delta_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
                
                return R * c
            
            distance_meters = calculate_distance(
                travel_request.source.latitude,
                travel_request.source.longitude,
                travel_request.destination.latitude,
                travel_request.destination.longitude
            )
            
            # Calculate realistic travel time based on distance
            # Assume average speed of 50 km/h for mixed roads in India
            average_speed_kmh = 50
            distance_km = distance_meters / 1000
            duration_hours = distance_km / average_speed_kmh
            duration_seconds = int(duration_hours * 3600)
            
            # Calculate realistic cost based on distance (₹4 per km for car)
            cost_per_km = 4.0
            total_cost = distance_km * cost_per_km
            
            # Add some variation for longer distances
            if distance_km > 200:
                # Long distance - add highway tolls and fuel costs
                total_cost += distance_km * 2.0  # Additional ₹2 per km for long distance
                average_speed_kmh = 60  # Slightly faster on highways
                duration_seconds = int((distance_km / average_speed_kmh) * 3600)
            
            logger.info(f"Calculated route: {distance_km:.1f} km, {duration_seconds/3600:.1f} hours, Rs {total_cost:.0f}")
            
            # Create a realistic route segment
            segment = RouteSegment3D(
                coordinates=[start_coord, end_coord],
                transport_mode='car',
                distance_meters=int(distance_meters),
                duration_seconds=duration_seconds,
                cost=total_cost,
                instructions=[
                    f'Head towards {travel_request.destination.address}',
                    f'Continue for {distance_km:.0f} km',
                    f'Arrive at destination'
                ]
            )
            
            # Create the route
            mock_route = Route3D(
                id=f"route_{uuid.uuid4()}",
                segments=[segment],
                total_distance=int(distance_meters),
                total_duration=duration_seconds,
                total_cost=total_cost,
                safety_rating=8.5,
                created_at=datetime.utcnow()
            )
            
            # Create realistic transport options based on distance
            transport_options = []
            
            # Car option (base option)
            transport_options.append(TransportOption(
                mode='car',
                estimated_time=duration_seconds,
                cost=total_cost,
                comfort_rating=8.0,
                environmental_impact=6.0,
                availability='available'
            ))
            
            # Bus option (cheaper, slower)
            bus_duration = int(duration_seconds * 1.5)  # 50% longer
            bus_cost = total_cost * 0.3  # 30% of car cost
            transport_options.append(TransportOption(
                mode='bus',
                estimated_time=bus_duration,
                cost=bus_cost,
                comfort_rating=6.0,
                environmental_impact=9.0,
                availability='available'
            ))
            
            # Train option (if distance > 100km)
            if distance_km > 100:
                train_duration = int(duration_seconds * 1.2)  # 20% longer than car
                train_cost = total_cost * 0.4  # 40% of car cost
                transport_options.append(TransportOption(
                    mode='train',
                    estimated_time=train_duration,
                    cost=train_cost,
                    comfort_rating=7.5,
                    environmental_impact=8.5,
                    availability='available'
                ))
            
            # Flight option (if distance > 300km)
            if distance_km > 300:
                flight_duration = int(3600 + (distance_km / 800) * 3600)  # 1 hour + flight time
                flight_cost = total_cost * 3.0  # 3x car cost
                transport_options.append(TransportOption(
                    mode='flight',
                    estimated_time=flight_duration,
                    cost=flight_cost,
                    comfort_rating=9.0,
                    environmental_impact=3.0,
                    availability='limited'
                ))
            
            # Create travel plan
            travel_plan = TravelPlan(
                id=str(uuid.uuid4()),
                request_id=travel_request.id,
                recommended_route=mock_route,
                alternative_routes=[],
                transport_recommendations=transport_options,
                alerts=[],
                confidence_score=0.85,
                created_at=datetime.utcnow(),
                expires_at=datetime.utcnow().replace(hour=23, minute=59, second=59)
            )
            
            logger.info(f"Mock travel plan created successfully: {travel_plan.id}")
            logger.info(f"Travel plan type: {type(travel_plan)}")
            
            return travel_plan
            
        except Exception as e:
            logger.error(f"Error creating mock travel plan: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise e
        """Generate optimized travel plan from user request"""
        try:
            logger.info(f"Optimizing travel for request: {travel_request.id}")
            
            # Validate travel request
            if not travel_request.validate():
                raise ValueError("Invalid travel request")
            
            # Step 1: Get routes using Route Planner
            routes_data = await self.mcp_router.execute_tool('route_planner', {
                'action': 'find_routes',
                'source': f"{travel_request.source.latitude},{travel_request.source.longitude}",
                'destination': f"{travel_request.destination.latitude},{travel_request.destination.longitude}",
                'include_3d': True
            })
            
            # Step 2: Analyze traffic for all routes in parallel
            traffic_requests = []
            for route in routes_data.get('routes', []):
                traffic_requests.append(ToolRequest('traffic_analyzer', {
                    'action': 'analyze_traffic',
                    'routes': [route],
                    'include_3d_overlay': True
                }))
            
            # Step 3: Get weather conditions
            weather_request = ToolRequest('weather_checker', {
                'latitude': travel_request.source.latitude,
                'longitude': travel_request.source.longitude,
                'include_3d_effects': True
            })
            
            # Step 4: Get transport recommendations
            transport_request = ToolRequest('transport_recommender', {
                'source': f"{travel_request.source.latitude},{travel_request.source.longitude}",
                'destination': f"{travel_request.destination.latitude},{travel_request.destination.longitude}",
                'budget': travel_request.budget_constraints.max_cost,
                'preferences': travel_request.preferences.to_dict()
            })
            
            # Execute all requests in parallel
            all_requests = traffic_requests + [weather_request, transport_request]
            responses = await self.mcp_router.execute_parallel(all_requests)
            
            # Process responses
            traffic_responses = responses[:len(traffic_requests)]
            weather_response = responses[-2]
            transport_response = responses[-1]
            
            # Step 5: Analyze safety for each route
            safety_analyses = []
            for route in routes_data.get('routes', []):
                safety_data = await self.mcp_router.execute_tool('safety_analyzer', {
                    'route': route,
                    'time_of_day': self._get_time_of_day(travel_request.time_constraints.departure_time)
                })
                safety_analyses.append(safety_data)
            
            # Step 6: Calculate costs for each route
            cost_analyses = []
            for route in routes_data.get('routes', []):
                cost_data = await self.mcp_router.execute_tool('budget_calculator', {
                    'route': route,
                    'transport_modes': travel_request.preferences.transport_modes,
                    'budget_constraints': travel_request.budget_constraints.to_dict()
                })
                cost_analyses.append(cost_data)
            
            # Step 7: Combine all data and create optimized routes
            optimized_routes = self._create_optimized_routes(
                routes_data.get('routes', []),
                traffic_responses,
                safety_analyses,
                cost_analyses,
                weather_response.result if weather_response.success else {}
            )
            
            # Step 8: Select best route and alternatives
            recommended_route = self._select_best_route(optimized_routes, travel_request)
            alternative_routes = [r for r in optimized_routes if r.id != recommended_route.id][:2]
            
            # Step 9: Generate transport options
            transport_options = self._create_transport_options(
                transport_response.result if transport_response.success else {},
                recommended_route
            )
            
            # Step 10: Generate alerts
            alerts = await self._generate_alerts(recommended_route, weather_response.result)
            
            # Step 11: Create travel plan
            travel_plan = TravelPlan(
                id=str(uuid.uuid4()),
                request_id=travel_request.id,
                recommended_route=recommended_route,
                alternative_routes=alternative_routes,
                transport_recommendations=transport_options,
                alerts=alerts,
                confidence_score=self._calculate_confidence_score(optimized_routes, responses),
                created_at=datetime.utcnow(),
                expires_at=datetime.utcnow().replace(hour=23, minute=59, second=59)
            )
            
            # Store active plan
            self.active_plans[travel_plan.id] = travel_plan
            
            logger.info(f"Travel plan optimized successfully: {travel_plan.id}")
            return travel_plan
            
        except Exception as e:
            logger.error(f"Error optimizing travel: {str(e)}")
            logger.error(f"Exception type: {type(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            # Return fallback plan
            fallback_plan = self._create_fallback_plan(travel_request)
            logger.info(f"Created fallback plan type: {type(fallback_plan)}")
            return fallback_plan
    
    async def re_optimize_plan(self, plan_id: str) -> TravelPlan:
        """Re-optimize existing plan based on current conditions"""
        try:
            if plan_id not in self.active_plans:
                raise ValueError(f"Plan not found: {plan_id}")
            
            current_plan = self.active_plans[plan_id]
            
            # Get updated traffic conditions
            traffic_data = await self.mcp_router.execute_tool('traffic_analyzer', {
                'action': 'analyze_traffic',
                'routes': [current_plan.recommended_route.to_dict()],
                'include_3d_overlay': True
            })
            
            # Get updated weather
            weather_data = await self.mcp_router.execute_tool('weather_checker', {
                'latitude': current_plan.recommended_route.segments[0].coordinates[0].latitude,
                'longitude': current_plan.recommended_route.segments[0].coordinates[0].longitude,
                'include_3d_effects': True
            })
            
            # Check if re-optimization is needed
            if self._needs_reoptimization(current_plan, traffic_data, weather_data):
                # Create new optimized route
                optimized_route = await self.mcp_router.execute_tool('route_planner', {
                    'action': 'optimize_route',
                    'route': current_plan.recommended_route.to_dict(),
                    'constraints': {
                        'type': 'time',  # Optimize for time by default
                        'traffic_data': traffic_data,
                        'weather_data': weather_data
                    }
                })
                
                # Update plan
                current_plan.recommended_route = Route3D.from_dict(optimized_route['optimized_route'])
                current_plan.alerts = await self._generate_alerts(current_plan.recommended_route, weather_data)
                current_plan.confidence_score = min(0.9, current_plan.confidence_score + 0.1)
                
                logger.info(f"Plan re-optimized: {plan_id}")
            
            return current_plan
            
        except Exception as e:
            logger.error(f"Error re-optimizing plan: {str(e)}")
            raise
    
    def _create_optimized_routes(self, routes: List[Dict[str, Any]], traffic_responses: List[Any],
                               safety_analyses: List[Dict[str, Any]], cost_analyses: List[Dict[str, Any]],
                               weather_data: Dict[str, Any]) -> List[Route3D]:
        """Combine all analysis data into optimized routes"""
        optimized_routes = []
        
        for i, route_data in enumerate(routes):
            try:
                # Get corresponding analysis data
                traffic_data = traffic_responses[i].result if i < len(traffic_responses) and traffic_responses[i].success else {}
                safety_data = safety_analyses[i] if i < len(safety_analyses) else {}
                cost_data = cost_analyses[i] if i < len(cost_analyses) else {}
                
                # Create Route3D object
                route = Route3D.from_dict(route_data)
                
                # Update route with analysis data
                if traffic_data and 'traffic_analysis' in traffic_data:
                    analysis = traffic_data['traffic_analysis'][0] if traffic_data['traffic_analysis'] else {}
                    route.traffic_conditions = analysis.get('traffic_conditions', [])
                    route.estimated_delay = analysis.get('estimated_delay_seconds', 0)
                
                if safety_data:
                    route.safety_rating = safety_data.get('safety_score', 8.0)
                    route.risk_factors = safety_data.get('risk_factors', [])
                
                if cost_data:
                    route.total_cost = cost_data.get('total_cost', route.total_cost)
                    route.cost_breakdown = cost_data.get('breakdown', {})
                
                # Apply weather impact
                if weather_data:
                    route.weather_impact = weather_data
                    weather_delay = self._calculate_weather_delay(weather_data)
                    route.total_duration += weather_delay
                
                optimized_routes.append(route)
                
            except Exception as e:
                logger.error(f"Error processing route {i}: {str(e)}")
                continue
        
        return optimized_routes
    
    def _select_best_route(self, routes: List[Route3D], travel_request: TravelRequest) -> Route3D:
        """Select the best route based on user preferences and constraints"""
        if not routes:
            raise ValueError("No routes available")
        
        # Score each route
        scored_routes = []
        for route in routes:
            score = self._calculate_route_score(route, travel_request)
            scored_routes.append((route, score))
        
        # Sort by score (higher is better)
        scored_routes.sort(key=lambda x: x[1], reverse=True)
        
        return scored_routes[0][0]
    
    def _calculate_route_score(self, route: Route3D, travel_request: TravelRequest) -> float:
        """Calculate route score based on multiple factors"""
        score = 0.0
        
        # Time factor (30% weight)
        max_time = 7200  # 2 hours
        time_score = max(0, 1 - (route.total_duration / max_time))
        score += time_score * 0.3
        
        # Cost factor (25% weight)
        if travel_request.budget_constraints.max_cost:
            if route.total_cost <= travel_request.budget_constraints.max_cost:
                cost_score = 1 - (route.total_cost / travel_request.budget_constraints.max_cost)
            else:
                cost_score = 0  # Over budget
        else:
            cost_score = 0.8  # Default score if no budget constraint
        score += cost_score * 0.25
        
        # Safety factor (25% weight)
        safety_score = route.safety_rating / 10.0
        score += safety_score * 0.25
        
        # Traffic factor (20% weight)
        traffic_score = 1.0
        if hasattr(route, 'estimated_delay') and route.estimated_delay:
            max_delay = 1800  # 30 minutes
            traffic_score = max(0, 1 - (route.estimated_delay / max_delay))
        score += traffic_score * 0.2
        
        return score
    
    def _create_transport_options(self, transport_data: Dict[str, Any], route: Route3D) -> List[TransportOption]:
        """Create transport options from recommendations"""
        options = []
        
        recommendations = transport_data.get('recommendations', [])
        for rec in recommendations:
            option = TransportOption(
                mode=rec.get('mode', 'car'),
                estimated_time=rec.get('duration_seconds', route.total_duration),
                cost=rec.get('cost', route.total_cost),
                comfort_rating=rec.get('comfort', 7.0),
                environmental_impact=rec.get('environmental_score', 5.0),
                availability=rec.get('availability', 'available')
            )
            options.append(option)
        
        # Add default car option if no recommendations
        if not options:
            options.append(TransportOption(
                mode='car',
                estimated_time=route.total_duration,
                cost=route.total_cost,
                comfort_rating=8.0,
                environmental_impact=4.0,
                availability='available'
            ))
        
        return options
    
    async def _generate_alerts(self, route: Route3D, weather_data: Dict[str, Any]) -> List[Alert]:
        """Generate alerts for the route"""
        alerts = []
        
        # Traffic alerts
        if hasattr(route, 'estimated_delay') and route.estimated_delay > 600:  # 10 minutes
            alerts.append(Alert(
                type='traffic',
                severity='medium',
                message=f"Expected delay of {route.estimated_delay // 60} minutes due to traffic",
                location=None,
                expires_at=datetime.utcnow().replace(hour=23, minute=59)
            ))
        
        # Weather alerts
        if weather_data:
            conditions = weather_data.get('conditions', '').lower()
            if 'rain' in conditions or 'storm' in conditions:
                alerts.append(Alert(
                    type='weather',
                    severity='medium',
                    message="Rain expected - allow extra travel time",
                    location=None,
                    expires_at=datetime.utcnow().replace(hour=23, minute=59)
                ))
        
        # Safety alerts
        if route.safety_rating < 6.0:
            alerts.append(Alert(
                type='safety',
                severity='high',
                message="Route passes through areas with safety concerns",
                location=None,
                expires_at=datetime.utcnow().replace(hour=23, minute=59)
            ))
        
        return alerts
    
    def _calculate_confidence_score(self, routes: List[Route3D], responses: List[Any]) -> float:
        """Calculate confidence score for the travel plan"""
        if not routes:
            return 0.1
        
        # Base confidence
        confidence = 0.8
        
        # Reduce confidence for failed tool responses
        failed_responses = sum(1 for r in responses if not r.success)
        confidence -= (failed_responses / len(responses)) * 0.3
        
        # Increase confidence for multiple route options
        if len(routes) >= 3:
            confidence += 0.1
        
        # Ensure confidence is between 0.1 and 1.0
        return max(0.1, min(1.0, confidence))
    
    def _get_time_of_day(self, departure_time: Optional[datetime]) -> str:
        """Get time of day category"""
        if not departure_time:
            departure_time = datetime.utcnow()
        
        hour = departure_time.hour
        if 6 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 18:
            return 'afternoon'
        elif 18 <= hour < 22:
            return 'evening'
        else:
            return 'night'
    
    def _calculate_weather_delay(self, weather_data: Dict[str, Any]) -> int:
        """Calculate additional delay due to weather conditions"""
        conditions = weather_data.get('conditions', '').lower()
        
        if 'storm' in conditions or 'heavy rain' in conditions:
            return 600  # 10 minutes
        elif 'rain' in conditions or 'snow' in conditions:
            return 300  # 5 minutes
        elif 'fog' in conditions:
            return 180  # 3 minutes
        
        return 0
    
    def _needs_reoptimization(self, plan: TravelPlan, traffic_data: Dict[str, Any], 
                            weather_data: Dict[str, Any]) -> bool:
        """Check if plan needs re-optimization"""
        # Check for significant traffic changes
        if traffic_data and 'traffic_analysis' in traffic_data:
            analysis = traffic_data['traffic_analysis'][0] if traffic_data['traffic_analysis'] else {}
            new_delay = analysis.get('estimated_delay_seconds', 0)
            current_delay = getattr(plan.recommended_route, 'estimated_delay', 0)
            
            if abs(new_delay - current_delay) > 300:  # 5 minutes difference
                return True
        
        # Check for weather changes
        if weather_data:
            conditions = weather_data.get('conditions', '').lower()
            if 'storm' in conditions or 'heavy rain' in conditions:
                return True
        
        return False
    
    def _create_fallback_plan(self, travel_request: TravelRequest) -> TravelPlan:
        """Create a basic fallback plan when optimization fails"""
        # Create a simple direct route
        from models.travel_plan import RouteSegment3D, Coordinate3D
        
        start_coord = Coordinate3D(
            travel_request.source.latitude,
            travel_request.source.longitude,
            travel_request.source.elevation or 0
        )
        
        end_coord = Coordinate3D(
            travel_request.destination.latitude,
            travel_request.destination.longitude,
            travel_request.destination.elevation or 0
        )
        
        segment = RouteSegment3D(
            coordinates=[start_coord, end_coord],
            transport_mode='car',
            distance_meters=15000,  # Default 15km
            duration_seconds=1800,  # Default 30 minutes
            cost=15.0  # Default $15
        )
        
        fallback_route = Route3D(
            route_id='fallback_route',
            segments=[segment]
        )
        
        return TravelPlan(
            id=str(uuid.uuid4()),
            request_id=travel_request.id,
            recommended_route=fallback_route,
            alternative_routes=[],
            transport_recommendations=[],
            alerts=[Alert(
                type='system',
                severity='low',
                message='Using fallback route - limited optimization available',
                location=None,
                expires_at=datetime.utcnow().replace(hour=23, minute=59)
            )],
            confidence_score=0.3,
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow().replace(hour=23, minute=59)
        )