# Backend Deployment Guide

This guide explains how to deploy your Tap & Merge game backend to Render.

## Prerequisites

1. A Render account (https://render.com)
2. A Stripe account (https://stripe.com)
3. Your GitHub repository with the backend code

## Step-by-Step Deployment

### 1. Prepare Your Code

Make sure your backend code is in the `backend` directory of your repository:
```
your-repo/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── README.md
├── index.html
├── script.js
├── stripe.js
└── ...
```

### 2. Get Your Stripe Keys

1. Go to your Stripe Dashboard: https://dashboard.stripe.com/
2. Navigate to Developers > API Keys
3. Copy your Publishable Key (starts with `pk_`)
4. Copy your Secret Key (starts with `sk_`)

### 3. Update Frontend Configuration

In your `stripe.js` file, update the backend URL to point to your Render service:

```javascript
// Change this line in stripe.js constructor:
this.backendUrl = 'https://your-render-service.onrender.com'; // Get this after deployment
```

### 4. Deploy to Render

1. Go to https://dashboard.render.com
2. Click "New+" and select "Web Service"
3. Connect your GitHub account if you haven't already
4. Select your repository
5. Fill in the form:
   - Name: `tap-merge-game-backend`
   - Environment: `Node`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Click "Advanced" and add environment variables:
   - `STRIPE_SECRET_KEY` = your Stripe secret key
   - `FRONTEND_URL` = your GitHub Pages URL (e.g., https://username.github.io/repository-name)
7. Click "Create Web Service"

### 5. Update Your Frontend

After deployment, Render will provide you with a URL for your service. Update your `stripe.js` file with this URL:

```javascript
// In stripe.js constructor:
this.backendUrl = 'https://your-service-name.onrender.com';
```

### 6. Configure Stripe Webhook (Optional but Recommended)

1. In your Render dashboard, copy your service URL
2. Go to your Stripe Dashboard > Developers > Webhooks
3. Click "Add endpoint"
4. Enter your endpoint URL: `https://your-service-name.onrender.com/webhook`
5. Select events to listen to: `checkout.session.completed`
6. Click "Add endpoint"
7. Copy the webhook signing secret
8. Add it as an environment variable in Render:
   - `STRIPE_WEBHOOK_SECRET` = your webhook signing secret

### 7. Update GitHub Pages

Make sure your GitHub Pages is configured to work with your new backend:

1. In your repository settings, go to Pages
2. Ensure it's set to deploy from GitHub Actions
3. Your frontend should now communicate with your Render backend

## Render Free Tier Limits

- **Web Services**: 512 MB RAM
- **Sleep**: Services sleep after 15 minutes of inactivity
- **Bandwidth**: 100 GB/month
- **Build Minutes**: 500 minutes/month

## Testing Your Deployment

1. Visit your Render service URL: `https://your-service-name.onrender.com`
2. You should see: `{"message":"Tap & Merge Game Backend is running!","timestamp":"..."}`
3. Test the checkout flow in your game

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your `FRONTEND_URL` environment variable is set correctly in Render
2. **Stripe Errors**: Verify your Stripe keys are correct
3. **Service Sleeping**: Render free tier services sleep after 15 minutes of inactivity
4. **Environment Variables**: Check that all required environment variables are set in Render

### Logs

You can view your application logs in the Render dashboard:
1. Go to your service page
2. Click "Logs" tab
3. View real-time logs or search historical logs

## Security Considerations

1. Never expose your Stripe Secret Key in frontend code
2. Always use environment variables for sensitive data
3. Use HTTPS for all communications
4. Implement proper webhook verification
5. Regularly rotate your API keys