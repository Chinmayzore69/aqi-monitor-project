import { getCategoryByAQI } from './constants';

export interface LocalCalcResult {
  estimatedAqi: number;
  category: string;
  categoryColor: string;
}

export function adcToAQI(adc: number): number {
  return Math.min(500, Math.round(adc / 8));
}

export function calculateLocalAQI(adc: number): LocalCalcResult | null {
  if (adc < 0 || adc > 4095) return null;
  const estimatedAqi = adcToAQI(adc);
  const cat = getCategoryByAQI(estimatedAqi);
  return {
    estimatedAqi,
    category: cat.name,
    categoryColor: cat.color,
  };
}
