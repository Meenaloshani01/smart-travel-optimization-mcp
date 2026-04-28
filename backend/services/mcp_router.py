import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

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

logger = logging.getLogger(__name__)

class ToolRequest:
    def __init__(self, tool_name: str, params: Dict[str, Any]):
        self.tool_name = tool_name
        self.params = params
        self.timestamp = datetime.utcnow()

class ToolResponse:
    def __init__(self, tool_name: str, result: Any, success: bool = True, error: Optional[str] = None):
        self.tool_name = tool_name
        self.result = result
        self.success = success
        self.error = error
        self.timestamp = datetime.utcnow()

class MCPRouter:
    """Central router for MCP tool communication"""
    
    def __init__(self):
        self.tools = {
            'route_planner': RoutePlannerMCP(),
            'traffic_analyzer': TrafficAnalyzerMCP(),
            'time_predictor': TimePredictorMCP(),
            'budget_calculator': BudgetCalculatorMCP(),
            'transport_recommender': TransportRecommenderMCP(),
            'weather_checker': WeatherCheckerMCP(),
            'safety_analyzer': SafetyAnalyzerMCP(),
            'alert_manager': AlertManagerMCP(),
            'location_tracker': LocationTrackerMCP(),
            'report_generator': ReportGeneratorMCP()
        }
        
        # Cache for tool responses
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes
        
        logger.info(f"MCP Router initialized with {len(self.tools)} tools")
    
    async def execute_tool(self, tool_name: str, params: Dict[str, Any]) -> Any:
        """Execute MCP tool with error handling and caching"""
        try:
            # Check cache first
            cache_key = self._generate_cache_key(tool_name, params)
            cached_result = self._get_cached_result(cache_key)
            if cached_result:
                logger.info(f"Returning cached result for {tool_name}")
                return cached_result
            
            # Validate tool exists
            if tool_name not in self.tools:
                raise ValueError(f"Unknown tool: {tool_name}")
            
            tool = self.tools[tool_name]
            logger.info(f"Executing tool: {tool_name} with params: {params}")
            
            # Execute tool
            result = await tool.execute(params)
            
            # Cache result
            self._cache_result(cache_key, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {str(e)}")
            # Return fallback result based on tool type
            return self._get_fallback_result(tool_name, params)
    
    async def execute_parallel(self, tool_requests: List[ToolRequest]) -> List[ToolResponse]:
        """Execute multiple MCP tools in parallel for performance"""
        try:
            tasks = []
            for request in tool_requests:
                task = asyncio.create_task(
                    self._execute_tool_with_response(request.tool_name, request.params)
                )
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process responses
            tool_responses = []
            for i, response in enumerate(responses):
                if isinstance(response, Exception):
                    tool_responses.append(ToolResponse(
                        tool_requests[i].tool_name,
                        None,
                        success=False,
                        error=str(response)
                    ))
                else:
                    tool_responses.append(response)
            
            return tool_responses
            
        except Exception as e:
            logger.error(f"Error executing parallel tools: {str(e)}")
            return []
    
    async def _execute_tool_with_response(self, tool_name: str, params: Dict[str, Any]) -> ToolResponse:
        """Execute tool and return structured response"""
        try:
            result = await self.execute_tool(tool_name, params)
            return ToolResponse(tool_name, result, success=True)
        except Exception as e:
            return ToolResponse(tool_name, None, success=False, error=str(e))
    
    def _generate_cache_key(self, tool_name: str, params: Dict[str, Any]) -> str:
        """Generate cache key for tool request"""
        params_str = json.dumps(params, sort_keys=True)
        return f"{tool_name}:{hash(params_str)}"
    
    def _get_cached_result(self, cache_key: str) -> Optional[Any]:
        """Get cached result if still valid"""
        if cache_key in self.cache:
            cached_data = self.cache[cache_key]
            if (datetime.utcnow() - cached_data['timestamp']).seconds < self.cache_ttl:
                return cached_data['result']
            else:
                # Remove expired cache
                del self.cache[cache_key]
        return None
    
    def _cache_result(self, cache_key: str, result: Any):
        """Cache tool result"""
        self.cache[cache_key] = {
            'result': result,
            'timestamp': datetime.utcnow()
        }
    
    def _get_fallback_result(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Get fallback result when tool fails"""
        fallback_results = {
            'route_planner': {
                'routes': [],
                'status': 'fallback',
                'message': 'Using cached route data'
            },
            'traffic_analyzer': {
                'traffic_conditions': 'unknown',
                'congestion_level': 0.5,
                'status': 'fallback'
            },
            'time_predictor': {
                'estimated_time': 1800,  # 30 minutes default
                'confidence': 0.3,
                'status': 'fallback'
            },
            'budget_calculator': {
                'total_cost': 0,
                'breakdown': {},
                'status': 'fallback'
            },
            'transport_recommender': {
                'recommendations': [],
                'status': 'fallback'
            },
            'weather_checker': {
                'conditions': 'unknown',
                'temperature': 20,
                'status': 'fallback'
            },
            'safety_analyzer': {
                'safety_score': 5.0,
                'risk_factors': [],
                'status': 'fallback'
            },
            'alert_manager': {
                'alerts': [],
                'status': 'fallback'
            },
            'location_tracker': {
                'location_updated': False,
                'status': 'fallback'
            },
            'report_generator': {
                'report': {},
                'status': 'fallback'
            }
        }
        
        return fallback_results.get(tool_name, {'status': 'fallback', 'error': 'Unknown tool'})
    
    def get_tool_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all MCP tools"""
        status = {}
        for tool_name, tool in self.tools.items():
            try:
                status[tool_name] = {
                    'available': True,
                    'last_used': getattr(tool, 'last_used', None),
                    'error_count': getattr(tool, 'error_count', 0)
                }
            except Exception as e:
                status[tool_name] = {
                    'available': False,
                    'error': str(e)
                }
        
        return status
    
    def clear_cache(self):
        """Clear all cached results"""
        self.cache.clear()
        logger.info("MCP Router cache cleared")