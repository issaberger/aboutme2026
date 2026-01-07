import React from 'react';
import { motion } from 'framer-motion';
import { SERVICES } from '../../constants';
import * as Icons from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

// Fix: Cast motion.div to any to avoid TypeScript errors
const MotionDiv = motion.div as any;

const ServicesModule = () => {
  const { colors, proMode } = useSystem();

  return (
    <div className="h-full overflow-y-auto p-8">
      <h2 className="text-3xl font-bold text-center mb-12 text-white">
        <span className="text-primary">System</span> Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pb-20">
        {SERVICES.map((service, idx) => {
          const Icon = (Icons as any)[service.icon] || Icons.HelpCircle;
          return (
            <MotionDiv
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-900/50 border border-gray-700 p-6 rounded hover:border-primary transition-all group relative overflow-hidden"
            >
              {!proMode && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:bg-primary/20 transition-all" />
              )}
              
              <div className="mb-4 text-primary p-3 bg-black/40 rounded w-fit border border-gray-800 group-hover:scale-110 transition-transform">
                <Icon size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">{service.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {service.description}
              </p>

              <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
                 <button className="text-xs font-bold uppercase tracking-wider text-primary hover:text-white transition-colors flex items-center gap-1">
                    Request Details <Icons.ArrowRight size={12} />
                 </button>
              </div>
            </MotionDiv>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesModule;