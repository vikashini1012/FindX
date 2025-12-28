export type Mood = 'work' | 'date-night' | 'quick-bite' | 'budget' | 'coffee' | 'fancy';

export interface MoodConfig {
  id: Mood;
  label: string;
  icon: string;
  description: string;
  gradient: string;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  distance: number;
  distanceText: string;
  rating: number;
  totalRatings: number;
  isOpen: boolean;
  openingHours?: string;
  priceLevel?: number;
  photoUrl?: string;
  types: string[];
  location: {
    lat: number;
    lng: number;
  };
}

export interface Location {
  lat: number;
  lng: number;
}

export type SortOption = 'distance' | 'rating';

export interface FilterOptions {
  openNow: boolean;
  sortBy: SortOption;
}
