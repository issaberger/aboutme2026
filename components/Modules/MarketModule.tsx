import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ai } from '../../lib/gemini';
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart, BarChart3, RefreshCcw, Lock, Search, Zap, LineChart } from 'lucide-react';
import CyberButton from '../ui/CyberButton';
import { useSystem } from '../../context/SystemContext';

// New Theme: Neon Mint / Financial Future
const THEME = {
  primary: '#00ff9f', // Neon Mint
  accent: '#0ea5e9',  // Electric Blue
  bg: '#000804',      // Deepest Green/Black
  panel: 'rgba(0, 20, 10, 0.7)',
  grid: 'rgba(0, 255, 159, 0.15)'
};

interface StockData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  sentiment: 'BUY' | 'SELL' | 'HOLD';
  tip: string;
}

const SECTORS = [
  { id: 'ai', label: 'AI & Chips' },
  { id: 'saas', label: 'Cloud SaaS' },
  { id: 'cyber', label: 'CyberSec' },
  { id: 'ev', label: 'Auto Tech' },
  { id: 'crypto', label: 'DeFi & Web3' }
];

const LOADING_PHASES = [
  "CONNECTING TO NYSE NODE...",
  "CALCULATING ALPHA COEFFICIENTS...",
  "ANALYZING MARKET SENTIMENT...",
  "FETCHING REAL-TIME TICKS...",
  "GENERATING TRADING STRATEGIES..."
];

const LiveChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    
    // Chart State
    const spacing = 4;
    let points: number[] = [];
    const maxPoints = Math.ceil(width / spacing) + 2;
    let currentValue = height * 0.5;
    let targetValue = currentValue;

    // Initialize points
    for(let i=0; i<maxPoints; i++) {
        points.push(height/2);
    }

    let frameId: number;
    let tick = 0;

    const render = () => {
        tick++;
        
        // Handle Resize
        if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        }

        // Update Data
        // Smooth random walk
        if (tick % 5 === 0) {
            const change = (Math.random() - 0.5) * (height * 0.2);
            targetValue = Math.max(height * 0.1, Math.min(height * 0.9, targetValue + change));
        }
        // Lerp current value towards target
        currentValue += (targetValue - currentValue) * 0.05;
        
        // Add point
        points.push(currentValue);
        if (points.length > maxPoints) points.shift();

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Draw Dynamic Grid
        ctx.strokeStyle = THEME.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const gridOffset = (tick * 0.5) % 40;
        
        // Vertical moving lines
        for(let x = width - gridOffset; x > 0; x -= 40) {
             ctx.moveTo(x, 0);
             ctx.lineTo(x, height);
        }
        // Horizontal static lines
        for(let y = 0; y < height; y += 40) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Draw Chart Line
        ctx.strokeStyle = THEME.primary;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = THEME.primary;
        
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
            const x = width - ((points.length - 1 - i) * spacing);
            const y = points[i];
            
            // Bezier curve for smoothness
            if (i === 0) ctx.moveTo(x, y);
            else {
                const prevX = width - ((points.length - 1 - (i-1)) * spacing);
                const prevY = points[i-1];
                const cx = (prevX + x) / 2;
                ctx.quadraticCurveTo(prevX, prevY, cx, (prevY + y) / 2);
                if (i === points.length - 1) ctx.lineTo(x,y);
            }
        }
        ctx.stroke();

        // Fill Gradient Area
        ctx.lineTo(width, height);
        ctx.lineTo(width - ((points.length) * spacing), height);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `${THEME.primary}40`);
        gradient.addColorStop(1, `${THEME.primary}00`);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw Pulse Dot at latest point
        const lastX = width;
        const lastY = points[points.length - 1];
        
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw "Live" readout
        ctx.fillStyle = THEME.primary;
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillText(`${(1000 - lastY).toFixed(2)}`, lastX - 45, lastY - 10);

        ctx.shadowBlur = 0;
        frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

