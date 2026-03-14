-- ============================================
-- HABLA CON BUDA — Database Schema
-- Execute this SQL in Supabase SQL Editor
-- ============================================

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  user_phone TEXT PRIMARY KEY,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  total_messages INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  is_vip BOOLEAN DEFAULT FALSE,
  message_count_today INTEGER DEFAULT 0,
  last_message_date DATE DEFAULT CURRENT_DATE
);

-- Table: messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_phone TEXT NOT NULL REFERENCES users(user_phone) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  buda_response TEXT NOT NULL,
  conversation_id TEXT NOT NULL
);

-- Table: user_summaries
CREATE TABLE IF NOT EXISTS user_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_phone TEXT UNIQUE NOT NULL REFERENCES users(user_phone) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: premium_users
CREATE TABLE IF NOT EXISTS premium_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_phone TEXT UNIQUE NOT NULL REFERENCES users(user_phone) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: premium_tokens
CREATE TABLE IF NOT EXISTS premium_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_phone TEXT NOT NULL REFERENCES users(user_phone) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_user_phone ON messages(user_phone);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_premium_tokens_token ON premium_tokens(token);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);
CREATE INDEX IF NOT EXISTS idx_users_is_premium ON users(is_premium);
CREATE INDEX IF NOT EXISTS idx_users_is_vip ON users(is_vip);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only allow access via service_role key (backend only)
-- No public access policies needed since all access is from the backend
CREATE POLICY "Service role access" ON users FOR ALL USING (true);
CREATE POLICY "Service role access" ON messages FOR ALL USING (true);
CREATE POLICY "Service role access" ON user_summaries FOR ALL USING (true);
CREATE POLICY "Service role access" ON premium_users FOR ALL USING (true);
CREATE POLICY "Service role access" ON premium_tokens FOR ALL USING (true);
