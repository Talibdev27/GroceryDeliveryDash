# Yandex Maps Integration Setup

## Overview

This project now includes Yandex Maps integration for address autocomplete and location selection. Users can search for addresses with real-time suggestions and select precise locations using an interactive map.

## Setup Instructions

### 1. Get Yandex Maps API Key

1. Visit [Yandex Developer Console](https://developer.tech.yandex.ru/)
2. Sign up or log in to your account
3. Create a new project or select an existing one
4. Enable the following APIs:
   - **Yandex Maps JavaScript API** - for interactive maps
   - **Yandex Geocoder API** - for address geocoding
   - **Yandex Suggest API** - for address autocomplete
5. Copy your API key

### 2. Add API Key to Environment

Add your API key to your `.env` file:

```bash
VITE_YANDEX_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Features Implemented

#### Address Autocomplete
- Real-time address suggestions as users type
- Support for Uzbek, Russian, and English languages
- Shows restaurants, landmarks, streets, and points of interest
- Debounced search to avoid excessive API calls

#### Interactive Map
- Embedded Yandex Map centered on Tashkent
- Draggable pin for precise location selection
- Reverse geocoding to get address from coordinates
- Current location detection

#### Location Selector Component
- Combines both search and map functionality
- Two modes: Search and Map
- Synchronizes between search and map selections
- Returns complete location data with coordinates

### 4. Database Changes

The addresses table now includes coordinate fields:
- `latitude` (DECIMAL(10,8))
- `longitude` (DECIMAL(11,8))

These fields are automatically populated when users select locations.

### 5. Pages Updated

- **Checkout Page**: Replaced separate city/state fields with LocationSelector
- **Account Address Management**: Updated Add/Edit Address dialog with LocationSelector

### 6. API Usage

The integration uses three Yandex APIs:

1. **Geocoder API**: Convert addresses to coordinates
2. **Reverse Geocoder API**: Convert coordinates to addresses  
3. **Suggest API**: Get address suggestions for autocomplete

### 7. Error Handling

- Graceful fallback if API key is missing
- Error messages for failed geocoding
- Loading states for better UX

## Testing

1. Start the development server: `npm run dev`
2. Navigate to checkout or account pages
3. Try searching for addresses like "Axmad Oltin Jo'ja" or "Tashkent"
4. Test the map functionality by dragging the pin
5. Verify coordinates are saved with addresses

## Troubleshooting

### Common Issues

1. **"Yandex Maps API key not found"**
   - Ensure `VITE_YANDEX_MAPS_API_KEY` is set in your `.env` file
   - Restart the development server after adding the key

2. **Address suggestions not showing**
   - Check browser console for API errors
   - Verify API key has correct permissions
   - Ensure Suggest API is enabled in Yandex Console

3. **Map not loading**
   - Check if JavaScript API is enabled
   - Verify API key has map permissions
   - Check browser console for errors

### API Limits

- Yandex Maps has usage limits based on your plan
- Monitor usage in the Yandex Developer Console
- Consider implementing caching for frequently searched addresses

## Support

For Yandex Maps API issues:
- [Yandex Maps Documentation](https://yandex.com/dev/maps/)
- [Yandex Developer Support](https://yandex.com/support/maps/)

For implementation questions, check the component files:
- `client/src/lib/yandex-maps.ts` - API utilities
- `client/src/components/ui/LocationSelector.tsx` - Main component
- `client/src/components/ui/AddressAutocomplete.tsx` - Search component
- `client/src/components/ui/MapPicker.tsx` - Map component
