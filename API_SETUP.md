# API Setup Guide for Location Services

This guide explains how to set up the location APIs used for address autocomplete and city selection.

## Overview

The location service uses **Google Places API as the primary service**, with fallback mechanisms:
- **Google Places API** (PRIMARY - Recommended) - **FREE: $200 credit/month**
- **Mapbox Geocoding API** (backup - optional)
- **AddressData.ng API** (backup - optional)
- **Fallback data** (always available, no API key needed)

**Note:** The system works without any API keys using fallback data. Google Places API is recommended for best results.

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
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_actual_key_here
     ```

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

1. **With Google Places API**: The system prioritizes Google Places API first, then falls back to other APIs if needed
2. **Without API Keys**: The system uses comprehensive fallback data (60+ Lagos cities, etc.)
3. **Error Handling**: Invalid or missing API keys are silently ignored - no errors shown to users
4. **Priority Order**: Google Places → AddressData.ng → Geoapify → Mapbox → Fallback data

---

## Troubleshooting

### Mapbox 401 Error
- **Cause**: Invalid or placeholder token
- **Fix**: Get a real token from https://account.mapbox.com/access-tokens/
- **Note**: The code now automatically skips Mapbox if token is invalid

### No Address Suggestions
- **Check**: Browser console for API errors
- **Solution**: The system will use fallback data automatically
- **Verify**: Environment variables are loaded (restart dev server)

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

**You can use the system without any API keys** - it will use the comprehensive fallback data (60+ Lagos cities, etc.), but Google Places API provides the best user experience with real-time address suggestions.

