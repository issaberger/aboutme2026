import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { PROJECTS } from '../../constants';
import { Project } from '../../types';
import { X, Cpu, PenTool, BarChart } from 'lucide-react';
import CyberButton from '../ui/CyberButton';

// Moved Section component to the top to ensure it is defined before usage in ProjectsModule.
// We make children optional in the type definition to resolve TypeScript errors that sometimes
// occur when children are passed via nesting rather than as an explicit attribute in certain TS/React environments.
const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children?: React.ReactNode }) => (
    <div>
        <h4 className="flex items-center gap-2 text-lg font-bold text-gray-200 mb-2">
            <span className="text-primary">{icon}</span> {title}
        </h4>
        <div className="text-gray-400 text-sm leading-relaxed">
            {children}
        </div>
    </div>
);

const ProjectsModule = () => {
  const { colors, proMode, unlockAchievement } = useSystem();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(PROJECTS.map(p => p.category)))];
  
  const filteredProjects = filter === 'All' 
    ? PROJECTS 
    : PROJECTS.filter(p => p.category === filter);

  const handleOpen = (id: string) => {
    setSelectedId(id);
    unlockAchievement('debugger'); // Simple check, ideally check count
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
              filter === cat 
                ? 'bg-primary text-black border-primary' 
                : 'bg-transparent text-gray-400 border-gray-700 hover:border-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pb-20">
        {filteredProjects.map((project) => (
          <motion.div
            layoutId={project.id}
            key={project.id}
            onClick={() => handleOpen(project.id)}
            className="group relative h-64 cursor-pointer bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-primary transition-colors"
          >
            {/* Project Image Background */}
            <div className="absolute inset-0 overflow-hidden">
               {project.image && (
                 <>
                   <img 
                     src={project.image} 
                     alt={project.title} 
                     className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-500 grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 relative z-10" 
                   />
                   {!proMode && (
                     <>
                        <img 
                          src={project.image} 
                          className="absolute inset-0 w-full h-full object-cover opacity-0 glitch-layer-1 z-20 mix-blend-screen pointer-events-none"
                          aria-hidden="true"
                        />
                        <img 
                          src={project.image} 
                          className="absolute inset-0 w-full h-full object-cover opacity-0 glitch-layer-2 z-20 mix-blend-screen pointer-events-none"
                          aria-hidden="true"
                        />
                     </>
                   )}
                 </>
               )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900/60 to-transparent opacity-90 z-30" />
            
            {/* Holographic overlay effect */}
            {!proMode && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[linear-gradient(45deg,transparent_25%,#fff_25%,#fff_50%,transparent_50%,transparent_75%,#fff_75%,#fff_100%)] bg-[size:4px_4px] z-30 pointer-events-none" />
            )}

            <div className="absolute bottom-0 left-0 p-6 w-full z-40">
              <span className="text-xs text-primary font-mono mb-1 block">{project.category}</span>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             {/* Backdrop */}
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setSelectedId(null)}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
             />

             {/* Modal Content */}
             <motion.div 
               layoutId={selectedId}
               className="relative w-full max-w-4xl bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
               style={{ boxShadow: `0 0 30px ${colors.primary}20` }}
             >
                {(() => {
                  const project = PROJECTS.find(p => p.id === selectedId)!;
                  return (
                    <div className="flex flex-col">
                      {/* Hero Image in Modal */}
                      {project.image && (
                          <div className="w-full h-48 relative overflow-hidden group">
                              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                          </div>
                      )}

                      <div className="flex flex-col md:flex-row">
                          {/* Left: Info */}
                          <div className="p-8 md:w-2/3">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">{project.title}</h2>
                                    <span className="text-primary font-mono text-sm">{project.category}</span>
                                </div>
                                <button 
                                  onClick={() => setSelectedId(null)}
                                  className="p-2 hover:bg-gray-800 rounded-full transition-colors absolute top-4 right-4 z-10 bg-black/50 md:bg-transparent"
                                >
                                  <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <Section title="The Problem" icon={<Cpu size={16}/>}>
                                    {project.problem}
                                </Section>
                                <Section title="Actions Taken" icon={<PenTool size={16}/>}>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {project.actions.map((a, i) => <li key={i}>{a}</li>)}
                                    </ul>
                                </Section>
                                <Section title="Outcome" icon={<BarChart size={16}/>}>
                                    {project.outcome}
                                </Section>
                            </div>
                          </div>

                          {/* Right: Meta & Tools */}
                          <div className="bg-gray-800/50 p-8 md:w-1/3 border-l border-gray-700">
                             <div className="mb-6">
                                <h4 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">Tech Stack</h4>
                                <div className="flex flex-wrap gap-2">
                                    {project.tools.map(t => (
                                        <span key={t} className="px-2 py-1 bg-black/30 border border-gray-600 rounded text-xs text-gray-300">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                             </div>
                             {project.stats && (
                                 <div className="mb-6">
                                     <h4 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">Metrics</h4>
                                     {project.stats.map(s => (
                                         <div key={s.label} className="bg-black/20 p-3 rounded mb-2">
                                             <div className="text-2xl font-bold text-primary">{s.value}</div>
                                             <div className="text-xs text-gray-400">{s.label}</div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                          </div>
                      </div>
                    </div>
                  );
                })()}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`
        @keyframes glitch-img-1 {
          0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
          20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
          40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
          60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
          80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); }
          100% { clip-path: inset(30% 0 50% 0); transform: translate(1px, -1px); }
        }
        @keyframes glitch-img-2 {
          0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
          20% { clip-path: inset(30% 0 20% 0); transform: translate(-2px, 1px); }
          40% { clip-path: inset(70% 0 10% 0); transform: translate(2px, -2px); }
          60% { clip-path: inset(20% 0 50% 0); transform: translate(-2px, 2px); }
          80% { clip-path: inset(50% 0 30% 0); transform: translate(1px, -1px); }
          100% { clip-path: inset(0% 0 80% 0); transform: translate(-1px, 1px); }
        }

        .group:hover .glitch-layer-1 {
          animation: glitch-img-1 2s infinite linear alternate-reverse;
          opacity: 0.5;
        }
        .group:hover .glitch-layer-2 {
          animation: glitch-img-2 2.5s infinite linear alternate-reverse;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default ProjectsModule;