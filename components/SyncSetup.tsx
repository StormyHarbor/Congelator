
import React, { useState } from 'react';
import { THEME } from '../constants';
import { Cloud, ArrowRight, Loader2, Database, Key, FolderOpen } from 'lucide-react';
import { GCSConfig } from '../types';
import { api } from '../services/api';
import { INITIAL_ITEMS } from '../constants';

interface SyncSetupProps {
  onSyncConfigured: (config: GCSConfig) => void;
}

export const SyncSetup: React.FC<SyncSetupProps> = ({ onSyncConfigured }) => {
  const [bucketName, setBucketName] = useState('');
  const [fileName, setFileName] = useState('freezer-data.json');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bucketName.trim() || !accessToken.trim()) {
        setError("Le nom du bucket et le token sont obligatoires.");
        return;
    }

    setLoading(true);
    setError('');

    const config: GCSConfig = {
        bucketName: bucketName.trim(),
        fileName: fileName.trim() || 'freezer-data.json',
        accessToken: accessToken.trim()
    };

    try {
      const isConnected = await api.checkConnection(config);
      
      if (isConnected) {
        // Tente d'initialiser si vide, ou juste connecter
        try {
            await api.initializeDatabase(config, INITIAL_ITEMS);
            localStorage.setItem('congelator_gcs_config', JSON.stringify(config));
            onSyncConfigured(config);
        } catch (initError) {
            console.error(initError);
            setError("Connexion OK, mais impossible d'écrire/lire le fichier. Vérifiez les droits du Token.");
        }
      } else {
        setError("Impossible d'accéder au Bucket. Vérifiez le nom et le Token.");
      }
    } catch (e) {
      setError("Erreur réseau ou configuration invalide.");
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
          <h1 className={`text-xl font-bold text-center ${THEME.text}`}>Google Cloud Storage</h1>
          <p className={`text-sm text-center ${THEME.textLight} mt-2`}>
            Connectez votre congélateur à un bucket GCS pour stocker vos données.
          </p>
        </div>

        {error && (
            <div className="bg-red-100 text-red-600 text-xs p-3 rounded-xl text-center font-medium mb-4">
              {error}
            </div>
        )}

        <form onSubmit={handleConnect} className="space-y-4">
             <div className="space-y-1">
                <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${THEME.textLight} flex items-center`}>
                    <Database size={12} className="mr-1"/> Nom du Bucket
                </label>
                <input 
                    type="text" 
                    value={bucketName}
                    onChange={(e) => setBucketName(e.target.value)}
                    className={`w-full py-3 px-4 rounded-xl bg-white/60 border-none ${THEME.text} placeholder-[#2C4642]/30 focus:ring-2 focus:ring-[#2C4642] outline-none transition-all`}
                    placeholder="mon-bucket-congelateur"
                    required
                />
             </div>

             <div className="space-y-1">
                <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${THEME.textLight} flex items-center`}>
                    <FolderOpen size={12} className="mr-1"/> Nom du Fichier
                </label>
                <input 
                    type="text" 
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className={`w-full py-3 px-4 rounded-xl bg-white/60 border-none ${THEME.text} placeholder-[#2C4642]/30 focus:ring-2 focus:ring-[#2C4642] outline-none transition-all`}
                    placeholder="freezer-data.json"
                />
             </div>

             <div className="space-y-1">
                <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${THEME.textLight} flex items-center`}>
                    <Key size={12} className="mr-1"/> OAuth Access Token
                </label>
                <input 
                    type="password" 
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className={`w-full py-3 px-4 rounded-xl bg-white/60 border-none ${THEME.text} placeholder-[#2C4642]/30 focus:ring-2 focus:ring-[#2C4642] outline-none transition-all`}
                    placeholder="ya29.a0..."
                    required
                />
                <p className="text-[10px] text-[#5C7672] ml-1">
                    Générez un token via: <code>gcloud auth print-access-token</code>
                </p>
             </div>
             
             <button 
                type="submit"
                disabled={loading}
                className={`w-full py-4 mt-2 rounded-2xl ${THEME.accent} text-[#FCDFB8] font-bold text-lg shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2`}
             >
                {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
                <span>Connexion</span>
             </button>
        </form>
      </div>
    </div>
  );
};
