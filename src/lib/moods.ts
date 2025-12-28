import { MoodConfig } from '@/types/place';

export const moods: MoodConfig[] = [
  {
    id: 'work',
    label: 'Work',
    icon: '💻',
    description: 'Cafes & coworking spaces with WiFi',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'date-night',
    label: 'Date Night',
    icon: '🌹',
    description: 'Romantic restaurants & bars',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    id: 'quick-bite',
    label: 'Quick Bite',
    icon: '🍔',
    description: 'Fast & casual dining options',
    gradient: 'from-orange-500 to-amber-600',
  },
  {
    id: 'budget',
    label: 'Budget',
    icon: '💰',
    description: 'Affordable & value options',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    id: 'coffee',
    label: 'Coffee',
    icon: '☕',
    description: 'Best coffee shops nearby',
    gradient: 'from-amber-600 to-yellow-700',
  },
  {
    id: 'fancy',
    label: 'Fancy',
    icon: '✨',
    description: 'Upscale dining experiences',
    gradient: 'from-purple-500 to-violet-600',
  },
];

export const getMoodById = (id: string): MoodConfig | undefined => {
  return moods.find(mood => mood.id === id);
};
