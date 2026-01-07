import { PaletteName, ThemeColors, Project, Job, Service, Achievement } from './types';
import { 
  Monitor, 
  Cpu, 
  Wifi, 
  Shield, 
  Code, 
  Terminal, 
  Globe, 
  Server, 
  Database,
  Cloud,
  Zap,
  ShieldCheck,
  Folder,
  Layers,
  Activity,
  BarChart3,
  Gamepad2,
  Send
} from 'lucide-react';

export const PALETTES: Record<PaletteName, ThemeColors> = {
  NEON_RAIN: {
    primary: '#06b6d4', // Cyan 500
    secondary: '#d946ef', // Fuchsia 500
    accent: '#fde047', // Yellow 300
    bg: '#050505',
    panel: 'rgba(22, 22, 22, 0.8)',
    text: '#e0e0e0',
  },
  ACID_JUNGLE: {
    primary: '#84cc16', // Lime 500
    secondary: '#10b981', // Emerald 500
    accent: '#facc15', // Yellow 400
    bg: '#020602',
    panel: 'rgba(10, 25, 10, 0.8)',
    text: '#e0e0e0',
  },
  VIOLET_CIRCUIT: {
    primary: '#8b5cf6', // Violet 500
    secondary: '#3b82f6', // Blue 500
    accent: '#f472b6', // Pink 400
    bg: '#0b0014',
    panel: 'rgba(20, 10, 30, 0.8)',
    text: '#e0e0e0',
  },
  RED_ALERT: {
    primary: '#ef4444', // Red 500
    secondary: '#f97316', // Orange 500
    accent: '#ffffff', // White
    bg: '#1a0505',
    panel: 'rgba(30, 10, 10, 0.8)',
    text: '#e0e0e0',
  },
  BLUE_ICE: {
    primary: '#38bdf8', // Sky 400
    secondary: '#818cf8', // Indigo 400
    accent: '#e0f2fe', // Sky 100
    bg: '#081018',
    panel: 'rgba(10, 20, 30, 0.8)',
    text: '#e0e0e0',
  },
};

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Monitor, desc: 'System Root' },
  { id: 'dossier', label: 'Dossier', icon: ShieldCheck, desc: 'Bio & Resume' },
  { id: 'projects', label: 'Projects', icon: Folder, desc: 'Case Studies' },
  { id: 'services', label: 'Services', icon: Layers, desc: 'Capabilities' },
  { id: 'intel', label: 'Intel', icon: Activity, desc: 'Deep Net Feed' },
  { id: 'market', label: 'Market', icon: BarChart3, desc: 'Quantum Ledger' },
  { id: 'arcade', label: 'Arcade', icon: Gamepad2, desc: 'Simulations' },
  { id: 'contact', label: 'Contact', icon: Send, desc: 'Transmission' },
];

export const MOCK_INTEL = [
  {
    id: 1,
    title: "ZERO-DAY VULNERABILITY DETECTED",
    summary: "Critical exploit found in major cloud hypervisors. Patching protocols initiated globally.",
    source: "NetSec Sentinel",
    category: "SECURITY",
    timestamp: "02:44:12",
    priority: "CRITICAL"
  },
  {
    id: 2,
    title: "QUANTUM CHIP EFFICIENCY BREAKTHROUGH",
    summary: "New topological insulators allow for 400% increase in qubit coherence at room temperature.",
    source: "Core Gear Labs",
    category: "HARDWARE",
    timestamp: "05:12:00",
    priority: "HIGH"
  },
  {
    id: 3,
    title: "NEURAL LINK V3.5 FIRMWARE LEAKED",
    summary: "Intercepted documentation suggests high-bandwidth visual cortex integration is now stable.",
    source: "Dossier Internal",
    category: "NEURAL",
    timestamp: "09:33:45",
    priority: "MEDIUM"
  },
  {
    id: 4,
    title: "AI AGENT AUTONOMY REACHES TIER 4",
    summary: "LLMs now capable of recursive self-improvement without human-in-the-loop intervention.",
    source: "Global Intelligence",
    category: "AI",
    timestamp: "12:01:10",
    priority: "HIGH"
  },
  {
    id: 5,
    title: "DECENTRALIZED WEB PROTOCOL ACTIVATED",
    summary: "The final layer of the non-custodial internet has been deployed across 40,000 nodes.",
    source: "Wide Band Radio",
    category: "CULTURE",
    timestamp: "14:20:00",
    priority: "LOW"
  }
];

