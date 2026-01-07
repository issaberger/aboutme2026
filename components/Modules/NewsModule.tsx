import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { useSystem } from '../../context/SystemContext';
import {
  Radio,
  ShieldAlert,
  Cpu,
  Globe,
  Zap,
  ExternalLink,
  Loader2,
  RefreshCw,
  Activity,
  Satellite,
  Lock
} from 'lucide-react';
import CyberButton from '../ui/CyberButton';

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  category: string;
  timestamp: string;
  confidence: number;
}

const CATEGORIES = [
  { id: 'all', label: 'WIDE_BAND', icon: Globe },
  { id: 'ai', label: 'NEURAL_LINK', icon: Cpu },
  { id: 'security', label: 'NET_SEC', icon: ShieldAlert },
  { id: 'hardware', label: 'CORE_GEAR', icon: Zap },
  { id: 'culture', label: 'DIGITAL_C', icon: Radio },
];

const LOADING_STEPS = [
  "INITIALIZING UPLINK...",
  "BYPASSING ENCRYPTION...",
  "SYNCING SATELLITE HANDSHAKE...",
  "DECRYPTING PACKETS...",
  "VALIDATING SOURCE INTEGRITY...",
  "FINALIZING INTEL STREAM..."
];

// ✅ Vite injects env vars at build time ONLY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (!API_KEY) {
  // Throwing at module load time makes it obvious during development/builds.
  // In production, it will show your error UI from the catch block if you prefer,
  // but this prevents silent undefined key usage.
  throw new Error("Missing VITE_GEMINI_API_KEY (not injected at build time).");
}

// ✅ Create AI client once
const ai = new GoogleGenAI({ apiKey: API_KEY });

