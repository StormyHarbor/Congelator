import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Search, Plus, Menu, Snowflake, Filter, X, ChevronDown, Check } from 'lucide-react';
import { CategoryNav } from './components/CategoryNav';
import { FoodItemCard } from './components/FoodItemCard';
import { AddFoodModal } from './components/AddFoodModal';
import { StatsView } from './components/StatsView';
import { INITIAL_ITEMS, THEME } from './constants';
import { FoodItem, Category, Location, LOCATIONS } from './types';

function App() {
  const [items, setItems] = useState<FoodItem[]>(INITIAL_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Tout');
  const [selectedLocation, setSelectedLocation] = useState<Location | 'Tout'>('Tout');
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterDateType, setFilterDateType] = useState<'added' | 'expiration'>('added');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter items based on category, search query, location and dates
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Category Filter
      const matchesCategory = selectedCategory === 'Tout' || item.category === selectedCategory;
      
      // 2. Location Filter
      const matchesLocation = selectedLocation === 'Tout' || item.location === selectedLocation;

      // 3. Text Search
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

      // 4. Date Filter
      let matchesDate = true;
      if (startDate || endDate) {
        const itemDate = new Date(item.dateAdded);
        let targetDate = itemDate;

        // If filtering by expiration, calculate the estimated expiration date (entry + 6 months)
        if (filterDateType === 'expiration') {
          targetDate = new Date(itemDate);
          targetDate.setMonth(targetDate.getMonth() + 6);
        }

        // Normalize time to compare dates only
        targetDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (targetDate < start) matchesDate = false;
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (targetDate > end) matchesDate = false;
        }
      }

      return matchesCategory && matchesSearch && matchesDate && matchesLocation;
    });
  }, [items, selectedCategory, selectedLocation, searchQuery, startDate, endDate, filterDateType]);

  // Handlers
  const handleAddItem = (name: string, category: Category, location: Location) => {
    const newItem: FoodItem = {
      id: uuidv4(),
      name,
      category: category as Exclude<Category, 'Tout'>,
      location,
      dateAdded: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const hasActiveFilters = startDate !== '' || endDate !== '';

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-8">
      {/* Mobile-first Container - styled to look like the screenshot phone frame */}
      <div className={`w-full md:w-[400px] h-[100vh] md:h-[850px] ${THEME.bg} md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative`}>
        
        {/* Header */}
        <header className="px-6 pt-12 pb-4 flex justify-between items-center z-20 relative">
          <button className={`${THEME.text} p-2 hover:bg-black/5 rounded-full`}>
            <Menu size={24} />
          </button>
          
          {/* Interactive Title for Location Filtering */}
          <div className="relative">
             <button 
                onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full hover:bg-black/5 transition-all ${THEME.text}`}
             >
               <Snowflake size={20} className="mr-1" />
               <span className="text-lg font-bold tracking-widest uppercase">
                 {selectedLocation === 'Tout' ? 'Congelator' : selectedLocation}
               </span>
               <ChevronDown size={16} className={`opacity-60 transition-transform duration-200 ${isLocationMenuOpen ? 'rotate-180' : ''}`} />
             </button>

             {/* Location Dropdown Menu */}
             {isLocationMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLocationMenuOpen(false)} />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-[#FCDFB8]/95 backdrop-blur-xl rounded-2xl shadow-xl border border-[#2C4642]/10 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 z-20">
                      <button
                          onClick={() => { setSelectedLocation('Tout'); setIsLocationMenuOpen(false); }}
                          className={`w-full text-left px-5 py-3 hover:bg-[#2C4642]/10 text-[#2C4642] font-medium flex justify-between items-center text-sm ${selectedLocation === 'Tout' ? 'bg-[#2C4642]/5' : ''}`}
                      >
                          <span>Tout le stock</span>
                          {selectedLocation === 'Tout' && <Check size={16} />}
                      </button>
                      <div className="h-px bg-[#2C4642]/10 mx-4 my-1" />
                      {LOCATIONS.map(loc => (
                          <button
                              key={loc}
                              onClick={() => { setSelectedLocation(loc); setIsLocationMenuOpen(false); }}
                              className={`w-full text-left px-5 py-3 hover:bg-[#2C4642]/10 text-[#2C4642] flex justify-between items-center text-sm ${selectedLocation === loc ? 'bg-[#2C4642]/5 font-bold' : ''}`}
                          >
                              <span>{loc}</span>
                              {selectedLocation === loc && <Check size={16} />}
                          </button>
                      ))}
                  </div>
                </>
             )}
          </div>

          <button 
            onClick={() => setShowStats(!showStats)}
            className={`${THEME.text} p-2 hover:bg-black/5 rounded-full`}
          >
             {/* Using a graph icon to represent stats */}
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          </button>
        </header>

        {/* Category Navigation */}
        <CategoryNav 
          selectedCategory={selectedCategory} 
          onSelect={setSelectedCategory} 
        />

        {/* Search and Filters Area */}
        <div className="px-6 mb-4">
          <div className="flex gap-3">
            <div className="relative group flex-1">
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/40 backdrop-blur-md rounded-2xl py-3 pl-12 pr-4 text-[#2C4642] placeholder-[#2C4642]/50 outline-none focus:bg-white/60 transition-all"
              />
              <Search className="absolute left-4 top-3.5 text-[#2C4642]/60" size={18} />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl transition-colors flex items-center justify-center ${
                showFilters || hasActiveFilters 
                ? `${THEME.accent} text-[#FCDFB8]` 
                : 'bg-white/40 text-[#2C4642] hover:bg-white/60'
              }`}
            >
              <Filter size={20} />
              {hasActiveFilters && <div className="ml-1 w-2 h-2 bg-orange-400 rounded-full" />}
            </button>
          </div>

          {/* Collapsible Date Filters Panel */}
          {showFilters && (
             <div className="mt-3 bg-white/40 backdrop-blur-md p-4 rounded-3xl animate-in fade-in slide-in-from-top-2 border border-white/20 shadow-sm z-0 relative">
                 
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#5C7672]">Filtres par date</span>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs flex items-center text-[#2C4642] opacity-70 hover:opacity-100">
                            <X size={12} className="mr-1" /> Effacer
                        </button>
                    )}
                 </div>

                 {/* Type selector */}
                 <div className="flex bg-black/5 p-1 rounded-xl mb-4">
                    <button 
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all shadow-sm ${filterDateType === 'added' ? 'bg-white text-[#2C4642]' : 'text-[#5C7672] hover:bg-white/50'}`} 
                        onClick={() => setFilterDateType('added')}
                    >
                        Entrée
                    </button>
                    <button 
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all shadow-sm ${filterDateType === 'expiration' ? 'bg-white text-[#2C4642]' : 'text-[#5C7672] hover:bg-white/50'}`} 
                        onClick={() => setFilterDateType('expiration')}
                    >
                        Péremption
                    </button>
                 </div>
                 
                 {/* Date Inputs */}
                 <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-[#2C4642]/70 ml-1 block mb-1 uppercase">Du</label>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={e => setStartDate(e.target.value)} 
                            className="w-full bg-white/70 rounded-xl px-3 py-2 text-sm text-[#2C4642] outline-none focus:ring-2 focus:ring-[#2C4642]/20" 
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-[#2C4642]/70 ml-1 block mb-1 uppercase">Au</label>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={e => setEndDate(e.target.value)} 
                            className="w-full bg-white/70 rounded-xl px-3 py-2 text-sm text-[#2C4642] outline-none focus:ring-2 focus:ring-[#2C4642]/20" 
                        />
                    </div>
                 </div>
             </div>
          )}
        </div>

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto px-6 pb-28 hide-scrollbar">
          
          {/* Optional Stats View */}
          {showStats && (
             <div className="animate-in slide-in-from-top-4 duration-300">
                <StatsView items={items} />
             </div>
          )}

          {/* List Title */}
          <div className="flex justify-between items-end mb-4 mt-2">
            <h2 className="text-3xl font-serif text-[#2C4642]">
               {selectedCategory === 'Tout' ? 'Tout le stock' : selectedCategory}
            </h2>
            <span className="text-sm font-medium text-[#2C4642]/60 mb-1.5">{filteredItems.length} items</span>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <FoodItemCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDeleteItem} 
                />
              ))
            ) : (
              <div className="text-center py-10 opacity-50">
                <p className="text-[#2C4642] text-lg">Aucun aliment trouvé</p>
                <p className="text-sm text-[#2C4642]/60">Essayez de modifier vos filtres</p>
              </div>
            )}
          </div>
        </main>

        {/* Persistent Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FCDFB8] via-[#FCDFB8] to-transparent pointer-events-none z-10">
          <div className="flex justify-between items-center pointer-events-auto">
             <button className="w-12 h-12 rounded-full bg-[#2C4642] text-[#FCDFB8] flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Search size={20} />
             </button>

             <button 
                onClick={() => setIsModalOpen(true)}
                className={`flex-1 mx-4 h-14 rounded-2xl ${THEME.accent} text-[#FCDFB8] font-bold text-lg shadow-xl flex items-center justify-center space-x-2 hover:brightness-110 active:scale-95 transition-all`}
             >
                <Plus size={24} />
                <span>Ajouter un aliment</span>
             </button>
             
             {/* Another persistent button (can be filter or sort, using Menu for visual balance based on screenshot ideas) */}
             <button className="w-12 h-12 rounded-full border-2 border-[#2C4642] text-[#2C4642] flex items-center justify-center hover:bg-[#2C4642]/10 transition-colors">
                <div className="flex flex-col space-y-1 items-center">
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                </div>
             </button>
          </div>
        </div>

        {/* Modals */}
        <AddFoodModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddItem} 
        />
      </div>
    </div>
  );
}

export default App;