export const MOCK_ASSETS = [
  { symbol: "NXS", name: "Nexus Coin", basePrice: 1450.20, volatility: 0.02 },
  { symbol: "NRL", name: "Neural Link", basePrice: 42.55, volatility: 0.05 },
  { symbol: "DMAT", name: "Dark Matter", basePrice: 8900.00, volatility: 0.01 },
  { symbol: "OSX", name: "System Core", basePrice: 12.10, volatility: 0.08 },
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'explorer', title: 'Explorer', description: 'Visited all system modules.', icon: '🗺️' },
  { id: 'debugger', title: 'Debugger', description: 'Inspected 3 project simulations.', icon: '🐛' },
  { id: 'operator', title: 'Operator', description: 'Utilized the Command Palette.', icon: '⌨️' },
  { id: 'hacker', title: 'Overclocked', description: 'Unlocked the secret Konami code mode.', icon: '⚡' },
];

export const PROFILE = {
  name: 'Issa Berger',
  title: 'Digital Systems Engineer',
  location: 'Alexandria, VA',
  email: 'bergerissa@gmail.com',
  linkedin: 'https://www.linkedin.com/in/issaberger',
  taglines: [
    'IT Support Specialist',
    'Network & Cloud Fundamentals',
    'Digital Systems Engineer',
    'Web Developer'
  ]
};

export const PROJECTS: Project[] = [
  {
    id: 'axiom-ticket',
    title: 'Desktop Support Ticket Resolution',
    category: 'IT Support',
    description: 'High-volume ticket resolution workflow optimization.',
    image: 'https://robohash.org/DesktopSupportTicketResolution?set=set1&bgset=bg1&size=600x600',
    problem: 'End-users experienced long wait times for Tier 1 support issues, impacting productivity.',
    actions: [
      'Implemented automated categorization for incoming tickets.',
      'Created a knowledge base for common fixes (printer resets, password recovery).',
      'Deployed remote desktop scripts for quick diagnostics.'
    ],
    tools: ['ServiceNow', 'PowerShell', 'Remote Desktop'],
    outcome: 'Reduced average ticket resolution time by 35% within the first month.',
    stats: [{ label: 'Efficiency', value: '+35%' }],
    link: '#'
  },
  {
    id: 'field-ops',
    title: 'On-Site Field Support & Hardware Swap',
    category: 'Field Support',
    description: 'Large-scale hardware refresh for enterprise client.',
    image: 'https://robohash.org/OnSiteFieldSupport?set=set1&bgset=bg1&size=600x600',
    problem: 'Client needed to upgrade 50+ workstations over a weekend without disrupting Monday operations.',
    actions: [
      'Coordinated logistics and staging of new units.',
      'Performed disk imaging and data migration using standardized ISOs.',
      'Cable management and peripheral testing post-installation.'
    ],
    tools: ['Clonezilla', 'Cable Management', 'Asset Tagging'],
    outcome: '100% successful deployment with zero downtime for Monday start.'
  },
  {
    id: 'm365-setup',
    title: 'M365 & User Administration',
    category: 'Cloud Fundamentals',
    description: 'Secure tenant configuration and user onboarding.',
    image: 'https://robohash.org/M365UserAdministration?set=set1&bgset=bg1&size=600x600',
    problem: 'Inconsistent user permissions and security gaps in existing AD setup.',
    actions: [
      'Audited Active Directory groups and cleaned up stale accounts.',
      'Configured MFA enforcement for all users.',
      'Streamlined onboarding scripts for new hires.'
    ],
    tools: ['Azure AD', 'Microsoft 365 Admin', 'PowerShell'],
    outcome: 'Improved security score by 40 points and reduced onboarding time to 15 mins.',
    link: 'https://microsoft.com'
  },
  {
    id: 'asset-compliance',
    title: 'Asset Inventory & SLA Compliance',
    category: 'IT Management',
    description: 'Tracking system for hardware lifecycle management.',
    image: 'https://robohash.org/AssetInventorySLACompliance?set=set1&bgset=bg1&size=600x600',
    problem: 'Lost track of valuable hardware assets and warranty expirations.',
    actions: [
      'Deployed Snipe-IT for asset tracking.',
      'Barcoded all physical equipment.',
      'Set up automated alerts for warranty expiration.'
    ],
    tools: ['Snipe-IT', 'Excel', 'Barcode Scanner'],
    outcome: ' recovered $5k in lost assets and ensured 100% SLA compliance.'
  },
  {
    id: 'solution-edu',
    title: 'Solution Education Platform',
    category: 'Web Design',
    description: 'Educational portal for solutioneducation.net.',
    image: 'https://robohash.org/SolutionEducationPlatform?set=set1&bgset=bg1&size=600x600',
    problem: 'Existing site was non-responsive and difficult to navigate for students.',
    actions: [
      'Redesigned UI using mobile-first principles.',
      'Integrated student login portal.',
      'Optimized load times for low-bandwidth regions.'
    ],
    tools: ['WordPress', 'CSS3', 'PHP'],
    outcome: 'Increased student engagement time by 50%.',
    link: 'https://solutioneducation.net'
  },
  {
    id: 'tutoring-sys',
    title: 'Tutoring Workflow System',
    category: 'Systems Support',
    description: 'Scheduling and resource management for SEN tutoring.',
    image: 'https://robohash.org/TutoringWorkflowSystem?set=set1&bgset=bg1&size=600x600',
    problem: 'Manual scheduling led to conflicts and missed sessions.',
    actions: [
      'Integrated calendar API for automated booking.',
      'Created a digital repository for teaching materials.',
      'Set up automated reminders for students and parents.'
    ],
    tools: ['Google Workspace', 'Zapier', 'Notion'],
    outcome: 'Eliminated scheduling conflicts and improved session attendance.'
  }
];

