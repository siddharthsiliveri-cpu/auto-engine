import React, { useState, useEffect } from 'react';
import { Shield, ChevronDown, Check, Zap, Menu, X, Database, Layers, Compass, Sliders, Activity, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Magnetic } from '../core/magnetic';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, switchPersona } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Platform', icon: Compass },
    { id: 'studio', label: '3D Studio', icon: Sliders },
    { id: 'digital-twin', label: 'Digital Twin', icon: Activity },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'components', label: 'Components', icon: Zap },
    { id: 'database', label: 'Engineering Hub', icon: Database },
  ];

  const roles = [
    { role: 'ADMIN', title: 'Elena Vance', desc: 'Chief Technology Officer (Full Access)' },
    { role: 'PROJECT_MANAGER', title: 'Marcus Thorne', desc: 'VP Vehicle Programs (Milestones & Teams)' },
    { role: 'ENGINEER', title: 'Dr. Sarah Chen', desc: 'Lead Powertrain Engineer (Specs & Reviews)' },
    { role: 'DESIGNER', title: 'Julian Rossi', desc: 'Head of Exterior CMF (3D & Studio)' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-4 pointer-events-none">
      <nav
        className={`pointer-events-auto w-full max-w-7xl transition-all duration-300 rounded-full px-5 py-2.5 flex items-center justify-between ${
          isScrolled
            ? 'bg-[#070707]/85 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80'
            : 'bg-[#0A0A0A]/40 backdrop-blur-md border border-white/5'
        }`}
      >
        {/* Left: Brand Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#0070F3] p-[1.5px] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#050505] rounded-full flex items-center justify-center">
              <span className="text-xs font-black tracking-widest text-[#00F0FF]">AE</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold tracking-[0.2em] text-sm text-white flex items-center gap-1.5">
              AUTOENGINE
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
            </span>
            <span className="text-[8px] font-mono tracking-widest text-neutral-400 uppercase -mt-0.5">
              Automotive OS
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-1 border border-white/5 rounded-full px-3 py-1 bg-black/30">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 flex items-center space-x-1.5 ${
                  isActive
                    ? 'text-white bg-white/10 shadow-inner'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00F0FF]' : 'text-neutral-500'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-[#00F0FF] rounded-full shadow-[0_0_8px_#00F0FF]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Login, Persona Switcher & CTA */}
        <div className="flex items-center space-x-3">
          {/* Quick Login Link */}
          <button
            onClick={() => setActiveTab('login')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-mono text-xs transition-all ${
              activeTab === 'login'
                ? 'bg-[#00F0FF] text-black font-bold shadow-lg shadow-[#00F0FF]/30'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white'
            }`}
          >
            <Lock className="w-3 h-3 text-[#00F0FF]" />
            <span>Login</span>
          </button>

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              className="flex items-center space-x-2 bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 rounded-full px-3 py-1.5 text-xs text-neutral-300 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                {user?.role.replace('_', ' ')}
              </span>
              <span className="text-white font-medium text-xs truncate max-w-[100px]">
                {user?.firstName}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </button>

            {isPersonaMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0B0B0B] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-2xl">
                <div className="px-3 py-2 border-b border-white/5 mb-1 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#00F0FF]">
                      Test Personas (RBAC)
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Switch between roles to test authorized workflows.
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchPersona(r.role as any);
                        setIsPersonaMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        user?.role === r.role
                          ? 'bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-white'
                          : 'hover:bg-white/5 text-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          {r.title}
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-neutral-400">
                            {r.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">{r.desc}</div>
                      </div>
                      {user?.role === r.role && <Check className="w-4 h-4 text-[#00F0FF]" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-1 border-t border-white/5">
                  <button
                    onClick={() => {
                      setActiveTab('login');
                      setIsPersonaMenuOpen(false);
                    }}
                    className="w-full text-center py-1.5 text-[11px] font-mono text-[#00F0FF] hover:underline flex items-center justify-center gap-1"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Open Full Login Page</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Studio CTA with Magnetic effect */}
          <Magnetic intensity={0.25} range={70}>
            <button
              onClick={() => setActiveTab(activeTab === 'studio' ? 'projects' : 'studio')}
              className="bg-white text-black hover:bg-[#00F0FF] hover:text-black font-semibold text-xs tracking-wider uppercase px-4 py-2 rounded-full transition-all duration-300 shadow-lg shadow-white/5"
            >
              {activeTab === 'studio' ? 'Dashboard' : 'Configure'}
            </button>
          </Magnetic>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-4 top-20 bg-[#0B0B0B]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto z-50">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                setActiveTab('login');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30"
            >
              <Lock className="w-4 h-4" />
              <span>Login / Switch Role</span>
            </button>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    activeTab === item.id
                      ? 'bg-white/10 text-[#00F0FF] border border-[#00F0FF]/30'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
