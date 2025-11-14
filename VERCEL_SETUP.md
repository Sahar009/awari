# Vercel Deployment Setup Guide

This guide explains how to configure environment variables for your Vercel deployment.

## Quick Setup for Google Places API

### Step 1: Get Your Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Enable **Places API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click "Enable"
4. Create API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

### Step 2: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project (e.g., `awari`)

2. **Navigate to Environment Variables**
   - Click on **Settings** tab
   - Click on **Environment Variables** in the sidebar

3. **Add the API Key**
   - Click **Add New**
   - **Key**: `GOOGLE_PLACES_API_KEY`
   - **Value**: Paste your Google Places API key
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**

4. **Redeploy Your Application**
   - Go to **Deployments** tab
   - Find your latest deployment
   - Click the **⋯** (three dots) menu
   - Click **Redeploy**
   - Wait for deployment to complete

### Step 3: Verify It Works

1. After redeployment, test the address autocomplete feature
2. Check Vercel Function Logs:
   - Go to **Deployments** → Select your deployment → **Functions** tab
   - Look for logs showing: `Google Places API Key check: { hasServerKey: true, ... }`

## Environment Variables Reference

### Required for Google Places API

| Variable Name | Description | Required |
|--------------|-------------|----------|
| `GOOGLE_PLACES_API_KEY` | Google Places API key (server-side, more secure) | ✅ Recommended |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Places API key (client-side, less secure) | ⚠️ Alternative |

**Note**: The API routes check for `GOOGLE_PLACES_API_KEY` first, then fall back to `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`.

### Optional Environment Variables

| Variable Name | Description |
|--------------|-------------|
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox access token (backup service) |
| `NEXT_PUBLIC_ADDRESS_DATA_PUBLIC_KEY` | AddressData.ng public key (backup service) |
| `NEXT_PUBLIC_ADDRESS_DATA_PRIVATE_KEY` | AddressData.ng private key (backup service) |
| `NEXT_PUBLIC_GEOAPIFY_API_KEY` | Geoapify API key (backup service) |

## Troubleshooting

### Error: "Google Places API key not configured"

**Symptoms:**
- API returns: `{ "error": "Google Places API key not configured", "status": "ERROR" }`
- Status code: 500

**Solutions:**

1. **Check if variable is set:**
   - Go to Vercel → Settings → Environment Variables
   - Verify `GOOGLE_PLACES_API_KEY` exists and has a value

2. **Check environment selection:**
   - Make sure the variable is enabled for **Production** environment
   - If testing preview deployments, enable for **Preview** too

3. **Redeploy after adding variables:**
   - Environment variables are only loaded during build/deployment
   - You MUST redeploy after adding/updating variables
   - Go to Deployments → Latest → ⋯ → Redeploy

4. **Check deployment logs:**
   - Go to Deployments → Your deployment → Functions
   - Look for logs: `Google Places API Key check:`
   - Should show `hasServerKey: true` if configured correctly

5. **Verify API key format:**
   - Should start with `AIza...` (Google API keys format)
   - Should not contain spaces or quotes
   - Should be the full key from Google Cloud Console

### Environment Variable Not Loading

- **Cause**: Variables added but not redeployed
- **Fix**: Always redeploy after adding/updating environment variables
- **Note**: Vercel caches environment variables at build time

### API Key Restrictions

If your API key has restrictions:
- **HTTP referrer restrictions**: Add your Vercel domain (`*.vercel.app`)
- **API restrictions**: Make sure "Places API" is enabled
- **IP restrictions**: Not recommended for serverless functions (IPs change)

## Best Practices

1. **Use `GOOGLE_PLACES_API_KEY` (server-side)** instead of `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`:
   - More secure (not exposed to client)
   - Better for API rate limiting
   - Recommended by Google

2. **Restrict your API key**:
   - In Google Cloud Console → Credentials → Your API Key
   - Add API restrictions (Places API only)
   - Add application restrictions (HTTP referrers: `*.vercel.app/*`)

3. **Monitor usage**:
   - Set up billing alerts in Google Cloud Console
   - Monitor API usage in Vercel Function logs

4. **Test after deployment**:
   - Always test the address autocomplete feature after redeploying
   - Check Vercel Function logs for any errors

## Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [API Setup Guide](./API_SETUP.md) - For local development setup

