import React, { useState } from 'react';
import { Snowflake, Lock, Mail } from 'lucide-react';
import { THEME } from '../constants';

interface LoginScreenProps {
  onLogin: (email: string, pass: string) => boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(email, password);
    if (!success) {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${THEME.bg}`}>
      <div className={`w-full max-w-sm bg-white/40 backdrop-blur-md rounded-[40px] shadow-2xl p-8 border border-white/20 animate-in fade-in zoom-in duration-300`}>
        
        <div className="flex flex-col items-center mb-10">
          <div className={`${THEME.accent} p-4 rounded-full shadow-lg mb-4`}>
            <Snowflake size={40} className="text-[#FCDFB8]" />
          </div>
          <h1 className={`text-2xl font-bold tracking-widest uppercase ${THEME.text}`}>Congelator</h1>
          <p className={`text-sm ${THEME.textLight} mt-2`}>Gestionnaire de stock</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${THEME.textLight}`}>Email</label>
            <div className="relative">
              <Mail className={`absolute left-4 top-3.5 ${THEME.textLight} opacity-50`} size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full py-3 pl-12 pr-4 rounded-2xl bg-white/60 border-none ${THEME.text} placeholder-[#2C4642]/30 focus:ring-2 focus:ring-[#2C4642] outline-none transition-all`}
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${THEME.textLight}`}>Mot de passe</label>
            <div className="relative">
              <Lock className={`absolute left-4 top-3.5 ${THEME.textLight} opacity-50`} size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full py-3 pl-12 pr-4 rounded-2xl bg-white/60 border-none ${THEME.text} placeholder-[#2C4642]/30 focus:ring-2 focus:ring-[#2C4642] outline-none transition-all`}
                placeholder="••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className={`w-full py-4 mt-2 rounded-2xl ${THEME.accent} text-[#FCDFB8] font-bold text-lg shadow-xl hover:brightness-110 active:scale-95 transition-all`}
          >
            Connexion
          </button>
        </form>
      </div>
    </div>
  );
};