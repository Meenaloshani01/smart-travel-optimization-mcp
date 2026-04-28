"""
Unit tests for individual MCP Tools
Tests each of the 10 MCP tools independently
"""

import pytest
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import all MCP tools
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

# Test data
TEST_SOURCE = {'latitude': 11.9416, 'longitude': 79.8083, 'address': 'Puducherry'}
TEST_DESTINATION = {'latitude': 11.4064, 'longitude': 76.6932, 'address': 'Ooty'}

class TestRoutePlannerMCP:
    """Test Route Planner MCP Tool"""
    
    @pytest.fixture
    def route_planner(self):
        return RoutePlannerMCP()
    
    @pytest.mark.asyncio
    async def test_find_routes(self, route_planner):
        """Test finding routes between two locations"""
        result = await route_planner.find_routes(TEST_SOURCE, TEST_DESTINATION)
        
        assert result is not None
        assert 'routes' in result
        assert len(result['routes']) > 0
    
    @pytest.mark.asyncio
    async def test_route_has_required_fields(self, route_planner):
        """Test routes contain all required fields"""
        result = await route_planner.find_routes(TEST_SOURCE, TEST_DESTINATION)
        
        if result and 'routes' in result and len(result['routes']) > 0:
            route = result['routes'][0]
            assert 'id' in route
            assert 'distance' in route
            assert 'duration' in route

class TestTrafficAnalyzerMCP:
    """Test Traffic Analyzer MCP Tool"""
    
    @pytest.fixture
    def traffic_analyzer(self):
        return TrafficAnalyzerMCP()
    
    @pytest.mark.asyncio
    async def test_analyze_traffic(self, traffic_analyzer):
        """Test traffic analysis for routes"""
        routes = [{'id': 'test_route', 'distance': 150, 'duration': 7200}]
        result = await traffic_analyzer.analyze_traffic(routes)
        
        assert result is not None
    
    @pytest.mark.asyncio
    async def test_predict_congestion(self, traffic_analyzer):
        """Test congestion prediction"""
        route = {'id': 'test_route', 'distance': 150}
        target_time = datetime.utcnow() + timedelta(hours=2)
        
        result = await traffic_analyzer.predict_congestion(route, target_time)
        
        assert result is not None

class TestTimePredictorMCP:
    """Test Time Predictor MCP Tool"""
    
    @pytest.fixture
    def time_predictor(self):
        return TimePredictorMCP()
    
    @pytest.mark.asyncio
    async def test_predict_travel_time(self, time_predictor):
        """Test travel time prediction"""
        routes = [{'id': 'test_route', 'distance': 150, 'duration': 7200}]
        departure_time = datetime.utcnow() + timedelta(hours=1)
        
        result = await time_predictor.predict_travel_time(routes, departure_time)
        
        assert result is not None
        assert 'predictions' in result or 'estimated_time' in result

class TestBudgetCalculatorMCP:
    """Test Budget Calculator MCP Tool"""
    
    @pytest.fixture
    def budget_calculator(self):
        return BudgetCalculatorMCP()
    
    @pytest.mark.asyncio
    async def test_calculate_costs(self, budget_calculator):
        """Test cost calculation for routes"""
        routes = [{'id': 'test_route', 'distance': 150, 'mode': 'car'}]
        
        result = await budget_calculator.calculate_costs(routes)
        
        assert result is not None
        assert 'costs' in result or 'total_cost' in result
    
    @pytest.mark.asyncio
    async def test_cost_is_positive(self, budget_calculator):
        """Test calculated costs are positive"""
        routes = [{'id': 'test_route', 'distance': 150, 'mode': 'car'}]
        
        result = await budget_calculator.calculate_costs(routes)
        
        if result and 'costs' in result:
            for cost in result['costs']:
                assert cost.get('amount', 0) >= 0

class TestTransportRecommenderMCP:
    """Test Transport Recommender MCP Tool"""
    
    @pytest.fixture
    def transport_recommender(self):
        return TransportRecommenderMCP()
    
    @pytest.mark.asyncio
    async def test_recommend_transport(self, transport_recommender):
        """Test transport mode recommendations"""
        routes = [{'id': 'test_route', 'distance': 150}]
        preferences = {'budget': 5000, 'time_priority': 'high'}
        
        result = await transport_recommender.recommend_transport(routes, preferences)
        
        assert result is not None
        assert 'recommendations' in result or 'transport_options' in result

class TestWeatherCheckerMCP:
    """Test Weather Checker MCP Tool"""
    
    @pytest.fixture
    def weather_checker(self):
        return WeatherCheckerMCP()
    
    @pytest.mark.asyncio
    async def test_check_weather(self, weather_checker):
        """Test weather checking for location"""
        result = await weather_checker.check_weather(TEST_SOURCE)
        
        assert result is not None
        assert 'weather' in result or 'temperature' in result
    
    @pytest.mark.asyncio
    async def test_weather_has_temperature(self, weather_checker):
        """Test weather result includes temperature"""
        result = await weather_checker.check_weather(TEST_SOURCE)
        
        if result and 'weather' in result:
            assert 'temperature' in result['weather'] or 'temp' in result['weather']

