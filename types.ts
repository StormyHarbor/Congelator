
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

export interface ActivityLogEntry {
  date: string; // ISO Date String
  user: string;
  action: 'AJOUTE' | 'SUPPRIME';
  itemName: string;
  category: string;
}

export interface StorageData {
  items: FoodItem[];
  logs: ActivityLogEntry[];
}

export interface StorageConfig {
  apiKey: string; // La clé API de jsonstorage.net
  binId: string;  // L'identifiant unique de l'objet JSON (Artifact ID)
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
