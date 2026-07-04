'use client';

import * as React from 'react';

export interface SymbolInfo {
  name: string;
  frequency: number;
  trend: 'up' | 'down';
  score: number;
  description: string;
}

export interface EmotionInfo {
  name: string;
  score: number;
  description: string;
}

export interface ArchetypeInfo {
  name: string;
  score: number;
  description: string;
}

export interface Dream {
  id: string;
  title: string;
  date: string;
  mood: 'Wonder' | 'Eerie' | 'Calm' | 'Chaos' | 'Vague';
  text: string;
  lucidity: 'High' | 'Medium' | 'Low';
  dominantEmotion: string;
  summary: string;
  symbols: SymbolInfo[];
  emotions: EmotionInfo[];
  archetypes: ArchetypeInfo[];
  artworkPrompt: string;
  artworkSeed: number;
  agentLogs: string[];
  syncStatus: 'synced' | 'pending';
  createdAt: string;
}

interface DreamContextType {
  dreams: Dream[];
  isOnline: boolean;
  syncQueueLength: number;
  addDream: (title: string, text: string, mood: any, date: string) => Promise<Dream>;
  deleteDream: (id: string) => void;
  syncAllPending: () => Promise<void>;
  isSyncing: boolean;
  analyzeExistingDream: (id: string) => Promise<void>;
}

const DreamContext = React.createContext<DreamContextType | undefined>(undefined);

