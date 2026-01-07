import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, LineChart, ShieldCheck, Zap, DollarSign, RefreshCw, AlertTriangle } from 'lucide-react';
import CyberButton from '../ui/CyberButton';

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

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    
    // Resize observer could go here, but simple reset works for now
    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) return;

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
           // ctx.lineTo(getX(i), getY(v)); // Straight line fallback
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

  }, [data, color]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

const MarketModule = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchPrices = async () => {
    try {
      // Using Binance Public API (No key required for public ticker data)
      // Note: In production, proxying this request is better to avoid CORS, but Binance usually allows simple GETs or we use a public CORS proxy if strict.
      // Trying direct first.
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!res.ok) throw new Error('API_UNREACHABLE');
      const allData: TickerData[] = await res.json();
      
      // Filter only our symbols
      const relevantData = allData.filter(d => SYMBOLS.includes(d.symbol));

      setAssets(prev => {
        return relevantData.map(newData => {
           const prevAsset = prev.find(p => p.symbol === newData.symbol);
           const price = parseFloat(newData.lastPrice);
           
           // Maintain a small history buffer for the sparkline
           let newHistory = prevAsset ? [...prevAsset.history, price] : [price * 0.98, price * 0.99, price * 1.01, price]; // Fake initial history if new
           if (newHistory.length > 50) newHistory.shift();

           return {
             ...newData,
             name: SYMBOL_NAMES[newData.symbol],
             history: newHistory
           };
        });
      });
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      console.error(err);
      setError("CONNECTION_LOST // REROUTING...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 3000); // 3s polling for "Real Time" feel
    return () => clearInterval(interval);
  }, []);

  const activeAsset = assets.find(a => a.symbol === selectedSymbol) || assets[0];
  const isPositive = activeAsset ? parseFloat(activeAsset.priceChangePercent) >= 0 : true;
  const themeColor = isPositive ? '#10b981' : '#ef4444'; // Emerald vs Red

  return (
    <div className="h-full w-full bg-[#050505] text-[#e0e0e0] flex flex-col font-mono overflow-hidden">
      {/* Vibrant Header */}
      <div className="border-b border-white/10 p-4 flex justify-between items-center bg-black/60 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
           <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${isPositive ? 'from-green-500/20 to-green-900/20 text-green-400' : 'from-red-500/20 to-red-900/20 text-red-400'} border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
              <LineChart size={20} />
           </div>
           <div>
              <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
                 CRYPTO_NEXUS 
                 <span className="text-[10px] font-normal opacity-50 bg-white/10 px-1.5 rounded">LIVE</span>
              </h1>
              <p className="text-[10px] tracking-widest text-gray-500 font-bold">DECENTRALIZED EXCHANGE FEED</p>
           </div>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1 text-[10px] text-gray-500 font-bold">
           <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> SOCKET: CONNECTED</div>
           <div>UPDATED: {lastUpdated}</div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Market Sidebar */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 bg-black/20 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0 z-10 custom-scrollbar">
          {loading && assets.length === 0 ? (
             <div className="p-8 text-center text-xs text-gray-500 animate-pulse">INITIALIZING FEED...</div>
          ) : (
            assets.map(asset => {
              const isUp = parseFloat(asset.priceChangePercent) >= 0;
              return (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedSymbol(asset.symbol)}
                  className={`p-4 text-left border-l-4 transition-all flex justify-between items-center group relative overflow-hidden ${
                    selectedSymbol === asset.symbol 
                      ? `bg-white/5 border-${isUp ? 'green' : 'red'}-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]` 
                      : 'border-transparent hover:bg-white/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="relative z-10">
                    <div className="font-black text-sm text-white">{asset.symbol.replace('USDT', '')}</div>
                    <div className="text-[10px] font-bold text-gray-500">{asset.name}</div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="text-sm font-bold text-white">${parseFloat(asset.lastPrice).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    <div className={`text-[10px] font-black flex items-center justify-end gap-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                       {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                       {asset.priceChangePercent}%
                    </div>
                  </div>
                  
                  {/* Subtle BG Gradient based on trend */}
                  {selectedSymbol === asset.symbol && (
                     <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${isUp ? 'from-green-500 to-transparent' : 'from-red-500 to-transparent'}`} />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Main Terminal View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent)] relative">
           
           {error && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="p-6 border border-red-500/50 bg-red-500/10 rounded-lg text-center">
                   <AlertTriangle className="mx-auto text-red-500 mb-2" />
                   <h3 className="text-red-500 font-bold mb-1">DATA STREAM INTERRUPTED</h3>
                   <p className="text-xs text-red-400/70 mb-4">{error}</p>
                   <CyberButton onClick={fetchPrices} variant="danger">RECONNECT</CyberButton>
                </div>
             </div>
           )}

           {activeAsset && (
             <>
               {/* Hero Metrics */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-black/40 border border-white/10 rounded-lg backdrop-blur">
                     <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Current Price</div>
                     <div className={`text-2xl md:text-3xl font-black ${themeColor === '#10b981' ? 'text-green-400' : 'text-red-400'}`}>
                        ${parseFloat(activeAsset.lastPrice).toLocaleString()}
                     </div>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/10 rounded-lg backdrop-blur">
                     <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">24h Volume</div>
                     <div className="text-xl md:text-2xl font-bold text-white">
                        ${(parseFloat(activeAsset.quoteVolume) / 1000000).toFixed(2)}M
                     </div>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/10 rounded-lg backdrop-blur">
                     <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">High (24h)</div>
                     <div className="text-xl md:text-2xl font-bold text-white">
                        ${parseFloat(activeAsset.highPrice).toLocaleString()}
                     </div>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/10 rounded-lg backdrop-blur">
                     <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Low (24h)</div>
                     <div className="text-xl md:text-2xl font-bold text-white">
                        ${parseFloat(activeAsset.lowPrice).toLocaleString()}
                     </div>
                  </div>
               </div>

               {/* Chart View */}
               <div className="flex-1 min-h-[300px] bg-black/40 border border-white/10 rounded-lg p-1 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-10">
                     {loading && <MotionDiv className="h-full bg-white/50" initial={{width:0}} animate={{width:'100%'}} transition={{duration:3, repeat:Infinity}} />}
                  </div>
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                     <span className="px-2 py-1 bg-black/50 border border-white/20 rounded text-[10px] font-bold text-gray-400">1H</span>
                     <span className="px-2 py-1 bg-white/10 border border-white/40 rounded text-[10px] font-bold text-white">1D</span>
                     <span className="px-2 py-1 bg-black/50 border border-white/20 rounded text-[10px] font-bold text-gray-400">1W</span>
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
};

export default MarketModule;