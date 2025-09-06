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
  private readonly GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
  private readonly MAPBOX_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  private readonly ADDRESS_DATA_BASE_URL = 'https://api.addressdata.ng/v1';
  private readonly GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode';

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
   */
  async getCitiesByState(stateName: string): Promise<string[]> {
    const cities = new Set<string>();

    // Try multiple APIs in parallel for comprehensive coverage
    const apiPromises = [
      this.getCitiesFromGooglePlaces(stateName),
      this.getCitiesFromMapbox(stateName),
      this.getCitiesFromAddressData(stateName)
    ];

    try {
      const results = await Promise.allSettled(apiPromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          result.value.forEach(city => cities.add(city));
        }
      });

      // Convert to array and sort
      const cityArray = Array.from(cities).sort();
      
      // If we got results, return them
      if (cityArray.length > 0) {
        return cityArray;
      }
    } catch (error) {
      console.warn('All city APIs failed:', error);
    }

    // Fallback to basic cities if APIs fail
    return this.getFallbackCities(stateName);
  }

  /**
   * Get real-time address suggestions using live APIs
   */
  async getAddressSuggestions(query: string, city?: string, state?: string): Promise<AddressSuggestion[]> {
    if (!query || query.length < 2) return [];

    const suggestions = new Map<string, AddressSuggestion>();

    // Build search query with context
    const searchQuery = this.buildSearchQuery(query, city, state);

    // Try multiple APIs in parallel
    const apiPromises = [
      this.getAddressesFromGooglePlaces(searchQuery, state),
      this.getAddressesFromMapbox(searchQuery, state),
      this.getAddressesFromAddressData(query, city, state),
      this.getAddressesFromGeoapify(searchQuery, state)
    ];

    try {
      const results = await Promise.allSettled(apiPromises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          result.value.forEach(suggestion => {
            // Use full address as key to avoid duplicates
            const key = suggestion.fullAddress.toLowerCase();
            if (!suggestions.has(key) || (suggestions.get(key)?.confidence || 0) < (suggestion.confidence || 0)) {
              suggestions.set(key, suggestion);
            }
          });
        }
      });

      // Convert to array, sort by confidence, and limit results
      return Array.from(suggestions.values())
        .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
        .slice(0, 10); // Limit to top 10 suggestions

    } catch (error) {
      console.warn('Address suggestion APIs failed:', error);
      return [];
    }
  }

  /**
   * Get cities from Google Places API
   */
  private async getCitiesFromGooglePlaces(stateName: string): Promise<string[]> {
    if (!this.config.googlePlacesApiKey) return [];

    try {
      const searchQuery = `cities in ${stateName} Nigeria`;
      const response = await fetch(
        `${this.GOOGLE_PLACES_BASE_URL}/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${this.config.googlePlacesApiKey}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.results
          ?.filter((place: any) => place.types?.includes('locality') || place.types?.includes('sublocality'))
          ?.map((place: any) => place.name)
          ?.slice(0, 20) || [];
      }
    } catch (error) {
      console.warn('Google Places cities API failed:', error);
    }

    return [];
  }

  /**
   * Get cities from Mapbox Geocoding API
   */
  private async getCitiesFromMapbox(stateName: string): Promise<string[]> {
    if (!this.config.mapboxAccessToken) return [];

    try {
      const searchQuery = `${stateName} Nigeria`;
      const response = await fetch(
        `${this.MAPBOX_BASE_URL}/${encodeURIComponent(searchQuery)}.json?access_token=${this.config.mapboxAccessToken}&country=NG&types=place&limit=20`
      );

      if (response.ok) {
        const data = await response.json();
        return data.features?.map((feature: any) => feature.text) || [];
      }
    } catch (error) {
      console.warn('Mapbox cities API failed:', error);
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
   */
  private async getAddressesFromGooglePlaces(query: string, state?: string): Promise<AddressSuggestion[]> {
    if (!this.config.googlePlacesApiKey) return [];

    try {
      const response = await fetch(
        `${this.GOOGLE_PLACES_BASE_URL}/autocomplete/json?input=${encodeURIComponent(query)}&components=country:ng&key=${this.config.googlePlacesApiKey}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.predictions?.map((prediction: any, index: number) => ({
          id: `google-${prediction.place_id}`,
          fullAddress: prediction.description,
          street: prediction.structured_formatting?.main_text || '',
          city: this.extractCityFromGooglePlace(prediction),
          state: this.extractStateFromGooglePlace(prediction) || state || '',
          placeId: prediction.place_id,
          confidence: 0.9 - (index * 0.1)
        })) || [];
      }
    } catch (error) {
      console.warn('Google Places autocomplete API failed:', error);
    }

    return [];
  }

  /**
   * Get address suggestions from Mapbox Geocoding API
   */
  private async getAddressesFromMapbox(query: string, state?: string): Promise<AddressSuggestion[]> {
    if (!this.config.mapboxAccessToken) return [];

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
      }
    } catch (error) {
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
   */
  private buildSearchQuery(query: string, city?: string, state?: string): string {
    let searchQuery = query;
    
    if (city && !query.toLowerCase().includes(city.toLowerCase())) {
      searchQuery += ` ${city}`;
    }
    
    if (state && !query.toLowerCase().includes(state.toLowerCase())) {
      searchQuery += ` ${state}`;
    }
    
    if (!query.toLowerCase().includes('nigeria')) {
      searchQuery += ' Nigeria';
    }
    
    return searchQuery;
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
      'Lagos': ['Ikeja', 'Victoria Island', 'Lekki', 'Ikoyi', 'Yaba', 'Surulere', 'Ajah', 'Maryland', 'Gbagada'],
      'Oyo': ['Ibadan North', 'Ibadan South', 'Bodija', 'UI', 'Challenge', 'Ring Road', 'Dugbe', 'Mokola'],
      'Federal Capital Territory': ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa', 'Jahi', 'Life Camp']
    };

    return fallbackCities[stateName] || [];
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
