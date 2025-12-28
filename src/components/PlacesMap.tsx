import { useEffect, useRef, useState } from 'react';
import { Place, Location } from '@/types/place';
import { motion } from 'framer-motion';
import { Map, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PlacesMapProps {
  places: Place[];
  userLocation: Location | null;
  selectedPlaceId?: string;
  onPlaceSelect?: (placeId: string) => void;
}

// Fix for default marker icons in Leaflet with bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const selectedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const PlacesMap = ({ places, userLocation, selectedPlaceId, onPlaceSelect }: PlacesMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      const center = userLocation 
        ? [userLocation.lat, userLocation.lng] as [number, number]
        : places[0]?.location 
          ? [places[0].location.lat, places[0].location.lng] as [number, number]
          : [12.93, 80.11] as [number, number];

      // Initialize map with OpenStreetMap tiles
      const map = L.map(mapRef.current).setView(center, 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add user location marker
      if (userLocation) {
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Your Location');
      }

      mapInstanceRef.current = map;
      setIsLoading(false);
    } catch (err) {
      console.error('Map init error:', err);
      setMapError('Failed to initialize map');
      setIsLoading(false);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation]);

  // Update markers when places change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (places.length === 0) return;

    // Add place markers
    const bounds = L.latLngBounds([]);
    
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    places.forEach((place, index) => {
      if (!place.location) return;

      const isSelected = place.id === selectedPlaceId;
      const marker = L.marker([place.location.lat, place.location.lng], {
        icon: isSelected ? selectedIcon : defaultIcon
      })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong>${index + 1}. ${place.name}</strong>
            <br/>
            <span style="color: #666; font-size: 12px;">${place.address}</span>
            <br/>
            <span style="font-size: 12px;">⭐ ${place.rating || 'N/A'} · ${place.distanceText}</span>
          </div>
        `);

      marker.on('click', () => {
        onPlaceSelect?.(place.id);
      });

      markersRef.current.push(marker);
      bounds.extend([place.location.lat, place.location.lng]);
    });

    // Fit map to bounds if we have places
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places, selectedPlaceId, onPlaceSelect, userLocation]);

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
