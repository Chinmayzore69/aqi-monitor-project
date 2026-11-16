import { useState, useMemo, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { HistoryChart } from '@/components/TrendChart';
import { supabase } from '@/lib/supabase';
import { getCategoryByAQI } from '@/lib/constants';
import { formatTimeUTC, formatTimeShort, exportToCSV } from '@/lib/utils';
import type { SensorReading } from '@/lib/types';
import {
  RefreshCw, Download, Search, Calendar, Activity, ArrowLeft,
  TrendingUp, TrendingDown, BarChart3, Inbox,
} from 'lucide-react';
import { AccountMenu } from '@/components/AccountMenu';
import { MobileNav } from '@/components/MobileNav';

interface HistoryPageProps {
  onNavigate: (page: 'landing' | 'dashboard' | 'about' | 'account') => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

type FilterPeriod = 'daily' | 'weekly' | 'monthly';

export function HistoryPage({ onNavigate, onOpenAuth }: HistoryPageProps) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<FilterPeriod>('daily');
  const [search, setSearch] = useState('');
  const [deviceId, setDeviceId] = useState('esp32-01');
  const [selectedReading, setSelectedReading] = useState<SensorReading | null>(null);

  const fetchReadings = async () => {
    setLoading(true);
    setError(null);

    const now = new Date();
    let since = new Date();
    if (period === 'daily') since.setDate(now.getDate() - 1);
    else if (period === 'weekly') since.setDate(now.getDate() - 7);
    else if (period === 'monthly') since.setMonth(now.getMonth() - 1);

    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('device_id', deviceId)
      .gte('received_at', since.toISOString())
      .order('received_at', { ascending: false })
      .limit(1000);

    if (error) {
      setError(error.message);
    } else {
      setReadings((data || []) as SensorReading[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReadings();
  }, [period, deviceId]);

  const filteredReadings = useMemo(() => {
    if (!search) return readings;
    const q = search.toLowerCase();
    return readings.filter(
      (r) =>
        r.location_label?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.reading_type?.toLowerCase().includes(q) ||
        r.device_id?.toLowerCase().includes(q)
    );
  }, [readings, search]);

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

  const chartData = useMemo(() => {
    return readings.slice(0, 100).reverse().map((r) => ({
      value: r.estimated_aqi ?? 0,
      timestamp: r.received_at,
    }));
  }, [readings]);

  const handleExport = () => {
    const exportData = filteredReadings.map((r) => ({
      received_at: r.received_at,
      device_id: r.device_id,
      estimated_aqi: r.estimated_aqi,
      category: r.category,
      adc: r.adc,
      reading_type: r.reading_type,
      location_label: r.location_label,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
    exportToCSV(exportData, `aqi-history-${period}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="min-h-screen bg-[#071724] text-[#F4F8FC]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-cyan-300/30 bg-gradient-to-r from-[#0D2233] via-[#14506A] to-[#0D2233] shadow-xl shadow-cyan-950/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => onNavigate('landing')} className="hover:opacity-80 transition-opacity">
              <Logo size="sm" />
            </button>
            <div className="flex items-center gap-1 text-sm">
              <nav className="hidden lg:flex items-center gap-1" aria-label="History page navigation">
                <button onClick={() => onNavigate('dashboard')} className="px-3 py-1.5 text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors">Dashboard</button>
                <button onClick={() => onNavigate('about')} className="px-3 py-1.5 text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors">About</button>
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

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Reading History</h1>
            <p className="text-sm text-[#9DB1C4] mt-1">Historical local sensor readings with timestamps and locations</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchReadings}
              className="p-2 text-[#9DB1C4] hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExport}
              disabled={filteredReadings.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-white/10 hover:border-cyan-500/30 rounded-lg transition-colors disabled:opacity-40"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0D2233]/60 border border-white/5">
            {(['daily', 'weekly', 'monthly'] as FilterPeriod[]).map((p) => (
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D2233]/60 border border-white/5">
            <Calendar size={14} className="text-[#9DB1C4]" />
            <input
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="Device ID"
              className="bg-transparent text-xs text-[#F4F8FC] placeholder-[#9DB1C4]/40 focus:outline-none w-24"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D2233]/60 border border-white/5 flex-1 min-w-[200px]">
            <Search size={14} className="text-[#9DB1C4]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by location, category, or type..."
              className="bg-transparent text-xs text-[#F4F8FC] placeholder-[#9DB1C4]/40 focus:outline-none flex-1"
            />
          </div>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Readings', value: stats.count, icon: BarChart3, color: '#16C9F5' },
              { label: 'Minimum AQI', value: stats.min, icon: TrendingDown, color: '#27D982' },
              { label: 'Maximum AQI', value: stats.max, icon: TrendingUp, color: '#FF8C42' },
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

        {/* Chart */}
        <div className="rounded-2xl bg-[#0D2233]/80 border border-white/5 p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" /> AQI Trend ({period})
          </h3>
          {chartData.length > 0 ? (
            <HistoryChart data={chartData} height={220} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-[#9DB1C4]/50">
              <Inbox size={32} className="mb-2" />
              <p className="text-sm">No historical readings for this period</p>
              <p className="text-xs mt-1">Connect a device and start monitoring to build history</p>
            </div>
          )}
        </div>

        {/* Readings table */}
        <div className="rounded-2xl bg-[#0D2233]/80 border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Individual Readings</h3>
            <span className="text-xs text-[#9DB1C4]">{filteredReadings.length} records</span>
          </div>

          {error ? (
            <div className="p-6 text-center text-sm text-red-400">{error}</div>
          ) : loading ? (
            <div className="p-6 text-center text-sm text-[#9DB1C4]">Loading readings...</div>
          ) : filteredReadings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#9DB1C4]/50">
              <Inbox size={32} className="mb-2" />
              <p className="text-sm">No readings found</p>
              <p className="text-xs mt-1">Try a different time period or device ID</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[#9DB1C4] border-b border-white/5">
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">AQI</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">ADC</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Location</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReadings.slice(0, 100).map((r) => {
                    const cat = r.estimated_aqi != null ? getCategoryByAQI(r.estimated_aqi) : null;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedReading(r)}
                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-2.5 text-[#9DB1C4] whitespace-nowrap">{formatTimeShort(r.received_at)}</td>
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
                        <td className="px-4 py-2.5 text-[#9DB1C4] hidden sm:table-cell">{r.adc ?? '—'}</td>
                        <td className="px-4 py-2.5 text-[#9DB1C4] hidden lg:table-cell max-w-[200px] truncate">{r.location_label || '—'}</td>
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

      {/* Detail modal */}
      {selectedReading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedReading(null)}>
          <div className="w-full max-w-md rounded-2xl bg-[#0D2233] border border-white/10 p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Reading Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-[#9DB1C4]">Received At</p><p className="font-medium">{formatTimeUTC(selectedReading.received_at)}</p></div>
              <div><p className="text-xs text-[#9DB1C4]">Device Timestamp</p><p className="font-medium">{formatTimeUTC(selectedReading.device_timestamp)}</p></div>
              <div><p className="text-xs text-[#9DB1C4]">Estimated AQI</p><p className="font-medium" style={{ color: getCategoryByAQI(selectedReading.estimated_aqi || 0)?.color }}>{selectedReading.estimated_aqi ?? '—'}</p></div>
              <div><p className="text-xs text-[#9DB1C4]">Category</p><p className="font-medium">{selectedReading.category ?? '—'}</p></div>
              <div><p className="text-xs text-[#9DB1C4]">ADC</p><p className="font-medium">{selectedReading.adc ?? '—'}</p></div>
              <div><p className="text-xs text-[#9DB1C4]">Type</p><p className="font-medium capitalize">{selectedReading.reading_type}</p></div>
              <div className="col-span-2"><p className="text-xs text-[#9DB1C4]">Location</p><p className="font-medium">{selectedReading.location_label || 'Not specified'}</p></div>
              <div className="col-span-2"><p className="text-xs text-[#9DB1C4]">Device ID</p><p className="font-medium">{selectedReading.device_id}</p></div>
            </div>
            <button onClick={() => setSelectedReading(null)} className="w-full px-4 py-2.5 text-sm font-medium border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
