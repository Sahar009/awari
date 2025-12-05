'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Navigation, Search, X } from 'lucide-react';

interface PropertyLocationMapProps {
  latitude: number | '';
  longitude: number | '';
  address: string;
  city?: string;
  state?: string;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  height?: string;
}

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ['places'];

const defaultCenter = {
  lat: 6.5244, // Lagos default
  lng: 3.3792
};


export default function PropertyLocationMap({
  latitude,
  longitude,
  address,
  city,
  state,
  onLocationChange,
  height = '400px'
}: PropertyLocationMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchValue, setSearchValue] = useState(address || '');
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mobileAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Sync search value with address prop
  useEffect(() => {
    if (address) {
      setSearchValue(address);
    }
  }, [address]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '',
    libraries
  });

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const geocodeAddress = useCallback(async (addressToGeocode: string) => {
    if (!geocoderRef.current) return;
    
    setIsGeocoding(true);
    geocoderRef.current.geocode({ address: addressToGeocode }, (results, status) => {
      setIsGeocoding(false);
      if (status === 'OK' && results && results[0] && map) {
        const location = results[0].geometry.location;
        const position = {
          lat: location.lat(),
          lng: location.lng()
        };
        
        setMarkerPosition(position);
        map.setCenter(position);
        map.setZoom(15);
        
        // Format address as: street, city, state
        const addressComponents = results[0].address_components || [];
        const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
        const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
        const street = [streetNumber, route].filter(Boolean).join(' ') || results[0].formatted_address?.split(',')[0] || '';
        const cityName = addressComponents.find(c => c.types.includes('locality') || c.types.includes('sublocality'))?.long_name || city || '';
        const stateName = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || state || '';
        
        const formattedAddress = street && cityName && stateName
          ? `${street}, ${cityName}, ${stateName}`
          : results[0].formatted_address || address;
        
        onLocationChange(position.lat, position.lng, formattedAddress);
      }
    });
  }, [map, onLocationChange, city, state, address]);

  // Initialize marker position from props
  useEffect(() => {
    if (latitude && longitude && typeof latitude === 'number' && typeof longitude === 'number') {
      const position = { lat: latitude, lng: longitude };
      setMarkerPosition(position);
      if (map) {
        map.setCenter(position);
        map.setZoom(15);
      }
    } else if (city && state && map) {
      // Geocode city/state to center map
      geocodeAddress(`${city}, ${state}, Nigeria`);
    } else if (map) {
      map.setCenter(defaultCenter);
      map.setZoom(10);
    }
  }, [latitude, longitude, city, state, map, geocodeAddress]);

  // Handle place selection from autocomplete
  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location && map) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      
      setMarkerPosition(location);
      map.setCenter(location);
      map.setZoom(16);
      
      // Format address as: street, city, state
      const addressComponents = place.address_components || [];
      const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
      const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
      const street = [streetNumber, route].filter(Boolean).join(' ') || place.formatted_address?.split(',')[0] || '';
      const cityName = addressComponents.find(c => c.types.includes('locality') || c.types.includes('sublocality'))?.long_name || city || '';
      const stateName = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || state || '';
      
      const formattedAddress = street && cityName && stateName
        ? `${street}, ${cityName}, ${stateName}`
        : place.formatted_address || address;
      
      setSearchValue(formattedAddress);
      onLocationChange(location.lat, location.lng, formattedAddress);
      
      // Close mobile search on selection
      if (isMobile) {
        setShowMobileSearch(false);
      }
    }
  }, [map, address, city, state, onLocationChange, isMobile]);

  // Initialize geocoder and autocomplete when map loads
  useEffect(() => {
    if (isLoaded && map) {
      geocoderRef.current = new google.maps.Geocoder();
      
      // Initialize autocomplete for desktop input
      if (searchInputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          componentRestrictions: { country: 'ng' },
          fields: ['geometry', 'formatted_address', 'address_components', 'place_id'],
          types: ['address']
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          handlePlaceSelect(place);
        });

        autocompleteRef.current = autocomplete;
      }

      // Initialize autocomplete for mobile input when it becomes visible
      if (showMobileSearch && mobileSearchInputRef.current && !mobileAutocompleteRef.current) {
        const mobileAutocomplete = new google.maps.places.Autocomplete(mobileSearchInputRef.current, {
          componentRestrictions: { country: 'ng' },
          fields: ['geometry', 'formatted_address', 'address_components', 'place_id'],
          types: ['address']
        });

        mobileAutocomplete.addListener('place_changed', () => {
          const place = mobileAutocomplete.getPlace();
          handlePlaceSelect(place);
        });

        mobileAutocompleteRef.current = mobileAutocomplete;
      }
    }
  }, [isLoaded, map, handlePlaceSelect, showMobileSearch]);

  // Reinitialize mobile autocomplete when search overlay opens
  useEffect(() => {
    if (isLoaded && showMobileSearch && mobileSearchInputRef.current && !mobileAutocompleteRef.current) {
      const mobileAutocomplete = new google.maps.places.Autocomplete(mobileSearchInputRef.current, {
        componentRestrictions: { country: 'ng' },
        fields: ['geometry', 'formatted_address', 'address_components', 'place_id'],
        types: ['address']
      });

      mobileAutocomplete.addListener('place_changed', () => {
        const place = mobileAutocomplete.getPlace();
        handlePlaceSelect(place);
      });

      mobileAutocompleteRef.current = mobileAutocomplete;
    }

    // Cleanup when overlay closes
    if (!showMobileSearch && mobileAutocompleteRef.current) {
      mobileAutocompleteRef.current = null;
    }
  }, [isLoaded, showMobileSearch, handlePlaceSelect]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && map) {
      const position = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      
      setMarkerPosition(position);
      
      // Reverse geocode to get address
      if (geocoderRef.current) {
        setIsGeocoding(true);
        geocoderRef.current.geocode({ location: position }, (results, status) => {
          setIsGeocoding(false);
          if (status === 'OK' && results && results[0]) {
            // Format address as: street, city, state
            const addressComponents = results[0].address_components || [];
            const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
            const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
            const street = [streetNumber, route].filter(Boolean).join(' ') || results[0].formatted_address?.split(',')[0] || '';
            const cityName = addressComponents.find(c => c.types.includes('locality') || c.types.includes('sublocality'))?.long_name || city || '';
            const stateName = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || state || '';
            
            const formattedAddress = street && cityName && stateName
              ? `${street}, ${cityName}, ${stateName}`
              : results[0].formatted_address || address;
            
            setSearchValue(formattedAddress);
            onLocationChange(position.lat, position.lng, formattedAddress);
          } else {
            const fallbackAddress = address || `${position.lat}, ${position.lng}`;
            setSearchValue(fallbackAddress);
            onLocationChange(position.lat, position.lng, fallbackAddress);
          }
        });
      } else {
        onLocationChange(position.lat, position.lng, address || `${position.lat}, ${position.lng}`);
      }
    }
  }, [map, address, city, state, onLocationChange]);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    geocoderRef.current = new google.maps.Geocoder();
    
    // Center map based on current location or city/state
    if (latitude && longitude && typeof latitude === 'number' && typeof longitude === 'number') {
      mapInstance.setCenter({ lat: latitude, lng: longitude });
      mapInstance.setZoom(15);
    } else if (city && state) {
      geocodeAddress(`${city}, ${state}, Nigeria`);
    } else {
      mapInstance.setCenter(defaultCenter);
      mapInstance.setZoom(10);
    }
  }, [latitude, longitude, city, state, geocodeAddress]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setMarkerPosition(location);
        if (map) {
          map.setCenter(location);
          map.setZoom(16);
        }
        
        // Reverse geocode
        if (geocoderRef.current) {
          geocoderRef.current.geocode({ location }, (results, status) => {
            setIsGeocoding(false);
            if (status === 'OK' && results && results[0]) {
              // Format address as: street, city, state
              const addressComponents = results[0].address_components || [];
              const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
              const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
              const street = [streetNumber, route].filter(Boolean).join(' ') || results[0].formatted_address?.split(',')[0] || '';
              const cityName = addressComponents.find(c => c.types.includes('locality') || c.types.includes('sublocality'))?.long_name || city || '';
              const stateName = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || state || '';
              
              const formattedAddress = street && cityName && stateName
                ? `${street}, ${cityName}, ${stateName}`
                : results[0].formatted_address || address;
              
              setSearchValue(formattedAddress);
              onLocationChange(location.lat, location.lng, formattedAddress);
            } else {
              setIsGeocoding(false);
            }
          });
        } else {
          setIsGeocoding(false);
        }
      },
      (error) => {
        setIsGeocoding(false);
        console.error('Error getting current location:', error);
        let errorMessage = 'Unable to get your location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [map, onLocationChange, city, state, address]);

  if (loadError) {
    return (
      <div className="w-full h-96 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-300">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600">Map failed to load</p>
          <p className="text-sm text-slate-500 mt-1">Please check your Google Maps API key</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-slate-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Search Input */}
      {!isMobile && (
        <div className="mb-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={city ? `Search address in ${city}...` : "Search for an address..."}
              className="w-full pl-10 pr-24 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              defaultValue={address}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
              title="Use current location"
            >
              <Navigation className="w-5 h-5" />
            </button>
          </div>
          {isGeocoding && (
            <p className="mt-2 text-sm text-slate-500 flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
              Finding location...
            </p>
          )}
        </div>
      )}

      {/* Mobile Search Overlay */}
      {isMobile && showMobileSearch && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            {/* Mobile Search Header */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setShowMobileSearch(false)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder={city ? `Search address in ${city}...` : "Search for an address..."}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-base"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            
            {/* Mobile Geolocation Button */}
            <div className="p-4 border-b border-slate-200">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGeocoding}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeocoding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Finding location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    <span>Use Current Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Autocomplete suggestions will appear here automatically via Google Places */}
            {isGeocoding && (
              <div className="p-4 text-center text-slate-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Getting your location...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-sm" style={{ height, minHeight: isMobile ? '300px' : height }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={markerPosition || defaultCenter}
          zoom={markerPosition ? 15 : 10}
          onLoad={onMapLoad}
          onClick={onMapClick}
          options={{
            disableDefaultUI: isMobile,
            zoomControl: !isMobile,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: !isMobile,
            gestureHandling: 'greedy',
            clickableIcons: false,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              animation={google.maps.Animation.DROP}
              onDragEnd={(e) => {
                if (e.latLng) {
                  const position = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                  };
                  setMarkerPosition(position);
                  
                  // Reverse geocode
                  if (geocoderRef.current) {
                    setIsGeocoding(true);
                    geocoderRef.current.geocode({ location: position }, (results, status) => {
                      setIsGeocoding(false);
                      if (status === 'OK' && results && results[0]) {
                        // Format address as: street, city, state
                        const addressComponents = results[0].address_components || [];
                        const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
                        const route = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
                        const street = [streetNumber, route].filter(Boolean).join(' ') || results[0].formatted_address?.split(',')[0] || '';
                        const cityName = addressComponents.find(c => c.types.includes('locality') || c.types.includes('sublocality'))?.long_name || city || '';
                        const stateName = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || state || '';
                        
                        const formattedAddress = street && cityName && stateName
                          ? `${street}, ${cityName}, ${stateName}`
                          : results[0].formatted_address || address;
                        
                        setSearchValue(formattedAddress);
                        onLocationChange(position.lat, position.lng, formattedAddress);
                      }
                    });
                  }
                }
              }}
            />
          )}
        </GoogleMap>

        {/* Mobile Floating Action Buttons - Inside map container */}
        {isMobile && !showMobileSearch && (
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowMobileSearch(true)}
              className="p-3 bg-white rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors active:scale-95"
              title="Search address"
              aria-label="Search address"
            >
              <Search className="w-5 h-5 text-slate-700" />
            </button>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isGeocoding}
              className="p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              title="Use current location"
              aria-label="Use current location"
            >
              {isGeocoding ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Navigation className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Coordinates Display */}
      {markerPosition && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 text-sm`}>
            <div>
              <span className="text-slate-600 font-medium">Latitude:</span>
              <span className="ml-2 text-slate-800 font-mono text-xs">{markerPosition.lat.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-slate-600 font-medium">Longitude:</span>
              <span className="ml-2 text-slate-800 font-mono text-xs">{markerPosition.lng.toFixed(6)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {isMobile 
              ? '💡 Tap on the map or drag the marker to set the exact location'
              : '💡 Click on the map or drag the marker to set the exact location'
            }
          </p>
        </div>
      )}
    </div>
  );
}

