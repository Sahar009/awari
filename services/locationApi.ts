
import { liveLocationApiService, configureLocationApis } from './liveLocationApi';
import { defaultApiConfig } from '../config/apiConfig';

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
  placeId?: string;
  confidence?: number;
}

class LocationApiService {
  private isConfigured = false;

  constructor() {
    this.initializeApis();
  }

  /**
   * Initialize live APIs with configuration
   */
  private initializeApis() {
    try {
      configureLocationApis(defaultApiConfig);
      this.isConfigured = true;
      console.log(' Live Location APIs initialized successfully!');
      console.log('Using real-time data from:');
      console.log('   • Google Places API');
      console.log('   • Mapbox Geocoding API');
      console.log('   • Geoapify API');
    } catch (error) {
      console.warn(' Failed to initialize live APIs, using fallback mode:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Update API configuration for live services
   */
  updateApiConfig(config: any) {
    configureLocationApis(config);
    this.isConfigured = true;
  }

  /**
   * Get available states (Lagos, Oyo/Ibadan, FCT/Abuja) - LIVE DATA
   */
  async getAllStates(): Promise<NigerianState[]> {
    if (this.isConfigured) {
      console.log(' Fetching states from live APIs...');
      return await liveLocationApiService.getAllStates();
    }
    
    console.log(' Using fallback states (configure APIs for live data)');
    // Fallback states - Lagos and Ibadan only
    return [
      { id: '1', name: 'Lagos', code: 'LG', capital: 'Ikeja', region: 'South West' },
      { id: '2', name: 'Ibadan', code: 'IB', capital: 'Ibadan', region: 'South West' }
    ];
  }

  /**
   * Get cities for a specific state - LIVE DATA from multiple APIs
   */
  async getCitiesByState(stateName: string): Promise<string[]> {
    if (this.isConfigured) {
      console.log(` Fetching cities for ${stateName} from live APIs...`);
      return await liveLocationApiService.getCitiesByState(stateName);
    }
    
    console.log(` Using fallback cities for ${stateName}`);
    // Comprehensive fallback cities for Lagos and Ibadan
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
        'Oniru', 'Marina', 'Broad Street', 'Idumota', 'Balogun', 'Obalende', 'Tarkwa Bay',
        'Adeniji Adele', 'CMS', 'Tinubu Square', 'Ajah', 'Awoyaya', 'Epe', 'Ibeju', 'Eti-Osa',
        'Ikeja', 'Alausa', 'Oregun', 'Adeniyi Jones', 'Allen Avenue', 'Opebi', 'Ilupeju',
        'Mushin', 'Isolo', 'Ejigbo', 'Ikotun', 'Egbeda', 'Alimosho', 'Egbe', 'Idimu',
        'Akowonjo', 'Egbeda', 'Shasha', 'Akowonjo', 'Egbeda', 'Alimosho', 'Igando', 'Ikotun',
        'Ejigbo', 'Isolo', 'Mushin', 'Oshodi', 'Ikeja', 'Agege', 'Ifako-Ijaiye', 'Alimosho',
        'Kosofe', 'Shomolu', 'Surulere', 'Lagos Mainland', 'Lagos Island', 'Eti Osa', 'Ibeju-Lekki',
        'Badagry', 'Epe', 'Ikorodu', 'Ojo', 'Amuwo-Odofin', 'Ajeromi-Ifelodun'
      ],
      'Ibadan': [
        'Ibadan North', 'Ibadan South', 'Bodija', 'UI', 'Challenge', 'Ring Road', 'Dugbe', 'Mokola',
        'Agodi', 'Gate', 'Molete', 'Oke-Ado', 'Oke-Bola', 'Oke-Padi', 'Sango', 'Eleyele', 'Apata',
        'Akobo', 'Ologuneru', 'Oluyole', 'Akinyele', 'Egbeda', 'Ido', 'Lagelu', 'Ona Ara',
        'Iwo Road', 'Bodija Market', 'Agbowo', 'UI Road', 'Samonda', 'Ajibode', 'Ojoo', 'Akobo',
        'Odo-Ona', 'Oke-Are', 'Oke-Ado', 'Oke-Bola', 'Oke-Padi', 'Oke-Itunu', 'Oke-Fia', 'Oke-Aremo',
        'Oke-Ado', 'Oke-Bola', 'Oke-Padi', 'Oke-Itunu', 'Oke-Fia', 'Oke-Aremo', 'Oke-Ado', 'Oke-Bola',
        'Mokola', 'Agodi', 'Gate', 'Molete', 'Oke-Ado', 'Oke-Bola', 'Oke-Padi', 'Sango', 'Eleyele',
        'Apata', 'Akobo', 'Ologuneru', 'Oluyole', 'Akinyele', 'Egbeda', 'Ido', 'Lagelu', 'Ona Ara',
        'Iwo Road', 'Bodija Market', 'Agbowo', 'UI Road', 'Samonda', 'Ajibode', 'Ojoo', 'Akobo',
        'Odo-Ona', 'Oke-Are', 'Oke-Ado', 'Oke-Bola', 'Oke-Padi', 'Oke-Itunu', 'Oke-Fia', 'Oke-Aremo',
        'Iwo Road', 'Bodija', 'UI', 'Challenge', 'Ring Road', 'Dugbe', 'Mokola', 'Agodi', 'Gate',
        'Molete', 'Oke-Ado', 'Oke-Bola', 'Oke-Padi', 'Sango', 'Eleyele', 'Apata', 'Akobo', 'Ologuneru',
        'Oluyole', 'Akinyele', 'Egbeda', 'Ido', 'Lagelu', 'Ona Ara', 'Iwo Road', 'Bodija Market',
        'Agbowo', 'UI Road', 'Samonda', 'Ajibode', 'Ojoo', 'Akobo', 'Odo-Ona', 'Oke-Are'
      ]
    };
    
    // Remove duplicates and return unique cities
    const cities = fallbackCities[stateName] || [];
    return [...new Set(cities)].sort();
  }

  /**
   * Get address suggestions using live APIs (Google Places, Mapbox) with fallback
   * When city is selected, uses real-time map data for accurate autocomplete
   */
  async getAddressSuggestions(query: string, city?: string, state?: string): Promise<AddressSuggestion[]> {
    if (!query || query.length < 2) return [];

    // If city is selected, try to use live API first for real map data
    if (this.isConfigured && city && state) {
      try {
        console.log(`🔍 Address suggestions for "${query}" in ${city}, ${state} - using live APIs`);
        const liveSuggestions = await liveLocationApiService.getAddressSuggestions(query, city, state);
        if (liveSuggestions && liveSuggestions.length > 0) {
          console.log(`✅ Live API returned ${liveSuggestions.length} suggestions`);
          return liveSuggestions;
        }
      } catch (error) {
        console.warn('Live API failed, using fallback:', error);
      }
    }

    // Fallback to enhanced static data
    console.log(`🔍 Address suggestions for "${query}" - using enhanced fallback data`);
    
    // Enhanced fallback addresses for Lagos and Ibadan
    const addressDatabase: Record<string, string[]> = {
      'Lagos': [
        'Allen Avenue', 'Victoria Island', 'Lekki-Epe Expressway', 'Ikorodu Road',
        'Ahmadu Bello Way', 'Admiralty Way', 'Ajah Road', 'Akin Adesola Street',
        'Awolowo Road', 'Broad Street', 'Carter Bridge', 'CMS Road',
        'Dolphin Estate', 'Falomo Bridge', 'Gerrard Road', 'Herbert Macaulay Way',
        'Idowu Taylor Street', 'Ikeja GRA', 'Jakande Estate', 'Kofo Abayomi Street',
        'Lekki Phase 1', 'Lekki Phase 2', 'Marina', 'Maryland', 'Murtala Mohammed Way',
        'Nnamdi Azikiwe Street', 'Obalende', 'Ogudu Road', 'Ojota', 'Ojuelegba Road',
        'Oshodi Expressway', 'Ozumba Mbadiwe Avenue', 'Samuel Manuwa Street',
        'Tafawa Balewa Square', 'Tinubu Square', 'Waltersmith Road', 'Yaba'
      ],
      'Ibadan': [
        'Ring Road', 'Challenge Road', 'Bodija Road', 'UI Road', 'Dugbe Road',
        'Mokola Road', 'Agodi Road', 'Gate Road', 'Molete Road', 'Oke-Ado Road',
        'Oke-Bola Road', 'Sango Road', 'Eleyele Road', 'Apata Road', 'Akobo Road',
        'Iwo Road', 'Bodija Market', 'Agbowo', 'Samonda', 'Ajibode', 'Ojoo',
        'Odo-Ona', 'Oke-Are', 'Oke-Itunu', 'Oke-Fia', 'Oke-Aremo'
      ]
    };

    // Get addresses for the state or use general list
    const stateAddresses = addressDatabase[state || ''] || [];
    const generalAddresses = [
      'Main Street', 'Market Road', 'Church Street', 'Mosque Street',
      'School Road', 'Hospital Road', 'Station Road', 'Airport Road'
    ];
    
    const allAddresses = [...stateAddresses, ...generalAddresses];
    
    // Filter addresses that match the query
    const filtered = allAddresses.filter(address => 
      address.toLowerCase().includes(query.toLowerCase())
    );
    
    // Limit to top 10 matches
    // Format: address, city, state (without Nigeria)
    return filtered.slice(0, 10).map((street, index) => ({
      id: `fallback-${index}-${Date.now()}`,
      fullAddress: `${street}, ${city || ''}, ${state || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
      street,
      city: city || '',
      state: state || '',
      confidence: 0.7 - (index * 0.05)
    }));
  }

  /**
   * Validate address using live APIs
   */
  async validateAddress(address: string, city: string, state: string): Promise<boolean> {
    if (this.isConfigured) {
      console.log(` Validating address: ${address}, ${city}, ${state}...`);
      return await liveLocationApiService.validateAddress(address, city, state);
    }
    
    console.log(' Using basic validation (configure APIs for live validation)');
    // Basic fallback validation
    return address.length > 5 && city.length > 0 && state.length > 0;
  }
}

export const locationApiService = new LocationApiService();
