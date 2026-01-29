import React, { useState } from 'react';
import { THEME } from '../constants';
import { X, Lock } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (oldPass: string, newPass: string) => boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onChangePassword }) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPass !== confirmPass) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (newPass.length < 4) {
      setError('Le mot de passe est trop court');
      return;
    }

    const success = onChangePassword(oldPass, newPass);
    if (success) {
      setSuccessMsg('Mot de passe mis à jour avec succès');
      setTimeout(() => {
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
        setSuccessMsg('');
        onClose();
      }, 1500);
    } else {
      setError('L\'ancien mot de passe est incorrect');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`bg-[#FCDFB8] w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200`}>
        
        <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${THEME.text}`}>Changer mot de passe</h2>
            <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/10 ${THEME.text}`}>
                <X size={24} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold mb-1 ml-1 ${THEME.textLight} uppercase`}>Ancien mot de passe</label>
            <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 opacity-40 text-[#2C4642]"/>
                <input
                type="password"
                required
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl bg-white/60 border-none text-[#2C4642] focus:ring-2 focus:ring-[#2C4642] outline-none"
                />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ml-1 ${THEME.textLight} uppercase`}>Nouveau mot de passe</label>
            <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 opacity-40 text-[#2C4642]"/>
                <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl bg-white/60 border-none text-[#2C4642] focus:ring-2 focus:ring-[#2C4642] outline-none"
                />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ml-1 ${THEME.textLight} uppercase`}>Confirmer nouveau</label>
            <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 opacity-40 text-[#2C4642]"/>
                <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl bg-white/60 border-none text-[#2C4642] focus:ring-2 focus:ring-[#2C4642] outline-none"
                />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}
          {successMsg && <p className="text-green-700 text-sm font-bold text-center">{successMsg}</p>}

          <button
            type="submit"
            className={`w-full py-3 mt-2 rounded-xl ${THEME.accent} text-[#FCDFB8] font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all`}
          >
            Valider le changement
          </button>
        </form>
      </div>
    </div>
  );
};