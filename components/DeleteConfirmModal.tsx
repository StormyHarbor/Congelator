
import React from 'react';
import { THEME } from '../constants';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`bg-[#FCDFB8] w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200 border border-white/20`}>
        
        <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 shadow-inner">
                <Trash2 size={32} />
            </div>
            <h2 className={`text-xl font-bold ${THEME.text} mb-2`}>Supprimer cet aliment ?</h2>
            <p className={`text-sm ${THEME.textLight}`}>
                Êtes-vous sûr de vouloir supprimer cet élément de votre stock ? Cette action est irréversible.
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
            className={`flex-1 py-3 rounded-xl bg-red-500 text-white font-bold shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center`}
          >
            <span className="mr-2">Supprimer</span>
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
