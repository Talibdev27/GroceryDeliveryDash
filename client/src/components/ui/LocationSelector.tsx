import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'search' | 'map'>('search');
  const [searchValue, setSearchValue] = useState(value);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // Handle address selection from autocomplete
  const handleAddressSelect = (suggestion: {
    title: string;
    subtitle: string;
    coordinates: [number, number];
    address: string;
  }) => {
    const locationData: LocationData = {
      address: suggestion.address,
      city: '', // Will be extracted from geocoding
      state: '',
      country: 'Uzbekistan',
      coordinates: suggestion.coordinates
    };

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

    setSelectedLocation(locationData);
    setSearchValue(location.address);
    onLocationSelect(locationData);
  };

  // Handle search input change
  const handleSearchChange = (newValue: string) => {
    setSearchValue(newValue);
    if (newValue !== selectedLocation?.address) {
      setSelectedLocation(null);
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
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">Location Selected</h4>
              <p className="text-sm text-blue-800 mt-1">{selectedLocation.address}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                {selectedLocation.city && (
                  <span>City: {selectedLocation.city}</span>
                )}
                {selectedLocation.state && (
                  <span>District: {selectedLocation.state}</span>
                )}
                <span>
                  Coordinates: {selectedLocation.coordinates[0].toFixed(6)}, {selectedLocation.coordinates[1].toFixed(6)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
