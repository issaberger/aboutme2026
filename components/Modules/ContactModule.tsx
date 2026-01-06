import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, MapPin, Check, Crosshair } from 'lucide-react';
import { PROFILE } from '../../constants';
import CyberButton from '../ui/CyberButton';
import { useSystem } from '../../context/SystemContext';

const ContactModule = () => {
  const [sent, setSent] = useState(false);
  const { colors } = useSystem();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    const body = `Sender Identity: ${name}\nReturn Frequency: ${email}\n\nTransmission Content:\n${message}`;
    
    // Open default mail client
    window.location.href = `mailto:bergerissa@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    setSent(true);
  };

  if (sent) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6"
            >
                <Check size={40} />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">TRANSMISSION INITIATED</h2>
            <p className="text-gray-400 max-w-md">
                Protocol initialized. If your default mail client did not open, please manually send your encrypted packet to <strong>bergerissa@gmail.com</strong>.
            </p>
            <button 
                onClick={() => setSent(false)} 
                className="mt-8 text-primary hover:underline"
            >
                Send another transmission
            </button>
        </div>
    );
  }

  return (
    <div className="h-full p-8 overflow-y-auto flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Contact Info */}
        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-black text-white mb-2">INITIALIZE<br /><span className="text-primary">CONNECTION</span></h2>
                <p className="text-gray-400 mt-4">
                    Available for freelance contracts, full-time roles, or collaborative projects in the DMV area or remote.
                </p>
            </div>

            <div className="space-y-4">
                <a href={`mailto:${PROFILE.email}`} className="flex items-center gap-4 text-gray-300 hover:text-white p-4 bg-gray-900 border border-gray-800 rounded hover:border-primary transition-all">
                    <Mail className="text-primary" />
                    <div>
                        <div className="text-xs text-gray-500 font-mono">EMAIL</div>
                        <div className="text-sm md:text-base font-bold">{PROFILE.email}</div>
                    </div>
                </a>
                <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-gray-300 hover:text-white p-4 bg-gray-900 border border-gray-800 rounded hover:border-primary transition-all">
                    <Linkedin className="text-primary" />
                    <div>
                        <div className="text-xs text-gray-500 font-mono">LINKEDIN</div>
                        <div className="text-sm md:text-base font-bold">in/issaberger</div>
                    </div>
                </a>
                
                {/* Interactive Map Location Card */}
                <div className="relative group h-32 w-full overflow-hidden bg-gray-900 border border-gray-800 rounded cursor-crosshair">
                     {/* Map Background Layer - Abstract Tech Map */}
                    <motion.div
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 3, rotate: 5 }}
                        transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
                    />
                    
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent pointer-events-none" />

                    {/* Scanning Line */}
                    <motion.div 
                        className="absolute top-0 left-0 w-full h-0.5 bg-primary/40 shadow-[0_0_15px_var(--color-primary)] z-10"
                        animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Content */}
                    <div className="relative z-20 flex items-center gap-4 p-4 h-full pointer-events-none">
                        <div className="p-3 bg-gray-900/80 rounded-full border border-gray-700 group-hover:border-primary group-hover:text-primary transition-colors text-gray-400 backdrop-blur-sm">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-mono flex items-center gap-2 mb-1">
                                BASE OF OPERATIONS 
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                            </div>
                            <div className="text-base font-bold text-white group-hover:tracking-wider transition-all duration-300">
                                {PROFILE.location}
                            </div>
                            <div className="flex flex-col gap-0.5 mt-1 overflow-hidden h-0 group-hover:h-auto transition-all">
                                <span className="text-[10px] text-primary font-mono tracking-widest">
                                    38.8048° N, 77.0469° W
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono">
                                    SECTOR 7G // SECURE
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Targeting Reticle Overlay (Visible on Hover) */}
                    <motion.div 
                       className="absolute inset-0 flex items-center justify-center pointer-events-none"
                       initial={{ opacity: 0 }}
                       whileHover={{ opacity: 1 }}
                    >
                         <div className="absolute inset-0 border-2 border-primary/20 m-2 rounded-sm" />
                         <div className="w-64 h-[1px] bg-primary/30" />
                         <div className="h-64 w-[1px] bg-primary/30" />
                         <div className="w-16 h-16 border border-primary rounded-full flex items-center justify-center shadow-[0_0_15px_var(--color-primary)]">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                         </div>
                         <div className="absolute bottom-4 right-4 text-[10px] text-primary font-mono">
                            TARGET ACQUIRED
                         </div>
                    </motion.div>
                </div>
            </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/50 p-6 md:p-8 rounded-lg border border-gray-800">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-500 uppercase">Identity</label>
                    <input 
                      required 
                      name="name"
                      type="text" 
                      className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-primary outline-none transition-colors" 
                      placeholder="Name" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-500 uppercase">Frequency</label>
                    <input 
                      required 
                      name="email"
                      type="email" 
                      className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-primary outline-none transition-colors" 
                      placeholder="Email" 
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-xs font-mono text-gray-500 uppercase">Subject</label>
                <select 
                  name="subject"
                  className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-primary outline-none transition-colors"
                >
                    <option value="Project Inquiry">Project Inquiry</option>
                    <option value="Recruitment / Hiring">Recruitment / Hiring</option>
                    <option value="Technical Consultation">Technical Consultation</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-mono text-gray-500 uppercase">Transmission</label>
                <textarea 
                  required 
                  name="message"
                  rows={5} 
                  className="w-full bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-primary outline-none transition-colors" 
                  placeholder="Message content..." 
                />
            </div>

            <CyberButton type="submit" className="w-full">TRANSMIT DATA</CyberButton>
        </form>

      </div>
    </div>
  );
};

export default ContactModule;