import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get('input');
    const state = searchParams.get('state');
    
    if (!input) {
      return NextResponse.json(
        { error: 'Input parameter is required' },
        { status: 400 }
      );
    }

    // Try server-side env var first (more secure), then fallback to public
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey || apiKey === 'your_google_places_api_key_here' || apiKey.includes('your_')) {
      console.error('Google Places API key not configured');
      return NextResponse.json(
        { 
          error: 'Google Places API key not configured',
          status: 'ERROR',
          predictions: []
        },
        { status: 500 }
      );
    }

    // Build Google Places API URL
    const params = new URLSearchParams({
      input: input,
      components: 'country:ng',
      key: apiKey,
      types: 'address'
    });

    const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;

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
  } catch (error: any) {
    console.error('Places API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places', message: error.message },
      { status: 500 }
    );
  }
}

