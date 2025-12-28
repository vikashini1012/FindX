import { FilterOptions, SortOption } from '@/types/place';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowUpDown, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  resultCount: number;
}

export const FilterBar = ({ filters, onFilterChange, resultCount }: FilterBarProps) => {
  const handleSortChange = (sortBy: SortOption) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handleOpenNowChange = (openNow: boolean) => {
    onFilterChange({ ...filters, openNow });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card rounded-xl p-4 shadow-card border border-border/50"
    >
      {/* Result count */}
      <div className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{resultCount}</span> places found
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Open now toggle */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Open now</span>
          <Switch
            checked={filters.openNow}
            onCheckedChange={handleOpenNowChange}
          />
        </div>
        
        {/* Sort buttons */}
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <Button
            variant={filters.sortBy === 'distance' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSortChange('distance')}
            className="text-xs h-8"
          >
            <ArrowUpDown className="w-3 h-3 mr-1" />
            Distance
          </Button>
          <Button
            variant={filters.sortBy === 'rating' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSortChange('rating')}
            className="text-xs h-8"
          >
            <ArrowUpDown className="w-3 h-3 mr-1" />
            Rating
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
