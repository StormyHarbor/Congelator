
import React, { useState } from 'react';
import { THEME } from '../constants';
import { Cloud, ArrowRight, Loader2, Key, Database, Link } from 'lucide-react';
import { StorageConfig, FoodItem } from '../types';
import { api } from '../services/api';
import { INITIAL_ITEMS } from '../constants';

interface SyncSetupProps {
  onSyncConfigured: (config: StorageConfig) => void;
  currentItems?: FoodItem[];
}

export const SyncSetup: React.FC<SyncSetupProps> = ({ onSyncConfigured, currentItems }) => {
  const [apiKey, setApiKey] = useState('');
  const [binId, setBinId] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
        setError("La clé API est obligatoire.");
        return;
    }

    if (mode === 'join' && !binId.trim()) {
        setError("Pour rejoindre, l'ID de la base est obligatoire.");
        return;
    }

    setLoading(true);
    setError('');

    try {
      let finalBinId = binId.trim();

      if (mode === 'create') {
          // Création d'une nouvelle base
          // Use currentItems if available (preserving data during migration), otherwise INITIAL_ITEMS
          const dataToUpload = (currentItems && currentItems.length > 0) ? currentItems : INITIAL_ITEMS;
          finalBinId = await api.createDatabase(apiKey.trim(), dataToUpload);
      } else {
          // Vérification de la base existante
          const configTest: StorageConfig = { apiKey: apiKey.trim(), binId: finalBinId };
          await api.checkConnection(configTest);
      }

      const config: StorageConfig = {
          apiKey: apiKey.trim(),
          binId: finalBinId
      };

      // Sauvegarde
      localStorage.setItem('congelator_storage_config', JSON.stringify(config));
      onSyncConfigured(config);

    } catch (e: any) {
      console.error(e);
      if (e.message === 'BIN_NOT_FOUND') {
         setError("ID de base introuvable. Vérifiez l'ID.");
      } else {
         setError(e.message || "Erreur de connexion. Vérifiez votre clé API.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${THEME.bg}`}>
      <div className="w-full max-w-md bg-white/40 backdrop-blur-md rounded-[40px] shadow-2xl p-8 border border-white/20 animate-in fade-in zoom-in duration-300">
        
        <div className="flex flex-col items-center mb-6">
          <div className={`${THEME.accent} p-4 rounded-full shadow-lg mb-4`}>
            <Cloud size={40} className="text-[#FCDFB8]" />
          </div>
          <h1 className={`text-xl font-bold text-center ${THEME.text}`}>Synchronisation Cloud</h1>
          <p className={`text-sm text-center ${THEME.textLight} mt-2`}>
            Utilise <b>jsonstorage.net</b> pour stocker vos données.
          </p>
        </div>

        {error && (
            <div className="bg-red-100 text-red-600 text-xs p-3 rounded-xl text-center font-medium mb-4">
              {error}
            </div>
        )}

        {/* Mode Toggles */}
        <div className="flex bg-white/40 p-1 rounded-xl mb-6">
            <button 
                onClick={() => setMode('create')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'create' ? 'bg-[#2C4642] text-[#FCDFB8] shadow-md' : 'text-[#5C7672] hover:bg-white/40'}`}
            >
                Nouvelle Base
            </button>
            <button 
                onClick={() => setMode('join')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'join' ? 'bg-[#2C4642] text-[#FCDFB8] shadow-md' : 'text-[#5C7672] hover:bg-white/40'}`}
            >
                Rejoindre
            </button>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
             <div className="space-y-1">
                <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${THEME.textLight} flex items-center`}>
                    <Key size={12} className="mr-1"/> Clé API (JsonStorage)
                </label>
                <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className={`w-full py-3 px-4 rounded-xl bg-white/60 border-none ${THEME.text} placeholder-[#2C4642]/30 focus:ring-2 focus:ring-[#2C4642] outline-none transition-all`}
                    placeholder="Collez votre clé ici..."
                    required
                />
                <a href="https://app.jsonstorage.net/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#2C4642] ml-1 underline flex items-center hover:text-blue-600">
                    <Link size={8} className="mr-1"/> Obtenir une clé gratuite sur jsonstorage.net
                </a>
             </div>

             {mode === 'join' && (
                 <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${THEME.textLight} flex items-center`}>
                        <Database size={12} className="mr-1"/> ID de la Base
                    </label>
                    <input 
                        type="text" 
                        value={binId}
                        onChange={(e) => setBinId(e.target.value)}
                        className={`w-full py-3 px-4 rounded-xl bg-white/60 border-none ${THEME.text} placeholder-[#2C4642]/30 focus:ring-2 focus:ring-[#2C4642] outline-none transition-all`}
                        placeholder="Ex: cdb60d00-..."
                        required={mode === 'join'}
                    />
                    <p className="text-[10px] text-[#5C7672] ml-1">
                        Demandez cet ID à la personne qui a créé la base.
                    </p>
                 </div>
             )}
             
             <button 
                type="submit"
                disabled={loading}
                className={`w-full py-4 mt-4 rounded-2xl ${THEME.accent} text-[#FCDFB8] font-bold text-lg shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2`}
             >
                {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
                <span>{mode === 'create' ? 'Créer ma base' : 'Rejoindre la base'}</span>
             </button>
        </form>
      </div>
    </div>
  );
};
