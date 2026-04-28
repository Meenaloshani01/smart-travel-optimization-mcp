import asyncio
import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class LocationTrackerMCP:
    def __init__(self):
        self.name = "location_tracker"
        self.last_used = None
        self.error_count = 0
        self.user_locations = {}
        logger.info("Location Tracker MCP initialized")
    
    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        try:
            self.last_used = datetime.utcnow()
            
            user_id = params.get('user_id', 'anonymous')
            latitude = params.get('latitude')
            longitude = params.get('longitude')
            
            if latitude is not None and longitude is not None:
                self.user_locations[user_id] = {
                    'latitude': latitude,
                    'longitude': longitude,
                    'timestamp': datetime.utcnow().isoformat(),
                    'accuracy': params.get('accuracy', 10)  # meters
                }
                
                return {
                    'location_updated': True,
                    'user_id': user_id,
                    'coordinates': {
                        'latitude': latitude,
                        'longitude': longitude
                    },
                    'timestamp': datetime.utcnow().isoformat()
                }
            else:
                # Return last known location
                location = self.user_locations.get(user_id)
                return {
                    'location_updated': False,
                    'last_known_location': location,
                    'user_id': user_id
                }
                
        except Exception as e:
            self.error_count += 1
            logger.error(f"Location Tracker error: {str(e)}")
            return {'location_updated': False, 'status': 'fallback'}