import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import {
  Lock,
  Mail,
  Shield,
  User as UserIcon,
  UserPlus,
  ArrowRight,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  ShoppingBag,
  Truck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthPromptModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalIntent, handleAuthSuccess } = useCart();
  const { loginWithUser } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const getModalTitle = () => {
    switch (authModalIntent) {
      case 'cart':
        return 'Sign In to Access Your Cart';
      case 'tracking':
        return 'Sign In to View Delivery Tracking';
      case 'add_to_cart':
        return 'Sign In to Save to Cart';
      default:
        return 'Customer Sign In Required';
    }
  };

  const getModalDescription = () => {
    switch (authModalIntent) {
      case 'cart':
        return 'Please sign in or create an account to view and manage your bespoke vehicle modifications.';
      case 'tracking':
        return 'Please sign in or create an account to track your vehicle delivery, assigned VIN, and handover dates.';
      case 'add_to_cart':
        return 'Sign in or create an account to save this custom vehicle build directly into your customer account.';
      default:
        return 'Each customer account securely stores and displays their own cart and vehicle deliveries.';
    }
  };

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.auth.login(email.trim(), password);
      if (res.success && res.user) {
        loginWithUser(res.user, res.token, true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00F0FF', '#38BDF8', '#FFFFFF'],
        });
        handleAuthSuccess();
      } else {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication request failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !regEmail || !regPassword) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'Member';

    try {
      const res = await api.auth.register({
        fullName,
        firstName,
        lastName,
        email: regEmail.trim(),
        password: regPassword,
        roleName: 'CUSTOMER',
        rememberMe: true,
      });
      if (res.success && res.user) {
        loginWithUser(res.user, res.token, true);
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00F0FF', '#10B981', '#FFFFFF'],
        });
        handleAuthSuccess();
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg bg-[#0C0E14] border border-white/15 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col relative font-sans text-white">
        {/* Glow Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-[#11141D]/60">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              {authModalIntent === 'cart' ? (
                <ShoppingBag className="w-6 h-6 text-[#00F0FF]" />
              ) : authModalIntent === 'tracking' ? (
                <Truck className="w-6 h-6 text-[#00F0FF]" />
              ) : (
                <Lock className="w-6 h-6 text-[#00F0FF]" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#00F0FF] font-bold">
                  AUTHENTICATION REQUIRED
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
              </div>
              <h2 className="text-xl font-display font-black text-white tracking-wide">
                {getModalTitle()}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 font-mono leading-relaxed">
                {getModalDescription()}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-3 bg-black/40 border-b border-white/10 flex space-x-2">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
              mode === 'signin'
                ? 'bg-[#00F0FF] text-black shadow-md shadow-[#00F0FF]/25'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
              mode === 'register'
                ? 'bg-[#00F0FF] text-black shadow-md shadow-[#00F0FF]/25'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="customer@autoengine.io or username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#11141D] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#00F0FF] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#11141D] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#00F0FF] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#38BDF8] text-black font-extrabold text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-[#00F0FF]/25 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <span className="font-mono text-xs">AUTHENTICATING...</span>
                ) : (
                  <>
                    <span>Sign In & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Hayes"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#11141D] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-[#11141D] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#00F0FF] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Create Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-[#11141D] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#00F0FF] font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#38BDF8] text-black font-extrabold text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-[#00F0FF]/25 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <span className="font-mono text-xs">CREATING ACCOUNT...</span>
                ) : (
                  <>
                    <span>Register Customer Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;
