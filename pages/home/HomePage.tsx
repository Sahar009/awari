"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Container from "@/components/Container";
import HeroSlider from "../../components/slider/HeroSlider";
import FeatureList, { type PropertyCard } from "./FeatureList";
import { SearchFilter, type SearchCriteria, type Option } from "@/components/SearchFilter";
import About from "./About";
import Service from "./Service";
import Testimonial from "./Testimonial";
import { propertyService, type PropertySummary } from "@/services/propertyService";
import { Button } from "@/components/ui/Button";

const LISTING_LABELS: Record<PropertySummary["listingType"], string> = {
  rent: "For Rent",
  sale: "For Sale",
  shortlet: "Shortlet"
};

const resolvePriceValue = (price: PropertySummary["price"]): number | null => {
  if (typeof price === "number" && !Number.isNaN(price)) {
    return price;
  }

  if (typeof price === "string") {
    const parsed = Number(price.replace(/[^0-9.]/g, ""));
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

const formatPricePeriod = (period?: string | null) => {
  if (!period) return "";
  if (period === "one_time") return "";
  if (period.startsWith("per_")) {
    return period.replace("per_", "");
  }
  return period;
};

const formatPrice = (property: PropertySummary) => {
  const priceValue = resolvePriceValue(property.price);

  if (!priceValue) {
    return "Price on request";
  }

  const currency = property.currency ?? "NGN";
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  });

  const period = formatPricePeriod(property.pricePeriod);
  const suffix = period ? `/${period.replace(/_/g, " ")}` : "";

  return `${formatter.format(priceValue)}${suffix}`;
};

const mapPropertyToCard = (property: PropertySummary): PropertyCard => {
  const media = property.media ?? [];
  const sortedMedia = [...media].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const primaryMedia = sortedMedia.find((item) => item.isPrimary) ?? sortedMedia[0];

  const location = [property.city, property.state].filter(Boolean).join(", ");

  return {
    propertyId: property.id,
    Title: property.title,
    description: property.shortDescription ?? property.description ?? "No description provided.",
    price: formatPrice(property),
    rawPrice: resolvePriceValue(property.price),
    location: location || property.country || undefined,
    type: LISTING_LABELS[property.listingType] ?? property.listingType,
    ImageSrc: primaryMedia?.url ?? "/assets/images/slider4.jpg"
  };
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Failed to load properties. Please try again.";
};

const HomePage = () => {
  const [properties, setProperties] = useState<PropertyCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<PropertyCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const response = await propertyService.getProperties({
        limit: 32,
        status: "active",
        sortBy: "createdAt",
        sortOrder: "DESC"
      });

      if (!response.success) {
        throw new Error(response.message || "Unable to retrieve properties.");
      }

      const responseData = response.data;
      const mapped = (responseData?.properties ?? []).map(mapPropertyToCard);

      setProperties(mapped);
      setFilteredCards(mapped);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      setProperties([]);
      setFilteredCards([]);
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const locationOptions: Option[] = useMemo(() => {
    const base: Option[] = [{ label: "All locations", value: "all" }];
    if (!properties.length) {
      return base;
    }

    const uniqueLocations = Array.from(
      new Set(
        properties
          .map((card) => card.location)
          .filter((location): location is string => Boolean(location))
      )
    );

    return [
      ...base,
      ...uniqueLocations.map((location) => ({
        label: location,
        value: location
      }))
    ];
  }, [properties]);

  const propertyTypeOptions: Option[] = useMemo(() => {
    const base: Option[] = [{ label: "All property types", value: "all" }];
    if (!properties.length) {
      return base;
    }

    const uniqueTypes = Array.from(
      new Set(
        properties
          .map((card) => card.type)
          .filter((type): type is string => Boolean(type))
      )
    );

    return [
      ...base,
      ...uniqueTypes.map((type) => ({
        label: type,
        value: type
      }))
    ];
  }, [properties]);

  const handleSearch = useCallback(
    (criteria: SearchCriteria) => {
      const normalizedQuery = criteria.query.trim().toLowerCase();

      const results = properties.filter((card) => {
        const matchesQuery = normalizedQuery
          ? [card.Title, card.description, card.location]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery)
          : true;

        const matchesLocation = criteria.location && criteria.location !== "all"
          ? card.location === criteria.location
          : true;

        const matchesType = criteria.propertyType && criteria.propertyType !== "all"
          ? card.type === criteria.propertyType
          : true;

        const matchesMin =
          typeof criteria.minPrice === "number"
            ? card.rawPrice !== null && card.rawPrice !== undefined && card.rawPrice >= criteria.minPrice
            : true;

        const matchesMax =
          typeof criteria.maxPrice === "number"
            ? card.rawPrice !== null && card.rawPrice !== undefined && card.rawPrice <= criteria.maxPrice
            : true;

        return matchesQuery && matchesLocation && matchesType && matchesMin && matchesMax;
      });

      setFilteredCards(results);
    },
    [properties]
  );

  return (
    <div className="w-full h-full">
      <div className="relative w-full rounded-bl-3xl rounded-br-3xl py-10 mb-60 lg:mb-40">
        <HeroSlider />
        <Container>
          <div className="absolute w-[85%] sm:w-[90%] lg:w-[85%] mx-auto bottom-[-230px] lg:bottom-[-130px]">
            <SearchFilter
              locations={locationOptions}
              propertyTypes={propertyTypeOptions}
              onSearch={handleSearch}
            />
          </div>
        </Container>
      </div>
      <Container>
        <div className="space-y-10">
          {loadError ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-red-200 bg-red-50/80 p-12 text-center">
              <p className="text-lg font-semibold text-red-600">{loadError}</p>
              <p className="text-sm text-red-500">
                Please refresh your connection or try again shortly.
              </p>
              <Button onClick={fetchProperties} label="Retry" variant="outline" />
            </div>
          ) : (
            <FeatureList cards={filteredCards} isLoading={isLoading} skeletonCount={12} />
          )}
          <About />
          <Service />
        </div>
      </Container>
      <Testimonial />
    </div>
  );
};

export default HomePage;
