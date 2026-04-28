"""
Unit tests for Guardrails Service
Tests validation, safety constraints, and security features
"""

import pytest
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.guardrails import GuardrailsService, ValidationError

@pytest.fixture
def guardrails():
    """Fixture to create GuardrailsService instance"""
    return GuardrailsService()

class TestLocationValidation:
    """Test location validation"""
    
    def test_valid_location(self, guardrails):
        """Test validation of valid location"""
        location = {
            'latitude': 11.9416,
            'longitude': 79.8083,
            'address': 'Puducherry'
        }
        is_valid, error = guardrails.validate_location(location)
        assert is_valid is True
        assert error is None
    
    def test_invalid_latitude(self, guardrails):
        """Test validation fails for invalid latitude"""
        location = {
            'latitude': 95.0,  # Invalid: > 90
            'longitude': 79.8083,
            'address': 'Invalid'
        }
        is_valid, error = guardrails.validate_location(location)
        assert is_valid is False
        assert 'latitude' in error.lower()
    
    def test_invalid_longitude(self, guardrails):
        """Test validation fails for invalid longitude"""
        location = {
            'latitude': 11.9416,
            'longitude': 185.0,  # Invalid: > 180
            'address': 'Invalid'
        }
        is_valid, error = guardrails.validate_location(location)
        assert is_valid is False
        assert 'longitude' in error.lower()
    
    def test_missing_latitude(self, guardrails):
        """Test validation fails when latitude is missing"""
        location = {
            'longitude': 79.8083,
            'address': 'Puducherry'
        }
        is_valid, error = guardrails.validate_location(location)
        assert is_valid is False
        assert 'latitude' in error.lower()
    
    def test_sql_injection_in_address(self, guardrails):
        """Test SQL injection detection in address"""
        location = {
            'latitude': 11.9416,
            'longitude': 79.8083,
            'address': "'; DROP TABLE users; --"
        }
        is_valid, error = guardrails.validate_location(location)
        assert is_valid is False
        assert 'invalid' in error.lower()

class TestBudgetValidation:
    """Test budget validation"""
    
    def test_valid_budget(self, guardrails):
        """Test validation of valid budget"""
        is_valid, error = guardrails.validate_budget(5000.0)
        assert is_valid is True
        assert error is None
    
    def test_none_budget(self, guardrails):
        """Test that None budget is allowed (optional)"""
        is_valid, error = guardrails.validate_budget(None)
        assert is_valid is True
        assert error is None
    
    def test_negative_budget(self, guardrails):
        """Test validation fails for negative budget"""
        is_valid, error = guardrails.validate_budget(-100.0)
        assert is_valid is False
        assert 'budget' in error.lower()
    
    def test_excessive_budget(self, guardrails):
        """Test validation fails for budget exceeding maximum"""
        is_valid, error = guardrails.validate_budget(2000000.0)
        assert is_valid is False
        assert 'exceed' in error.lower()
    
    def test_zero_budget(self, guardrails):
        """Test that zero budget is valid"""
        is_valid, error = guardrails.validate_budget(0.0)
        assert is_valid is True
        assert error is None

class TestTimeValidation:
    """Test time constraint validation"""
    
    def test_valid_future_departure(self, guardrails):
        """Test validation of future departure time"""
        future_time = (datetime.utcnow() + timedelta(hours=2)).isoformat()
        is_valid, error = guardrails.validate_time_constraints(future_time, None)
        assert is_valid is True
        assert error is None
    
    def test_past_departure_time(self, guardrails):
        """Test validation fails for past departure time"""
        past_time = (datetime.utcnow() - timedelta(hours=1)).isoformat()
        is_valid, error = guardrails.validate_time_constraints(past_time, None)
        assert is_valid is False
        assert 'past' in error.lower()
    
    def test_arrival_before_departure(self, guardrails):
        """Test validation fails when arrival is before departure"""
        departure = (datetime.utcnow() + timedelta(hours=2)).isoformat()
        arrival = (datetime.utcnow() + timedelta(hours=1)).isoformat()
        is_valid, error = guardrails.validate_time_constraints(departure, arrival)
        assert is_valid is False
        assert 'after' in error.lower()
    
    def test_excessive_travel_time(self, guardrails):
        """Test validation fails for travel time > 48 hours"""
        departure = (datetime.utcnow() + timedelta(hours=1)).isoformat()
        arrival = (datetime.utcnow() + timedelta(hours=50)).isoformat()
        is_valid, error = guardrails.validate_time_constraints(departure, arrival)
        assert is_valid is False
        assert '48' in error

class TestTravelRequestValidation:
    """Test complete travel request validation"""
    
    def test_valid_travel_request(self, guardrails):
        """Test validation of complete valid request"""
        request = {
            'source': {
                'latitude': 11.9416,
                'longitude': 79.8083,
                'address': 'Puducherry'
            },
            'destination': {
                'latitude': 11.4064,
                'longitude': 76.6932,
                'address': 'Ooty'
            },
            'budget': 5000.0,
            'departure_time': (datetime.utcnow() + timedelta(hours=2)).isoformat()
        }
        is_valid, error = guardrails.validate_travel_request(request)
        assert is_valid is True
        assert error is None
    
    def test_missing_source(self, guardrails):
        """Test validation fails when source is missing"""
        request = {
            'destination': {
                'latitude': 11.4064,
                'longitude': 76.6932,
                'address': 'Ooty'
            }
        }
        is_valid, error = guardrails.validate_travel_request(request)
        assert is_valid is False
        assert 'source' in error.lower()
    
    def test_same_source_destination(self, guardrails):
        """Test validation fails when source equals destination"""
        request = {
            'source': {
                'latitude': 11.9416,
                'longitude': 79.8083,
                'address': 'Puducherry'
            },
            'destination': {
                'latitude': 11.9416,
                'longitude': 79.8083,
                'address': 'Puducherry'
            }
        }
        is_valid, error = guardrails.validate_travel_request(request)
        assert is_valid is False
        assert 'same' in error.lower()

