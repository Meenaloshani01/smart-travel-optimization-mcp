import asyncio
import logging
from typing import Dict, Any
from datetime import datetime, timedelta
import random

logger = logging.getLogger(__name__)

class TimePredictorMCP:
    def __init__(self):
        self.name = "time_predictor"
        self.last_used = None
        self.error_count = 0
        logger.info("Time Predictor MCP initialized")
    
    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        try:
            self.last_used = datetime.utcnow()
            
            route = params.get('route', {})
            base_duration = route.get('total_duration', 1800)
            
            # Add traffic-based variation
            traffic_factor = random.uniform(0.8, 1.4)
            predicted_duration = int(base_duration * traffic_factor)
            
            # Calculate confidence based on time of day
            current_hour = datetime.utcnow().hour
            if 7 <= current_hour <= 9 or 17 <= current_hour <= 19:
                confidence = 0.7  # Lower confidence during rush hours
            else:
                confidence = 0.9
            
            return {
                'predicted_duration_seconds': predicted_duration,
                'base_duration_seconds': base_duration,
                'traffic_factor': traffic_factor,
                'confidence': confidence,
                'prediction_range': {
                    'min_seconds': int(predicted_duration * 0.9),
                    'max_seconds': int(predicted_duration * 1.2)
                },
                'predicted_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.error_count += 1
            logger.error(f"Time Predictor error: {str(e)}")
            return {
                'predicted_duration_seconds': 1800,
                'confidence': 0.5,
                'status': 'fallback'
            }