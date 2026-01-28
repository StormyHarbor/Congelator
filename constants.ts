import { FoodItem } from './types';

// Helper to get date X months ago
const getDateMonthsAgo = (months: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
};

export const INITIAL_ITEMS: FoodItem[] = [
  {
    id: '1',
    name: 'Steak Haché x4',
    category: 'Viande',
    location: 'Tiroir Haut',
    dateAdded: getDateMonthsAgo(1),
  },
  {
    id: '2',
    name: 'Saumon',
    category: 'Poisson',
    location: 'Tiroir du Milieu',
    dateAdded: getDateMonthsAgo(7), // Expired example
  },
  {
    id: '3',
    name: 'Soupe de Potiron',
    category: 'Plat',
    location: 'Tiroir Bas',
    dateAdded: getDateMonthsAgo(2),
  },
  {
    id: '4',
    name: 'Persil',
    category: 'Aromatiques',
    location: 'Freezer',
    dateAdded: getDateMonthsAgo(0),
  },
];

export const THEME = {
    bg: 'bg-[#FCDFB8]', // Pale peach
    text: 'text-[#2C4642]', // Dark Green
    textLight: 'text-[#5C7672]',
    accent: 'bg-[#2C4642]', // Dark Green Button
    danger: 'text-red-500',
    warning: 'bg-orange-100 text-orange-700',
};