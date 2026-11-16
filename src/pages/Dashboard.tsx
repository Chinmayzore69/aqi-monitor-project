import { useState, useEffect, useCallback } from 'react';
import { AQIGauge } from '@/components/AQIGauge';
import { HealthAnimation } from '@/components/HealthAnimation';
import { TrendChart } from '@/components/TrendChart';
import { DeviceConnectionPanel } from '@/components/DeviceConnectionPanel';
import { NewsSection } from '@/components/NewsSection';
import { Logo } from '@/components/Logo';
import { useDeviceReadings } from '@/hooks/useDeviceData';
import { useDeviceConnection } from '@/hooks/useDeviceConnection';
import { useLocationAndRegional } from '@/hooks/useLocationAndRegional';
import { getCategoryByAQI } from '@/lib/constants';
import { formatTimeUTC } from '@/lib/utils';
import type { SensorReading } from '@/lib/types';
import {
  RefreshCw, MapPin, Wifi, Clock, Activity, TrendingUp,
  TrendingDown, Minus, AlertTriangle, Search, X,
} from 'lucide-react';
import { AccountMenu } from '@/components/AccountMenu';
import { MobileNav } from '@/components/MobileNav';

interface DashboardProps {
  onNavigate: (page: 'landing' | 'history' | 'about' | 'account') => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export function Dashboard({ onNavigate, onOpenAuth }: DashboardProps) {
  const { connection, connectWifi, connectSerial, connectBluetooth, disconnect } = useDeviceConnection();
  const {
    location, locationLoading, locationError, detectLocation, setManualLocation,
    regionalAQI, regionalLoading, regionalError,
  } = useLocationAndRegional();
  const { readings, loading: readingsLoading, refetch } = useDeviceReadings(
    connection.status !== 'not_connected' ? connection.deviceId : null,
    20
  );

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');

  useEffect(() => {
    if (!location && !locationLoading) detectLocation();
  }, []);

  const latestReading: SensorReading | null = connection.lastReading || (readings.length > 0 ? readings[0] : null);
  const localAQI = latestReading?.estimated_aqi ?? null;
  const localCategory = localAQI !== null ? getCategoryByAQI(localAQI) : null;

  const trendData = readings.slice(0, 15).reverse().map((r) => ({
    value: r.estimated_aqi ?? 0,
    label: new Date(r.received_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    timestamp: r.received_at,
  }));

  const handleManualLocation = useCallback(async () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      await setManualLocation(lat, lon, manualCity || `${lat.toFixed(2)}, ${lon.toFixed(2)}`);
      setShowLocationModal(false);
    } else if (manualCity.trim()) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualCity)}&limit=1`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          await setManualLocation(parseFloat(data[0].lat), parseFloat(data[0].lon), manualCity);
          setShowLocationModal(false);
        }
      } catch {
        // keep modal open
      }
    }
  }, [manualCity, manualLat, manualLon, setManualLocation]);

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
              <nav className="hidden lg:flex items-center gap-1" aria-label="Dashboard navigation">
                <button onClick={() => onNavigate('history')} className="px-3 py-1.5 text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors">History</button>
                <button onClick={() => onNavigate('about')} className="px-3 py-1.5 text-[#9DB1C4] hover:text-[#F4F8FC] hover:bg-white/5 rounded-lg transition-colors">About</button>
                <button
                  onClick={() => { refetch(); if (location) detectLocation(); }}
                  className="ml-1 p-2 text-[#9DB1C4] hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                  title="Refresh"
                  aria-label="Refresh data"
                >
                  <RefreshCw size={16} className={readingsLoading ? 'animate-spin' : ''} />
                </button>
              </nav>
              <div className="hidden lg:flex items-center ml-2">
                <AccountMenu onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
              </div>
              <div className="lg:hidden flex items-center gap-1">
                <button
                  onClick={() => { refetch(); if (location) detectLocation(); }}
                  className="p-2 text-[#9DB1C4] hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                  title="Refresh"
                  aria-label="Refresh data"
                >
                  <RefreshCw size={16} className={readingsLoading ? 'animate-spin' : ''} />
                </button>
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
        {/* Top info bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-cyan-400" />
              <div>
                <p className="text-xs text-[#9DB1C4]">Detected Location</p>
                <p className="text-sm font-medium">
                  {location ? location.label : locationLoading ? 'Detecting...' : 'Not detected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-green-400" />
              <div>
                <p className="text-xs text-[#9DB1C4]">Last Updated</p>
                <p className="text-sm font-medium">{formatTimeUTC(latestReading?.received_at || regionalAQI?.timestamp || null)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5">
              <Wifi
                size={14}
                style={{
                  color: connection.status === 'receiving' ? '#27D982'
                    : connection.status === 'connected' ? '#268BFF' : '#9DB1C4',
                }}
              />
              <span className="text-xs text-[#9DB1C4]">
                {connection.status === 'receiving' ? 'Live'
                  : connection.status === 'connected' ? 'Connected'
                  : connection.status === 'connecting' ? 'Connecting' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={() => setShowLocationModal(true)}
              className="px-3 py-1.5 text-xs font-medium border border-white/10 hover:border-cyan-500/30 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Search size={12} /> Change Location
            </button>
          </div>
        </div>

        {locationError && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-200 flex-1">{locationError}</p>
            <button onClick={() => setShowLocationModal(true)} className="text-xs font-medium text-amber-300 hover:text-amber-200 underline">
              Enter manually
            </button>
          </div>
        )}

        {/* Two AQI cards */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Card A: Local AQI */}
          <div className="rounded-2xl bg-[#0D2233]/80 border border-white/5 p-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#F4F8FC]">Local AQI Estimate</h2>
                <p className="text-xs text-[#9DB1C4] mt-0.5">Based on our ESP32 + MQ-135 monitor</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 font-medium">
                Experimental
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <AQIGauge value={localAQI} label="Estimated" size="md" />
              <div className="flex-1 space-y-3 w-full">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#071724]/50">
                    <p className="text-[#9DB1C4] text-[10px] uppercase tracking-wide">Sensor Status</p>
                    <p className="font-medium mt-0.5" style={{ color: connection.status === 'receiving' ? '#27D982' : '#9DB1C4' }}>
                      {connection.status === 'receiving' ? 'Live Data'
                        : connection.status === 'connected' ? 'Connected, Waiting' : 'Disconnected'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#071724]/50">
                    <p className="text-[#9DB1C4] text-[10px] uppercase tracking-wide">Device Location</p>
                    <p className="font-medium mt-0.5 text-[#F4F8FC]">{connection.deviceName || 'Not set'}</p>
                  </div>
                  {latestReading?.adc != null && (
                    <div className="p-2.5 rounded-lg bg-[#071724]/50">
                      <p className="text-[#9DB1C4] text-[10px] uppercase tracking-wide">Raw ADC</p>
                      <p className="font-medium mt-0.5 text-[#F4F8FC]">{latestReading.adc}</p>
                    </div>
                  )}
                  {localAQI !== null && (
                    <div className="p-2.5 rounded-lg bg-[#071724]/50">
                      <p className="text-[#9DB1C4] text-[10px] uppercase tracking-wide">AQI</p>
                      <p className="font-medium mt-0.5" style={{ color: localCategory?.color || '#F4F8FC' }}>
                        {Math.round(localAQI)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-2.5 rounded-lg bg-[#071724]/50">
                  <p className="text-[#9DB1C4] text-[10px] uppercase tracking-wide">Last Reading</p>
                  <p className="font-medium mt-0.5 text-[#F4F8FC]">
                    {latestReading ? formatTimeUTC(latestReading.received_at) : 'No live reading'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-[#9DB1C4] mb-2 flex items-center gap-1.5">
                <Activity size={12} /> Recent Trend
              </p>
              <TrendChart data={trendData} color={localCategory?.color || '#16C9F5'} height={80} />
            </div>

            {!latestReading && (
              <p className="text-[10px] text-[#9DB1C4]/50 italic mt-3">
                {connection.status === 'not_connected'
                  ? 'Connect your ESP32 device to see live local readings.'
                  : 'Waiting for sensor data...'}
              </p>
            )}
            {latestReading && (
              <p className="text-[10px] text-[#9DB1C4]/50 italic mt-3">
                AQI is derived directly from the raw ADC value (adc / 8, capped at 500).
              </p>
            )}
          </div>

          {/* Card B: District/Regional AQI */}
          <div className="rounded-2xl bg-[#0D2233]/80 border border-white/5 p-5 sm:p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-lg font-bold text-[#F4F8FC]">
                  {regionalAQI?.district
                    ? `${regionalAQI.district} District AQI`
                    : regionalAQI?.state
                    ? `${regionalAQI.state} AQI`
                    : 'Regional AQI'}
                </h2>
                <p className="text-xs text-[#9DB1C4] mt-0.5">
                  Air quality at your detected location
                  {regionalAQI?.district && ` · ${regionalAQI.district}${regionalAQI.state ? `, ${regionalAQI.state}` : ''}`}
                </p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/15 text-blue-400 font-medium">
                {regionalAQI?.scale || 'N/A'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <AQIGauge
                value={regionalAQI?.value ?? null}
                label={regionalAQI?.district || regionalAQI?.state || 'District'}
                size="md"
              />
              <div className="flex-1 space-y-3 w-full">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#071724]/50">
                    <p className="text-[#9DB1C4] text-[10px] uppercase tracking-wide">District</p>
                    <p className="font-medium mt-0.5 text-[#F4F8FC]">{regionalAQI?.district || location?.district || 'N/A'}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#071724]/50">
                    <p className="text-[#9DB1C4] text-[10px] uppercase tracking-wide">State</p>
                    <p className="font-medium mt-0.5 text-[#F4F8FC]">{regionalAQI?.state || location?.state || 'N/A'}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#071724]/50">
                    <p className="text-[#9DB1C4] text-[10px] uppercase tracking-wide">Data Source</p>
                    <p className="font-medium mt-0.5 text-[#F4F8FC] text-[11px]">{regionalAQI?.source || 'Open-Meteo'}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#071724]/50">
                    <p className="text-[#9DB1C4] text-[10px] uppercase tracking-wide">Category</p>
                    <p className="font-medium mt-0.5 text-[#F4F8FC]">{regionalAQI?.category || 'N/A'}</p>
                  </div>
                </div>

                {regionalAQI?.pollutants && (
                  <div className="p-2.5 rounded-lg bg-[#071724]/50">
                    <p className="text-[#9DB1C4] text-[10px] uppercase tracking-wide mb-2">Pollutant Concentrations</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: 'PM2.5', value: regionalAQI.pollutants.pm2_5 },
                        { label: 'PM10', value: regionalAQI.pollutants.pm10 },
                        { label: 'NO₂', value: regionalAQI.pollutants.no2 },
                        { label: 'SO₂', value: regionalAQI.pollutants.so2 },
                        { label: 'O₃', value: regionalAQI.pollutants.o3 },
                        { label: 'CO', value: regionalAQI.pollutants.co },
                      ].map((p) => (
                        <div key={p.label} className="text-center">
                          <p className="text-[10px] text-[#9DB1C4]">{p.label}</p>
                          <p className="text-sm font-medium text-[#F4F8FC]">
                            {p.value != null ? p.value.toFixed(1) : '—'}
                          </p>
                          <p className="text-[9px] text-[#9DB1C4]/40">µg/m³</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {regionalError && (
              <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-300">{regionalError}</p>
              </div>
            )}
            {regionalAQI && (
              <p className="text-[10px] text-[#9DB1C4]/50 italic mt-3">
                AQI data predicted for{' '}
                {regionalAQI.district
                  ? `${regionalAQI.district} district`
                  : regionalAQI.state || 'your location'}{' '}
                from coordinates via {regionalAQI.source} ({regionalAQI.scale}).
                Not a ground-station measurement.
              </p>
            )}
          </div>
        </div>

        {/* Comparison + Health Animation */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-2xl bg-[#0D2233]/80 border border-white/5 p-5 sm:p-6">
            <h3 className="text-base font-bold text-[#F4F8FC] mb-4">Local vs District Comparison</h3>
            {localAQI !== null && regionalAQI?.value != null ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#071724]/50 text-center">
                    <p className="text-xs text-[#9DB1C4]">Local Estimate (Sensor)</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: localCategory?.color }}>
                      {Math.round(localAQI)}
                    </p>
                    <p className="text-xs text-[#9DB1C4] mt-1">{localCategory?.name}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#071724]/50 text-center">
                    <p className="text-xs text-[#9DB1C4]">
                      {regionalAQI.district || regionalAQI.state || 'District'} ({regionalAQI.scale})
                    </p>
                    <p
                      className="text-3xl font-bold mt-1"
                      style={{ color: getCategoryByAQI(regionalAQI.value)?.color }}
                    >
                      {Math.round(regionalAQI.value)}
                    </p>
                    <p className="text-xs text-[#9DB1C4] mt-1">{regionalAQI.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5">
                  {(() => {
                    const diff = localAQI - regionalAQI.value;
                    const Icon = diff > 10 ? TrendingUp : diff < -10 ? TrendingDown : Minus;
                    const color = diff > 10 ? '#FF8C42' : diff < -10 ? '#27D982' : '#9DB1C4';
                    return (
                      <>
                        <Icon size={18} style={{ color }} />
                        <span className="text-sm font-medium" style={{ color }}>
                          {diff > 0 ? '+' : ''}{Math.round(diff)} difference
                        </span>
                      </>
                    );
                  })()}
                </div>
                <p className="text-[10px] text-[#9DB1C4]/60 italic text-center">
                  Local AQI is derived directly from the ESP32's raw ADC reading, while the district value is a
                  coordinate-based model estimate ({regionalAQI.scale}). Differences are expected.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[#9DB1C4]">
                  {!latestReading && !regionalAQI
                    ? 'Connect a sensor and allow location access to see the comparison.'
                    : !latestReading
                    ? 'Waiting for local sensor data.'
                    : 'Waiting for district AQI data.'}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-[#0D2233]/80 border border-white/5 p-5 sm:p-6">
            <h3 className="text-base font-bold text-[#F4F8FC] mb-2">Air Quality & You</h3>
            <HealthAnimation aqi={localAQI ?? regionalAQI?.value ?? null} />
          </div>
        </div>

        {/* News Section */}
        <NewsSection
          district={location?.district ?? regionalAQI?.district ?? null}
          state={location?.state ?? regionalAQI?.state ?? null}
          country={location?.country ?? 'India'}
        />

        {/* Device Connection Panel */}
        <DeviceConnectionPanel
          connection={connection}
          onConnectWifi={connectWifi}
          onConnectSerial={connectSerial}
          onConnectBluetooth={connectBluetooth}
          onDisconnect={disconnect}
        />
      </main>

      {/* Location Modal */}
      {showLocationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLocationModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#0D2233] border border-white/10 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Set Location</h3>
              <button onClick={() => setShowLocationModal(false)} className="p-1 text-[#9DB1C4] hover:text-[#F4F8FC]">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-[#9DB1C4]">
              Enter a city or district name to detect your district and fetch region-specific AQI and news.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#9DB1C4] mb-1.5 block">City / District Name</label>
                <input
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  placeholder="e.g., Ponda, Goa"
                  className="w-full px-3 py-2 text-sm bg-[#071724] border border-white/10 rounded-lg text-[#F4F8FC] placeholder-[#9DB1C4]/40 focus:outline-none focus:border-cyan-500/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#9DB1C4] mb-1.5 block">Latitude</label>
                  <input
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="15.4213"
                    className="w-full px-3 py-2 text-sm bg-[#071724] border border-white/10 rounded-lg text-[#F4F8FC] placeholder-[#9DB1C4]/40 focus:outline-none focus:border-cyan-500/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#9DB1C4] mb-1.5 block">Longitude</label>
                  <input
                    value={manualLon}
                    onChange={(e) => setManualLon(e.target.value)}
                    placeholder="73.9991"
                    className="w-full px-3 py-2 text-sm bg-[#071724] border border-white/10 rounded-lg text-[#F4F8FC] placeholder-[#9DB1C4]/40 focus:outline-none focus:border-cyan-500/40"
                  />
                </div>
              </div>
              <button
                onClick={handleManualLocation}
                className="w-full px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg transition-all"
              >
                Set Location
              </button>
              <button
                onClick={() => { detectLocation(); setShowLocationModal(false); }}
                className="w-full px-4 py-2.5 text-sm font-medium border border-white/10 hover:border-cyan-500/30 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <MapPin size={14} /> Detect Automatically
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
