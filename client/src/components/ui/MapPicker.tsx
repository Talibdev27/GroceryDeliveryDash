import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Check } from 'lucide-react';
import { loadYandexMaps, createMap, createDraggableMarker, reverseGeocode } from '@/lib/yandex-maps';

interface MapPickerProps {
  onLocationSelect: (location: {
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
    country: string;
  }) => void;
  initialCoordinates?: [number, number];
  initialAddress?: string;
  className?: string;
}

export default function MapPicker({
  onLocationSelect,
  initialCoordinates,
  initialAddress,
  className = ""
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '');
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        setIsLoading(true);
        await loadYandexMaps();
        
        const map = await createMap(mapContainerRef.current, {
          center: initialCoordinates || [41.2995, 69.2401], // Tashkent default
          zoom: 15
        });
        
        mapInstanceRef.current = map;
        
        // Create draggable marker
        const marker = await createDraggableMarker(
          map, 
          initialCoordinates || [41.2995, 69.2401]
        );
        markerRef.current = marker;
        
        // Handle marker drag
        marker.events.add('dragend', async () => {
          const coordinates = marker.geometry.getCoordinates();
          await handleMarkerMove(coordinates);
        });
        
        // Handle map click
        map.events.add('click', async (event: any) => {
          const coordinates = event.get('coords');
          marker.geometry.setCoordinates(coordinates);
          await handleMarkerMove(coordinates);
        });
        
        // If we have initial address, reverse geocode it
        if (initialAddress && !initialCoordinates) {
          const result = await reverseGeocode(41.2995, 69.2401);
          if (result) {
            setSelectedAddress(result.formattedAddress);
          }
        }
        
        setIsMapLoaded(true);
      } catch (error) {
        console.error('Map initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, []);

  // Handle marker movement
  const handleMarkerMove = async (coordinates: [number, number]) => {
    try {
      const result = await reverseGeocode(coordinates[0], coordinates[1]);
      if (result) {
        setSelectedAddress(result.formattedAddress);
        setIsLocationConfirmed(false);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Handle location confirmation
  const handleConfirmLocation = async () => {
    if (!markerRef.current) return;

    try {
      const coordinates = markerRef.current.geometry.getCoordinates();
      const result = await reverseGeocode(coordinates[0], coordinates[1]);
      
      if (result) {
        onLocationSelect({
          coordinates,
          address: result.formattedAddress,
          city: result.city,
          state: result.state,
          country: result.country
        });
        setIsLocationConfirmed(true);
      }
    } catch (error) {
      console.error('Location confirmation error:', error);
    }
  };

  // Handle current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordinates: [number, number] = [latitude, longitude];
        
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter(coordinates, 15);
          markerRef.current.geometry.setCoordinates(coordinates);
          await handleMarkerMove(coordinates);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your current location.');
      }
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Select Location on Map</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map container */}
        <div className="relative">
          <div
            ref={mapContainerRef}
            className="w-full h-64 rounded-lg border border-gray-200"
            style={{ minHeight: '256px' }}
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600">
          <p>• Click anywhere on the map to place the marker</p>
          <p>• Drag the red marker to your exact location</p>
          <p>• Use the button below to get your current location</p>
        </div>

        {/* Current location button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleCurrentLocation}
          disabled={!isMapLoaded}
          className="w-full"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Use My Current Location
        </Button>

        {/* Selected address display */}
        {selectedAddress && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Selected Address:</p>
                <p className="text-sm text-gray-600">{selectedAddress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Confirm location button */}
        {selectedAddress && !isLocationConfirmed && (
          <Button
            type="button"
            onClick={handleConfirmLocation}
            className="w-full"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirm This Location
          </Button>
        )}

        {/* Confirmation message */}
        {isLocationConfirmed && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">Location confirmed!</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
