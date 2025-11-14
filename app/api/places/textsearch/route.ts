import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Try server-side env var first (more secure), then fallback to public
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    // Log environment check for debugging (without exposing the key)
    console.log('Google Places API Key check:', {
      hasServerKey: !!process.env.GOOGLE_PLACES_API_KEY,
      hasPublicKey: !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      keyLength: apiKey ? apiKey.length : 0
    });
    
    if (!apiKey || apiKey === 'your_google_places_api_key_here' || apiKey.includes('your_')) {
      console.warn('Google Places API key not configured. Returning empty results to allow fallback to free APIs.');
      // Return empty results instead of error - this allows frontend to use free fallback APIs
      return NextResponse.json(
        { 
          status: 'ZERO_RESULTS',
          results: []
        },
        { status: 200 }
      );
    }

    // Build Google Places API URL for text search
    const params = new URLSearchParams({
      query: query,
      key: apiKey
    });

    const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`;

    // Proxy the request to Google Places API
    const response = await fetch(googlePlacesUrl);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Google Places API error', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the response
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Places API proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch places', message: errorMessage },
      { status: 500 }
    );
  }
}

