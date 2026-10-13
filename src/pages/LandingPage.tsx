import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Logo3D } from '@/components/Logo3D';
import { AccountMenu } from '@/components/AccountMenu';
import { Menu, X, Activity, MapPin, Wifi, BarChart3, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: 'dashboard' | 'history' | 'about' | 'account') => void;
  onStart: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export function LandingPage({ onNavigate, onStart, onOpenAuth }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', action: () => onNavigate('dashboard') },
    { label: 'Dashboard', action: () => onNavigate('dashboard') },
    { label: 'History', action: () => onNavigate('history') },
    { label: 'About', action: () => onNavigate('about') },
  ];

  return (
    <div className="min-h-screen bg-[#071724] text-[#F4F8FC]">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-green-500/5 blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-cyan-500 focus:text-white focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-cyan-300/30 bg-gradient-to-r from-[#0D2233] via-[#14506A] to-[#0D2233] shadow-xl shadow-cyan-950/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" showTagline />
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="px-4 py-2 text-sm text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={onStart}
                className="ml-2 px-5 py-2 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
              >
                Start Monitoring
              </button>
              <div className="ml-2 flex items-center">
                <AccountMenu onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
              </div>
            </nav>
            <button
              className="lg:hidden p-2 text-[#F4F8FC]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/5 bg-[#0D2233] px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-sm text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onStart();
                setMobileMenuOpen(false);
              }}
              className="block w-full px-4 py-3 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg"
            >
              Start Monitoring
            </button>
            <div className="pt-2 border-t border-white/5">
              <AccountMenu onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
            </div>
          </div>
        )}
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 lg:pt-44 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-400">
                <Activity size={12} aria-hidden="true" />
                ESP32 + MQ-135 Air Quality Monitor
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Know the Air
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                  You Breathe.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[#9DB1C4] leading-relaxed max-w-xl">
                Monitor air quality around you with our smart sensor, compare regional conditions,
                and explore your air-quality history.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={onStart}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02]"
                >
                  Start Monitoring
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold border border-white/10 hover:border-cyan-500/30 text-[#F4F8FC] rounded-xl transition-colors bg-white/5 hover:bg-white/10"
                >
                  Explore Dashboard
                </button>
              </div>
              <div className="flex items-center gap-6 pt-4 text-xs text-[#9DB1C4]/60">
                <span className="flex items-center gap-1.5"><MapPin size={14} aria-hidden="true" /> Location-aware</span>
                <span className="flex items-center gap-1.5"><Wifi size={14} aria-hidden="true" /> Wi-Fi + USB Serial</span>
                <span className="flex items-center gap-1.5"><BarChart3 size={14} aria-hidden="true" /> History & Charts</span>
              </div>
            </div>

            <div className="flex items-center justify-center relative min-h-[300px] sm:min-h-[400px] lg:min-h-[540px] py-8 order-first lg:order-last">
              <Logo3D size={460} className="mx-auto" />
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Wifi, title: 'Connect Your Sensor', desc: 'Link your ESP32 + MQ-135 device via Wi-Fi or USB serial. Readings flow automatically — no manual entry needed.', color: '#16C9F5' },
              { icon: MapPin, title: 'Location Detection', desc: 'Detect your approximate location with permission. Compare local sensor data with regional air quality from external APIs.', color: '#27D982' },
              { icon: Activity, title: 'Local AQI Estimate', desc: 'Our system calculates an experimental local AQI from sensor resistance data using documented mathematical formulas.', color: '#268BFF' },
              { icon: BarChart3, title: 'History & Trends', desc: 'Every reading is stored with timestamps and locations. View trends over time with daily, weekly, and monthly filters.', color: '#27D982' },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#0D2233]/60 border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon size={20} style={{ color: feature.color }} aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-[#F4F8FC] mb-2">{feature.title}</h3>
                <p className="text-xs text-[#9DB1C4] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CPCB scale */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Indian CPCB AQI Categories</h2>
            <p className="text-sm text-[#9DB1C4] max-w-2xl mx-auto">
              We display air quality using the Central Pollution Control Board (CPCB) category names and colours.
              The MQ-135 experimental score uses a separate provisional mapping — it is not an official CPCB AQI measurement.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Good', range: '0–50', color: '#00FF66' },
              { name: 'Satisfactory', range: '51–100', color: '#80FF00' },
              { name: 'Moderate', range: '101–200', color: '#FFFF00' },
              { name: 'Poor', range: '201–300', color: '#FF9E00' },
              { name: 'Very Poor', range: '301–400', color: '#FF2222' },
              { name: 'Severe', range: '401–500', color: '#FF0000' },
            ].map((cat) => (
              <div
                key={cat.name}
                className="p-4 rounded-xl border text-center"
                style={{ borderColor: `${cat.color}50`, backgroundColor: `${cat.color}15` }}
              >
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: cat.color, boxShadow: `0 0 12px ${cat.color}, 0 0 24px ${cat.color}80` }}
                />
                <p className="text-sm font-semibold" style={{ color: cat.color, textShadow: `0 0 8px ${cat.color}80` }}>{cat.name}</p>
                <p className="text-xs text-[#9DB1C4] mt-1">{cat.range}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size="sm" showTagline />
            <nav className="flex items-center gap-1 text-sm" aria-label="Footer navigation">
              <button onClick={() => onNavigate('dashboard')} className="px-3 py-2 text-[#C7E8F3] hover:text-white hover:bg-white/10 rounded-lg transition-colors">Dashboard</button>
              <button onClick={() => onNavigate('history')} className="px-3 py-2 text-[#C7E8F3] hover:text-white hover:bg-white/10 rounded-lg transition-colors">History</button>
              <button onClick={() => onNavigate('about')} className="px-3 py-2 text-[#C7E8F3] hover:text-white hover:bg-white/10 rounded-lg transition-colors">About</button>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
