import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/Logo';
import { supabase } from '@/lib/supabase';
import { getCategoryByAQI } from '@/lib/constants';
import { formatTimeUTC, formatTimeShort, exportToCSV } from '@/lib/utils';
import type { SensorReading } from '@/lib/types';
import {
  User as UserIcon, LogOut, Download, Activity, TrendingUp,
  TrendingDown, BarChart3, Clock, Mail, RefreshCw, ChevronLeft,
} from 'lucide-react';
import { MobileNav } from '@/components/MobileNav';
import { AccountMenu } from '@/components/AccountMenu';

interface AccountPageProps {
  onNavigate: (page: 'landing' | 'dashboard' | 'history' | 'about' | 'account') => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

export function AccountPage({ onNavigate, onOpenAuth }: AccountPageProps) {
  const { user, signOut } = useAuth();
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    if (!user) return;
    const fetchReadings = async () => {
      setLoading(true);
      setError(null);
      const now = new Date();
      let since = new Date();
      if (period === 'daily') since.setDate(now.getDate() - 1);
      else if (period === 'weekly') since.setDate(now.getDate() - 7);
      else since.setMonth(now.getMonth() - 1);

      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('user_id', user.id)
        .gte('received_at', since.toISOString())
        .order('received_at', { ascending: false })
        .limit(500);

      if (error) {
        setError(error.message);
      } else {
        setReadings((data || []) as SensorReading[]);
      }
      setLoading(false);
    };
    fetchReadings();
  }, [user, period]);

  const stats = useMemo(() => {
    const validReadings = readings.filter((r) => r.estimated_aqi != null);
    if (validReadings.length === 0) return null;
    const values = validReadings.map((r) => r.estimated_aqi!);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      count: validReadings.length,
    };
  }, [readings]);

  const handleExport = () => {
    const exportData = readings.map((r) => ({
      received_at: r.received_at,
      estimated_aqi: r.estimated_aqi,
      category: r.category,
      voltage: r.voltage,
      estimated_ppm: r.estimated_ppm,
      reading_type: r.reading_type,
      location_label: r.location_label,
    }));
    exportToCSV(exportData, `my-aqi-history-${period}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('landing');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#071724] text-[#F4F8FC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-sm text-[#9DB1C4]">Please log in to view your account.</p>
          <button
            onClick={() => onNavigate('landing')}
            className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071724] text-[#F4F8FC]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-green-500/5 blur-[100px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-cyan-300/30 bg-gradient-to-r from-[#0D2233] via-[#14506A] to-[#0D2233] shadow-xl shadow-cyan-950/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => onNavigate('landing')} className="hover:opacity-80 transition-opacity">
              <Logo size="sm" />
            </button>
            <div className="flex items-center gap-1 text-sm">
              <nav className="hidden lg:flex items-center gap-1" aria-label="Account page navigation">
                <button onClick={() => onNavigate('dashboard')} className="px-3 py-1.5 text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors">Dashboard</button>
                <button onClick={() => onNavigate('history')} className="px-3 py-1.5 text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors">History</button>
                <button onClick={() => onNavigate('about')} className="px-3 py-1.5 text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors">About</button>
              </nav>
              {onOpenAuth && (
                <div className="hidden lg:flex items-center ml-2">
                  <AccountMenu onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
                </div>
              )}
              {onOpenAuth && (
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
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 space-y-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-1 text-xs text-[#9DB1C4] hover:text-cyan-400 transition-colors"
        >
          <ChevronLeft size={14} /> Back to Dashboard
        </button>

        {/* Profile card */}
        <div className="rounded-2xl bg-[#0D2233]/80 border border-white/5 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white ring-2 ring-cyan-500/30">
                {username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#F4F8FC]">{username}</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail size={12} className="text-[#9DB1C4]" />
                  <p className="text-xs text-[#9DB1C4]">{user.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-white/10 hover:border-red-500/30 hover:text-red-400 text-[#C7E8F3] rounded-lg transition-colors"
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>

        {/* Period filter + export */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0D2233]/60 border border-white/5">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                  period === p ? 'bg-cyan-500/15 text-cyan-400' : 'text-[#9DB1C4] hover:text-[#F4F8FC]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLoading(true);
                const now = new Date();
                let since = new Date();
                if (period === 'daily') since.setDate(now.getDate() - 1);
                else if (period === 'weekly') since.setDate(now.getDate() - 7);
                else since.setMonth(now.getMonth() - 1);
                supabase
                  .from('sensor_readings')
                  .select('*')
                  .eq('user_id', user.id)
                  .gte('received_at', since.toISOString())
                  .order('received_at', { ascending: false })
                  .limit(500)
                  .then(({ data, error }) => {
                    if (error) setError(error.message);
                    else setReadings((data || []) as SensorReading[]);
                    setLoading(false);
                  });
              }}
              className="p-2 text-[#9DB1C4] hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
              aria-label="Refresh readings"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExport}
              disabled={readings.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-white/10 hover:border-cyan-500/30 rounded-lg transition-colors disabled:opacity-40"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Readings', value: stats.count, icon: BarChart3, color: '#16C9F5' },
              { label: 'Minimum AQI', value: stats.min, icon: TrendingDown, color: '#00FF66' },
              { label: 'Maximum AQI', value: stats.max, icon: TrendingUp, color: '#FF9E00' },
              { label: 'Average AQI', value: stats.avg, icon: Activity, color: '#268BFF' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-[#0D2233]/80 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-[#9DB1C4] uppercase tracking-wide">{stat.label}</p>
                  <stat.icon size={14} style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Readings table */}
        <div className="rounded-2xl bg-[#0D2233]/80 border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold">My Reading History</h3>
            <span className="text-xs text-[#9DB1C4]">{readings.length} records</span>
          </div>

          {error ? (
            <div className="p-6 text-center text-sm text-red-400">{error}</div>
          ) : loading ? (
            <div className="p-6 text-center text-sm text-[#9DB1C4]">Loading your readings...</div>
          ) : readings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#9DB1C4]/50">
              <BarChart3 size={32} className="mb-2" />
              <p className="text-sm">No readings found for this period</p>
              <p className="text-xs mt-1">Start monitoring from the dashboard to build your personal history</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[#9DB1C4] border-b border-white/5">
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">AQI</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">PPM</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Location</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.slice(0, 100).map((r) => {
                    const cat = r.estimated_aqi != null ? getCategoryByAQI(r.estimated_aqi) : null;
                    return (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-2.5 text-[#9DB1C4] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock size={10} className="text-[#9DB1C4]/50" />
                            {formatTimeShort(r.received_at)}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 font-semibold" style={{ color: cat?.color || '#9DB1C4' }}>
                          {r.estimated_aqi ?? '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          {cat && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{ color: cat.textColor, backgroundColor: cat.bgColor }}
                            >
                              {cat.name}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-[#9DB1C4] hidden sm:table-cell">{r.estimated_ppm?.toFixed(0) ?? '—'}</td>
                        <td className="px-4 py-2.5 text-[#9DB1C4] hidden md:table-cell max-w-[200px] truncate">{r.location_label || '—'}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            r.reading_type === 'live' ? 'bg-green-500/15 text-green-400' :
                            r.reading_type === 'simulated' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-red-500/15 text-red-400'
                          }`}>
                            {r.reading_type}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
