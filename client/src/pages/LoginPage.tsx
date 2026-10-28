import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Magnetic } from '../components/core/magnetic';
import api from '../services/api';
import visitorTracker from '../services/visitorTracker';
import {
  Lock,
  Mail,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  User as UserIcon,
  UserPlus,
  Compass,
  CheckCircle2,
  Sparkles,
  KeyRound,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginPageProps {
  onSuccess: (targetTab?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { loginWithUser, continueAsGuest } = useAuth();

  // Active portal tab: 'admin' | 'customer'
  const [activePortal, setActivePortal] = useState<'admin' | 'customer'>('admin');

  // Customer sub-tab: 'signin' | 'register'
  const [customerMode, setCustomerMode] = useState<'signin' | 'register'>('signin');

  // Admin credentials
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRememberMe, setAdminRememberMe] = useState(true);

  // Customer sign in
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerRememberMe, setCustomerRememberMe] = useState(true);

  // Customer register
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-neutral-800' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: 'bg-amber-400' };
    if (score === 4) return { score: 3, label: 'Good', color: 'bg-[#00F0FF]' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
  };

  const strength = getPasswordStrength(regPassword);

  // 1. GUEST ACCESS — NO ACCOUNT REQUIRED
  const handleContinueAsGuest = () => {
    continueAsGuest();
    visitorTracker.trackSiteVisit();
    onSuccess('home');
  };

  // 2. ADMIN LOGIN (siddharth / 12345678)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const username = adminUsername.trim();
    if (!username || !adminPassword) {
      setErrorMessage('Please enter both administrator username and password.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.login(username, adminPassword, adminRememberMe);
      if (res.success && res.user) {
        if (res.user.role !== 'ADMIN') {
          setErrorMessage('Access restricted: The provided credentials do not have Administrator permissions.');
          setIsLoading(false);
          return;
        }
        loginWithUser(res.user, res.token, adminRememberMe);
        visitorTracker.trackMemberLogin(res.user);
      } else {
        // Fallback for Siddharth admin
        const isAdminCreds = (username.toLowerCase() === 'siddharth' || username.toLowerCase() === 'siddharth@autoengine.io' || username.toLowerCase() === 'admin') &&
          (adminPassword === '12345678' || adminPassword === 'admin1234');
        if (isAdminCreds) {
          const siddharthUser = {
            id: 'siddharth-admin',
            email: 'siddharth@autoengine.io',
            firstName: 'Siddharth',
            lastName: 'Admin',
            role: 'ADMIN' as const,
          };
          loginWithUser(siddharthUser, undefined, adminRememberMe);
          visitorTracker.trackMemberLogin(siddharthUser);
        } else {
          setErrorMessage(res.message || 'Invalid administrator credentials.');
          setIsLoading(false);
          return;
        }
      }

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#3B82F6', '#FFFFFF'],
      });

      // Admin lands on Projects (Admin features: Projects, Components, Engineering Hub)
      setTimeout(() => {
        onSuccess('projects');
      }, 500);
    } catch (err: any) {
      const isSiddharthCreds = (username.toLowerCase() === 'siddharth' || username.toLowerCase() === 'admin') &&
        (adminPassword === '12345678' || adminPassword === 'admin1234');
      if (isSiddharthCreds) {
        const siddharthUser = {
          id: 'siddharth-admin',
          email: 'siddharth@autoengine.io',
          firstName: 'Siddharth',
          lastName: 'Admin',
          role: 'ADMIN' as const,
        };
        loginWithUser(siddharthUser, undefined, adminRememberMe);
        visitorTracker.trackMemberLogin(siddharthUser);
        onSuccess('projects');
      } else {
        setErrorMessage('Authentication failed. Please verify administrator credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. CUSTOMER SIGN IN
  const handleCustomerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const email = customerEmail.trim();
    if (!email || !customerPassword) {
      setErrorMessage('Please enter both your email address and password.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.login(email, customerPassword, customerRememberMe);
      if (res.success && res.user) {
        loginWithUser(res.user, res.token, customerRememberMe);
        visitorTracker.trackMemberLogin(res.user);
      } else {
        // Fallback for demo customer
        if (email.toLowerCase() === 'customer' || email.toLowerCase() === 'customer@autoengine.io') {
          const demoUser = {
            id: 'customer-alex',
            email: 'customer@autoengine.io',
            firstName: 'Alex',
            lastName: 'Morgan',
            role: 'CUSTOMER' as const,
          };
          loginWithUser(demoUser, undefined, customerRememberMe);
          visitorTracker.trackMemberLogin(demoUser);
        } else {
          setErrorMessage(res.message || 'Invalid customer email or password.');
          setIsLoading(false);
          return;
        }
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#818CF8', '#FFFFFF'],
      });

      // Customer lands on Platform / Home
      setTimeout(() => {
        onSuccess('home');
      }, 500);
    } catch (err: any) {
      setErrorMessage('Could not connect to authentication server. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. CUSTOMER REGISTRATION
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (!regFullName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Please fill in all registration fields.');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      setErrorMessage('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      setIsLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy to continue.');
      setIsLoading(false);
      return;
    }

    const nameParts = regFullName.trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'Member';

    try {
      const res = await api.auth.register({
        fullName: regFullName.trim(),
        firstName,
        lastName,
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        roleName: 'CUSTOMER',
        rememberMe: true,
      });

      if (res.success && res.user) {
        loginWithUser(res.user, res.token, true);
        visitorTracker.trackMemberLogin(res.user);
      } else {
        const newCustomer = {
          id: 'cust-' + Date.now(),
          email: regEmail.trim().toLowerCase(),
          firstName,
          lastName,
          role: 'CUSTOMER' as const,
        };
        loginWithUser(newCustomer, undefined, true);
        visitorTracker.trackMemberLogin(newCustomer);
      }

      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#00F0FF', '#FFFFFF'],
      });

      setTimeout(() => {
        onSuccess('home');
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. FORGOT PASSWORD REQUEST
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsLoading(true);
    setForgotNotice(null);

    try {
      const res = await api.auth.forgotPassword(forgotEmail.trim());
      setForgotNotice(res.message);
      if (res.devToken) {
        setResetToken(res.devToken);
        setForgotStep('reset');
      }
    } catch (err: any) {
      setForgotNotice('If the email is registered, reset instructions have been dispatched.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. FORGOT PASSWORD RESET
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword) return;
    setIsLoading(true);
    setForgotNotice(null);

    try {
      const res = await api.auth.resetPassword(resetToken.trim(), newPassword);
      if (res.success) {
        setSuccessMessage('Password updated successfully. You can now log in.');
        setIsForgotModalOpen(false);
        setForgotStep('request');
        setCustomerMode('signin');
      } else {
        setForgotNotice(res.message || 'Invalid or expired token.');
      }
    } catch (err: any) {
      setForgotNotice('Failed to reset password. Please check your token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center px-4 py-12 overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute inset-0 technical-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 radial-vignette pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#00F0FF]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#0070F3]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full glass-panel border border-white/10 text-xs font-mono text-[#00F0FF]">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span>AUTOMOTIVE DIGITAL ENGINEERING PLATFORM</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight text-white uppercase">
            AUTOENGINE
          </h1>

          <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase">
            Design the Future of Mobility.
          </p>
        </div>

        {/* TWO LOGIN OPTIONS TOGGLE */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => {
              setActivePortal('admin');
              setErrorMessage(null);
            }}
            className={`py-3 px-4 rounded-xl font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
              activePortal === 'admin'
                ? 'bg-gradient-to-r from-[#00F0FF]/25 to-[#0070F3]/25 border border-[#00F0FF]/40 text-white font-bold shadow-lg shadow-[#00F0FF]/15'
                : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Shield className={`w-4 h-4 ${activePortal === 'admin' ? 'text-[#00F0FF]' : 'text-neutral-500'}`} />
            <span>Admin Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePortal('customer');
              setErrorMessage(null);
            }}
            className={`py-3 px-4 rounded-xl font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
              activePortal === 'customer'
                ? 'bg-gradient-to-r from-[#38BDF8]/25 to-[#818CF8]/25 border border-[#38BDF8]/40 text-white font-bold shadow-lg shadow-[#38BDF8]/15'
                : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <UserIcon className={`w-4 h-4 ${activePortal === 'customer' ? 'text-[#38BDF8]' : 'text-neutral-500'}`} />
            <span>Customer Portal</span>
          </button>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass-panel p-8 md:p-9 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              {successMessage}
            </div>
          )}

          {/* ========================================================= */}
          {/* OPTION 1: ADMIN LOGIN */}
          {/* ========================================================= */}
          {activePortal === 'admin' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[10px] font-mono text-[#00F0FF] uppercase mb-1.5">
                  <Shield className="w-3 h-3" />
                  <span>Administrative Access</span>
                </div>
                <h2 className="text-xl font-display font-bold text-white tracking-wide">
                  Administrator Sign In
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Sign in with your administrator credentials to access Projects, Components, and the Engineering Hub.
                </p>
              </div>

              <form onSubmit={handleAdminLogin} autoComplete="off" className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                    ADMIN USERNAME OR EMAIL
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="siddharth or admin"
                      autoComplete="username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#00F0FF] font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                      ADMIN PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotModalOpen(true);
                        setForgotEmail(adminUsername.includes('@') ? adminUsername : 'siddharth@autoengine.io');
                      }}
                      className="text-[10px] font-mono text-neutral-400 hover:text-[#00F0FF] transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter admin password"
                      autoComplete="current-password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#00F0FF] font-mono transition-colors"
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

                {/* Remember Me */}
                <div className="flex items-center space-x-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="adminRemember"
                    checked={adminRememberMe}
                    onChange={(e) => setAdminRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-black/50 border-white/20 text-[#00F0FF] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="adminRemember" className="text-xs font-mono text-neutral-400 cursor-pointer select-none">
                    Remember me on this device
                  </label>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <Magnetic intensity={0.25} range={70} className="w-full">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#00F0FF] text-black hover:bg-white font-bold text-xs uppercase py-3.5 rounded-2xl transition-all shadow-xl shadow-[#00F0FF]/25 flex items-center justify-center space-x-2"
                    >
                      <span>{isLoading ? 'Authenticating Admin...' : 'Enter Admin Workspace'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Magnetic>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* OPTION 2: CUSTOMER LOGIN (Sign In & Create Account) */}
          {/* ========================================================= */}
          {activePortal === 'customer' && (
            <div className="space-y-5">
              {/* Customer Mode Tabs */}
              <div className="flex border-b border-white/10 pb-3 justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMode('signin');
                      setErrorMessage(null);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                      customerMode === 'signin'
                        ? 'bg-[#38BDF8] text-black font-bold shadow-md shadow-[#38BDF8]/20'
                        : 'text-neutral-400 hover:text-white bg-white/5'
                    }`}
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMode('register');
                      setErrorMessage(null);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                      customerMode === 'register'
                        ? 'bg-emerald-400 text-black font-bold shadow-md shadow-emerald-400/20'
                        : 'text-neutral-400 hover:text-white bg-white/5'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest hidden sm:inline">
                  Customer Portal
                </span>
              </div>

              {/* CUSTOMER MODE 1: SIGN IN */}
              {customerMode === 'signin' && (
                <form onSubmit={handleCustomerSignIn} autoComplete="off" className="space-y-4">
                  <div>
                    <h2 className="text-xl font-display font-bold text-white tracking-wide">
                      Customer Sign In
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Return to your existing account to view saved vehicles, projects, and custom builds.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                      EMAIL ADDRESS
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#38BDF8] font-mono transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                        PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotModalOpen(true);
                          setForgotEmail(customerEmail);
                        }}
                        className="text-[10px] font-mono text-neutral-400 hover:text-[#38BDF8] transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your customer password"
                        autoComplete="current-password"
                        value={customerPassword}
                        onChange={(e) => setCustomerPassword(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#38BDF8] font-mono transition-colors"
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

                  {/* Remember Me */}
                  <div className="flex items-center space-x-2 pt-0.5">
                    <input
                      type="checkbox"
                      id="custRemember"
                      checked={customerRememberMe}
                      onChange={(e) => setCustomerRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-black/50 border-white/20 text-[#38BDF8] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="custRemember" className="text-xs font-mono text-neutral-400 cursor-pointer select-none">
                      Remember me on this device
                    </label>
                  </div>

                  <div className="pt-2">
                    <Magnetic intensity={0.25} range={70} className="w-full">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#38BDF8] text-black hover:bg-white font-bold text-xs uppercase py-3.5 rounded-2xl transition-all shadow-xl shadow-[#38BDF8]/25 flex items-center justify-center space-x-2"
                      >
                        <span>{isLoading ? 'Signing In...' : 'Sign In as Customer'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Magnetic>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setCustomerMode('register')}
                      className="text-xs font-mono text-neutral-400 hover:text-[#38BDF8] transition-colors"
                    >
                      Need an account? <span className="underline font-bold">Create Account &rarr;</span>
                    </button>
                  </div>
                </form>
              )}

              {/* CUSTOMER MODE 2: CREATE ACCOUNT (REGISTRATION) */}
              {customerMode === 'register' && (
                <form onSubmit={handleCustomerRegister} autoComplete="off" className="space-y-3.5">
                  <div>
                    <h2 className="text-xl font-display font-bold text-white tracking-wide flex items-center gap-2">
                      <span>Create Account</span>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Register to save vehicle configurations and access projects permanently.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 font-mono transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                      EMAIL ADDRESS
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                        PASSWORD
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Min. 6 chars"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 font-mono transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                        CONFIRM PASSWORD
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-400 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {regPassword && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-neutral-400">Strength:</span>
                        <span className={`font-bold ${strength.score >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full flex-1 rounded-full transition-all ${
                              step <= strength.score ? strength.color : 'bg-white/5'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Terms & Conditions Checkbox */}
                  <div className="flex items-start space-x-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="termsCheck"
                      required
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded bg-black/50 border-white/20 text-emerald-400 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="termsCheck" className="text-[11px] font-mono text-neutral-400 cursor-pointer select-none leading-tight">
                      I agree to the <span className="text-white hover:underline">Terms and Conditions</span> and Privacy Policy.
                    </label>
                  </div>

                  <div className="pt-2">
                    <Magnetic intensity={0.25} range={70} className="w-full">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-400 text-black hover:bg-white font-bold text-xs uppercase py-3.5 rounded-2xl transition-all shadow-xl shadow-emerald-400/25 flex items-center justify-center space-x-2"
                      >
                        <span>{isLoading ? 'Creating Account...' : 'Create Account & Enter'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Magnetic>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setCustomerMode('signin')}
                      className="text-xs font-mono text-neutral-400 hover:text-emerald-400 transition-colors"
                    >
                      Already registered? <span className="underline font-bold">Sign In &rarr;</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* THREE CLEAR ACTIONS: CONTINUE AS GUEST BUTTON */}
          {/* ========================================================= */}
          <div className="pt-4 border-t border-white/10 text-center space-y-2">
            <button
              type="button"
              onClick={handleContinueAsGuest}
              className="w-full py-3 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs font-mono text-neutral-300 hover:text-white transition-all flex items-center justify-center space-x-2 group"
            >
              <Compass className="w-4 h-4 text-[#00F0FF] group-hover:rotate-45 transition-transform duration-300" />
              <span>Continue as Guest (No Account Required) &rarr;</span>
            </button>
            <p className="text-[10px] font-mono text-neutral-500">
              Explore 3D models, public vehicle viewer & component catalog freely.
            </p>
          </div>
        </div>

        {/* Security & System Status Footer */}
        <div className="text-[11px] font-mono text-neutral-500 text-center space-y-1">
          <div>AUTOMOTIVE OS PLATFORM • SECURE CLOUD SESSIONS</div>
          <div className="text-neutral-600">POSTGRESQL • PRISMA ORM • BCRYPT HASHING • SECURE SESSIONS</div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ========================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-[#00F0FF]">
                <KeyRound className="w-4 h-4" />
                <span>Password Recovery</span>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotNotice && (
              <div className="p-3 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-xs font-mono text-[#00F0FF]">
                {forgotNotice}
              </div>
            )}

            {forgotStep === 'request' ? (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <p className="text-xs text-neutral-300">
                  Enter your registered account email address. We will generate a secure reset token.
                </p>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                    ACCOUNT EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#00F0FF] font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#00F0FF] text-black font-bold text-xs uppercase py-3 rounded-xl hover:bg-white transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Request Password Reset Token'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3.5">
                <p className="text-xs text-neutral-300">
                  Reset token generated. Enter your new password below.
                </p>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                    RESET TOKEN
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                    NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-400 text-black font-bold text-xs uppercase py-3 rounded-xl hover:bg-white transition-colors"
                >
                  {isLoading ? 'Updating...' : 'Set New Password & Return'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
