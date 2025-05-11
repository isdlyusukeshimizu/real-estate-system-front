from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DashboardData(BaseModel):
    """Schema for dashboard analytics data"""
    total_customers: int
    new_customers_this_month: int
    active_customers: int
    closed_deals_this_month: int
    revenue_this_month: float
    recent_activities: List[Dict[str, Any]]
    status_distribution: Dict[str, int]
    monthly_acquisition: Dict[str, int]

class StatusData(BaseModel):
    """Schema for status-based analytics"""
    status_counts: Dict[str, int]
    status_by_property_type: Dict[str, Dict[str, int]]
    status_by_source: Dict[str, Dict[str, int]]
    status_timeline: Dict[str, List[int]]
    conversion_rates: Dict[str, float]

class SalesRepData(BaseModel):
    """Schema for sales rep performance analytics"""
    rep_id: int
    rep_name: str
    total_customers: int
    active_customers: int
    closed_deals: int
    conversion_rate: float
    average_time_to_close: Optional[int] = None  # in days
    revenue_generated: float

class SalesPerformanceData(BaseModel):
    """Schema for overall sales performance analytics"""
    total_customers: int
    total_closed_deals: int
    overall_conversion_rate: float
    sales_reps: List[SalesRepData]
    top_performers: List[Dict[str, Any]]
    performance_by_month: Dict[str, Dict[str, Any]]
