import React, { useState } from 'react';
import { Category, Location, CATEGORIES, LOCATIONS } from '../types';
import { THEME } from '../constants';
import { X } from 'lucide-react';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, category: Category, location: Location) => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Viande');
  const [location, setLocation] = useState<Location>('Tiroir Haut');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name, category, location);
      setName('');
      setCategory('Viande');
      setLocation('Tiroir Haut');
      onClose();
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
            <h2 className={`text-2xl font-bold ${THEME.text}`}>Ajouter un aliment</h2>
            <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/10 ${THEME.text}`}>
                <X size={24} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-bold mb-2 ${THEME.textLight}`}>NOM DE L'ALIMENT</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Escalopes de poulet"
              className="w-full p-4 rounded-xl bg-white/60 border-none text-[#2C4642] placeholder-[#2C4642]/40 focus:ring-2 focus:ring-[#2C4642] outline-none"
            />
          </div>

          <div>
            <label className={`block text-sm font-bold mb-2 ${THEME.textLight}`}>CATÉGORIE</label>
            <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.filter(c => c !== 'Tout').map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            category === cat 
                            ? `${THEME.accent} text-white shadow-lg` 
                            : 'bg-white/40 text-[#5C7672] hover:bg-white/60'
                        }`}
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
              className="w-full p-4 rounded-xl bg-white/60 border-none text-[#2C4642] focus:ring-2 focus:ring-[#2C4642] outline-none appearance-none cursor-pointer"
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
            className={`w-full py-4 mt-4 rounded-2xl ${THEME.accent} text-[#FCDFB8] font-bold text-lg hover:brightness-110 transition-all shadow-lg active:scale-95`}
          >
            Ajouter au stock
          </button>
        </form>
      </div>
    </div>
  );
};