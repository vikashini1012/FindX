import { useState, useCallback } from 'react';
import { Place, Mood, Location, FilterOptions } from '@/types/place';
import { supabase } from '@/integrations/supabase/client';

interface UsePlacesState {
  places: Place[];
  loading: boolean;
  error: string | null;
}

export const usePlaces = () => {
  const [state, setState] = useState<UsePlacesState>({
    places: [],
    loading: false,
    error: null,
  });

  const fetchPlaces = useCallback(async (mood: Mood, location: Location | null) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (!location) {
        setState({
          places: [],
          loading: false,
          error: 'Location is required to find nearby places. Please enable location access.',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('get-places', {
        body: { mood, location },
      });

      if (error) {
        console.error('Edge function error:', error);
        setState({
          places: [],
          loading: false,
          error: 'Failed to fetch places. Please try again.',
        });
        return;
      }

      if (data?.useMock) {
        const errorMsg = data.error 
          ? `Geoapify API error: ${data.error}`
          : data.message || 'API key not configured properly.';
        setState({
          places: [],
          loading: false,
          error: errorMsg,
        });
        return;
      }

      if (data?.places && data.places.length > 0) {
        setState({
          places: data.places,
          loading: false,
          error: null,
        });
      } else {
        setState({
          places: [],
          loading: false,
          error: 'No places found nearby. Try a different mood or location.',
        });
      }
    } catch (err) {
      console.error('Error fetching places:', err);
      setState({
        places: [],
        loading: false,
        error: 'Something went wrong. Please try again.',
      });
    }
  }, []);

  const filterAndSortPlaces = useCallback((places: Place[], filters: FilterOptions): Place[] => {
    let filtered = [...places];

    // Filter by open status
    if (filters.openNow) {
      filtered = filtered.filter(place => place.isOpen);
    }

    // Sort
    filtered.sort((a, b) => {
      if (filters.sortBy === 'distance') {
        return a.distance - b.distance;
      } else {
        return b.rating - a.rating;
      }
    });

    return filtered;
  }, []);

  return {
    ...state,
    fetchPlaces,
    filterAndSortPlaces,
  };
};
