import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { PROFILE, JOBS } from '../../constants';
import { Terminal, Shield, Award, Languages, Briefcase, Calendar, Cpu, User, MapPin, HardDrive } from 'lucide-react';

const DossierModule = () => {
  const { colors, proMode } = useSystem();
  const [history, setHistory] = useState<Array<{ cmd: string; output: React.ReactNode }>>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const initialMsg = {
    cmd: './profile_scan.sh',
    output: (
      <div className="space-y-1 text-[10px] md:text-xs opacity-80">
        <p>[OK] BIOMETRICS VERIFIED</p>
        <p>[OK] CLEARANCE LEVEL: ALPHA</p>
        <p className="text-primary">Welcome, Agent Berger.</p>
      </div>
    )
  };

  useEffect(() => {
    setHistory([initialMsg]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    let output: React.ReactNode;

    switch (cmd) {
      case 'help':
        output = <div className="text-gray-400">Commands: identity, stats, clear</div>;
        break;
      case 'identity':
        output = <p>Subject 491-IB. Specialist in Digital Infrastructure and User Logistics.</p>;
        break;
      case 'stats':
        output = <p>Productivity: 114% | Latency: 5ms | Reliability: CRITICAL_SUCCESS</p>;
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      default:
        output = <span className="text-red-500">Error: Command "{cmd}" unrecognized.</span>;
    }

    setHistory([...history, { cmd: input, output }]);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* Left Pane: Identity Matrix */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-800 p-4 md:p-6 flex flex-col gap-4 md:gap-6 overflow-y-auto bg-black/20 shrink-0 md:max-h-full max-h-[50vh]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded border border-primary/20 text-primary">
                <User size={18} className="md:w-5 md:h-5" />
             </div>
             <div>
                <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-tighter leading-tight">Identity Core</h2>
                <p className="text-[9px] md:text-[10px] text-gray-500 font-mono">ID: ISSA-491-X</p>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2 md:gap-3">
             <div className="bg-gray-900/50 border border-gray-800 p-3 rounded-lg flex justify-between items-center text-xs">
                <span className="text-gray-500 flex items-center gap-2"><MapPin size={12}/> LOC</span>
                <span className="text-gray-200">{PROFILE.location}</span>
             </div>
             <div className="bg-gray-900/50 border border-gray-800 p-3 rounded-lg flex justify-between items-center text-xs">
                <span className="text-gray-500 flex items-center gap-2"><Languages size={12}/> LING</span>
                <span className="text-gray-200">EN / FR / HT</span>
             </div>
             <div className="bg-gray-900/50 border border-gray-800 p-3 rounded-lg flex justify-between items-center text-xs">
                <span className="text-gray-500 flex items-center gap-2"><Shield size={12}/> STATUS</span>
                <span className="text-green-500 font-bold">ACTIVE</span>
             </div>
          </div>
        </div>

        {/* Mini Terminal */}
        <div className={`flex-1 min-h-[150px] md:min-h-[200px] flex flex-col rounded border p-3 md:p-4 font-mono text-[10px] md:text-xs ${proMode ? 'bg-white border-gray-200 text-black' : 'bg-black/50 border-gray-800 text-green-400'}`} style={{ borderColor: proMode ? '' : colors.primary }}>
          <div className="flex-1 overflow-y-auto space-y-2">
            {history.map((entry, i) => (
              <div key={i}>
                <div className="flex gap-2 opacity-60">
                  <span>$</span>
                  <span>{entry.cmd}</span>
                </div>
                <div className="mt-1 text-gray-300" style={{ color: proMode ? '#333' : '' }}>
                  {entry.output}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleCommand} className="mt-2 flex gap-2 items-center border-t border-gray-800 pt-2">
            <span className="text-primary">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-transparent border-none outline-none w-full font-mono text-[10px] md:text-xs"
              placeholder="type help..."
            />
          </form>
        </div>

        {/* Subsystem Skills */}
        <div className="space-y-3 pb-2">
           <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Cpu size={12} className="text-primary"/> Neural Upgrades
           </h3>
           <div className="flex flex-wrap gap-1.5 md:gap-2">
              {['Active Directory', 'M365 Admin', 'Azure AD', 'Hardware', 'React', 'TS', 'Networking'].map(skill => (
                <span key={skill} className="px-1.5 py-0.5 md:px-2 md:py-1 bg-primary/5 border border-primary/20 rounded text-[9px] md:text-[10px] text-primary/80 uppercase hover:border-primary hover:text-primary cursor-default transition-all">
                   {skill}
                </span>
              ))}
           </div>
        </div>
      </div>

      {/* Right Pane: Operational History */}
      <div className="flex-1 overflow-y-auto p-5 md:p-12 space-y-8 md:space-y-12 bg-[radial-gradient(circle_at_top_right,rgba(var(--color-primary-rgb),0.05),transparent)]">
        <header>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Operational History</h2>
          <div className="h-1 w-16 md:w-20 bg-primary mt-2 shadow-[0_0_10px_var(--color-primary)]" />
        </header>

        <div className="space-y-6 md:space-y-8 relative">
          {/* Timeline Line */}
          <div className="absolute left-[15px] md:left-[19px] top-4 bottom-4 w-[1px] bg-gray-800" />

          {JOBS.map((job, idx) => (
            <motion.div 
              key={job.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-10 md:pl-12 group"
            >
              {/* Connector Dot */}
              <div className="absolute left-0 top-1 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-800 group-hover:bg-primary group-hover:scale-150 transition-all z-10" />
                 <div className="absolute inset-0 bg-primary/5 rounded-full scale-0 group-hover:scale-100 transition-all border border-primary/20" />
              </div>

              <div className="bg-gray-900/40 border border-gray-800 p-4 md:p-6 rounded-lg hover:border-primary/40 transition-colors group-hover:bg-gray-900/60 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity pointer-events-none">
                   <HardDrive size={48} className="md:w-16 md:h-16" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors leading-tight">{job.role}</h3>
                    <div className="flex items-center gap-2 text-primary font-mono text-[10px] md:text-xs uppercase tracking-widest mt-1">
                      <Briefcase size={10} className="md:w-3 md:h-3" /> {job.company}
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-black/50 border border-gray-700 rounded-full text-[9px] md:text-[10px] text-gray-500 font-mono flex items-center gap-1.5">
                    <Calendar size={10} className="md:w-3 md:h-3" /> {job.period}
                  </div>
                </div>

                <ul className="space-y-1.5 md:space-y-2">
                  {job.description.map((desc, i) => (
                    <li key={i} className="text-xs md:text-sm text-gray-400 flex gap-2 leading-relaxed">
                      <span className="text-primary mt-1 opacity-50 shrink-0">▸</span>
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}

          {/* Education / Certs */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative pl-10 md:pl-12"
          >
            <div className="absolute left-0 top-1 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
              {/* Fixed duplicate className attribute */}
              <Award className="text-gray-500 md:w-5 md:h-5" size={18} />
            </div>
            <div className="bg-primary/5 border border-primary/10 p-4 md:p-6 rounded-lg shadow-inner">
              <h3 className="text-base md:text-lg font-bold text-white leading-tight">Career Diploma in Web Page Design</h3>
              <p className="text-gray-400 text-xs md:text-sm mt-1">Pennfoster Career School | 2018 – 2021</p>
              
              <div className="mt-4 flex flex-wrap gap-1.5 md:gap-2">
                {['CCNA (In Progress)', 'CompTIA A+', 'Azure Fundamentals'].map(c => (
                  <span key={c} className="text-[9px] md:text-[10px] bg-black/40 px-1.5 py-0.5 md:px-2 md:py-1 rounded text-gray-500 border border-gray-800">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DossierModule;