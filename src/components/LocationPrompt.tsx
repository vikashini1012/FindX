import { motion } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationPromptProps {
  onEnableLocation: () => void;
  onSkip: () => void;
  loading?: boolean;
  error?: string | null;
}

export const LocationPrompt = ({ onEnableLocation, onSkip, loading, error }: LocationPromptProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-card rounded-2xl shadow-lg p-6 max-w-md w-full border border-border/50"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-coral" />
          </div>
          
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Enable Location
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Allow FINDX to access your location to show you the best places nearby.
          </p>

          {error && (
            <p className="text-sm text-destructive mb-4 bg-destructive/10 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="coral" 
              size="lg" 
              className="flex-1"
              onClick={onEnableLocation}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Enable Location
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={onSkip}
              disabled={loading}
            >
              Skip for now
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