export const SERVICES: Service[] = [
  {
    id: 'desktop-support',
    title: 'Desktop & End-User Support',
    icon: 'Monitor',
    description: 'Rapid troubleshooting for hardware, software, and peripheral issues. Remote or on-site resolution.'
  },
  {
    id: 'field-support',
    title: 'On-Site Field Operations',
    icon: 'Server',
    description: 'Physical installation, cable management, hardware swaps, and hands-on maintenance.'
  },
  {
    id: 'network',
    title: 'Network Troubleshooting',
    icon: 'Wifi',
    description: 'Connectivity diagnosis, router configuration, and basic switching support (CCNA level).'
  },
  {
    id: 'cloud',
    title: 'M365 & Cloud Admin',
    icon: 'Cloud',
    description: 'User management, Active Directory basics, and cloud migration assistance (Azure/AWS).'
  },
  {
    id: 'web',
    title: 'Web Design & Consulting',
    icon: 'Code',
    description: 'Modern, responsive web development and technical consultation for small businesses.'
  }
];

export const JOBS: Job[] = [
  {
    id: 'axiom',
    role: 'IT Support / Logistics',
    company: 'Axiom',
    period: 'April 2024 – Present',
    description: [
      'Provided Tier 1/2 technical support for enterprise environments.',
      'Managed hardware inventory and logistics for field deployments.',
      'Resolved connectivity and software issues remotely.'
    ]
  },
  {
    id: 'quisqueya',
    role: 'Admin Support',
    company: 'Quisqueya University',
    period: '2023 – 2024',
    description: [
      'Maintained administrative digital records and databases.',
      'Supported faculty with technical equipment setup.'
    ]
  },
  {
    id: 'freelance',
    role: 'Web Developer',
    company: 'Freelance',
    period: '2020 – Present',
    description: [
      'Designed and deployed custom websites for clients.',
      'Provided ongoing maintenance and technical SEO.'
    ]
  }
];