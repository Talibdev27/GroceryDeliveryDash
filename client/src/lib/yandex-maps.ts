// Yandex Maps API integration utilities
// This file handles loading the Yandex Maps API and provides helper functions

interface YandexMapsAPI {
  ymaps: any;
  ready: (callback: () => void) => void;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

let yandexMapsLoaded = false;
let yandexMapsPromise: Promise<void> | null = null;

/**
 * Load Yandex Maps API dynamically
 */
export const loadYandexMaps = (): Promise<void> => {
  if (yandexMapsLoaded) {
    return Promise.resolve();
  }

  if (yandexMapsPromise) {
    return yandexMapsPromise;
  }

  yandexMapsPromise = new Promise((resolve, reject) => {
    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;
    
    if (!apiKey) {
      const error = 'Yandex Maps API key not found. Please set VITE_YANDEX_MAPS_API_KEY in your .env file';
      console.error('❌', error);
      reject(new Error(error));
      return;
    }
    
    console.log('✅ Yandex Maps API key found');

    // Check if script is already loaded
    if (window.ymaps) {
      yandexMapsLoaded = true;
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=en_US&load=package.full`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('✅ Yandex Maps script loaded');
      
      // Wait a bit for window.ymaps to be available
      const checkInterval = setInterval(() => {
        if (window.ymaps) {
          clearInterval(checkInterval);
          console.log('✅ window.ymaps found, waiting for ready...');
          
          // Add timeout to detect if ready never fires
          const timeout = setTimeout(() => {
            console.error('❌ Yandex Maps ready() callback timeout');
            reject(new Error('Yandex Maps API ready() callback timeout - API may not be fully loaded. Check your API key permissions.'));
          }, 10000); // 10 second timeout
          
          try {
            window.ymaps.ready(() => {
              clearTimeout(timeout);
              console.log('✅ Yandex Maps API ready');
              yandexMapsLoaded = true;
              resolve();
            });
          } catch (error: any) {
            clearTimeout(timeout);
            console.error('❌ Error calling ymaps.ready():', error);
            reject(new Error(`Yandex Maps API initialization error: ${error?.message || 'Unknown error'}`));
          }
        }
      }, 100);
      
      // Timeout if window.ymaps never appears
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.ymaps) {
          console.error('❌ window.ymaps not found after script load');
          reject(new Error('Failed to load Yandex Maps API - window.ymaps not found. Check your API key and script loading.'));
        }
      }, 5000); // 5 second timeout
    };

    script.onerror = () => {
      reject(new Error('Failed to load Yandex Maps API script'));
    };

    document.head.appendChild(script);
  });

  return yandexMapsPromise;
};

/**
 * Get Yandex Maps API instance
 */
export const getYandexMaps = async (): Promise<any> => {
  await loadYandexMaps();
  return window.ymaps;
};

/**
 * Geocode address to coordinates using Yandex Geocoder API
 */
export const geocodeAddress = async (address: string): Promise<{
  coordinates: [number, number];
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
} | null> => {
  try {
    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${encodeURIComponent(address)}&format=json&lang=en_US&results=1`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.response?.GeoObjectCollection?.featureMember?.length > 0) {
      const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
      const coordinates = geoObject.Point.pos.split(' ').map(Number).reverse() as [number, number]; // Convert to [lat, lng]
      const formattedAddress = geoObject.metaDataProperty.GeocoderMetaData.text;
      
      // Extract address components
      const addressComponents = geoObject.metaDataProperty.GeocoderMetaData.Address.Components || [];
      const city = addressComponents.find((c: any) => c.kind === 'locality')?.name || '';
      const state = addressComponents.find((c: any) => c.kind === 'area')?.name || '';
      const country = addressComponents.find((c: any) => c.kind === 'country')?.name || 'Uzbekistan';
      
      return {
        coordinates,
        formattedAddress,
        city,
        state,
        country
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to address
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<{
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
  district?: string;
} | null> => {
  try {
    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${lng},${lat}&format=json&lang=en_US&results=1`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.response?.GeoObjectCollection?.featureMember?.length > 0) {
      const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
      const formattedAddress = geoObject.metaDataProperty.GeocoderMetaData.text;
      
      // Extract address components
      const addressComponents = geoObject.metaDataProperty.GeocoderMetaData.Address.Components || [];
      const city = addressComponents.find((c: any) => c.kind === 'locality')?.name || '';
      const state = addressComponents.find((c: any) => c.kind === 'area')?.name || '';
      const country = addressComponents.find((c: any) => c.kind === 'country')?.name || 'Uzbekistan';
      
      // Extract district from address components or geocoder metadata
      const districtComponent = addressComponents.find((c: any) => 
        c.kind === 'district' || 
        (c.kind === 'locality' && (c.name?.toLowerCase().includes('yunusabad') || c.name?.toLowerCase().includes('yunusobod')))
      );
      let district: string | undefined;
      if (districtComponent) {
        district = districtComponent.name;
      } else {
        // Try to extract from geocoder metadata
        district = extractDistrict({
          metaDataProperty: geoObject.metaDataProperty,
          description: geoObject.metaDataProperty?.GeocoderMetaData?.text,
          name: geoObject.name
        });
      }
      
      return {
        formattedAddress,
        city,
        state,
        country,
        district
      };
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Validate and normalize coordinates
 * Yandex Maps returns coordinates in [latitude, longitude] format
 */
export function validateCoordinates(coords: any): [number, number] | null {
  console.log('[validateCoordinates] Input:', coords, 'Type:', typeof coords);

  // Handle undefined or null
  if (!coords) {
    console.error('[validateCoordinates] Coordinates are undefined or null');
    return null;
  }

  // Handle array
  if (Array.isArray(coords)) {
    if (coords.length !== 2) {
      console.error('[validateCoordinates] Array length is not 2:', coords.length);
      return null;
    }

    const [first, second] = coords;
    
    // Check if values are numbers
    if (typeof first !== 'number' || typeof second !== 'number') {
      console.error('[validateCoordinates] Values are not numbers:', { first, second });
      return null;
    }

    // Check for NaN
    if (isNaN(first) || isNaN(second)) {
      console.error('[validateCoordinates] Values contain NaN');
      return null;
    }

    // Tashkent coordinate ranges
    const TASHKENT_LAT_MIN = 41.0;
    const TASHKENT_LAT_MAX = 41.6;
    const TASHKENT_LNG_MIN = 69.0;
    const TASHKENT_LNG_MAX = 69.6;

    console.log('[validateCoordinates] Values:', { first, second });

    // Method 1: Check if first value is latitude (standard format)
    if (first >= TASHKENT_LAT_MIN && first <= TASHKENT_LAT_MAX && 
        second >= TASHKENT_LNG_MIN && second <= TASHKENT_LNG_MAX) {
      console.log('[validateCoordinates] ✓ Format: [lat, lng]');
      return [first, second];
    }

    // Method 2: Check if coordinates are swapped
    if (second >= TASHKENT_LAT_MIN && second <= TASHKENT_LAT_MAX && 
        first >= TASHKENT_LNG_MIN && first <= TASHKENT_LNG_MAX) {
      console.log('[validateCoordinates] ✓ Format: [lng, lat] - Swapping');
      return [second, first];
    }

    // Method 3: Accept if close to Tashkent (fuzzy match)
    const MARGIN = 0.3;
    if (first >= (TASHKENT_LAT_MIN - MARGIN) && first <= (TASHKENT_LAT_MAX + MARGIN) && 
        second >= (TASHKENT_LNG_MIN - MARGIN) && second <= (TASHKENT_LNG_MAX + MARGIN)) {
      console.warn('[validateCoordinates] ⚠ Fuzzy match accepted');
      return [first, second];
    }

    console.error('[validateCoordinates] ✗ Coordinates outside Tashkent range:', { first, second });
    return null;
  }

  console.error('[validateCoordinates] Invalid coordinate format:', coords);
  return null;
}

/**
 * Extract district from address components or description
 * ENHANCED to catch more district variations
 */
export function extractDistrict(properties: any): string | undefined {
  console.log('[extractDistrict] Properties:', properties);

  // Method 1: Get from address components (most reliable)
  const components = properties?.metaDataProperty?.GeocoderMetaData?.Address?.Components;
  
  if (components && Array.isArray(components)) {
    // Try different component kinds
    const districtComponent = components.find((c: any) => 
      c.kind === 'district' || 
      c.kind === 'locality' || 
      c.kind === 'area' ||
      c.kind === 'province'
    );

    if (districtComponent) {
      console.log('[extractDistrict] ✓ Found district in components:', districtComponent.name);
      return districtComponent.name;
    }

    // Sometimes district is in locality
    const localityComponent = components.find((c: any) => c.kind === 'locality');
    if (localityComponent && localityComponent.name.toLowerCase().includes('yunusabad')) {
      console.log('[extractDistrict] ✓ Found Yunusabad in locality');
      return 'Yunusabad';
    }
  }

  // Method 2: Check description
  const description = properties?.description || '';
  console.log('[extractDistrict] Description:', description);

  const districtPatterns = [
    { pattern: /yunusabad|юнусабад|yunusobod|юнусобод/i, district: 'Yunusabad' },
    { pattern: /chilanzar|чиланзар/i, district: 'Chilanzar' },
    { pattern: /mirzo[- ]ulug'bek|мирзо[- ]улуғбек/i, district: 'Mirzo Ulugbek' },
    { pattern: /olmazor|олмазор/i, district: 'Olmazor' },
    { pattern: /shayxontohur|шайхонтоҳур/i, district: 'Shayxontohur' },
    { pattern: /bektemir|бектемир/i, district: 'Bektemir' },
    { pattern: /yashnobod|яшнобод/i, district: 'Yashnobod' },
    { pattern: /mirobod|миробод/i, district: 'Mirobod' },
    { pattern: /uchtepa|учтепа/i, district: 'Uchtepa' },
    { pattern: /sergeli|сергели/i, district: 'Sergeli' },
    { pattern: /yakkasaroy|яккасарой/i, district: 'Yakkasaroy' }
  ];

  for (const { pattern, district } of districtPatterns) {
    if (pattern.test(description)) {
      console.log(`[extractDistrict] ✓ Found ${district} in description`);
      return district;
    }
  }

  // Method 3: Check full address
  const fullAddress = properties?.metaDataProperty?.GeocoderMetaData?.Address?.formatted || '';
  console.log('[extractDistrict] Full address:', fullAddress);

  for (const { pattern, district } of districtPatterns) {
    if (pattern.test(fullAddress)) {
      console.log(`[extractDistrict] ✓ Found ${district} in full address`);
      return district;
    }
  }

  // Method 4: Check name
  const name = properties?.name || '';
  for (const { pattern, district } of districtPatterns) {
    if (pattern.test(name)) {
      console.log(`[extractDistrict] ✓ Found ${district} in name`);
      return district;
    }
  }

  // Method 5: Check for mavze pattern (specific to Yunusabad)
  if (/\d+-mavze/i.test(fullAddress) || /\d+-mavze/i.test(description) || /\d+-mavze/i.test(name)) {
    console.log('[extractDistrict] ✓ Found mavze pattern - assuming Yunusabad');
    return 'Yunusabad';
  }

  console.log('[extractDistrict] ✗ No district found');
  return undefined;
}

/**
 * Get address suggestions using Yandex Suggest API
 */
export const getAddressSuggestions = async (query: string): Promise<Array<{
  title: string;
  subtitle: string;
  coordinates: [number, number];
  address: string;
}>> => {
  try {
    // Use Geosuggest API key if available, otherwise fall back to main API key
    const apiKey = import.meta.env.VITE_YANDEX_GEO_SUGGEST_API_KEY || import.meta.env.VITE_YANDEX_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Yandex Maps API key not found. Please set VITE_YANDEX_MAPS_API_KEY or VITE_YANDEX_GEO_SUGGEST_API_KEY in .env');
      return [];
    }
    
    const url = `https://suggest-maps.yandex.ru/v1/suggest?apikey=${apiKey}&text=${encodeURIComponent(query)}&types=geo,biz&lang=en_US&results=10`;
    
    console.log('🔍 Fetching address suggestions for:', query);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ Yandex Suggest API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return [];
    }
    
    const data = await response.json();
    console.log('✅ Yandex Suggest API response:', data);
    
    if (data.results) {
      const suggestions = await Promise.all(data.results.map(async (result: any) => {
        // Log full result structure to understand API response format
        console.log('🔍 Full result object:', {
          result,
          geometry: result.geometry,
          geometryKeys: result.geometry ? Object.keys(result.geometry) : [],
          title: result.title?.text,
          subtitle: result.subtitle?.text
        });
        
        // Try multiple paths for coordinates
        let rawCoords = result.geometry?.coordinates;
        
        // Try alternative paths if coordinates not found
        if (!rawCoords) {
          rawCoords = result.geometry?.point?.coordinates;
        }
        if (!rawCoords) {
          rawCoords = result.geometry?.bbox ? [result.geometry.bbox[0], result.geometry.bbox[1]] : null;
        }
        if (!rawCoords && result.geometry) {
          // Try to find any array in geometry
          for (const key in result.geometry) {
            if (Array.isArray(result.geometry[key]) && result.geometry[key].length >= 2) {
              rawCoords = result.geometry[key];
              console.log(`📍 Found coordinates in geometry.${key}:`, rawCoords);
              break;
            }
          }
        }
        
        console.log('🔍 Extracted coordinates:', {
          raw: rawCoords,
          first: rawCoords?.[0],
          second: rawCoords?.[1],
          address: result.title?.text
        });
        
        // If coordinates still not found, use geocoding as fallback
        if (!rawCoords || rawCoords.length < 2) {
          console.warn('⚠️ Coordinates not found in suggest response, attempting geocoding...');
          const addressText = result.title?.text || '';
          
          if (addressText) {
            try {
              const geocoded = await geocodeAddress(addressText);
              if (geocoded && geocoded.coordinates) {
                console.log('✅ Got coordinates from geocoding:', geocoded.coordinates);
                rawCoords = geocoded.coordinates;
              } else {
                console.warn('⚠️ Geocoding failed for:', addressText);
              }
            } catch (error) {
              console.error('❌ Geocoding error:', error);
            }
          }
        }
        
        // If still no coordinates, return with [0, 0] (will use text validation)
        if (!rawCoords || rawCoords.length < 2) {
          console.warn('⚠️ No coordinates available, will use text-based validation');
          return {
            title: result.title?.text || '',
            subtitle: result.subtitle?.text || '',
            coordinates: [0, 0] as [number, number], // Invalid coordinates - will trigger text validation
            address: result.title?.text || ''
          };
        }
        
        // Tashkent coordinates: lat ~41.3-41.4, lng ~69.2-69.3
        // Check if coordinates are already in [lat, lng] format or need swapping
        const first = rawCoords[0];
        const second = rawCoords[1];
        
        // Expanded ranges for Tashkent area to catch edge cases
        // Latitude range: 41.0-42.0 (broader range for Tashkent region)
        // Longitude range: 69.0-70.0 (broader range for Tashkent region)
        let coordinates: [number, number];
        
        // Check if first value looks like latitude (41-42) and second looks like longitude (69-70)
        const firstIsLat = first >= 41.0 && first <= 42.0;
        const secondIsLng = second >= 69.0 && second <= 70.0;
        const firstIsLng = first >= 69.0 && first <= 70.0;
        const secondIsLat = second >= 41.0 && second <= 42.0;
        
        if (firstIsLat && secondIsLng) {
          // Already in [lat, lng] format
          coordinates = [first, second];
          console.log('✅ Coordinates already in [lat, lng] format:', coordinates);
        } else if (firstIsLng && secondIsLat) {
          // In [lng, lat] format, need to swap
          coordinates = [second, first];
          console.log('🔄 Swapped coordinates from [lng, lat] to [lat, lng]:', coordinates);
        } else {
          // Unknown format - try to determine by checking which value is closer to known Tashkent center
          // Tashkent center: ~41.31, 69.24
          const tashkentCenterLat = 41.31;
          const tashkentCenterLng = 69.24;
          
          const distFirstToLat = Math.abs(first - tashkentCenterLat);
          const distFirstToLng = Math.abs(first - tashkentCenterLng);
          const distSecondToLat = Math.abs(second - tashkentCenterLat);
          const distSecondToLng = Math.abs(second - tashkentCenterLng);
          
          // If first is closer to lat center and second is closer to lng center, use as-is
          // Otherwise swap
          if (distFirstToLat < distFirstToLng && distSecondToLng < distSecondToLat) {
            coordinates = [first, second];
            console.log('✅ Determined [lat, lng] format by distance to Tashkent center:', coordinates);
          } else {
            coordinates = [second, first];
            console.log('🔄 Swapped coordinates based on distance to Tashkent center:', coordinates);
          }
        }
        
        console.log('📍 Final coordinates:', {
          original: rawCoords,
          converted: coordinates,
          lat: coordinates[0],
          lng: coordinates[1],
          address: result.title?.text
        });
        
        return {
          title: result.title?.text || '',
          subtitle: result.subtitle?.text || '',
          coordinates,
          address: result.title?.text || ''
        };
      }));
      console.log('📍 Processed suggestions:', suggestions.length);
      return suggestions;
    }
    
    console.log('⚠️ No results in API response');
    return [];
  } catch (error) {
    console.error('❌ Address suggestions error:', error);
    return [];
  }
};

/**
 * Create a map instance with default settings for Tashkent
 */
export const createMap = async (containerId: string | HTMLElement, options: {
  center?: [number, number];
  zoom?: number;
  controls?: string[];
  type?: string;
} = {}): Promise<any> => {
  const ymaps = await getYandexMaps();
  
  // Get container element
  const container = typeof containerId === 'string' 
    ? document.getElementById(containerId) || document.querySelector(containerId)
    : containerId;
  
  if (!container) {
    throw new Error('Map container element not found');
  }
  
  // Ensure container has dimensions
  const rect = container.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    console.warn('Map container has zero dimensions, setting minimum size');
    if (container instanceof HTMLElement) {
      container.style.minWidth = '300px';
      container.style.minHeight = '300px';
    }
  }
  
  const defaultOptions = {
    center: options.center || [41.2995, 69.2401], // Tashkent coordinates [lat, lng] for Yandex
    zoom: options.zoom || 12,
    type: options.type || 'yandex#map', // Use standard map type, not satellite
    controls: options.controls || ['zoomControl', 'typeSelector', 'fullscreenControl']
  };
  
  console.log('Creating map with options:', defaultOptions);
  console.log('Container dimensions:', rect.width, 'x', rect.height);
  
  const map = new ymaps.Map(container, defaultOptions);
  
  console.log('Map instance created, waiting for ready event...');
  
  // Wait for map to be ready with timeout
  return new Promise((resolve, reject) => {
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (resolved) return;
      console.error('Map ready event timeout');
      
      // Check if map is actually ready by checking its properties
      try {
        const center = map.getCenter();
        const zoom = map.getZoom();
        if (center && zoom !== undefined) {
          console.log('Map appears to be ready (has center and zoom), resolving anyway');
          resolved = true;
          resolve(map);
          return;
        }
      } catch (e) {
        console.warn('Could not check map state:', e);
      }
      
      reject(new Error('Map ready event timeout - map may not be initializing correctly'));
    }, 15000); // 15 second timeout
    
    map.events.add('ready', () => {
      if (resolved) return;
      clearTimeout(timeout);
      console.log('✅ Map is ready');
      resolved = true;
      resolve(map);
    });
    
    // Also listen for errors
    map.events.add('error', (error: any) => {
      if (resolved) return;
      clearTimeout(timeout);
      console.error('Map error event:', error);
      resolved = true;
      reject(new Error(`Map initialization error: ${error}`));
    });
    
    // Fallback: Check if map is ready after a short delay
    setTimeout(() => {
      if (resolved) return;
      try {
        const center = map.getCenter();
        const zoom = map.getZoom();
        if (center && zoom !== undefined) {
          console.log('Map appears ready (fallback check), resolving');
          clearTimeout(timeout);
          resolved = true;
          resolve(map);
        }
      } catch (e) {
        // Map not ready yet, continue waiting
      }
    }, 2000); // Check after 2 seconds
  });
};

/**
 * Create a draggable marker
 * @param map - Yandex Maps instance
 * @param coordinates - [latitude, longitude] format for Yandex Maps
 */
export const createDraggableMarker = async (map: any, coordinates: [number, number]): Promise<any> => {
  const ymaps = await getYandexMaps();
  
  // Yandex Maps Placemark uses [lat, lng] format
  const marker = new ymaps.Placemark(coordinates, {}, {
    draggable: true,
    preset: 'islands#redDotIcon'
  });
  
  map.geoObjects.add(marker);
  return marker;
};

/**
 * Draw delivery zone polygon on map
 */
export const drawDeliveryZone = async (map: any, polygon: [number, number][]): Promise<any> => {
  try {
    const ymaps = await getYandexMaps();
    
    // Verify map is ready
    if (!map || !map.geoObjects) {
      throw new Error('Map is not ready or invalid');
    }
    
    // Convert polygon coordinates to Yandex format [lat, lng]
    // Yandex Maps Polygon uses [latitude, longitude] format
    let coordinates = polygon.map(([lat, lng]) => [lat, lng]);
    
    // Ensure polygon is closed (first and last point must be the same)
    const firstPoint = coordinates[0];
    const lastPoint = coordinates[coordinates.length - 1];
    if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
      coordinates.push([firstPoint[0], firstPoint[1]]);
    }
    
    console.log('Drawing delivery zone polygon with coordinates:', coordinates);
    console.log('Number of coordinates:', coordinates.length);
    console.log('First point:', coordinates[0]);
    console.log('Last point:', coordinates[coordinates.length - 1]);
    
    // Yandex Maps Polygon requires triple-nested array: [[[lng1, lat1], [lng2, lat2], ...]]
    // Structure: [ [outerRing], [hole1], [hole2], ... ]
    // For a simple polygon with no holes: [[[lng1, lat1], [lng2, lat2], ...]]
    const polygonCoordinates = [coordinates];
    
    console.log('Polygon coordinates structure (triple-nested):', polygonCoordinates);
    console.log('Polygon coordinates length check:', polygonCoordinates.length, polygonCoordinates[0]?.length);
    
    // Create polygon with highly visible styling
    const deliveryZonePolygon = new ymaps.Polygon(
      polygonCoordinates,
      {
        hintContent: 'Delivery Zone - Yunusabad District',
        balloonContent: 'We deliver to this area'
      },
      {
        // Fill styling - solid green fill for delivery zone
        fillColor: '#16a34a', // Green color
        fillOpacity: 0.55, // 55% opacity for solid green fill
        // Stroke styling - make border very visible
        strokeColor: '#15803d', // Darker green border
        strokeWidth: 4, // Thick border for visibility
        strokeStyle: 'solid',
        strokeOpacity: 1.0,
        // Additional options
        cursor: 'pointer',
        zIndex: 100, // Higher z-index to ensure it's visible above outside areas
        // Ensure polygon is interactive
        interactive: true
      }
    );
    
    console.log('✅ Polygon created successfully:', deliveryZonePolygon);
    
    // Add polygon to map
    map.geoObjects.add(deliveryZonePolygon);
    
    console.log('✅ Polygon added to map geoObjects');
    console.log('Map geoObjects count:', map.geoObjects.getLength());
    
    // Calculate center of polygon for map centering
    const centerLat = (Math.min(...polygon.map(p => p[0])) + Math.max(...polygon.map(p => p[0]))) / 2;
    const centerLng = (Math.min(...polygon.map(p => p[1])) + Math.max(...polygon.map(p => p[1]))) / 2;
    
    console.log('Delivery zone center:', [centerLat, centerLng]);
    console.log('Yandex format center:', [centerLng, centerLat]);
    
    // Wait for map to be ready, then fit bounds and center
    setTimeout(() => {
      try {
        const bounds = deliveryZonePolygon.geometry.getBounds();
        console.log('Polygon bounds:', bounds);
        console.log('Bounds type:', typeof bounds);
        console.log('Bounds is array:', Array.isArray(bounds));
        
        if (bounds) {
          // Yandex Maps bounds can be an array [[minLng, minLat], [maxLng, maxLat]]
          // or an object with getNorthEast() and getSouthWest() methods
          try {
            if (Array.isArray(bounds) && bounds.length === 2) {
              // Array format
              map.setBounds(bounds, {
                checkZoomRange: true,
                duration: 500,
                zoomMargin: [50, 50, 50, 50] // Add margin on all sides
              });
              console.log('✅ Map bounds set successfully (array format)');
            } else if (bounds && typeof bounds === 'object' && bounds.getNorthEast && bounds.getSouthWest) {
              // Object format with methods
              map.setBounds(bounds, {
                checkZoomRange: true,
                duration: 500,
                zoomMargin: [50, 50, 50, 50]
              });
              console.log('✅ Map bounds set successfully (object format)');
            } else {
              // Try using bounds directly
              map.setBounds(bounds, {
                checkZoomRange: true,
                duration: 500,
                zoomMargin: [50, 50, 50, 50]
              });
              console.log('✅ Map bounds set successfully (direct)');
            }
          } catch (boundsError) {
            console.warn('Error setting bounds, using center instead:', boundsError);
            // Fallback: center on delivery zone center [lat, lng] for Yandex Maps
            map.setCenter([centerLat, centerLng], 11);
            console.log('✅ Map centered on delivery zone (bounds error fallback)');
          }
        } else {
          console.warn('No bounds available, using center and zoom');
          // Fallback: center on delivery zone center [lat, lng] for Yandex Maps
          map.setCenter([centerLat, centerLng], 11);
          console.log('✅ Map centered on delivery zone');
        }
      } catch (error) {
        console.error('Error setting map bounds:', error);
        // Fallback: just set zoom level and center [lat, lng] for Yandex Maps
        map.setCenter([centerLat, centerLng], 11);
        console.log('✅ Map centered on delivery zone (error fallback)');
      }
    }, 1000); // Increased delay to ensure map is fully ready
    
    return deliveryZonePolygon;
  } catch (error) {
    console.error('Error drawing delivery zone polygon:', error);
    console.error('Error details:', error);
    throw error;
  }
};

/**
 * Draw outside areas polygon (areas outside delivery zone) with red/gray fill
 * Creates a large polygon covering the map area with the delivery zone as a hole
 */
export const drawOutsideAreas = async (
  map: any, 
  deliveryZonePolygon: [number, number][]
): Promise<any> => {
  try {
    const ymaps = await getYandexMaps();
    
    // Verify map is ready
    if (!map || !map.geoObjects) {
      throw new Error('Map is not ready or invalid');
    }
    
    // Create outer polygon covering a large area around Tashkent
    // Bounding box: approximately [41.15, 69.0] to [41.55, 69.5] (larger area)
    // Format: [lat, lng] for Yandex Maps Polygon
    const outerRing: [number, number][] = [
      [41.15, 69.0], // Southwest
      [41.15, 69.5], // Southeast
      [41.55, 69.5], // Northeast
      [41.55, 69.0], // Northwest
      [41.15, 69.0]  // Close polygon
    ];
    
    // Delivery zone polygon is already in [lat, lng] format
    // This will be the hole in the outer polygon
    let holeRing = deliveryZonePolygon.map(([lat, lng]) => [lat, lng] as [number, number]);
    
    // Ensure hole is closed (first and last point must be the same)
    const firstHolePoint = holeRing[0];
    const lastHolePoint = holeRing[holeRing.length - 1];
    if (firstHolePoint[0] !== lastHolePoint[0] || firstHolePoint[1] !== lastHolePoint[1]) {
      holeRing.push([firstHolePoint[0], firstHolePoint[1]]);
    }
    
    console.log('Drawing outside areas polygon...');
    console.log('Outer ring coordinates:', outerRing);
    console.log('Hole ring (delivery zone) coordinates:', holeRing);
    console.log('Delivery zone polygon (original):', deliveryZonePolygon);
    
    // Yandex Maps Polygon with hole format: [outerRing, holeRing]
    // Each ring is an array of [lat, lng] coordinates
    // Format: [[[lat, lng], [lat, lng], ...], [[lat, lng], [lat, lng], ...]]
    const polygonCoordinates = [outerRing, holeRing];
    
    console.log('Outside areas polygon structure:', polygonCoordinates);
    console.log('Outer ring length:', outerRing.length);
    console.log('Hole ring length:', holeRing.length);
    
    // Create polygon with red/gray fill for outside areas
    let outsideAreasPolygon;
    try {
      outsideAreasPolygon = new ymaps.Polygon(
        polygonCoordinates,
        {
          hintContent: 'Outside Delivery Zone',
          balloonContent: 'We do not deliver to this area'
        },
        {
          // Fill styling - light red/gray for outside areas
          fillColor: '#ef4444', // Light red color
          fillOpacity: 0.3, // 30% opacity
          // Stroke styling
          strokeColor: '#991b1b', // Darker red border
          strokeWidth: 2,
          strokeStyle: 'solid',
          strokeOpacity: 0.8,
          // Additional options
          cursor: 'default',
          zIndex: 50, // Lower z-index so delivery zone appears on top
          interactive: false // Not interactive, just visual
        }
      );
      console.log('✅ Outside areas polygon object created');
    } catch (polygonError) {
      console.error('❌ Error creating outside areas polygon:', polygonError);
      throw new Error(`Failed to create outside areas polygon: ${polygonError}`);
    }
    
    console.log('✅ Outside areas polygon created successfully');
    
    // Add polygon to map
    map.geoObjects.add(outsideAreasPolygon);
    
    console.log('✅ Outside areas polygon added to map geoObjects');
    console.log('Map geoObjects count:', map.geoObjects.getLength());
    
    return outsideAreasPolygon;
  } catch (error) {
    console.error('Error drawing outside areas polygon:', error);
    console.error('Error details:', error);
    throw error;
  }
};
