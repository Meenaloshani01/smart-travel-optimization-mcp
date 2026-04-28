import sqlite3
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path
import threading

logger = logging.getLogger(__name__)

class DatabaseManager:
    """SQLite database manager for travel optimization system"""
    
    def __init__(self, db_path: str = "smart_travel.db"):
        self.db_path = db_path
        self.local = threading.local()
        self._init_database()
        logger.info(f"Database manager initialized: {db_path}")
    
    def get_connection(self):
        """Get thread-local database connection"""
        if not hasattr(self.local, 'connection'):
            self.local.connection = sqlite3.connect(self.db_path)
            self.local.connection.row_factory = sqlite3.Row
        return self.local.connection
    
    def _init_database(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Travel requests table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS travel_requests (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                source_lat REAL NOT NULL,
                source_lng REAL NOT NULL,
                source_address TEXT,
                dest_lat REAL NOT NULL,
                dest_lng REAL NOT NULL,
                dest_address TEXT,
                departure_time TEXT,
                arrival_time TEXT,
                max_budget REAL,
                preferences TEXT,
                created_at TEXT NOT NULL,
                status TEXT DEFAULT 'pending'
            )
        ''')
        
        # Travel plans table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS travel_plans (
                id TEXT PRIMARY KEY,
                request_id TEXT NOT NULL,
                recommended_route_id TEXT,
                route_data TEXT NOT NULL,
                transport_options TEXT,
                alerts TEXT,
                confidence_score REAL,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                FOREIGN KEY (request_id) REFERENCES travel_requests (id)
            )
        ''')
        
        # Routes cache table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS routes_cache (
                id TEXT PRIMARY KEY,
                source_lat REAL NOT NULL,
                source_lng REAL NOT NULL,
                dest_lat REAL NOT NULL,
                dest_lng REAL NOT NULL,
                route_type TEXT,
                route_data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL
            )
        ''')
        
        # Traffic data cache
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS traffic_cache (
                id TEXT PRIMARY KEY,
                route_id TEXT NOT NULL,
                traffic_data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL
            )
        ''')
        
        # User preferences
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_preferences (
                user_id TEXT PRIMARY KEY,
                transport_modes TEXT,
                budget_preference REAL,
                safety_priority INTEGER,
                environmental_priority INTEGER,
                comfort_priority INTEGER,
                preferences_data TEXT,
                updated_at TEXT NOT NULL
            )
        ''')
        
        # Travel history
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS travel_history (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                plan_id TEXT NOT NULL,
                actual_duration INTEGER,
                actual_cost REAL,
                rating INTEGER,
                feedback TEXT,
                completed_at TEXT NOT NULL,
                FOREIGN KEY (plan_id) REFERENCES travel_plans (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    # Travel Requests
    def save_travel_request(self, request_data: Dict[str, Any]) -> bool:
        """Save travel request to database"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO travel_requests (
                    id, user_id, source_lat, source_lng, source_address,
                    dest_lat, dest_lng, dest_address, departure_time,
                    arrival_time, max_budget, preferences, created_at, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                request_data['id'],
                request_data['user_id'],
                request_data['source']['latitude'],
                request_data['source']['longitude'],
                request_data['source'].get('address'),
                request_data['destination']['latitude'],
                request_data['destination']['longitude'],
                request_data['destination'].get('address'),
                request_data['time_constraints'].get('departure_time'),
                request_data['time_constraints'].get('arrival_time'),
                request_data['budget_constraints'].get('max_cost'),
                json.dumps(request_data['preferences']),
                request_data['created_at'],
                'pending'
            ))
            
            conn.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error saving travel request: {str(e)}")
            return False
    
    def get_travel_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        """Get travel request by ID"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM travel_requests WHERE id = ?', (request_id,))
            row = cursor.fetchone()
            
            if row:
                return dict(row)
            return None
            
        except Exception as e:
            logger.error(f"Error getting travel request: {str(e)}")
            return None
    
    # Travel Plans
    def save_travel_plan(self, plan_data: Dict[str, Any]) -> bool:
        """Save travel plan to database"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO travel_plans (
                    id, request_id, recommended_route_id, route_data,
                    transport_options, alerts, confidence_score,
                    created_at, expires_at, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                plan_data['id'],
                plan_data['request_id'],
                plan_data['recommended_route']['id'],
                json.dumps(plan_data),
                json.dumps(plan_data['transport_recommendations']),
                json.dumps(plan_data['alerts']),
                plan_data['confidence_score'],
                plan_data['created_at'],
                plan_data['expires_at'],
                'active'
            ))
            
            conn.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error saving travel plan: {str(e)}")
            return False
    
    def get_travel_plan(self, plan_id: str) -> Optional[Dict[str, Any]]:
        """Get travel plan by ID"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM travel_plans WHERE id = ?', (plan_id,))
            row = cursor.fetchone()
            
            if row:
                plan_data = json.loads(row['route_data'])
                return plan_data
            return None
            
        except Exception as e:
            logger.error(f"Error getting travel plan: {str(e)}")
            return None
    
    def get_user_travel_plans(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent travel plans for a user"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT tp.* FROM travel_plans tp
                JOIN travel_requests tr ON tp.request_id = tr.id
                WHERE tr.user_id = ?
                ORDER BY tp.created_at DESC
                LIMIT ?
            ''', (user_id, limit))
            
            plans = []
            for row in cursor.fetchall():
                plan_data = json.loads(row['route_data'])
                plans.append(plan_data)
            
            return plans
            
        except Exception as e:
            logger.error(f"Error getting user travel plans: {str(e)}")
            return []
    
    # Cache Management
    def cache_route(self, route_key: str, route_data: Dict[str, Any], ttl_hours: int = 24) -> bool:
        """Cache route data"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            expires_at = datetime.utcnow().replace(hour=23, minute=59, second=59)
            
            cursor.execute('''
                INSERT OR REPLACE INTO routes_cache (
                    id, source_lat, source_lng, dest_lat, dest_lng,
                    route_type, route_data, created_at, expires_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                route_key,
                route_data.get('source_lat', 0),
                route_data.get('source_lng', 0),
                route_data.get('dest_lat', 0),
                route_data.get('dest_lng', 0),
                route_data.get('type', 'fastest'),
                json.dumps(route_data),
                datetime.utcnow().isoformat(),
                expires_at.isoformat()
            ))
            
            conn.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error caching route: {str(e)}")
            return False
    
    def get_cached_route(self, route_key: str) -> Optional[Dict[str, Any]]:
        """Get cached route data"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT route_data FROM routes_cache 
                WHERE id = ? AND expires_at > ?
            ''', (route_key, datetime.utcnow().isoformat()))
            
            row = cursor.fetchone()
            if row:
                return json.loads(row['route_data'])
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached route: {str(e)}")
            return None
    
    # User Preferences
    def save_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Save user preferences"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO user_preferences (
                    user_id, transport_modes, budget_preference,
                    safety_priority, environmental_priority, comfort_priority,
                    preferences_data, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                json.dumps(preferences.get('transport_modes', [])),
                preferences.get('budget_preference', 50.0),
                preferences.get('safety_priority', 5),
                preferences.get('environmental_priority', 5),
                preferences.get('comfort_priority', 5),
                json.dumps(preferences),
                datetime.utcnow().isoformat()
            ))
            
            conn.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error saving user preferences: {str(e)}")
            return False
    
    def get_user_preferences(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user preferences"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM user_preferences WHERE user_id = ?', (user_id,))
            row = cursor.fetchone()
            
            if row:
                return json.loads(row['preferences_data'])
            return None
            
        except Exception as e:
            logger.error(f"Error getting user preferences: {str(e)}")
            return None
    
    # Analytics
    def save_travel_history(self, history_data: Dict[str, Any]) -> bool:
        """Save completed travel history"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO travel_history (
                    id, user_id, plan_id, actual_duration, actual_cost,
                    rating, feedback, completed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                history_data['id'],
                history_data['user_id'],
                history_data['plan_id'],
                history_data.get('actual_duration'),
                history_data.get('actual_cost'),
                history_data.get('rating'),
                history_data.get('feedback'),
                history_data['completed_at']
            ))
            
            conn.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error saving travel history: {str(e)}")
            return False
    
    def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get user travel analytics"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Total trips
            cursor.execute('SELECT COUNT(*) as total_trips FROM travel_history WHERE user_id = ?', (user_id,))
            total_trips = cursor.fetchone()['total_trips']
            
            # Average rating
            cursor.execute('SELECT AVG(rating) as avg_rating FROM travel_history WHERE user_id = ? AND rating IS NOT NULL', (user_id,))
            avg_rating = cursor.fetchone()['avg_rating'] or 0
            
            # Total cost
            cursor.execute('SELECT SUM(actual_cost) as total_cost FROM travel_history WHERE user_id = ? AND actual_cost IS NOT NULL', (user_id,))
            total_cost = cursor.fetchone()['total_cost'] or 0
            
            # Average duration
            cursor.execute('SELECT AVG(actual_duration) as avg_duration FROM travel_history WHERE user_id = ? AND actual_duration IS NOT NULL', (user_id,))
            avg_duration = cursor.fetchone()['avg_duration'] or 0
            
            return {
                'total_trips': total_trips,
                'average_rating': round(avg_rating, 1),
                'total_cost_saved': round(total_cost, 2),
                'average_duration_minutes': round(avg_duration / 60, 1) if avg_duration else 0,
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting user analytics: {str(e)}")
            return {}
    
    # Cleanup
    def cleanup_expired_data(self):
        """Clean up expired cache data"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            now = datetime.utcnow().isoformat()
            
            # Clean expired routes
            cursor.execute('DELETE FROM routes_cache WHERE expires_at < ?', (now,))
            
            # Clean expired traffic data
            cursor.execute('DELETE FROM traffic_cache WHERE expires_at < ?', (now,))
            
            # Clean expired travel plans
            cursor.execute('UPDATE travel_plans SET status = "expired" WHERE expires_at < ? AND status = "active"', (now,))
            
            conn.commit()
            logger.info("Expired data cleaned up")
            
        except Exception as e:
            logger.error(f"Error cleaning up expired data: {str(e)}")
    
    def close(self):
        """Close database connection"""
        if hasattr(self.local, 'connection'):
            self.local.connection.close()
            delattr(self.local, 'connection')