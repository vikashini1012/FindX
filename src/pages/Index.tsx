import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { MoodCard } from '@/components/MoodCard';
import { LocationPrompt } from '@/components/LocationPrompt';
import { moods } from '@/lib/moods';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Mood } from '@/types/place';

const Index = () => {
  const navigate = useNavigate();
  const { location, loading, error, requestLocation } = useGeolocation();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  useEffect(() => {
    // Check if we already have location permission
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (result.state === 'granted') {
          requestLocation();
        }
      } catch (e) {
        // Permission API not supported, will prompt when needed
      }
    };
    checkPermission();
  }, []);

  const handleMoodSelect = (moodId: Mood) => {
    setSelectedMood(moodId);
    
    if (!location) {
      setShowLocationPrompt(true);
    } else {
      navigate(`/results/${moodId}`, { state: { location } });
    }
  };

  const handleEnableLocation = () => {
    requestLocation();
  };

  useEffect(() => {
    if (location && selectedMood) {
      setShowLocationPrompt(false);
      navigate(`/results/${selectedMood}`, { state: { location } });
    }
  }, [location, selectedMood, navigate]);

  const handleSkipLocation = () => {
    setShowLocationPrompt(false);
    if (selectedMood) {
      navigate(`/results/${selectedMood}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-coral/10 text-coral px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Discover your perfect spot</span>
          </motion.div>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
            What's your <span className="text-gradient-coral">mood</span> today?
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select how you're feeling and we'll find the best places nearby that match your vibe.
          </p>
        </motion.div>

        {/* Location Status */}
        {location && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8"
          >
            <MapPin className="w-4 h-4 text-coral" />
            <span>Location enabled - showing places near you</span>
          </motion.div>
        )}

        {/* Mood Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {moods.map((mood, index) => (
            <MoodCard
              key={mood.id}
              mood={mood}
              index={index}
              onClick={() => handleMoodSelect(mood.id)}
            />
          ))}
        </div>

        {/* Footer note */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          Powered by local recommendations • Updated in real-time
        </motion.p>
      </main>

      {/* Location Prompt Modal */}
      <AnimatePresence>
        {showLocationPrompt && (
          <LocationPrompt
            onEnableLocation={handleEnableLocation}
            onSkip={handleSkipLocation}
            loading={loading}
            error={error}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
