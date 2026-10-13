import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

interface AccountMenuProps {
  onNavigate: (page: 'landing' | 'dashboard' | 'history' | 'about' | 'account') => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export function AccountMenu({ onNavigate, onOpenAuth }: AccountMenuProps) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenAuth('signin')}
          className="px-3 py-1.5 text-sm font-medium text-[#C7E8F3] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors"
        >
          Log In
        </button>
        <button
          onClick={() => onOpenAuth('signup')}
          className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg transition-all shadow-lg shadow-cyan-500/20"
        >
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#C7E8F3] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="My Account menu"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
          {username.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline">{username}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-52 rounded-xl bg-[#0D2233] border border-white/10 shadow-2xl py-2 z-50"
          role="menu"
        >
          <div className="px-4 py-2 border-b border-white/5">
            <p className="text-sm font-medium text-[#F4F8FC] truncate">{username}</p>
            <p className="text-[10px] text-[#9DB1C4] truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { onNavigate('account'); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#C7E8F3] hover:text-[#F4F8FC] hover:bg-white/5 transition-colors text-left"
            role="menuitem"
          >
            <UserIcon size={15} /> My Account
          </button>
          <button
            onClick={async () => { await signOut(); setOpen(false); onNavigate('landing'); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#C7E8F3] hover:text-red-400 hover:bg-red-500/5 transition-colors text-left"
            role="menuitem"
          >
            <LogOut size={15} /> Log Out
          </button>
        </div>
      )}
    </div>
  );
}
