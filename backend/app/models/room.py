from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class RoomTypeEnum(str, enum.Enum):
    TRIBE = "tribe"           # Birthday Tribe Room
    PERSONAL = "personal"     # Personal Birthday Room
    BUDDY = "buddy"          # 1-on-1 Birthday Buddy


class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    room_type = Column(Enum(RoomTypeEnum), nullable=False)
    
    # For tribe rooms: "MM-DD", for personal: user_id, for buddy: generated
    room_identifier = Column(String, unique=True, index=True, nullable=False)
    
    # Room metadata
    name = Column(String, nullable=True)  # Optional display name
    
    # Lifecycle (24-hour window)
    opens_at = Column(DateTime, nullable=False)
    closes_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    is_read_only = Column(Boolean, default=False)
    
    # For personal rooms - owner
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Invite system for personal rooms
    invite_code = Column(String, unique=True, nullable=True)
    max_guests = Column(Integer, default=50)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = relationship("Message", back_populates="room", cascade="all, delete-orphan")
    participants = relationship("RoomParticipant", back_populates="room", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Room {self.room_type} {self.room_identifier}>"


class RoomParticipant(Base):
    __tablename__ = "room_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null for invited guests
    
    # Guest info (for invited guests)
    guest_name = Column(String, nullable=True)
    is_guest = Column(Boolean, default=False)
    is_birthday_mate = Column(Boolean, default=False)
    
    # Participation
    joined_at = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    room = relationship("Room", back_populates="participants")
    
    def __repr__(self):
        return f"<RoomParticipant room={self.room_id} user={self.user_id}>"


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Message content
    content = Column(Text, nullable=False)
    
    # Moderation
    is_flagged = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    room = relationship("Room", back_populates="messages")
    user = relationship("User", back_populates="messages")
    reactions = relationship("MessageReaction", back_populates="message", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Message {self.id} in room {self.room_id}>"


class MessageReaction(Base):
    __tablename__ = "message_reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    emoji = Column(String, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    message = relationship("Message", back_populates="reactions")
    
    def __repr__(self):
        return f"<Reaction {self.emoji} on message {self.message_id}>"

