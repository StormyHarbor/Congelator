
import React, { useState } from 'react';
import { THEME } from '../constants';
import { X, LogOut, KeyRound, User, Database, RefreshCw, Key, Copy, FileText } from 'lucide-react';
import { StorageConfig, ActivityLogEntry } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onLogout: () => void;
  onChangePasswordClick: () => void;
  gcsConfig: StorageConfig | null;
  onUpdateToken: (token: string) => void;
  logs: ActivityLogEntry[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    userEmail, 
    onLogout, 
    onChangePasswordClick, 
    gcsConfig, 
    onUpdateToken,
    logs
}) => {
  const [newToken, setNewToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleUpdateToken = () => {
    if (newToken.trim()) {
        onUpdateToken(newToken.trim());
        setNewToken('');
        setShowTokenInput(false);
    }
  };

  const copyBinId = () => {
    if(gcsConfig?.binId) {
        navigator.clipboard.writeText(gcsConfig.binId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadActivityLog = () => {
    // Format: [DATE (JJ/MM/AA] : [USER)] a [AJOUTE/SUPPRIME] "[ITEM]" dans [CATEGORIE].
    const lines = logs.map(log => {
        const dateObj = new Date(log.date);
        const dateStr = dateObj.toLocaleDateString('fr-FR'); // JJ/MM/AAAA
        return `[${dateStr}] : ${log.user} a ${log.action} "${log.itemName}" dans ${log.category}.`;
    });

    const content = lines.join('\n');
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "journal_activite.txt");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`bg-[#FCDFB8] w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200`}>
        
        <div className="flex justify-between items-center mb-6 border-b border-[#2C4642]/10 pb-4">
            <h2 className={`text-lg font-bold ${THEME.text}`}>Paramètres</h2>
            <button onClick={onClose} className={`p-1.5 rounded-full hover:bg-black/10 ${THEME.text}`}>
                <X size={20} />
            </button>
        </div>

        <div className="flex items-center space-x-3 mb-6 p-3 bg-white/40 rounded-2xl">
            <div className={`${THEME.accent} p-2 rounded-full text-[#FCDFB8]`}>
                <User size={20} />
            </div>
            <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-[#5C7672]">Connecté en tant que</p>
                <p className={`text-sm font-bold truncate ${THEME.text}`}>{userEmail}</p>
            </div>
        </div>

        {gcsConfig && (
            <div className="mb-6">
                <p className="text-[10px] uppercase font-bold text-[#5C7672] mb-2 ml-1">Configuration Cloud</p>
                <div className="bg-white/40 p-3 rounded-xl mb-2">
                    <div className="flex items-center justify-between text-xs text-[#2C4642] mb-2">
                        <div className="flex items-center">
                            <Database size={12} className="mr-2 opacity-70"/>
                            <span className="font-mono text-[10px] opacity-70">ID BASE:</span>
                        </div>
                        <button onClick={copyBinId} className="flex items-center font-bold font-mono hover:text-blue-600">
                            {gcsConfig.binId.substring(0, 8)}...
                            <Copy size={10} className="ml-1"/>
                        </button>
                    </div>
                    {copied && <p className="text-[10px] text-green-600 text-right mb-1">Copié !</p>}
                </div>
                
                {!showTokenInput ? (
                    <button 
                        onClick={() => setShowTokenInput(true)}
                        className="text-xs text-[#2C4642] flex items-center hover:underline ml-1"
                    >
                        <RefreshCw size={12} className="mr-1"/> Changer la clé API
                    </button>
                ) : (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                         <div className="flex gap-2">
                             <input 
                                type="text" 
                                value={newToken}
                                onChange={e => setNewToken(e.target.value)}
                                placeholder="Nouvelle Clé API..."
                                className="flex-1 bg-white/60 rounded-lg px-2 py-1.5 text-xs text-[#2C4642] outline-none border border-[#2C4642]/20"
                             />
                             <button 
                                onClick={handleUpdateToken}
                                className={`${THEME.accent} text-[#FCDFB8] rounded-lg px-3 py-1.5 text-xs font-bold`}
                             >
                                OK
                             </button>
                         </div>
                    </div>
                )}
            </div>
        )}

        <div className="space-y-3">
          <button
            onClick={downloadActivityLog}
            className={`w-full flex items-center p-4 rounded-xl bg-[#2C4642]/5 hover:bg-[#2C4642]/10 transition-colors ${THEME.text} font-medium`}
          >
            <FileText size={20} className="mr-3 opacity-70" />
            Télécharger le journal d'activité
          </button>

          <button
            onClick={() => { onClose(); onChangePasswordClick(); }}
            className={`w-full flex items-center p-4 rounded-xl bg-white/40 hover:bg-white/60 transition-colors ${THEME.text} font-medium`}
          >
            <KeyRound size={20} className="mr-3 opacity-70" />
            Changer mot de passe
          </button>

          <button
            onClick={() => { onClose(); onLogout(); }}
            className={`w-full flex items-center p-4 rounded-xl bg-red-100 hover:bg-red-200 transition-colors text-red-700 font-medium`}
          >
            <LogOut size={20} className="mr-3 opacity-70" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};
