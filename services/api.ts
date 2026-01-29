
import { FoodItem, ActivityLogEntry, StorageConfig, StorageData } from '../types';

const BASE_URL = 'https://api.jsonstorage.net/v1/json';

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
   * Crée un nouvel objet JSON sur jsonstorage.net
   */
  createDatabase: async (apiKey: string, initialItems: FoodItem[]): Promise<string> => {
    try {
        const url = `${BASE_URL}?apiKey=${apiKey}`;
        
        // Nouvelle structure : items + logs
        const initialData: StorageData = {
            items: initialItems,
            logs: []
        };

        const response = await fetchWithRetry(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(initialData)
        });

        if (!response.ok) {
             throw new Error('Erreur création base (Vérifiez votre clé API)');
        }

        const text = await response.text();
        if (!text) throw new Error("Réponse vide du serveur lors de la création");

        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            json = text;
        }

        let uri = "";
        if (typeof json === 'string') {
             uri = json;
        } else if (typeof json === 'object' && json.uri) {
             uri = json.uri;
        } else {
             throw new Error("Format de réponse inattendu lors de la création");
        }

        const parts = uri.split('/');
        const newId = parts[parts.length - 1];
        
        return newId;
    } catch (error) {
        console.error("API Create Error:", error);
        throw error;
    }
  },

  /**
   * Vérifie si l'ID existe
   */
  checkConnection: async (config: StorageConfig): Promise<void> => {
    try {
        const url = `${BASE_URL}/${config.binId}`;
        const response = await fetch(url, { method: 'GET' });

        if (response.status === 404) throw new Error("BIN_NOT_FOUND");
        if (!response.ok) throw new Error(`Erreur connexion (${response.status})`);
    } catch (e: any) {
        if (e.message === 'BIN_NOT_FOUND') throw e;
        throw new Error(e.message || "Erreur réseau.");
    }
  },

  /**
   * Récupère les données (Items + Logs)
   * Gère la rétrocompatibilité si l'API renvoie un tableau simple
   */
  getDatabase: async (config: StorageConfig): Promise<StorageData> => {
    try {
      const url = `${BASE_URL}/${config.binId}`;
      const response = await fetchWithRetry(url, { method: 'GET' });

      if (response.status === 404) throw new Error("BIN_NOT_FOUND");
      if (!response.ok) throw new Error(`Erreur lecture: ${response.status}`);

      const text = await response.text();
      
      if (!text || text.trim() === "") {
          return { items: [], logs: [] };
      }

      const data = JSON.parse(text);
      
      // Migration automatique : si c'est un tableau, on le convertit en structure objet
      if (Array.isArray(data)) {
          return { items: data, logs: [] };
      }
      
      // Si c'est déjà le nouveau format
      if (data.items) {
          return { items: data.items, logs: data.logs || [] };
      }

      return { items: [], logs: [] };
    } catch (error) {
      console.error("API Get Error:", error);
      throw error;
    }
  },

  /**
   * Met à jour la base de données
   */
  updateDatabase: async (config: StorageConfig, items: FoodItem[], logs: ActivityLogEntry[]): Promise<void> => {
    try {
      const url = `${BASE_URL}/${config.binId}?apiKey=${config.apiKey}`;
      
      const payload: StorageData = {
          items,
          logs
      };

      const response = await fetchWithRetry(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) throw new Error("BIN_NOT_FOUND");
      if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
              throw new Error("Clé API invalide pour la mise à jour");
          }
          throw new Error(`Erreur sauvegarde: ${response.status}`);
      }
    } catch (error) {
      console.error("API Update Error:", error);
      throw error;
    }
  }
};
