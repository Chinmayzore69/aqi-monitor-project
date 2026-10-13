import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AccountMenu } from '@/components/AccountMenu';

interface MobileNavProps {
  navItems: { label: string; action: () => void }[];
  onNavigate: (page: 'landing' | 'dashboard' | 'history' | 'about' | 'account') => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export function MobileNav({ navItems, onNavigate, onOpenAuth }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="lg:hidden p-2 text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Toggle navigation menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <div className="lg:hidden border-t border-white/5 bg-[#0D2233] px-4 py-4 space-y-2 absolute inset-x-0 top-full">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-3 text-sm text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-white/5">
            <AccountMenu
              onNavigate={(p) => { onNavigate(p); setOpen(false); }}
              onOpenAuth={onOpenAuth}
            />
          </div>
        </div>
      )}
    </>
  );
}
