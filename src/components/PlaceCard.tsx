import { motion } from 'framer-motion';
import { Place } from '@/types/place';
import { MapPin, Star, Clock, Navigation, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PlaceCardProps {
  place: Place;
  index: number;
}

export const PlaceCard = ({ place, index }: PlaceCardProps) => {
  const priceIndicator = place.priceLevel 
    ? '$'.repeat(place.priceLevel) 
    : null;

  const handleGetDirections = () => {
    const destination = encodeURIComponent(place.address || place.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${place.id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={cn(
        "bg-card rounded-2xl overflow-hidden shadow-card",
        "border border-border/50",
        "hover:shadow-lg transition-all duration-300",
        "group"
      )}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={place.photoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Open/Closed badge */}
        <div className={cn(
          "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold",
          place.isOpen 
            ? "bg-mint/90 text-foreground" 
            : "bg-secondary/90 text-muted-foreground"
        )}>
          {place.isOpen ? 'Open' : 'Closed'}
        </div>
        
        {/* Price level */}
        {priceIndicator && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-card/90 text-xs font-medium text-muted-foreground">
            {priceIndicator}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Name and rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-lg font-bold text-foreground line-clamp-1 group-hover:text-coral transition-colors">
            {place.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 fill-amber text-amber" />
            <span className="text-sm font-semibold text-foreground">{place.rating}</span>
            <span className="text-xs text-muted-foreground">({place.totalRatings})</span>
          </div>
        </div>
        
        {/* Address */}
        <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="text-sm line-clamp-1">{place.address}</span>
        </div>
        
        {/* Stats row */}
        <div className="flex items-center justify-between mb-3">
          {/* Distance */}
          <div className="flex items-center gap-1.5 text-sm">
            <Navigation className="w-4 h-4 text-coral" />
            <span className="font-medium text-foreground">{place.distanceText}</span>
          </div>
          
          {/* Hours */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{place.openingHours || (place.isOpen ? 'Open now' : 'Closed')}</span>
          </div>
        </div>
        
        {/* Directions button */}
        <Button 
          variant="coral" 
          size="sm" 
          className="w-full"
          onClick={handleGetDirections}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Get Directions
        </Button>
      </div>
    </motion.div>
  );
};
