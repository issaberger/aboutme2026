import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ShieldAlert, Cpu, Zap, ExternalLink, Activity, RefreshCw, Radio, Terminal } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

// Types for Hacker News API
interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number;
  descendants: number; // comment count
}

interface NewsItem extends HNStory {
  category: string;
  domain: string;
}

const CATEGORIES = [
  { id: 'all', label: 'GLOBAL_FEED', icon: Globe, color: 'text-blue-400', border: 'border-blue-400' },
  { id: 'ai', label: 'NEURAL_NET', icon: Cpu, color: 'text-purple-400', border: 'border-purple-400' },
  { id: 'security', label: 'NET_SEC', icon: ShieldAlert, color: 'text-red-400', border: 'border-red-400' },
  { id: 'hardware', label: 'HARDWARE', icon: Zap, color: 'text-yellow-400', border: 'border-yellow-400' },
  { id: 'dev', label: 'DEV_OPS', icon: Terminal, color: 'text-green-400', border: 'border-green-400' },
];

// Keywords for auto-categorization
const KEYWORDS: Record<string, string[]> = {
  ai: ['ai', 'gpt', 'llm', 'neural', 'robot', 'learning', 'model', 'diffusion', 'openai', 'anthropic', 'nvidia'],
  security: ['hack', 'security', 'vuln', 'breach', 'attack', 'malware', 'zero-day', 'exploit', 'privacy', 'nsa'],
  hardware: ['chip', 'processor', 'intel', 'amd', 'arm', 'risc', 'pi', 'arduino', 'apple', 'mac', 'iphone'],
  dev: ['react', 'js', 'typescript', 'rust', 'python', 'code', 'linux', 'git', 'web', 'css', 'api', 'database']
};

const MotionDiv = motion.div as any;

const NewsModule = () => {
  const { colors } = useSystem();
  const [activeCat, setActiveCat] = useState('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchLiveIntel = async () => {
    setLoading(true);
    try {
      // 1. Get Top Stories IDs
      const topIdsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const topIds = await topIdsRes.json();

      // 2. Fetch details for first 60 items
      const storyPromises = topIds.slice(0, 60).map((id: number) => 
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
      );
      
      const rawStories: HNStory[] = (await Promise.all(storyPromises)).filter(s => s && s.url && !s.dead && !s.deleted);

      // 3. Process and Categorize
      const processed: NewsItem[] = rawStories.map(story => {
        const titleLower = story.title.toLowerCase();
        let category = 'general';
        
        // Auto-tagging logic
        for (const [cat, words] of Object.entries(KEYWORDS)) {
          if (words.some(w => titleLower.includes(w))) {
            category = cat;
            break;
          }
        }
        
        // If uncategorized but high score, maybe 'dev' or 'culture' (using 'dev' for generic tech here for simplicity)
        if (category === 'general') category = 'dev'; 

        let domain = '';
        try { domain = new URL(story.url).hostname.replace('www.', ''); } catch(e) {}

        return { ...story, category, domain };
      });

      setNews(processed);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Intel Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveIntel();
    const interval = setInterval(fetchLiveIntel, 60000); // Auto refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const filteredNews = activeCat === 'all' 
    ? news 
    : news.filter(n => n.category === activeCat);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#030303] font-sans relative">
      {/* Live Header */}
      <div className="bg-primary/10 border-b border-primary/30 py-2 px-4 flex justify-between items-center z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity size={16} className="text-primary animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-black tracking-widest text-primary">LIVE_INTEL_FEED // HN_UPLINK</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400">
           <span>UPDATED: {lastUpdated}</span>
           <button 
             onClick={fetchLiveIntel}
             className="hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
             disabled={loading}
           >
             <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
        {/* Sidebar Categories */}
        <div className="w-full md:w-64 bg-black/40 border-b md:border-b-0 md:border-r border-gray-800 p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible shrink-0 z-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded text-[10px] md:text-xs font-bold uppercase transition-all border whitespace-nowrap md:whitespace-normal group relative overflow-hidden ${
                activeCat === cat.id 
                  ? `bg-white/5 border-${cat.color.split('-')[1]}-500/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]`
                  : 'bg-transparent border-transparent text-gray-500 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {activeCat === cat.id && (
                 <MotionDiv layoutId="activeGlow" className={`absolute inset-0 bg-${cat.color.split('-')[1]}-500/10`} />
              )}
              <cat.icon size={16} className={`${activeCat === cat.id ? cat.color : 'text-gray-600 group-hover:text-gray-400'} relative z-10`} />
              <span className="relative z-10">{cat.label}</span>
              {activeCat === cat.id && <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-${cat.color.split('-')[1]}-400 animate-pulse relative z-10`} />}
            </button>
          ))}
        </div>

        {/* News Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(0,255,255,0.05),transparent_70%)]">
            <AnimatePresence mode="wait">
               {loading && news.length === 0 ? (
                  <MotionDiv key="loader" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col items-center justify-center">
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <div className="mt-4 text-xs font-mono text-primary animate-pulse">DECRYPTING SIGNAL...</div>
                  </MotionDiv>
               ) : (
                  <MotionDiv 
                    key={activeCat}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                  >
                     {filteredNews.map((item, i) => (
                        <MotionDiv
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="group relative bg-[#0a0a0a] border border-gray-800 p-5 rounded-lg hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.1)] flex flex-col"
                        >
                           {/* Category Tag */}
                           <div className="flex justify-between items-start mb-3">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded border border-gray-700 uppercase ${
                                item.category === 'ai' ? 'text-purple-400 border-purple-400/30 bg-purple-400/10' :
                                item.category === 'security' ? 'text-red-400 border-red-400/30 bg-red-400/10' :
                                item.category === 'hardware' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' :
                                'text-blue-400 border-blue-400/30 bg-blue-400/10'
                              }`}>
                                {item.category}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                                 <span>{new Date(item.time * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                           </div>

                           <a href={item.url} target="_blank" rel="noreferrer" className="block mb-4 flex-1">
                              <h3 className="text-sm md:text-base font-bold text-gray-200 group-hover:text-primary transition-colors leading-snug line-clamp-3">
                                 {item.title}
                              </h3>
                              <div className="mt-2 text-[10px] text-gray-500 font-mono truncate">
                                 {item.domain}
                              </div>
                           </a>

                           <div className="mt-auto pt-3 border-t border-gray-800 flex justify-between items-center">
                              <div className="flex gap-3 text-[10px] text-gray-500 font-bold">
                                 <span className="flex items-center gap-1"><Activity size={10} /> {item.score} PTS</span>
                                 <span className="flex items-center gap-1"><Radio size={10} /> {item.descendants || 0} COM</span>
                              </div>
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-1.5 bg-gray-800 rounded text-gray-400 hover:text-white hover:bg-primary/20 transition-all"
                              >
                                 <ExternalLink size={12} />
                              </a>
                           </div>
                        </MotionDiv>
                     ))}
                  </MotionDiv>
               )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NewsModule;