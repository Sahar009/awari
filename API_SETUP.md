# API Setup Guide for Location Services

This guide explains how to set up the location APIs used for address autocomplete and city selection.

## Overview

The location service uses **Google Places API as the primary service**, with FREE fallback mechanisms:
- **Google Places API** (PRIMARY - Recommended) - **FREE: $200 credit/month**
- **Nominatim (OpenStreetMap)** (FREE FALLBACK - **NO API KEY REQUIRED!**) ⭐
- **Mapbox Geocoding API** (backup - optional)
- **AddressData.ng API** (backup - optional)
- **Geoapify API** (backup - optional)
- **Fallback data** (always available, no API key needed)

**Note:** The system works **completely FREE** using Nominatim (OpenStreetMap) as a fallback when Google Places API key is not configured. No API keys are required for basic functionality!

---

## Google Places API Setup (PRIMARY - Recommended)

Google Places API is the **primary and recommended** service for location data.

### Steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create Project or Select Existing**
   - Create a new project or select an existing one

3. **Enable Places API**
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click "Enable"

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

5. **Restrict the Key (Recommended)**
   - Click on the API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "Places API"
   - Save

6. **Add to Environment Variables**

   **For Local Development:**
   - Create or edit `.env.local` in the `frontend` directory:
     ```env
     GOOGLE_PLACES_API_KEY=your_actual_key_here
     # OR (less secure, but works)
     NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_actual_key_here
     ```
   - Restart your dev server after adding

   **For Vercel Deployment (Production):**
   
   ⚠️ **IMPORTANT**: You must add the API key to Vercel's environment variables for production!
   
   1. Go to your Vercel project dashboard: https://vercel.com/dashboard
   2. Select your project (e.g., `awari`)
   3. Go to **Settings** → **Environment Variables**
   4. Add a new environment variable:
      - **Name**: `GOOGLE_PLACES_API_KEY` (recommended, server-side only)
      - **OR**: `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` (less secure, exposed to client)
      - **Value**: Your Google Places API key
      - **Environment**: Select all (Production, Preview, Development)
   5. Click **Save**
   6. **Redeploy** your application for the changes to take effect:
      - Go to **Deployments** tab
      - Click the **⋯** menu on the latest deployment
      - Click **Redeploy**
   
   **Note**: 
   - `GOOGLE_PLACES_API_KEY` (without `NEXT_PUBLIC_`) is more secure as it's only available server-side
   - The API routes (`/api/places/*`) check for both variables, preferring the server-side one
   - After adding environment variables, you MUST redeploy for them to take effect

### Google Places Pricing:
- ✅ **$200 free credit monthly** (covers ~40,000 requests)
- ⚠️ Requires credit card (but won't charge unless you exceed free tier)

---

## AddressData.ng Setup (Optional)

1. **Sign up**: https://www.addressdata.ng/
2. **Get API keys** from dashboard
3. **Add to `.env.local`**:
   ```
   NEXT_PUBLIC_ADDRESS_DATA_PUBLIC_KEY=your_public_key
   NEXT_PUBLIC_ADDRESS_DATA_PRIVATE_KEY=your_private_key
   ```

---

## Environment Variables File

Create `frontend/.env.local`:

```env
# Google Places API (PRIMARY - Recommended)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_key_here

# Mapbox (Optional Backup)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here

# AddressData.ng (Optional Backup)
NEXT_PUBLIC_ADDRESS_DATA_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_ADDRESS_DATA_PRIVATE_KEY=your_private_key

# Geoapify (Optional Backup)
NEXT_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_key_here
```

**Important:** 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Restart your dev server after adding environment variables

---

## How It Works

1. **With Google Places API**: The system prioritizes Google Places API first, then falls back to FREE Nominatim API if needed
2. **Without Google Places API Key**: The system automatically uses **FREE Nominatim (OpenStreetMap) API** - no configuration needed!
3. **Error Handling**: Invalid or missing API keys are silently ignored - system automatically falls back to free APIs
4. **Priority Order**: 
   - **Address Suggestions**: Google Places → **Nominatim (FREE)** → AddressData.ng → Geoapify → Mapbox → Fallback data
   - **City Lists**: Google Places → **Nominatim (FREE)** → AddressData.ng → Mapbox → Fallback data

**⭐ FREE Option**: Nominatim (OpenStreetMap) works immediately without any API key configuration!

---

## Troubleshooting

### "Google Places API key not configured" Error (Vercel/Production)
- **Cause**: Environment variable not set in Vercel
- **Fix**: 
  1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
  2. Add `GOOGLE_PLACES_API_KEY` with your API key value
  3. Select all environments (Production, Preview, Development)
  4. **Redeploy** your application (important!)
- **Verify**: Check Vercel deployment logs - you should see "Google Places API Key check" logs showing `hasServerKey: true`

### Mapbox 401 Error
- **Cause**: Invalid or placeholder token
- **Fix**: Get a real token from https://account.mapbox.com/access-tokens/
- **Note**: The code now automatically skips Mapbox if token is invalid

### No Address Suggestions
- **Check**: Browser console for API errors
- **Solution**: The system will use fallback data automatically
- **Verify**: Environment variables are loaded (restart dev server for local, redeploy for Vercel)

---

## Recommendation

**For best results, use Google Places API:**
- ✅ Primary service - best quality results
- ✅ $200 free credit monthly (covers most use cases)
- ✅ Excellent coverage for Nigerian addresses
- ✅ Most accurate location data

**The system prioritizes Google Places API:**
1. First tries Google Places API (if configured)
2. Falls back to other APIs if Google Places fails
3. Uses comprehensive fallback data if all APIs fail

**You can use the system completely FREE** - it will automatically use Nominatim (OpenStreetMap) API for real-time address suggestions when Google Places API key is not configured. No setup required!

**Free Tier Options:**
- ✅ **Nominatim (OpenStreetMap)**: Completely free, no API key needed, works immediately
- ✅ **Google Places API**: $200 free credit/month (requires API key setup)
- ✅ **Fallback data**: Always available (60+ Lagos cities, etc.)

The system will automatically use the best available option!

