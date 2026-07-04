'use client';

import * as React from 'react';
import { useDreams } from '../../hooks/use-dreams';
import {
  Server,
  Cpu,
  RefreshCw,
  Terminal,
  Compass,
  Heart,
  Eye,
  CheckCircle,
  Play,
  Database,
  Search,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export function AgentConsoleView() {
  const { dreams } = useDreams();
  const latestDream = dreams[0];

  const [activeTab, setActiveTab] = React.useState<'flow' | 'logs'>('flow');
  const [swarmState, setSwarmState] = React.useState<'idle' | 'running' | 'completed'>('completed');
  const [consoleLogs, setConsoleLogs] = React.useState<string[]>([
    '[SYSTEM] Initializing Oneiromantia agent swarm...',
    '[NORMALIZER] Connection established to ADK server',
    '[EMOTION] Waiting for stream queue signal...',
    '[SYMBOL] DB indexes verified and locked',
    '[SYSTEM] Core Swarm ready.'
  ]);

  const [simulatedProgress, setSimulatedProgress] = React.useState(100);

  // Load custom logs from latest dream if available
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (latestDream && latestDream.agentLogs) {
        const parsedLogs = latestDream.agentLogs.map(log => `[AGENT] ${log}`);
        setConsoleLogs(prev => [
          ...prev,
          `[SYSTEM] New dream loaded: "${latestDream.title}"`,
          ...parsedLogs,
          `[SYSTEM] Generated artwork with seed ${latestDream.artworkSeed}`
        ]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [latestDream]);

  const runSwarmSimulation = () => {
    setSwarmState('running');
    setSimulatedProgress(0);
    setConsoleLogs([
      `[SYSTEM] Manual Swarm Execution triggered for: "${latestDream?.title || 'Current Thread'}"`,
      '[NORMALIZER] NORMALIZING INPUT TRANSLATION PEAKS...',
      '[NORMALIZER] NORMALIZATION COMPLETED. COMPRESS_FACTOR: 1.24'
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSimulatedProgress(step * 20);

      if (step === 1) {
        setConsoleLogs(prev => [
          ...prev,
          '[SYMBOL] INGESTING SUB-PSYCHE METADATA VECTORS...',
          '[SYMBOL] MATCHING EMBEDDED SYMBOLS WITH JUNGIAN CORPUS...'
        ]);
      } else if (step === 2) {
        setConsoleLogs(prev => [
          ...prev,
          '[EMOTION] PARSING TEXT SENTIMENT WAVELETS...',
          `[EMOTION] DETECTED DOMINANT VIBE: "${latestDream?.mood || 'Wonder'}"`
        ]);
      } else if (step === 3) {
        setConsoleLogs(prev => [
          ...prev,
          '[ARCHETYPE] EVALUATING PSYCHOANALYTICAL METRICS...',
          `[ARCHETYPE] MATCHED ARCHETYPE: "${latestDream?.archetypes[0]?.name || 'The Sage'}" (Confidence: 84%)`
        ]);
      } else if (step === 4) {
        setConsoleLogs(prev => [
          ...prev,
          '[ARTWORK] BOOTSTRAPPING P5.JS PROCEDURAL GRAPHICS PIPELINE...',
          `[ARTWORK] GENERATED STOCHASTIC ARTWORK SEED: ${latestDream?.artworkSeed || 1402}`
        ]);
      } else if (step === 5) {
        setConsoleLogs(prev => [
          ...prev,
          '[SYSTEM] ALL AGENT THREADS INTEGRATED SUCCESSFULLY.',
          '[SYSTEM] DB METADATA CACHE CONSOLIDATED.'
        ]);
        setSwarmState('completed');
        clearInterval(interval);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Swarm Controller Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#ec4899] font-mono text-xs">
            <Server className="w-3.5 h-3.5 animate-pulse" />
            <span>PYTHON BACKEND MULTI-AGENT SWARM ORCHESTRATION</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white">Agentic Swarm Console</h2>
          <p className="text-[#ccc3d8]/60 text-xs font-mono">
            Orchestrating sub-agents through the Google Agentic Developer Kit (ADK) & Model Context Protocol (MCP).
          </p>
        </div>

        <button
          onClick={runSwarmSimulation}
          disabled={swarmState === 'running'}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white font-semibold text-xs transition-colors shadow-lg shadow-[#ec4899]/20 disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-4 h-4" />
          <span>Execute Full Swarm Pipeline</span>
        </button>
      </div>

      {/* Main Panel grid: Left side Workflow Diagram, Right side interactive Terminal logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Workflow Diagram representing GitHub Actions */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col h-full">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
            <span className="font-mono text-xs text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#ec4899]" />
              SWARM PIPELINE MODEL
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
              <span className="text-[10px] font-mono text-[#ccc3d8]/60">Active Swarm</span>
            </div>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-between py-2 relative">
            
            {/* Vector Connector Lines */}
            <div className="absolute left-[26px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#7c3aed] via-[#22d3ee] to-[#ec4899] opacity-30 z-0"></div>

            {/* Step 1: Normalizer */}
            <div className="flex items-center gap-4 relative z-10 bg-[#09090b]/40 p-3 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-[#7c3aed]">
                <Activity className="w-5 h-5 text-[#d2bbff]" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white font-semibold">Normalizer Agent</span>
                  <span className="text-[#22c55e]">Completed</span>
                </div>
                <p className="text-[10px] text-[#ccc3d8]/60 font-mono mt-0.5">Ingests dream markdown & logs</p>
              </div>
            </div>

            {/* Step 2: Symbol Extractor */}
            <div className="flex items-center gap-4 relative z-10 bg-[#09090b]/40 p-3 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-[#22d3ee]">
                <Compass className="w-5 h-5 text-[#22d3ee]" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white font-semibold">Symbol Extractor</span>
                  <span className="text-[#22c55e]">Completed</span>
                </div>
                <p className="text-[10px] text-[#ccc3d8]/60 font-mono mt-0.5">Identifies Jungian archetypal keys</p>
              </div>
            </div>

            {/* Step 3: Emotion Analyzer */}
            <div className="flex items-center gap-4 relative z-10 bg-[#09090b]/40 p-3 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-[#ec4899]">
                <Heart className="w-5 h-5 text-[#ec4899]" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white font-semibold">Emotion Analyst</span>
                  <span className="text-[#22c55e]">Completed</span>
                </div>
                <p className="text-[10px] text-[#ccc3d8]/60 font-mono mt-0.5">Evaluates long-term mood arcs</p>
              </div>
            </div>

            {/* Step 4: Archetype Detector */}
            <div className="flex items-center gap-4 relative z-10 bg-[#09090b]/40 p-3 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-[#f9bd22]">
                <Eye className="w-5 h-5 text-[#f9bd22]" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white font-semibold">Archetype Detector</span>
                  <span className="text-[#22c55e]">Completed</span>
                </div>
                <p className="text-[10px] text-[#ccc3d8]/60 font-mono mt-0.5">Identifies dominant sub-psyche</p>
              </div>
            </div>

            {/* Step 5: Art Renderer */}
            <div className="flex items-center gap-4 relative z-10 bg-[#09090b]/40 p-3 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white font-semibold">Art Renderer</span>
                  <span className="text-white/40">Idle</span>
                </div>
                <p className="text-[10px] text-[#ccc3d8]/60 font-mono mt-0.5">Generates procedural Canvas art</p>
              </div>
            </div>

          </div>
        </div>

        {/* Real-time terminal logs */}
        <div className="lg:col-span-7 glass-panel rounded-2xl flex flex-col h-full overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-[#131315]">
            <span className="font-mono text-xs text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#ec4899]" />
              SYSTEM LOG STREAM
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setConsoleLogs([])}
                className="text-[10px] font-mono text-[#ccc3d8]/40 hover:text-white transition-colors"
              >
                Clear Log
              </button>
            </div>
          </div>

          <div className="flex-1 bg-black/90 p-5 font-mono text-[11px] text-[#3af53a] space-y-2.5 h-[400px] overflow-y-auto custom-scrollbar shadow-inner">
            {consoleLogs.map((log, idx) => {
              let style = 'text-[#3af53a]';
              if (log.includes('[SYSTEM]')) style = 'text-[#d2bbff]';
              if (log.includes('[AGENT]')) style = 'text-[#22d3ee]';
              if (log.includes('EMOTION')) style = 'text-[#ec4899]';
              if (log.includes('SYMBOL')) style = 'text-[#f9bd22]';
              
              return (
                <div key={idx} className={`${style} flex gap-2 items-start`}>
                  <span className="text-white/30 shrink-0">[{idx.toString().padStart(3, '0')}]</span>
                  <span className="break-all">{log}</span>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/5 bg-[#131315]/40 flex justify-between items-center">
            <span className="font-mono text-[10px] text-[#ccc3d8]/40">ADK STATUS: INTEGRATED</span>
            <span className="font-mono text-[10px] text-[#ccc3d8]/40">SPEED: 1.42s/sw</span>
          </div>
        </div>

      </div>
    </div>
  );
}
