import { useState, useCallback } from 'react';
import type { RegionalAQI, LocationInfo } from '@/lib/types';

export function useLocationAndRegional() {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [regionalAQI, setRegionalAQI] = useState<RegionalAQI | null>(null);
  const [regionalLoading, setRegionalLoading] = useState(false);
  const [regionalError, setRegionalError] = useState<string | null>(null);

  const resolveAddress = async (latitude: number, longitude: number): Promise<LocationInfo> => {
    let label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    let district: string | null = null;
    let state: string | null = null;
    let country: string | null = null;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        // Extract district — try multiple Nominatim field names
        district =
          addr.county ||
          addr.state_district ||
          addr.district ||
          addr.city_district ||
          addr.city ||
          addr.town ||
          null;

        state = addr.state || null;
        country = addr.country || null;

        // Build readable label: District, State, Country
        const parts = [district, state, country].filter(Boolean);
        if (parts.length > 0) label = parts.join(', ');
      }
    } catch {
      // keep defaults
    }

    return { latitude, longitude, label, district, state, country };
  };

  const detectLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const info = await resolveAddress(latitude, longitude);
        setLocation(info);
        setLocationLoading(false);
        fetchRegionalAQI(latitude, longitude, info.district, info.state);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. You can enter a city manually.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError('Location information is unavailable.');
        } else if (err.code === err.TIMEOUT) {
          setLocationError('Location request timed out.');
        } else {
          setLocationError('Could not detect your location.');
        }
        setLocationLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  }, []);

  const setManualLocation = useCallback(async (lat: number, lon: number, rawLabel: string) => {
    // Try to resolve district/state from coordinates
    const info = await resolveAddress(lat, lon);
    // If the user typed a city name, prefer their label but keep district/state
    const finalInfo: LocationInfo = {
      ...info,
      label: rawLabel || info.label,
    };
    setLocation(finalInfo);
    setLocationError(null);
    fetchRegionalAQI(lat, lon, finalInfo.district, finalInfo.state);
  }, []);

  const fetchRegionalAQI = useCallback(async (
    lat: number,
    lon: number,
    district: string | null,
    state: string | null,
  ) => {
    setRegionalLoading(true);
    setRegionalError(null);
    try {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi&timezone=auto&forecast_days=1&past_days=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();

      const now = new Date();
      const times: string[] = data.hourly?.time || [];
      let closestIdx = 0;
      let minDiff = Infinity;
      times.forEach((t: string, i: number) => {
        const diff = Math.abs(new Date(t).getTime() - now.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      });

      const eaqi = data.hourly?.european_aqi?.[closestIdx] ?? null;
      const usAqi = data.hourly?.us_aqi?.[closestIdx] ?? null;
      const primaryValue = usAqi ?? eaqi;
      const scale = usAqi !== null ? 'US AQI' : eaqi !== null ? 'European AQI' : 'N/A';

      let category: string | null = null;
      if (primaryValue !== null) {
        if (primaryValue <= 50) category = 'Good';
        else if (primaryValue <= 100) category = 'Moderate';
        else if (primaryValue <= 150) category = 'Unhealthy for Sensitive Groups';
        else if (primaryValue <= 200) category = 'Unhealthy';
        else if (primaryValue <= 300) category = 'Very Unhealthy';
        else category = 'Hazardous';
      }

      // Region label: District, State if available; otherwise coordinate string
      const regionLabel = [district, state].filter(Boolean).join(', ') || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

      setRegionalAQI({
        value: primaryValue,
        scale,
        category,
        pollutants: {
          pm2_5: data.hourly?.pm2_5?.[closestIdx] ?? null,
          pm10: data.hourly?.pm10?.[closestIdx] ?? null,
          co: data.hourly?.carbon_monoxide?.[closestIdx] ?? null,
          no2: data.hourly?.nitrogen_dioxide?.[closestIdx] ?? null,
          so2: data.hourly?.sulphur_dioxide?.[closestIdx] ?? null,
          o3: data.hourly?.ozone?.[closestIdx] ?? null,
          european_aqi: eaqi,
          us_aqi: usAqi,
        },
        source: 'Open-Meteo Air Quality API',
        timestamp: times[closestIdx] ? new Date(times[closestIdx]).toISOString() : null,
        region: regionLabel,
        district,
        state,
      });
    } catch (err) {
      setRegionalError(err instanceof Error ? err.message : 'Failed to fetch regional air quality data.');
    } finally {
      setRegionalLoading(false);
    }
  }, []);

  return {
    location,
    locationLoading,
    locationError,
    detectLocation,
    setManualLocation,
    regionalAQI,
    regionalLoading,
    regionalError,
    fetchRegionalAQI,
  };
}
