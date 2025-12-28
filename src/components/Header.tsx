import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export const Header = ({ showBack = false, title }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50"
    >
      <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {showBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-coral flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">FINDX</span>
          </Link>
        )}
        
        {title && (
          <h1 className="font-display text-lg font-semibold text-foreground absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>
        )}
        
        <div className="w-20" /> {/* Spacer for centering */}
      </div>
    </motion.header>
  );
};
