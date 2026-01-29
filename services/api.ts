
import { FoodItem, StorageConfig } from '../types';

const BASE_URL = 'https://api.jsonbin.io/v3/b';

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 300): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    // Retry on 5xx errors or 429 (Too Many Requests)
    if (!response.ok && (response.status >= 500 || response.status === 429) && retries > 0) {
      throw new Error(`Server error: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

export const api = {
  /**
   * Crée une nouvelle "Bin" (Base de données) sur JSONBin
   */
  createDatabase: async (apiKey: string, initialData: FoodItem[]): Promise<string> => {
    try {
        const response = await fetchWithRetry(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey,
                'X-Bin-Private': 'true', // La base est privée
                'X-Bin-Name': 'FreezerManager'
            },
            body: JSON.stringify(initialData)
        });

        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.message || 'Erreur création base');
        }

        const json = await response.json();
        // JSONBin V3 retourne l'ID dans metadata.id
        return json.metadata.id;
    } catch (error) {
        console.error("API Create Error:", error);
        throw error;
    }
  },

  /**
   * Vérifie si une Bin existe et est accessible
   */
  checkConnection: async (config: StorageConfig): Promise<boolean> => {
    try {
        const url = `${BASE_URL}/${config.binId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Master-Key': config.apiKey
            }
        });
        return response.ok;
    } catch (e) {
        return false;
    }
  },

  /**
   * Récupère les données
   */
  getDatabase: async (config: StorageConfig): Promise<FoodItem[]> => {
    try {
      const url = `${BASE_URL}/${config.binId}`;
      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: {
            'X-Master-Key': config.apiKey
        }
      });

      if (!response.ok) throw new Error(`Erreur lecture: ${response.status}`);

      const json = await response.json();
      // En V3, les données sont dans la propriété "record"
      return json.record || [];
    } catch (error) {
      console.error("API Get Error:", error);
      throw error;
    }
  },

  /**
   * Met à jour la base de données
   */
  updateDatabase: async (config: StorageConfig, data: FoodItem[]): Promise<void> => {
    try {
      const url = `${BASE_URL}/${config.binId}`;
      const response = await fetchWithRetry(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': config.apiKey,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Erreur sauvegarde: ${response.status}`);
    } catch (error) {
      console.error("API Update Error:", error);
      throw error;
    }
  }
};
