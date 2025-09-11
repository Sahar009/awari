"use client";

import { Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  addToFavorites, 
  removeFromFavorites, 
  checkFavoriteStatus,
  selectIsPropertyFavorited
} from '@/store/slices/favoriteSlice';
import { useToast } from '@/components/ui/useToast';

interface FavouriteProps {
  propertyId: string;
  size?: number;
  className?: string;
}

export const Favourite: React.FC<FavouriteProps> = ({ 
  propertyId, 
  size = 25,
  className = ""
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const isFavorited = useAppSelector((state) => {
    const byStatus = selectIsPropertyFavorited(propertyId)(state as any);
    if (byStatus) return true;
    const list = (state as any).favorite?.favorites as Array<{ propertyId: string }> | undefined;
    return Array.isArray(list) ? list.some(item => item.propertyId === propertyId) : false;
  });

  // Check favorite status on mount
  useEffect(() => {
    if (propertyId) {
      console.log('[Favourite] mount -> propertyId:', propertyId);
      dispatch(checkFavoriteStatus(propertyId));
    }
  }, [dispatch, propertyId]);

  // Log whenever derived favorited state changes
  useEffect(() => {
    console.log('[Favourite] isFavorited changed:', { propertyId, isFavorited });
  }, [propertyId, isFavorited]);

  const toggleLike = async (e?: React.MouseEvent<HTMLDivElement>) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (isLoading || !propertyId) return;
    
    setIsLoading(true);
    
    try {
      if (isFavorited) {
        console.log('[Favourite] removing from favorites:', propertyId);
        await dispatch(removeFromFavorites(propertyId)).unwrap();
        toast.success('Removed from favorites', 'Property has been removed from your favorites.');
      } else {
        console.log('[Favourite] adding to favorites:', propertyId);
        await dispatch(addToFavorites({ propertyId })).unwrap();
        toast.success('Added to favorites', 'Property has been added to your favorites.');
      }
      // Ensure status is synced with server
      console.log('[Favourite] re-checking status after toggle');
      dispatch(checkFavoriteStatus(propertyId));
    } catch (error: any) {
      toast.error('Error', error || 'Failed to update favorites.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};
