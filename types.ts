
export type Category = 
  | 'Tout'
  | 'Sauce' 
  | 'Plat' 
  | 'Poisson' 
  | 'Aromatiques' 
  | 'Légumes' 
  | 'Viande';

export type Location = 
  | 'Tiroir Haut' 
  | 'Tiroir du Milieu' 
  | 'Tiroir Bas' 
  | 'Freezer';

export interface FoodItem {
  id: string;
  name: string;
  category: Exclude<Category, 'Tout'>;
  location: Location;
  dateAdded: string; // ISO Date String
}

export interface GCSConfig {
  bucketName: string;
  fileName: string;
  accessToken: string;
}

export const CATEGORIES: Category[] = [
  'Tout',
  'Viande',
  'Poisson',
  'Légumes',
  'Plat',
  'Sauce',
  'Aromatiques',
];

export const LOCATIONS: Location[] = [
  'Tiroir Haut',
  'Tiroir du Milieu',
  'Tiroir Bas',
  'Freezer',
];
