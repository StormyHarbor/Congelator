
import React from 'react';
import { THEME } from '../constants';
import { Download, FileJson } from 'lucide-react';

interface DownloadConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
}

export const DownloadConfirmModal: React.FC<DownloadConfirmModalProps> = ({ isOpen, onClose, onConfirm, itemCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`bg-[#FCDFB8] w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200 border border-white/20`}>
        
        <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-[#2C4642] rounded-full flex items-center justify-center mb-4 text-[#FCDFB8] shadow-lg">
                <FileJson size={32} />
            </div>
            <h2 className={`text-xl font-bold ${THEME.text} mb-2`}>Télécharger la base ?</h2>
            <p className={`text-sm ${THEME.textLight}`}>
                Voulez-vous récupérer une copie locale de vos données ({itemCount} aliments) au format JSON ?
            </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl bg-white/40 font-bold text-[#5C7672] hover:bg-white/60 transition-colors`}
          >
            Annuler
          </button>
          <button
            onClick={() => {
                onConfirm();
                onClose();
            }}
            className={`flex-1 py-3 rounded-xl ${THEME.accent} text-[#FCDFB8] font-bold shadow-lg hover:brightness-110 transition-colors flex items-center justify-center`}
          >
            <span className="mr-2">Télécharger</span>
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
