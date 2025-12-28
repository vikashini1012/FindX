import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mood to Google Places category mapping
const moodToCategories: Record<string, string[]> = {
  'work': ['cafe', 'coworking_space', 'library'],
  'date-night': ['restaurant', 'bar', 'night_club'],
  'quick-bite': ['fast_food', 'restaurant', 'bakery'],
  'budget': ['restaurant', 'cafe', 'bakery'],
  'coffee': ['cafe', 'coffee_shop'],
  'fancy': ['restaurant', 'bar'],
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mood, location } = await req.json();
    
    console.log(`Fetching places for mood: ${mood}, location:`, location);
    
    // Check if Google API key is available
    const googleApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (!googleApiKey) {
      console.log('No Google API key configured, returning mock data signal');
      return new Response(
        JSON.stringify({ 
          useMock: true,
          message: 'Google API key not configured, using mock data' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const categories = moodToCategories[mood] || ['restaurant'];
    const radius = 5000; // 5km radius
    
    // Fetch places from Google Places API
    const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    placesUrl.searchParams.set('location', `${location.lat},${location.lng}`);
    placesUrl.searchParams.set('radius', radius.toString());
    placesUrl.searchParams.set('type', categories[0]);
    placesUrl.searchParams.set('key', googleApiKey);
    
    // Add price level filter for budget mood
    if (mood === 'budget') {
      placesUrl.searchParams.set('maxprice', '1');
    } else if (mood === 'fancy') {
      placesUrl.searchParams.set('minprice', '3');
    }
    
    const placesResponse = await fetch(placesUrl.toString());
    const placesData = await placesResponse.json();
    
    if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', placesData);
      return new Response(
        JSON.stringify({ useMock: true, error: placesData.status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Transform and calculate distances
    const places = (placesData.results || []).slice(0, 10).map((place: any) => {
      const placeLocation = place.geometry?.location;
      const distance = placeLocation 
        ? calculateDistance(location.lat, location.lng, placeLocation.lat, placeLocation.lng)
        : 0;
      
      return {
        id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address || '',
        distance: distance,
        distanceText: `${distance.toFixed(1)} mi`,
        rating: place.rating || 0,
        totalRatings: place.user_ratings_total || 0,
        isOpen: place.opening_hours?.open_now ?? true,
        priceLevel: place.price_level,
        photoUrl: place.photos?.[0]?.photo_reference 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${googleApiKey}`
          : null,
        types: place.types || [],
        location: placeLocation || { lat: 0, lng: 0 },
      };
    });
    
    console.log(`Found ${places.length} places`);
    
    return new Response(
      JSON.stringify({ places }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    console.error('Error in get-places function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ useMock: true, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
});

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
