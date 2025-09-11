"use client";

import React, { useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  addToFavorites, 
  removeFromFavorites, 
  checkFavoriteStatus,
  selectIsPropertyFavorited,
  selectFavoriteNotes
} from '@/store/slices/favoriteSlice';
import { useToast } from '@/components/ui/useToast';

interface FavoriteButtonProps {
  propertyId: string;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  propertyId, 
  className = '',
  showText = false,
  size = 'md'
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const isFavorited = useAppSelector(selectIsPropertyFavorited(propertyId));
  const notes = useAppSelector(selectFavoriteNotes(propertyId));

  // Check favorite status on mount
  useEffect(() => {
    if (propertyId) {
      dispatch(checkFavoriteStatus(propertyId));
    }
  }, [dispatch, propertyId]);

  const handleToggleFavorite = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (isFavorited) {
        await dispatch(removeFromFavorites(propertyId)).unwrap();
        toast.success('Removed from favorites', 'Property has been removed from your favorites.');
      } else {
        await dispatch(addToFavorites({ propertyId })).unwrap();
        toast.success('Added to favorites', 'Property has been added to your favorites.');
      }
    } catch (error: any) {
      toast.error('Error', error || 'Failed to update favorites.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-10 h-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`
        ${getSizeClasses()}
        flex items-center justify-center
        rounded-full border-2 transition-all duration-200
        ${isFavorited 
          ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600' 
          : 'bg-white border-gray-300 text-gray-400 hover:border-red-500 hover:text-red-500'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        ${className}
      `}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={getIconSize()} />
      ) : (
        <Heart 
          size={getIconSize()} 
          className={isFavorited ? 'fill-current' : ''}
        />
      )}
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {isFavorited ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;


