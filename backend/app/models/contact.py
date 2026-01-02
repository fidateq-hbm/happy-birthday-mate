from sqlalchemy import Column, String, Integer, DateTime, Text
from datetime import datetime
from app.core.database import Base


class ContactSubmission(Base):
    __tablename__ = "contact_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    subject = Column(String, nullable=False)  # account, technical, feature, etc.
    message = Column(Text, nullable=False)
    user_id = Column(Integer, nullable=True)  # Optional: if logged in user
    status = Column(String, default="pending")  # pending, responded, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<ContactSubmission {self.id} from {self.email}>"

