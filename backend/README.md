# Tap & Merge Game Backend

This is the backend service for the Tap & Merge game that handles Stripe payments securely.

## Setup Instructions

1. **Get Stripe API Keys**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Get your Publishable Key and Secret Key from Developers > API Keys

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the values with your actual keys:
     ```
     STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
     STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret (optional for now)
     FRONTEND_URL=https://your-username.github.io/your-repo-name
     ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Locally**
   ```bash
   npm start
   ```

## Deploying to Render

1. **Create a Render Account**
   - Go to [Render](https://render.com/) and sign up

2. **Connect Your GitHub Repository**
   - In Render Dashboard, click "New Web Service"
   - Connect your GitHub account
   - Select your repository

3. **Configure the Service**
   - Name: `tap-merge-game-backend`
   - Environment: `Node`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

4. **Add Environment Variables**
   - In the "Advanced" section, add your environment variables:
     - `STRIPE_SECRET_KEY` = your actual secret key
     - `FRONTEND_URL` = your GitHub Pages URL

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your app

## API Endpoints

- `POST /api/create-checkout-session` - Create a Stripe checkout session
- `GET /api/verify-payment/:sessionId` - Verify payment status
- `POST /webhook` - Stripe webhook endpoint (for payment events)

## Testing

You can test the backend locally by:
1. Running `npm start`
2. Using a tool like Postman or curl to make requests to `http://localhost:3000/api/create-checkout-session`

Example request:
```json
{
  "productIndex": 0,
  "transactionData": {
    "userId": "user123",
    "timestamp": "2023-01-01T00:00:00Z"
  }
}
```