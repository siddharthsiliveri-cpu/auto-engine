import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Magnetic } from '../components/core/magnetic';
import api from '../services/api';
import {
  Lock,
  Mail,
  Shield,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Command,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginPageProps {
  onSuccess: (targetTab?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { switchPersona } = useAuth();
  const [email, setEmail] = useState('engineer@autoengine.io');
  const [password, setPassword] = useState('AutoEngine2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const personas = [
    {
      role: 'ENGINEER',
      name: 'Dr. Sarah Chen',
      title: 'Lead Powertrain Engineer',
      email: 'engineer@autoengine.io',
      icon: Zap,
      accent: '#00F0FF',
    },
    {
      role: 'ADMIN',
      name: 'Elena Vance',
      title: 'Chief Technology Officer',
      email: 'admin@autoengine.io',
      icon: Shield,
      accent: '#A855F7',
    },
    {
      role: 'PROJECT_MANAGER',
      name: 'Marcus Thorne',
      title: 'VP Vehicle Programs',
      email: 'pm@autoengine.io',
      icon: Command,
      accent: '#3B82F6',
    },
    {
      role: 'DESIGNER',
      name: 'Julian Rossi',
      title: 'Head of Exterior CMF',
      email: 'designer@autoengine.io',
      icon: Sparkles,
      accent: '#EC4899',
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.auth.login(email, password);
      if (res.success) {
        localStorage.setItem('autoengine_token', res.token);
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00F0FF', '#3B82F6', '#FFFFFF'],
        });
        setTimeout(() => {
          onSuccess('home');
        }, 500);
      } else {
        setErrorMessage(res.message || 'Authentication failed');
      }
    } catch (err: any) {
      // Offline fallback
      onSuccess('home');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = async (p: typeof personas[0]) => {
    setEmail(p.email);
    setPassword('AutoEngine2026!');
    setIsLoading(true);
    try {
      await switchPersona(p.role as any);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: [p.accent, '#FFFFFF'],
      });
      setTimeout(() => {
        onSuccess('home');
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center px-4 py-16 overflow-hidden">
      {/* Cinematic Background Lighting */}
      <div className="absolute inset-0 technical-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 radial-vignette pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#00F0FF]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#0070F3]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-xl mx-auto space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full glass-panel border border-white/10 text-xs font-mono text-[#00F0FF]">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span>AUTOMOTIVE DIGITAL ENGINEERING PLATFORM</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white uppercase">
            AUTOENGINE
          </h1>

          <p className="text-xs md:text-sm text-neutral-400 font-mono tracking-widest uppercase">
            Design the Future of Mobility.
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-display font-bold text-white tracking-wide">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Authenticate with your engineering credentials or choose a test persona below.
            </p>
          </div>

          {/* 1-Click Engineering Personas */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
              Quick Role Authentication (RBAC)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {personas.map((p) => {
                const Icon = p.icon;
                const isSelected = email === p.email;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-white/10 border-white/40 shadow-lg'
                        : 'bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="w-3.5 h-3.5" style={{ color: p.accent }} />
                      <span className="text-xs font-bold text-white group-hover:text-[#00F0FF] transition-colors truncate">
                        {p.name}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400 truncate">
                      {p.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                ENGINEERING EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#00F0FF] font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:border-[#00F0FF] font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Magnetic Submit Button */}
            <div className="pt-2">
              <Magnetic intensity={0.25} range={70} className="w-full">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#00F0FF] text-black hover:bg-white font-bold text-xs uppercase py-3.5 rounded-2xl transition-all shadow-xl shadow-[#00F0FF]/25 flex items-center justify-center space-x-2"
                >
                  <span>{isLoading ? 'Authenticating...' : 'Enter AutoEngine Platform'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Magnetic>
            </div>
          </form>

          {/* Guest / Direct Entry Option */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onSuccess('home')}
              className="text-xs font-mono text-neutral-400 hover:text-[#00F0FF] transition-colors inline-flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Or explore platform without signing in &rarr;</span>
            </button>
          </div>
        </div>

        {/* Security & Database Status Footer */}
        <div className="text-[11px] font-mono text-neutral-500 text-center space-y-1">
          <div>BCSE307L DATABASE SYSTEMS • 19 RELATIONAL TABLES IN 3NF</div>
          <div className="text-neutral-600">POSTGRESQL • JWT • BCRYPT ENCRYPTION</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
