// Live Nigerian Location API Service
// Real-time addresses using Google Places, Mapbox, and AddressData.ng APIs

export interface NigerianState {
  id: string;
  name: string;
  code: string;
  capital: string;
  region: string;
}

export interface NigerianCity {
  id: string;
  name: string;
  state: string;
  lga: string;
  latitude?: number;
  longitude?: number;
}

export interface AddressSuggestion {
  id: string;
  fullAddress: string;
  street: string;
  city: string;
  state: string;
  postCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  placeId?: string; // For Google Places
  confidence?: number;
}

export interface ApiConfig {
  googlePlacesApiKey?: string;
  mapboxAccessToken?: string;
  addressDataPublicKey?: string;
  addressDataPrivateKey?: string;
}

class LiveLocationApiService {
  private config: ApiConfig;
  
  // API Base URLs
  // Use Next.js API routes to proxy Google Places (avoids CORS)
  private readonly GOOGLE_PLACES_BASE_URL = '/api/places';
  private readonly MAPBOX_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  private readonly ADDRESS_DATA_BASE_URL = 'https://api.addressdata.ng/v1';
  private readonly GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode';
  // Nominatim (OpenStreetMap) - FREE, NO API KEY REQUIRED
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

  // Available states (limited to 3 major cities)
  private readonly availableStates: NigerianState[] = [
    { id: '1', name: 'Lagos', code: 'LG', capital: 'Ikeja', region: 'South West' },
    { id: '2', name: 'Oyo', code: 'OY', capital: 'Ibadan', region: 'South West' },
    { id: '3', name: 'Federal Capital Territory', code: 'FCT', capital: 'Abuja', region: 'North Central' }
  ];

  constructor(config: ApiConfig = {}) {
    this.config = config;
  }

  /**
   * Update API configuration
   */
  updateConfig(config: Partial<ApiConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get available states (Lagos, Oyo, FCT)
   */
  async getAllStates(): Promise<NigerianState[]> {
    // Return our 3 available states
    return this.availableStates;
  }

  /**
   * Get cities for a specific state using live APIs
   * Prioritizes Google Places API, with fallbacks
   */
  async getCitiesByState(stateName: string): Promise<string[]> {
    const cities = new Set<string>();

    // Try Google Places first (primary)
    try {
      const googleCities = await this.getCitiesFromGooglePlaces(stateName);
      if (googleCities && googleCities.length > 0) {
        googleCities.forEach(city => cities.add(city));
        // If Google Places returns good results, use them
        const cityArray = Array.from(cities).sort();
        if (cityArray.length >= 5) {
          return cityArray;
        }
      }
    } catch (error) {
      console.warn('Google Places cities API failed:', error);
    }

    // Try other APIs as backup (including FREE Nominatim)
    const backupApiPromises = [
      this.getCitiesFromNominatim(stateName), // FREE - No API key needed!
      this.getCitiesFromAddressData(stateName),
      this.getCitiesFromMapbox(stateName)
    ];

    try {
      const results = await Promise.allSettled(backupApiPromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          result.value.forEach(city => cities.add(city));
        }
      });
    } catch (error) {
      console.warn('Backup city APIs failed:', error);
    }

    // Convert to array and sort
    const cityArray = Array.from(cities).sort();
    
    // If we got results from APIs, return them
    if (cityArray.length > 0) {
      return cityArray;
    }