class TestSafetyConstraints:
    """Test safety constraint enforcement"""
    
    def test_budget_constraint_enforcement(self, guardrails):
        """Test filtering options by budget"""
        options = [
            {'id': '1', 'cost': 1000},
            {'id': '2', 'cost': 3000},
            {'id': '3', 'cost': 5000},
        ]
        filtered = guardrails.enforce_budget_constraint(options, 2500)
        assert len(filtered) == 1
        assert filtered[0]['id'] == '1'
    
    def test_safety_rating_enforcement(self, guardrails):
        """Test filtering routes by safety rating"""
        routes = [
            {'id': '1', 'safety_rating': 8.5},
            {'id': '2', 'safety_rating': 4.0},
            {'id': '3', 'safety_rating': 7.0},
        ]
        filtered = guardrails.enforce_safety_constraint(routes, min_safety_rating=6.0)
        assert len(filtered) == 2
        assert all(r['safety_rating'] >= 6.0 for r in filtered)
    
    def test_safety_rating_validation(self, guardrails):
        """Test safety rating value validation"""
        is_valid, error = guardrails.validate_safety_rating(8.5)
        assert is_valid is True
        
        is_valid, error = guardrails.validate_safety_rating(11.0)
        assert is_valid is False
        
        is_valid, error = guardrails.validate_safety_rating(-1.0)
        assert is_valid is False

class TestSecurity:
    """Test security features"""
    
    def test_sql_injection_detection(self, guardrails):
        """Test SQL injection pattern detection"""
        assert guardrails._contains_sql_injection("'; DROP TABLE users; --") is True
        assert guardrails._contains_sql_injection("SELECT * FROM users") is True
        assert guardrails._contains_sql_injection("Normal address") is False
    
    def test_input_sanitization(self, guardrails):
        """Test input sanitization"""
        dangerous = "<script>alert('xss')</script>"
        sanitized = guardrails.sanitize_input(dangerous)
        assert '<' not in sanitized
        assert '>' not in sanitized
        assert 'script' in sanitized  # Text remains, tags removed
    
    def test_input_length_limit(self, guardrails):
        """Test input length limiting"""
        long_input = "A" * 1000
        sanitized = guardrails.sanitize_input(long_input)
        assert len(sanitized) <= 500

class TestRateLimiting:
    """Test rate limiting functionality"""
    
    def test_rate_limit_allows_within_limit(self, guardrails):
        """Test requests within limit are allowed"""
        user_id = "test_user_1"
        for i in range(5):
            is_allowed, error = guardrails.check_rate_limit(user_id, max_requests=10, window_seconds=60)
            assert is_allowed is True
            assert error is None
    
    def test_rate_limit_blocks_excess(self, guardrails):
        """Test requests exceeding limit are blocked"""
        user_id = "test_user_2"
        max_requests = 3
        
        # Make requests up to limit
        for i in range(max_requests):
            is_allowed, error = guardrails.check_rate_limit(user_id, max_requests=max_requests, window_seconds=60)
            assert is_allowed is True
        
        # Next request should be blocked
        is_allowed, error = guardrails.check_rate_limit(user_id, max_requests=max_requests, window_seconds=60)
        assert is_allowed is False
        assert 'rate limit' in error.lower()

class TestDataIntegrity:
    """Test data integrity validation"""
    
    def test_valid_route_data(self, guardrails):
        """Test validation of valid route data"""
        route = {
            'id': 'route_1',
            'distance': 150.5,
            'duration': 7200,
            'cost': 1500.0,
            'safety_rating': 8.5
        }
        is_valid, error = guardrails.validate_route_data(route)
        assert is_valid is True
        assert error is None
    
    def test_missing_required_field(self, guardrails):
        """Test validation fails for missing required fields"""
        route = {
            'id': 'route_1',
            'distance': 150.5,
            # Missing duration and cost
        }
        is_valid, error = guardrails.validate_route_data(route)
        assert is_valid is False
        assert 'missing' in error.lower()
    
    def test_negative_distance(self, guardrails):
        """Test validation fails for negative distance"""
        route = {
            'id': 'route_1',
            'distance': -10.0,
            'duration': 7200,
            'cost': 1500.0
        }
        is_valid, error = guardrails.validate_route_data(route)
        assert is_valid is False
        assert 'distance' in error.lower()
    
    def test_excessive_distance(self, guardrails):
        """Test validation fails for excessive distance"""
        route = {
            'id': 'route_1',
            'distance': 10000.0,  # > max_distance_km
            'duration': 7200,
            'cost': 1500.0
        }
        is_valid, error = guardrails.validate_route_data(route)
        assert is_valid is False
        assert 'exceed' in error.lower()

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
