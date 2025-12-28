import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const LoadingState = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <Loader2 className="w-10 h-10 text-coral animate-spin mb-4" />
      <p className="text-muted-foreground font-medium">Finding perfect spots...</p>
    </motion.div>
  );
};