// Premium pre-populated initial dreams corresponding to the high-detail mockups
const INITIAL_DREAMS: Dream[] = [
  {
    id: 'dream-1',
    title: 'The Glass Cathedral',
    date: '2023-11-24',
    mood: 'Wonder',
    text: 'I found myself standing in the center of a cathedral made entirely of vibrant, refracting glass. The light outside was a deep indigo, flooding through the tall crystal arches. There was no sound, only an immense sense of clarity and transcendence as the light formed glowing geometric structures in the air.',
    lucidity: 'High',
    dominantEmotion: 'Wonder',
    summary: 'The Glass Cathedral represents intellectual growth and self-discovery, yet also highlights a fragile structure of reality. The refracting light suggests a search for spiritual transparency.',
    symbols: [
      { name: 'Crystal/Glass', frequency: 94, trend: 'up', score: 94, description: 'Represents clarity of mind, structured beliefs, and spiritual aspiration.' },
      { name: 'Indigo Light', frequency: 82, trend: 'up', score: 82, description: 'Associated with deep intuition, third-eye vision, and cosmic intelligence.' },
      { name: 'Refracting Prism', frequency: 45, trend: 'down', score: 45, description: 'A tool that breaks down monolithic ideas into diverse colored insights.' }
    ],
    emotions: [
      { name: 'Transcendence', score: 88, description: 'A feeling of soaring above physical or psychological limitations.' },
      { name: 'Serenity', score: 76, description: 'A calm, still pool of mental awareness and quietness.' }
    ],
    archetypes: [
      { name: 'The Sage', score: 65, description: 'The internal searcher of ancient wisdom and cosmic principles.' },
      { name: 'The Creator', score: 41, description: 'The designer of the internal landscape and structural models.' }
    ],
    artworkPrompt: 'A cinematic digital painting of a colossal cathedral made of vibrant refracting glass in a deep violet space with floating particles.',
    artworkSeed: 4812,
    agentLogs: [
      '>> analyzing_text_vector...',
      '>> symbol_match_found: "cathedral"',
      '>> emotion_detected: "wonder" (0.88)',
      '>> triggering_visual_gen_pipeline...',
      '>> buffer_flushed_success'
    ],
    syncStatus: 'synced',
    createdAt: new Date('2023-11-24T22:00:00Z').toISOString()
  },
  {
    id: 'dream-2',
    title: 'Underwater Flight',
    date: '2023-11-23',
    mood: 'Calm',
    text: 'I was flying over a city made of liquid glass under a bioluminescent ocean. Every ripple emitted a soft chime. I felt no fear, only an immense sense of belonging to the stars reflected below.',
    lucidity: 'High',
    dominantEmotion: 'Calm',
    summary: 'A peaceful transition across the vast waters of the subconscious. Floating above liquid glass oceans represents emotional stability and suspended fear.',
    symbols: [
      { name: 'Bioluminescent Ocean', frequency: 82, trend: 'up', score: 82, description: 'Deep subconscious depths illuminated by glowing ideas and wisdom.' },
      { name: 'Liquid Glass', frequency: 64, trend: 'up', score: 64, description: 'Emotions that have solidified into a reflective, calm surface.' },
      { name: 'Suspended Stars', frequency: 15, trend: 'down', score: 15, description: 'Cosmic guidelines reflected onto the personal psyche.' }
    ],
    emotions: [
      { name: 'Serenity', score: 85, description: 'Mental quietness and deep peace.' },
      { name: 'Wonder', score: 91, description: 'Awe at the sheer beauty of the universe.' }
    ],
    archetypes: [
      { name: 'The Seeker', score: 78, description: 'The wanderer traveling across vast horizons of space.' },
      { name: 'The Innocent', score: 50, description: 'Unconditional trust in the flow of the cosmos.' }
    ],
    artworkPrompt: 'Generative abstract digital art of an ocean made of glowing bioluminescent particles under a lavender sky.',
    artworkSeed: 9021,
    agentLogs: [
      '>> normalizer_scale: 1.442',
      '>> vectorizing_semantic_peaks...',
      '>> emotion_detected: "calm" (0.91)',
      '>> generating_ambient_mesh...',
      '>> render_complete'
    ],
    syncStatus: 'synced',
    createdAt: new Date('2023-11-23T23:30:00Z').toISOString()
  },
  {
    id: 'dream-3',
    title: 'Talking Shadow',
    date: '2023-11-22',
    mood: 'Eerie',
    text: 'A shadow on the wall detached itself and began speaking in riddles about a locked door at the edge of my mind. It was eerie but compelling, and I felt I had to find the key.',
    lucidity: 'Medium',
    dominantEmotion: 'Eerie',
    summary: 'The Talking Shadow points directly to the classic Jungian Shadow archetype. It represents suppressed thoughts or hidden potentials waiting to be integrated.',
    symbols: [
      { name: 'Talking Shadow', frequency: 38, trend: 'up', score: 75, description: 'Aspects of the self that are unacknowledged or hidden.' },
      { name: 'Locked Door', frequency: 64, trend: 'up', score: 85, description: 'A boundary separating conscious awareness from deeper secrets.' },
      { name: 'Golden Key', frequency: 50, trend: 'up', score: 60, description: 'The power of understanding or permission to unlock suppressed memories.' }
    ],
    emotions: [
      { name: 'Anxiety', score: 68, description: 'Tension created by facing the unknown aspects of self.' },
      { name: 'Curiosity', score: 80, description: 'A strong urge to investigate and solve the riddles.' }
    ],
    archetypes: [
      { name: 'The Shadow', score: 92, description: 'The repository of repressed emotions, desires, and primitive instincts.' },
      { name: 'The Seeker', score: 45, description: 'The archetype searching for the elusive key to self-integration.' }
    ],
    artworkPrompt: 'An abstract representation of anxiety as a complex, fractured clockwork mechanism with glowing neon red highlights.',
    artworkSeed: 7012,
    agentLogs: [
      '>> anomaly_detector_triggered',
      '>> parsing_shadow_riddle...',
      '>> threat_level_zero: secure',
      '>> mapping_suppressed_nodes...',
      '>> buffer_flushed_success'
    ],
    syncStatus: 'synced',
    createdAt: new Date('2023-11-22T04:15:00Z').toISOString()
  }
];

