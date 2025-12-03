"""Events repository for analytics queries on MongoDB."""
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database


class EventsRepository:
    """Repository for analytics queries on MongoDB events collection."""

    def __init__(self, mongo_uri: str, database_name: str = "smart_home"):
        """Initialize MongoDB connection."""
        self.client = MongoClient(mongo_uri)
        self.db: Database = self.client[database_name]
        self.events: Collection = self.db["events"]

    def count_events_last_24h(self, home_id: UUID) -> int:
        """Count events for a specific home in the last 24 hours."""
        cutoff_time = datetime.utcnow() - timedelta(hours=24)
        count = self.events.count_documents(
            {
                "home_id": str(home_id),
                "timestamp": {"$gte": cutoff_time},
            }
        )
        return count

    def count_events_by_home_last_24h(self) -> list[dict]:
        """Count events per home in the last 24 hours."""
        cutoff_time = datetime.utcnow() - timedelta(hours=24)
        
        pipeline = [
            {"$match": {"timestamp": {"$gte": cutoff_time}}},
            {"$group": {"_id": "$home_id", "count": {"$sum": 1}}},
            {"$project": {"home_id": "$_id", "count": 1, "_id": 0}},
        ]
        
        results = list(self.events.aggregate(pipeline))
        return results

    def device_uptime_summary(self, home_id: UUID) -> list[dict]:
        """
        Calculate device uptime summary for a home.
        
        This approximates uptime based on event frequency in the last 7 days.
        Devices with more recent events are considered more "online".
        """
        cutoff_time = datetime.utcnow() - timedelta(days=7)
        
        pipeline = [
            {
                "$match": {
                    "home_id": str(home_id),
                    "timestamp": {"$gte": cutoff_time},
                }
            },
            {
                "$group": {
                    "_id": "$device_id",
                    "event_count": {"$sum": 1},
                    "last_event": {"$max": "$timestamp"},
                }
            },
            {
                "$project": {
                    "device_id": "$_id",
                    "event_count": 1,
                    "last_event": 1,
                    "uptime_percent": {
                        "$cond": {
                            "if": {"$gte": ["$event_count", 100]},
                            "then": 95.0,  # High activity = high uptime
                            "else": {
                                "$cond": {
                                    "if": {"$gte": ["$event_count", 50]},
                                    "then": 85.0,
                                    "else": {
                                        "$cond": {
                                            "if": {"$gte": ["$event_count", 10]},
                                            "then": 70.0,
                                            "else": 50.0,
                                        }
                                    },
                                }
                            },
                        }
                    },
                    "_id": 0,
                }
            },
        ]
        
        results = list(self.events.aggregate(pipeline))
        return results

    def get_events_by_hour_last_24h(self, home_id: Optional[UUID] = None) -> list[dict]:
        """Get event counts grouped by hour for the last 24 hours."""
        cutoff_time = datetime.utcnow() - timedelta(hours=24)
        
        match_stage = {"timestamp": {"$gte": cutoff_time}}
        if home_id:
            match_stage["home_id"] = str(home_id)
        
        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$timestamp"},
                        "month": {"$month": "$timestamp"},
                        "day": {"$dayOfMonth": "$timestamp"},
                        "hour": {"$hour": "$timestamp"},
                    },
                    "count": {"$sum": 1},
                }
            },
            {
                "$project": {
                    "hour": "$_id.hour",
                    "day": "$_id.day",
                    "month": "$_id.month",
                    "year": "$_id.year",
                    "count": 1,
                    "_id": 0,
                }
            },
            {"$sort": {"year": 1, "month": 1, "day": 1, "hour": 1}},
        ]
        
        results = list(self.events.aggregate(pipeline))
        return results


