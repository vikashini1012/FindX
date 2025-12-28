import { motion } from 'framer-motion';
import { MoodConfig } from '@/types/place';
import { cn } from '@/lib/utils';

interface MoodCardProps {
  mood: MoodConfig;
  onClick: () => void;
  index: number;
}

export const MoodCard = ({ mood, onClick, index }: MoodCardProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        scale: 1.03, 
        y: -4,
        transition: { duration: 0.2 } 
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 text-left transition-shadow duration-300",
        "bg-card shadow-card hover:shadow-lg",
        "border border-border/50",
        "group cursor-pointer"
      )}
    >
      {/* Background gradient on hover */}
      <div 
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
          `bg-gradient-to-br ${mood.gradient}`
        )}
      />
      
      {/* Icon */}
      <div className="relative mb-4">
        <span className="text-4xl block transform group-hover:scale-110 transition-transform duration-300">
          {mood.icon}
        </span>
      </div>
      
      {/* Content */}
      <div className="relative">
        <h3 className="font-display text-xl font-bold text-foreground mb-1 group-hover:text-coral transition-colors duration-300">
          {mood.label}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {mood.description}
        </p>
      </div>
      
      {/* Arrow indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <svg 
          className="w-5 h-5 text-coral" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </motion.button>
  );
};
