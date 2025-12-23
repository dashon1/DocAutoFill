# DocAutofill - Real Supabase Integration Setup

## Required Supabase Credentials
To set up the real DocAutofill backend, we need:

1. **Supabase Project URL** (format: https://[project-id].supabase.co)
2. **Supabase Anon Key** (public key for frontend)
3. **Supabase Service Role Key** (for edge functions and admin operations)

## Setup Steps

### 1. Database Schema
The following tables need to be created:
- `profiles` - User profile information
- `personal_data` - Encrypted personal information
- `license_info` - Driver's license details
- `vehicle_info` - Vehicle registration and details
- `insurance_info` - Insurance policy information
- `processed_forms` - History of processed DMV forms

### 2. Authentication Setup
- Enable email authentication in Supabase dashboard
- Configure email templates for signup/password reset
- Set up redirect URLs for the application

### 3. Row Level Security (RLS)
- Enable RLS on all tables
- Create policies for user data access
- Ensure users can only access their own information

### 4. Edge Functions (Optional)
- Form processing functions
- Document OCR processing
- Data validation functions

## Environment Variables
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Frontend Integration
Remove all demo/mock code and implement real Supabase client with:
- Real authentication (sign up, sign in, sign out)
- Real database operations
- Proper error handling
- User data management

## Next Steps
1. Get Supabase credentials
2. Create database schema
3. Set up authentication
4. Remove demo code
5. Test real integration