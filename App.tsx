import React, { useState, useEffect, Suspense, lazy } from 'react';
import Shell from './components/Layout/Shell';
import HomeModule from './components/Modules/HomeModule';
import DossierModule from './components/Modules/DossierModule';
import ProjectsModule from './components/Modules/ProjectsModule';
import ServicesModule from './components/Modules/ServicesModule';
import NewsModule from './components/Modules/NewsModule';
import ContactModule from './components/Modules/ContactModule';
import CommandPalette from './components/Layout/CommandPalette';
import { useSystem } from './context/SystemContext';

// Lazy load heavy interactive modules to improve Core Web Vitals (LCP/FID)
const MarketModule = lazy(() => import('./components/Modules/MarketModule'));
const GameModule = lazy(() => import('./components/Modules/GameModule'));

const App = () => {
  // SEO: Initialize state from URL params to allow deep linking
  const getInitialModule = () => {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const section = params.get('section');
        const validModules = ['home', 'dossier', 'projects', 'services', 'intel', 'market', 'arcade', 'contact'];
        if (section && validModules.includes(section)) {
          return section;
        }
      }
    } catch (e) {
      console.warn('URL param parsing failed (likely sandbox environment):', e);
    }
    return 'home';
  };

  const [activeModule, setActiveModule] = useState(getInitialModule);
  const [cmdOpen, setCmdOpen] = useState(false);
  const { unlockAchievement, setOverclocked, overclocked } = useSystem();

  // SEO: Sync URL and Document Title when activeModule changes
  useEffect(() => {
    // Wrap in try-catch to prevent crashes in sandboxed environments (like AI Studio previews)
    try {
      if (typeof window !== 'undefined' && window.location) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('section') !== activeModule) {
          const url = activeModule === 'home' ? window.location.pathname : `?section=${activeModule}`;
          window.history.pushState({}, '', url);
        }
      }
    } catch (e) {
      // Ignore SecurityError in sandboxed iframes
      console.warn('Navigation state update failed (likely due to sandbox environment):', e);
    }
    
    // Dynamic Title Update for SERP Visibility
    const titleMap: Record<string, string> = {
      home: 'Digital Systems Engineer & IT Specialist',
      dossier: 'Bio & Resume',
      projects: 'Projects & Case Studies',
      services: 'IT Support & Web Services',
      intel: 'Tech News & Global Intel',
      market: 'Market Dashboard',
      arcade: 'Arcade Simulation',
      contact: 'Contact Me'
    };
    document.title = `Issa Berger | ${titleMap[activeModule] || 'Portfolio'}`;
  }, [activeModule]);

  // Handle Browser Back/Forward Buttons
  useEffect(() => {
    const handlePopState = () => setActiveModule(getInitialModule());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
        {activeModule === 'contact' && <ContactModule />}
        
        {/* Lazy Loaded Modules with Fallback */}
        <Suspense fallback={
          <div className="h-full w-full flex items-center justify-center text-primary font-mono animate-pulse">
            LOADING_MODULE_RESOURCES...
          </div>
        }>
          {activeModule === 'market' && <MarketModule />}
          {activeModule === 'arcade' && <GameModule />}
        </Suspense>
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