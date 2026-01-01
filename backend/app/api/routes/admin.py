from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from pydantic import BaseModel
from datetime import datetime, date, timedelta
from typing import Optional, List
from collections import defaultdict

from app.core.database import get_db
from app.models import (
    User, Celebrity, ModerationLog, FlaggedContent,
    ModerationActionEnum, ContentTypeEnum, Room, Message, Gift, BirthdayWall
)

router = APIRouter()


class AddCelebrityRequest(BaseModel):
    name: str
    photo_url: str
    description: Optional[str]
    birth_month: int
    birth_day: int
    birth_year: Optional[int]


class FlagContentRequest(BaseModel):
    content_type: ContentTypeEnum
    content_id: int
    reason: str


@router.post("/celebrities")
async def add_celebrity(request: AddCelebrityRequest, db: Session = Depends(get_db)):
    """Add a celebrity to the database"""
    
    celebrity = Celebrity(
        name=request.name,
        photo_url=request.photo_url,
        description=request.description,
        birth_month=request.birth_month,
        birth_day=request.birth_day,
        birth_year=request.birth_year,
        is_active=True
    )
    db.add(celebrity)
    db.commit()
    db.refresh(celebrity)
    
    return {
        "celebrity_id": celebrity.id,
        "message": "Celebrity added successfully"
    }


@router.get("/celebrities/today")
async def get_celebrities_today(db: Session = Depends(get_db)):
    """Get celebrities with birthdays today"""
    
    today = date.today()
    
    celebrities = db.query(Celebrity).filter(
        Celebrity.birth_month == today.month,
        Celebrity.birth_day == today.day,
        Celebrity.is_active == True
    ).order_by(Celebrity.priority.desc()).all()
    
    return {
        "celebrities": [
            {
                "id": celeb.id,
                "name": celeb.name,
                "photo_url": celeb.photo_url,
                "description": celeb.description,
                "birth_year": celeb.birth_year
            }
            for celeb in celebrities
        ]
    }


@router.post("/flag-content")
async def flag_content(
    request: FlagContentRequest,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Flag inappropriate content"""
    
    flagged = FlaggedContent(
        content_type=request.content_type,
        content_id=request.content_id,
        reported_by_user_id=user_id,
        reason=request.reason,
        status="pending"
    )
    db.add(flagged)
    db.commit()
    
    return {"message": "Content flagged for review"}


@router.get("/flagged-content")
async def get_flagged_content(
    status: str = "pending",
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get flagged content for moderation"""
    
    flagged_items = db.query(FlaggedContent).filter(
        FlaggedContent.status == status
    ).order_by(FlaggedContent.created_at.desc()).limit(limit).all()
    
    return {
        "flagged_content": [
            {
                "id": item.id,
                "content_type": item.content_type,
                "content_id": item.content_id,
                "reported_by": item.reported_by_user_id,
                "reason": item.reason,
                "created_at": item.created_at
            }
            for item in flagged_items
        ]
    }


@router.get("/stats/overview")
async def get_platform_stats(db: Session = Depends(get_db)):
    """Get platform statistics"""
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Get today's celebrants
    today = date.today()
    todays_celebrants = db.query(User).filter(
        User.birth_month == today.month,
        User.birth_day == today.day,
        User.is_active == True
    ).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "todays_celebrants": todays_celebrants,
        "platform_status": "operational"
    }


@router.get("/celebrants/state/{state}")
async def get_state_celebrants(state: str, db: Session = Depends(get_db)):
    """Get celebrants in a specific state today"""
    
    today = date.today()
    
    # Get all celebrants
    all_celebrants = db.query(User).filter(
        User.birth_month == today.month,
        User.birth_day == today.day,
        User.state == state,
        User.is_active == True
    ).count()
    
    # Get visible celebrants
    visible_celebrants = db.query(User).filter(
        User.birth_month == today.month,
        User.birth_day == today.day,
        User.state == state,
        User.state_visibility_enabled == True,
        User.is_active == True
    ).all()
    
    return {
        "state": state,
        "total_celebrants": all_celebrants,
        "visible_celebrants": [
            {
                "id": user.id,
                "first_name": user.first_name,
                "profile_picture_url": user.profile_picture_url,
                "city": user.city
            }
            for user in visible_celebrants
        ]
    }


# ========== ANALYTICS ENDPOINTS ==========

