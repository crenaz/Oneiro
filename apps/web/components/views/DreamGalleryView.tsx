'use client';

import * as React from 'react';
import { useDreams, Dream } from '../../hooks/use-dreams';
import { GenerativeVisualizer } from '../GenerativeVisualizer';
import { Heart, Play, Pause, Download, RotateCcw, Sparkles, Filter, Sliders, ExternalLink } from 'lucide-react';

export function DreamGalleryView() {
  const { dreams } = useDreams();
  const [selectedDream, setSelectedDream] = React.useState<Dream | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState<string>('ALL');

  const filteredDreams = React.useMemo(() => {
    if (activeFilter === 'ALL') return dreams;
    return dreams.filter(d => d.mood.toUpperCase() === activeFilter.toUpperCase());
  }, [dreams, activeFilter]);

  const handleDownload = () => {
    alert('Exporting artwork package: PNG, SVG, and custom p5.js sketch bundle generated successfully!');
  };

  return (
    <div className="space-y-6">
      
      {/* Header filter tags row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h2 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <span>Subconscious Dream Gallery</span>
          </h2>
          <p className="text-[#ccc3d8]/60 text-sm max-w-xl">
            Procedural canvas artworks synthesized by the Oneiromantia Art Renderer agent.
          </p>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {['ALL', 'WONDER', 'CALM', 'EERIE', 'CHAOS', 'VAGUE'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full font-mono text-[10px] border transition-all cursor-pointer ${activeFilter === f ? 'bg-[#7c3aed] text-white border-[#7c3aed]' : 'border-white/5 text-[#ccc3d8]/60 bg-[#131315]/40 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry / Grid representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDreams.map((d, idx) => {
          return (
            <div
              key={idx}
              onClick={() => setSelectedDream(d)}
              className="glass-card rounded-2xl overflow-hidden group cursor-pointer flex flex-col"
            >
              <div className="aspect-square bg-black relative overflow-hidden">
                <GenerativeVisualizer seed={d.artworkSeed} mood={d.mood} isPlaying={false} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#7c3aed]/90 flex items-center justify-center text-white shadow-lg glow-violet">
                    <Play className="w-5 h-5 ml-1" />
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3 bg-[#131315]/40">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#ccc3d8]/40">
                  <span>SEED: #{d.artworkSeed}</span>
                  <span>{d.date}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-white truncate group-hover:text-[#22d3ee] transition-colors">
                  {d.title}
                </h3>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono text-[#d2bbff] bg-[#7c3aed]/10 px-2.5 py-1 rounded-full border border-[#7c3aed]/20">
                    {d.mood}
                  </span>
                  <button className="text-[#ccc3d8]/50 hover:text-[#ec4899] transition-colors p-1" title="Favorite">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDreams.length === 0 && (
          <div className="col-span-full text-center py-24 text-[#ccc3d8]/40">
            No generated artworks found matching this filter criteria. Save a dream with this mood to synthesize art!
          </div>
        )}
      </div>

      {/* Fullscreen Art Detail viewer model */}
      {selectedDream && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-4xl w-full rounded-2xl overflow-hidden relative border border-white/10 glow-violet flex flex-col md:flex-row h-[90vh] md:h-[600px]">
            
            {/* Visualizer playback column */}
            <div className="flex-1 bg-black relative">
              <GenerativeVisualizer seed={selectedDream.artworkSeed} mood={selectedDream.mood} isPlaying={isPlaying} />
              
              {/* Overlay playback toolbar */}
              <div className="absolute bottom-4 inset-x-4 bg-[#09090b]/85 border border-white/5 p-3 rounded-xl flex justify-between items-center backdrop-blur-md">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      alert('Synthesizing fresh seed sequence from Oneiromantia art engine...');
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                    title="Regenerate Seed"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-3 items-center">
                  <span className="text-[10px] font-mono text-[#ccc3d8]/50">SEED: #{selectedDream.artworkSeed}</span>
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-mono"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Bundle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar properties description column */}
            <div className="w-full md:w-80 border-l border-white/5 bg-[#131315]/80 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[9px] text-[#22d3ee] tracking-widest uppercase">GENERATED VISUALIZATION</span>
                    <h3 className="font-display text-xl font-bold text-white mt-1">{selectedDream.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedDream(null)}
                    className="text-white/40 hover:text-white p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#ccc3d8]/40 block">ARTWORK PROMPT</span>
                  <p className="text-xs text-[#ccc3d8]/90 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5 font-serif italic">
                    &quot;{selectedDream.artworkPrompt}&quot;
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#ccc3d8]/40 block">ASSOCIATED EXTRACTS</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDream.symbols.map((sym, idx) => (
                      <span key={idx} className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-white/70">
                        {sym.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#ccc3d8]/40 block">EMOTION RANGE</span>
                  <span className="text-xs text-[#22d3ee] font-medium bg-[#22d3ee]/5 border border-[#22d3ee]/25 px-2.5 py-1 rounded-full inline-block">
                    {selectedDream.mood} (Dominant)
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6 mt-6">
                <button
                  onClick={() => setSelectedDream(null)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-colors font-mono"
                >
                  Close Viewer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
