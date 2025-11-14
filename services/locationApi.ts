
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
    // Fallback states
    return [
      { id: '1', name: 'Lagos', code: 'LG', capital: 'Ikeja', region: 'South West' },
      { id: '2', name: 'Oyo', code: 'OY', capital: 'Ibadan', region: 'South West' },
      { id: '3', name: 'Federal Capital Territory', code: 'FCT', capital: 'Abuja', region: 'North Central' }
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
    // Comprehensive fallback cities
    const fallbackCities: Record<string, string[]> = {
      'Lagos': [
        'Ikeja', 'Victoria Island', 'Lekki', 'Ikoyi', 'Yaba', 'Surulere', 'Ajah', 'Maryland', 'Gbagada',
        'Alimosho', 'Ajeromi-Ifelodun', 'Kosofe', 'Mushin', 'Oshodi-Isolo', 'Ojo', 'Ikorodu',
        'Agege', 'Ifako-Ijaiye', 'Shomolu', 'Amuwo-Odofin', 'Lagos Mainland', 'Lagos Island', 'Eti Osa',
        'Ibeju-Lekki', 'Badagry', 'Epe', 'Apapa', 'Mushin', 'Oshodi', 'Isolo', 'Ejigbo',
        'Magodo', 'Omole', 'Ogba', 'Ilupeju', 'Palmgrove', 'Anthony', 'Ojota', 'Ketu',
        'Alapere', 'Berger', 'Ikeja GRA', 'Magodo Phase 1', 'Magodo Phase 2', 'Lekki Phase 1',
        'Lekki Phase 2', 'Banana Island', 'Chevron', 'Jakande', 'Sangotedo', 'Abraham Adesanya',
        'Badore', 'Admiralty Way', 'Osapa London', 'Ikota', 'VGC', 'Dolphin Estate',
        'Oniru', 'Marina', 'Broad Street', 'Idumota', 'Balogun', 'Obalende', 'Tarkwa Bay',
        'Adeniji Adele', 'CMS', 'Tinubu Square'
      ],
      'Oyo': [
        'Ibadan North', 'Ibadan South', 'Bodija', 'UI', 'Challenge', 'Ring Road', 'Dugbe', 'Mokola',
        'Agodi', 'Gate', 'Molete', 'Oke-Ado', 'Oke-Bola', 'Oke-Padi', 'Sango', 'Eleyele', 'Apata',
        'Akobo', 'Ologuneru', 'Oluyole', 'Akinyele', 'Egbeda', 'Ido', 'Lagelu', 'Ona Ara'
      ],
      'Federal Capital Territory': [
        'Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa', 'Jahi', 'Life Camp',
        'Wuse 2', 'Wuse Zone 4', 'Wuse Zone 5', 'Wuse Zone 6', 'Wuse Zone 7', 'Garki Area 1',
        'Garki Area 2', 'Garki Area 3', 'Garki Area 7', 'Garki Area 8', 'Garki Area 10', 'Garki Area 11',
        'Utako', 'Jabi', 'Kado', 'Dakibiyu', 'Dutse', 'Bwari', 'Nyanya', 'Karu', 'Mararaba',
        'Lugbe', 'Gudu', 'Apo', 'Central Area', 'Wuse Zone 1', 'Wuse Zone 2', 'Wuse Zone 3',
        'Mabushi', 'Kaura', 'Dakwo', 'Lokogoma'
      ]
    };
    
    // Remove duplicates and return unique cities
    const cities = fallbackCities[stateName] || [];
    return [...new Set(cities)];
  }

  /**
   * Get REAL-TIME address suggestions from multiple live APIs
   */
  async getAddressSuggestions(query: string, city?: string, state?: string): Promise<AddressSuggestion[]> {
    if (!query || query.length < 2) return [];

    if (this.isConfigured) {
      console.log(` Fetching real-time address suggestions for "${query}"...`);
      return await liveLocationApiService.getAddressSuggestions(query, city, state);
    }
    
    console.log(` Using minimal fallback addresses for "${query}"`);
    // Very basic fallback when no APIs are configured
    const basicStreets = [
      'Allen Avenue', 'Victoria Island', 'Lekki-Epe Expressway', 'Ikorodu Road',
      'Ahmadu Bello Way', 'Ring Road', 'Challenge Road', 'Constitution Avenue'
    ];
    
    const filtered = basicStreets.filter(street => 
      street.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered.map((street, index) => ({
      id: `basic-${index}`,
      fullAddress: `${street}, ${city || ''}, ${state || ''}, Nigeria`,
      street,
      city: city || '',
      state: state || '',
      confidence: 0.5 - (index * 0.1)
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
