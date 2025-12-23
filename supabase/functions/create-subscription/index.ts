// DocAutofill Stripe Subscription Edge Function
// Handles subscription creation and payment processing

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { planId, paymentMethodId } = await req.json();

        if (!planId || !paymentMethodId) {
            throw new Error('Plan ID and payment method ID are required');
        }

        // Get environment variables
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!stripeSecretKey || !serviceRoleKey || !supabaseUrl) {
            throw new Error('Missing required environment variables');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Authorization required');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;
        const userEmail = userData.email;

        // Map plan IDs to Stripe price IDs and amounts
        const planMapping = {
            'free': {
                stripePriceId: null,
                amount: 0,
                interval: 'month',
                limits: { monthlyForms: 5 }
            },
            'premium': {
                stripePriceId: 'price_premium_monthly', // Replace with actual Stripe price ID
                amount: 499,
                interval: 'month',
                limits: { monthlyForms: -1 }
            },
            'family': {
                stripePriceId: 'price_family_monthly', // Replace with actual Stripe price ID
                amount: 999,
                interval: 'month',
                limits: { monthlyForms: -1, familyMembers: 6 }
            }
        };

        const selectedPlan = planMapping[planId];
        if (!selectedPlan) {
            throw new Error('Invalid plan ID');
        }

        // Handle free plan (no Stripe processing needed)
        if (planId === 'free') {
            const subscriptionData = {
                user_id: userId,
                plan_id: planId,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const insertResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(subscriptionData)
            });

            if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                throw new Error(`Failed to create subscription: ${errorText}`);
            }

            const subscription = await insertResponse.json();

            return new Response(JSON.stringify({
                data: {
                    subscription: subscription[0],
                    message: 'Free subscription activated successfully'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // For paid plans, create Stripe customer and subscription
        let customerId;

        // Check if customer already exists
        const customerSearchResponse = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(userEmail)}`, {
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`
            }
        });

        if (customerSearchResponse.ok) {
            const customers = await customerSearchResponse.json();
            if (customers.data.length > 0) {
                customerId = customers.data[0].id;
            }
        }

        // Create new customer if doesn't exist
        if (!customerId) {
            const customerParams = new URLSearchParams();
            customerParams.append('email', userEmail);
            customerParams.append('metadata[user_id]', userId);

            const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${stripeSecretKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: customerParams.toString()
            });

            if (!customerResponse.ok) {
                const errorText = await customerResponse.text();
                throw new Error(`Failed to create Stripe customer: ${errorText}`);
            }

            const customer = await customerResponse.json();
            customerId = customer.id;
        }

        // Attach payment method to customer
        const attachParams = new URLSearchParams();
        attachParams.append('customer', customerId);
        attachParams.append('payment_method', paymentMethodId);

        const attachResponse = await fetch('https://api.stripe.com/v1/payment_methods/' + paymentMethodId + '/attach', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: attachParams.toString()
        });

        if (!attachResponse.ok) {
            const errorText = await attachResponse.text();
            throw new Error(`Failed to attach payment method: ${errorText}`);
        }

        // Set as default payment method
        const setDefaultParams = new URLSearchParams();
        setDefaultParams.append('customer', customerId);
        setDefaultParams.append('invoice_settings[default_payment_method]', paymentMethodId);

        await fetch('https://api.stripe.com/v1/customers/' + customerId, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: setDefaultParams.toString()
        });

        // Create subscription
        const subscriptionParams = new URLSearchParams();
        subscriptionParams.append('customer', customerId);
        subscriptionParams.append('items[0][price]', selectedPlan.stripePriceId);
        subscriptionParams.append('payment_behavior', 'default_incomplete');
        subscriptionParams.append('payment_settings[save_default_payment_method]', 'on_subscription');
        subscriptionParams.append('expand[]', 'latest_invoice.payment_intent');

        const subscriptionResponse = await fetch('https://api.stripe.com/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: subscriptionParams.toString()
        });

        if (!subscriptionResponse.ok) {
            const errorText = await subscriptionResponse.text();
            throw new Error(`Failed to create subscription: ${errorText}`);
        }

        const subscription = await subscriptionResponse.json();

        // Save subscription to database
        const subscriptionData = {
            user_id: userId,
            plan_id: planId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(subscriptionData)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Failed to save subscription: ${errorText}`);
        }

        const savedSubscription = await insertResponse.json();

        return new Response(JSON.stringify({
            data: {
                subscription: savedSubscription[0],
                stripeSubscription: subscription,
                clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
                message: 'Subscription created successfully'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Subscription creation error:', error);

        const errorResponse = {
            error: {
                code: 'SUBSCRIPTION_CREATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
