import { useEffect, useState } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { AuthModal } from '@/components/AuthModal';
import { LandingPage } from '@/pages/LandingPage';
import { Dashboard } from '@/pages/Dashboard';
import { HistoryPage } from '@/pages/HistoryPage';
import { AboutPage } from '@/pages/AboutPage';
import { AccountPage } from '@/pages/AccountPage';

type Page = 'landing' | 'dashboard' | 'history' | 'about' | 'account';

function App() {
  const [page, setPage] = useState<Page>(() => {
    const initialPage = window.history.state?.page as Page | undefined;
    return initialPage || 'landing';
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (!window.history.state?.page) {
      window.history.replaceState({ page: 'landing' }, '', window.location.pathname);
    }

    const handlePopState = (event: PopStateEvent) => {
      const previousPage = event.state?.page as Page | undefined;
      setPage(previousPage || 'landing');
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (target: Page) => {
    if (target === page) return;
    window.history.pushState({ page: target }, '', window.location.pathname);
    setPage(target);
    window.scrollTo(0, 0);
  };

  const handleStart = () => {
    navigate('dashboard');
  };

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <AuthProvider>
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authMode} />
      {(() => {
        switch (page) {
          case 'landing':
            return <LandingPage onNavigate={navigate} onStart={handleStart} onOpenAuth={openAuth} />;
          case 'dashboard':
            return <Dashboard onNavigate={navigate} onOpenAuth={openAuth} />;
          case 'history':
            return <HistoryPage onNavigate={navigate} onOpenAuth={openAuth} />;
          case 'about':
            return <AboutPage onNavigate={navigate} onOpenAuth={openAuth} />;
          case 'account':
            return <AccountPage onNavigate={navigate} onOpenAuth={openAuth} />;
          default:
            return <LandingPage onNavigate={navigate} onStart={handleStart} onOpenAuth={openAuth} />;
        }
      })()}
    </AuthProvider>
  );
}

export default App;
