"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  getProfile, 
  updateProfile, 
  selectUser, 
  selectAuthLoading
} from '@/store/slices/authSlice';
import {
  fetchKycDocuments,
  fetchKycStatus,
  deleteKycDocument,
  selectKycDocuments,
  selectKycStatus,
  selectKycLoading,
  selectCanEditKyc,
  selectKycIsApproved
} from '@/store/slices/kycSlice';
import { useToast } from '@/components/ui/useToast';
import { Loader } from '@/components/ui/Loader';
import MainLayout from '@/app/mainLayout';
import KycUploadModal from '@/components/kyc/KycUploadModal';
import { liveLocationApiService, type NigerianState, type AddressSuggestion } from '@/services/liveLocationApi';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Camera,
  Trash2,
  PenTool,
  Eye,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Image from 'next/image';
import FundWalletModal from '@/components/wallet/FundWalletModal';
import WithdrawModal from '@/components/wallet/WithdrawModal';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender?: 'male' | 'female' | 'other';
  address: string;
  city: string;
  state: string;
  language: string;
  bio: string;
}

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  
  // Auth state
  const user = useAppSelector(selectUser);
  const authLoading = useAppSelector(selectAuthLoading);
  
  // KYC state
  const kycDocuments = useAppSelector(selectKycDocuments);
  const kycStatus = useAppSelector(selectKycStatus);
  const kycLoading = useAppSelector(selectKycLoading);
  const canEditKyc = useAppSelector(selectCanEditKyc);
  const kycIsApproved = useAppSelector(selectKycIsApproved);

  // Debug logging
  console.log('🔍 Profile Page - kycDocuments:', kycDocuments);
  console.log('🔍 Profile Page - kycLoading:', kycLoading);
  
  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc'>('profile');
  const [showKycUploadModal, setShowKycUploadModal] = useState(false);
  
  // Wallet state
  const [walletData, setWalletData] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [showFundWalletModal, setShowFundWalletModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  // Location state
  const [states, setStates] = useState<NigerianState[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const addressDropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: undefined,
    address: '',
    city: '',
    state: '',
    language: 'en',
    bio: '',
  });

  // Load user profile and KYC data
  useEffect(() => {
    dispatch(getProfile());
    dispatch(fetchKycDocuments({}));
    dispatch(fetchKycStatus());
    fetchWalletData();
  }, [dispatch]);

  // Fetch wallet data
  const fetchWalletData = async () => {
    setWalletLoading(true);
    setWalletError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setWalletError('Please log in to view wallet');
        setWalletLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      console.log('Fetching wallet from:', `${apiUrl}/wallet`);

      const response = await fetch(`${apiUrl}/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Wallet API response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Wallet endpoint not found. Please ensure the backend server is running.');
        }
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Failed to fetch wallet data (${response.status})`);
      }

      const data = await response.json();
      console.log('Wallet data received:', data);
      
      if (data.success) {
        setWalletData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch wallet data');
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      setWalletError(error instanceof Error ? error.message : 'Failed to load wallet');
    } finally {
      setWalletLoading(false);
    }
  };

  // Load Nigerian states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await liveLocationApiService.getAllStates();
        setStates(statesData);
      } catch (error) {
        console.error('Failed to load states:', error);
      }
    };
    
    loadStates();
  }, []);

  // Handle clicks outside address dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(event.target as Node)) {
        setShowAddressDropdown(false);
      }
    };

    if (showAddressDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddressDropdown]);

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender,
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        language: user.language || 'en',
        bio: user.bio || '',
      });

      // Load cities for user's state if available
      if (user.state) {
        const loadUserCities = async () => {
          try {
            const userState = user.state;
            if (userState) {
              const citiesData = await liveLocationApiService.getCitiesByState(userState);
              setCities(citiesData);
            }
          } catch (error) {
            console.error('Failed to load cities for user state:', error);
          }
        };
        loadUserCities();
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateName = e.target.value;
    setFormData(prev => ({
      ...prev,
      state: stateName,
      city: '', // Reset city when state changes
      address: '' // Reset address when state changes
    }));

    // Load cities for selected state
    if (stateName) {
      setIsLoadingLocations(true);
      try {
        const citiesData = await liveLocationApiService.getCitiesByState(stateName);
        setCities(citiesData);
      } catch (error) {
        console.error('Failed to load cities:', error);
        setCities([]);
      } finally {
        setIsLoadingLocations(false);
      }
    } else {
      setCities([]);
    }
    
    // Clear address suggestions
    setAddressSuggestions([]);
    setShowAddressDropdown(false);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setFormData(prev => ({
      ...prev,
      city: city,
      address: '' // Reset address when city changes
    }));
    
    // Clear address suggestions
    setAddressSuggestions([]);
    setShowAddressDropdown(false);
  };

  const handleAddressInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setFormData(prev => ({
      ...prev,
      address: address
    }));

    // Get address suggestions if we have enough context
    if (address.length >= 2 && formData.city && formData.state) {
      setIsLoadingLocations(true);
      try {
        const suggestions = await liveLocationApiService.getAddressSuggestions(
          address,
          formData.city,
          formData.state
        );
        setAddressSuggestions(suggestions);
        setShowAddressDropdown(suggestions.length > 0);
      } catch (error) {
        console.error('Failed to get address suggestions:', error);
        setAddressSuggestions([]);
        setShowAddressDropdown(false);
      } finally {
        setIsLoadingLocations(false);
      }
    } else {
      setAddressSuggestions([]);
      setShowAddressDropdown(false);
    }
  };

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setFormData(prev => ({
      ...prev,
      address: suggestion.fullAddress
    }));
    setShowAddressDropdown(false);
    setAddressSuggestions([]);
  };

  const validateProfileData = (): string[] => {
    const errors: string[] = [];
    
    // Validate date of birth (must be at least 18 years old)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        // Haven't had birthday this year yet
        if (age - 1 < 18) {
          errors.push('You must be at least 18 years old');
        }
      } else if (age < 18) {
        errors.push('You must be at least 18 years old');
      }
    }
    
    // Validate phone number format (basic validation)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.push('Please enter a valid phone number');
    }
    
    return errors;
  };

  const handleSaveProfile = async () => {
    // Client-side validation
    const validationErrors = validateProfileData();
    if (validationErrors.length > 0) {
      toast.error('Validation Error', validationErrors.join(', '));
      return;
    }
    
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
      toast.success('Success', 'Profile updated successfully');
    } catch (error: unknown) {
      // Handle structured error response from updateProfile thunk
      if (error && typeof error === 'object' && 'type' in error && error.type === 'validation') {
        // Show validation errors in a user-friendly way
        const errorMessages = (error as unknown as { errors: Array<{ path: string; msg: string }> }).errors.map((err) => {
          switch (err.path) {
            case 'dateOfBirth':
              return 'You must be at least 18 years old';
            case 'phone':
              return 'Please enter a valid phone number';
            case 'email':
              return 'Please enter a valid email address';
            default:
              return `${err.path}: ${err.msg}`;
          }
        });
        
        toast.error('Validation Error', errorMessages.join(', '));
      } else {
        // Handle general errors
        const errorMessage = (error as Error)?.message || 'Failed to update profile';
        toast.error('Error', errorMessage);
      }
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender,
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        language: user.language || 'en',
        bio: user.bio || '',
      });
    }
    setIsEditing(false);
  };

  const handleDeleteKycDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await dispatch(deleteKycDocument(documentId)).unwrap();
      toast.success('Success', 'Document deleted successfully');
      // Refresh KYC data
      dispatch(fetchKycDocuments({}));
      dispatch(fetchKycStatus());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete document';
      toast.error('Error', errorMessage);
    }
  };

  const handleKycUploadSuccess = () => {
    // Refresh KYC data after successful upload
    dispatch(fetchKycDocuments({}));
    dispatch(fetchKycStatus());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'suspended':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'banned':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'landlord':
        return 'bg-blue-100 text-blue-800';
      case 'agent':
        return 'bg-purple-100 text-purple-800';
      case 'hotel_provider':
        return 'bg-orange-100 text-orange-800';
      case 'buyer':
        return 'bg-green-100 text-green-800';
      case 'renter':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || kycLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600">Please log in to view your profile.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100 mb-8">
          {/* Decorative background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
          
          <div className="relative px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-white shadow-lg">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2.5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-gray-100 hover:border-primary">
                    <Camera className="h-4 w-4 text-gray-600 hover:text-primary transition-colors" />
                  </button>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${getRoleColor(user.role)} shadow-sm`}>
                      {user.role.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(user.status)}
                      <span className="text-sm text-gray-600 capitalize">{user.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                    {user.emailVerified && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
                >
                  <Edit3 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'kyc'
                ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
            }`}
          >
            KYC Documents
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    Personal Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{user.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{user.lastName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                        />
                      ) : (
                        <div className="flex items-center gap-2 py-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                          {user.phoneVerified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            You must be at least 18 years old
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 py-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">
                            {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={formData.gender || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 py-2 capitalize">{user.gender || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      {isEditing ? (
                        <select
                          name="language"
                          value={formData.language}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                        >
                          <option value="en">English</option>
                          <option value="fr">French</option>
                          <option value="es">Spanish</option>
                          <option value="de">German</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 py-2 uppercase">{user.language || 'EN'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{user.bio || 'No bio provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mt-6 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Address Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      {isEditing ? (
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleStateChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isLoadingLocations}
                        >
                          <option value="">Select state</option>
                          {states.map((state) => (
                            <option key={state.id} value={state.name}>
                              {state.name} ({state.code})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-900 py-2">{user.state || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      {isEditing ? (
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleCityChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!formData.state || isLoadingLocations}
                        >
                          <option value="">Select city</option>
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-900 py-2">{user.city || 'Not provided'}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      {isEditing ? (
                        <div className="relative" ref={addressDropdownRef}>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleAddressInputChange}
                            onFocus={() => setShowAddressDropdown(addressSuggestions.length > 0)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder={formData.state && formData.city ? "Enter your address" : "Select state and city first"}
                            disabled={!formData.state || !formData.city}
                          />
                          
                          {/* Address Suggestions Dropdown */}
                          {showAddressDropdown && addressSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {addressSuggestions.map((suggestion) => (
                                <button
                                  key={suggestion.id}
                                  type="button"
                                  onClick={() => handleAddressSelect(suggestion)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="text-sm text-gray-900">{suggestion.fullAddress}</div>
                                  {suggestion.street && (
                                    <div className="text-xs text-gray-500">{suggestion.street}</div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Loading indicator */}
                          {isLoadingLocations && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 py-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{user.address || 'Not provided'}</span>
                        </div>
                      )}
                      
                      {/* Help text */}
                      {isEditing && formData.state && formData.city && (
                        <p className="text-xs text-gray-500 mt-1">
                          Start typing to get address suggestions for {formData.city}, {formData.state}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Wallet Section */}
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg mb-6 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/20">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">My Wallet</h3>
                  </div>
                </div>
                <div className="p-6">
                  {walletLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : walletError ? (
                    <div className="text-center py-4">
                      <AlertCircle className="h-8 w-8 text-white/70 mx-auto mb-2" />
                      <p className="text-sm text-white/80">{walletError}</p>
                      <button
                        onClick={fetchWalletData}
                        className="mt-3 text-sm text-white underline hover:no-underline"
                      >
                        Retry
                      </button>
                    </div>
                  ) : walletData ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-white/80 mb-1">Available Balance</p>
                        <p className="text-3xl font-bold text-white">
                          ₦{parseFloat(walletData.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-white/60 mt-1">{walletData.currency || 'NGN'}</p>
                      </div>
                      
                      {walletData.accountNumber && (
                        <div className="pt-4 border-t border-white/20">
                          <p className="text-xs text-white/80 mb-2">Fund via Bank Transfer</p>
                          <div className="bg-white/10 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-white/70">Account Number</span>
                              <span className="text-sm font-mono font-semibold text-white">{walletData.accountNumber}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-white/70">Bank Name</span>
                              <span className="text-sm font-medium text-white">{walletData.bankName}</span>
                            </div>
                            {walletData.accountName && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-white/70">Account Name</span>
                                <span className="text-sm font-medium text-white">{walletData.accountName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 space-y-2">
                        <button 
                          onClick={() => setShowFundWalletModal(true)}
                          className="w-full bg-white text-primary py-2.5 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2 hover:shadow-lg"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          Fund Wallet
                        </button>
                        <button 
                          onClick={() => setShowWithdrawModal(true)}
                          className="w-full bg-white/10 text-white py-2.5 rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2 border border-white/20 hover:shadow-lg"
                        >
                          <ArrowDownRight className="h-4 w-4" />
                          Withdraw
                        </button>
                      </div>
                      
                      <div className="pt-4 border-t border-white/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            walletData.status === 'active' 
                              ? 'bg-green-500/20 text-green-100' 
                              : 'bg-yellow-500/20 text-yellow-100'
                          }`}>
                            {walletData.status || 'Active'}
                          </span>
                        </div>
                        {walletData.lastTransactionAt && (
                          <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-white/70">Last Transaction</span>
                            <span className="text-white/90 text-xs">
                              {new Date(walletData.lastTransactionAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Wallet className="h-8 w-8 text-white/70 mx-auto mb-2" />
                      <p className="text-sm text-white/80">No wallet data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Account Status
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-sm transition-shadow">
                    <span className="text-sm font-medium text-gray-700">Email Verified</span>
                    <div className="flex items-center gap-2">
                      {user.emailVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`text-sm font-semibold ${
                        user.emailVerified ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.emailVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-sm transition-shadow">
                    <span className="text-sm font-medium text-gray-700">Phone Verified</span>
                    <div className="flex items-center gap-2">
                      {user.phoneVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`text-sm font-semibold ${
                        user.phoneVerified ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.phoneVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-sm transition-shadow">
                    <span className="text-sm font-medium text-gray-700">KYC Verified</span>
                    <div className="flex items-center gap-2">
                      {user.kycVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`text-sm font-semibold ${
                        user.kycVerified ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.kycVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-sm transition-shadow">
                    <span className="text-sm font-medium text-gray-700">Profile Completed</span>
                    <div className="flex items-center gap-2">
                      {user.profileCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`text-sm font-semibold ${
                        user.profileCompleted ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.profileCompleted ? 'Completed' : 'Incomplete'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Statistics */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Account Statistics
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-sm transition-shadow">
                    <span className="text-sm font-medium text-gray-700">Login Count</span>
                    <span className="text-lg font-bold text-primary">{user.loginCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-sm transition-shadow">
                    <span className="text-sm font-medium text-gray-700">Member Since</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-sm transition-shadow">
                    <span className="text-sm font-medium text-gray-700">Last Login</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div className="space-y-6">
            {/* KYC Status Overview */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-6 border-b bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Verification Status</h2>
                    <p className="text-sm text-gray-600">Track your KYC verification progress</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {kycStatus ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                          {getKycStatusIcon(kycStatus.status)}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 capitalize text-sm">{kycStatus.status}</h3>
                      <p className="text-xs text-gray-600 mt-1">Overall Status</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {kycStatus.submittedDocuments}
                      </div>
                      <p className="text-xs text-gray-600">Documents Submitted</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-3xl font-bold text-gray-700 mb-2">
                        {kycStatus.requiredDocuments}
                      </div>
                      <p className="text-xs text-gray-600">Required Documents</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {kycStatus.isVerified ? '100%' : Math.round((kycStatus.submittedDocuments / kycStatus.requiredDocuments) * 100)}%
                      </div>
                      <p className="text-xs text-gray-600">Verification Progress</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No KYC Status Available</h3>
                    <p className="text-gray-600">Submit your documents to start the verification process.</p>
                  </div>
                )}
              </div>
            </div>

            {/* KYC Documents */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">KYC Verification</h2>
                      <p className="text-sm text-gray-600">Upload your identity documents for verification</p>
                    </div>
                  </div>
                  {canEditKyc && (
                    <button 
                      onClick={() => setShowKycUploadModal(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <PenTool className="h-4 w-4" />
                      <span className="font-medium">Add Document</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6">
                {kycDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kycDocuments.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm capitalize">
                                {doc.documentType.replace('_', ' ')}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {canEditKyc && (
                              <button 
                                onClick={() => handleDeleteKycDocument(doc.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete document"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            <button 
                              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View document"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {doc.documentNumber && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Number:</span> {doc.documentNumber}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getKycStatusIcon(doc.status)}
                            <span className="text-sm font-medium capitalize">{doc.status}</span>
                          </div>
                          {doc.expiresAt && (
                            <p className="text-xs text-gray-500">
                              Expires: {new Date(doc.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        {doc.rejectionReason && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-red-800">Rejection Reason</p>
                                <p className="text-xs text-red-700 mt-1">{doc.rejectionReason}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Shield className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Start KYC Verification</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                      Upload your identity documents to complete KYC verification and unlock all platform features.
                    </p>
                    {canEditKyc && (
                      <button 
                        onClick={() => setShowKycUploadModal(true)}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 mx-auto"
                      >
                        <PenTool className="h-5 w-5" />
                        <span className="font-medium">Upload Document</span>
                      </button>
                    )}
                    
                    {!canEditKyc && kycIsApproved && (
                      <div className="flex items-center gap-2 text-green-600 mx-auto w-fit">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">KYC Verified</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save/Cancel Buttons */}
        {isEditing && activeTab === 'profile' && (
          <div className="fixed bottom-8 right-8 flex gap-3">
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        )}

        {/* KYC Upload Modal */}
        {showKycUploadModal && (
          <KycUploadModal
            isOpen={showKycUploadModal}
            onClose={() => setShowKycUploadModal(false)}
            onSuccess={handleKycUploadSuccess}
          />
        )}

        {/* Fund Wallet Modal */}
        <FundWalletModal
          isOpen={showFundWalletModal}
          onClose={() => setShowFundWalletModal(false)}
          userEmail={user?.email || ''}
          userName={`${user?.firstName} ${user?.lastName}` || ''}
          onSuccess={() => {
            fetchWalletData();
            toast.success('Success', 'Wallet funded successfully!');
          }}
        />

        {/* Withdraw Modal */}
        <WithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          walletBalance={walletData?.balance || 0}
          onSuccess={() => {
            fetchWalletData();
            toast.success('Success', 'Withdrawal request submitted successfully!');
          }}
        />
      </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
