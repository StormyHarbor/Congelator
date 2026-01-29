
import React, { useState } from 'react';
import { Category, Location, CATEGORIES, LOCATIONS } from '../types';
import { THEME } from '../constants';
import { X, Loader2 } from 'lucide-react';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, category: Category, location: Location) => Promise<void>;
  isLoading: boolean;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({ isOpen, onClose, onAdd, isLoading }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Viande');
  const [location, setLocation] = useState<Location>('Tiroir Haut');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await onAdd(name, category, location);
      // Reset form only after success (handled by parent usually, but good practice here)
      setName('');
      setCategory('Viande');
      setLocation('Tiroir Haut');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />
      <div className={`bg-[#FCDFB8] w-full max-w-md rounded-3xl p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-200`}>
        
        <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${THEME.text}`}>Ajouter un aliment</h2>
            <button 
                onClick={onClose} 
                disabled={isLoading}
                className={`p-2 rounded-full hover:bg-black/10 ${THEME.text} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <X size={24} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-bold mb-2 ${THEME.textLight}`}>NOM DE L'ALIMENT</label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Escalopes de poulet"
              className="w-full p-4 rounded-xl bg-white/60 border-none text-[#2C4642] placeholder-[#2C4642]/40 focus:ring-2 focus:ring-[#2C4642] outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className={`block text-sm font-bold mb-2 ${THEME.textLight}`}>CATÉGORIE</label>
            <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.filter(c => c !== 'Tout').map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        disabled={isLoading}
                        onClick={() => setCategory(cat)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            category === cat 
                            ? `${THEME.accent} text-white shadow-lg` 
                            : 'bg-white/40 text-[#5C7672] hover:bg-white/60'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-bold mb-2 ${THEME.textLight}`}>EMPLACEMENT</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as Location)}
              disabled={isLoading}
              className="w-full p-4 rounded-xl bg-white/60 border-none text-[#2C4642] focus:ring-2 focus:ring-[#2C4642] outline-none appearance-none cursor-pointer disabled:opacity-50"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 mt-4 rounded-2xl ${THEME.accent} text-[#FCDFB8] font-bold text-lg hover:brightness-110 transition-all shadow-lg active:scale-95 flex items-center justify-center ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
                <>
                    <Loader2 className="animate-spin mr-2" size={24} />
                    <span>Sauvegarde...</span>
                </>
            ) : (
                'Ajouter au stock'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
