import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, User, Lock, AlertCircle, Loader2, Mail, Phone, 
  UserCheck, CheckCircle2, Eye, EyeOff, Fingerprint, ShieldCheck, 
  Users, BarChart3 
} from 'lucide-react';
import type { UserRole } from '../../types';
import { authService } from '../../services/authService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Toggle between Login (false) and Register/Create Account (true)
  const [isRegister, setIsRegister] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const res = await authService.login({
        username: username.trim(),
        password: password,
        role: role
      });

      if (res.status === 'success') {
        setSuccessMsg('Login successful! Redirecting...');
        setTimeout(() => {
          if (role === 'officer') {
            navigate('/officer/dashboard');
          } else {
            navigate('/citizen/dashboard');
          }
        }, 600);
      } else {
        setErrorMsg(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your username/password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const res = await authService.register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password,
        phone: phone.trim(),
        role: role
      });

      if (res.status === 'success') {
        setSuccessMsg('Account created successfully! Redirecting to login page...');
        setTimeout(() => {
          setIsRegister(false);
          setSuccessMsg('Account created! Please sign in with your new credentials.');
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Failed to create account.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account. Please check input values.');
    } finally {
      setLoading(false);
    }
  };

  const handleBypassToDemo = async (selectedRole: UserRole) => {
    try {
      if (selectedRole === 'officer') {
        await authService.login({ username: 'deshana', password: 'password', role: 'officer' });
        navigate('/officer/dashboard');
      } else {
        await authService.login({ username: 'rama', password: 'password', role: 'citizen' });
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      if (selectedRole === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#faf6ee]">
      {/* LEFT PANEL - Hidden on mobile, fully visible on desktop */}
      <div className="relative hidden lg:flex lg:w-[54%] xl:w-[58%] bg-[#0d1f17] overflow-hidden flex-col justify-between p-12 text-white z-10">
        
        {/* Falling back background pattern + overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-[#142e22] to-[#07130f] z-0" />
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px] z-0" />
        
        {/* Background video overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay z-0"
        >
          <source src="/TRACIA_land_identity_loop.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f17]/95 via-[#0d1f17]/70 to-[#0d1f17]/60 z-0" />

        {/* Top brand logo over video */}
        <div className="flex items-center space-x-3 z-10 relative">
          <svg className="w-9 h-9 text-[#a68a4a] fill-none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 6v10" />
            <path d="M12 8l-4 3" />
            <path d="M12 10l4 3" />
            <path d="M12 12l-4 3" />
          </svg>
          <div className="flex flex-col text-left">
            <span className="text-3xl font-serif font-black tracking-tight text-white leading-none">Tracia</span>
            <span className="text-[9px] font-bold text-[#a68a4a] tracking-widest font-sans mt-0.5">TRUSTED LAND RECORDS</span>
          </div>
        </div>

        {/* Taglines in the middle */}
        <div className="my-auto z-10 relative max-w-xl space-y-6 text-left">
          <h2 className="text-4xl xl:text-5xl font-serif font-black leading-[1.15] text-white">
            Secure Land Records.<br />
            <span className="text-[#a68a4a]">Transparent Future.</span>
          </h2>
          <p className="text-sm xl:text-base text-slate-300 leading-relaxed font-sans font-light">
            A digital trust layer for land records, empowering citizens and strengthening administrative governance.
          </p>
          <div className="w-12 h-1 bg-[#a68a4a] rounded" />
        </div>

        {/* Bottom features grid */}
        <div className="z-10 relative">
          <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-8 pb-6 text-left">
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#a68a4a]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Verified Records</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Immutable title registry and transaction histories.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#a68a4a]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Secure & Transparent</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Advanced encryption protecting property rights.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#a68a4a]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Citizen & Officer</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Unified portals for verification and requests.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#a68a4a]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Accountable Admin</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Traceable audit logs for all government actions.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#a68a4a]" />
            <span>Secure • Audited • Government Aligned</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Login card with curved overlay */}
      <div className="relative flex-1 flex flex-col justify-center items-center bg-[#faf6ee] px-6 py-12 sm:px-16 lg:px-20 z-20">
        
        {/* Concave curved divider (visible on desktop) */}
        <div className="absolute left-0 top-0 bottom-0 w-24 -translate-x-[99%] text-[#faf6ee] fill-current pointer-events-none hidden lg:block">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 100,0 C 20,25 20,75 100,100 Z" />
          </svg>
        </div>

        {/* Small Screen Brand Logo (shown only on mobile/tablet) */}
        <div className="flex lg:hidden flex-col items-center mb-8">
          <div className="flex items-center space-x-3">
            <svg className="w-9 h-9 text-[#a68a4a] fill-none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 6v10" />
              <path d="M12 8l-4 3" />
              <path d="M12 10l4 3" />
              <path d="M12 12l-4 3" />
            </svg>
            <div className="flex flex-col text-left">
              <span className="text-3xl font-serif font-black tracking-tight text-[#0d1f17] leading-none">Tracia</span>
              <span className="text-[9px] font-bold text-[#a68a4a] tracking-widest font-sans mt-0.5">TRUSTED LAND RECORDS</span>
            </div>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <h3 className="text-3xl font-serif font-bold tracking-tight text-[#0d1f17] md:text-4xl">
              Sign in to your parcel
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 font-sans font-light">
              Access your verified land records securely.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200/50 text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-bold">Authentication Failure</p>
                <p className="mt-0.5 leading-relaxed font-light">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-bold">Success</p>
                <p className="mt-0.5 leading-relaxed font-light">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Citizen / Officer Tab Switcher */}
          {!isRegister && (
            <div className="flex w-full border-b border-slate-200/70 mb-6 font-sans">
              <button
                type="button"
                onClick={() => {
                  setRole('citizen');
                  resetMessages();
                }}
                className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all ${
                  role === 'citizen'
                    ? 'border-[#a68a4a] text-[#0d1f17]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('officer');
                  resetMessages();
                }}
                className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-all ${
                  role === 'officer'
                    ? 'border-[#a68a4a] text-[#0d1f17]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Officer
              </button>
            </div>
          )}

          {/* Form */}
          {isRegister ? (
            /* Registration Flow */
            <form className="space-y-4 text-left font-sans" onSubmit={handleRegisterSubmit}>
              <div>
                <label className="block text-[10px] font-bold text-[#0d1f17] uppercase tracking-wider mb-1">
                  Select Portal Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('citizen')}
                    className={`flex items-center justify-center space-x-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                      role === 'citizen'
                        ? 'bg-[#0d1f17] border-[#0d1f17] text-white'
                        : 'bg-white border-slate-200 text-[#0d1f17] hover:border-[#a68a4a]'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Citizen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('officer')}
                    className={`flex items-center justify-center space-x-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                      role === 'officer'
                        ? 'bg-[#0d1f17] border-[#0d1f17] text-white'
                        : 'bg-white border-slate-200 text-[#0d1f17] hover:border-[#a68a4a]'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Officer</span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-[#0d1f17] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-light focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-username" className="block text-xs font-semibold text-[#0d1f17] mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose username"
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-light focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-[#0d1f17] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-light focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-xs font-semibold text-[#0d1f17] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-light focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-[#0d1f17] mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-light focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-2.5 bg-[#0d1f17] hover:bg-[#07120e] text-white border border-[#0d1f17] rounded-lg font-bold text-xs flex justify-center items-center transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          ) : (
            /* Login Flow */
            <form className="space-y-5 text-left font-sans" onSubmit={handleLoginSubmit}>
              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-[#0d1f17] mb-1">
                  Aadhaar-linked ID or email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your ID or email"
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-light focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-xs font-semibold text-[#0d1f17]">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset requires backend email service connection.');
                    }}
                    className="text-xs font-semibold text-[#a68a4a] hover:text-[#8e743a] hover:underline transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-light focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#0d1f17] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-2.5 bg-[#0d1f17] hover:bg-[#07120e] text-white border border-[#0d1f17] rounded-lg font-bold text-xs flex justify-center items-center transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4 mr-2" />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form Toggle Link */}
          <div className="text-center font-sans">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                resetMessages();
              }}
              className="text-xs font-semibold text-[#0d1f17] hover:text-[#a68a4a] hover:underline transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have a portal account? Register here"}
            </button>
          </div>

          {/* Footer note box */}
          <div className="p-3.5 rounded-lg bg-[#fcf9f2] border border-[#a68a4a]/15 flex items-start space-x-2.5 text-[#a68a4a] font-sans">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#a68a4a]" />
            <p className="text-[10px] sm:text-xs text-slate-600 leading-normal font-light">
              Every sign-in is logged in your parcel's audit trail.
            </p>
          </div>

          {/* Direct Navigation for Developer Review */}
          <div className="border-t border-slate-200/50 pt-4 text-center font-sans">
            <p className="text-[10px] text-slate-400 mb-2 font-medium tracking-wider uppercase">Quick Access Demo Portals</p>
            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => handleBypassToDemo('citizen')}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-[#0d1f17] font-semibold transition-colors"
              >
                Citizen Portal
              </button>
              <button
                type="button"
                onClick={() => handleBypassToDemo('officer')}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-[#0d1f17] font-semibold transition-colors"
              >
                Officer Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
