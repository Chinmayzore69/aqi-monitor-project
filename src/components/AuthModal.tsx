import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ open, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, open]);

  useEffect(() => {
    if (open) {
      setError(null);
      setEmail('');
      setPassword('');
      setUsername('');
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!username.trim()) {
        setError('Please enter a username.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, username.trim());
      if (error) {
        setError(error);
      } else {
        onClose();
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        onClose();
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#0D2233] border border-cyan-500/20 p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#F4F8FC]">
            {mode === 'signin' ? 'Log In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-[#9DB1C4]">
          {mode === 'signin'
            ? 'Log in to view your personal air quality history.'
            : 'Create an account to save and track your air quality readings.'}
        </p>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium bg-white hover:bg-gray-100 text-gray-900 rounded-xl transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.23 0 2.35.42 3.23 1.25l2.37-2.37C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-[#9DB1C4]/60 uppercase tracking-wide">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-username" className="text-xs font-medium text-[#9DB1C4] mb-1.5 block">
                Username
              </label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9DB1C4]" />
                <input
                  id="auth-username"
                  ref={mode === 'signup' ? firstInputRef : undefined}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-[#071724] border border-white/10 rounded-lg text-[#F4F8FC] placeholder-[#9DB1C4]/40 focus:outline-none focus:border-cyan-500/40"
                  autoComplete="username"
                />
              </div>
            </div>
          )}
          <div>
            <label htmlFor="auth-email" className="text-xs font-medium text-[#9DB1C4] mb-1.5 block">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9DB1C4]" />
              <input
                id="auth-email"
                ref={mode === 'signin' ? firstInputRef : undefined}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-[#071724] border border-white/10 rounded-lg text-[#F4F8FC] placeholder-[#9DB1C4]/40 focus:outline-none focus:border-cyan-500/40"
                autoComplete="email"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="auth-password" className="text-xs font-medium text-[#9DB1C4] mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9DB1C4]" />
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-[#071724] border border-white/10 rounded-lg text-[#F4F8FC] placeholder-[#9DB1C4]/40 focus:outline-none focus:border-cyan-500/40"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg transition-all disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signin' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-xs text-[#9DB1C4]">
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null); }}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setError(null); }}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
