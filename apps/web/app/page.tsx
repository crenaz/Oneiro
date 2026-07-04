'use client';

import * as React from 'react';
import { DreamProvider, useDreams, Dream } from '../hooks/use-dreams';
import { DashboardView } from '../components/views/DashboardView';
import { JournalView } from '../components/views/JournalView';
import { SymbolLibraryView } from '../components/views/SymbolLibraryView';
import { ArchetypeExplorerView } from '../components/views/ArchetypeExplorerView';
import { EmotionalTimelineView } from '../components/views/EmotionalTimelineView';
import { PatternNetworkView } from '../components/views/PatternNetworkView';
import { DreamGalleryView } from '../components/views/DreamGalleryView';
import { AgentConsoleView } from '../components/views/AgentConsoleView';
import { AIInsightsView } from '../components/views/AIInsightsView';
import { SettingsView } from '../components/views/SettingsView';
import { GenerativeVisualizer } from '../components/GenerativeVisualizer';

import {
  Sparkles,
  Search,
  Bell,
  Moon,
  Compass,
  Heart,
  Eye,
  Activity,
  Layers,
  Image as ImageIcon,
  Zap,
  Cpu,
  Info,
  Server,
  CloudLightning,
  CheckCircle,
  Menu,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Play,
  HeartHandshake
} from 'lucide-react';

