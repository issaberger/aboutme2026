import React from 'react';
import { motion } from 'framer-motion';
import { useSystem } from '../../context/SystemContext';
import { PROFILE, NAV_ITEMS } from '../../constants';
import { ArrowRight, Sparkles, Code2, BrainCircuit, Globe2 } from 'lucide-react';

const HomeModule = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const { themeMode } = useSystem();
  const isDark = themeMode === 'dark';

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="h-full w-full flex flex-col items-center">
      
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full pt-16 pb-12 flex flex-col items-center text-center max-w-3xl"
      >
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 ${isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
          <Sparkles size={14} /> AI Engineering & Systems
        </div>
        
        <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight mb-6 leading-tight">
          Building <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Intelligent</span><br />
          Digital Systems.
        </h1>
        
        <p className={`text-lg md:text-xl max-w-2xl font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          I am {PROFILE.name}, specializing in LLM Integration, Full-Stack Architecture, and next-generation Web Experiences.
        </p>

        <div className="flex items-center gap-4 mt-8">
          <button 
            onClick={() => onNavigate('projects')}
            className="px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
          >
            View Projects
          </button>
          <button 
            onClick={() => onNavigate('contact')}
            className={`px-6 py-3 rounded-full font-medium transition-colors border ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900 shadow-sm'}`}
          >
            Contact Me
          </button>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 pb-24"
      >
        {/* Main Bento Box */}
        <motion.div 
          variants={item}
          onClick={() => onNavigate('dossier')}
          className={`md:col-span-2 row-span-2 group cursor-pointer rounded-3xl p-8 relative overflow-hidden border transition-all hover:scale-[1.02] ${isDark ? 'bg-[#101012] border-white/10 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-xl shadow-sm'}`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-3xl font-heading font-bold mb-2">My Dossier</h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Explore my background, certifications, and experience in the AI field.</p>
          <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
            <ArrowRight />
          </div>
        </motion.div>

        {/* Small Bento 1 */}
        <motion.div 
          variants={item}
          onClick={() => onNavigate('services')}
          className={`group cursor-pointer rounded-3xl p-6 relative overflow-hidden border transition-all hover:scale-[1.02] flex flex-col justify-between min-h-[200px] ${isDark ? 'bg-[#101012] border-white/10 hover:border-purple-500/50' : 'bg-white border-gray-200 hover:border-purple-400 hover:shadow-xl shadow-sm'}`}
        >
          <BrainCircuit className={isDark ? 'text-purple-400' : 'text-purple-600'} size={32} />
          <div>
            <h3 className="text-xl font-heading font-bold mt-4">Services</h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AI Engineering & IT Support</p>
          </div>
        </motion.div>

        {/* Small Bento 2 */}
        <motion.div 
          variants={item}
          onClick={() => onNavigate('projects')}
          className={`group cursor-pointer rounded-3xl p-6 relative overflow-hidden border transition-all hover:scale-[1.02] flex flex-col justify-between min-h-[200px] ${isDark ? 'bg-[#101012] border-white/10 hover:border-emerald-500/50' : 'bg-white border-gray-200 hover:border-emerald-400 hover:shadow-xl shadow-sm'}`}
        >
          <Code2 className={isDark ? 'text-emerald-400' : 'text-emerald-600'} size={32} />
          <div>
            <h3 className="text-xl font-heading font-bold mt-4">Case Studies</h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>View my latest AI projects</p>
          </div>
        </motion.div>

        {/* Medium Bento */}
        <motion.div 
          variants={item}
          onClick={() => onNavigate('onboarding')}
          className={`md:col-span-3 group cursor-pointer rounded-3xl p-8 relative overflow-hidden border transition-all hover:scale-[1.02] flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${isDark ? 'bg-gradient-to-r from-[#101012] to-blue-900/20 border-white/10' : 'bg-gradient-to-r from-white to-blue-50 border-gray-200 hover:shadow-xl shadow-sm'}`}
        >
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${isDark ? 'bg-white/10 text-white' : 'bg-blue-100 text-blue-700'}`}>
              Available for hire
            </div>
            <h3 className="text-2xl font-heading font-bold">Start a Project</h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Fill out my client questionnaire to get a custom quote.</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white group-hover:scale-110 transition-transform shadow-lg">
            <ArrowRight />
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
};

export default HomeModule;
