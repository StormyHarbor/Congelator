
import { FoodItem, GCSConfig } from '../types';

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
   * Vérifie la connexion au bucket (tente de lire les métadonnées ou le fichier)
   */
  checkConnection: async (config: GCSConfig): Promise<boolean> => {
    try {
        // On essaie de lister le fichier pour voir si on a accès
        const url = `https://storage.googleapis.com/storage/v1/b/${config.bucketName}/o/${encodeURIComponent(config.fileName)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Accept': 'application/json'
            }
        });
        
        // 200 = Existe, 404 = N'existe pas (mais accès OK), 403/401 = Erreur Auth
        if (response.status === 200 || response.status === 404) {
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
  },

  /**
   * Initialise le fichier s'il n'existe pas
   */
  initializeDatabase: async (config: GCSConfig, initialData: FoodItem[]): Promise<void> => {
     // Check if exists first
     try {
         const data = await api.getDatabase(config);
         if (data) return; // File exists, do nothing
     } catch (e) {
         // File likely doesn't exist, create it
         await api.updateDatabase(config, initialData);
     }
  },

  /**
   * Récupère les données depuis GCS
   */
  getDatabase: async (config: GCSConfig): Promise<FoodItem[]> => {
    try {
      // alt=media downloads the content
      const url = `https://storage.googleapis.com/storage/v1/b/${config.bucketName}/o/${encodeURIComponent(config.fileName)}?alt=media`;
      
      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Accept': 'application/json'
        }
      });

      if (response.status === 404) {
        // Si le fichier n'existe pas encore, on retourne un tableau vide
        return []; 
      }

      if (!response.ok) throw new Error(`Erreur GCS: ${response.status}`);

      return await response.json();
    } catch (error) {
      console.error("API Error (Get):", error);
      throw error;
    }
  },

  /**
   * Met à jour la base de données sur GCS (Upload simple)
   */
  updateDatabase: async (config: GCSConfig, data: FoodItem[]): Promise<void> => {
    try {
      // Upload endpoint
      const url = `https://storage.googleapis.com/upload/storage/v1/b/${config.bucketName}/o?uploadType=media&name=${encodeURIComponent(config.fileName)}`;
      
      const response = await fetchWithRetry(url, {
        method: 'POST', // GCS utilise POST pour l'upload initial ou update simple via /upload/
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Erreur sauvegarde GCS: ${response.status}`);
    } catch (error) {
      console.error("API Error (Update):", error);
      throw error;
    }
  }
};
