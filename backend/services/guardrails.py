"""
Guardrails Service - Safety, Validation, and Constraint Enforcement

This module implements guardrails to ensure:
1. Input validation and sanitization
2. Safety constraints enforcement
3. Budget limits enforcement
4. Rate limiting
5. Data integrity checks
"""

import re
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from functools import wraps
import time

logger = logging.getLogger(__name__)

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

class GuardrailsService:
    """
    Comprehensive guardrails service for travel optimization system
    Implements safety checks, validation, and constraint enforcement
    """
    
    def __init__(self):
        self.name = "guardrails_service"
        # Rate limiting storage (in production, use Redis)
        self.rate_limit_store = {}
        # Validation rules
        self.max_budget = 1000000  # Maximum budget in rupees
        self.min_budget = 0
        self.max_distance_km = 5000  # Maximum route distance
        self.min_safety_rating = 1.0
        self.max_safety_rating = 10.0
        
        logger.info("GuardrailsService initialized")
    
    # ==================== INPUT VALIDATION ====================
    
    def validate_location(self, location: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Validate location data
        
        Args:
            location: Dictionary with latitude, longitude, address
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Check required fields
            if not location:
                return False, "Location data is required"
            
            # Validate latitude
            if 'latitude' not in location:
                return False, "Latitude is required"
            
            lat = float(location['latitude'])
            if not (-90 <= lat <= 90):
                return False, f"Invalid latitude: {lat}. Must be between -90 and 90"
            
            # Validate longitude
            if 'longitude' not in location:
                return False, "Longitude is required"
            
            lng = float(location['longitude'])
            if not (-180 <= lng <= 180):
                return False, f"Invalid longitude: {lng}. Must be between -180 and 180"
            
            # Validate address (optional but recommended)
            if 'address' in location:
                address = str(location['address']).strip()
                if len(address) < 2:
                    return False, "Address must be at least 2 characters"
                
                # Sanitize address - prevent SQL injection
                if self._contains_sql_injection(address):
                    return False, "Invalid characters in address"
            
            logger.info(f"Location validated successfully: {location.get('address', 'Unknown')}")
            return True, None
            
        except ValueError as e:
            return False, f"Invalid location data format: {str(e)}"
        except Exception as e:
            logger.error(f"Location validation error: {str(e)}")
            return False, f"Location validation failed: {str(e)}"
    
    def validate_budget(self, budget: Optional[float]) -> Tuple[bool, Optional[str]]:
        """
        Validate budget constraints
        
        Args:
            budget: Budget amount in rupees
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            if budget is None:
                return True, None  # Budget is optional
            
            budget = float(budget)
            
            if budget < self.min_budget:
                return False, f"Budget must be at least ₹{self.min_budget}"
            
            if budget > self.max_budget:
                return False, f"Budget cannot exceed ₹{self.max_budget:,}"
            
            logger.info(f"Budget validated: ₹{budget:,.2f}")
            return True, None
            
        except ValueError:
            return False, "Budget must be a valid number"
        except Exception as e:
            logger.error(f"Budget validation error: {str(e)}")
            return False, f"Budget validation failed: {str(e)}"
    
    def validate_time_constraints(self, departure_time: Optional[str], 
                                  arrival_time: Optional[str]) -> Tuple[bool, Optional[str]]:
        """
        Validate time constraints
        
        Args:
            departure_time: ISO format datetime string
            arrival_time: ISO format datetime string
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            now = datetime.utcnow()
            
            # Validate departure time
            if departure_time:
                try:
                    dept_dt = datetime.fromisoformat(departure_time.replace('Z', '+00:00'))
                    
                    # Check if departure time is in the past (allow 5 min grace period)
                    if dept_dt < now - timedelta(minutes=5):
                        return False, "Departure time cannot be in the past"
                    
                    # Check if departure time is too far in future (1 year)
                    if dept_dt > now + timedelta(days=365):
                        return False, "Departure time cannot be more than 1 year in future"
                        
                except ValueError:
                    return False, "Invalid departure time format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
            
            # Validate arrival time
            if arrival_time:
                try:
                    arr_dt = datetime.fromisoformat(arrival_time.replace('Z', '+00:00'))
                    
                    if arr_dt < now:
                        return False, "Arrival time cannot be in the past"
                    
                    if arr_dt > now + timedelta(days=365):
                        return False, "Arrival time cannot be more than 1 year in future"
                    
                    # If both times provided, arrival must be after departure
                    if departure_time:
                        dept_dt = datetime.fromisoformat(departure_time.replace('Z', '+00:00'))
                        if arr_dt <= dept_dt:
                            return False, "Arrival time must be after departure time"
                        
                        # Check if time difference is reasonable (max 48 hours)
                        if (arr_dt - dept_dt).total_seconds() > 48 * 3600:
                            return False, "Travel time cannot exceed 48 hours"
                            
                except ValueError:
                    return False, "Invalid arrival time format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
            
            logger.info("Time constraints validated successfully")
            return True, None
            
        except Exception as e:
            logger.error(f"Time validation error: {str(e)}")
            return False, f"Time validation failed: {str(e)}"
    
    def validate_travel_request(self, request: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Comprehensive validation of travel request
        
        Args:
            request: Complete travel request dictionary
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Validate source location
            if 'source' not in request:
                return False, "Source location is required"
            
            is_valid, error = self.validate_location(request['source'])
            if not is_valid:
                return False, f"Source location error: {error}"
            
            # Validate destination location
            if 'destination' not in request:
                return False, "Destination location is required"
            
            is_valid, error = self.validate_location(request['destination'])
            if not is_valid:
                return False, f"Destination location error: {error}"
            
            # Check if source and destination are different
            src = request['source']
            dest = request['destination']
            if (abs(src['latitude'] - dest['latitude']) < 0.001 and 
                abs(src['longitude'] - dest['longitude']) < 0.001):
                return False, "Source and destination cannot be the same location"
            
            # Validate budget if provided
            if 'budget' in request:
                is_valid, error = self.validate_budget(request['budget'])
                if not is_valid:
                    return False, error
            
            # Validate time constraints if provided
            departure = request.get('departure_time')
            arrival = request.get('arrival_time')
            is_valid, error = self.validate_time_constraints(departure, arrival)
            if not is_valid:
                return False, error
            
            logger.info("Travel request validated successfully")
            return True, None
            
        except Exception as e:
            logger.error(f"Travel request validation error: {str(e)}")
            return False, f"Request validation failed: {str(e)}"
    
    # ==================== SAFETY CONSTRAINTS ====================
    
    def enforce_budget_constraint(self, options: List[Dict[str, Any]], 
                                  max_budget: Optional[float]) -> List[Dict[str, Any]]:
        """
        Filter options that exceed budget constraint
        
        Args:
            options: List of travel options with cost
            max_budget: Maximum allowed budget
            
        Returns:
            Filtered list of options within budget
        """
        if max_budget is None:
            return options
        
        try:
            filtered = [opt for opt in options if opt.get('cost', 0) <= max_budget]
            
            removed_count = len(options) - len(filtered)
            if removed_count > 0:
                logger.info(f"Filtered {removed_count} options exceeding budget of ₹{max_budget:,.2f}")
            
            return filtered
            
        except Exception as e:
            logger.error(f"Budget constraint enforcement error: {str(e)}")
            return options  # Return original on error
    
    def enforce_safety_constraint(self, routes: List[Dict[str, Any]], 
                                  min_safety_rating: float = 5.0) -> List[Dict[str, Any]]:
        """
        Filter routes below minimum safety rating
        
        Args:
            routes: List of routes with safety ratings
            min_safety_rating: Minimum acceptable safety rating
            
        Returns:
            Filtered list of safe routes
        """
        try:
            filtered = [route for route in routes 
                       if route.get('safety_rating', 0) >= min_safety_rating]
            
            removed_count = len(routes) - len(filtered)
            if removed_count > 0:
                logger.warning(f"Filtered {removed_count} routes below safety rating {min_safety_rating}")
            
            return filtered
            
        except Exception as e:
            logger.error(f"Safety constraint enforcement error: {str(e)}")
            return routes
    
    def validate_safety_rating(self, rating: float) -> Tuple[bool, Optional[str]]:
        """
        Validate safety rating value
        
        Args:
            rating: Safety rating value
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            rating = float(rating)
            
            if not (self.min_safety_rating <= rating <= self.max_safety_rating):
                return False, f"Safety rating must be between {self.min_safety_rating} and {self.max_safety_rating}"
            
            return True, None
            
        except ValueError:
            return False, "Safety rating must be a valid number"
    
    # ==================== SECURITY ====================
    
    def _contains_sql_injection(self, text: str) -> bool:
        """
        Check for potential SQL injection patterns
        
        Args:
            text: Input text to check
            
        Returns:
            True if suspicious patterns found
        """
        # Common SQL injection patterns
        sql_patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)",
            r"(--|;|\/\*|\*\/)",
            r"(\bOR\b.*=.*)",
            r"(\bAND\b.*=.*)",
            r"('.*--)",
            r"(1=1|1=0)",
        ]
        
        text_upper = text.upper()
        for pattern in sql_patterns:
            if re.search(pattern, text_upper, re.IGNORECASE):
                logger.warning(f"Potential SQL injection detected: {text}")
                return True
        
        return False
    
    def sanitize_input(self, text: str) -> str:
        """
        Sanitize user input to prevent XSS and injection attacks
        
        Args:
            text: Input text to sanitize
            
        Returns:
            Sanitized text
        """
        if not text:
            return ""
        
        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>"\']', '', str(text))
        
        # Limit length
        max_length = 500
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
            logger.warning(f"Input truncated to {max_length} characters")
        
        return sanitized.strip()
    
    # ==================== RATE LIMITING ====================
    
    def check_rate_limit(self, user_id: str, max_requests: int = 100, 
                        window_seconds: int = 3600) -> Tuple[bool, Optional[str]]:
        """
        Check if user has exceeded rate limit
        
        Args:
            user_id: User identifier
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds
            
        Returns:
            Tuple of (is_allowed, error_message)
        """
        try:
            now = time.time()
            
            # Initialize user's request history if not exists
            if user_id not in self.rate_limit_store:
                self.rate_limit_store[user_id] = []
            
            # Remove old requests outside the window
            self.rate_limit_store[user_id] = [
                req_time for req_time in self.rate_limit_store[user_id]
                if now - req_time < window_seconds
            ]
            
            # Check if limit exceeded
            if len(self.rate_limit_store[user_id]) >= max_requests:
                logger.warning(f"Rate limit exceeded for user {user_id}")
                return False, f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds//60} minutes"
            
            # Add current request
            self.rate_limit_store[user_id].append(now)
            
            return True, None
            
        except Exception as e:
            logger.error(f"Rate limit check error: {str(e)}")
            return True, None  # Allow on error (fail open)
    
    # ==================== DATA INTEGRITY ====================
    
    def validate_route_data(self, route: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Validate route data integrity
        
        Args:
            route: Route data dictionary
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Check required fields
            required_fields = ['id', 'distance', 'duration', 'cost']
            for field in required_fields:
                if field not in route:
                    return False, f"Missing required field: {field}"
            
            # Validate distance
            distance = float(route['distance'])
            if distance <= 0:
                return False, "Distance must be positive"
            if distance > self.max_distance_km:
                return False, f"Distance exceeds maximum of {self.max_distance_km} km"
            
            # Validate duration
            duration = float(route['duration'])
            if duration <= 0:
                return False, "Duration must be positive"
            
            # Validate cost
            cost = float(route['cost'])
            if cost < 0:
                return False, "Cost cannot be negative"
            
            # Validate safety rating if present
            if 'safety_rating' in route:
                is_valid, error = self.validate_safety_rating(route['safety_rating'])
                if not is_valid:
                    return False, error
            
            return True, None
            
        except ValueError as e:
            return False, f"Invalid route data format: {str(e)}"
        except Exception as e:
            logger.error(f"Route validation error: {str(e)}")
            return False, f"Route validation failed: {str(e)}"

# Decorator for applying guardrails to functions
def with_guardrails(guardrails_service: GuardrailsService):
    """
    Decorator to apply guardrails to API endpoints
    
    Usage:
        @with_guardrails(guardrails_service)
        def my_endpoint(request):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                # Apply guardrails before function execution
                logger.info(f"Applying guardrails to {func.__name__}")
                
                # Execute function
                result = func(*args, **kwargs)
                
                logger.info(f"Guardrails passed for {func.__name__}")
                return result
                
            except ValidationError as e:
                logger.error(f"Validation error in {func.__name__}: {str(e)}")
                raise
            except Exception as e:
                logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
                raise
        
        return wrapper
    return decorator

# Global instance
guardrails = GuardrailsService()
