-- Happy Birthday Mate Database Initialization
-- PostgreSQL Database Schema

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- This file is a reference. Actual tables are created via SQLAlchemy models.
-- To initialize the database:
-- 1. Create PostgreSQL database: CREATE DATABASE happy_birthday_mate;
-- 2. Run: python -c "from backend.app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

-- Sample data for celebrities (run after tables are created)
INSERT INTO celebrities (name, photo_url, description, birth_month, birth_day, birth_year, is_active, priority)
VALUES
  ('Martin Luther King Jr.', 'https://example.com/mlk.jpg', 'American civil rights leader', 1, 15, 1929, true, 100),
  ('Oprah Winfrey', 'https://example.com/oprah.jpg', 'Media mogul and philanthropist', 1, 29, 1954, true, 100),
  ('Rihanna', 'https://example.com/rihanna.jpg', 'Singer, actress, and entrepreneur', 2, 20, 1988, true, 100),
  ('Albert Einstein', 'https://example.com/einstein.jpg', 'Theoretical physicist', 3, 14, 1879, true, 100),
  ('Leonardo da Vinci', 'https://example.com/davinci.jpg', 'Renaissance polymath', 4, 15, 1452, true, 100),
  ('Adele', 'https://example.com/adele.jpg', 'Grammy-winning singer', 5, 5, 1988, true, 100);

-- Sample data for gift catalog
INSERT INTO gift_catalog (gift_type, name, description, price, currency, image_url, display_order, is_active, is_featured)
VALUES
  ('digital_card', 'Birthday Sparkle Card', 'A beautiful animated birthday card with sparkles', 2.99, 'USD', NULL, 1, true, true),
  ('confetti_effect', 'Gold Confetti Blast', 'Stunning gold confetti animation for the celebrant', 4.99, 'USD', NULL, 2, true, true),
  ('wall_highlight', 'Birthday Wall Highlight', 'Feature a photo at the top of the birthday wall', 3.99, 'USD', NULL, 3, true, false),
  ('celebrant_badge', 'VIP Birthday Badge', 'Special VIP badge for 24 hours', 5.99, 'USD', NULL, 4, true, false),
  ('featured_message', 'Featured Message Spotlight', 'Pin your message at the top of the room', 4.99, 'USD', NULL, 5, true, false);

