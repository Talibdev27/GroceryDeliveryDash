import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Check, X } from 'lucide-react';
import { loadYandexMaps, createMap, createDraggableMarker, reverseGeocode, drawDeliveryZone, drawOutsideAreas } from '@/lib/yandex-maps';
import { getDeliveryZonePolygon, validateDeliveryAddress } from '@/lib/delivery-zone';

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
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const outsideAreasPolygonRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '');
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  const [zoneValidation, setZoneValidation] = useState<{ isValid: boolean; message: string } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    let isMounted = true;
    
    const initializeMap = async () => {
      // Wait for next frame to ensure DOM is ready
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      if (!isMounted || !mapContainerRef.current) {
        console.error('Map container ref is null or component unmounted');
        return;
      }

      // Verify container is visible and has dimensions
      const container = mapContainerRef.current;
      
      // Ensure container is in DOM
      if (!container.isConnected) {
        console.warn('Map container not in DOM, waiting...');
        setTimeout(() => {
          if (isMounted) initializeMap();
        }, 100);
        return;
      }
      
      // Wait a bit more to ensure container is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.warn('Map container has zero dimensions, waiting...', {
          width: rect.width,
          height: rect.height,
          computed: window.getComputedStyle(container).display
        });
        // Wait a bit and retry
        setTimeout(() => {
          if (isMounted) initializeMap();
        }, 300);
        return;
      }
      
      // Ensure container has explicit dimensions
      if (container instanceof HTMLElement) {
        const computedStyle = window.getComputedStyle(container);
        if (computedStyle.height === 'auto' || computedStyle.height === '0px' || rect.height < 100) {
          container.style.height = '400px';
          console.log('Set container height to 400px');
        }
        if (computedStyle.width === 'auto' || computedStyle.width === '0px' || rect.width < 100) {
          container.style.width = '100%';
          console.log('Set container width to 100%');
        }
        
        // Ensure container is visible
        if (computedStyle.display === 'none') {
          container.style.display = 'block';
          console.log('Set container display to block');
        }
        if (computedStyle.visibility === 'hidden') {
          container.style.visibility = 'visible';
          console.log('Set container visibility to visible');
        }
        
        // Re-check dimensions after setting styles
        await new Promise(resolve => requestAnimationFrame(resolve));
        const newRect = container.getBoundingClientRect();
        if (newRect.width === 0 || newRect.height === 0) {
          console.warn('Container still has zero dimensions after style fix, retrying...');
          setTimeout(() => {
            if (isMounted) initializeMap();
          }, 500);
          return;
        }
      }
      
      console.log('✅ Map container ready:', {
        width: rect.width,
        height: rect.height,
        id: container.id,
        display: window.getComputedStyle(container).display,
        visibility: window.getComputedStyle(container).visibility,
        opacity: window.getComputedStyle(container).opacity
      });

      try {
        setIsLoading(true);
        setMapError(null);
        
        // Check API key first
        const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('Yandex Maps API key is missing. Please set VITE_YANDEX_MAPS_API_KEY in your .env file.');
        }
        console.log('✅ Yandex Maps API key found');
        
        console.log('Loading Yandex Maps API...');
        try {
          await loadYandexMaps();
          console.log('✅ Yandex Maps API loaded successfully');
        } catch (loadError: any) {
          console.error('❌ Failed to load Yandex Maps API:', loadError);
          throw new Error(`Failed to load Yandex Maps API: ${loadError?.message || 'Unknown error'}. Please check your API key and internet connection.`);
        }
        
        // Get delivery zone center for initial map center
        const { getDeliveryZoneCenter } = await import('@/lib/delivery-zone');
        const deliveryZoneCenter = getDeliveryZoneCenter();
        
        // Pass container element directly (more reliable than ID string)
        console.log('Creating map instance...');
        console.log('Initial center (delivery zone):', deliveryZoneCenter);
        let map;
        try {
          // Center map on delivery zone center [lat, lng] for initial display
          map = await createMap(container, {
            center: initialCoordinates || deliveryZoneCenter, // Use delivery zone center if no initial coordinates
            zoom: 11, // Slightly zoomed out to show more of the zone
            type: 'yandex#map' // Standard map view
          });
        } catch (mapError: any) {
          console.error('❌ Failed to create map:', mapError);
          throw new Error(`Failed to create map: ${mapError?.message || 'Unknown error'}. Please check your API key permissions.`);
        }
        
        mapInstanceRef.current = map;
        console.log('✅ Map instance created successfully');
        
        // Draw polygons immediately after map is ready (don't wait for tilesloaded)
        const drawPolygons = async () => {
          if (polygonRef.current && outsideAreasPolygonRef.current) {
            console.log('Polygons already drawn, skipping');
            return;
          }
          
          const polygon = getDeliveryZonePolygon();
          console.log('Polygon coordinates:', polygon);
          
          // Draw outside areas polygon first (lower z-index, appears behind)
          if (!outsideAreasPolygonRef.current) {
            try {
              console.log('Drawing outside areas polygon...');
              const outsideAreasPolygon = await drawOutsideAreas(map, polygon);
              outsideAreasPolygonRef.current = outsideAreasPolygon;
              console.log('✅ Outside areas polygon drawn successfully');
            } catch (outsideError) {
              console.error('❌ Failed to draw outside areas polygon:', outsideError);
              // Continue - delivery zone will still work
            }
          }
          
          // Draw delivery zone polygon second (higher z-index, appears on top)
          if (!polygonRef.current) {
            try {
              console.log('Drawing delivery zone polygon...');
              const deliveryZonePolygon = await drawDeliveryZone(map, polygon);
              polygonRef.current = deliveryZonePolygon;
              console.log('✅ Delivery zone polygon drawn successfully');
            } catch (polygonError) {
              console.error('❌ Failed to draw delivery zone polygon:', polygonError);
              // Continue without polygon - map will still work
            }
          }
        };
        
        // Draw polygons when map is ready
        map.events.add('ready', () => {
          console.log('Map ready event fired, drawing polygons...');
          setTimeout(drawPolygons, 500);
        });
        
        // Also draw polygons when tiles are loaded
        map.events.add('tilesloaded', () => {
          console.log('Map tiles loaded, ensuring polygons are drawn...');
          setTimeout(drawPolygons, 300);
        });
        
        // Fallback: draw polygons after delay
        setTimeout(drawPolygons, 2000);
        
        // Create draggable marker at center of delivery zone or initial coordinates
        const markerCoords = initialCoordinates || [41.3680822, 69.2937804]; // Yunusabad center
        const marker = await createDraggableMarker(map, markerCoords);
        markerRef.current = marker;
        
        // Validate initial coordinates if provided, otherwise validate marker position
        const coordsToValidate = initialCoordinates || markerCoords;
        const validation = validateDeliveryAddress(coordsToValidate);
        setZoneValidation(validation);
        
        // Get address for initial marker position
        const result = await reverseGeocode(markerCoords[0], markerCoords[1]);
        if (result) {
          setSelectedAddress(result.formattedAddress);
        }
        
        // Handle marker drag
        marker.events.add('dragend', async () => {
          const coordinates = marker.geometry.getCoordinates();
          await handleMarkerMove(coordinates);
        });
        
        // Handle map click
        map.events.add('click', async (event: any) => {
          const coordinates = event.get('coords');
          // Yandex Maps click event returns [lat, lng]
          marker.geometry.setCoordinates(coordinates);
          await handleMarkerMove(coordinates);
        });
        
        // Handle map errors
        map.events.add('error', (error: any) => {
          console.error('Map error:', error);
        });
        
        setIsMapLoaded(true);
        setMapError(null);
        setIsLoading(false);
      } catch (error: any) {
        if (!isMounted) return;
        
        console.error('❌ Map initialization error:', error);
        const errorMessage = error?.message || 'Failed to load map. Please check your Yandex Maps API key.';
        setMapError(errorMessage);
        setIsMapLoaded(false);
        setIsLoading(false);
        
        // Log detailed error info for debugging
        const container = mapContainerRef.current;
        console.error('Error details:', {
          message: error?.message,
          stack: error?.stack,
          apiKey: import.meta.env.VITE_YANDEX_MAPS_API_KEY ? 'Present' : 'Missing',
          containerId: container?.id,
          containerExists: !!container,
          containerDimensions: container ? {
            width: container.getBoundingClientRect().width,
            height: container.getBoundingClientRect().height,
            display: window.getComputedStyle(container).display,
            visibility: window.getComputedStyle(container).visibility
          } : 'No container',
          isConnected: container?.isConnected
        });
      }
    };

    // Delay initialization slightly to ensure component is fully mounted
    const timeoutId = setTimeout(() => {
      initializeMap();
    }, 200);
    
    // Cleanup on unmount
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying map:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle marker movement
  const handleMarkerMove = async (coordinates: [number, number]) => {
    try {
      const result = await reverseGeocode(coordinates[0], coordinates[1]);
      if (result) {
        setSelectedAddress(result.formattedAddress);
        setIsLocationConfirmed(false);
        
        // Validate delivery zone
        const validation = validateDeliveryAddress(coordinates, result.formattedAddress);
        setZoneValidation(validation);
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
          // Yandex Maps uses [lat, lng] format for setCenter
          mapInstanceRef.current.setCenter(coordinates, 15);
          // Yandex Maps uses [lat, lng] format for marker coordinates
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
          <span>{t("map.selectLocationOnMap")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map container */}
        <div className="relative">
          <div
            ref={mapContainerRef}
            id="yandex-map-container"
            className="w-full h-64 rounded-lg border border-gray-200"
            style={{ 
              minHeight: '400px',
              width: '100%',
              height: '400px'
            }}
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">{t("map.loadingMap")}</p>
              </div>
            </div>
          )}
          
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg z-10 border-2 border-red-200">
              <div className="text-center p-4">
                <p className="text-sm font-medium text-red-800 mb-2">Map Loading Error</p>
                <p className="text-xs text-red-600">{mapError}</p>
                <p className="text-xs text-red-500 mt-2">Please check your Yandex Maps API key in .env file</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600">
          <p>• {t("map.instruction1")}</p>
          <p>• {t("map.instruction2")}</p>
          <p>• {t("map.instruction3")}</p>
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
          {t("map.useCurrentLocation")}
        </Button>

        {/* Selected address display */}
        {selectedAddress && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{t("map.selectedAddress")}:</p>
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
            {t("map.confirmLocation")}
          </Button>
        )}

        {/* Delivery Zone Status */}
        {zoneValidation && (
          <div className={`p-3 rounded-lg flex items-start space-x-2 rtl:space-x-reverse ${
            zoneValidation.isValid 
              ? "bg-green-50 border border-green-200 text-green-800" 
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            {zoneValidation.isValid ? (
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
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

        {/* Confirmation message */}
        {isLocationConfirmed && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">{t("map.locationConfirmed")}!</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
