import React, { useState, useEffect } from 'react';
import Shell from './components/Layout/Shell';
import HomeModule from './components/Modules/HomeModule';
import DossierModule from './components/Modules/DossierModule';
import ProjectsModule from './components/Modules/ProjectsModule';
import ServicesModule from './components/Modules/ServicesModule';
import NewsModule from './components/Modules/NewsModule';
import MarketModule from './components/Modules/MarketModule';
import ContactModule from './components/Modules/ContactModule';
import GameModule from './components/Modules/GameModule';
import CommandPalette from './components/Layout/CommandPalette';
import { useSystem } from './context/SystemContext';

const App = () => {
  const [activeModule, setActiveModule] = useState('home');
  const [cmdOpen, setCmdOpen] = useState(false);
  const { unlockAchievement, setOverclocked, overclocked } = useSystem();

  // Konami Code Logic
  useEffect(() => {
    let buffer: string[] = [];
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    const handleKey = (e: KeyboardEvent) => {
      // Command Palette Toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
        return;
      }
      if (e.key === 'Escape') setCmdOpen(false);

      // Konami
      buffer.push(e.key);
      if (buffer.length > 10) buffer.shift();
      if (JSON.stringify(buffer) === JSON.stringify(konami)) {
         unlockAchievement('hacker');
         setOverclocked(true);
         alert('OVERCLOCK MODE ACTIVATED'); // Simple feedback
         buffer = [];
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    // Check if user visited all pages
    const visited = JSON.parse(localStorage.getItem('issa_os_pages_visited') || '[]');
    if (!visited.includes(activeModule)) {
       const newVisited = [...visited, activeModule];
       localStorage.setItem('issa_os_pages_visited', JSON.stringify(newVisited));
       // Now 8 main modules including Market
       if (newVisited.length >= 8) unlockAchievement('explorer');
    }
  }, [activeModule]);

  return (
    <>
      <Shell activeModule={activeModule} onNavigate={setActiveModule}>
        {activeModule === 'home' && <HomeModule onNavigate={setActiveModule} />}
        {activeModule === 'dossier' && <DossierModule />}
        {activeModule === 'projects' && <ProjectsModule />}
        {activeModule === 'services' && <ServicesModule />}
        {activeModule === 'intel' && <NewsModule />}
        {activeModule === 'market' && <MarketModule />}
        {activeModule === 'arcade' && <GameModule />}
        {activeModule === 'contact' && <ContactModule />}
      </Shell>
      
      <CommandPalette 
        isOpen={cmdOpen} 
        onClose={() => setCmdOpen(false)}
        onNavigate={setActiveModule}
      />
    </>
  );
};

export default App;