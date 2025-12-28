import { useState, useCallback } from 'react';
import { Place, Mood, Location, FilterOptions, SortOption } from '@/types/place';
import { getMockPlaces } from '@/lib/mock-places';
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
      // Try to fetch from edge function if location is available
      if (location) {
        const { data, error } = await supabase.functions.invoke('get-places', {
          body: { mood, location },
        });

        if (!error && data?.places) {
          setState({
            places: data.places,
            loading: false,
            error: null,
          });
          return;
        }
      }

      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      const mockPlaces = getMockPlaces(mood);
      setState({
        places: mockPlaces,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error fetching places:', err);
      // Fall back to mock data on error
      const mockPlaces = getMockPlaces(mood);
      setState({
        places: mockPlaces,
        loading: false,
        error: null,
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
