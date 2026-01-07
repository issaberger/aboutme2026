import React from 'react';
import { motion } from 'framer-motion';
import { JOBS } from '../../constants';
import { Briefcase, Calendar } from 'lucide-react';

// Fix: Cast motion.div to any to avoid TypeScript errors
const MotionDiv = motion.div as any;

const ResumeModule = () => {
  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto pb-20">
        <h2 className="text-3xl font-bold mb-12 text-center text-white">Career Log</h2>
        
        <div className="relative border-l-2 border-gray-800 ml-4 md:ml-12 space-y-12">
          {JOBS.map((job, idx) => (
            <MotionDiv 
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="relative pl-8 md:pl-12"
            >
              {/* Dot */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-bg" />
              
              <div className="bg-gray-900 border border-gray-800 p-6 rounded hover:border-primary transition-colors">
                 <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">{job.role}</h3>
                        <div className="flex items-center gap-2 text-primary font-mono text-sm mt-1">
                           <Briefcase size={14} /> {job.company}
                        </div>
                    </div>
                    <div className="text-gray-500 font-mono text-xs flex items-center gap-2 mt-2 md:mt-0">
                       <Calendar size={14} /> {job.period}
                    </div>
                 </div>
                 <ul className="list-disc pl-4 space-y-2 text-gray-400 text-sm">
                    {job.description.map((desc, i) => (
                        <li key={i}>{desc}</li>
                    ))}
                 </ul>
              </div>
            </MotionDiv>
          ))}
          
          {/* Education Node */}
          <MotionDiv 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="relative pl-8 md:pl-12"
            >
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-600 border-4 border-bg" />
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded opacity-70 hover:opacity-100 transition-opacity">
                 <h3 className="text-lg font-bold text-white">Career Diploma in Web Page Design</h3>
                 <p className="text-gray-400 text-sm">Pennfoster Career School | 2018 – 2021</p>
              </div>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
};

export default ResumeModule;