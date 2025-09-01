# Stripe Setup Guide

This guide explains how to set up Stripe for your Tap & Merge game.

## Creating a Stripe Account

1. Go to [Stripe.com](https://stripe.com)
2. Click "Start now" or "Sign in" if you already have an account
3. Complete the registration process
4. Verify your email address
5. Complete the account activation process (may require providing business information)

## Getting Your API Keys

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click on "Developers" in the left sidebar
3. Click on "API keys"
4. You'll see two types of keys:
   - **Publishable key** (starts with `pk_`) - Safe to use in frontend code
   - **Secret key** (starts with `sk_`) - MUST be kept secret, only use in backend

## Test vs Live Modes

Stripe has two modes:
- **Test mode**: Use test cards to simulate payments (no real money)
- **Live mode**: Process real payments (real money)

For development, use Test mode. When you're ready to go live, Stripe will guide you through activating Live mode.

## Test Card Numbers

Use these test card numbers in Test mode:
- **Visa**: 4242 4242 4242 4242
- **Visa (debit)**: 4000 0566 5566 5556
- **Mastercard**: 5555 5555 5555 4444
- **Mastercard (debit)**: 5200 8282 8282 8210
- **Mastercard (prepaid)**: 5105 1051 0510 5100

Expiration: Any future date
CVC: Any 3 digits

## Setting Up Webhooks (Optional but Recommended)

Webhooks allow Stripe to notify your backend when payments are completed:

1. In your Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://your-render-service.onrender.com/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the webhook signing secret and add it to your Render environment variables

## Updating Your Code

### Frontend (stripe.js)
Update the publishable key:
```javascript
this.publishableKey = 'pk_test_your_publishable_key_here'; // Get from Stripe Dashboard
```

### Backend (.env)
Update the secret key:
```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here // Get from Stripe Dashboard
```

## Going Live

When you're ready to process real payments:

1. Complete your Stripe account verification
2. Toggle off "Viewing test data" in your Stripe Dashboard
3. Use your live API keys instead of test keys
4. Update your frontend and backend with live keys
5. Test thoroughly with small amounts first

## Pricing

Stripe charges:
- 2.9% + $0.30 per successful card charge (US)
- No setup fees, no monthly fees
- Payouts to your bank account are free
- Funds are available in 2 days (US)

## Security Best Practices

1. Never expose your secret key in frontend code
2. Always use HTTPS
3. Implement proper webhook verification
4. Regularly rotate your API keys
5. Monitor your Dashboard for suspicious activity