const NewsModule = () => {
  const { colors, proMode } = useSystem();
  const [activeCat, setActiveCat] = useState('all');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Cycle loading messages
  useEffect(() => {
    let interval: number | undefined;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const fetchIntel = async (category: string) => {
    setLoading(true);
    setLoadingStep(0);
    setError(null);

    try {
      const prompt = `
Provide exactly 6 highly impactful and current technology news stories for today related to ${
        category === 'all'
          ? 'AI, cybersecurity, emerging tech, and hardware'
          : category
      }.

Format each item EXACTLY like this (repeat 6 times):
Headline: <headline>
Summary: <2 sentences>
Source: <source name>
URL: <full url>

Keep tone professional and slightly technical.
`.trim();

      const response = await ai.models.generateContent({
        // ⚠️ If this model fails for your key/account, switch to: "gemini-1.5-flash"
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      // SDK responses can vary; handle safely:
      const text =
        (typeof (response as any)?.text === 'string' ? (response as any).text : '') ||
        (typeof (response as any)?.text === 'function' ? (response as any).text() : '') ||
        '';

      const chunks =
        (response as any)?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks.map((c: any) => c?.web?.uri).filter(Boolean);

      // Parse items by splitting on double newlines between entries
      const blocks = text
        .split('\n\n')
        .map((b) => b.trim())
        .filter((b) => b.length > 40);

      const items: NewsItem[] = blocks.map((block, i) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

        const headlineLine = lines.find((l) => l.toLowerCase().startsWith('headline:')) || lines[0] || '';
        const summaryLine = lines.find((l) => l.toLowerCase().startsWith('summary:')) || '';
        const sourceLine = lines.find((l) => l.toLowerCase().startsWith('source:')) || '';
        const urlLine = lines.find((l) => l.toLowerCase().startsWith('url:')) || '';

        const title = headlineLine.replace(/^headline:\s*/i, '').trim() || "Intercepted Signal";
        const summaryRaw = summaryLine.replace(/^summary:\s*/i, '').trim();
        const summary = (summaryRaw || lines.slice(1).join(' ')).trim().slice(0, 180) + "...";
        const source = sourceLine.replace(/^source:\s*/i, '').trim() || "Global Intelligence";
        const url =
          urlLine.replace(/^url:\s*/i, '').trim() ||
          sources[i] ||
          "https://google.com/search?q=" + encodeURIComponent(title);

        return {
          title,
          summary,
          source,
          url,
          category: category.toUpperCase(),
          timestamp: new Date().toLocaleTimeString(),
          confidence: 85 + Math.floor(Math.random() * 14),
        };
      });

      setNews(items.slice(0, 6));
    } catch (err: any) {
      console.error(err);
      const msg = String(err?.message || '');
      setError(
        msg.includes('entity was not found')
          ? "SIGNAL_BLOCKED: Restricted Access or Invalid Protocol."
          : msg.includes('Missing VITE_GEMINI_API_KEY')
            ? "CONFIG_FAILURE: API key missing in build environment."
            : "INTERCEPTION_FAILURE: Unable to establish clear signal."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntel(activeCat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-black font-sans">
      {/* Ticker Tape Header */}
      <div className="bg-primary/5 border-b border-primary/20 py-2 overflow-hidden flex items-center whitespace-nowrap z-20">
        <div className="px-3 md:px-5 text-[10px] font-mono text-primary flex items-center gap-2 border-r border-primary/20 shrink-0 bg-black">
          <Activity size={12} className="animate-pulse" /> SYSTEM_STREAM
        </div>
        <motion.div
          animate={{ x: [0, -1500] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 px-6"
        >
          {(news.length > 0 ? news : [{ title: "ESTABLISHING SECURE CONNECTION TO WORLDWIDE TECH GRID..." } as any]).map((n: any, i: number) => (
            <span key={i} className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">
              SEC_LEVEL_4 // {n.title} // SIG_STRENGTH: 98%
            </span>
          ))}
        </motion.div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
        {/* Frequency Analyzer Decorative Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(var(--color-primary-rgb),0.2)_50%,transparent_100%)] bg-[size:100%_4px] animate-[scanlines_2s_linear_infinite]" />
          <div className="flex items-end gap-1 h-32 absolute bottom-0 left-0 w-full px-4">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [10, Math.random() * 80, 10] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }}
                className="flex-1 bg-primary/20"
              />
            ))}
          </div>
        </div>

        {/* Sidebar / Category Nav (Horizontal on Mobile) */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-800 p-4 shrink-0 bg-black/40 z-10 backdrop-blur-md">
          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar gap-2 pb-2 md:pb-0">
            <h3 className="hidden md:block text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] mb-4 px-2">
              Bandwidth_Frequencies
            </h3>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                disabled={loading}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-[10px] md:text-xs font-bold uppercase transition-all border whitespace-nowrap md:whitespace-normal shrink-0 ${
                  activeCat === cat.id
                    ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.2)]'
                    : 'bg-transparent border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <cat.icon size={14} className={activeCat === cat.id ? 'animate-pulse' : ''} />
                {cat.label}
              </button>
            ))}
          </div>

          <div className="hidden md:block mt-8 space-y-4">
            <div className="bg-gray-900/30 p-4 border border-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] text-gray-600 uppercase font-mono tracking-tighter">Signal_Decryption</span>
                <span className="text-[9px] text-primary animate-pulse font-mono">ENCRYPTED</span>
              </div>
              <div className="grid grid-cols-8 gap-0.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`h-2 rounded-full ${Math.random() > 0.5 ? 'bg-primary/40' : 'bg-gray-800'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scroll-smooth">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="relative w-24 h-24 md:w-32 md:h-32">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border-2 border-dotted border-primary/40 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Satellite className="text-primary animate-bounce" size={32} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest flex items-center justify-center gap-3">
                    <Loader2 size={24} className="animate-spin text-primary" /> {LOADING_STEPS[loadingStep]}
                  </h2>
                  <p className="text-[10px] md:text-xs text-primary/40 font-mono">
                    SECURE_LINK_STABLISHED // BYPASSING NODE_419 // RECV_BUFFER_ACTIVE
                  </p>
                </div>

                <div className="w-full max-w-xs h-1 bg-gray-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary shadow-[0_0_10px_var(--color-primary)]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4.8, ease: "linear" }}
                  />
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center gap-6"
              >
                <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-full">
                  <Lock className="text-red-500" size={48} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white uppercase">Access Denied</h2>
                  <p className="text-red-500/80 font-mono text-xs">{error}</p>
                </div>
                <CyberButton onClick={() => fetchIntel(activeCat)} variant="danger">
                  RE-INITIALIZE PROTOCOL
                </CyberButton>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-24"
              >
                {news.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="group relative bg-gray-900/20 border border-gray-800 p-5 md:p-6 rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none transition-opacity" />

                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gray-800 group-hover:border-primary transition-colors" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gray-800 group-hover:border-primary transition-colors" />

                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                          {item.category}
                        </span>
                        {idx < 2 && (
                          <span className="animate-pulse text-[10px] font-mono text-red-500 px-2 py-0.5 bg-red-500/10 rounded border border-red-500/20">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-mono text-gray-600 uppercase">Confidence</div>
                        <div className="text-[11px] font-mono text-green-500">{item.confidence}%</div>
                      </div>
                    </div>

                    <h3 className="text-lg md:text-xl font-black text-white mb-3 group-hover:text-primary transition-colors leading-[1.1]">
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 mb-6 leading-relaxed line-clamp-3">
                      {item.summary}
                    </p>

                    <div className="flex justify-between items-end mt-auto pt-5 border-t border-gray-800/50">
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-600 uppercase font-mono tracking-tighter">Origin Source</div>
                        <div className="text-[11px] text-gray-400 font-bold uppercase">{item.source}</div>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-[10px] font-black text-primary border border-primary/20 px-3 py-1.5 rounded hover:bg-primary hover:text-black transition-all"
                      >
                        EXTRACT DATA <ExternalLink size={12} />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 flex gap-2 z-30">
            {!loading && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fetchIntel(activeCat)}
                className="p-4 bg-primary text-black rounded-full shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)] transition-all flex items-center justify-center"
              >
                <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes scanlines { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
      `}</style>
    </div>
  );
};

export default NewsModule;
