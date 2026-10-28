import React, { useState, useEffect } from 'react';
import {
  Shield,
  ChevronDown,
  Zap,
  Menu,
  X,
  Database,
  Layers,
  Compass,
  Sliders,
  Activity,
  Lock,
  LogIn,
  LogOut,
  User as UserIcon,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Magnetic } from '../core/magnetic';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, isGuest, logout } = useAuth();
  const { totalCartItems, setIsCartOpen, openTracking } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  // Hide Navbar completely on Login Page as requested
  if (activeTab === 'login') {
    return null;
  }

  // NAVIGATION ITEMS:
  // ADMIN: keep projects, components, orders & deliveries, engineering hub
  // CUSTOMER: keep platform, studio, digital-twin, projects, components
  const navItems = isAdmin
    ? [
        { id: 'projects', label: 'Projects', icon: Layers },
        { id: 'components', label: 'Components', icon: Zap },
        { id: 'admin-orders', label: 'Orders & Deliveries', icon: Truck },
        { id: 'database', label: 'Engineering Hub', icon: Database },
      ]
    : [
        { id: 'home', label: 'Platform', icon: Compass },
        { id: 'studio', label: '3D Studio', icon: Sliders },
        { id: 'digital-twin', label: 'Digital Twin', icon: Activity },
        { id: 'projects', label: 'Projects', icon: Layers },
        { id: 'components', label: 'Components', icon: Zap },
      ];

  const handleLogoClick = () => {
    if (isAdmin) {
      setActiveTab('projects');
    } else {
      setActiveTab('home');
    }
  };

  const handleLogout = () => {
    logout();
    setIsAccountMenuOpen(false);
    setActiveTab('login');
  };

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
          onClick={handleLogoClick}
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
              {isAdmin ? 'Admin Console' : 'Automotive OS'}
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links (Role-Based) */}
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
                <Icon className={`w-3.5 h-3.5 ${isActive ? (isAdmin ? 'text-[#00F0FF]' : 'text-[#38BDF8]') : 'text-neutral-500'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full ${
                      isAdmin ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Login, Account Indicator & Switcher */}
        <div className="flex items-center space-x-2.5">

          {/* Direct Login Page Link if not on login page */}
          <button
            onClick={() => setActiveTab('login')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-mono text-xs transition-all ${
              activeTab === 'login'
                ? 'bg-[#00F0FF] text-black font-bold shadow-lg shadow-[#00F0FF]/30'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white'
            }`}
          >
            <Lock className="w-3 h-3 text-[#00F0FF]" />
            <span>{user ? 'Portals' : 'Sign In / Register'}</span>
          </button>

          {/* Delivery Tracking Button */}
          <button
            onClick={() => openTracking()}
            className="relative p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-200 hover:text-white transition-all flex items-center justify-center group"
            title="Track Vehicle Delivery & Status"
          >
            <Truck className="w-4 h-4 text-[#00F0FF] group-hover:scale-110 transition-transform" />
          </button>

          {/* Cart Option Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-200 hover:text-white transition-all flex items-center justify-center group"
            title="Open Engineering Cart"
          >
            <ShoppingBag className="w-4 h-4 text-[#00F0FF] group-hover:scale-110 transition-transform" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#00F0FF] text-black font-bold text-[10px] font-mono flex items-center justify-center px-1 shadow-[0_0_8px_#00F0FF]">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* User Account / Role Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className={`flex items-center space-x-2 rounded-full px-3 py-1.5 text-xs transition-all border ${
                  isAdmin
                    ? 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-white'
                    : 'bg-[#38BDF8]/10 border-[#38BDF8]/30 text-white'
                }`}
              >
                {isAdmin ? (
                  <Shield className="w-3.5 h-3.5 text-[#00F0FF]" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
                )}
                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-300">
                  {user.role}
                </span>
                <span className="text-white font-semibold text-xs truncate max-w-[90px]">
                  {user.firstName || 'User'}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0B0B0B] border border-white/10 rounded-2xl p-3 shadow-2xl z-50 backdrop-blur-2xl space-y-3">
                  <div className="border-b border-white/5 pb-2.5">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-0.5">
                      Active Signed-In Account
                    </div>
                    <div className="font-bold text-sm text-white flex items-center justify-between">
                      <span>{user.firstName} {user.lastName}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        isAdmin
                          ? 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF]'
                          : 'bg-[#38BDF8]/10 border-[#38BDF8]/30 text-[#38BDF8]'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                      {user.email}
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-400 px-1">
                    {isAdmin ? (
                      <div className="space-y-1">
                        <div className="text-[#00F0FF] font-semibold">Admin Access Scope:</div>
                        <div>• Projects Portfolio</div>
                        <div>• Component Library</div>
                        <div>• Engineering Hub (Visitor Traffic)</div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-[#38BDF8] font-semibold">Customer Access Scope:</div>
                        <div>• Vehicle Platform & Digital Twin</div>
                        <div>• 3D Studio Customizer</div>
                        <div>• Automotive Projects</div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        setActiveTab('login');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-between transition-colors font-mono"
                    >
                      <span>Switch Login Portal</span>
                      <LogIn className="w-3.5 h-3.5 text-[#00F0FF]" />
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-between transition-colors font-mono"
                    >
                      <span>Sign Out</span>
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Quick CTA with Magnetic effect */}
          <Magnetic intensity={0.25} range={70}>
            <button
              onClick={() => {
                if (isAdmin) {
                  setActiveTab(activeTab === 'database' ? 'projects' : 'database');
                } else {
                  setActiveTab(activeTab === 'studio' ? 'home' : 'studio');
                }
              }}
              className="bg-white text-black hover:bg-[#00F0FF] hover:text-black font-semibold text-xs tracking-wider uppercase px-4 py-2 rounded-full transition-all duration-300 shadow-lg shadow-white/5"
            >
              {isAdmin ? (activeTab === 'database' ? 'Projects' : 'Hub Stats') : (activeTab === 'studio' ? 'Platform' : 'Configure')}
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
              <span>Switch Portal / Login</span>
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
