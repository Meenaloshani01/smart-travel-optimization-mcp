import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class BudgetCalculatorMCP:
    """Budget calculation across different transport modes"""
    
    def __init__(self):
        self.name = "budget_calculator"
        self.last_used = None
        self.error_count = 0
        
        # Cost rates per transport mode (per km)
        self.cost_rates = {
            'car': {
                'fuel': 0.12,  # $0.12 per km
                'tolls': 0.05,  # $0.05 per km average
                'parking': 5.00,  # $5 flat rate
                'wear_tear': 0.08  # $0.08 per km
            },
            'bus': {
                'fare': 0.15,  # $0.15 per km
                'transfer_fee': 1.00  # $1 per transfer
            },
            'train': {
                'fare': 0.20,  # $0.20 per km
                'booking_fee': 2.00  # $2 booking fee
            },
            'rideshare': {
                'base_fare': 3.00,  # $3 base fare
                'per_km': 1.50,  # $1.50 per km
                'surge_multiplier': 1.0  # Dynamic pricing
            },
            'bike': {
                'rental': 0.10,  # $0.10 per km if rental
                'maintenance': 0.02  # $0.02 per km maintenance
            },
            'walk': {
                'cost': 0.00  # Free!
            }
        }
        
        logger.info("Budget Calculator MCP initialized")
    
    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Main execution method for budget calculation"""
        try:
            self.last_used = datetime.utcnow()
            
            action = params.get('action', 'calculate_costs')
            
            if action == 'calculate_costs':
                return await self.calculate_route_costs(
                    params.get('route', {}),
                    params.get('transport_modes', ['car']),
                    params.get('budget_constraints', {})
                )
            elif action == 'compare_costs':
                return await self.compare_transport_costs(
                    params.get('routes', []),
                    params.get('transport_modes', ['car'])
                )
            elif action == 'optimize_budget':
                return await self.optimize_for_budget(
                    params.get('route', {}),
                    params.get('max_budget', 50.0)
                )
            else:
                raise ValueError(f"Unknown action: {action}")
                
        except Exception as e:
            self.error_count += 1
            logger.error(f"Budget Calculator error: {str(e)}")
            raise
    
    async def calculate_route_costs(self, route: Dict[str, Any], transport_modes: List[str], 
                                  budget_constraints: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate costs for different transport modes"""
        try:
            route_distance_km = route.get('total_distance', 15000) / 1000  # Convert to km
            route_duration_hours = route.get('total_duration', 1800) / 3600  # Convert to hours
            
            cost_breakdown = {}
            
            for mode in transport_modes:
                if mode in self.cost_rates:
                    mode_costs = await self._calculate_mode_cost(
                        mode, route_distance_km, route_duration_hours, route
                    )
                    cost_breakdown[mode] = mode_costs
            
            # Find cheapest and most expensive options
            total_costs = {mode: costs['total'] for mode, costs in cost_breakdown.items()}
            cheapest_mode = min(total_costs.keys(), key=lambda k: total_costs[k]) if total_costs else None
            most_expensive_mode = max(total_costs.keys(), key=lambda k: total_costs[k]) if total_costs else None
            
            # Check budget compliance
            max_budget = budget_constraints.get('max_cost')
            budget_compliant_modes = []
            if max_budget:
                budget_compliant_modes = [
                    mode for mode, cost in total_costs.items() 
                    if cost <= max_budget
                ]
            
            return {
                'route_id': route.get('id', 'unknown'),
                'cost_breakdown': cost_breakdown,
                'total_costs': total_costs,
                'cheapest_mode': cheapest_mode,
                'most_expensive_mode': most_expensive_mode,
                'budget_compliant_modes': budget_compliant_modes,
                'currency': 'USD',
                'calculated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating route costs: {str(e)}")
            return self._get_mock_cost_calculation(route, transport_modes)
    
    async def compare_transport_costs(self, routes: List[Dict[str, Any]], 
                                    transport_modes: List[str]) -> Dict[str, Any]:
        """Compare costs across multiple routes and transport modes"""
        try:
            route_comparisons = []
            
            for route in routes:
                route_costs = await self.calculate_route_costs(
                    route, transport_modes, {}
                )
                route_comparisons.append({
                    'route_id': route.get('id', 'unknown'),
                    'costs': route_costs['total_costs'],
                    'cheapest_mode': route_costs['cheapest_mode'],
                    'savings_vs_most_expensive': (
                        route_costs['total_costs'].get(route_costs['most_expensive_mode'], 0) -
                        route_costs['total_costs'].get(route_costs['cheapest_mode'], 0)
                    ) if route_costs['cheapest_mode'] and route_costs['most_expensive_mode'] else 0
                })
            
            # Find overall best options
            if route_comparisons:
                best_route_per_mode = {}
                for mode in transport_modes:
                    mode_costs = [
                        (comp['route_id'], comp['costs'].get(mode, float('inf')))
                        for comp in route_comparisons
                        if mode in comp['costs']
                    ]
                    if mode_costs:
                        best_route_id, best_cost = min(mode_costs, key=lambda x: x[1])
                        best_route_per_mode[mode] = {
                            'route_id': best_route_id,
                            'cost': best_cost
                        }
            
            return {
                'route_comparisons': route_comparisons,
                'best_route_per_mode': best_route_per_mode,
                'total_routes': len(routes),
                'transport_modes_analyzed': transport_modes,
                'comparison_generated': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error comparing transport costs: {str(e)}")
            return {'error': str(e)}
    
    async def optimize_for_budget(self, route: Dict[str, Any], max_budget: float) -> Dict[str, Any]:
        """Optimize transport options within budget constraints"""
        try:
            all_modes = list(self.cost_rates.keys())
            cost_analysis = await self.calculate_route_costs(
                route, all_modes, {'max_cost': max_budget}
            )
            
            budget_options = []
            for mode, costs in cost_analysis['cost_breakdown'].items():
                if costs['total'] <= max_budget:
                    budget_options.append({
                        'mode': mode,
                        'total_cost': costs['total'],
                        'cost_breakdown': costs,
                        'budget_utilization': (costs['total'] / max_budget) * 100,
                        'savings': max_budget - costs['total']
                    })
            
            # Sort by cost (cheapest first)
            budget_options.sort(key=lambda x: x['total_cost'])
            
            # Calculate potential savings
            total_savings = sum(opt['savings'] for opt in budget_options)
            
            recommendations = []
            if budget_options:
                cheapest = budget_options[0]
                recommendations.append(f"Cheapest option: {cheapest['mode']} for ${cheapest['total_cost']:.2f}")
                
                if len(budget_options) > 1:
                    fastest_in_budget = min(
                        budget_options,
                        key=lambda x: self._get_mode_time_factor(x['mode'])
                    )
                    recommendations.append(f"Fastest within budget: {fastest_in_budget['mode']} for ${fastest_in_budget['total_cost']:.2f}")
            
            return {
                'route_id': route.get('id', 'unknown'),
                'max_budget': max_budget,
                'budget_compliant_options': budget_options,
                'total_options_in_budget': len(budget_options),
                'potential_savings': total_savings,
                'recommendations': recommendations,
                'optimized_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error optimizing for budget: {str(e)}")
            return {'error': str(e)}
    
    async def _calculate_mode_cost(self, mode: str, distance_km: float, 
                                 duration_hours: float, route: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate detailed cost breakdown for a transport mode"""
        rates = self.cost_rates[mode]
        costs = {'components': {}, 'total': 0}
        
        if mode == 'car':
            costs['components']['fuel'] = distance_km * rates['fuel']
            costs['components']['tolls'] = distance_km * rates['tolls']
            costs['components']['parking'] = rates['parking']
            costs['components']['wear_and_tear'] = distance_km * rates['wear_tear']
            
        elif mode == 'bus':
            costs['components']['fare'] = distance_km * rates['fare']
            # Estimate transfers based on distance
            transfers = max(0, int(distance_km / 10) - 1)  # 1 transfer per 10km
            costs['components']['transfer_fees'] = transfers * rates['transfer_fee']
            
        elif mode == 'train':
            costs['components']['fare'] = distance_km * rates['fare']
            costs['components']['booking_fee'] = rates['booking_fee']
            
        elif mode == 'rideshare':
            # Apply surge pricing based on time of day
            current_hour = datetime.utcnow().hour
            surge_multiplier = rates['surge_multiplier']
            if 7 <= current_hour <= 9 or 17 <= current_hour <= 19:  # Rush hours
                surge_multiplier = 1.5
            elif 22 <= current_hour or current_hour <= 6:  # Late night
                surge_multiplier = 1.3
            
            costs['components']['base_fare'] = rates['base_fare']
            costs['components']['distance_fare'] = distance_km * rates['per_km'] * surge_multiplier
            costs['components']['surge_multiplier'] = surge_multiplier
            
        elif mode == 'bike':
            if distance_km > 2:  # Assume rental for longer distances
                costs['components']['rental'] = distance_km * rates['rental']
            costs['components']['maintenance'] = distance_km * rates['maintenance']
            
        elif mode == 'walk':
            costs['components']['cost'] = rates['cost']
        
        # Calculate total
        costs['total'] = sum(costs['components'].values())
        
        # Add time-based costs (parking meters, etc.)
        if mode == 'car' and duration_hours > 2:
            costs['components']['extended_parking'] = (duration_hours - 2) * 2.0  # $2/hour after 2 hours
            costs['total'] += costs['components']['extended_parking']
        
        return costs
    
    def _get_mode_time_factor(self, mode: str) -> float:
        """Get relative time factor for transport mode (lower = faster)"""
        time_factors = {
            'car': 1.0,
            'train': 1.1,
            'rideshare': 1.0,
            'bus': 1.5,
            'bike': 3.0,
            'walk': 10.0
        }
        return time_factors.get(mode, 2.0)
    
    def _get_mock_cost_calculation(self, route: Dict[str, Any], transport_modes: List[str]) -> Dict[str, Any]:
        """Generate mock cost calculation when service fails"""
        mock_costs = {
            'car': 15.50,
            'bus': 3.25,
            'train': 8.75,
            'rideshare': 22.00,
            'bike': 2.50,
            'walk': 0.00
        }
        
        cost_breakdown = {}
        total_costs = {}
        
        for mode in transport_modes:
            if mode in mock_costs:
                total_costs[mode] = mock_costs[mode]
                cost_breakdown[mode] = {
                    'components': {'base_cost': mock_costs[mode]},
                    'total': mock_costs[mode]
                }
        
        return {
            'route_id': route.get('id', 'mock_route'),
            'cost_breakdown': cost_breakdown,
            'total_costs': total_costs,
            'cheapest_mode': min(total_costs.keys(), key=lambda k: total_costs[k]) if total_costs else None,
            'currency': 'USD',
            'status': 'mock_data'
        }