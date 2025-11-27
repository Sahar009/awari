"use client";

import { apiService, type ApiResponse } from "./api";

export interface PropertyMediaSummary {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  mediaType: "image" | "video" | "document";
  isPrimary?: boolean;
  order?: number;
}

export interface PropertySummary {
  id: string;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  price?: number | string | null;
  originalPrice?: number | string | null;
  currency?: string | null;
  pricePeriod?: string | null;
  listingType: "rent" | "sale" | "shortlet";
  propertyType?: string | null;
  status?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  featured?: boolean | null;
  slug?: string | null;
  media?: PropertyMediaSummary[];
}

export interface PropertyListMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PropertyListResponse {
  properties: PropertySummary[];
  pagination: PropertyListMeta;
}

export interface PropertyListParams {
  page?: number;
  limit?: number;
  status?: string;
  propertyType?: string;
  listingType?: string;
  city?: string;
  state?: string;
  country?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

type PropertyListApiResponse = ApiResponse<PropertyListResponse>;

export const propertyService = {
  async getProperties(params: PropertyListParams = {}): Promise<PropertyListApiResponse> {
    return apiService.get<PropertyListResponse>("/properties", { params });
  }
};







