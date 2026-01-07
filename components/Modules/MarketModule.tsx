import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, LineChart, ShieldCheck, Zap, DollarSign, RefreshCw, AlertTriangle } from 'lucide-react';
import CyberButton from '../ui/CyberButton';
import { useSystem } from '../../context/SystemContext';

const MotionDiv = motion.div as any;

// Real-time pairs to fetch
const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'DOGEUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT'];

interface TickerData {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

interface Asset extends TickerData {
  name: string;
  history: number[]; // Local history for sparkline
}

const SYMBOL_NAMES: Record<string, string> = {
  'BTCUSDT': 'Bitcoin',
  'ETHUSDT': 'Ethereum',
  'SOLUSDT': 'Solana',
  'BNBUSDT': 'BNB',
  'DOGEUSDT': 'Dogecoin',
  'ADAUSDT': 'Cardano',
  'XRPUSDT': 'Ripple',
  'DOTUSDT': 'Polkadot'
};

const LiveChart = ({ data, color }: { data: number[], color: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resizing
    const resize = () => {
       canvas.width = canvas.offsetWidth;
       canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let width = canvas.width;
    let height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) return () => window.removeEventListener('resize', resize);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; 
    const padding = height * 0.1;

    // Mapping functions
    const getX = (i: number) => (i / (data.length - 1)) * width;
    const getY = (v: number) => height - padding - ((v - min) / range) * (height - 2 * padding);

    // Path
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    
    data.forEach((v, i) => {
        if (i === 0) ctx.moveTo(getX(i), getY(v));
        else {
           // Smooth curve
           const xc = (getX(i) + getX(i - 1)) / 2;
           const yc = (getY(v) + getY(data[i - 1])) / 2;
           ctx.quadraticCurveTo(getX(i - 1), getY(data[i - 1]), xc, yc);
        }
    });
    ctx.lineTo(getX(data.length - 1), getY(data[data.length - 1]));
    ctx.stroke();

    // Gradient Fill
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, color + '33'); // 20% opacity
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();
    
    // Pulsing Dot at End
    const lastY = getY(data[data.length-1]);
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.beginPath();
    ctx.arc(width, lastY, 4, 0, Math.PI*2);
    ctx.fill();

    return () => window.removeEventListener('resize', resize);

  }, [data, color]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

const MarketModule = () => {
  const { themeMode } = useSystem();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [loading, setLoading] = useState(true);
  const [usingSimulation, setUsingSimulation] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fallback Simulation Data Generator
  const generateSimulatedData = (prevAssets: Asset[]): Asset[] => {
     if (prevAssets.length === 0) {
        // Initial Mock
        return SYMBOLS.map(sym => ({
            symbol: sym,
            priceChange: '0.00',
            priceChangePercent: (Math.random() * 10 - 5).toFixed(2),
            weightedAvgPrice: '0',
            prevClosePrice: '0',
            lastPrice: (Math.random() * 1000 + 100).toFixed(2),
            lastQty: '0',
            bidPrice: '0',
            askPrice: '0',
            openPrice: '0',
            highPrice: '0',
            lowPrice: '0',
            volume: (Math.random() * 1000000).toFixed(0),
            quoteVolume: (Math.random() * 10000000).toFixed(0),
            openTime: Date.now(),
            closeTime: Date.now(),
            firstId: 0,
            lastId: 0,
            count: 0,
            name: SYMBOL_NAMES[sym] || sym,
            history: Array.from({length: 20}, () => Math.random() * 1000 + 100)
        }));
     }
     
     return prevAssets.map(a => {
        const lastPrice = parseFloat(a.lastPrice);
        const change = (Math.random() - 0.5) * (lastPrice * 0.02);
        const newPrice = Math.max(1, lastPrice + change);
        const newHistory = [...a.history, newPrice];
        if (newHistory.length > 50) newHistory.shift();
        
        return {
           ...a,
           lastPrice: newPrice.toFixed(2),
           priceChangePercent: ((newPrice - newHistory[0]) / newHistory[0] * 100).toFixed(2),
           history: newHistory
        };
     });
  };

  const fetchPrices = async () => {
    try {
      if (usingSimulation) {
          throw new Error("Already using sim");
      }
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!res.ok) throw new Error('API_UNREACHABLE');
      const allData: TickerData[] = await res.json();
      
      const relevantData = allData.filter(d => SYMBOLS.includes(d.symbol));

      setAssets(prev => {
        return relevantData.map(newData => {
           const prevAsset = prev.find(p => p.symbol === newData.symbol);
           const price = parseFloat(newData.lastPrice);
           let newHistory = prevAsset ? [...prevAsset.history, price] : [price * 0.98, price * 0.99, price * 1.01, price];
           if (newHistory.length > 50) newHistory.shift();

           return {
             ...newData,
             name: SYMBOL_NAMES[newData.symbol],
             history: newHistory
           };
        });
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      // Fallback to simulation
      if (!usingSimulation) {
         console.warn("API Failed, switching to simulation mode.");
         setUsingSimulation(true);
      }
      setAssets(prev => generateSimulatedData(prev));
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 3000);
    return () => clearInterval(interval);
  }, [usingSimulation]);

  const activeAsset = assets.find(a => a.symbol === selectedSymbol) || assets[0];
  const isPositive = activeAsset ? parseFloat(activeAsset.priceChangePercent) >= 0 : true;
  const themeColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div className="h-full w-full bg-bg text-[var(--color-text)] flex flex-col font-mono overflow-hidden transition-colors duration-500">
      {/* Header */}
      <div className={`border-b p-4 flex justify-between items-center backdrop-blur-md z-20 ${themeMode === 'light' ? 'bg-white/60 border-gray-200' : 'bg-black/60 border-white/10'}`}>
        <div className="flex items-center gap-4">
           <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${isPositive ? 'from-green-500/20 to-green-900/20 text-green-400' : 'from-red-500/20 to-red-900/20 text-red-400'} shadow-[0_0_15px_rgba(0,0,0,0.1)] border ${themeMode === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
              <LineChart size={20} />
           </div>
           <div>
              <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                 CRYPTO_NEXUS 
                 <span className={`text-[10px] font-normal opacity-50 px-1.5 rounded ${themeMode === 'light' ? 'bg-black/10' : 'bg-white/10'}`}>
                    {usingSimulation ? 'SIMULATION' : 'LIVE'}
                 </span>
              </h1>
              <p className="text-[10px] tracking-widest opacity-50 font-bold">DECENTRALIZED EXCHANGE FEED</p>
           </div>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1 text-[10px] opacity-50 font-bold">
           <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> SOCKET: CONNECTED</div>
           <div>UPDATED: {lastUpdated}</div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Market Sidebar - Horizontal on mobile, Vertical on Desktop */}
        <div className={`w-full md:w-72 border-b md:border-b-0 md:border-r flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 z-10 custom-scrollbar ${themeMode === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-black/20 border-white/10'}`}>
          {loading && assets.length === 0 ? (
             <div className="p-8 text-center text-xs opacity-50 animate-pulse">INITIALIZING FEED...</div>
          ) : (
            assets.map(asset => {
              const isUp = parseFloat(asset.priceChangePercent) >= 0;
              return (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedSymbol(asset.symbol)}
                  className={`p-4 text-left border-l-4 transition-all flex justify-between items-center group relative overflow-hidden min-w-[200px] md:min-w-0 ${
                    selectedSymbol === asset.symbol 
                      ? `border-${isUp ? 'green' : 'red'}-500 ${themeMode === 'light' ? 'bg-white shadow-sm' : 'bg-white/5'}` 
                      : 'border-transparent opacity-60 hover:opacity-100 hover:bg-black/5'
                  }`}
                >
                  <div className="relative z-10">
                    <div className="font-black text-sm">{asset.symbol.replace('USDT', '')}</div>
                    <div className="text-[10px] font-bold opacity-50">{asset.name}</div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="text-sm font-bold">${parseFloat(asset.lastPrice).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    <div className={`text-[10px] font-black flex items-center justify-end gap-1 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                       {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                       {asset.priceChangePercent}%
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Main Terminal View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col bg-[radial-gradient(circle_at_center,rgba(var(--color-primary-rgb),0.03),transparent)] relative">
           
           {activeAsset && (
             <>
               {/* Hero Metrics */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Current Price', value: `$${parseFloat(activeAsset.lastPrice).toLocaleString()}`, color: themeColor },
                    { label: '24h Volume', value: `$${(parseFloat(activeAsset.quoteVolume) / 1000000).toFixed(2)}M`, color: '' },
                    { label: 'High (24h)', value: `$${parseFloat(activeAsset.highPrice).toLocaleString()}`, color: '' },
                    { label: 'Low (24h)', value: `$${parseFloat(activeAsset.lowPrice).toLocaleString()}`, color: '' }
                  ].map((m, i) => (
                      <div key={i} className={`p-4 border rounded-lg backdrop-blur ${themeMode === 'light' ? 'bg-white/60 border-gray-200' : 'bg-black/40 border-white/10'}`}>
                         <div className="text-[10px] opacity-50 font-bold uppercase mb-1">{m.label}</div>
                         <div className="text-xl md:text-2xl font-black" style={{ color: m.color || 'inherit' }}>
                            {m.value}
                         </div>
                      </div>
                  ))}
               </div>

               {/* Chart View */}
               <div className={`flex-1 min-h-[300px] border rounded-lg p-1 relative overflow-hidden group ${themeMode === 'light' ? 'bg-white border-gray-200' : 'bg-black/40 border-white/10'}`}>
                  {/* Grid Background */}
                  <div className={`absolute inset-0 opacity-10 bg-[size:20px_20px] ${themeMode === 'light' ? 'bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]'}`} />
                  
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                     <span className={`px-2 py-1 border rounded text-[10px] font-bold ${themeMode === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-black/50 border-white/20'}`}>1H</span>
                     <span className={`px-2 py-1 border rounded text-[10px] font-bold ${themeMode === 'light' ? 'bg-black text-white border-black' : 'bg-white/10 border-white/40 text-white'}`}>1D</span>
                  </div>
                  <div className="w-full h-full p-4 relative z-0">
                     <LiveChart data={activeAsset.history} color={themeColor} />
                  </div>
               </div>

               {/* Action Bar */}
               <div className="flex gap-4">
                  <button className="flex-1 bg-green-500/10 border border-green-500/50 text-green-500 py-4 rounded font-black text-sm uppercase hover:bg-green-500 hover:text-black transition-all flex items-center justify-center gap-2">
                     <TrendingUp size={16} /> BUY {activeAsset.symbol.replace('USDT', '')}
                  </button>
                  <button className="flex-1 bg-red-500/10 border border-red-500/50 text-red-500 py-4 rounded font-black text-sm uppercase hover:bg-red-500 hover:text-black transition-all flex items-center justify-center gap-2">
                     <TrendingDown size={16} /> SELL {activeAsset.symbol.replace('USDT', '')}
                  </button>
               </div>
             </>
           )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MarketModule;