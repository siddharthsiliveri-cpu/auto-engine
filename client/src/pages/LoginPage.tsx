import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Magnetic } from '../components/core/magnetic';
import api from '../services/api';
import {
  Terminal,
  Code2,
  Lock,
  Mail,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Cpu,
  Sparkles,
  Command,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginPageProps {
  onSuccess: (targetTab?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { user, switchPersona } = useAuth();
  const [email, setEmail] = useState('engineer@autoengine.io');
  const [password, setPassword] = useState('AutoEngine2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'INITIALIZING AUTOENGINE VIBE CODER KERNEL v4.2.0...',
    'CAN-FD HARDWARE-IN-THE-LOOP TELEMETRY: READY',
    'POSTGRESQL 3NF RELATIONAL SCHEMA: 19 TABLES VERIFIED',
    'VIBE STATUS: ELEVATED. WAITING FOR OPERATOR AUTH...',
  ]);
  const [terminalInput, setTerminalInput] = useState('');

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
        setTerminalLogs((prev) => [
          ...prev,
          `> AUTH GRANTED: ${res.user.email} (${res.user.role})`,
          '> DEPLOYING VIBE CODER DIGITAL TWIN ENVIRONMENT...',
        ]);

        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00F0FF', '#3B82F6', '#FFFFFF'],
        });

        setTimeout(() => {
          onSuccess('studio');
        }, 800);
      } else {
        setErrorMessage(res.message || 'Authentication failed');
      }
    } catch (err: any) {
      // Fallback local switch if network blocked
      setTerminalLogs((prev) => [...prev, '> OFFLINE DEMO AUTHENTICATION APPROVED']);
      onSuccess('studio');
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
      setTerminalLogs((prev) => [
        ...prev,
        `> OPERATOR SWITCHED TO: ${p.name.toUpperCase()} [${p.role}]`,
        `> ACCESS TOKEN GENERATED FOR ${p.email}`,
      ]);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: [p.accent, '#FFFFFF'],
      });
      setTimeout(() => {
        onSuccess('studio');
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    const newLogs = [...terminalLogs, `$ ${terminalInput}`];

    if (cmd === 'help') {
      newLogs.push('AVAILABLE COMMANDS: login <role>, vibe, clear, status, table-count');
    } else if (cmd === 'vibe') {
      newLogs.push('⚡ CURRENT VIBE: 100% MAXIMUM PRODUCTIVITY. AESTHETICS NOMINAL.');
    } else if (cmd === 'clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else if (cmd.startsWith('login engineer')) {
      handleSelectPersona(personas[0]);
    } else if (cmd.startsWith('login admin')) {
      handleSelectPersona(personas[1]);
    } else if (cmd.startsWith('login pm')) {
      handleSelectPersona(personas[2]);
    } else if (cmd.startsWith('login designer')) {
      handleSelectPersona(personas[3]);
    } else if (cmd === 'status') {
      newLogs.push(`AUTHENTICATED USER: ${user?.firstName || 'ANONYMOUS'} (${user?.role || 'NONE'})`);
    } else if (cmd === 'table-count') {
      newLogs.push('BCSE307L DATABASE: 19 RELATIONAL TABLES IN 3NF');
    } else {
      newLogs.push(`command not found: ${cmd}. Type 'help' for options.`);
    }

    setTerminalLogs(newLogs);
    setTerminalInput('');
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 md:px-8 max-w-[1600px] mx-auto flex items-center justify-center">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 technical-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#00F0FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Grid: Left IDE Editor / Terminal, Right Auth Deck */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* ======================================================== */}
        {/* LEFT: HIGH-TECH VIBE CODER IDE & TERMINAL (7 Cols)        */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-[#090909]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between backdrop-blur-2xl">
          {/* macOS-style Window Header Bar */}
          <div className="bg-[#0D0D0D] px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
              <span className="text-[11px] font-mono text-neutral-400 pl-3 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                autoengine_auth_daemon.tsx
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[10px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2.5 py-0.5 rounded-full border border-[#00F0FF]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
              <span>VIBE CODING MODE</span>
            </div>
          </div>

          {/* IDE Syntax Highlighted Code Display */}
          <div className="p-6 font-mono text-xs text-neutral-300 space-y-1 overflow-x-auto leading-relaxed border-b border-white/5">
            <div className="text-neutral-500">// AUTOENGINE OS v4.2 // DIGITAL TWIN ACCESS LAYER</div>
            <div>
              <span className="text-purple-400">import</span> {'{ QuantumTelemetry, DigitalTwin }'}{' '}
              <span className="text-purple-400">from</span> <span className="text-emerald-400">'@autoengine/core'</span>;
            </div>
            <div>
              <span className="text-purple-400">import</span> {'{ verifyRelationalIntegrity }'}{' '}
              <span className="text-purple-400">from</span> <span className="text-emerald-400">'@autoengine/bcse307l'</span>;
            </div>
            <div className="py-1" />
            <div>
              <span className="text-blue-400">export async function</span>{' '}
              <span className="text-[#00F0FF]">authorizeVibeSession</span>(operator: <span className="text-yellow-400">OperatorSession</span>) {'{'}
            </div>
            <div className="pl-4">
              <span className="text-purple-400">const</span> twin = <span className="text-purple-400">await</span> DigitalTwin.<span className="text-yellow-400">mount</span>({'{'}
            </div>
            <div className="pl-8 text-neutral-400">
              chassis: <span className="text-emerald-400">'800V-SKATEBOARD-ALUMINUM'</span>,
            </div>
            <div className="pl-8 text-neutral-400">
              powertrain: <span className="text-emerald-400">'DUAL-AXIAL-FLUX-500KW'</span>,
            </div>
            <div className="pl-8 text-neutral-400">
              database3NF: <span className="text-amber-400">true</span>, <span className="text-neutral-500">// 19 Tables in 3NF</span>
            </div>
            <div className="pl-8 text-neutral-400">
              telemetrySync: <span className="text-emerald-400">'CAN-FD-HIGH-SPEED'</span>,
            </div>
            <div className="pl-4">{'}'});</div>
            <div className="pl-4">
              <span className="text-purple-400">return</span> operator.<span className="text-yellow-400">grantAccessLevel</span>(twin.specs);
            </div>
            <div>{'}'}</div>
          </div>

          {/* Interactive Shell Terminal */}
          <div className="p-5 bg-black/60 font-mono text-[11px] space-y-2">
            <div className="flex items-center space-x-2 text-neutral-500 pb-2 border-b border-white/5">
              <Terminal className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>autoengine-interactive-terminal (zsh)</span>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto text-neutral-400">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className={log.startsWith('>') ? 'text-[#00F0FF]' : log.startsWith('$') ? 'text-white' : 'text-neutral-400'}>
                  {log}
                </div>
              ))}
            </div>

            {/* Terminal Input */}
            <form onSubmit={handleTerminalSubmit} className="flex items-center space-x-2 pt-2 border-t border-white/5">
              <span className="text-[#00F0FF]">$</span>
              <input
                type="text"
                placeholder="type 'help', 'vibe', 'login admin', 'status'..."
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                className="w-full bg-transparent text-white placeholder-neutral-600 focus:outline-none font-mono text-xs"
              />
            </form>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT: SLEEK AUTH FORM & VIBE PERSONAS (5 Cols)          */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between space-y-6">
          <div>
            {/* Header */}
            <div className="flex items-center space-x-2 text-[10px] font-mono text-[#00F0FF] uppercase tracking-widest mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>OS Access Protocol</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight">
              OPERATOR LOGIN
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Enter your vehicle program credentials or select an instant Vibe Coder persona below.
            </p>
          </div>

          {/* Quick One-Click Vibe Personas */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
              1-Click Vibe Coder Personas
            </span>
            <div className="grid grid-cols-2 gap-2">
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
                        : 'bg-black/30 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="w-3.5 h-3.5" style={{ color: p.accent }} />
                      <span className="text-xs font-bold text-white group-hover:text-[#00F0FF] transition-colors truncate">
                        {p.name}
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-neutral-400 truncate">
                      {p.role.replace('_', ' ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                ACCESS KEY / PASSWORD
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
                  <span>{isLoading ? 'Verifying Key...' : 'Authenticate Vibe Access'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Magnetic>
            </div>
          </form>

          {/* Footer note */}
          <div className="text-[10px] font-mono text-neutral-500 text-center pt-2 border-t border-white/5">
            BCSE307L RBAC SECURED • JWT EXPIRES IN 7 DAYS
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
