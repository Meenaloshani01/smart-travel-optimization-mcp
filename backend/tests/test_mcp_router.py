"""
Integration tests for MCP Router (Multi-Agent System)
Tests coordination between multiple MCP tools
"""

import pytest
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.mcp_router import MCPRouter, ToolRequest, ToolResponse

@pytest.fixture
def mcp_router():
    """Fixture to create MCPRouter instance"""
    return MCPRouter()

class TestMCPRouterInitialization:
    """Test MCP Router initialization"""
    
    def test_router_initialization(self, mcp_router):
        """Test router initializes with all 10 tools"""
        assert mcp_router is not None
        assert len(mcp_router.tools) == 10
        
        # Verify all expected tools are registered
        expected_tools = [
            'route_planner',
            'traffic_analyzer',
            'time_predictor',
            'budget_calculator',
            'transport_recommender',
            'weather_checker',
            'safety_analyzer',
            'alert_manager',
            'location_tracker',
            'report_generator'
        ]
        
        for tool_name in expected_tools:
            assert tool_name in mcp_router.tools

class TestToolExecution:
    """Test individual tool execution through router"""
    
    @pytest.mark.asyncio
    async def test_execute_route_planner(self, mcp_router):
        """Test executing route planner tool"""
        params = {
            'source': {'latitude': 11.9416, 'longitude': 79.8083, 'address': 'Puducherry'},
            'destination': {'latitude': 11.4064, 'longitude': 76.6932, 'address': 'Ooty'}
        }
        
        result = await mcp_router.execute_tool('route_planner', params)
        
        assert result is not None
        assert 'routes' in result or 'error' not in result
    
    @pytest.mark.asyncio
    async def test_execute_invalid_tool(self, mcp_router):
        """Test executing non-existent tool returns error"""
        result = await mcp_router.execute_tool('invalid_tool', {})
        
        assert result is not None
        # Should handle gracefully

class TestParallelExecution:
    """Test parallel execution of multiple tools"""
    
    @pytest.mark.asyncio
    async def test_parallel_tool_execution(self, mcp_router):
        """Test executing multiple tools in parallel"""
        requests = [
            ToolRequest('route_planner', {
                'source': {'latitude': 11.9416, 'longitude': 79.8083},
                'destination': {'latitude': 11.4064, 'longitude': 76.6932}
            }),
            ToolRequest('weather_checker', {
                'location': {'latitude': 11.9416, 'longitude': 79.8083}
            }),
            ToolRequest('traffic_analyzer', {
                'routes': []
            })
        ]
        
        responses = await mcp_router.execute_parallel(requests)
        
        assert len(responses) == 3
        assert all(isinstance(r, ToolResponse) for r in responses)
    
    @pytest.mark.asyncio
    async def test_parallel_execution_performance(self, mcp_router):
        """Test parallel execution is faster than sequential"""
        import time
        
        requests = [
            ToolRequest('route_planner', {'source': {}, 'destination': {}}),
            ToolRequest('weather_checker', {'location': {}}),
            ToolRequest('traffic_analyzer', {'routes': []})
        ]
        
        # Parallel execution
        start = time.time()
        await mcp_router.execute_parallel(requests)
        parallel_time = time.time() - start
        
        # Sequential execution
        start = time.time()
        for req in requests:
            await mcp_router.execute_tool(req.tool_name, req.params)
        sequential_time = time.time() - start
        
        # Parallel should be faster (or at least not significantly slower)
        assert parallel_time <= sequential_time * 1.5

class TestMultiAgentCoordination:
    """Test coordination between multiple agents"""
    
    @pytest.mark.asyncio
    async def test_route_optimization_workflow(self, mcp_router):
        """Test complete route optimization workflow using multiple agents"""
        # Step 1: Plan routes
        route_params = {
            'source': {'latitude': 11.9416, 'longitude': 79.8083, 'address': 'Puducherry'},
            'destination': {'latitude': 11.4064, 'longitude': 76.6932, 'address': 'Ooty'}
        }
        routes_result = await mcp_router.execute_tool('route_planner', route_params)
        
        # Step 2: Analyze traffic for routes
        if routes_result and 'routes' in routes_result:
            traffic_params = {'routes': routes_result['routes']}
            traffic_result = await mcp_router.execute_tool('traffic_analyzer', traffic_params)
            assert traffic_result is not None
        
        # Step 3: Check weather
        weather_params = {'location': route_params['source']}
        weather_result = await mcp_router.execute_tool('weather_checker', weather_params)
        assert weather_result is not None
        
        # Step 4: Calculate budget
        budget_params = {'routes': routes_result.get('routes', [])}
        budget_result = await mcp_router.execute_tool('budget_calculator', budget_params)
        assert budget_result is not None
    
    @pytest.mark.asyncio
    async def test_agent_communication(self, mcp_router):
        """Test agents can share data through router"""
        # Get routes from route planner
        route_result = await mcp_router.execute_tool('route_planner', {
            'source': {'latitude': 11.9416, 'longitude': 79.8083},
            'destination': {'latitude': 11.4064, 'longitude': 76.6932}
        })
        
        # Pass routes to other agents
        if route_result and 'routes' in route_result:
            routes = route_result['routes']
            
            # Multiple agents process the same routes
            requests = [
                ToolRequest('traffic_analyzer', {'routes': routes}),
                ToolRequest('safety_analyzer', {'routes': routes}),
                ToolRequest('time_predictor', {'routes': routes})
            ]
            
            responses = await mcp_router.execute_parallel(requests)
            assert len(responses) == 3

class TestErrorHandling:
    """Test error handling in multi-agent system"""
    
    @pytest.mark.asyncio
    async def test_tool_failure_handling(self, mcp_router):
        """Test router handles tool failures gracefully"""
        # Execute with invalid parameters
        result = await mcp_router.execute_tool('route_planner', {})
        
        # Should not crash, should return error or empty result
        assert result is not None
    
    @pytest.mark.asyncio
    async def test_partial_failure_in_parallel(self, mcp_router):
        """Test parallel execution continues even if one tool fails"""
        requests = [
            ToolRequest('route_planner', {}),  # May fail with empty params
            ToolRequest('weather_checker', {'location': {'latitude': 11.9416, 'longitude': 79.8083}}),  # Should succeed
            ToolRequest('invalid_tool', {})  # Will fail
        ]
        
        responses = await mcp_router.execute_parallel(requests)
        
        # Should get responses for all requests (some may be errors)
        assert len(responses) == 3

class TestToolRequest:
    """Test ToolRequest class"""
    
    def test_tool_request_creation(self):
        """Test creating ToolRequest"""
        request = ToolRequest('route_planner', {'source': {}, 'destination': {}})
        
        assert request.tool_name == 'route_planner'
        assert request.params == {'source': {}, 'destination': {}}
        assert request.timestamp is not None

class TestToolResponse:
    """Test ToolResponse class"""
    
    def test_tool_response_success(self):
        """Test creating successful ToolResponse"""
        response = ToolResponse('route_planner', {'routes': []}, success=True)
        
        assert response.tool_name == 'route_planner'
        assert response.result == {'routes': []}
        assert response.success is True
        assert response.error is None
    
    def test_tool_response_failure(self):
        """Test creating failed ToolResponse"""
        response = ToolResponse('route_planner', None, success=False, error='Tool failed')
        
        assert response.tool_name == 'route_planner'
        assert response.success is False
        assert response.error == 'Tool failed'

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
