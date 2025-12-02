"""Analytics response schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class EventsByHomeItem(BaseModel):
    """Event count by home."""

    home_id: str
    count: int


class DeviceUptimeItem(BaseModel):
    """Device uptime summary item."""

    device_id: str
    event_count: int
    last_event: Optional[str] = None
    uptime_percent: float


class OpsOverviewResponse(BaseModel):
    """Operations overview response."""

    totalHomes: int
    totalDevices: int
    totalDevicesOnline: int
    openAlertsBySeverity: dict[str, int]  # {"high": 0, "medium": 0, "low": 0}
    eventsByHomeLast24h: list[EventsByHomeItem]
    deviceUptimeSummary: list[DeviceUptimeItem]


class OwnerOverviewResponse(BaseModel):
    """Owner overview response."""

    openAlertsCount: int
    openAlertsHigh: int
    devicesOnlineCount: int
    eventsLast24h: int
    totalDevices: int
    roomsCount: Optional[int] = None
    perRoomStats: Optional[list[dict]] = None  # Stub for future use


class AlertsHeatmapItem(BaseModel):
    """Alerts heatmap item."""

    home_id: str
    home_name: str
    total_alerts: int
    alerts_by_severity: dict[str, int]  # {"high": 0, "medium": 0, "low": 0}


class AlertsHeatmapResponse(BaseModel):
    """Alerts heatmap response."""

    period: str  # "24h" or "7d"
    data: list[AlertsHeatmapItem]


class EventsByHourItem(BaseModel):
    """Events by hour item."""

    hour: int
    day: int
    month: int
    year: int
    count: int

