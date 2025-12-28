/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from 'react';
import { Place, Location } from '@/types/place';
import { motion } from 'framer-motion';
import { Map, Loader2 } from 'lucide-react';

interface PlacesMapProps {
  places: Place[];
  userLocation: Location | null;
  selectedPlaceId?: string;
  onPlaceSelect?: (placeId: string) => void;
}

export const PlacesMap = ({ places, userLocation, selectedPlaceId, onPlaceSelect }: PlacesMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        initializeMap();
        return;
      }

      // Check if script is already loading
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', initializeMap);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setMapError('Failed to load map');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && places.length > 0) {
      updateMarkers();
    }
  }, [places, selectedPlaceId]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) {
      setMapError('Map initialization failed');
      setIsLoading(false);
      return;
    }

    const center = userLocation 
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : places[0]?.location || { lat: 12.93, lng: 80.11 };

    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 14,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Add user location marker
      if (userLocation) {
        new window.google.maps.Marker({
          position: userLocation,
          map: mapInstanceRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
          title: 'Your Location',
        });
      }

      updateMarkers();
      setIsLoading(false);
    } catch (err) {
      console.error('Map init error:', err);
      setMapError('Failed to initialize map');
      setIsLoading(false);
    }
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (places.length === 0) return;

    // Add place markers
    const bounds = new window.google.maps.LatLngBounds();
    
    if (userLocation) {
      bounds.extend(userLocation);
    }

    places.forEach((place, index) => {
      const isSelected = place.id === selectedPlaceId;
      
      const marker = new window.google.maps.Marker({
        position: place.location,
        map: mapInstanceRef.current,
        title: place.name,
        label: {
          text: String(index + 1),
          color: '#FFFFFF',
          fontSize: '11px',
          fontWeight: 'bold',
        },
      });

      marker.addListener('click', () => {
        onPlaceSelect?.(place.id);
      });

      markersRef.current.push(marker);
      bounds.extend(place.location);
    });

    mapInstanceRef.current.fitBounds(bounds);
  };

  if (mapError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden shadow-card border border-border/50 bg-secondary h-64 flex items-center justify-center"
      >
        <div className="text-center text-muted-foreground">
          <Map className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{mapError}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl overflow-hidden shadow-card border border-border/50 bg-card"
    >
      {isLoading && (
        <div className="absolute inset-0 bg-secondary flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin text-coral" />
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-64 md:h-80"
        style={{ minHeight: '250px' }}
      />
    </motion.div>
  );
};

// Custom map styles
const mapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e0f2fe' }],
  },
];