const MarketModule = () => {
  const [activeSector, setActiveSector] = useState('ai');
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Loading animation cycle
  useEffect(() => {
    let interval: number;
    if (loading) {
      setLoadingPhase(0);
      interval = window.setInterval(() => {
        setLoadingPhase(prev => (prev + 1) % LOADING_PHASES.length);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchMarketData = async (sector: string) => {
    setLoading(true);
    setError(null);
    try {
      const prompt = `Analyze the current stock market for the ${sector} technology sector. 
      Identify 4 key companies.
      For each company, use Google Search to find:
      1. Real-time Price.
      2. Today's Percentage Change.
      3. A very brief (1 sentence) trading tip or technical analysis.
      4. A sentiment rating (BUY, SELL, or HOLD).
      
      Format the output strictly as a pipe-delimited list for easy parsing:
      SYMBOL|NAME|PRICE|CHANGE|SENTIMENT|TIP
      Example:
      NVDA|Nvidia Corp|$145.00|+2.5%|BUY|Breakout above resistance expected.
      `;

      // Use the singleton 'ai' client
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-latest', // Stable alias
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      
      const parsed: StockData[] = text.split('\n')
        .filter(line => line.includes('|') && !line.startsWith('SYMBOL'))
        .map(line => {
          const [symbol, name, price, change, sentiment, tip] = line.split('|').map(s => s.trim());
          return { 
            symbol: symbol || '???', 
            name: name || 'Unknown', 
            price: price || 'N/A', 
            change: change || '0%', 
            sentiment: (sentiment as any) || 'HOLD', 
            tip: tip || 'No data available.' 
          };
        })
        .slice(0, 4);

      if (parsed.length === 0) throw new Error("No data parsed");
      setStocks(parsed);

    } catch (err) {
      console.error(err);
      setError("CONNECTION LOST: UNABLE TO REACH EXCHANGE SERVERS (Check API Key)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData(activeSector);
  }, [activeSector]);

  return (
    <div 
      className="h-full w-full overflow-hidden flex flex-col font-mono"
      style={{ backgroundColor: THEME.bg, color: THEME.primary }}
    >
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex justify-between items-center bg-black/40 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 border rounded flex items-center justify-center" style={{ borderColor: THEME.primary, color: THEME.primary }}>
              <LineChart size={20} />
           </div>
           <div>
              <h1 className="text-xl font-bold tracking-tighter" style={{ color: THEME.primary }}>NEXUS MARKETS</h1>
              <p className="text-[10px] tracking-widest opacity-70">LIVE QUANTITATIVE DATA STREAM</p>
           </div>
        </div>
        <div className="hidden md:flex gap-4 text-xs opacity-60">
           <div className="flex items-center gap-1"><Activity size={12}/> FEED: ONLINE</div>
           <div className="flex items-center gap-1"><Zap size={12}/> LATENCY: 2ms</div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative">
         
         {/* Top Section: Live Chart Visualization */}
         <div className="h-48 md:h-64 relative w-full border-b border-gray-800 shrink-0 bg-black/20">
             <div className="absolute top-2 left-4 text-[10px] font-bold tracking-widest opacity-50 z-10 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE INDEX VISUALIZER
             </div>
             <LiveChart />
         </div>

         {/* Bottom Section: Controls & Data */}
         <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Sector Nav */}
            <div className="w-full md:w-48 bg-black/10 border-b md:border-b-0 md:border-r border-gray-800 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible no-scrollbar p-2 z-10">
                {SECTORS.map(sec => (
                <button
                    key={sec.id}
                    onClick={() => setActiveSector(sec.id)}
                    disabled={loading}
                    className={`px-4 py-3 text-left text-xs font-bold uppercase transition-all border-l-2 shrink-0 ${
                    activeSector === sec.id 
                        ? 'bg-white/5' 
                        : 'border-transparent opacity-50 hover:opacity-100 hover:bg-white/5'
                    }`}
                    style={{ 
                        borderColor: activeSector === sec.id ? THEME.primary : 'transparent',
                        color: activeSector === sec.id ? THEME.primary : 'inherit'
                    }}
                >
                    {sec.label}
                </button>
                ))}
            </div>

            {/* Stock Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 relative bg-[radial-gradient(circle_at_center,rgba(0,255,159,0.03),transparent)]">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-6"
                        >
                            <div className="relative w-24 h-24">
                                <motion.div 
                                    className="absolute inset-0 border-4 border-t-transparent rounded-full"
                                    style={{ borderColor: `${THEME.primary}40`, borderTopColor: THEME.primary }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-xl animate-pulse" style={{ color: THEME.primary }}>
                                    %
                                </div>
                            </div>
                            <div className="text-sm font-bold tracking-widest" style={{ color: THEME.primary }}>
                                {LOADING_PHASES[loadingPhase]}
                            </div>
                        </motion.div>
                    ) : error ? (
                        <motion.div key="error" className="h-full flex flex-col items-center justify-center">
                            <p className="text-red-500 mb-4 font-bold">{error}</p>
                            <CyberButton onClick={() => fetchMarketData(activeSector)} variant="danger">RECONNECT</CyberButton>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="grid"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                        >
                            {stocks.map((stock) => (
                                <motion.div
                                    key={stock.symbol}
                                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                    className="bg-gray-900/40 border border-gray-800 p-5 rounded hover:border-white/20 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-2xl font-black text-white">{stock.symbol}</div>
                                            <div className="text-[10px] uppercase opacity-60 tracking-wider">{stock.name}</div>
                                        </div>
                                        <div className={`px-2 py-1 text-[10px] font-bold border rounded ${
                                            stock.sentiment === 'BUY' ? 'border-green-500 text-green-500' :
                                            stock.sentiment === 'SELL' ? 'border-red-500 text-red-500' :
                                            'border-gray-500 text-gray-500'
                                        }`}>
                                            {stock.sentiment}
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-end my-4">
                                        <div className="text-3xl font-mono text-white tracking-tighter">{stock.price}</div>
                                        <div className={`flex items-center gap-1 font-bold text-sm ${stock.change.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                                            {stock.change.includes('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            {stock.change}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-black/20 rounded border border-gray-800/50">
                                        <div className="text-[9px] font-bold opacity-50 uppercase mb-1 flex items-center gap-1">
                                            <Search size={8} /> AI Analysis
                                        </div>
                                        <p className="text-xs opacity-80 leading-relaxed" style={{ color: THEME.primary }}>
                                            "{stock.tip}"
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MarketModule;