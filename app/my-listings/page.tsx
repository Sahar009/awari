'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Building2, 
  Filter, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Video,
  FileText,
  MoreHorizontal,
  Calendar,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchMyProperties, deleteProperty, updateProperty, setCurrentPage, type Property } from '@/store/slices/propertySlice';
import Container from '@/components/Container';
import MainLayout from '../mainLayout';
import { AuthLoader } from '@/components/ui/Loader';
import SearchableSelect from '@/components/ui/Select';
import Image from 'next/image';

interface FilterState {
  status: string;
  propertyType: string;
  listingType: string;
  search: string;
}

export default function MyListingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const { myProperties, isLoading, totalPages, currentPage, total } = useAppSelector((state) => state.property);
  
  const [authChecked, setAuthChecked] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    propertyType: '',
    listingType: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [togglingPropertyId, setTogglingPropertyId] = useState<string | null>(null);

  // Filter options
  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Draft', value: 'draft' },
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Sold', value: 'sold' },
    { label: 'Rented', value: 'rented' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Archived', value: 'archived' }
  ];

  const propertyTypeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Apartment', value: 'apartment' },
    { label: 'House', value: 'house' },
    { label: 'Villa', value: 'villa' },
    { label: 'Condo', value: 'condo' },
    { label: 'Studio', value: 'studio' },
    { label: 'Penthouse', value: 'penthouse' },
    { label: 'Townhouse', value: 'townhouse' },
    { label: 'Duplex', value: 'duplex' },
    { label: 'Bungalow', value: 'bungalow' },
    { label: 'Land', value: 'land' },
    { label: 'Commercial', value: 'commercial' },
    { label: 'Office', value: 'office' },
    { label: 'Shop', value: 'shop' },
    { label: 'Warehouse', value: 'warehouse' }
  ];

  const listingTypeOptions = [
    { label: 'All Listings', value: '' },
    { label: 'For Rent', value: 'rent' },
    { label: 'For Sale', value: 'sale' },
    { label: 'Short Let', value: 'shortlet' }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const currentHasAccess = isAuthenticated || !!token || !!localToken;
      
      if (!currentHasAccess) {
        router.push('/auth/login');
        return;
      }
      
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [isAuthenticated, token, router]);

  const loadProperties = useCallback(() => {
    const params = {
      page: currentPage,
      limit: 12,
      ...(filters.status && { status: filters.status }),
      ...(filters.propertyType && { propertyType: filters.propertyType }),
      ...(filters.listingType && { listingType: filters.listingType }),
      ...(filters.search && { search: filters.search })
    };
    dispatch(fetchMyProperties(params));
  }, [currentPage, filters.status, filters.propertyType, filters.listingType, filters.search, dispatch]);

  useEffect(() => {
    if (authChecked) {
      loadProperties();
    }
  }, [authChecked, filters, currentPage, loadProperties]);

  const handleDelete = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      await dispatch(deleteProperty(propertyId));
      loadProperties(); // Refresh the list
    }
  };

  const handleToggleStatus = async (propertyId: string, currentStatus: string) => {
    if (togglingPropertyId === propertyId) return; // Prevent double clicks
    
    try {
      setTogglingPropertyId(propertyId);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await dispatch(updateProperty({
        propertyId,
        propertyData: { status: newStatus as 'active' | 'inactive' }
      })).unwrap();
      loadProperties(); // Refresh the list
    } catch (error) {
      console.error('Failed to toggle property status:', error);
      alert('Failed to update property status. Please try again.');
    } finally {
      setTogglingPropertyId(null);
    }
  };

  // Helper function to get primary image from media array
  const getPrimaryImage = (property: Property) => {
    if (!property.media || property.media.length === 0) return null;
    // Find primary image first, otherwise use first image
    const primaryImage = property.media.find((m) => m.isPrimary && m.mediaType === 'image');
    if (primaryImage) return primaryImage.url;
    const firstImage = property.media.find((m) => m.mediaType === 'image');
    return firstImage ? firstImage.url : null;
  };

  // Helper function to get location string
  const getLocationString = (property: Property) => {
    const parts = [property.address, property.city, property.state].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  };

  // Helper function to get area
  const getArea = (property: Property) => {
    if (property.floorArea) return `${property.floorArea} sqm`;
    if (property.landArea) return `${property.landArea} sqm`;
    return 'N/A';
  };

  // Helper function to count media by type
  const getMediaCount = (property: Property, type: 'image' | 'video' | 'document') => {
    if (!property.media) return 0;
    return property.media.filter((m) => m.mediaType === type && m.isActive).length;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { icon: Edit, color: 'bg-gray-100 text-gray-700', label: 'Draft' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      active: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Active' },
      inactive: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Inactive' },
      sold: { icon: TrendingUp, color: 'bg-blue-100 text-blue-700', label: 'Sold' },
      rented: { icon: CheckCircle, color: 'bg-purple-100 text-purple-700', label: 'Rented' },
      rejected: { icon: AlertCircle, color: 'bg-red-100 text-red-700', label: 'Rejected' },
      archived: { icon: FileText, color: 'bg-gray-100 text-gray-700', label: 'Archived' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  // Show loading while checking auth
  if (!authChecked) {
    return <AuthLoader />;
  }

  if (isLoading && myProperties.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 pt-20">
          <Container>
            <div className="py-8">
              <AuthLoader />
            </div>
          </Container>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 pt-20">
        <Container>
          <div className="py-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">My Listings</h1>
                <p className="text-slate-600 mt-2">
                  {total > 0 ? `Manage your ${total} property listings` : 'Manage your property listings'}
                </p>
              </div>
              <button
                onClick={() => router.push('/add-property')}
                className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Property</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-all ${
                    showFilters 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-slate-600 border-slate-300 hover:border-primary'
                  }`}
                >
                  <Filter size={20} />
                  <span>Filters</span>
                </button>
              </div>

              {/* Expandable Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
                  <SearchableSelect
                    options={statusOptions}
                    value={filters.status}
                    onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    placeholder="Filter by Status"
                    className="w-full"
                  />
                  <SearchableSelect
                    options={propertyTypeOptions}
                    value={filters.propertyType}
                    onChange={(value) => setFilters(prev => ({ ...prev, propertyType: value }))}
                    placeholder="Filter by Type"
                    className="w-full"
                  />
                  <SearchableSelect
                    options={listingTypeOptions}
                    value={filters.listingType}
                    onChange={(value) => setFilters(prev => ({ ...prev, listingType: value }))}
                    placeholder="Filter by Listing"
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Properties Grid */}
            {myProperties.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">No properties found</h2>
                <p className="text-slate-600 mb-6">
                  {filters.status || filters.propertyType || filters.listingType || filters.search
                    ? 'Try adjusting your filters or search terms'
                    : 'Start by adding your first property listing'
                  }
                </p>
                <button
                  onClick={() => router.push('/add-property')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Your First Property</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProperties.map((property) => (
                  <div key={property.id} className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    {/* Property Image */}
                    <div className="relative h-48 bg-slate-200">
                      {getPrimaryImage(property) ? (
                        <Image
                          src={getPrimaryImage(property)!}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Building2 className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(property.status as string)}
                      </div>

                      {/* Actions Dropdown */}
                      <div className="absolute top-3 right-3">
                        <div className="relative">
                          <button
                            onClick={() => setSelectedProperty(selectedProperty === property.id ? null : property.id)}
                            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          
                          {selectedProperty === property.id && (
                            <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10">
                              <button
                                onClick={() => router.push(`/product-details?id=${property.id}`)}
                                className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-slate-50 transition-colors"
                              >
                                <Eye size={16} />
                                <span>View Details</span>
                              </button>
                              <button
                                onClick={() => router.push(`/edit-property/${property.id}`)}
                                className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-slate-50 transition-colors"
                              >
                                <Edit size={16} />
                                <span>Edit Property</span>
                              </button>
                              <button
                                onClick={() => handleDelete(property.id)}
                                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Property Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-slate-800 mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center gap-1 text-slate-600 mb-3">
                        <MapPin size={16} />
                        <span className="text-sm">{getLocationString(property)}</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary">
                          ₦{parseFloat(property.price).toLocaleString('en-NG')}
                        </span>
                        <span className="text-sm text-slate-500 capitalize">
                          {property.status}
                        </span>
                      </div>

                      {/* Property Details */}
                      <div className="flex justify-between text-sm text-slate-600 mb-4">
                        <span>{property.bedrooms || 0} beds</span>
                        <span>{property.bathrooms || 0} baths</span>
                        <span>{getArea(property)}</span>
                      </div>

                      {/* Media Count */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 border-t pt-4">
                        <div className="flex items-center gap-1">
                          <ImageIcon size={14} />
                          <span>{getMediaCount(property, 'image')} photos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video size={14} />
                          <span>{getMediaCount(property, 'video')} videos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText size={14} />
                          <span>{getMediaCount(property, 'document')} docs</span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                        <Calendar size={14} />
                        <span>Created {new Date(property.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Availability Toggle */}
                      {(property.status === 'active' || property.status === 'inactive') && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-medium text-slate-700">
                              {property.status === 'active' ? 'Available' : 'Unavailable'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(property.id, property.status)}
                              disabled={togglingPropertyId === property.id}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                property.status === 'active' ? 'bg-green-500' : 'bg-slate-300'
                              }`}
                            >
                              {togglingPropertyId === property.id ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              ) : (
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    property.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              )}
                            </button>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        dispatch(setCurrentPage(page));
                      }}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        page === currentPage
                          ? 'bg-primary text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>
    </MainLayout>
  );
}
