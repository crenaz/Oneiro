'use client';

import * as React from 'react';
import { useDreams, Dream, ArchetypeInfo } from '../../hooks/use-dreams';
import { Eye, TrendingUp, Compass, Heart, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

// Hardcoded rich descriptors for the 6 core Jungian archetypes mapped inside Oneiromantia
const ARCHETYPE_DESCRIPTORS: Record<string, {
  description: string;
  subtext: string;
  shadowAspect: string;
  coreGoal: string;
  illustration: string; // CSS Gradients represent their mental sphere
}> = {
  'The Sage': {
    description: 'The internal seeker of objective truth, wisdom, and cosmic structure. Active during lucid dreams with complex light structures or architecture.',
    subtext: 'Using analysis to comprehend the structure of reality.',
    shadowAspect: 'Over-intellectualizing instead of experiencing emotions.',
    coreGoal: 'Understand the universe.',
    illustration: 'from-[#6366f1] to-[#3b82f6]'
  },
  'The Shadow': {
    description: 'The repository of suppressed thoughts, primitive instincts, and unintegrated characteristics. Usually manifests as talking darkness, locked doors, or chases.',
    subtext: 'The parts of ourselves we deny or lock away.',
    shadowAspect: 'Refusal to acknowledge negative patterns.',
    coreGoal: 'Acknowledge and integrate.',
    illustration: 'from-[#4f46e5] to-[#09090b]'
  },
  'The Seeker': {
    description: 'The explorer charting unknown territory, horizons, or ocean depths. Highly active during flying, soaring, or long journey dreams.',
    subtext: 'Searching for a better, more authentic reality.',
    shadowAspect: 'Aimless wandering or refusal to commit.',
    coreGoal: 'Discover authentic self.',
    illustration: 'from-[#ec4899] to-[#7c3aed]'
  },
  'The Creator': {
    description: 'The designer, artist, or engineer of dreamscapes. Active when building structures, painting, or manipulating physics inside dreams.',
    subtext: 'Creating meaning from chaos.',
    shadowAspect: 'Perfectionism or getting lost in fantasy.',
    coreGoal: 'Realize a vision.',
    illustration: 'from-[#f59e0b] to-[#ec4899]'
  },
  'The Innocent': {
    description: 'Pure trust, serene acceptance, and absolute peace. Dominates calm dreams where you float or stand in simple beautiful light.',
    subtext: 'Trusting the safety of the subconscious flow.',
    shadowAspect: 'Naivety or denial of shadow elements.',
    coreGoal: 'Retain wonder and harmony.',
    illustration: 'from-[#22d3ee] to-[#6366f1]'
  },
  'The Hero': {
    description: 'Courage, confrontation, and transformation. Active when fighting monsters, climbing tall peaks, or saving others.',
    subtext: 'Confronting mental obstacles with active resolve.',
    shadowAspect: 'Arrogance or looking for monsters where none exist.',
    coreGoal: 'Overcome internal blockages.',
    illustration: 'from-[#ef4444] to-[#f59e0b]'
  }
};

export function ArchetypeExplorerView() {
  const { dreams } = useDreams();
  const [selectedArchetype, setSelectedArchetype] = React.useState<any | null>(null);

  // Compile active archetypes metrics from user's actual dreams
  const activeArchetypes = React.useMemo(() => {
    const list: Record<string, { name: string; score: number; count: number; associatedDreams: Dream[] }> = {};
    
    // Initialize standard list so all are represented
    Object.keys(ARCHETYPE_DESCRIPTORS).forEach(key => {
      list[key] = {
        name: key,
        score: 0,
        count: 0,
        associatedDreams: []
      };
    });

    dreams.forEach(d => {
      d.archetypes.forEach(a => {
        if (list[a.name]) {
          list[a.name].count += 1;
          list[a.name].associatedDreams.push(d);
          list[a.name].score = Math.max(list[a.name].score, a.score || 50);
        }
      });
    });

    return Object.values(list).sort((a, b) => b.score - a.score);
  }, [dreams]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="space-y-1">
        <h2 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <span>Jungian Archetype Explorer</span>
        </h2>
        <p className="text-[#ccc3d8]/60 text-sm max-w-xl">
          Track the activation levels of the primary Jungian archetypes governing your dream matrix.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeArchetypes.map((arch, idx) => {
          const detail = ARCHETYPE_DESCRIPTORS[arch.name] || {
            description: 'No detailed information available.',
            subtext: '',
            shadowAspect: '',
            coreGoal: '',
            illustration: 'from-purple-900 to-indigo-900'
          };

          return (
            <div
              key={idx}
              onClick={() => setSelectedArchetype({ ...arch, detail })}
              className="glass-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer group hover:scale-[1.01]"
            >
              <div className="space-y-4">
                {/* Visual Circle Illustration mimicking psychological indicators */}
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${detail.illustration} blur-sm opacity-80 group-hover:blur-md transition-all`}></div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-[#ccc3d8]/40 block">ACTIVATION LEVEL</span>
                    <span className="font-display font-bold text-base text-[#d2bbff]">{arch.score || 35}%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-[#22d3ee] transition-colors">
                    {arch.name}
                  </h3>
                  <p className="text-[#ccc3d8]/60 text-xs font-mono">{detail.subtext}</p>
                </div>

                <p className="text-[#ccc3d8]/80 text-xs leading-relaxed line-clamp-3">
                  {detail.description}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-[10px] font-mono text-[#ccc3d8]/40">
                <span>DREAM THREADS: {arch.count}</span>
                <span className="text-[#d2bbff] group-hover:underline">Explore archetype matrix →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* sliding modal for detail exploration */}
      {selectedArchetype && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-lg w-full rounded-2xl p-6 space-y-6 relative border border-white/10 glow-violet">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] text-[#f9bd22] tracking-widest uppercase">JUNGIAN PSYCHE ASSESSMENT</span>
                <h3 className="font-display text-2xl font-bold text-white mt-1">{selectedArchetype.name}</h3>
              </div>
              <button
                onClick={() => setSelectedArchetype(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono text-[#ccc3d8]/60 uppercase">Archetypal Essence</span>
              <p className="text-[#ccc3d8] text-sm leading-relaxed bg-[#1c1b1d]/40 p-4 rounded-xl border border-white/5">
                {selectedArchetype.detail.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4">
              <div>
                <span className="text-[10px] font-mono text-[#ccc3d8]/40 block">CORE GOAL</span>
                <span className="font-sans font-semibold text-xs text-white">{selectedArchetype.detail.coreGoal}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#ccc3d8]/40 block">SHADOW ASPECT</span>
                <span className="font-sans font-semibold text-xs text-[#ec4899]">{selectedArchetype.detail.shadowAspect}</span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono text-[#ccc3d8]/60 uppercase block">Active Dream Incidences</span>
              <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                {selectedArchetype.associatedDreams?.length > 0 ? (
                  selectedArchetype.associatedDreams.map((d: Dream, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-white/[0.01] px-4 py-2.5 rounded-lg border border-white/5">
                      <span className="text-xs text-white font-medium">{d.title}</span>
                      <span className="text-[10px] font-mono text-[#ccc3d8]/40">{d.date}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#ccc3d8]/30 italic text-center py-4">No logged occurrences for this archetype yet.</div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedArchetype(null)}
              className="w-full py-3 bg-[#f9bd22] hover:bg-[#d9a312] text-black font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Close Assessment
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
