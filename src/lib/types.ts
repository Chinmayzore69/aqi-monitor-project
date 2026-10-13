export interface Device {
  id: string;
  device_id: string;
  name: string;
  connection_method: string;
  status: 'not_connected' | 'connecting' | 'connected' | 'receiving' | 'connection_lost';
  last_seen_at: string | null;
  created_at: string;
}

export interface DeviceLocation {
  id: string;
  device_id: string;
  label: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface SensorReading {
  id: string;
  device_id: string;
  adc: number | null;
  voltage: number | null;
  rs: number | null;
  rs_ro_ratio: number | null;
  estimated_ppm: number | null;
  estimated_aqi: number | null;
  category: string | null;
  reading_type: 'live' | 'simulated' | 'invalid';
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  received_at: string;
  device_timestamp: string | null;
}

export interface RegionalAQI {
  value: number | null;
  scale: string;
  category: string | null;
  pollutants: PollutantData;
  source: string;
  timestamp: string | null;
  region: string;
  district: string | null;
  state: string | null;
}

export interface PollutantData {
  pm2_5?: number | null;
  pm10?: number | null;
  no2?: number | null;
  so2?: number | null;
  o3?: number | null;
  co?: number | null;
  european_aqi?: number | null;
  us_aqi?: number | null;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  label: string;
  district: string | null;
  state: string | null;
  country: string | null;
}

export interface DeviceConnectionState {
  status: 'not_connected' | 'connecting' | 'connected' | 'receiving' | 'connection_lost';
  method: 'wifi' | 'serial' | 'bluetooth';
  deviceName: string;
  deviceId: string;
  lastReading: SensorReading | null;
  lastDataTime: Date | null;
  error: string | null;
}

export interface CalcParams {
  vref: number;
  adcMax: number;
  rl: number;
  vc: number;
  r0: number;
  a: number;
  b: number;
}

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage: string | null;
}
