# Stripe Payment Setup Guide

## Issue: "Payment gateway not configured" Error

If you're seeing the error: **"Payment gateway not configured. Please set STRIPE_SECRET_KEY in environment variables"**, follow these steps:

## Step 1: Verify Stripe Key on Render

1. Go to your Render Dashboard: https://dashboard.render.com
2. Navigate to your **backend service** (hotelease-backend)
3. Click on **Environment** tab
4. Look for `STRIPE_SECRET_KEY` in the environment variables list

## Step 2: Add/Update STRIPE_SECRET_KEY

If the key is missing or incorrect:

1. In the Render Dashboard, go to your backend service
2. Click **Environment** tab
3. Click **Add Environment Variable** or edit the existing one
4. Set:
   - **Key:** `STRIPE_SECRET_KEY`
   - **Value:** Your Stripe secret key (starts with `sk_test_` for test mode or `sk_live_` for live mode)
5. Click **Save Changes**

## Step 3: Restart the Backend Service

**Important:** After adding/updating environment variables, you MUST restart the service:

1. In Render Dashboard, go to your backend service
2. Click **Manual Deploy** or use the **Restart** button
3. Wait for the deployment to complete

## Step 4: Verify the Key is Loaded

After restarting, check the backend logs in Render:

1. Go to your backend service in Render Dashboard
2. Click **Logs** tab
3. Look for these messages on startup:
   ```
   🔐 Payment Gateway Configuration:
   ✅ STRIPE_SECRET_KEY found (Test key: sk_test_51...)
   ✅ Stripe initialized successfully
   ```

If you see:
```
⚠️  STRIPE_SECRET_KEY not set
```
Then the key is not being loaded correctly.

## Step 5: Common Issues and Fixes

### Issue 1: Key Not Found After Setting
- **Solution:** Make sure you saved the environment variable and restarted the service
- **Check:** The key name must be exactly `STRIPE_SECRET_KEY` (case-sensitive)

### Issue 2: Wrong Key Format
- **Solution:** Stripe secret keys must start with:
  - `sk_test_` for test mode
  - `sk_live_` for live mode
- **Check:** Verify the key starts with one of these prefixes

### Issue 3: Key Set But Still Not Working
- **Solution:** 
  1. Double-check the key is correct (no extra spaces, no quotes)
  2. Restart the backend service
  3. Check the logs for any error messages
  4. Try redeploying the service

## Step 6: Test the Payment

After setting up the key:

1. Try to make a payment on your frontend
2. Use Stripe test card: `4242 4242 4242 4242`
3. Any expiry date in the future
4. Any 3-digit CVC

## Getting Your Stripe Keys

If you don't have Stripe keys yet:

1. Go to https://dashboard.stripe.com
2. Sign up or log in
3. Go to **Developers** > **API keys**
4. Copy your **Secret key** (starts with `sk_test_` for test mode)
5. Copy your **Publishable key** (starts with `pk_test_` for test mode)

## Environment Variables Needed

For the backend (Render):
- `STRIPE_SECRET_KEY` - Your Stripe secret key (required)

For the frontend (Render or local):
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (required)

## Still Having Issues?

1. Check the backend logs in Render for detailed error messages
2. Verify the key format is correct
3. Make sure you restarted the service after adding the key
4. Check that the key doesn't have any extra spaces or characters
5. Try redeploying the entire service

## Debug Information

The backend now logs detailed information about Stripe configuration:
- On startup, it shows if the key is found
- When payment fails, it logs what went wrong
- Check the Render logs for these messages

