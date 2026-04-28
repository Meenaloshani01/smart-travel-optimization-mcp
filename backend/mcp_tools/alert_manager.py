import asyncio
import logging
from typing import Dict, List, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class AlertManagerMCP:
    def __init__(self):
        self.name = "alert_manager"
        self.last_used = None
        self.error_count = 0
        self.active_alerts = []
        logger.info("Alert Manager MCP initialized")
    
    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        try:
            self.last_used = datetime.utcnow()
            
            action = params.get('action', 'get_alerts')
            
            if action == 'get_alerts':
                return await self.get_active_alerts(params.get('route_id'))
            elif action == 'create_alert':
                return await self.create_alert(params)
            elif action == 'dismiss_alert':
                return await self.dismiss_alert(params.get('alert_id'))
            
        except Exception as e:
            self.error_count += 1
            logger.error(f"Alert Manager error: {str(e)}")
            return {'alerts': [], 'status': 'fallback'}
    
    async def get_active_alerts(self, route_id: str = None) -> Dict[str, Any]:
        # Mock alerts
        alerts = [
            {
                'id': 'alert_001',
                'type': 'traffic',
                'severity': 'medium',
                'message': 'Heavy traffic on Highway 101 - 15 minute delay expected',
                'created_at': datetime.utcnow().isoformat(),
                'expires_at': (datetime.utcnow() + timedelta(hours=2)).isoformat()
            },
            {
                'id': 'alert_002',
                'type': 'weather',
                'severity': 'low',
                'message': 'Light rain expected in 30 minutes',
                'created_at': datetime.utcnow().isoformat(),
                'expires_at': (datetime.utcnow() + timedelta(hours=4)).isoformat()
            }
        ]
        
        return {
            'alerts': alerts,
            'total_alerts': len(alerts),
            'route_id': route_id,
            'last_updated': datetime.utcnow().isoformat()
        }
    
    async def create_alert(self, params: Dict[str, Any]) -> Dict[str, Any]:
        alert = {
            'id': f"alert_{len(self.active_alerts) + 1:03d}",
            'type': params.get('type', 'general'),
            'severity': params.get('severity', 'low'),
            'message': params.get('message', 'New alert'),
            'created_at': datetime.utcnow().isoformat()
        }
        
        self.active_alerts.append(alert)
        return {'alert_created': alert}
    
    async def dismiss_alert(self, alert_id: str) -> Dict[str, Any]:
        return {'alert_dismissed': alert_id, 'success': True}