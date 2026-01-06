import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { Terminal, Shield, Award, Languages } from 'lucide-react';

const AboutModule = () => {
  const { colors, proMode } = useSystem();
  const [history, setHistory] = useState<Array<{ cmd: string; output: React.ReactNode }>>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const initialMsg = {
    cmd: './init_bio.sh',
    output: (
      <div className="space-y-2 mb-4">
        <p>User Identity: Issa Berger</p>
        <p>Role: IT Support Specialist & Digital Systems Engineer</p>
        <p className="text-gray-400">Type 'help' for available commands.</p>
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
        output = <div className="text-gray-400">Available commands: whoami, skills, certs, languages, exp, clear</div>;
        break;
      case 'whoami':
        output = (
          <div className="max-w-2xl text-justify">
            <p className="mb-2">
              Based in Alexandria, VA. I bridge the gap between human operators and digital infrastructure.
            </p>
            <p>
              My background spans pure IT desktop support (Axiom), educational administration (Quisqueya University), and creative web development. I thrive in troubleshooting complex hardware/software ecosystems and building resilient networks.
            </p>
          </div>
        );
        break;
      case 'skills':
        output = (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-primary font-bold block border-b border-gray-700 mb-2">Technical</span>
              <ul className="list-disc pl-4 text-sm">
                <li>Desktop Support (Win/Mac/Linux)</li>
                <li>Active Directory & Azure AD</li>
                <li>M365 Administration</li>
                <li>Hardware Troubleshooting</li>
              </ul>
            </div>
            <div>
              <span className="text-primary font-bold block border-b border-gray-700 mb-2">Development</span>
              <ul className="list-disc pl-4 text-sm">
                <li>HTML5 / CSS3 / JavaScript</li>
                <li>React & TypeScript</li>
                <li>Python (Basic)</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
          </div>
        );
        break;
      case 'certs':
        output = (
           <div className="flex flex-wrap gap-4">
              {['CCNA', 'Network+', 'AWS Cloud Practitioner', 'Azure Fundamentals'].map(c => (
                  <div key={c} className="border border-primary px-2 py-1 text-xs rounded bg-primary/10 flex items-center gap-2">
                      <Award size={12} /> {c}
                  </div>
              ))}
           </div>
        );
        break;
      case 'languages':
        output = (
            <div className="flex gap-4">
                <span className="text-green-400">English [Native]</span>
                <span className="text-blue-400">French [Fluent]</span>
                <span className="text-yellow-400">Haitian Creole [Native]</span>
            </div>
        );
        break;
      case 'exp':
        output = (
            <ul className="space-y-2">
                <li><span className="text-primary">2024-Pres:</span> Axiom (IT Support)</li>
                <li><span className="text-primary">2023-2024:</span> Quisqueya Univ (Admin)</li>
                <li><span className="text-primary">2020-Pres:</span> Freelance Web Dev</li>
            </ul>
        );
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      default:
        output = <span className="text-red-500">Command not found: {cmd}</span>;
    }

    setHistory([...history, { cmd: input, output }]);
    setInput('');
  };

  const quickAction = (cmd: string) => {
    setInput(cmd);
    // Simulate enter press logic if needed, or just set input
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
      <div className={`flex-1 rounded-lg border p-4 font-mono text-sm md:text-base overflow-y-auto ${proMode ? 'bg-white border-gray-200 text-black' : 'bg-black/50 border-gray-800 text-green-400'}`} style={{ borderColor: proMode ? '' : colors.primary }}>
        
        {/* Header decoration */}
        {!proMode && (
          <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
            <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500" />
               <div className="w-3 h-3 rounded-full bg-yellow-500" />
               <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="opacity-50">user@issa-os:~</span>
          </div>
        )}

        <div className="space-y-4">
          {history.map((entry, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex gap-2 opacity-70">
                <span>$</span>
                <span>{entry.cmd}</span>
              </div>
              <div className="mt-1 ml-4 text-gray-200" style={{ color: proMode ? '#333' : '#eee' }}>
                {entry.output}
              </div>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleCommand} className="mt-4 flex gap-2 items-center sticky bottom-0 bg-transparent">
          <span className="text-primary">$</span>
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-transparent border-none outline-none w-full font-mono"
            style={{ color: proMode ? 'black' : colors.primary }}
            placeholder="Enter command..."
          />
        </form>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {['whoami', 'skills', 'certs', 'languages', 'exp'].map(cmd => (
           <button
             key={cmd}
             onClick={() => quickAction(cmd)}
             className="px-3 py-1 border border-gray-700 rounded text-xs hover:bg-gray-800 transition-colors uppercase"
           >
             {cmd}
           </button>
        ))}
      </div>
    </div>
  );
};

export default AboutModule;