// Main Inner SPA Layout
function OneiroAppContent() {
  const { dreams, isOnline, syncQueueLength, syncAllPending } = useDreams();
  const [activeTab, setActiveTab] = React.useState<string>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(true);
  const [activityPanelOpen, setActivityPanelOpen] = React.useState<boolean>(true);
  
  // Search global state
  const [globalSearchOpen, setGlobalSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Active artwork detail popup modal (shared across Dashboard & Gallery)
  const [selectedArtworkDream, setSelectedArtworkDream] = React.useState<Dream | null>(null);

  const sidebarItems = [
    { name: 'Dashboard', icon: 'dashboard', color: 'text-[#d2bbff]' },
    { name: 'Journal', icon: 'book', color: 'text-[#adc6ff]' },
    { name: 'Symbol Library', icon: 'menu_book', color: 'text-[#f9bd22]' },
    { name: 'Archetype Explorer', icon: 'theater_comedy', color: 'text-[#d2bbff]' },
    { name: 'Emotional Timeline', icon: 'timeline', color: 'text-[#22d3ee]' },
    { name: 'Pattern Network', icon: 'hub', color: 'text-[#22d3ee]' },
    { name: 'Gallery', icon: 'palette', color: 'text-[#adc6ff]' },
    { name: 'Agent Console', icon: 'terminal', color: 'text-[#ec4899]' },
    { name: 'AI Insights', icon: 'insights', color: 'text-[#22c55e]' },
    { name: 'Settings', icon: 'settings', color: 'text-[#ccc3d8]' }
  ];

  // Map search matching
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    return dreams.filter(d => 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.mood.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, dreams]);

  return (
    <div className="min-h-screen bg-[#050508] text-slate-300 flex flex-col font-sans select-none antialiased relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6366f1]/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#a78bfa]/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-40 w-full bg-black/40 backdrop-blur-md h-16 flex items-center justify-between px-6 border-b border-white/5">
        
        {/* Left Side: Logo and togglers */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-slate-400 transition-colors"
            title="Toggle Navigation Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('Dashboard')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white text-base">🌙</span>
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="font-display font-semibold text-lg tracking-tight text-white">
                  Oneiromantia
                </span>
                <span className="text-slate-500 font-normal text-xs ml-1.5">Agentic Journal</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 block tracking-widest leading-none">OBSERVATORY</span>
            </div>
          </div>
        </div>

        {/* Center: Command Search button */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <button
            onClick={() => setGlobalSearchOpen(true)}
            className="w-full bg-black/40 border border-white/5 rounded-full px-4 py-2 text-xs text-slate-400/70 flex items-center justify-between hover:border-indigo-500/40 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search dreams, symbols, archetypes...</span>
            </div>
            <kbd className="font-mono text-[9px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-slate-500">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Side: Network status, profile & notification logs */}
        <div className="flex items-center gap-4">
          
          {/* Synchronizer Action Status indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></div>
            <span className="text-[10px] font-mono text-emerald-400 tracking-wider hidden sm:inline uppercase font-medium">
              {isOnline ? 'Swarm Active' : 'Offline Sandbox'}
            </span>
          </div>

          {/* Quick Add dream button */}
          <button
            onClick={() => setActiveTab('Journal')}
            className="hidden sm:flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-xs rounded-full shadow-lg shadow-indigo-500/10 hover:brightness-110 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Ingest</span>
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-indigo-300 font-bold">
              CN
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY FRAME: PERSISTENT THREE-PANEL DESKTOP LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel A: Sidebar Navigation Panel */}
        <nav className={`h-full border-r border-white/5 bg-[#08080c] shrink-0 flex flex-col justify-between p-3.5 transition-all duration-300 relative z-30 ${sidebarOpen ? 'w-60 translate-x-0' : 'w-0 -translate-x-full overflow-hidden p-0 border-none'}`}>
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-sans text-xs font-semibold cursor-pointer border ${isActive ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-lg shadow-indigo-500/5' : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 border-transparent'}`}
                >
                  <span className={`material-symbols-outlined text-lg ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom attribution credit block */}
          <div className="p-3 border-t border-white/5 space-y-1.5 bg-black/40 rounded-xl">
            <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-widest leading-none">ENVIRONMENT</span>
            <span className="text-[10px] font-mono text-slate-300 block">Cloud Run Sandbox</span>
          </div>
        </nav>

        {/* Panel B: Center Main Workspace Panel */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10 bg-transparent">
          
          {/* Tabs Assembler */}
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'Dashboard' && (
              <DashboardView 
                onNavigate={setActiveTab} 
                onOpenArtworkDetail={setSelectedArtworkDream} 
              />
            )}
            {activeTab === 'Journal' && <JournalView />}
            {activeTab === 'Symbol Library' && <SymbolLibraryView />}
            {activeTab === 'Archetype Explorer' && <ArchetypeExplorerView />}
            {activeTab === 'Emotional Timeline' && <EmotionalTimelineView />}
            {activeTab === 'Pattern Network' && <PatternNetworkView />}
            {activeTab === 'Gallery' && <DreamGalleryView />}
            {activeTab === 'Agent Console' && <AgentConsoleView />}
            {activeTab === 'AI Insights' && <AIInsightsView />}
            {activeTab === 'Settings' && <SettingsView />}
          </div>
        </main>

        {/* Panel C: AI Activity Panel */}
        <aside className={`h-full border-l border-white/5 bg-black shrink-0 flex flex-col p-5 transition-all duration-300 relative z-20 ${activityPanelOpen ? 'w-64 translate-x-0' : 'w-0 translate-x-full overflow-hidden p-0 border-none'}`}>
          <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
            <span className="font-mono text-[10px] text-slate-400 tracking-widest uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              SYSTEM SHIELD STATUS
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Active Telemetry Status Cards */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
              <span className="text-[9px] font-mono text-slate-500 uppercase">ACTIVE SWARM AGENT</span>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-medium">Normalizer Agent</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">● IDLE</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-medium">Symbol Extractor</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">● IDLE</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-medium">Emotion Analyst</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">● IDLE</span>
              </div>
            </div>

            {/* Offline sync queue status tracker */}
            {syncQueueLength > 0 && (
              <div className="p-4 rounded-xl bg-[#f9bd22]/5 border border-[#f9bd22]/15 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#f9bd22]">
                  <CloudLightning className="w-4 h-4" />
                  <span>Sync Queue Pending</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {syncQueueLength} subconscious logs compiled offline. Swarm analysis will initiate automatically once network reconnects.
                </p>
                <button
                  onClick={syncAllPending}
                  className="w-full py-2 bg-[#f9bd22]/10 hover:bg-[#f9bd22]/20 border border-[#f9bd22]/20 text-[#f9bd22] text-[10px] font-mono rounded-lg transition-colors cursor-pointer"
                >
                  Force Ingest Now
                </button>
              </div>
            )}

            {/* General system health indicator */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2 text-[11px] font-mono text-slate-500 leading-relaxed">
              <span className="text-[9px] text-slate-600 block uppercase">Diagnostics</span>
              <p>✔ ADK Connection Secured</p>
              <p>✔ MongoDB Index Verified</p>
              <p>✔ Render Buffer Stabilized</p>
            </div>

          </div>

          {/* Toggle trigger buttons in corner */}
          <button
            onClick={() => setActivityPanelOpen(!activityPanelOpen)}
            className="absolute bottom-4 -left-10 p-2 bg-black border border-white/10 hover:bg-zinc-900 rounded-l-lg text-slate-400 transition-colors shadow-md cursor-pointer"
            title="Toggle Activity Inspector"
          >
            {activityPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </aside>

      </div>

      {/* Bottom Context Bar */}
      <footer className="h-10 border-t border-white/5 bg-black/40 px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex gap-6 text-[10px] uppercase tracking-tighter text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
            MCP: Local Subnet Established
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
            ADK: Orchestrator Idle
          </div>
        </div>
        <div className="text-[10px] text-slate-600 font-mono tracking-wider">
          ONEIROMANTIA SYSTEM v0.2.0-BETA // JUNGIAN_ENGINE_ENABLED
        </div>
      </footer>

      {/* 3. UNIVERSAL COMMAND PALETTE (CMD + K) SEARCH OVERLAY */}
      {globalSearchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center z-50 p-4 pt-24">
          <div className="glass-panel max-w-xl w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-[#ccc3d8]/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subconscious database..."
                  className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 text-sm"
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  setGlobalSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1 hover:bg-white/10 rounded-lg text-white/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((d, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setGlobalSearchOpen(false);
                      setActiveTab('Journal');
                    }}
                    className="p-3 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-white">{d.title}</h4>
                      <p className="text-[10px] text-[#ccc3d8]/40 font-mono mt-0.5">{d.date} • {d.mood}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </div>
                ))
              ) : searchQuery ? (
                <div className="text-center py-12 text-[#ccc3d8]/30 text-xs">No matching subconscious entities found.</div>
              ) : (
                <div className="text-center py-12 text-[#ccc3d8]/30 text-xs">Type to initiate searching...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. EXPANDED SHARED ARTWORK DETAIL MODAL */}
      {selectedArtworkDream && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-3xl w-full rounded-2xl overflow-hidden relative border border-white/10 glow-violet flex flex-col md:flex-row h-[90vh] md:h-[500px]">
            <div className="flex-1 bg-black relative">
              <GenerativeVisualizer seed={selectedArtworkDream.artworkSeed} mood={selectedArtworkDream.mood} />
            </div>
            <div className="w-full md:w-80 border-l border-white/5 bg-[#131315]/95 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div>
                  <span className="font-mono text-[9px] text-[#22d3ee] tracking-widest uppercase">GENERATIVE INTERCEPT</span>
                  <h3 className="font-display text-xl font-bold text-white mt-1">{selectedArtworkDream.title}</h3>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#ccc3d8]/40 block">INTERPRETATION SUMMARY</span>
                  <p className="text-xs text-[#ccc3d8]/85 leading-relaxed bg-black/30 p-3.5 rounded-lg border border-white/5 italic">
                    &quot;{selectedArtworkDream.summary}&quot;
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedArtworkDream(null)}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all font-mono"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Wrapper to provide DreamProvider state cleanly
export default function MasterPage() {
  return (
    <DreamProvider>
      <OneiroAppContent />
    </DreamProvider>
  );
}
