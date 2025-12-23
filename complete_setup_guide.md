# DocAutofill Complete Production Setup Guide

## Overview

This guide will walk you through setting up the complete DocAutofill production infrastructure, including:

- Supabase database with full schema
- Row Level Security (RLS) policies
- Stripe payment processing
- File storage for document uploads
- Edge functions for backend processing
- Frontend integration with real authentication

## Prerequisites

1. **Supabase Account**: Create a project at https://supabase.com
2. **Stripe Account**: Set up at https://stripe.com
3. **Domain**: For production deployment

## Step 1: Supabase Project Setup

### 1.1 Get Supabase Credentials

Navigate to your Supabase project dashboard and get:

1. **Project URL**: `https://[your-project-id].supabase.co`
2. **Anon Key**: Found in Settings > API
3. **Service Role Key**: Found in Settings > API (keep secret)

### 1.2 Database Schema Setup

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Run the main schema first
\i /workspace/docautofill_database_schema.sql

-- Then run the subscription schema
\i /workspace/docautofill_subscription_schema.sql
```

### 1.3 Storage Bucket Setup

Create a bucket for document uploads:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `dmv-documents`
3. Set it to public for easier access
4. Note the bucket name for later

### 1.4 Configure RLS Policies

The schema includes RLS policies, but verify they're active:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'personal_data', 'license_info', 'vehicle_info', 'insurance_info', 'processed_forms', 'subscriptions', 'payments', 'user_usage');

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_data ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)
```

## Step 2: Stripe Integration Setup

### 2.1 Create Stripe Products

In your Stripe dashboard, create products for your plans:

1. **Free Plan**: $0/month (no Stripe product needed)
2. **Premium Plan**: $4.99/month
3. **Family Plan**: $9.99/month

### 2.2 Get Stripe API Keys

1. Go to Developers > API Keys in Stripe dashboard
2. Copy your **Publishable Key** and **Secret Key**
3. Keep the Secret Key secure

### 2.3 Configure Webhooks

Set up webhooks to handle subscription events:

1. Go to Developers > Webhooks in Stripe
2. Add endpoint: `https://[your-supabase-url]/functions/v1/stripe-webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## Step 3: Edge Functions Deployment

### 3.1 Deploy Document Processor

```bash
# Deploy the DMV form processor
supabase functions deploy dmv-form-processor

# Set environment variables
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set SUPABASE_URL=your_supabase_url
```

### 3.2 Deploy Subscription Handler

```bash
# Deploy the subscription processor
supabase functions deploy create-subscription

# Set the same environment variables
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set SUPABASE_URL=your_supabase_url
```

### 3.3 Deploy Stripe Webhook Handler

```bash
# Deploy webhook handler
supabase functions deploy stripe-webhook

# Set environment variables (same as above)
```

## Step 4: Frontend Configuration

### 4.1 Update Environment Variables

Create/update `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4.2 Update Supabase Client Configuration

Update `/src/lib/supabase.ts`:

```typescript
// Remove demo mode and use real Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isDemoMode = false
```

### 4.3 Update Pricing Component

Update the pricing section to use real Stripe integration:

```typescript
// Add Stripe integration to pricing plans
import { loadStripe } from '@stripe/stripe-js'

const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

// Handle subscription creation
const handleSubscribe = async (planId: string) => {
  const { data, error } = await supabase.functions.invoke('create-subscription', {
    body: { planId, paymentMethodId: paymentMethod.id }
  })
  
  if (error) throw error
  
  if (data.clientSecret) {
    const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret)
    if (stripeError) throw stripeError
  }
}
```

## Step 5: Testing the Integration

### 5.1 Test Authentication

1. Create a test account
2. Verify email confirmation works
3. Test login/logout functionality

### 5.2 Test Subscription Flow

1. Navigate to pricing page
2. Select Premium or Family plan
3. Complete Stripe checkout with test card: `4242424242424242`
4. Verify subscription appears in user dashboard

### 5.3 Test Document Processing

1. Upload a test DMV form
2. Verify edge function processes it
3. Check database for processed form record

## Step 6: Production Deployment

### 6.1 Build and Deploy Frontend

```bash
# Build the application
npm run build

# Deploy to your hosting provider
# (Vercel, Netlify, etc.)
```

### 6.2 Configure Custom Domain

1. Point your domain to the hosting provider
2. Set up SSL certificates
3. Update any CORS settings if needed

## Environment Variables Checklist

Ensure these are set in production:

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY` (in Supabase secrets)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (in Supabase secrets)
- [ ] `SUPABASE_URL` (in Supabase secrets)

## Security Considerations

1. **Never expose Service Role Key** in frontend
2. **Use HTTPS** for all production traffic
3. **Validate all inputs** in edge functions
4. **Monitor usage** to prevent abuse
5. **Regular backups** of production data

## Monitoring and Maintenance

1. **Set up logging** for edge functions
2. **Monitor Stripe webhooks** for failed events
3. **Track subscription metrics** for business insights
4. **Regular security audits** of RLS policies
5. **Database maintenance** and optimization

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Ensure policies allow both `anon` and `service_role`
2. **Stripe Webhook Failures**: Verify webhook URL is accessible
3. **Edge Function Timeouts**: Optimize processing logic
4. **CORS Issues**: Check allowed origins in Supabase

### Support Resources

- Supabase Documentation: https://supabase.com/docs
- Stripe Documentation: https://stripe.com/docs
- React Documentation: https://react.dev

## File Structure Reference

```
/workspace/docautofill-dmv/
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Real Supabase client
│   ├── components/
│   │   ├── PricingSection.tsx   # Stripe integration
│   │   └── ...                  # Other components
│   └── hooks/
│       └── useAuth.tsx          # Real authentication
├── supabase/
│   └── functions/
│       ├── dmv-form-processor/  # Document processing
│       ├── create-subscription/ # Payment handling
│       └── stripe-webhook/      # Webhook processing
├── docautofill_database_schema.sql
├── docautofill_subscription_schema.sql
└── complete_setup_guide.md
```

This setup will transform DocAutofill from a demo into a fully functional, production-ready SaaS application with real user authentication, payment processing, and document management capabilities.
