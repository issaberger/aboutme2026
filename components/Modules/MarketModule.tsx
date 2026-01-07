
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_ASSETS } from '../../constants';
import { TrendingUp, TrendingDown, Activity, LineChart, ShieldCheck, Zap, ArrowRight, DollarSign } from 'lucide-react';
import CyberButton from '../ui/CyberButton';

const MotionDiv = motion.div as any;

// Fix: Use a type alias for the base asset type to ensure proper interface extension. 
// Extending complex 'typeof' expressions directly in an interface can sometimes lead to parsing errors.
type BaseAsset = typeof MOCK_ASSETS[0];

interface SimulatedAsset extends BaseAsset {
  currentPrice: number;
  history: number[];
  change: number;
}

const LiveChart = ({ data, color }: { data: number[], color: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<width; i+=40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
    for(let j=0; j<height; j+=40) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(width, j); ctx.stroke(); }

    if (data.length < 2) return;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const padding = range * 0.1;

    const getX = (i: number) => (i / (data.length - 1)) * width;
    const getY = (v: number) => height - ((v - min + padding) / (range + padding * 2)) * height;

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    data.forEach((v, i) => {
        if (i === 0) ctx.moveTo(getX(i), getY(v));
        else ctx.lineTo(getX(i), getY(v));
    });
    ctx.stroke();

    // Area
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, color + '44');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();
    
    // Last point pulse
    const lastV = data[data.length-1];
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(getX(data.length-1), getY(lastV), 4, 0, Math.PI*2);
    ctx.fill();

  }, [data, color]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

const MarketModule = () => {
  const [assets, setAssets] = useState<SimulatedAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>(MOCK_ASSETS[0].symbol);
  const [orderBook, setOrderBook] = useState<{type: 'BUY' | 'SELL', price: string, amount: string}[]>([]);

  // Initialize and simulate
  useEffect(() => {
    // Initial state
    const initial = MOCK_ASSETS.map(a => ({
      ...a,
      currentPrice: a.basePrice,
      history: Array.from({length: 40}, () => a.basePrice + (Math.random() - 0.5) * 50),
      change: 0
    }));
    setAssets(initial);

    // Simulation Loop
    const interval = setInterval(() => {
      setAssets(prev => prev.map(a => {
        const movement = (Math.random() - 0.5) * (a.basePrice * a.volatility);
        const newPrice = Math.max(0.01, a.currentPrice + movement);
        const newHistory = [...a.history.slice(1), newPrice];
        const change = ((newPrice - a.basePrice) / a.basePrice) * 100;
        return { ...a, currentPrice: newPrice, history: newHistory, change };
      }));

      // Random Order Book updates
      if (Math.random() > 0.7) {
        setOrderBook(prev => [
          { 
            type: Math.random() > 0.5 ? 'BUY' : 'SELL', 
            price: (Math.random() * 2000).toFixed(2), 
            amount: (Math.random() * 5).toFixed(4) 
          },
          ...prev.slice(0, 12)
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activeAsset = assets.find(a => a.symbol === selectedAsset) || assets[0];

  return (
    <div className="h-full w-full bg-[#000804] text-[#00ff9f] flex flex-col font-mono overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 p-4 flex justify-between items-center bg-black/40 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
           <LineChart size={24} className="text-[#00ff9f]" />
           <div>
              <h1 className="text-xl font-bold tracking-tighter">QUANTUM_LEDGER v.4.0</h1>
              <p className="text-[9px] tracking-widest opacity-50">DECENTRALIZED ASSET PROTOCOL</p>
           </div>
        </div>
        <div className="hidden md:flex gap-6 text-[10px] opacity-60">
           <div className="flex items-center gap-2"><Zap size={10}/> LATENCY: 0.1ms</div>
           <div className="flex items-center gap-2"><ShieldCheck size={10}/> SECURE_TUNNEL: ACTIVE</div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Market Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0">
          {assets.map(asset => (
            <button
              key={asset.symbol}
              onClick={() => setSelectedAsset(asset.symbol)}
              className={`p-3 text-left border rounded transition-all flex justify-between items-center group ${
                selectedAsset === asset.symbol ? 'bg-[#00ff9f]/10 border-[#00ff9f]' : 'border-transparent hover:bg-white/5 opacity-60'
              }`}
            >
              <div>
                <div className="font-bold">{asset.symbol}</div>
                <div className="text-[9px] opacity-50">{asset.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">${asset.currentPrice.toFixed(2)}</div>
                <div className={`text-[9px] ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                   {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main Terminal View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col custom-scrollbar">
           {/* Chart View */}
           <div className="h-64 md:h-80 bg-black/20 border border-white/10 rounded-lg p-4 relative shrink-0">
              <div className="absolute top-4 left-4 z-10">
                 <div className="text-[10px] opacity-50 mb-1">REAL-TIME INDEX</div>
                 <div className="text-4xl font-black text-white tracking-tighter">
                   ${activeAsset?.currentPrice.toFixed(2)}
                 </div>
              </div>
              <LiveChart data={activeAsset?.history || []} color="#00ff9f" />
           </div>

           {/* Execution Panel */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Book */}
              <div className="lg:col-span-2 bg-black/20 border border-white/10 rounded-lg p-4 overflow-hidden h-64 flex flex-col">
                 <h3 className="text-[10px] font-bold opacity-50 mb-4 tracking-widest flex items-center gap-2">
                    <Activity size={10} /> LIVE_ORDER_FLOW
                 </h3>
                 <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px]">
                    <AnimatePresence>
                      {orderBook.map((order, i) => (
                        <MotionDiv
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex justify-between items-center p-1.5 border-b border-white/5"
                        >
                           <span className={order.type === 'BUY' ? 'text-green-400' : 'text-red-400'}>{order.type}</span>
                           <span className="text-gray-400">{order.amount} $UNIT</span>
                           <span className="text-white">${order.price}</span>
                        </MotionDiv>
                      ))}
                    </AnimatePresence>
                 </div>
              </div>

              {/* Trade Actions */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-6">
                 <div>
                    <h3 className="text-xs font-bold mb-4 uppercase">Execute Order</h3>
                    <div className="space-y-4">
                       <div className="bg-black/40 border border-white/10 p-3 rounded">
                          <label className="text-[9px] opacity-40 block mb-1">Asset Frequency</label>
                          <div className="flex justify-between font-bold">
                             <span>{activeAsset?.name}</span>
                             <span>{activeAsset?.symbol}</span>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <button className="bg-green-500/20 border border-green-500/50 text-green-500 py-3 rounded text-xs font-bold hover:bg-green-500 hover:text-black transition-all">LONG</button>
                    <button className="bg-red-500/20 border border-red-500/50 text-red-500 py-3 rounded text-xs font-bold hover:bg-red-500 hover:text-black transition-all">SHORT</button>
                 </div>
                 <p className="text-[8px] opacity-30 text-center uppercase tracking-tighter">Verified by Quantum Ledger protocol // node-x92</p>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #00ff9f; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MarketModule;
