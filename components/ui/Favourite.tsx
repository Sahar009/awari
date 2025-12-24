"use client";

import React, { useEffect, useState } from "react";
import { Heart, Loader2, Bug } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  checkFavoriteStatus,
  toggleFavorite
} from '@/store/slices/favoriteSlice';
import { useToast } from '@/components/ui/useToast';
import { debugUtils } from '@/lib/debugUtils';

interface FavouriteProps {
  propertyId: string;
  size?: number;
  className?: string;
  debugMode?: boolean;
}

export const Favourite: React.FC<FavouriteProps> = ({ 
  propertyId, 
  size = 25,
  className = "",
  debugMode = false
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const componentId = React.useMemo(() => Math.random().toString(36).substr(2, 9), []);
  const clickCountRef = React.useRef(0);
  
  const isFavorited = useAppSelector((state) => {
    const favoriteState = (state as { favorite: { favoriteStatus?: Record<string, { isFavorited: boolean }>, favorites?: Array<{ propertyId: string }> } }).favorite;
    
    // First check the favoriteStatus map
    const statusInfo = favoriteState?.favoriteStatus?.[propertyId];
    if (statusInfo?.isFavorited) {
      return true;
    }
    
    // Then check the favorites list
    const list = favoriteState?.favorites as Array<{ propertyId: string }> | undefined;
    const inList = Array.isArray(list) ? list.some(item => item.propertyId === propertyId) : false;
    
    return inList;
  });

  // Check favorite status on mount (only if not already in state)
  useEffect(() => {
    if (propertyId) {
      dispatch(checkFavoriteStatus(propertyId));
      
      // Run debug tests if debug mode is enabled
      if (debugMode) {
        debugUtils.runAllTests(propertyId);
      }
    }
  }, [dispatch, propertyId, debugMode]);

  const toggleLike = async (e?: React.MouseEvent<HTMLDivElement>) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (isLoading || !propertyId) return;
    
    setIsLoading(true);
    
    try {
      clickCountRef.current += 1;
      console.log(`[Favourite-${componentId}] toggling favorite for property:`, propertyId, `(Click #${clickCountRef.current})`);
      const result = await dispatch(toggleFavorite({ propertyId })).unwrap();
      
      console.log(`[Favourite-${componentId}] toggleFavorite result:`, result);
      
      if (result.action === 'added') {
        toast.success('Success', result.apiMessage || 'Property has been added to your favorites.');
      } else if (result.action === 'removed') {
        toast.success('Success', result.apiMessage || 'Property has been removed from your favorites.');
      }
      
      // State is already updated by toggleFavorite action, no need to refresh
    } catch (error: unknown) {
      console.error(`[Favourite-${componentId}] Error during toggle:`, error);
      
      // Show more specific error messages
      let errorTitle = 'Error';
      let errorMessage = 'Failed to update favorites.';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Check for authentication errors
      if (errorMessage.includes('log in') || errorMessage.includes('unauthorized')) {
        errorTitle = 'Authentication Required';
        errorMessage = 'Please log in to manage your favorites.';
      } else if (errorMessage.includes('already in')) {
        errorTitle = 'Already Added';
        errorMessage = 'This property is already in your favorites.';
      } else if (errorMessage.includes('not found')) {
        errorTitle = 'Property Not Found';
        errorMessage = 'This property could not be found.';
      } else if (errorMessage.includes('server error')) {
        errorTitle = 'Server Error';
        errorMessage = 'Please try again later.';
      }
      
      toast.error(errorTitle, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div
        onClick={toggleLike}
        className={`bg-white rounded-full p-2 shadow-md cursor-pointer hover:scale-110 transition z-10 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isLoading ? (
          <Loader2 size={size} className="animate-spin text-primary" />
        ) : (
          <Heart
            size={size}
            className={isFavorited ? "text-[#BE79DF]" : "text-gray-400"}
            fill={isFavorited ? "currentColor" : "none"}
            strokeWidth={2}
          />
        )}
      </div>
      
      {/* Debug button - only show in debug mode */}
      {debugMode && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            debugUtils.runAllTests(propertyId);
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 cursor-pointer hover:bg-red-600 transition z-20"
          title="Run debug tests"
        >
          <Bug size={12} />
        </div>
      )}
    </div>
  );
};
