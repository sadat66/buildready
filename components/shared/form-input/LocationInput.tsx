"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface LocationData {
  address: string;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  country?: string;
}

export interface LocationInputProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  onBlur?: () => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  showMap?: boolean;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    street?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    suburb?: string;
    state?: string;
    province?: string;
    region?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
    neighbourhood?: string;
    district?: string;
    borough?: string;
  };
}

// Simple Map Component using OpenStreetMap
function LocationMap({
  latitude,
  longitude,
  address,
  className = "",
}: {
  latitude: number | null;
  longitude: number | null;
  address: string;
  className?: string;
}) {
  if (!latitude || !longitude) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            Select a location to view on map
          </p>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    longitude - 0.01
  },${latitude - 0.01},${longitude + 0.01},${
    latitude + 0.01
  }&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}
    >
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Navigation className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            Location Map
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 truncate">{address}</p>
      </div>
      <div className="relative">
        <iframe
          src={mapUrl}
          width="100%"
          height="200"
          title="Location Map"
          className="w-full"
        />
      </div>
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
          <a
            href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Open in OSM
          </a>
        </div>
      </div>
    </div>
  );
}

export function LocationInput({
  value,
  onChange,
  onBlur,
  label = "Location",
  placeholder = "Search for an address...",
  required = false,
  error,
  helperText,
  className = "",
  showMap = true,
}: LocationInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const searchLocation = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using OpenStreetMap Nominatim API (free) - Worldwide search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=8&viewbox=-180,-90,180,90&bounded=0`
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Location search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(query);
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = (result: SearchResult) => {
    // Extract the primary address (first part before comma)
    const primaryAddress =
      result.display_name.split(",")[0] || result.display_name;

    // Enhanced city extraction for worldwide support
    const city =
      result.address.city ||
      result.address.town ||
      result.address.village ||
      result.address.hamlet ||
      result.address.suburb ||
      result.address.neighbourhood ||
      result.address.district ||
      result.address.borough ||
      null;

    // Enhanced province/state extraction for worldwide support
    const province =
      result.address.state ||
      result.address.province ||
      result.address.region ||
      null;

    // Enhanced postal code extraction
    const postalCode = result.address.postcode || null;

    // Get country information
    const country = result.address.country || "";

    const location: LocationData = {
      address: primaryAddress,
      city: city,
      province: province,
      postalCode: postalCode,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      country: country,
    };

    setSelectedLocation(location);
    onChange(location);
    setSearchQuery(result.display_name);
    setShowResults(false);
    setSearchResults([]);
  };

  // Handle manual location input
  const handleManualInput = () => {
    if (searchQuery.trim()) {
      const location: LocationData = {
        address: searchQuery,
        city: value.city || null,
        province: value.province || null,
        postalCode: value.postalCode || null,
        latitude: null,
        longitude: null,
        country: value.country || "",
      };
      onChange(location);
    }
  };

  // Handle clear location
  const handleClearLocation = () => {
    setSearchQuery("");
    setSelectedLocation(null);
    setSearchResults([]);
    setShowResults(false);
    onChange({
      address: "",
      city: null,
      province: null,
      postalCode: null,
      latitude: null,
      longitude: null,
      country: "",
    });
  };

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update search query when value changes externally
  useEffect(() => {
    if (value.address && !selectedLocation) {
      setSearchQuery(value.address);
    }
  }, [value.address, selectedLocation]);

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <Label className="flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <span>
            {label}
            {required && <span className="text-red-500">*</span>}
          </span>
        </Label>
      )}

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`pl-10 pr-20 ${error ? "border-red-500" : ""}`}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearLocation}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            {isSearching && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div
            ref={resultsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleLocationSelect(result)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">
                  {result.address.house_number &&
                    `${result.address.house_number} `}
                  {result.address.road || result.address.street}
                </div>
                <div className="text-sm text-gray-600">
                  {[
                    result.address.city ||
                      result.address.town ||
                      result.address.village ||
                      result.address.hamlet ||
                      result.address.suburb,
                    result.address.state ||
                      result.address.province ||
                      result.address.region,
                    result.address.postcode,
                    result.address.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
                {result.address.country && (
                  <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {result.address.country_code?.toUpperCase() ||
                        result.address.country}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Manual Input Button */}
        {searchQuery &&
          searchResults.length === 0 &&
          !isSearching &&
          !selectedLocation && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <button
                type="button"
                onClick={handleManualInput}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm text-gray-600"
              >
                Use &quot;{searchQuery}&quot; as address
              </button>
            </div>
          )}
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="font-medium text-blue-900 text-lg">
                {selectedLocation.address}
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {[
                  selectedLocation.city,
                  selectedLocation.province,
                  selectedLocation.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              {/* Show country if available */}
              {selectedLocation.country && (
                <div className="text-xs text-blue-600 mt-1 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedLocation.country}
                  </span>
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearLocation}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Location Map */}
          {showMap && (
            <LocationMap
              latitude={selectedLocation.latitude}
              longitude={selectedLocation.longitude}
              address={selectedLocation.address}
              className="mt-3"
            />
          )}
        </div>
      )}

      {/* Error Display */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Helper Text */}
      {helperText && <p className="text-sm text-gray-600">{helperText}</p>}

      {/* Privacy Note */}
      <p className="text-xs text-gray-500">
        Note: Only city and province (if provided) will be visible to contractors for privacy
      </p>
    </div>
  );
}
