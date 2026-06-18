import { motion } from 'motion/react';
import { Settings, User, Cpu, ShieldCheck } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUserEmail?: string;
  onLogout?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  currentUserEmail = 'agent.lenovo@lenovo.com',
  onLogout,
}: HeaderProps) {
  const mainTabs: TabType[] = [
    'DASHBOARD',
    'TICKETS',
    'CUSTOMERS',
    'PRODUCTS',
    'WARRANTY',
    'AMC',
    'FEEDBACK',
    'ANALYTICS',
    'AI MONITORING',
  ];

  return (
    <header className="w-full bg-white border-b-2 border-black sticky top-0 z-50 select-none">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Slogan */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('DASHBOARD')}>
          <div className="bg-black text-white px-2 py-1 flex items-center space-x-1 border border-black font-mono font-bold tracking-tighter">
            <ShieldCheck className="w-4 h-4 text-white animate-pulse" />
            <span className="text-sm">LENOVO</span>
          </div>
          <span className="font-sans font-black tracking-widest text-[#000000] text-lg uppercase transition-colors hover:text-neutral-800">
            SUPPORT
          </span>
          <span className="hidden md:inline-block border-l-2 border-neutral-300 pl-3 text-neutral-400 text-xs font-mono tracking-widest">
            ENTERPRISE CONSOLE
          </span>
        </div>

        {/* Action icons on dynamic right */}
        <div className="flex items-center space-x-2">
          {/* AI Monitoring Shortcut */}
          <button
            onClick={() => setActiveTab('AI MONITORING')}
            className={`p-2 transition-all flex items-center space-x-1.5 border rounded-none text-xs font-mono ${
              activeTab === 'AI MONITORING'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black hover:bg-neutral-50 border-neutral-200'
            }`}
            title="AI Routing Monitor"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI AUTO-ROUTER: ACTIVE</span>
          </button>

          {/* Settings / Gear icon - points directly to ADMIN & SETTINGS */}
          <button
            onClick={() => setActiveTab('ADMIN & SETTINGS')}
            className={`p-2 border rounded-none transition-all ${
              activeTab === 'ADMIN & SETTINGS'
                ? 'bg-black text-white border-black'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-300'
            }`}
            aria-label="Admin Settings"
            title="Admin & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User profile identifier (minimalist) */}
          <div className="flex items-center space-x-2 border border-neutral-300 px-2.5 py-1.5 bg-neutral-50">
            <User className="w-4 h-4 text-neutral-600" />
            <span className="hidden lg:inline text-xs font-mono font-bold text-neutral-800">
              {currentUserEmail}
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-1 text-[9px] font-mono font-bold text-red-600 hover:text-red-800 bg-white border border-neutral-200 hover:border-red-500 px-2 py-0.5 transition-all text-[9.5px]"
                title="Secure Sign Out"
              >
                [SIGN OUT]
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation Row - matching the exact wireframe style in the screenshots */}
      <div className="w-full bg-neutral-50 border-t border-neutral-200 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1">
          {mainTabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-3.5 px-4 font-mono text-xs font-bold tracking-normal border-b-2 transition-all shrink-0 uppercase ${
                  isActive
                    ? 'text-black border-black bg-white font-black'
                    : 'text-neutral-500 border-transparent hover:text-black hover:bg-neutral-100'
                }`}
              >
                {tab}
                {isActive && (
                  <motion.div
                    layoutId="activeSubTabIndicator"
                    className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-black"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

          {/* Settings Tab explicitly shown as secondary tab on mobile/tablet */}
          <button
            onClick={() => setActiveTab('ADMIN & SETTINGS')}
            className={`relative py-3.5 px-4 font-mono text-xs font-bold tracking-normal border-b-2 transition-all shrink-0 uppercase ml-auto ${
              activeTab === 'ADMIN & SETTINGS'
                ? 'text-black border-black bg-white font-black'
                : 'text-neutral-500 border-transparent hover:text-black hover:bg-neutral-100'
            }`}
          >
            ADMIN & SETTINGS
            {activeTab === 'ADMIN & SETTINGS' && (
              <motion.div
                layoutId="activeSubTabIndicator"
                className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-black"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
