import { Logo } from '@/components/Logo';
import { Cpu, Wifi, Calculator, Database, Globe, Shield, AlertTriangle, Heart, Activity, Code } from 'lucide-react';
import { AccountMenu } from '@/components/AccountMenu';
import { MobileNav } from '@/components/MobileNav';

interface AboutPageProps {
  onNavigate: (page: 'landing' | 'dashboard' | 'history' | 'account') => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export function AboutPage({ onNavigate, onOpenAuth }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-[#071724] text-[#F4F8FC]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-green-500/5 blur-[100px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-cyan-300/30 bg-gradient-to-r from-[#0D2233] via-[#14506A] to-[#0D2233] shadow-xl shadow-cyan-950/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => onNavigate('landing')} className="hover:opacity-80 transition-opacity">
              <Logo size="sm" />
            </button>
            <div className="flex items-center gap-1 text-sm">
              <nav className="hidden lg:flex items-center gap-1" aria-label="About page navigation">
                <button onClick={() => onNavigate('dashboard')} className="px-3 py-1.5 text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors">Dashboard</button>
                <button onClick={() => onNavigate('history')} className="px-3 py-1.5 text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors">History</button>
              </nav>
              <div className="hidden lg:flex items-center ml-2">
                <AccountMenu onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
              </div>
              <div className="lg:hidden">
                <MobileNav
                  navItems={[
                    { label: 'Dashboard', action: () => onNavigate('dashboard') },
                    { label: 'History', action: () => onNavigate('history') },
                    { label: 'About', action: () => onNavigate('about') },
                  ]}
                  onNavigate={onNavigate}
                  onOpenAuth={onOpenAuth}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 space-y-8">
        {/* Hero */}
        <div className="text-center py-8">
          <div className="inline-block mb-4">
            <Logo size="lg" showTagline />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4">About This Project</h1>
          <p className="text-base text-[#9DB1C4] mt-3 max-w-2xl mx-auto leading-relaxed">
            An educational air-quality monitoring system that connects a physical ESP32 + MQ-135 sensor
            to a web dashboard, calculates an estimated local AQI, and compares it with regional air-quality data.
          </p>
        </div>

        {/* Tech stack */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Code size={20} className="text-cyan-400" /> Technology Stack</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: Cpu, title: 'ESP32 + MQ-135', desc: 'Microcontroller with analog gas sensor for air quality monitoring', color: '#16C9F5' },
              { icon: Calculator, title: 'AQI Calculation', desc: 'Raw ADC value divided by 8 and capped at 500 to produce a direct AQI score', color: '#27D982' },
              { icon: Globe, title: 'Open-Meteo API', desc: 'Regional air-quality data including PM2.5, PM10, NO₂, SO₂, O₃, CO concentrations', color: '#268BFF' },
              { icon: Database, title: 'Supabase Backend', desc: 'PostgreSQL database for storing readings, device status, and location data with realtime updates', color: '#27D982' },
              { icon: Wifi, title: 'Wi-Fi + USB Serial', desc: 'ESP32 sends data via HTTP to a serverless edge function, or connects directly via Web Serial API', color: '#16C9F5' },
              { icon: Activity, title: 'Realtime Dashboard', desc: 'React + TypeScript frontend with live sensor data, charts, and CPCB category visualization', color: '#268BFF' },
            ].map((tech) => (
              <div key={tech.title} className="p-4 rounded-xl bg-[#0D2233]/80 border border-white/5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${tech.color}15` }}>
                  <tech.icon size={18} style={{ color: tech.color }} />
                </div>
                <h3 className="text-sm font-semibold mb-1">{tech.title}</h3>
                <p className="text-xs text-[#9DB1C4] leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <div className="space-y-3">
            {[
              { step: 1, title: 'Connect the Sensor', desc: 'Your ESP32 + MQ-135 device sends analog readings to our server via Wi-Fi (HTTP) or directly via USB serial connection.' },
              { step: 2, title: 'Calculate Local AQI', desc: 'The system takes the incoming raw ADC value and computes AQI directly using the formula AQI = min(500, round(adc / 8)), then assigns a CPCB-style category.' },
              { step: 3, title: 'Detect Your Location', desc: 'With your permission, the browser detects your approximate location to fetch regional air-quality data from the Open-Meteo API.' },
              { step: 4, title: 'Compare & Visualize', desc: 'The dashboard displays your local sensor estimate alongside regional AQI data, with CPCB category colours, health animations, and trend charts.' },
              { step: 5, title: 'Store History', desc: 'Every reading is saved with timestamps and location data. You can view trends over time and export data as CSV.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 p-4 rounded-xl bg-[#0D2233]/80 border border-white/5">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
                  <p className="text-xs text-[#9DB1C4] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Important limitations */}
        <section className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/15">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-amber-400">
            <AlertTriangle size={20} /> Important Limitations
          </h2>
          <ul className="space-y-2 text-sm text-[#9DB1C4]">
            <li className="flex gap-2"><span className="text-amber-400 mt-0.5">•</span> The MQ-135 is a low-cost gas sensor that responds to multiple gases. It does not directly measure PM2.5 or provide all pollutants needed for an official AQI.</li>
            <li className="flex gap-2"><span className="text-amber-400 mt-0.5">•</span> Our local AQI is a <strong className="text-amber-300">direct mapping</strong> from the raw sensor ADC value (AQI = adc / 8, capped at 500). It is NOT an official CPCB AQI measurement.</li>
            <li className="flex gap-2"><span className="text-amber-400 mt-0.5">•</span> The MQ-135 is a low-cost gas sensor that responds to multiple gases. The raw ADC reading reflects overall gas concentration, not a specific pollutant.</li>
            <li className="flex gap-2"><span className="text-amber-400 mt-0.5">•</span> Regional AQI data comes from the Open-Meteo API, which provides model estimates — not necessarily ground-station measurements at your exact location.</li>
            <li className="flex gap-2"><span className="text-amber-400 mt-0.5">•</span> The regional AQI scale (US AQI or European AQI) may differ from Indian CPCB AQI. We label the scale correctly and do not relabel one as another.</li>
            <li className="flex gap-2"><span className="text-amber-400 mt-0.5">•</span> This is a <strong className="text-amber-300">college educational project</strong>. We accept estimated results rather than requiring scientific-grade accuracy.</li>
          </ul>
        </section>

        {/* Privacy */}
        <section className="p-5 rounded-2xl bg-[#0D2233]/80 border border-white/5">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Shield size={20} className="text-green-400" /> Privacy & Data</h2>
          <ul className="space-y-2 text-sm text-[#9DB1C4]">
            <li className="flex gap-2"><span className="text-green-400 mt-0.5">•</span> Location access is requested only when you click "Start Monitoring". You can deny it and enter a city manually.</li>
            <li className="flex gap-2"><span className="text-green-400 mt-0.5">•</span> We store sensor readings, device IDs, and approximate location labels — not personal identifying information.</li>
            <li className="flex gap-2"><span className="text-green-400 mt-0.5">•</span> The ESP32 sends data through a secure serverless endpoint, never directly to the database with exposed credentials.</li>
            <li className="flex gap-2"><span className="text-green-400 mt-0.5">•</span> You can disable location access at any time through your browser settings.</li>
          </ul>
        </section>

        {/* Health disclaimer */}
        <section className="p-5 rounded-2xl bg-[#0D2233]/80 border border-white/5">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Heart size={20} className="text-red-400" /> Health Disclaimer</h2>
          <p className="text-sm text-[#9DB1C4] leading-relaxed">
            The health animation and category advice on this website are for general awareness only.
            They do not diagnose health risks or replace professional medical advice.
            The MQ-135 sensor cannot determine individual health impacts. Always consult healthcare
            professionals for health-related decisions.
          </p>
        </section>

        {/* CPCB reference */}
        <section>
          <h2 className="text-xl font-bold mb-4">CPCB AQI Categories Reference</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { name: 'Good', range: '0–50', color: '#00FF66', desc: 'Satisfactory air quality' },
              { name: 'Satisfactory', range: '51–100', color: '#80FF00', desc: 'Acceptable air quality' },
              { name: 'Moderate', range: '101–200', color: '#FFFF00', desc: 'May cause discomfort to sensitive groups' },
              { name: 'Poor', range: '201–300', color: '#FF9E00', desc: 'Breathing discomfort on prolonged exposure' },
              { name: 'Very Poor', range: '301–400', color: '#FF2222', desc: 'Respiratory illness on prolonged exposure' },
              { name: 'Severe', range: '401–500', color: '#FF0000', desc: 'Serious health effects even on short exposure' },
            ].map((cat) => (
              <div key={cat.name} className="flex items-center gap-3 p-3 rounded-lg bg-[#0D2233]/60 border" style={{ borderColor: `${cat.color}30` }}>
                <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: cat.color }}>{cat.name} ({cat.range})</p>
                  <p className="text-xs text-[#9DB1C4]">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-8 border-t border-white/5">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
