
import React from 'react';
import { THEME } from '../constants';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Le Cube Triste (Récréation CSS du screenshot) */}
      <div className="relative group">
        <div className="w-36 h-36 bg-[#FFD93D] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative mb-10 border-b-[10px] border-r-[10px] border-black/10 flex items-center justify-center overflow-hidden animate-bounce-slow">
          
          {/* Reflets Glossy */}
          <div className="absolute top-2 left-6 w-12 h-4 bg-white/30 rounded-full blur-sm rotate-[-10deg]" />
          
          {/* Sourcils inquiets */}
          <div className="absolute top-[28%] left-[20%] w-8 h-2 bg-[#1A1A1A] rounded-full transform -rotate-[25deg] opacity-80" />
          <div className="absolute top-[28%] right-[20%] w-8 h-2 bg-[#1A1A1A] rounded-full transform rotate-[25deg] opacity-80" />
          
          {/* Yeux expressifs */}
          <div className="absolute top-[38%] left-[28%] w-6 h-8 bg-[#1A1A1A] rounded-full shadow-inner">
            <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-white rounded-full opacity-90 shadow-[0_0_5px_white]" />
          </div>
          <div className="absolute top-[38%] right-[28%] w-6 h-8 bg-[#1A1A1A] rounded-full shadow-inner">
            <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-white rounded-full opacity-90 shadow-[0_0_5px_white]" />
          </div>
          
          {/* Bouche triste */}
          <div className="absolute bottom-[22%] w-14 h-6 border-t-[5px] border-[#1A1A1A] rounded-[100%] opacity-80 transform rotate-180" 
               style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
        </div>
        
        {/* Ombre portée au sol */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/5 rounded-[100%] blur-md" />
      </div>
      
      <div className="text-center">
        <h3 className={`text-2xl font-serif ${THEME.text} mb-2`}>Oups, c'est vide !</h3>
        <p className={`text-sm ${THEME.textLight} max-w-[220px] mx-auto leading-relaxed`}>
          Il semblerait que ce coin du congélateur soit totalement désert...
        </p>
        <p className="text-[10px] uppercase font-bold tracking-widest mt-4 text-[#C87941] opacity-80">
          Ajoutez un aliment pour commencer
        </p>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
