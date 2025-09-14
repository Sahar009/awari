"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Container from "@/components/Container";
import { Card } from "@/components/ui/Card";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchFavorites, 
  clearAllFavorites,
  selectFavorites,
  selectIsLoading,
  selectError,
  selectTotal,
  selectCurrentPage,
  selectTotalPages,
  selectHasNextPage,
  selectHasPrevPage,
  selectFilters,
  setFilters,
  setCurrentPage,
  clearError
} from '@/store/slices/favoriteSlice';
import { Loader } from '../ui/Loader';
import { AlertCircle, RefreshCw, Heart, Filter, X } from 'lucide-react';
import { useToast } from '@/components/ui/useToast';
import ConfirmModal from '@/components/ui/ConfirmModal';

const FavoritesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const favorites = useAppSelector(selectFavorites);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const total = useAppSelector(selectTotal);
  const currentPage = useAppSelector(selectCurrentPage);
  const totalPages = useAppSelector(selectTotalPages);
  const hasNextPage = useAppSelector(selectHasNextPage);
  const hasPrevPage = useAppSelector(selectHasPrevPage);
  const filters = useAppSelector(selectFilters);

  const loadFavorites = useCallback(() => {
    console.log('🔄 Loading favorites with filters:', filters);
    dispatch(fetchFavorites(filters));
  }, [dispatch, filters]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 FavoritesPage State Debug:', { 
      favoritesCount: favorites.length, 
      isLoading, 
      error, 
      total,
      currentPage,
      totalPages,
      hasNextPage,
      hasPrevPage,
      favorites: favorites // Log the actual favorites array
    });
  }, [favorites, isLoading, error, total, currentPage, totalPages, hasNextPage, hasPrevPage]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Timeout fallback - if we've been loading for more than 10 seconds, stop showing loader
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('⏰ Loading timeout - forcing loader to stop');
        // We can't directly set isLoading to false, but we can log it for debugging
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    dispatch(setFilters({ ...filters, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAll = () => {
    setShowConfirmDialog(true);
  };

  const confirmClearAll = async () => {
    try {
      await dispatch(clearAllFavorites()).unwrap();
      toast.success('Favorites cleared', 'All your favorites have been removed.');
      setShowConfirmDialog(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear favorites.';
      toast.error('Error', errorMessage);
      setShowConfirmDialog(false);
    }
  };

  const cancelClearAll = () => {
    setShowConfirmDialog(false);
  };

  const handleRetry = () => {
    dispatch(clearError());
    loadFavorites();
  };

  // Show loader only when initially loading and no favorites exist
  if (isLoading && favorites.length === 0 && !error) {
    console.log('⏳ Showing initial loader - isLoading:', isLoading, 'favorites.length:', favorites.length, 'error:', error);
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader />
        </div>
      </Container>
    );
  }

  // Debug: Log when we should be showing favorites
  console.log('🔍 FavoritesPage Render Debug:', {
    shouldShowLoader: isLoading && favorites.length === 0 && !error,
    shouldShowError: error && favorites.length === 0,
    shouldShowFavorites: favorites.length > 0,
    shouldShowEmpty: favorites.length === 0 && !isLoading && !error,
    favoritesLength: favorites.length,
    isLoading,
    error
  });

  if (error && favorites.length === 0) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Favorites</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="my-15 flex flex-col gap-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {favorites.length > 0 ? `You have ${favorites.length} favorite properties` : 'No favorite properties yet'}
          </p>
        </div>

        {/* Actions */}
        {favorites.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>

            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • Total: {total}
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters.propertyType || ''}
                  onChange={(e) => handleFilterChange({ propertyType: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="condo">Condo</option>
                  <option value="studio">Studio</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="duplex">Duplex</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                  <option value="office">Office</option>
                  <option value="shop">Shop</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Type
                </label>
                <select
                  value={filters.listingType || ''}
                  onChange={(e) => handleFilterChange({ listingType: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Listings</option>
                  <option value="rent">Rent</option>
                  <option value="sale">Sale</option>
                  <option value="shortlet">Shortlet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange({ status: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Heart className="w-24 h-24 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
            <p className="text-gray-600 mb-4">
              Start exploring properties and add them to your favorites by clicking the heart icon.
            </p>
            <button
              onClick={() => window.location.href = '/browse-listing'}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <>
            <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {favorites.map((favorite) => (
                <div key={favorite.id}>
                  <Card
                    ImageSrc={favorite.property.media?.[0]?.url || '/assets/images/houseimg (1).jpg'}
                    Title={favorite.property.title}
                    description={favorite.property.description}
                    price={`₦${parseFloat(favorite.property.price).toLocaleString('en-NG')}`}
                    liked={true}
                    location={`${favorite.property.city}, ${favorite.property.state}`}
                    type={favorite.property.propertyType}
                    propertyId={favorite.property.id}
                  />
                </div>
              ))}
            </div>

            {/* Loading overlay for pagination */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader />
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevPage || isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoading}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        } disabled:opacity-50`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage || isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmDialog}
        title="Clear All Favorites"
        message="Are you sure you want to clear all favorites? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={confirmClearAll}
        onCancel={cancelClearAll}
      />
    </Container>
  );
};

export default FavoritesPage;
