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
      reject(new Error('Yandex Maps API key not found. Please set VITE_YANDEX_MAPS_API_KEY in your .env file'));
      return;
    }

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
      if (window.ymaps) {
        window.ymaps.ready(() => {
          yandexMapsLoaded = true;
          resolve();
        });
      } else {
        reject(new Error('Failed to load Yandex Maps API'));
      }
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
      
      return {
        formattedAddress,
        city,
        state,
        country
      };
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

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
    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;
    const url = `https://suggest-maps.yandex.ru/v1/suggest?apikey=${apiKey}&text=${encodeURIComponent(query)}&types=geo,biz&lang=en_US&results=10`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results) {
      return data.results.map((result: any) => ({
        title: result.title?.text || '',
        subtitle: result.subtitle?.text || '',
        coordinates: result.geometry?.coordinates ? [result.geometry.coordinates[1], result.geometry.coordinates[0]] : [0, 0],
        address: result.title?.text || ''
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Address suggestions error:', error);
    return [];
  }
};

/**
 * Create a map instance with default settings for Tashkent
 */
export const createMap = async (containerId: string, options: {
  center?: [number, number];
  zoom?: number;
  controls?: string[];
} = {}): Promise<any> => {
  const ymaps = await getYandexMaps();
  
  const defaultOptions = {
    center: [41.2995, 69.2401], // Tashkent coordinates
    zoom: 12,
    controls: ['zoomControl', 'typeSelector', 'fullscreenControl'],
    ...options
  };
  
  return new ymaps.Map(containerId, defaultOptions);
};

/**
 * Create a draggable marker
 */
export const createDraggableMarker = async (map: any, coordinates: [number, number]): Promise<any> => {
  const ymaps = await getYandexMaps();
  
  const marker = new ymaps.Placemark(coordinates, {}, {
    draggable: true,
    preset: 'islands#redDotIcon'
  });
  
  map.geoObjects.add(marker);
  return marker;
};
