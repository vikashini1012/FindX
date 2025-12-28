import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mood to Geoapify category mapping
const moodToCategories: Record<string, string[]> = {
  'work': ['catering.cafe', 'office.coworking', 'service.library'],
  'date-night': ['catering.restaurant', 'catering.bar', 'entertainment.nightclub'],
  'quick-bite': ['catering.fast_food', 'catering.restaurant', 'catering.bakery'],
  'budget': ['catering.restaurant', 'catering.cafe', 'catering.bakery'],
  'coffee': ['catering.cafe', 'catering.coffee'],
  'fancy': ['catering.restaurant.fine_dining', 'catering.restaurant', 'catering.bar'],
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mood, location } = await req.json();
    
    console.log(`Fetching places for mood: ${mood}, location:`, location);
    
    // Check if Geoapify API key is available
    const geoapifyApiKey = Deno.env.get('GEOAPIFY_API_KEY');
    
    if (!geoapifyApiKey) {
      console.log('No Geoapify API key configured');
      return new Response(
        JSON.stringify({ 
          useMock: true,
          message: 'Geoapify API key not configured' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const categories = moodToCategories[mood] || ['catering.restaurant'];
    const radius = 5000; // 5km radius
    
    // Fetch places from Geoapify Places API
    const placesUrl = new URL('https://api.geoapify.com/v2/places');
    placesUrl.searchParams.set('categories', categories.join(','));
    placesUrl.searchParams.set('filter', `circle:${location.lng},${location.lat},${radius}`);
    placesUrl.searchParams.set('bias', `proximity:${location.lng},${location.lat}`);
    placesUrl.searchParams.set('limit', '20');
    placesUrl.searchParams.set('apiKey', geoapifyApiKey);
    
    console.log('Fetching from Geoapify:', placesUrl.toString().replace(geoapifyApiKey, 'API_KEY_HIDDEN'));
    
    const placesResponse = await fetch(placesUrl.toString());
    const placesData = await placesResponse.json();
    
    if (!placesResponse.ok) {
      console.error('Geoapify API error:', placesData);
      return new Response(
        JSON.stringify({ useMock: true, error: placesData.message || 'API error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Transform Geoapify response to our format
    const places = (placesData.features || []).map((feature: any) => {
      const props = feature.properties;
      const coords = feature.geometry?.coordinates || [0, 0];
      
      // Calculate distance
      const distance = calculateDistance(
        location.lat, 
        location.lng, 
        coords[1], 
        coords[0]
      );
      
      return {
        id: props.place_id || feature.id,
        name: props.name || props.address_line1 || 'Unknown Place',
        address: props.formatted || props.address_line2 || '',
        distance: distance,
        distanceText: `${distance.toFixed(1)} mi`,
        rating: props.rating || 0,
        totalRatings: props.user_ratings_total || 0,
        isOpen: props.opening_hours ? !props.opening_hours.includes('closed') : true,
        priceLevel: getPriceLevel(props.categories, mood),
        photoUrl: null, // Geoapify doesn't provide photos in basic API
        types: props.categories || [],
        location: { lat: coords[1], lng: coords[0] },
        placeId: props.place_id,
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

// Estimate price level based on categories and mood
function getPriceLevel(categories: string[], mood: string): number {
  if (mood === 'fancy') return 3;
  if (mood === 'budget' || mood === 'quick-bite') return 1;
  if (categories?.some((c: string) => c.includes('fine_dining'))) return 4;
  if (categories?.some((c: string) => c.includes('fast_food'))) return 1;
  return 2;
}
