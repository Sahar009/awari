// API Configuration for Live Location Services
// Add your actual API keys here or use environment variables

export interface ApiConfig {
  googlePlacesApiKey?: string;
  mapboxAccessToken?: string;
  addressDataPublicKey?: string;
  addressDataPrivateKey?: string;
  geoapifyApiKey?: string;
}

// Default configuration - replace with your actual API keys
export const defaultApiConfig: ApiConfig = {
  // Google Places API - Get from: https://console.cloud.google.com/apis/credentials
  googlePlacesApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || 'your_google_places_api_key_here',
  
  // Mapbox Access Token - Get from: https://account.mapbox.com/access-tokens/
  mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'your_mapbox_access_token_here',
  
  // AddressData.ng API Keys - Get from: https://addressdata.seapane.com/
  addressDataPublicKey: process.env.NEXT_PUBLIC_ADDRESS_DATA_PUBLIC_KEY || 'your_address_data_public_key_here',
  addressDataPrivateKey: process.env.NEXT_PUBLIC_ADDRESS_DATA_PRIVATE_KEY || 'your_address_data_private_key_here',
  
  // Geoapify API Key - Get from: https://www.geoapify.com/
  geoapifyApiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || 'your_geoapify_api_key_here'
};

// Instructions for getting API keys
export const API_SETUP_INSTRUCTIONS = {
  googlePlaces: {
    name: 'Google Places API',
    url: 'https://console.cloud.google.com/apis/credentials',
    steps: [
      '1. Go to Google Cloud Console',
      '2. Create a new project or select existing',
      '3. Enable Places API',
      '4. Create credentials (API Key)',
      '5. Restrict the key to Places API'
    ],
    pricing: 'Free tier: $200 credit monthly'
  },
  mapbox: {
    name: 'Mapbox',
    url: 'https://account.mapbox.com/access-tokens/',
    steps: [
      '1. Sign up for Mapbox account',
      '2. Go to Access Tokens page',
      '3. Create a new public token',
      '4. Copy the access token'
    ],
    pricing: 'Free tier: 50,000 requests/month'
  },
  addressData: {
    name: 'AddressData.ng',
    url: 'https://addressdata.seapane.com/',
    steps: [
      '1. Sign up for AddressData.ng account',
      '2. Get your Public and Private keys',
      '3. Add keys to configuration'
    ],
    pricing: 'Free tier: 500 lookups/day, then ₦20 per lookup'
  },
  geoapify: {
    name: 'Geoapify',
    url: 'https://www.geoapify.com/',
    steps: [
      '1. Sign up for Geoapify account',
      '2. Get your API key from dashboard',
      '3. Add key to configuration'
    ],
    pricing: 'Free tier: 3,000 requests/day'
  }
};
