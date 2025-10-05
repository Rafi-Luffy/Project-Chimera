"""
Database setup for user authentication and memory storage
"""
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./project_chimera.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class User(Base):
    """User model for authentication"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Auto-learned preferences
    preferred_persona = Column(String, default="Research Scientist")
    usage_count = Column(Integer, default=0)
    persona_usage = Column(JSON, default=dict)  # {"Research Scientist": 10, "Manager": 2}
    favorite_topics = Column(JSON, default=list)  # ["Microgravity", "Radiation"]
    last_active = Column(DateTime, default=datetime.utcnow)


class ChatSession(Base):
    """Store chat sessions with LangChain memory"""
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    session_id = Column(String, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # LangChain memory storage
    conversation_history = Column(JSON, default=list)
    context = Column(JSON, default=dict)


class UserPreference(Base):
    """Track user queries and interactions for auto-learning"""
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    query = Column(Text, nullable=False)
    persona_used = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    topics_mentioned = Column(JSON, default=list)


# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
