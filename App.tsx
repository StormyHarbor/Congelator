
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Search, Plus, Menu, Snowflake, Filter, X, ChevronDown, Check, Loader2, CloudOff, RefreshCw, Save } from 'lucide-react';
import { CategoryNav } from './components/CategoryNav';
import { FoodItemCard } from './components/FoodItemCard';
import { AddFoodModal } from './components/AddFoodModal';
import { StatsView } from './components/StatsView';
import { LoginScreen } from './components/LoginScreen';
import { SettingsModal } from './components/SettingsModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { DownloadConfirmModal } from './components/DownloadConfirmModal';
import { SyncSetup } from './components/SyncSetup';
import { THEME } from './constants';
import { FoodItem, Category, Location, LOCATIONS, StorageConfig, ActivityLogEntry } from './types';
import { api } from './services/api';

// Hardcoded users config
const AUTHORIZED_USERS = [
  'cyberfab.nux@gmail.com',
  'cecile.lardy@gmail.com'
];
const DEFAULT_PASS = '123456';

function App() {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('congelator_user');
  });

  // --- Sync State (Storage Config) ---
  const [storageConfig, setStorageConfig] = useState<StorageConfig | null>(() => {
    const saved = localStorage.getItem('congelator_storage_config');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // --- Data State ---
  const [items, setItems] = useState<FoodItem[]>([]);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // --- UI State ---
  const [selectedCategory, setSelectedCategory] = useState<Category>('Tout');
  const [selectedLocation, setSelectedLocation] = useState<Location | 'Tout'>('Tout');
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Views State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterDateType, setFilterDateType] = useState<'added' | 'expiration'>('added');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- Effects ---

  // Initial Load from Cloud (Only once)
  useEffect(() => {
    if (currentUser && storageConfig) {
      loadDataFromCloud();
    }
  }, [currentUser, storageConfig]);

  const loadDataFromCloud = async (silent = false) => {
    if (!storageConfig) return;
    if (!silent) setLoadingInitial(true);
    
    try {
      // getDatabase retourne maintenant { items, logs }
      const data = await api.getDatabase(storageConfig);
      setItems(data.items);
      setLogs(data.logs);
      setSyncError(false);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Sync error:", err);
      
      if (err.message === 'BIN_NOT_FOUND') {
         setStorageConfig(null);
         localStorage.removeItem('congelator_storage_config');
         if (!silent) alert("Configuration invalide ou base introuvable. Veuillez reconfigurer la synchronisation.");
         setLoadingInitial(false);
         return;
      }

      if (!silent) setSyncError(true);
    } finally {
      if (!silent) setLoadingInitial(false);
    }
  };

  const handleUpdateConfig = (newConfig: StorageConfig) => {
    setStorageConfig(newConfig);
    localStorage.setItem('congelator_storage_config', JSON.stringify(newConfig));
  };

  // --- Auth Handlers ---
  const handleLogin = (email: string, pass: string): boolean => {
    const normalizedEmail = email.trim();
    const userMatch = AUTHORIZED_USERS.find(u => u.toLowerCase() === normalizedEmail.toLowerCase());
    
    if (!userMatch) return false;

    const storedPass = localStorage.getItem(`pwd_${userMatch}`);
    const validPass = storedPass ? storedPass : DEFAULT_PASS;

    if (pass === validPass) {
      setCurrentUser(userMatch);
      localStorage.setItem('congelator_user', userMatch);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('congelator_user');
    setIsSettingsOpen(false);
  };

  const handleChangePassword = (oldPass: string, newPass: string): boolean => {
    if (!currentUser) return false;
    const storedPass = localStorage.getItem(`pwd_${currentUser}`);
    const currentValidPass = storedPass ? storedPass : DEFAULT_PASS;

    if (oldPass === currentValidPass) {
      localStorage.setItem(`pwd_${currentUser}`, newPass);
      return true;
    }
    return false;
  };

  // --- Logic ---
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === 'Tout' || item.category === selectedCategory;
      const matchesLocation = selectedLocation === 'Tout' || item.location === selectedLocation;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesDate = true;
      if (startDate || endDate) {
        const itemDate = new Date(item.dateAdded);
        let targetDate = itemDate;

        if (filterDateType === 'expiration') {
          targetDate = new Date(itemDate);
          targetDate.setMonth(targetDate.getMonth() + 6);
        }
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

  const handleAddItem = async (name: string, category: Category, location: Location) => {
    if (!storageConfig || !currentUser) return;

    setIsAddingItem(true);
    
    const newItem: FoodItem = {
      id: uuidv4(),
      name,
      category: category as Exclude<Category, 'Tout'>,
      location,
      dateAdded: new Date().toISOString(),
    };
    
    // Create Log Entry
    const newLog: ActivityLogEntry = {
        date: new Date().toISOString(),
        user: currentUser,
        action: 'AJOUTE',
        itemName: name,
        category: category
    };

    // Construct new state
    const newItems = [newItem, ...items];
    const newLogs = [newLog, ...logs];

    try {
        // Direct patch to server (items + logs)
        await api.updateDatabase(storageConfig, newItems, newLogs);
        // Update local state on success
        setItems(newItems);
        setLogs(newLogs);
        setLastUpdated(new Date());
        setIsModalOpen(false);
        setSyncError(false);
    } catch (err: any) {
        console.error("Add item error:", err);
        if (err.message === 'BIN_NOT_FOUND') {
            alert("Erreur: Base de données introuvable (404).");
        } else {
            alert("Erreur lors de la sauvegarde: " + err.message);
        }
        setSyncError(true);
    } finally {
        setIsAddingItem(false);
    }
  };

  const requestDelete = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (itemToDelete && storageConfig && currentUser) {
        const item = items.find(i => i.id === itemToDelete);
        const newItems = items.filter((item) => item.id !== itemToDelete);
        
        let newLogs = [...logs];
        if (item) {
             const log: ActivityLogEntry = {
                date: new Date().toISOString(),
                user: currentUser,
                action: 'SUPPRIME',
                itemName: item.name,
                category: item.category
            };
            newLogs = [log, ...logs];
        }

        try {
            // Sauvegarde immédiate pour persister le log de suppression
            await api.updateDatabase(storageConfig, newItems, newLogs);
            setItems(newItems);
            setLogs(newLogs);
            setLastUpdated(new Date());
        } catch (err: any) {
            console.error("Delete error", err);
             // On supprime quand même localement pour l'UI, mais on signale l'erreur
             setItems(newItems); 
             setSyncError(true);
        } finally {
            setItemToDelete(null);
        }
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "congelator_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const hasActiveFilters = startDate !== '' || endDate !== '';

  // --- Render ---

  // 1. Not Logged In
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // 2. Logged In but No Sync Configured
  if (!storageConfig) {
    return (
        <SyncSetup 
            onSyncConfigured={(config) => handleUpdateConfig(config)} 
            currentItems={items}
        />
    );
  }

  // 3. Logged In & Synced (Main App)
  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-8">
      <div className={`w-full md:w-[400px] h-[100vh] md:h-[850px] ${THEME.bg} md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative`}>
        
        {/* Loading Overlay */}
        {loadingInitial && (
            <div className="absolute inset-0 bg-[#FCDFB8] z-50 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#2C4642] mb-4" size={40} />
                <p className={`${THEME.text} font-medium`}>Chargement du stock...</p>
            </div>
        )}

        {/* Sync Error Indicator */}
        {syncError && !loadingInitial && (
            <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs px-4 py-1 z-50 flex items-center justify-center">
                <CloudOff size={12} className="mr-2" />
                Erreur réseau. Vérifiez votre connexion.
            </div>
        )}

        {/* Header */}
        <header className="px-6 pt-12 pb-4 flex justify-between items-center z-20 relative">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={`${THEME.text} p-2 hover:bg-black/5 rounded-full relative`}
          >
            <Menu size={24} />
            {isSyncing && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </button>
          
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
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          </button>
        </header>

        <CategoryNav 
          selectedCategory={selectedCategory} 
          onSelect={setSelectedCategory} 
        />

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

        <main className="flex-1 overflow-y-auto px-6 pb-28 hide-scrollbar">
          {showStats && (
             <div className="animate-in slide-in-from-top-4 duration-300">
                <StatsView items={items} />
             </div>
          )}

          <div className="flex justify-between items-end mb-4 mt-2">
            <h2 className="text-3xl font-serif text-[#2C4642]">
               {selectedCategory === 'Tout' ? 'Tout le stock' : selectedCategory}
            </h2>
            <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-[#2C4642]/60">{filteredItems.length} items</span>
                {lastUpdated && (
                    <span className="text-[10px] text-[#2C4642]/40">
                        Màj: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                )}
            </div>
          </div>

          <div className="space-y-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <FoodItemCard 
                  key={item.id} 
                  item={item} 
                  onDelete={requestDelete} 
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

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FCDFB8] via-[#FCDFB8] to-transparent pointer-events-none z-10">
          <div className="flex justify-between items-center pointer-events-auto">
             {/* Refresh Button */}
             <button 
                onClick={() => loadDataFromCloud(false)}
                className="w-12 h-12 rounded-full bg-[#2C4642] text-[#FCDFB8] flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                title="Actualiser depuis le cloud"
             >
                <div className={loadingInitial ? 'animate-spin' : ''}>
                    <RefreshCw size={20} />
                </div>
             </button>

             <button 
                onClick={() => setIsModalOpen(true)}
                className={`flex-1 mx-4 h-14 rounded-2xl ${THEME.accent} text-[#FCDFB8] font-bold text-lg shadow-xl flex items-center justify-center space-x-2 hover:brightness-110 active:scale-95 transition-all`}
             >
                <Plus size={24} />
                <span>Ajouter un aliment</span>
             </button>
             
             {/* Download Button (formerly Save) */}
             <button 
                onClick={() => setIsDownloadModalOpen(true)}
                className="w-12 h-12 rounded-full border-2 border-[#2C4642] bg-[#FCDFB8] text-[#2C4642] flex items-center justify-center hover:bg-[#2C4642] hover:text-[#FCDFB8] transition-all shadow-md"
                title="Télécharger la base de données"
             >
                <Save size={20} />
             </button>
          </div>
        </div>

        {/* Modals */}
        <AddFoodModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddItem}
          isLoading={isAddingItem}
        />

        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userEmail={currentUser}
          onLogout={handleLogout}
          onChangePasswordClick={() => {
            setIsSettingsOpen(false); // Close settings, open change pass
            setIsChangePassOpen(true);
          }}
          gcsConfig={storageConfig}
          onUpdateToken={(token) => {
              if(storageConfig) {
                  handleUpdateConfig({...storageConfig, apiKey: token});
              }
          }}
          logs={logs}
        />

        <ChangePasswordModal 
          isOpen={isChangePassOpen}
          onClose={() => setIsChangePassOpen(false)}
          onChangePassword={handleChangePassword}
        />

        <DeleteConfirmModal 
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={confirmDelete}
        />

        <DownloadConfirmModal 
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          onConfirm={handleDownloadBackup}
          itemCount={items.length}
        />
      </div>
    </div>
  );
}

export default App;
