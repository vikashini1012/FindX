import { motion } from 'framer-motion';
import { MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onRetry?: () => void;
}

export const EmptyState = ({ onRetry }: EmptyStateProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <MapPin className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        No places found
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        We couldn't find any places matching your criteria. Try adjusting your filters or searching in a different area.
      </p>
      {onRetry && (
        <Button variant="coral-outline" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      )}
    </motion.div>
  );
};
