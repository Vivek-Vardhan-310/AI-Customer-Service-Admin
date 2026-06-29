import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ShieldCheck, Lock, Mail, ArrowRight, Laptop, KeyRound, AlertTriangle } from 'lucide-react';
import { adminLogin } from '../supabaseService';
import { supabase } from '../supabaseClient';

interface AdminLoginProps {
  onLoginSuccess: (email: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!email.trim() || !password.trim()) {
      setErrorBanner('Please fill in all requested terminal ports.');
      return;
    }

    setIsLoading(true);

    // If Supabase is not configured, fall back to demo mode
    if (!supabase) {
      setTimeout(() => {
        onLoginSuccess(email);
      }, 800);
      return;
    }

    try {
      const result = await adminLogin(email, password);
      if (result.success) {
        onLoginSuccess(email);
      } else {
        setErrorBanner(result.error || 'CREDENTIAL AUDIT FAILED: Incorrect administrative portal key or address.');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorBanner('CREDENTIAL AUDIT FAILED: An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleAutoFillAndLogin = () => {
    setErrorBanner(null);
    // When Supabase is not configured, allow demo login
    if (!supabase) {
      setEmail('admin@lenovo.com');
      setPassword('admin123');
      setIsLoading(true);
      setTimeout(() => {
        onLoginSuccess('admin@lenovo.com');
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-black selection:text-white">
      <div className="w-full max-w-5xl bg-white border-2 border-black grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-xs">
        
        {/* Left column: Interactive Minimalist Lenovo Laptop Visualizer (5 Cols) */}
        <div className="md:col-span-5 bg-black text-white p-8 flex flex-col justify-between relative overflow-hidden min-h-[350px] md:min-h-[550px]">
          {/* Subtle architectural tech-grid backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />
          
          {/* High-quality background laptop image blended into black */}
          <div className="absolute inset-0 opacity-20 hover:opacity-25 transition-opacity duration-500 pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" 
              alt="Sleek Minimal Lenovo Laptop" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Header Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-1.5 bg-neutral-900 border border-neutral-700 px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              <span>SYSTEM AUTH PORT GATEWAY</span>
            </div>
          </div>

          {/* Visual vector representation of Lenovo laptop matching our page layout style */}
          <div className="relative my-8 flex flex-col items-center justify-center z-10 w-full grow">
            {/* Minimalist Laptop chassis mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-xs flex flex-col items-center"
            >
              {/* Laptop Screen */}
              <div className="w-[85%] aspect-[16/10] bg-neutral-900 border-2 border-neutral-800 rounded-t-lg p-1.5 shadow-2xl relative overflow-hidden">
                {/* Camera notch */}
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black border border-neutral-800" />
                
                {/* Screen content */}
                <div className="w-full h-full bg-black border border-neutral-850 rounded-xs flex flex-col justify-between p-2 font-mono text-[8px] text-neutral-400 capitalize">
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-1">
                    <span className="font-bold text-white text-[7px]">LENOVO BIOS SETUP</span>
                    <span className="text-neutral-500 text-[6px]">v1.12</span>
                  </div>
                  
                  {/* Fake console logs */}
                  <div className="space-y-1 my-auto font-mono text-[7px] lowercase select-none">
                    <div className="text-green-500">▶ client_handshake ok.</div>
                    <div>▶ diagnostics: 100% compliant</div>
                    <div className="text-red-500">🔒 login_gate: listening on port ::3000</div>
                  </div>

                  {/* Red trackpoint guide */}
                  <div className="flex justify-between items-center text-[6px] text-neutral-500 pt-1 border-t border-neutral-900">
                    <span>SECURE SHELL</span>
                    <span>ACTIVE STATE</span>
                  </div>
                </div>
              </div>

              {/* Laptop hinge and keyboard base */}
              <div className="w-full h-2.5 bg-neutral-800 border-x border-t border-neutral-700 rounded-t-xs relative">
                {/* Trackpoint red dot simulator on base */}
                <div className="absolute top-[-1px] left-1/2 -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full ring-2 ring-neutral-800" title="Lenovo TrackPoint" />
              </div>
              <div className="w-[105%] h-1.5 bg-neutral-900 border-t border-neutral-800 rounded-b-md shadow-lg" />
            </motion.div>

            {/* Specs sticker text */}
            <div className="mt-5 text-center space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Lenovo ThinkPad X1 Series</span>
              <span className="text-[9px] font-mono text-neutral-500 block">Intel® Core™ Ultra Dual Core vPro Secure Platform</span>
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="relative z-10 flex items-center justify-between border-t border-neutral-900 pt-4">
            <div className="flex items-center space-x-1 font-mono text-[10px] text-neutral-400">
              <span className="font-sans font-black text-white text-xs tracking-wider">LENOVO</span>
              <span className="text-neutral-500 uppercase">SYS SECURE</span>
            </div>
            <span className="text-[9px] font-mono text-neutral-500 uppercase">PREMIER LEVEL S-5</span>
          </div>
        </div>

        {/* Right column: High Contrast Minimalist Login Module (7 Cols) */}
        <div className="md:col-span-7 bg-white p-8 sm:p-12 flex flex-col justify-between">
          
          {/* Header section */}
          <div>
            <div className="flex items-center space-x-2 text-black mb-3">
              <div className="bg-black text-white p-1.5 flex items-center border border-black scrollbar-none">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-mono text-xs font-bold tracking-widest uppercase text-neutral-500">
                Lenovo Enterprise Support
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black font-display text-neutral-950 uppercase tracking-tight leading-none mb-2">
              ADMINISTRATIVE SIGN IN
            </h1>
            <p className="text-xs font-sans text-neutral-500 uppercase max-w-sm">
              Please enter your registered technician credentials to gain immediate dashboard access to corporate client fleets.
            </p>
          </div>

          {/* Form and Feedback block */}
          <div className="my-8 grow flex flex-col justify-center">
            
            {/* Error message card */}
            {errorBanner && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 bg-red-50 border-2 border-red-500 p-3.5 text-xs font-mono text-red-700 flex items-start space-x-2.5"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <span className="font-bold block uppercase mb-0.5">SECURITY ACCESS DENIED</span>
                  <p className="leading-snug">{errorBanner}</p>
                </div>
              </motion.div>
            )}

            {/* Actual Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Email address field */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-600 block tracking-wider">
                  Technician Account Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent.lenovo@lenovo.com"
                    className="w-full bg-neutral-50 border-2 border-black p-2.5 pl-10 font-mono text-xs focus:bg-white focus:outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold uppercase text-neutral-600 block tracking-wider">
                    Access Pin / Security Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[9px] font-mono font-bold hover:underline text-neutral-500 uppercase"
                  >
                    {showPassword ? 'Hide Key' : 'Reveal Key'}
                  </button>
                </div>
                
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full bg-neutral-50 border-2 border-black p-2.5 pl-10 font-mono text-xs focus:bg-white focus:outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Submit CTA action block */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white hover:bg-neutral-900 border-2 border-black font-mono font-bold text-xs uppercase px-5 py-3 flex items-center justify-center space-x-2 transition-all shadow-xs disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>DECRYPTING VAULT TENSORS...</span>
                    </span>
                  ) : (
                    <>
                      <span>[COMPILE SECURE LOGIN]</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Demo Helper Section (Bypasses typing for reviewers) */}
          <div className="border-t border-neutral-150 pt-5 text-left">
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block tracking-widest mb-2">
              PRE-CONFIGURED DEMO NODE
            </span>
            <div className="bg-neutral-50 border border-neutral-300 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
              <div className="font-mono text-[10px] text-neutral-600 line-clamp-2 leading-relaxed">
                <div className="font-bold text-neutral-800">EMAIL: <span className="text-black font-black selection:bg-black selection:text-white">admin@lenovo.com</span></div>
                <div className="font-bold text-neutral-800">PASSWORD: <span className="text-black font-black selection:bg-black selection:text-white">admin123</span></div>
              </div>
              
              <button
                type="button"
                onClick={handleAutoFillAndLogin}
                disabled={isLoading}
                className="shrink-0 bg-white hover:bg-neutral-100 border border-black font-mono text-[10px] font-black uppercase px-3 py-1.5 transition-colors disabled:opacity-50 flex items-center"
              >
                ⚡ AUTO-ENTER PORTAL
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
