'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  MapPin, 
  X
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProperty, clearError } from '@/store/slices/propertySlice';
import Container from '@/components/Container';
import MainLayout from '../mainLayout';
import { AuthLoader, Loader } from '@/components/ui/Loader';
import { locationApiService, type NigerianState, type AddressSuggestion } from '@/services/locationApi';

interface PropertyFormData {
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: number | '';
  address: string;
  city: string;
  state: string;
  images: File[];
  videos: File[];
  documents: File[];
}

const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'condo', label: 'Condo' },
  { value: 'studio', label: 'Studio' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
  { value: 'shop', label: 'Shop' },
  { value: 'warehouse', label: 'Warehouse' }
];

const listingTypes = [
  { value: 'rent', label: 'For Rent', color: 'bg-blue-500' },
  { value: 'sale', label: 'For Sale', color: 'bg-green-500' },
  { value: 'shortlet', label: 'Short Let', color: 'bg-purple-500' }
];

// Dynamic states and addresses will be loaded from API

export default function AddPropertyPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, token } = useAppSelector((state) => state.auth);
  
  // Check if user has access (either fully authenticated or has token)
  // const hasAccess = isAuthenticated || !!token;
  
  // Check if auth state is still loading (before hydration completes)
  const [authChecked, setAuthChecked] = useState(false);
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    propertyType: '',
    listingType: '',
    price: '',
    address: '',
    city: '',
    state: '',
    images: [],
    videos: [],
    documents: []
  });

  const [nigerianStates, setNigerianStates] = useState<NigerianState[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  // const [previewVideos, setPreviewVideos] = useState<string[]>([]);

  // Load Nigerian states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        setIsLoadingStates(true);
        const states = await locationApiService.getAllStates();
        setNigerianStates(states);
      } catch (error) {
        console.error('Failed to load states:', error);
      } finally {
        setIsLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  // Wait for auth hydration before checking authentication
  useEffect(() => {
    const checkAuth = async () => {
      // Give time for auth hydration to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const currentHasAccess = isAuthenticated || !!token || !!localToken;
      
      console.log('=== ADD PROPERTY AUTH DEBUG ===');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('token:', token);
      console.log('localToken:', !!localToken);
      console.log('currentHasAccess:', currentHasAccess);
      console.log('================================');
      
      if (!currentHasAccess) {
        console.log('Redirecting to login - no access');
        router.push('/auth/login');
      }
      
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [isAuthenticated, token, router]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? (value === '' ? '' : Number(value)) : value
    }));

    // Update available cities when state changes
    if (name === 'state') {
      const selectedState = nigerianStates.find(state => state.name === value);
      if (selectedState) {
        try {
          setIsLoadingCities(true);
          const cities = await locationApiService.getCitiesByState(selectedState.name);
          setAvailableCities(cities);
        } catch (error) {
          console.error('Failed to load cities:', error);
          setAvailableCities([]);
        } finally {
          setIsLoadingCities(false);
        }
      } else {
        setAvailableCities([]);
      }
      
      // Reset city and address when state changes
      setFormData(prev => ({ ...prev, city: '', address: '' }));
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    }

    // Clear address suggestions when city changes
    if (name === 'city') {
      // Reset address when city changes
      setFormData(prev => ({ ...prev, address: '' }));
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    }

    // Handle address input for suggestions
    if (name === 'address') {
      if (value.length >= 2) {
        try {
          setIsLoadingAddresses(true);
          const suggestions = await locationApiService.getAddressSuggestions(
            value, 
            formData.city, 
            formData.state
          );
          setAddressSuggestions(suggestions);
          setShowAddressSuggestions(suggestions.length > 0);
        } catch (error) {
          console.error('Failed to load address suggestions:', error);
          setAddressSuggestions([]);
          setShowAddressSuggestions(false);
        } finally {
          setIsLoadingAddresses(false);
        }
      } else {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    }
  };

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setFormData(prev => ({ ...prev, address: suggestion.fullAddress }));
    setShowAddressSuggestions(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'videos' | 'documents') => {
    const files = Array.from(e.target.files || []);
    
    // Validate file count
    const maxCounts = { images: 8, videos: 2, documents: 3 };
    const currentCount = formData[type].length;
    const newCount = currentCount + files.length;
    
    if (newCount > maxCounts[type]) {
      alert(`Maximum ${maxCounts[type]} ${type} allowed`);
      return;
    }

    // Validate file types
    const allowedTypes = {
      images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      videos: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
      documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    const invalidFiles = files.filter(file => !allowedTypes[type].includes(file.type));
    if (invalidFiles.length > 0) {
      alert(`Invalid file type for ${type}`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ...files]
    }));

    // Create previews for images and videos
    if (type === 'images' || type === 'videos') {
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (type === 'images') {
            setPreviewImages(prev => [...prev, result]);
                  } else {
          // Video preview functionality can be added later
          console.log('Video uploaded:', file.name);
        }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number, type: 'images' | 'videos' | 'documents') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_: File, i: number) => i !== index)
    }));

    if (type === 'images') {
      setPreviewImages(prev => prev.filter((_: string, i: number) => i !== index));
    } else if (type === 'videos') {
      // Video preview functionality can be added later
      console.log('Video removed at index:', index);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'propertyType', 'listingType', 'price', 'address', 'city', 'state'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof PropertyFormData]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Ensure price is a number
    // if (!formData.price || formData.price === '') {
    //   alert('Please enter a valid price');
    //   return;
    // }

    try {
      // Convert form data to match CreatePropertyRequest interface
      const propertyData = {
        ...formData,
        price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price
      };
      
      const result = await dispatch(createProperty(propertyData)).unwrap();
      console.log('Property created successfully:', result);
      router.push('/my-listings');
    } catch (error) {
      console.error('Property creation failed:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Basic Details', description: 'Property information' },
    { number: 2, title: 'Location & Price', description: 'Address and pricing' },
    { number: 3, title: 'Media & Documents', description: 'Images, videos & files' }
  ];

  // Show loading while checking auth
  if (!authChecked) {
    return <AuthLoader />;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <Container>
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Add New Property</h1>
                  <p className="text-slate-600">List your property and reach thousands of potential buyers/renters</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => router.push('/my-listings')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </Container>
        </div>

      <Container>
        <div className="py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      currentStep >= step.number 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {step.number}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`font-medium ${currentStep >= step.number ? 'text-primary' : 'text-slate-500'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-400">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-20 h-1 mx-4 rounded-full transition-all duration-300 ${
                      currentStep > step.number ? 'bg-primary' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Basic Property Details</h2>
                    <p className="text-slate-600">Provide essential information about your property</p>
                  </div>

                  <div className="space-y-6">
                    {/* Property Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                        Property Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        placeholder="e.g., Beautiful 3 Bedroom Apartment in Victoria Island"
                      />
                    </div>

                    {/* Property Type and Listing Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="propertyType" className="block text-sm font-medium text-slate-700 mb-2">
                          Property Type *
                        </label>
                        <select
                          id="propertyType"
                          name="propertyType"
                          value={formData.propertyType}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        >
                          <option value="">Select property type</option>
                          {propertyTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="listingType" className="block text-sm font-medium text-slate-700 mb-2">
                          Listing Type *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {listingTypes.map(type => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, listingType: type.value }))}
                              className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                                formData.listingType === type.value
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              <div className={`w-3 h-3 rounded-full ${type.color} mx-auto mb-1`}></div>
                              <span className="text-sm font-medium">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                        Property Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
                        placeholder="Describe your property in detail. Include features, amenities, nearby landmarks, and what makes it special..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Price */}
              {currentStep === 2 && (
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Location & Pricing</h2>
                    <p className="text-slate-600">Specify where your property is located and set your price</p>
                  </div>

                  <div className="space-y-6">
                    {/* State and City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-2">
                          State *
                        </label>
                        <select
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          disabled={isLoadingStates}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {isLoadingStates ? 'Loading states...' : 'Select state'}
                          </option>
                          {nigerianStates.map(state => (
                            <option key={state.id} value={state.name}>{state.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">
                          City/Area *
                        </label>
                        <select
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.state || isLoadingCities || availableCities.length === 0}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {!formData.state 
                              ? 'Select state first' 
                              : isLoadingCities 
                                ? 'Loading cities...' 
                                : availableCities.length === 0 
                                  ? 'No cities available'
                                  : 'Select city/area'
                            }
                          </option>
                          {availableCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Street Address */}
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                        Street Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          onFocus={() => {
                            // Focus handler - suggestions will appear when user starts typing
                          }}
                          onBlur={() => {
                            // Delay hiding suggestions to allow for clicks
                            setTimeout(() => setShowAddressSuggestions(false), 200);
                          }}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          placeholder={
                            !formData.city 
                              ? "Select city first to see address suggestions" 
                              : "Start typing for address suggestions..."
                          }
                          disabled={!formData.city}
                        />
                        
                        {/* Address Suggestions Dropdown */}
                        {((showAddressSuggestions && addressSuggestions.length > 0) || isLoadingAddresses) && (
                          <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {isLoadingAddresses ? (
                              <div className="px-4 py-3 text-center text-slate-500">
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                  <span>Loading addresses...</span>
                                </div>
                              </div>
                            ) : (
                              addressSuggestions.map((suggestion, index) => (
                                <button
                                  key={suggestion.id || index}
                                  type="button"
                                  onClick={() => handleAddressSelect(suggestion)}
                                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-200 border-b border-slate-100 last:border-b-0"
                                >
                                  <div className="flex items-center space-x-3">
                                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <div className="flex-1">
                                      <span className="text-slate-700 block">{suggestion.fullAddress}</span>
                                      {suggestion.street !== suggestion.fullAddress && (
                                        <span className="text-xs text-slate-500">{suggestion.street}</span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                        
                      </div>
                      
                      {formData.city && (
                        <p className="mt-1 text-xs text-slate-500">
                          💡 Start typing to get real-time address suggestions for {formData.city}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                        Price * {formData.listingType === 'rent' && '(per year)'}
                        {formData.listingType === 'shortlet' && '(per night)'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold text-lg">₦</span>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          placeholder="Enter price amount"
                        />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {formData.listingType === 'rent' && 'Annual rent amount'}
                        {formData.listingType === 'sale' && 'Total sale price'}
                        {formData.listingType === 'shortlet' && 'Price per night'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Media & Documents */}
              {currentStep === 3 && (
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Media & Documents</h2>
                    <p className="text-slate-600">Upload images, videos, and documents for your property</p>
                  </div>

                  <div className="space-y-8">
                    {/* Images Upload */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Property Images (Max 8)
                        </label>
                        <span className="text-sm text-slate-500">{formData.images.length}/8</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {previewImages.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-xl border-2 border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index, 'images')}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        
                        {formData.images.length < 8 && (
                          <label className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors duration-200">
                            <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-sm text-slate-500">Add Image</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'images')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Videos Upload */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Property Videos (Max 2)
                        </label>
                        <span className="text-sm text-slate-500">{formData.videos.length}/2</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {formData.videos.map((video, index) => (
                          <div key={index} className="relative group">
                            <div className="w-full h-32 bg-slate-100 rounded-xl border-2 border-slate-200 flex items-center justify-center">
                              <div className="text-center">
                                <Video className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <span className="text-sm text-slate-600">{video.name}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index, 'videos')}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        
                        {formData.videos.length < 2 && (
                          <label className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors duration-200">
                            <Video className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-sm text-slate-500">Add Video</span>
                            <input
                              type="file"
                              multiple
                              accept="video/*"
                              onChange={(e) => handleFileUpload(e, 'videos')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Documents Upload */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Property Documents (Max 3)
                        </label>
                        <span className="text-sm text-slate-500">{formData.documents.length}/3</span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {formData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-slate-400" />
                              <span className="text-sm text-slate-600">{doc.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index, 'documents')}
                              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        
                        {formData.documents.length < 3 && (
                          <label className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors duration-200">
                            <FileText className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-sm text-slate-500">Add Document (PDF, DOC, DOCX)</span>
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileUpload(e, 'documents')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="px-8 pb-4">
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-600 text-sm">
                    {error}
                  </div>
                </div>
              )}

              {/* Form Navigation */}
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
                      >
                        <span>Continue</span>
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isLoading ? (
                          <>
                            <Loader size="sm" variant="spinner" className="text-white" />
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Create Property</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Container>
    </div>
    </MainLayout>
  );
}
