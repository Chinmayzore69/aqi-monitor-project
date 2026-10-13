import type { CalcParams } from './types';
import { DEFAULT_CALC_PARAMS, getCategoryByAQI } from './constants';

export function adcToVoltage(adc: number, params: CalcParams = DEFAULT_CALC_PARAMS): number {
  return (adc / params.adcMax) * params.vref;
}

export function voltageToResistance(vout: number, params: CalcParams = DEFAULT_CALC_PARAMS): number {
  if (vout <= 0) return Infinity;
  return params.rl * (params.vc / vout - 1);
}

export function resistanceToPPM(rs: number, params: CalcParams = DEFAULT_CALC_PARAMS): number {
  const ratio = rs / params.r0;
  if (ratio <= 0 || !isFinite(ratio)) return 0;
  return Math.pow(ratio / params.a, 1 / params.b);
}

export function ppmToExperimentalAQI(ppm: number): number {
  if (ppm <= 400) return Math.max(0, Math.round((ppm / 400) * 25));
  if (ppm <= 1000) return Math.round(25 + ((ppm - 400) / 600) * 55);
  if (ppm <= 2000) return Math.round(80 + ((ppm - 1000) / 1000) * 70);
  if (ppm <= 5000) return Math.round(150 + ((ppm - 2000) / 3000) * 150);
  return Math.min(500, Math.round(300 + ((ppm - 5000) / 5000) * 200));
}

export interface LocalCalcResult {
  voltage: number;
  rs: number;
  rsRoRatio: number;
  ppm: number;
  estimatedAqi: number;
  category: string;
  categoryColor: string;
}

export function calculateLocalAQI(adc: number, params: CalcParams = DEFAULT_CALC_PARAMS): LocalCalcResult | null {
  if (adc < 0 || adc > params.adcMax) return null;
  const voltage = adcToVoltage(adc, params);
  const rs = voltageToResistance(voltage, params);
  if (!isFinite(rs) || rs <= 0) return null;
  const rsRoRatio = rs / params.r0;
  const ppm = resistanceToPPM(rs, params);
  if (!isFinite(ppm) || ppm < 0) return null;
  const estimatedAqi = ppmToExperimentalAQI(ppm);
  const cat = getCategoryByAQI(estimatedAqi);
  return {
    voltage,
    rs,
    rsRoRatio,
    ppm,
    estimatedAqi,
    category: cat.name,
    categoryColor: cat.color,
  };
}

export function calculateFromVoltage(voltage: number, params: CalcParams = DEFAULT_CALC_PARAMS): LocalCalcResult | null {
  if (voltage < 0 || voltage > params.vc) return null;
  const rs = voltageToResistance(voltage, params);
  if (!isFinite(rs) || rs <= 0) return null;
  const rsRoRatio = rs / params.r0;
  const ppm = resistanceToPPM(rs, params);
  if (!isFinite(ppm) || ppm < 0) return null;
  const estimatedAqi = ppmToExperimentalAQI(ppm);
  const cat = getCategoryByAQI(estimatedAqi);
  return {
    voltage,
    rs,
    rsRoRatio,
    ppm,
    estimatedAqi,
    category: cat.name,
    categoryColor: cat.color,
  };
}