    // Fallback to comprehensive cities list if APIs fail
    return this.getFallbackCities(stateName);
  }

  /**
   * Get real-time address suggestions using live APIs
   * Prioritizes Google Places API for best results
   */
  async getAddressSuggestions(query: string, city?: string, state?: string): Promise<AddressSuggestion[]> {
    if (!query || query.length < 2) return [];

    const suggestions = new Map<string, AddressSuggestion>();

    // For Google Places, use just the query with Nigeria restriction
    // Google Places works better with minimal query + component restrictions
    const googleQuery = query.trim();
    const googleQueryWithContext = city && state 
      ? `${googleQuery}, ${city}, ${state}, Nigeria`
      : state
        ? `${googleQuery}, ${state}, Nigeria`
        : `${googleQuery}, Nigeria`;

    // Try Google Places first (primary - best quality)
    try {
      console.log('🔍 Searching Google Places with query:', googleQueryWithContext);
      const googleSuggestions = await this.getAddressesFromGooglePlaces(googleQueryWithContext, state);
      console.log('✅ Google Places returned:', googleSuggestions.length, 'suggestions');
      
      if (googleSuggestions && googleSuggestions.length > 0) {
        googleSuggestions.forEach(suggestion => {
          const key = suggestion.fullAddress.toLowerCase();
          suggestions.set(key, suggestion);
        });
        
        // Return Google Places results immediately (they're the best quality)
        if (googleSuggestions.length > 0) {
          return Array.from(suggestions.values())
            .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
            .slice(0, 10);
        }
      }
    } catch (error) {
      console.error('❌ Google Places address API failed:', error);
    }

    // Try backup APIs if Google Places didn't return enough results
    // Include FREE Nominatim API (no key required!)
    const backupQuery = this.buildSearchQuery(query, city, state);
    const backupApiPromises = [
      this.getAddressesFromNominatim(query, city, state), // FREE - No API key needed!
      this.getAddressesFromAddressData(query, city, state),
      this.getAddressesFromGeoapify(backupQuery, state),
      this.getAddressesFromMapbox(backupQuery, state)
    ];

    try {
      const results = await Promise.allSettled(backupApiPromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          result.value.forEach(suggestion => {
            // Use full address as key to avoid duplicates
            const key = suggestion.fullAddress.toLowerCase();
            // Only add if not already present or if confidence is higher
            if (!suggestions.has(key) || (suggestions.get(key)?.confidence || 0) < (suggestion.confidence || 0)) {
              suggestions.set(key, suggestion);
            }
          });
        }
      });
    } catch (error) {
      console.warn('Backup address APIs failed:', error);
    }

    // Convert to array, sort by confidence, and limit results
    return Array.from(suggestions.values())
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, 10); // Limit to top 10 suggestions
  }

  /**
   * Get cities from Google Places API
   * Uses Next.js API route proxy to avoid CORS issues
   */
  private async getCitiesFromGooglePlaces(stateName: string): Promise<string[]> {
    // API key check happens on server side now
    
    try {
      const searchQuery = `cities in ${stateName} Nigeria`;
      // Use Next.js API route to proxy the request (avoids CORS)
      const response = await fetch(
        `${this.GOOGLE_PLACES_BASE_URL}/textsearch?query=${encodeURIComponent(searchQuery)}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.results
          ?.filter((place: any) => place.types?.includes('locality') || place.types?.includes('sublocality'))
          ?.map((place: any) => place.name) || [];
      } else if (response.status === 401 || response.status === 403) {
        // Invalid token - silently fail and use other APIs
        console.warn('Google Places API: Invalid API key. Please configure a valid key or remove it.');
        return [];
      }
    } catch (error) {
      // Silently fail - other APIs will handle the request
      console.warn('Google Places cities API failed:', error);
    }

    return [];
  }

  /**
   * Get cities from Mapbox Geocoding API
   */
  private async getCitiesFromMapbox(stateName: string): Promise<string[]> {
    // Check if token is valid (not placeholder)
    if (!this.config.mapboxAccessToken || 
        this.config.mapboxAccessToken === 'your_mapbox_access_token_here' ||
        this.config.mapboxAccessToken.includes('your_')) {
      return [];
    }

    try {
      const searchQuery = `${stateName} Nigeria`;
      const response = await fetch(
        `${this.MAPBOX_BASE_URL}/${encodeURIComponent(searchQuery)}.json?access_token=${this.config.mapboxAccessToken}&country=NG&types=place&limit=100`
      );

      if (response.ok) {
        const data = await response.json();
        return data.features?.map((feature: any) => feature.text) || [];
      } else if (response.status === 401) {
        // Invalid token - silently fail and use other APIs
        console.warn('Mapbox API: Invalid access token. Please configure a valid token or remove it.');
        return [];
      }
    } catch (error) {
      // Silently fail - other APIs will handle the request
      console.warn('Mapbox cities API failed:', error);
    }

    return [];
  }

  /**
   * Get cities from Nominatim (OpenStreetMap) API
   * FREE - NO API KEY REQUIRED!
   */
  private async getCitiesFromNominatim(stateName: string): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        q: `${stateName}, Nigeria`,
        format: 'json',
        addressdetails: '1',
        limit: '50',
        countrycodes: 'ng',
        'accept-language': 'en',
        featuretype: 'city,town,village'
      });

      const response = await fetch(`${this.NOMINATIM_BASE_URL}/search?${params.toString()}`, {
        headers: {
          'User-Agent': 'Awari Property Platform', // Required by Nominatim
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const cities = new Set<string>();
        data.forEach((place: any) => {
          const address = place.address || {};
          const cityName = address.city || address.town || address.village || address.suburb;
          if (cityName && address.state === stateName) {
            cities.add(cityName);
          }
        });
        return Array.from(cities).sort();
      }
    } catch (error) {
      console.warn('Nominatim cities API failed:', error);
    }

    return [];
  }

  /**
   * Get cities from AddressData.ng API
   */
  private async getCitiesFromAddressData(stateName: string): Promise<string[]> {
    if (!this.config.addressDataPublicKey || !this.config.addressDataPrivateKey) return [];

    try {
      const response = await fetch(`${this.ADDRESS_DATA_BASE_URL}/cities?state=${encodeURIComponent(stateName)}`, {
        headers: {
          'X-Public-Key': this.config.addressDataPublicKey,
          'X-Private-Key': this.config.addressDataPrivateKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.cities?.map((city: any) => city.name || city) || [];
      }
    } catch (error) {
      console.warn('AddressData.ng cities API failed:', error);
    }

    return [];
  }

  /**
   * Get address suggestions from Google Places API
   * Uses Next.js API route proxy to avoid CORS issues
   */
  private async getAddressesFromGooglePlaces(query: string, state?: string): Promise<AddressSuggestion[]> {
    // Check if token is valid (not placeholder) - but we'll use server-side API key
    // The API key check happens on the server side now
    
    try {
      // Clean up query
      const cleanQuery = query.trim();
      
      // Use Next.js API route to proxy the request (avoids CORS)
      const params = new URLSearchParams({
        input: cleanQuery,
      });
      
      if (state) {
        params.append('state', state);
      }
      
      const url = `${this.GOOGLE_PLACES_BASE_URL}/autocomplete?${params.toString()}`;
      
      console.log('🌐 Google Places API (via proxy):', url);
      
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        
        console.log('📦 Google Places API Response:', {
          status: data.status,
          predictionsCount: data.predictions?.length || 0,
          error_message: data.error_message
        });
        
        // Check for API errors in response
        if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          console.warn('⚠️ Google Places API error:', data.status, data.error_message || '');
          return [];
        }
        
        // Check if predictions exist
        if (!data.predictions || data.predictions.length === 0) {
          console.log('ℹ️ Google Places API: No predictions found for query:', cleanQuery);
          return [];
        }
        
        console.log('✅ Google Places API: Found', data.predictions.length, 'predictions');
        
        const suggestions = data.predictions.map((prediction: any, index: number) => {
          const city = this.extractCityFromGooglePlace(prediction);
          const extractedState = this.extractStateFromGooglePlace(prediction);
          
          return {
            id: `google-${prediction.place_id}`,
            fullAddress: prediction.description,
            street: prediction.structured_formatting?.main_text || '',
            city: city || '',
            state: extractedState || state || '',
            placeId: prediction.place_id,
            confidence: 0.9 - (index * 0.1)
          };
        });
        
        console.log('📋 Parsed suggestions:', suggestions);
        return suggestions;
      } else if (response.status === 401 || response.status === 403) {
        // Invalid token
        const errorData = await response.json().catch(() => ({}));
        console.warn('⚠️ Google Places API: Invalid API key.', errorData);
        return [];
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('⚠️ Google Places API HTTP error:', response.status, errorData);
        return [];
      }
    } catch (error) {
      // Log error for debugging
      console.error('❌ Google Places autocomplete API failed:', error);
      return [];
    }
  }

  /**
   * Get address suggestions from Mapbox Geocoding API
   */
  private async getAddressesFromMapbox(query: string, state?: string): Promise<AddressSuggestion[]> {
    // Check if token is valid (not placeholder)
    if (!this.config.mapboxAccessToken || 
        this.config.mapboxAccessToken === 'your_mapbox_access_token_here' ||
        this.config.mapboxAccessToken.includes('your_')) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.MAPBOX_BASE_URL}/${encodeURIComponent(query)}.json?access_token=${this.config.mapboxAccessToken}&country=NG&limit=5&types=address,poi`
      );

      if (response.ok) {
        const data = await response.json();
        return data.features?.map((feature: any, index: number) => ({
          id: `mapbox-${feature.id}`,
          fullAddress: feature.place_name,
          street: feature.text || '',
          city: this.extractCityFromMapboxFeature(feature),
          state: this.extractStateFromMapboxFeature(feature) || state || '',
          coordinates: {
            lat: feature.center[1],
            lng: feature.center[0]
          },
          confidence: 0.8 - (index * 0.1)
        })) || [];
      } else if (response.status === 401) {
        // Invalid token - silently fail and use other APIs
        console.warn('Mapbox API: Invalid access token. Please configure a valid token or remove it.');
        return [];
      }
    } catch (error) {
      // Silently fail - other APIs will handle the request
      console.warn('Mapbox geocoding API failed:', error);
    }

    return [];
  }

  /**
   * Get address suggestions from AddressData.ng API
   */
  private async getAddressesFromAddressData(query: string, city?: string, state?: string): Promise<AddressSuggestion[]> {
    if (!this.config.addressDataPublicKey || !this.config.addressDataPrivateKey) return [];

    try {
      const params = new URLSearchParams({ query });
      if (city) params.append('city', city);
      if (state) params.append('state', state);

      const response = await fetch(`${this.ADDRESS_DATA_BASE_URL}/autocomplete?${params}`, {
        headers: {
          'X-Public-Key': this.config.addressDataPublicKey,
          'X-Private-Key': this.config.addressDataPrivateKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.suggestions?.map((suggestion: any, index: number) => ({
          id: `addressdata-${suggestion.adc || index}`,
          fullAddress: suggestion.address || suggestion.fullAddress,
          street: suggestion.street || '',
          city: suggestion.city || city || '',
          state: suggestion.state || state || '',
          postCode: suggestion.postCode,
          confidence: 0.95 - (index * 0.05)
        })) || [];
      }
    } catch (error) {
      console.warn('AddressData.ng autocomplete API failed:', error);
    }

    return [];
  }

  /**
   * Get address suggestions from Nominatim (OpenStreetMap) API
   * FREE - NO API KEY REQUIRED!
   * Rate limit: 1 request per second (be respectful)
   */
  private async getAddressesFromNominatim(query: string, city?: string, state?: string): Promise<AddressSuggestion[]> {
    try {
      // Build search query
      let searchQuery = query;
      if (city) searchQuery += `, ${city}`;
      if (state) searchQuery += `, ${state}`;
      searchQuery += ', Nigeria';

      const params = new URLSearchParams({
        q: searchQuery,
        format: 'json',
        addressdetails: '1',
        limit: '10',
        countrycodes: 'ng',
        'accept-language': 'en'
      });

      const response = await fetch(`${this.NOMINATIM_BASE_URL}/search?${params.toString()}`, {
        headers: {
          'User-Agent': 'Awari Property Platform', // Required by Nominatim
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.map((place: any, index: number) => {
          const address = place.address || {};
          return {
            id: `nominatim-${place.place_id}`,
            fullAddress: place.display_name,
            street: address.road || address.house_number || '',
            city: address.city || address.town || address.village || city || '',
            state: address.state || state || '',
            postCode: address.postcode,
            coordinates: {
              lat: parseFloat(place.lat),
              lng: parseFloat(place.lon)
            },
            confidence: 0.75 - (index * 0.05) // Good confidence for free API
          };
        }) || [];
      }
    } catch (error) {
      console.warn('Nominatim (OpenStreetMap) API failed:', error);
    }

    return [];
  }

  /**
   * Get address suggestions from Geoapify API
   */
  private async getAddressesFromGeoapify(query: string, state?: string): Promise<AddressSuggestion[]> {
    // Note: You'll need to get a free Geoapify API key
    const geoapifyApiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
    if (!geoapifyApiKey) return [];

    try {
      const response = await fetch(
        `${this.GEOAPIFY_BASE_URL}/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:ng&limit=5&apiKey=${geoapifyApiKey}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.features?.map((feature: any, index: number) => ({
          id: `geoapify-${feature.properties.place_id}`,
          fullAddress: feature.properties.formatted,
          street: feature.properties.street || '',
          city: feature.properties.city || '',
          state: feature.properties.state || state || '',
          postCode: feature.properties.postcode,
          coordinates: {
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0]
          },
          confidence: 0.7 - (index * 0.1)
        })) || [];
      }
    } catch (error) {
      console.warn('Geoapify API failed:', error);
    }

    return [];
  }

  /**
   * Build search query with context
   * Optimized to avoid redundant information
   */
  private buildSearchQuery(query: string, city?: string, state?: string): string {
    let searchQuery = query.trim();
    
    // Don't add city/state if they're already in the query
    const queryLower = searchQuery.toLowerCase();
    
    // Only add city if not already present and provided
    if (city && !queryLower.includes(city.toLowerCase())) {
      searchQuery += ` ${city}`;
    }
    
    // Only add state if not already present and provided
    if (state && !queryLower.includes(state.toLowerCase())) {
      searchQuery += ` ${state}`;
    }
    
    // Only add Nigeria if not already present
    if (!queryLower.includes('nigeria')) {
      searchQuery += ' Nigeria';
    }
    
    return searchQuery.trim();
  }

  /**
   * Extract city from Google Places prediction
   */
  private extractCityFromGooglePlace(prediction: any): string {
    const terms = prediction.terms || [];
    // Usually the city is the second-to-last term (before country)
    return terms.length >= 2 ? terms[terms.length - 2].value : '';
  }

  /**
   * Extract state from Google Places prediction
   */
  private extractStateFromGooglePlace(prediction: any): string {
    const terms = prediction.terms || [];
    // Look for state in terms
    for (const term of terms) {
      if (this.availableStates.some(state => 
        state.name.toLowerCase().includes(term.value.toLowerCase()) ||
        term.value.toLowerCase().includes(state.name.toLowerCase())
      )) {
        return this.availableStates.find(state => 
          state.name.toLowerCase().includes(term.value.toLowerCase()) ||
          term.value.toLowerCase().includes(state.name.toLowerCase())
        )?.name || '';
      }
    }
    return '';
  }

  /**
   * Extract city from Mapbox feature
   */
  private extractCityFromMapboxFeature(feature: any): string {
    const context = feature.context || [];
    const cityContext = context.find((ctx: any) => ctx.id.startsWith('place.'));
    return cityContext?.text || '';
  }

  /**
   * Extract state from Mapbox feature
   */
  private extractStateFromMapboxFeature(feature: any): string {
    const context = feature.context || [];
    const regionContext = context.find((ctx: any) => ctx.id.startsWith('region.'));
    return regionContext?.text || '';
  }

  /**
   * Fallback cities when APIs fail
   */
  private getFallbackCities(stateName: string): string[] {
    const fallbackCities: Record<string, string[]> = {
      'Lagos': [
        'Ikeja', 'Victoria Island', 'Lekki', 'Ikoyi', 'Yaba', 'Surulere', 'Ajah', 'Maryland', 'Gbagada',
        'Alimosho', 'Ajeromi-Ifelodun', 'Kosofe', 'Mushin', 'Oshodi-Isolo', 'Ojo', 'Ikorodu',
        'Agege', 'Ifako-Ijaiye', 'Shomolu', 'Amuwo-Odofin', 'Lagos Mainland', 'Lagos Island', 'Eti Osa',
        'Ibeju-Lekki', 'Badagry', 'Epe', 'Apapa', 'Oshodi', 'Isolo', 'Ejigbo',
        'Magodo', 'Omole', 'Ogba', 'Ilupeju', 'Palmgrove', 'Anthony', 'Ojota', 'Ketu',
        'Alapere', 'Berger', 'Ikeja GRA', 'Magodo Phase 1', 'Magodo Phase 2', 'Lekki Phase 1',
        'Lekki Phase 2', 'Banana Island', 'Chevron', 'Jakande', 'Sangotedo', 'Abraham Adesanya',
        'Badore', 'Admiralty Way', 'Osapa London', 'Ikota', 'VGC', 'Dolphin Estate',
        'Oniru', 'Marina', 'Broad Street', 'Idumota', 'Balogun', 'Obalende',
        'Tarkwa Bay', 'Adeniji Adele', 'CMS', 'Tinubu Square', 'Adeniji Adele', 'Ojuelegba',
        'Bariga', 'Somolu', 'Iwaya', 'Yaba', 'Ebute-Metta', 'Iddo', 'Oyingbo', 'Jibowu',
        'Fadeyi', 'Palmgrove', 'Onipanu', 'Palm Avenue', 'Ilupeju', 'Mushin', 'Isolo',
        'Ejigbo', 'Ikotun', 'Egbe', 'Idimu', 'Igando', 'Alimosho', 'Egbeda', 'Ikotun',
        'Akowonjo', 'Shasha', 'Egbeda', 'Idimu', 'Ikotun', 'Akowonjo', 'Shasha', 'Egbeda'
      ],
      'Oyo': [
        'Ibadan North', 'Ibadan South', 'Bodija', 'UI', 'Challenge', 'Ring Road', 'Dugbe', 'Mokola',
        'Agodi', 'Gate', 'Molete', 'Oke-Ado', 'Oke-Bola', 'Oke-Padi', 'Sango', 'Eleyele', 'Apata',
        'Akobo', 'Ologuneru', 'Oluyole', 'Akinyele', 'Egbeda', 'Ido', 'Lagelu', 'Ona Ara',
        'Agbowo', 'Sango', 'Eleyele', 'Apata', 'Akobo', 'Ologuneru', 'Oluyole', 'Akinyele'
      ],
      'Federal Capital Territory': [
        'Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa', 'Jahi', 'Life Camp',
        'Wuse 2', 'Wuse Zone 4', 'Wuse Zone 5', 'Wuse Zone 6', 'Wuse Zone 7', 'Garki Area 1',
        'Garki Area 2', 'Garki Area 3', 'Garki Area 7', 'Garki Area 8', 'Garki Area 10', 'Garki Area 11',
        'Utako', 'Jabi', 'Kado', 'Dakibiyu', 'Dutse', 'Bwari',
        'Nyanya', 'Karu', 'Mararaba', 'Lugbe', 'Gudu', 'Apo',
        'Central Area', 'Wuse Zone 1', 'Wuse Zone 2', 'Wuse Zone 3', 'Mabushi', 'Kaura', 'Dakwo',
        'Lokogoma'
      ]
    };

    // Remove duplicates and return unique cities
    const cities = fallbackCities[stateName] || [];
    return [...new Set(cities)];
  }

  /**
   * Validate address using live APIs
   */
  async validateAddress(address: string, city: string, state: string): Promise<boolean> {
    // Try AddressData.ng validation first
    if (this.config.addressDataPublicKey && this.config.addressDataPrivateKey) {
      try {
        const response = await fetch(`${this.ADDRESS_DATA_BASE_URL}/validate`, {
          method: 'POST',
          headers: {
            'X-Public-Key': this.config.addressDataPublicKey,
            'X-Private-Key': this.config.addressDataPrivateKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address,
            city,
            state,
            country: 'Nigeria'
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.valid || data.isValid || false;
        }
      } catch (error) {
        console.warn('Address validation failed:', error);
      }
    }

    // Fallback validation
    return address.length > 5 && city.length > 0 && state.length > 0;
  }
}

// Export singleton instance
export const liveLocationApiService = new LiveLocationApiService();

// Export function to configure APIs
export const configureLocationApis = (config: ApiConfig) => {
  liveLocationApiService.updateConfig(config);
};
