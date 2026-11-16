import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { DeviceConnectionState, SensorReading } from '@/lib/types';

export function useDeviceConnection() {
  const [connection, setConnection] = useState<DeviceConnectionState>({
    status: 'not_connected',
    method: 'wifi',
    deviceName: '',
    deviceId: '',
    lastReading: null,
    lastDataTime: null,
    error: null,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connectWifi = useCallback(async (deviceId: string, deviceName: string) => {
    setConnection((prev) => ({
      ...prev,
      status: 'connecting',
      method: 'wifi',
      deviceId,
      deviceName,
      error: null,
    }));

    try {
      // Check if device exists and has recent readings
      const { data: device } = await supabase
        .from('devices')
        .select('*')
        .eq('device_id', deviceId)
        .maybeSingle();

      const { data: readings } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('device_id', deviceId)
        .order('received_at', { ascending: false })
        .limit(1);

      if (device) {
        const lastReading = readings && readings.length > 0 ? readings[0] as SensorReading : null;
        const lastTime = lastReading ? new Date(lastReading.received_at) : null;
        const isRecent = lastTime && (Date.now() - lastTime.getTime()) < 5 * 60 * 1000;

        setConnection((prev) => ({
          ...prev,
          status: isRecent ? 'receiving' : 'connected',
          lastReading,
          lastDataTime: lastTime,
        }));

        // Start polling for new readings
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
          const { data: latest } = await supabase
            .from('sensor_readings')
            .select('*')
            .eq('device_id', deviceId)
            .order('received_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latest) {
            const reading = latest as SensorReading;
            const readingTime = new Date(reading.received_at);
            const isRecent = Date.now() - readingTime.getTime() < 5 * 60 * 1000;
            setConnection((prev) => ({
              ...prev,
              status: isRecent ? 'receiving' : 'connection_lost',
              lastReading: reading,
              lastDataTime: readingTime,
              error: isRecent ? null : 'No recent data from device. Check device connection.',
            }));
          }
        }, 10000);
      } else {
        // Device not registered yet — connected but no data
        setConnection((prev) => ({
          ...prev,
          status: 'connected',
          error: 'Device registered but no readings yet. Waiting for ESP32 to send data...',
        }));
      }
    } catch (err) {
      setConnection((prev) => ({
        ...prev,
        status: 'connection_lost',
        error: err instanceof Error ? err.message : 'Connection failed.',
      }));
    }
  }, []);

  const connectSerial = useCallback(async (deviceId: string, deviceName: string) => {
    if (!('serial' in navigator)) {
      setConnection((prev) => ({
        ...prev,
        error: 'Web Serial API is not supported in this browser. Try Chrome or Edge on desktop.',
      }));
      return;
    }

    setConnection((prev) => ({
      ...prev,
      status: 'connecting',
      method: 'serial',
      deviceId,
      deviceName,
      error: null,
    }));

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });

      const decoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();

      setConnection((prev) => ({ ...prev, status: 'receiving' }));

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          try {
            const data = JSON.parse(line.trim());
            if (data.device_id && data.adc !== undefined) {
              // Send to edge function for storage + calculation
              const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sensor-ingest`;
              await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify(data),
              });
            }
          } catch {
            // not JSON, skip
          }
        }
      }
    } catch (err) {
      setConnection((prev) => ({
        ...prev,
        status: 'connection_lost',
        error: err instanceof Error ? err.message : 'Serial connection failed.',
      }));
    }
  }, []);

  const connectBluetooth = useCallback(async (deviceId: string, deviceName: string) => {
    if (!('bluetooth' in navigator)) {
      setConnection((prev) => ({
        ...prev,
        method: 'bluetooth',
        error: 'Web Bluetooth is not supported in this browser. Try Chrome or Edge on desktop.',
      }));
      return;
    }

    setConnection((prev) => ({
      ...prev,
      status: 'connecting',
      method: 'bluetooth',
      deviceId,
      deviceName,
      error: null,
    }));

    try {
      const bluetooth = (navigator as Navigator & { bluetooth: { requestDevice: (options: object) => Promise<unknown> } }).bluetooth;
      await bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: [] });
      setConnection((prev) => ({
        ...prev,
        status: 'connection_lost',
        error: 'Bluetooth device selected. Live readings require the ESP32 firmware to expose a compatible GATT service.',
      }));
    } catch (err) {
      setConnection((prev) => ({
        ...prev,
        status: 'connection_lost',
        error: err instanceof Error ? err.message : 'Bluetooth connection was cancelled or failed.',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setConnection({
      status: 'not_connected',
      method: 'wifi',
      deviceName: '',
      deviceId: '',
      lastReading: null,
      lastDataTime: null,
      error: null,
    });
  }, []);

  return { connection, connectWifi, connectSerial, connectBluetooth, disconnect, setConnection };
}
