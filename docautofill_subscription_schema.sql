# Additional Database Schema for DocAutofill Subscriptions & Payments

-- Subscriptions table for managing user plans
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table for tracking transactions
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  payment_method_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User usage tracking for form limits
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  forms_processed INTEGER DEFAULT 0,
  forms_limit INTEGER DEFAULT 5,
  period_start TIMESTAMPTZ DEFAULT NOW(),
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for user usage
CREATE POLICY "Users can view own usage" ON user_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON user_usage FOR UPDATE USING (auth.uid() = user_id);

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE user_usage 
  SET forms_processed = 0,
      period_start = DATE_TRUNC('month', NOW()),
      period_end = DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
      updated_at = NOW()
  WHERE period_end < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can process more forms
CREATE OR REPLACE FUNCTION can_process_form(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage RECORD;
  subscription_record RECORD;
BEGIN
  -- Get current usage
  SELECT * INTO current_usage
  FROM user_usage
  WHERE user_id = user_uuid
    AND period_start <= NOW()
    AND period_end > NOW();
  
  -- Get active subscription
  SELECT * INTO subscription_record
  FROM subscriptions
  WHERE user_id = user_uuid
    AND status = 'active'
    AND current_period_end > NOW();
  
  -- If no usage record exists, create one
  IF current_usage IS NULL THEN
    INSERT INTO user_usage (user_id, forms_processed, period_start, period_end)
    VALUES (user_uuid, 0, DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month');
    
    current_usage := ROW(0, 0, DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month');
  END IF;
  
  -- Check if user has subscription with unlimited forms
  IF subscription_record.plan_id IN ('premium', 'family') THEN
    RETURN TRUE;
  END IF;
  
  -- For free plan, check if under limit
  RETURN current_usage.forms_processed < current_usage.forms_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to increment form usage
CREATE OR REPLACE FUNCTION increment_form_usage(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_usage (user_id, forms_processed, period_start, period_end)
  VALUES (user_uuid, 1, DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month')
  ON CONFLICT (user_id, period_start) 
  DO UPDATE SET 
    forms_processed = user_usage.forms_processed + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX idx_user_usage_period ON user_usage(period_start, period_end);