@router.get("/analytics/overview")
async def get_analytics_overview(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics overview"""
    
    today = date.today()
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # User metrics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    new_users = db.query(User).filter(User.created_at >= start_date).count()
    
    # Engagement metrics
    total_rooms = db.query(Room).count()
    active_rooms = db.query(Room).filter(Room.is_active == True).count()
    total_messages = db.query(Message).filter(Message.created_at >= start_date).count()
    total_gifts = db.query(Gift).filter(Gift.created_at >= start_date).count()
    total_walls = db.query(BirthdayWall).filter(BirthdayWall.created_at >= start_date).count()
    
    # Today's celebrants
    todays_celebrants = db.query(User).filter(
        User.birth_month == today.month,
        User.birth_day == today.day,
        User.is_active == True
    ).count()
    
    # Moderation metrics
    pending_flags = db.query(FlaggedContent).filter(FlaggedContent.status == "pending").count()
    total_moderation_actions = db.query(ModerationLog).filter(ModerationLog.created_at >= start_date).count()
    
    return {
        "period_days": days,
        "users": {
            "total": total_users,
            "active": active_users,
            "new_in_period": new_users,
            "growth_rate": round((new_users / max(total_users - new_users, 1)) * 100, 2) if total_users > new_users else 0
        },
        "engagement": {
            "total_rooms": total_rooms,
            "active_rooms": active_rooms,
            "messages_in_period": total_messages,
            "gifts_sent_in_period": total_gifts,
            "walls_created_in_period": total_walls,
            "todays_celebrants": todays_celebrants
        },
        "moderation": {
            "pending_flags": pending_flags,
            "actions_in_period": total_moderation_actions
        }
    }


@router.get("/analytics/user-growth")
async def get_user_growth(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get user growth over time"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get daily user registrations
    daily_registrations = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.created_at >= start_date
    ).group_by(
        func.date(User.created_at)
    ).order_by('date').all()
    
    return {
        "period_days": days,
        "daily_registrations": [
            {
                "date": str(reg.date),
                "count": reg.count
            }
            for reg in daily_registrations
        ]
    }


@router.get("/analytics/engagement")
async def get_engagement_metrics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get engagement metrics over time"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Daily messages
    daily_messages = db.query(
        func.date(Message.created_at).label('date'),
        func.count(Message.id).label('count')
    ).filter(
        Message.created_at >= start_date
    ).group_by(
        func.date(Message.created_at)
    ).order_by('date').all()
    
    # Daily gifts
    daily_gifts = db.query(
        func.date(Gift.created_at).label('date'),
        func.count(Gift.id).label('count')
    ).filter(
        Gift.created_at >= start_date
    ).group_by(
        func.date(Gift.created_at)
    ).order_by('date').all()
    
    # Daily walls
    daily_walls = db.query(
        func.date(BirthdayWall.created_at).label('date'),
        func.count(BirthdayWall.id).label('count')
    ).filter(
        BirthdayWall.created_at >= start_date
    ).group_by(
        func.date(BirthdayWall.created_at)
    ).order_by('date').all()
    
    return {
        "period_days": days,
        "daily_messages": [
            {"date": str(msg.date), "count": msg.count}
            for msg in daily_messages
        ],
        "daily_gifts": [
            {"date": str(gift.date), "count": gift.count}
            for gift in daily_gifts
        ],
        "daily_walls": [
            {"date": str(wall.date), "count": wall.count}
            for wall in daily_walls
        ]
    }


@router.get("/analytics/geographic")
async def get_geographic_analytics(db: Session = Depends(get_db)):
    """Get geographic distribution of users"""
    
    # Top countries
    top_countries = db.query(
        User.country,
        func.count(User.id).label('count')
    ).filter(
        User.is_active == True
    ).group_by(
        User.country
    ).order_by(
        func.count(User.id).desc()
    ).limit(10).all()
    
    # Top states
    top_states = db.query(
        User.state,
        User.country,
        func.count(User.id).label('count')
    ).filter(
        User.is_active == True
    ).group_by(
        User.state, User.country
    ).order_by(
        func.count(User.id).desc()
    ).limit(10).all()
    
    return {
        "top_countries": [
            {"country": country, "user_count": count}
            for country, count in top_countries
        ],
        "top_states": [
            {"state": state, "country": country, "user_count": count}
            for state, country, count in top_states
        ]
    }


@router.get("/analytics/tribes")
async def get_tribe_analytics(db: Session = Depends(get_db)):
    """Get birthday tribe analytics"""
    
    # Tribe sizes
    tribe_sizes = db.query(
        User.tribe_id,
        func.count(User.id).label('member_count')
    ).filter(
        User.is_active == True
    ).group_by(
        User.tribe_id
    ).order_by(
        func.count(User.id).desc()
    ).limit(20).all()
    
    # Calculate average tribe size from the results
    if tribe_sizes:
        total_members = sum(count for _, count in tribe_sizes)
        avg_tribe_size = total_members / len(tribe_sizes)
    else:
        avg_tribe_size = 0
    
    # Get total number of unique tribes
    total_tribes = db.query(func.count(func.distinct(User.tribe_id))).filter(
        User.is_active == True
    ).scalar() or 0
    
    return {
        "top_tribes": [
            {"tribe_id": tribe_id, "member_count": count}
            for tribe_id, count in tribe_sizes
        ],
        "average_tribe_size": round(float(avg_tribe_size), 2) if avg_tribe_size else 0,
        "total_tribes": total_tribes
    }


# ========== ACTIVITY MONITORING ENDPOINTS ==========

@router.get("/activities/recent")
async def get_recent_activities(
    limit: int = Query(50, ge=1, le=200),
    activity_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get recent platform activities"""
    
    activities = []
    
    # Recent user signups
    if not activity_type or activity_type == "signup":
        recent_users = db.query(User).order_by(User.created_at.desc()).limit(limit).all()
        for user in recent_users:
            activities.append({
                "type": "user_signup",
                "timestamp": user.created_at,
                "user_id": user.id,
                "user_name": user.first_name,
                "details": f"{user.first_name} joined the platform"
            })
    
    # Recent messages
    if not activity_type or activity_type == "message":
        recent_messages = db.query(Message).order_by(Message.created_at.desc()).limit(limit).all()
        for msg in recent_messages:
            activities.append({
                "type": "message_sent",
                "timestamp": msg.created_at,
                "user_id": msg.user_id,
                "room_id": msg.room_id,
                "details": f"Message sent in room {msg.room_id}"
            })
    
    # Recent gifts
    if not activity_type or activity_type == "gift":
        recent_gifts = db.query(Gift).order_by(Gift.created_at.desc()).limit(limit).all()
        for gift in recent_gifts:
            activities.append({
                "type": "gift_sent",
                "timestamp": gift.created_at,
                "sender_id": gift.sender_id,
                "recipient_id": gift.recipient_id,
                "gift_type": gift.gift_type,
                "details": f"Gift ({gift.gift_type}) sent"
            })
    
    # Recent walls
    if not activity_type or activity_type == "wall":
        recent_walls = db.query(BirthdayWall).order_by(BirthdayWall.created_at.desc()).limit(limit).all()
        for wall in recent_walls:
            activities.append({
                "type": "wall_created",
                "timestamp": wall.created_at,
                "user_id": wall.owner_id,
                "wall_code": wall.wall_code,
                "details": f"Birthday wall created: {wall.wall_code}"
            })
    
    # Recent moderation actions
    if not activity_type or activity_type == "moderation":
        recent_moderation = db.query(ModerationLog).order_by(ModerationLog.created_at.desc()).limit(limit).all()
        for mod in recent_moderation:
            activities.append({
                "type": "moderation_action",
                "timestamp": mod.created_at,
                "moderator_id": mod.moderator_id,
                "action": mod.action,
                "details": f"Moderation: {mod.action}"
            })
    
    # Sort by timestamp and limit
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return {
        "activities": activities[:limit],
        "total": len(activities)
    }


@router.get("/activities/users")
async def get_user_activities(
    user_id: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Get activities for a specific user or all users"""
    
    query = db.query(User)
    if user_id:
        query = query.filter(User.id == user_id)
    
    users = query.order_by(User.updated_at.desc()).limit(limit).all()
    
    activities = []
    for user in users:
        # Count user's activities
        message_count = db.query(Message).filter(Message.user_id == user.id).count()
        gift_sent_count = db.query(Gift).filter(Gift.sender_id == user.id).count()
        gift_received_count = db.query(Gift).filter(Gift.recipient_id == user.id).count()
        wall_count = db.query(BirthdayWall).filter(BirthdayWall.owner_id == user.id).count()
        
        activities.append({
            "user_id": user.id,
            "user_name": user.first_name,
            "email": user.email,
            "tribe_id": user.tribe_id,
            "country": user.country,
            "state": user.state,
            "created_at": user.created_at,
            "last_active": user.updated_at,
            "stats": {
                "messages_sent": message_count,
                "gifts_sent": gift_sent_count,
                "gifts_received": gift_received_count,
                "walls_created": wall_count
            }
        })
    
    return {
        "users": activities,
        "total": len(activities)
    }

