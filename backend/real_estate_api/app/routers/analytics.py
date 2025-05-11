from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from datetime import datetime, timedelta, date

from app.api import deps
from app.models.user import User
from app.models.customer import Customer
from app.models.activity import Activity
from app.models.billing import Billing
from app.schemas.analytics import DashboardData, StatusData, SalesPerformanceData

router = APIRouter()

@router.get("/dashboard", response_model=DashboardData)
def get_dashboard_data(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get analytics data for the dashboard.
    """
    today = date.today()
    first_day_of_month = date(today.year, today.month, 1)
    
    customer_query = db.query(Customer)
    
    if current_user.role != "owner":
        customer_query = customer_query.filter(Customer.assigned_to == current_user.id)
    
    total_customers = customer_query.count()
    
    new_customers_this_month = customer_query.filter(
        Customer.created_at >= first_day_of_month
    ).count()
    
    active_customers = customer_query.filter(
        Customer.status.notin_(["closed", "lost"])
    ).count()
    
    closed_deals_this_month = customer_query.filter(
        Customer.status == "closed",
        Customer.updated_at >= first_day_of_month
    ).count()
    
    billing_query = db.query(func.sum(Billing.amount))
    
    if current_user.role != "owner":
        billing_query = billing_query.filter(Billing.user_id == current_user.id)
    
    revenue_this_month = billing_query.filter(
        Billing.status == "paid",
        Billing.paid_date >= first_day_of_month
    ).scalar() or 0.0
    
    activity_query = db.query(Activity)
    
    if current_user.role != "owner":
        activity_query = activity_query.join(Customer).filter(Customer.assigned_to == current_user.id)
    
    recent_activities = []
    for activity in activity_query.order_by(Activity.date.desc()).limit(10).all():
        customer = db.query(Customer).filter(Customer.id == activity.customer_id).first()
        user = db.query(User).filter(User.id == activity.created_by).first()
        
        recent_activities.append({
            "id": activity.id,
            "date": activity.date,
            "type": activity.type,
            "description": activity.description,
            "customer_name": customer.name if customer else "Unknown",
            "user_name": user.username if user else "Unknown"
        })
    
    status_counts = {}
    for status_row in db.query(Customer.status, func.count(Customer.id)).group_by(Customer.status).all():
        status_counts[status_row[0]] = status_row[1]
    
    monthly_acquisition = {}
    for i in range(5, -1, -1):
        month_date = today.replace(day=1) - timedelta(days=i*30)
        month_name = month_date.strftime("%b %Y")
        
        count = customer_query.filter(
            extract('year', Customer.created_at) == month_date.year,
            extract('month', Customer.created_at) == month_date.month
        ).count()
        
        monthly_acquisition[month_name] = count
    
    return {
        "total_customers": total_customers,
        "new_customers_this_month": new_customers_this_month,
        "active_customers": active_customers,
        "closed_deals_this_month": closed_deals_this_month,
        "revenue_this_month": revenue_this_month,
        "recent_activities": recent_activities,
        "status_distribution": status_counts,
        "monthly_acquisition": monthly_acquisition
    }

@router.get("/status", response_model=StatusData)
def get_status_data(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get status-based analytics data.
    """
    customer_query = db.query(Customer)
    
    if current_user.role != "owner":
        customer_query = customer_query.filter(Customer.assigned_to == current_user.id)
    
    status_counts = {}
    for status_row in customer_query.with_entities(Customer.status, func.count(Customer.id)).group_by(Customer.status).all():
        status_counts[status_row[0]] = status_row[1]
    
    status_by_property_type = {}
    for row in customer_query.with_entities(Customer.status, Customer.property_type, func.count(Customer.id)).group_by(Customer.status, Customer.property_type).all():
        status = row[0]
        property_type = row[1] or "Unknown"
        count = row[2]
        
        if status not in status_by_property_type:
            status_by_property_type[status] = {}
        
        status_by_property_type[status][property_type] = count
    
    status_by_source = {}
    for row in customer_query.with_entities(Customer.status, Customer.source, func.count(Customer.id)).group_by(Customer.status, Customer.source).all():
        status = row[0]
        source = row[1] or "Unknown"
        count = row[2]
        
        if status not in status_by_source:
            status_by_source[status] = {}
        
        status_by_source[status][source] = count
    
    today = date.today()
    status_timeline = {}
    statuses = db.query(Customer.status).distinct().all()
    
    for status_row in statuses:
        status = status_row[0]
        status_timeline[status] = []
        
        for i in range(5, -1, -1):
            month_date = today.replace(day=1) - timedelta(days=i*30)
            
            count = customer_query.filter(
                Customer.status == status,
                extract('year', Customer.created_at) == month_date.year,
                extract('month', Customer.created_at) == month_date.month
            ).count()
            
            status_timeline[status].append(count)
    
    conversion_rates = {}
    total = customer_query.count() or 1  # Avoid division by zero
    
    for status, count in status_counts.items():
        conversion_rates[status] = round(count / total * 100, 2)
    
    return {
        "status_counts": status_counts,
        "status_by_property_type": status_by_property_type,
        "status_by_source": status_by_source,
        "status_timeline": status_timeline,
        "conversion_rates": conversion_rates
    }

@router.get("/sales", response_model=SalesPerformanceData)
def get_sales_performance(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_owner),  # Only owners can access this endpoint
) -> Any:
    """
    Get sales rep performance analytics. Only accessible by owners.
    """
    sales_reps = db.query(User).filter(User.role == "member").all()
    
    total_customers = db.query(Customer).count()
    total_closed_deals = db.query(Customer).filter(Customer.status == "closed").count()
    
    overall_conversion_rate = round(total_closed_deals / (total_customers or 1) * 100, 2)
    
    sales_rep_data = []
    for rep in sales_reps:
        rep_customers = db.query(Customer).filter(Customer.assigned_to == rep.id).all()
        rep_customer_count = len(rep_customers)
        
        rep_active_customers = db.query(Customer).filter(
            Customer.assigned_to == rep.id,
            Customer.status.notin_(["closed", "lost"])
        ).count()
        
        rep_closed_deals = db.query(Customer).filter(
            Customer.assigned_to == rep.id,
            Customer.status == "closed"
        ).count()
        
        rep_conversion_rate = round(rep_closed_deals / (rep_customer_count or 1) * 100, 2)
        
        closed_customers = [c for c in rep_customers if c.status == "closed"]
        if closed_customers:
            total_days = sum(
                (c.updated_at.date() - c.created_at.date()).days
                for c in closed_customers
            )
            avg_time_to_close = total_days // len(closed_customers)
        else:
            avg_time_to_close = None
        
        rep_revenue = db.query(func.sum(Billing.amount)).filter(
            Billing.user_id == rep.id,
            Billing.status == "paid"
        ).scalar() or 0.0
        
        sales_rep_data.append({
            "rep_id": rep.id,
            "rep_name": rep.username,
            "total_customers": rep_customer_count,
            "active_customers": rep_active_customers,
            "closed_deals": rep_closed_deals,
            "conversion_rate": rep_conversion_rate,
            "average_time_to_close": avg_time_to_close,
            "revenue_generated": rep_revenue
        })
    
    top_performers = sorted(
        sales_rep_data,
        key=lambda x: x["closed_deals"],
        reverse=True
    )[:3]
    
    today = date.today()
    performance_by_month = {}
    
    for i in range(5, -1, -1):
        month_date = today.replace(day=1) - timedelta(days=i*30)
        month_name = month_date.strftime("%b %Y")
        
        new_customers = db.query(Customer).filter(
            extract('year', Customer.created_at) == month_date.year,
            extract('month', Customer.created_at) == month_date.month
        ).count()
        
        closed_deals = db.query(Customer).filter(
            Customer.status == "closed",
            extract('year', Customer.updated_at) == month_date.year,
            extract('month', Customer.updated_at) == month_date.month
        ).count()
        
        revenue = db.query(func.sum(Billing.amount)).filter(
            Billing.status == "paid",
            extract('year', Billing.paid_date) == month_date.year,
            extract('month', Billing.paid_date) == month_date.month
        ).scalar() or 0.0
        
        performance_by_month[month_name] = {
            "new_customers": new_customers,
            "closed_deals": closed_deals,
            "revenue": revenue
        }
    
    return {
        "total_customers": total_customers,
        "total_closed_deals": total_closed_deals,
        "overall_conversion_rate": overall_conversion_rate,
        "sales_reps": sales_rep_data,
        "top_performers": top_performers,
        "performance_by_month": performance_by_month
    }
