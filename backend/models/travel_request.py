from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

@dataclass
class Location:
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    address: Optional[str] = None
    place_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Location':
        return cls(**data)

@dataclass
class TimeConstraints:
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    flexibility_minutes: int = 15
    
    def to_dict(self) -> Dict[str, Any]:
        result = asdict(self)
        if self.departure_time:
            result['departure_time'] = self.departure_time.isoformat()
        if self.arrival_time:
            result['arrival_time'] = self.arrival_time.isoformat()
        return result
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TimeConstraints':
        if 'departure_time' in data and data['departure_time']:
            # Handle 'Z' timezone indicator
            departure_str = data['departure_time']
            if departure_str.endswith('Z'):
                departure_str = departure_str[:-1] + '+00:00'
            data['departure_time'] = datetime.fromisoformat(departure_str)
        if 'arrival_time' in data and data['arrival_time']:
            # Handle 'Z' timezone indicator
            arrival_str = data['arrival_time']
            if arrival_str.endswith('Z'):
                arrival_str = arrival_str[:-1] + '+00:00'
            data['arrival_time'] = datetime.fromisoformat(arrival_str)
        return cls(**data)

@dataclass
class BudgetConstraints:
    max_cost: Optional[float] = None
    preferred_cost: Optional[float] = None
    currency: str = "INR"
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'BudgetConstraints':
        return cls(**data)

@dataclass
class TravelPreferences:
    transport_modes: list = None
    avoid_highways: bool = False
    avoid_tolls: bool = False
    prefer_scenic: bool = False
    accessibility_required: bool = False
    
    def __post_init__(self):
        if self.transport_modes is None:
            self.transport_modes = ['car', 'public_transit', 'walking']
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TravelPreferences':
        return cls(**data)

@dataclass
class TravelRequest:
    id: str
    user_id: str
    source: Location
    destination: Location
    time_constraints: TimeConstraints
    budget_constraints: BudgetConstraints
    preferences: TravelPreferences
    created_at: datetime
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API serialization"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'source': self.source.to_dict(),
            'destination': self.destination.to_dict(),
            'time_constraints': self.time_constraints.to_dict(),
            'budget_constraints': self.budget_constraints.to_dict(),
            'preferences': self.preferences.to_dict(),
            'created_at': self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TravelRequest':
        """Create from dictionary for API deserialization"""
        # Parse nested objects
        source = Location.from_dict(data['source'])
        destination = Location.from_dict(data['destination'])
        
        time_constraints = TimeConstraints()
        if 'time_constraints' in data:
            time_constraints = TimeConstraints.from_dict(data['time_constraints'])
        
        budget_constraints = BudgetConstraints()
        if 'budget_constraints' in data:
            budget_constraints = BudgetConstraints.from_dict(data['budget_constraints'])
        
        preferences = TravelPreferences()
        if 'preferences' in data:
            preferences = TravelPreferences.from_dict(data['preferences'])
        
        created_at = datetime.utcnow()
        if 'created_at' in data:
            created_str = data['created_at']
            if created_str.endswith('Z'):
                created_str = created_str[:-1] + '+00:00'
            created_at = datetime.fromisoformat(created_str)
        
        return cls(
            id=data.get('id', str(uuid.uuid4())),
            user_id=data.get('user_id', 'anonymous'),
            source=source,
            destination=destination,
            time_constraints=time_constraints,
            budget_constraints=budget_constraints,
            preferences=preferences,
            created_at=created_at
        )
    
    def validate(self) -> bool:
        """Validate travel request data"""
        # Check required fields
        if not self.source or not self.destination:
            return False
        
        # Validate coordinates
        if (not -90 <= self.source.latitude <= 90 or 
            not -180 <= self.source.longitude <= 180):
            return False
        
        if (not -90 <= self.destination.latitude <= 90 or 
            not -180 <= self.destination.longitude <= 180):
            return False
        
        # Validate time constraints
        if (self.time_constraints.departure_time and 
            self.time_constraints.arrival_time and
            self.time_constraints.departure_time >= self.time_constraints.arrival_time):
            return False
        
        # Validate budget constraints
        if (self.budget_constraints.max_cost is not None and 
            self.budget_constraints.max_cost < 0):
            return False
        
        return True
    
    def equals(self, other: 'TravelRequest') -> bool:
        """Check if two travel requests are equivalent"""
        if not isinstance(other, TravelRequest):
            return False
        
        return (
            self.source.latitude == other.source.latitude and
            self.source.longitude == other.source.longitude and
            self.destination.latitude == other.destination.latitude and
            self.destination.longitude == other.destination.longitude and
            self.time_constraints.departure_time == other.time_constraints.departure_time and
            self.budget_constraints.max_cost == other.budget_constraints.max_cost
        )