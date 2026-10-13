import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { SensorReading, Device } from '@/lib/types';

export function useDeviceReadings(deviceId: string | null, limit: number = 50) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = useCallback(async () => {
    if (!deviceId) {
      setReadings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('device_id', deviceId)
      .order('received_at', { ascending: false })
      .limit(limit);
    if (error) {
      setError(error.message);
    } else {
      setReadings(data || []);
      setError(null);
    }
    setLoading(false);
  }, [deviceId, limit]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  useEffect(() => {
    if (!deviceId) return;
    const channel = supabase
      .channel(`sensor_readings:${deviceId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings', filter: `device_id=eq.${deviceId}` },
        (payload) => {
          setReadings((prev) => [payload.new as SensorReading, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId, limit]);

  return { readings, loading, error, refetch: fetchReadings };
}

export function useDevice(deviceId: string | null) {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) {
      setDevice(null);
      setLoading(false);
      return;
    }
    supabase
      .from('devices')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle()
      .then(({ data }) => {
        setDevice(data as Device | null);
        setLoading(false);
      });
  }, [deviceId]);

  return { device, loading };
}

export function useRealtimeDeviceStatus(deviceId: string | null) {
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    if (!deviceId) return;
    supabase
      .from('devices')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle()
      .then(({ data }) => setDevice(data as Device | null));

    const channel = supabase
      .channel(`device_status:${deviceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'devices', filter: `device_id=eq.${deviceId}` },
        (payload) => {
          setDevice(payload.new as Device);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId]);

  return device;
}