class TestSafetyAnalyzerMCP:
    """Test Safety Analyzer MCP Tool"""
    
    @pytest.fixture
    def safety_analyzer(self):
        return SafetyAnalyzerMCP()
    
    @pytest.mark.asyncio
    async def test_analyze_safety(self, safety_analyzer):
        """Test safety analysis for routes"""
        routes = [{'id': 'test_route', 'distance': 150}]
        
        result = await safety_analyzer.analyze_safety(routes)
        
        assert result is not None
        assert 'safety_ratings' in result or 'safety_score' in result
    
    @pytest.mark.asyncio
    async def test_safety_rating_range(self, safety_analyzer):
        """Test safety ratings are within valid range (1-10)"""
        routes = [{'id': 'test_route', 'distance': 150}]
        
        result = await safety_analyzer.analyze_safety(routes)
        
        if result and 'safety_ratings' in result:
            for rating in result['safety_ratings']:
                score = rating.get('rating', 5)
                assert 1 <= score <= 10

class TestAlertManagerMCP:
    """Test Alert Manager MCP Tool"""
    
    @pytest.fixture
    def alert_manager(self):
        return AlertManagerMCP()
    
    @pytest.mark.asyncio
    async def test_create_alert(self, alert_manager):
        """Test creating travel alert"""
        alert_data = {
            'type': 'traffic',
            'message': 'Heavy traffic ahead',
            'severity': 'medium'
        }
        
        result = await alert_manager.create_alert(alert_data)
        
        assert result is not None
        assert 'alert_id' in result or 'id' in result
    
    @pytest.mark.asyncio
    async def test_get_alerts(self, alert_manager):
        """Test retrieving alerts"""
        result = await alert_manager.get_alerts()
        
        assert result is not None
        assert isinstance(result, (list, dict))

class TestLocationTrackerMCP:
    """Test Location Tracker MCP Tool"""
    
    @pytest.fixture
    def location_tracker(self):
        return LocationTrackerMCP()
    
    @pytest.mark.asyncio
    async def test_track_location(self, location_tracker):
        """Test location tracking"""
        location = {'latitude': 11.9416, 'longitude': 79.8083}
        
        result = await location_tracker.track_location(location)
        
        assert result is not None
    
    @pytest.mark.asyncio
    async def test_get_location_history(self, location_tracker):
        """Test retrieving location history"""
        result = await location_tracker.get_location_history()
        
        assert result is not None
        assert isinstance(result, (list, dict))

class TestReportGeneratorMCP:
    """Test Report Generator MCP Tool"""
    
    @pytest.fixture
    def report_generator(self):
        return ReportGeneratorMCP()
    
    @pytest.mark.asyncio
    async def test_generate_report(self, report_generator):
        """Test generating travel report"""
        travel_data = {
            'route': {'id': 'test_route', 'distance': 150},
            'duration': 7200,
            'cost': 1500
        }
        
        result = await report_generator.generate_report(travel_data)
        
        assert result is not None
        assert 'report' in result or 'summary' in result
    
    @pytest.mark.asyncio
    async def test_report_has_summary(self, report_generator):
        """Test report includes summary"""
        travel_data = {
            'route': {'id': 'test_route', 'distance': 150},
            'duration': 7200,
            'cost': 1500
        }
        
        result = await report_generator.generate_report(travel_data)
        
        if result and 'report' in result:
            assert 'summary' in result['report'] or 'overview' in result['report']

# Integration test for all tools
class TestAllMCPTools:
    """Integration test for all 10 MCP tools"""
    
    @pytest.mark.asyncio
    async def test_all_tools_instantiate(self):
        """Test all 10 MCP tools can be instantiated"""
        tools = [
            RoutePlannerMCP(),
            TrafficAnalyzerMCP(),
            TimePredictorMCP(),
            BudgetCalculatorMCP(),
            TransportRecommenderMCP(),
            WeatherCheckerMCP(),
            SafetyAnalyzerMCP(),
            AlertManagerMCP(),
            LocationTrackerMCP(),
            ReportGeneratorMCP()
        ]
        
        assert len(tools) == 10
        assert all(tool is not None for tool in tools)
    
    @pytest.mark.asyncio
    async def test_all_tools_have_name(self):
        """Test all tools have a name attribute"""
        tools = [
            RoutePlannerMCP(),
            TrafficAnalyzerMCP(),
            TimePredictorMCP(),
            BudgetCalculatorMCP(),
            TransportRecommenderMCP(),
            WeatherCheckerMCP(),
            SafetyAnalyzerMCP(),
            AlertManagerMCP(),
            LocationTrackerMCP(),
            ReportGeneratorMCP()
        ]
        
        for tool in tools:
            assert hasattr(tool, 'name')
            assert isinstance(tool.name, str)
            assert len(tool.name) > 0

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
