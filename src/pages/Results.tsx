import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { PlaceCard } from '@/components/PlaceCard';
import { FilterBar } from '@/components/FilterBar';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { PlacesMap } from '@/components/PlacesMap';
import { getMoodById } from '@/lib/moods';
import { usePlaces } from '@/hooks/usePlaces';
import { Mood, FilterOptions, Location } from '@/types/place';

const Results = () => {
  const { mood } = useParams<{ mood: string }>();
  const routeLocation = useLocation();
  const userLocation = routeLocation.state?.location as Location | undefined;
  
  const moodConfig = getMoodById(mood || '');
  const { places, loading, error, fetchPlaces, filterAndSortPlaces } = usePlaces();
  
  const [filters, setFilters] = useState<FilterOptions>({
    openNow: false,
    sortBy: 'distance',
  });
  
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>();

  useEffect(() => {
    if (mood) {
      fetchPlaces(mood as Mood, userLocation || null);
    }
  }, [mood, userLocation, fetchPlaces]);

  const filteredPlaces = useMemo(() => {
    return filterAndSortPlaces(places, filters);
  }, [places, filters, filterAndSortPlaces]);

  const handleRetry = () => {
    if (mood) {
      fetchPlaces(mood as Mood, userLocation || null);
    }
  };

  if (!moodConfig) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header showBack />
        <ErrorState message="Invalid mood selected" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header showBack />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{moodConfig.icon}</span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {moodConfig.label} spots
            </h1>
          </div>
          <p className="text-muted-foreground">
            {moodConfig.description}
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : (
          <>
            {/* Map */}
            {filteredPlaces.length > 0 && (
              <div className="mb-6">
                <PlacesMap 
                  places={filteredPlaces}
                  userLocation={userLocation || null}
                  selectedPlaceId={selectedPlaceId}
                  onPlaceSelect={setSelectedPlaceId}
                />
              </div>
            )}
            
            {/* Filter Bar */}
            <FilterBar 
              filters={filters}
              onFilterChange={setFilters}
              resultCount={filteredPlaces.length}
            />
            
            {/* Results Grid */}
            {filteredPlaces.length === 0 ? (
              <EmptyState onRetry={handleRetry} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {filteredPlaces.map((place, index) => (
                  <PlaceCard key={place.id} place={place} index={index} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Results;