export function DreamProvider({ children }: { children: React.ReactNode }) {
  const [dreams, setDreams] = React.useState<Dream[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('oneiro_dreams');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Error parsing stored dreams, resetting.', e);
        }
      }
    }
    return INITIAL_DREAMS;
  });
  const [isOnline, setIsOnline] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  const [isSyncing, setIsSyncing] = React.useState<boolean>(false);

  // Initialize and load from local storage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('oneiro_dreams');
      if (!stored) {
        localStorage.setItem('oneiro_dreams', JSON.stringify(INITIAL_DREAMS));
      }

      // Online/Offline Listeners
      const goOnline = () => {
        setIsOnline(true);
        // Toast can be triggered in UI
      };
      const goOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener('online', goOnline);
      window.addEventListener('offline', goOffline);

      return () => {
        window.removeEventListener('online', goOnline);
        window.removeEventListener('offline', goOffline);
      };
    }
  }, []);

  // Save to local storage whenever dreams state changes
  const saveDreams = (newDreams: Dream[]) => {
    setDreams(newDreams);
    if (typeof window !== 'undefined') {
      localStorage.setItem('oneiro_dreams', JSON.stringify(newDreams));
    }
  };

  const syncQueueLength = React.useMemo(() => {
    return dreams.filter(d => d.syncStatus === 'pending').length;
  }, [dreams]);

  // Analyze a pending or existing dream using the server-side Gemini API
  const analyzeExistingDream = async (id: string) => {
    const dream = dreams.find(d => d.id === id);
    if (!dream) return;

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dream.title,
          text: dream.text,
          mood: dream.mood,
          date: dream.date
        }),
      });

      if (res.ok) {
        const analysis = await res.json();
        const updated = dreams.map(d => {
          if (d.id === id) {
            return {
              ...d,
              title: analysis.title || d.title,
              lucidity: analysis.lucidity || 'High',
              dominantEmotion: analysis.dominantEmotion || d.mood,
              summary: analysis.summary || 'Dream analyzed by Oneiromantia core agent.',
              symbols: analysis.symbols || [],
              emotions: analysis.emotions || [],
              archetypes: analysis.archetypes || [],
              artworkPrompt: analysis.artworkPrompt || 'Surreal glowing geometric lines floating in space',
              artworkSeed: analysis.artworkSeed || Math.floor(Math.random() * 10000),
              agentLogs: analysis.agentLogs || ['>> direct_semantic_pipeline_completed'],
              syncStatus: 'synced' as const
            };
          }
          return d;
        });
        saveDreams(updated);
      }
    } catch (e) {
      console.error('Error analyzing dream:', e);
    }
  };

  // Add a dream. If offline, mark as pending and save locally. If online, attempt to run real-time analysis!
  const addDream = async (title: string, text: string, mood: any, date: string): Promise<Dream> => {
    const newId = `dream-${Date.now()}`;
    const cleanTitle = title.trim() || 'Untitled Subconscious Event';
    
    // Preliminary mock layout for fast offline/local feedback
    const newDream: Dream = {
      id: newId,
      title: cleanTitle,
      date,
      mood,
      text,
      lucidity: 'Medium',
      dominantEmotion: mood,
      summary: 'Analysing dream threads. Connecting symbols to Jungian database...',
      symbols: [
        { name: 'Unanalyzed Core', frequency: 1, trend: 'up', score: 50, description: 'This thread is queued for multi-agent synthesis.' }
      ],
      emotions: [
        { name: mood, score: 70, description: 'Active emotional mood signature from self-assessment.' }
      ],
      archetypes: [
        { name: 'The Seeker', score: 50, description: 'Actively journaling represents the Seeker archetype exploring.' }
      ],
      artworkPrompt: `A beautiful dreamscape matching the mood of ${mood}`,
      artworkSeed: Math.floor(Math.random() * 10000),
      agentLogs: [
        `>> dream_ingest_received`,
        `>> queueing_for_offline_or_online_synthesis...`,
        isOnline ? `>> connection_active: analyzing...` : `>> connection_inactive: saved to local queue`
      ],
      syncStatus: isOnline ? 'synced' : 'pending',
      createdAt: new Date().toISOString()
    };

    const updatedDreams = [newDream, ...dreams];
    saveDreams(updatedDreams);

    if (isOnline) {
      // Run analysis in background to keep UI fully responsive
      setTimeout(() => {
        analyzeExistingDream(newId);
      }, 500);
    }

    return newDream;
  };

  // Delete a dream
  const deleteDream = (id: string) => {
    const filtered = dreams.filter(d => d.id !== id);
    saveDreams(filtered);
  };

  // Synchronize all offline dreams
  const syncAllPending = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);

    const pending = dreams.filter(d => d.syncStatus === 'pending');
    for (const dream of pending) {
      await analyzeExistingDream(dream.id);
    }

    setIsSyncing(false);
  };

  return (
    <DreamContext.Provider
      value={{
        dreams,
        isOnline,
        syncQueueLength,
        addDream,
        deleteDream,
        syncAllPending,
        isSyncing,
        analyzeExistingDream
      }}
    >
      {children}
    </DreamContext.Provider>
  );
}

export function useDreams() {
  const context = React.useContext(DreamContext);
  if (context === undefined) {
    throw new Error('useDreams must be used within a DreamProvider');
  }
  return context;
}
