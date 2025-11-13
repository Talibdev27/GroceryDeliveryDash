import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Check, X } from 'lucide-react';
import { validateDeliveryAddress } from '@/lib/delivery-zone';
import AddressAutocomplete from './AddressAutocomplete';
import MapPicker from './MapPicker';

interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates: [number, number];
}

interface LocationSelectorProps {
  value?: string;
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
  initialCoordinates?: [number, number];
  initialAddress?: string;
}

export default function LocationSelector({
  value = '',
  onLocationSelect,
  placeholder = "Search for your address...",
  className = "",
  initialCoordinates,
  initialAddress
}: LocationSelectorProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'search' | 'map'>('search');
  const [searchValue, setSearchValue] = useState(value);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [zoneValidation, setZoneValidation] = useState<{ isValid: boolean; message: string } | null>(null);

  // Handle address selection from autocomplete
  const handleAddressSelect = async (suggestion: {
    title: string;
    subtitle: string;
    coordinates: [number, number];
    address: string;
  }) => {
    // Ensure coordinates are in [lat, lng] format for validation
    // suggestion.coordinates should already be [lat, lng] from getAddressSuggestions conversion
    const [lat, lng] = suggestion.coordinates;
    
    console.log('📍 LocationSelector: Address selected from search:', {
      address: suggestion.address,
      subtitle: suggestion.subtitle,
      rawCoordinates: suggestion.coordinates,
      extractedLat: lat,
      extractedLng: lng,
      coordinateArray: `[${lat}, ${lng}]`,
      coordinateObject: `{lat: ${lat}, lng: ${lng}}`
    });

    // Extract district from subtitle (e.g., "Yunusobod dahasi, Yunusobod tumani, Toshkent")
    let district: string | undefined;
    if (suggestion.subtitle) {
      // Check if subtitle contains district information
      const subtitleLower = suggestion.subtitle.toLowerCase();
      if (subtitleLower.includes('yunusobod') || subtitleLower.includes('yunusabad')) {
        // Extract district name from subtitle
        const parts = suggestion.subtitle.split(',').map(p => p.trim());
        // Usually format: "Yunusobod dahasi, Yunusobod tumani, Toshkent"
        // District is usually in the second part (tumani)
        const districtPart = parts.find(p => 
          p.toLowerCase().includes('tumani') || 
          p.toLowerCase().includes('yunusobod') ||
          p.toLowerCase().includes('yunusabad')
        );
        if (districtPart) {
          // Extract just the district name
          if (districtPart.toLowerCase().includes('yunusobod')) {
            district = 'Yunusobod';
          } else if (districtPart.toLowerCase().includes('yunusabad')) {
            district = 'Yunusabad';
          } else {
            district = districtPart;
          }
        } else {
          // Fallback: check if any part contains district keywords
          if (subtitleLower.includes('yunusobod')) {
            district = 'Yunusobod';
          } else if (subtitleLower.includes('yunusabad')) {
            district = 'Yunusabad';
          }
        }
      }
    }

    console.log('📍 LocationSelector: Extracted district:', district);

    const locationData: LocationData = {
      address: suggestion.address,
      city: '', // Will be extracted from geocoding
      state: district || '', // Store district in state field
      country: 'Uzbekistan',
      coordinates: suggestion.coordinates // [lat, lng] format
    };

    // Validate delivery zone - pass district for district-first validation
    const validation = validateDeliveryAddress(
      { lat, lng }, 
      suggestion.address, 
      suggestion.subtitle,
      district
    );
    console.log('📍 LocationSelector: Validation result:', {
      isValid: validation.isValid,
      message: validation.message,
      coordinatesUsed: { lat, lng },
      address: suggestion.address,
      subtitle: suggestion.subtitle,
      district
    });
    setZoneValidation(validation);

    // Update search value to match selected address (same as map selection)
    setSearchValue(suggestion.address);
    setSelectedLocation(locationData);
    onLocationSelect(locationData);
  };

  // Handle location selection from map
  const handleMapLocationSelect = (location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    country: string;
  }) => {
    const locationData: LocationData = {
      address: location.address,
      city: location.city,
      state: location.state,
      country: location.country,
      coordinates: location.coordinates
    };

    // Validate delivery zone
    const validation = validateDeliveryAddress(location.coordinates, location.address);
    setZoneValidation(validation);

    setSelectedLocation(locationData);
    setSearchValue(location.address);
    onLocationSelect(locationData);
  };

  // Handle search input change
  const handleSearchChange = (newValue: string) => {
    setSearchValue(newValue);
    // Only clear selected location if user manually types (not when selecting from autocomplete)
    // When selecting from autocomplete, onChange is called before onSelect, so we need to check
    // if the new value matches a potential selection by checking if it's different from current selection
    if (newValue !== selectedLocation?.address && !selectedLocation) {
      // Only clear if there's no selected location (user is typing, not selecting)
      setZoneValidation(null);
    } else if (newValue !== selectedLocation?.address) {
      // User manually changed the address after selection
      setSelectedLocation(null);
      setZoneValidation(null);
    }
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'search' | 'map')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Map</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search for Address</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressAutocomplete
                value={searchValue}
                onChange={handleSearchChange}
                onSelect={handleAddressSelect}
                placeholder={placeholder}
                className="w-full"
              />
              
              {selectedLocation && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">Selected Location:</p>
                      <p className="text-sm text-green-700">{selectedLocation.address}</p>
                      {selectedLocation.city && (
                        <p className="text-xs text-green-600">
                          {selectedLocation.city}, {selectedLocation.state}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <MapPicker
            onLocationSelect={handleMapLocationSelect}
            initialCoordinates={initialCoordinates}
            initialAddress={initialAddress}
            className="w-full"
          />
        </TabsContent>
      </Tabs>

      {/* Selected location summary */}
      {selectedLocation && (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900">{t("map.locationConfirmed")}</h4>
                <p className="text-sm text-blue-800 mt-1">{selectedLocation.address}</p>
                <div className="flex items-center space-x-4 rtl:space-x-reverse mt-2 text-xs text-blue-600">
                  {selectedLocation.city && (
                    <span>City: {selectedLocation.city}</span>
                  )}
                  {selectedLocation.state && (
                    <span>District: {selectedLocation.state}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Delivery Zone Status */}
          {zoneValidation && (
            <div className={`p-3 rounded-lg flex items-start space-x-2 rtl:space-x-reverse ${
              zoneValidation.isValid 
                ? "bg-green-50 border border-green-200 text-green-800" 
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {zoneValidation.isValid ? (
                <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <X className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {zoneValidation.isValid 
                    ? t("deliveryZone.inZone")
                    : t("deliveryZone.outOfZone")
                  }
                </p>
                {!zoneValidation.isValid && (
                  <p className="text-xs mt-1">
                    {t("deliveryZone.outOfZoneMessage")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
