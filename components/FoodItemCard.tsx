import React from 'react';
import { FoodItem } from '../types';
import { THEME } from '../constants';
import { Trash2, AlertTriangle, Clock, MapPin } from 'lucide-react';

interface FoodItemCardProps {
  item: FoodItem;
  onDelete: (id: string) => void;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onDelete }) => {
  const entryDate = new Date(item.dateAdded);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - entryDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = diffDays > 180; // > 6 months

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-5 mb-4 shadow-sm hover:shadow-md transition-shadow relative group">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${THEME.text} mb-1`}>{item.name}</h3>
          
          <div className="flex items-center space-x-2 text-sm text-[#5C7672] mb-3">
             <span className="px-2 py-0.5 rounded-full bg-white/50 text-xs font-semibold uppercase tracking-wider">
               {item.category}
             </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-sm text-[#5C7672]">
                <MapPin size={14} className="mr-1.5 opacity-70" />
                {item.location}
            </div>
            
            <div className={`flex items-center text-sm ${isExpired ? 'text-red-600 font-medium' : 'text-[#5C7672]'}`}>
                <Clock size={14} className="mr-1.5 opacity-70" />
                {diffDays} jours
            </div>
          </div>
        </div>
        
        <button 
            onClick={() => onDelete(item.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Supprimer"
        >
            <Trash2 size={20} />
        </button>
      </div>

      {isExpired && (
        <div className="mt-4 flex items-center bg-red-100 text-red-700 text-xs px-3 py-2 rounded-xl">
          <AlertTriangle size={14} className="mr-2 flex-shrink-0" />
          <span>Attention : Au congélateur depuis +6 mois. À consommer rapidement.</span>
        </div>
      )}
    </div>
  );
};