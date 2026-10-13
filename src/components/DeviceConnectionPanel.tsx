import { useState } from 'react';
import { Wifi, Usb, Bluetooth, CheckCircle2, AlertCircle, Loader2, XCircle, Radio } from 'lucide-react';
import type { DeviceConnectionState } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

interface DeviceConnectionPanelProps {
  connection: DeviceConnectionState;
  onConnectWifi: (deviceId: string, deviceName: string) => void;
  onConnectSerial: (deviceId: string, deviceName: string) => void;
  onConnectBluetooth: (deviceId: string, deviceName: string) => void;
  onDisconnect: () => void;
}

export function DeviceConnectionPanel({
  connection,
  onConnectWifi,
  onConnectSerial,
  onConnectBluetooth,
  onDisconnect,
}: DeviceConnectionPanelProps) {
  const [method, setMethod] = useState<'wifi' | 'serial' | 'bluetooth'>('wifi');
  const [deviceId, setDeviceId] = useState('esp32-01');
  const [deviceName, setDeviceName] = useState('MQ-135 Sensor');
  const [installLocation, setInstallLocation] = useState('GEC Farmagudi, Ponda, Goa');

  const statusConfig = {
    not_connected: { icon: XCircle, color: '#9DB1C4', label: 'Not Connected' },
    connecting: { icon: Loader2, color: '#F7E535', label: 'Connecting...', spin: true },
    connected: { icon: CheckCircle2, color: '#268BFF', label: 'Connected' },
    receiving: { icon: Radio, color: '#27D982', label: 'Receiving Data', pulse: true },
    connection_lost: { icon: AlertCircle, color: '#FF3B3B', label: 'Connection Lost' },
  }[connection.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="rounded-2xl bg-[#0D2233]/80 border border-white/5 p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#F4F8FC]">Device Connection</h3>
          <p className="text-xs text-[#9DB1C4] mt-0.5">Connect your ESP32 + MQ-135 sensor</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${statusConfig.color}15` }}>
          <StatusIcon
            size={16}
            style={{ color: statusConfig.color }}
            className={statusConfig.spin ? 'animate-spin' : statusConfig.pulse ? 'animate-pulse' : ''}
          />
          <span className="text-xs font-medium" style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {connection.status === 'not_connected' || connection.status === 'connection_lost' ? (
        <>
          {/* Method selector */}
          <div>
            <label className="text-xs font-medium text-[#9DB1C4] mb-2 block">Connection Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setMethod('wifi')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  method === 'wifi'
                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400'
                    : 'bg-white/5 border border-white/5 text-[#9DB1C4] hover:bg-white/10'
                }`}
              >
                <Wifi size={14} /> Wi-Fi (HTTP)
              </button>
              <button
                onClick={() => setMethod('serial')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  method === 'serial'
                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400'
                    : 'bg-white/5 border border-white/5 text-[#9DB1C4] hover:bg-white/10'
                }`}
              >
                <Usb size={14} /> USB Serial
              </button>
              <button
                onClick={() => setMethod('bluetooth')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  method === 'bluetooth'
                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400'
                    : 'bg-white/5 border border-white/5 text-[#C7E8F3] hover:bg-white/10'
                }`}
              >
                <Bluetooth size={14} /> Bluetooth
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#9DB1C4] mb-1.5 block">Device ID</label>
              <input
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="esp32-01"
                className="w-full px-3 py-2 text-sm bg-[#071724] border border-white/10 rounded-lg text-[#F4F8FC] placeholder-[#9DB1C4]/40 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#9DB1C4] mb-1.5 block">Device Name</label>
              <input
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="MQ-135 Sensor"
                className="w-full px-3 py-2 text-sm bg-[#071724] border border-white/10 rounded-lg text-[#F4F8FC] placeholder-[#9DB1C4]/40 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#9DB1C4] mb-1.5 block">Installation Location</label>
            <input
              value={installLocation}
              onChange={(e) => setInstallLocation(e.target.value)}
              placeholder="Where is the sensor physically installed?"
              className="w-full px-3 py-2 text-sm bg-[#071724] border border-white/10 rounded-lg text-[#F4F8FC] placeholder-[#9DB1C4]/40 focus:outline-none focus:border-cyan-500/40"
            />
            <p className="text-[10px] text-[#9DB1C4]/50 mt-1">
              This is where the physical monitor is installed, which may differ from your current location.
            </p>
          </div>

          <button
            onClick={() => method === 'wifi'
              ? onConnectWifi(deviceId, deviceName)
              : method === 'serial'
              ? onConnectSerial(deviceId, deviceName)
              : onConnectBluetooth(deviceId, deviceName)}
            disabled={!deviceId.trim()}
            className="w-full px-4 py-3 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect Device
          </button>

          {connection.error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{connection.error}</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Connected state — show device info */}
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-[#071724]/50">
              <p className="text-[10px] text-[#9DB1C4] uppercase tracking-wide">Device</p>
              <p className="text-[#F4F8FC] font-medium mt-0.5">{connection.deviceName}</p>
              <p className="text-xs text-[#9DB1C4]">{connection.deviceId}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#071724]/50">
              <p className="text-[10px] text-[#9DB1C4] uppercase tracking-wide">Method</p>
              <p className="text-[#F4F8FC] font-medium mt-0.5 capitalize flex items-center gap-1.5">
                {connection.method === 'wifi' ? <Wifi size={12} /> : connection.method === 'serial' ? <Usb size={12} /> : <Bluetooth size={12} />}
                {connection.method === 'wifi' ? 'Wi-Fi (HTTP)' : connection.method === 'serial' ? 'USB Serial' : 'Bluetooth'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#071724]/50">
              <p className="text-[10px] text-[#9DB1C4] uppercase tracking-wide">Last Data</p>
              <p className="text-[#F4F8FC] font-medium mt-0.5">{timeAgo(connection.lastDataTime)}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#071724]/50">
              <p className="text-[10px] text-[#9DB1C4] uppercase tracking-wide">Latest Reading</p>
              <p className="text-[#F4F8FC] font-medium mt-0.5">
                {connection.lastReading
                  ? `AQI ${connection.lastReading.estimated_aqi ?? '—'}`
                  : 'No reading yet'}
              </p>
              {connection.lastReading?.voltage != null && (
                <p className="text-xs text-[#9DB1C4]">{connection.lastReading.voltage.toFixed(2)} V</p>
              )}
            </div>
          </div>

          {connection.error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">{connection.error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onDisconnect}
              className="flex-1 px-4 py-2.5 text-sm font-medium border border-white/10 hover:border-red-500/30 text-[#F4F8FC] hover:text-red-400 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        </>
      )}

      {/* Info note */}
      <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
        <p className="text-[10px] text-[#9DB1C4] leading-relaxed">
          <strong className="text-cyan-400">Wi-Fi:</strong> Your ESP32 sends readings to our server endpoint automatically.
          <br />
          <strong className="text-blue-400">USB Serial:</strong> Connect directly via Chrome/Edge Web Serial. The browser forwards readings to the server.
          <br />
          <strong className="text-green-400">Bluetooth:</strong> Select a nearby ESP32. Live readings require a matching Bluetooth GATT service in the firmware.
        </p>
      </div>
    </div>
  );
}
