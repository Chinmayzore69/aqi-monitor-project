import type { CalcParams } from './types';

export const DEFAULT_CALC_PARAMS: CalcParams = {
  vref: 3.3,
  adcMax: 4095,
  rl: 10.0,
  vc: 5.0,
  r0: 100.0,
  a: 116.6020682,
  b: -2.769034857,
};

export interface AQICategory {
  name: string;
  min: number;
  max: number;
  color: string;
  textColor: string;
  bgColor: string;
  description: string;
  healthAdvice: string;
}

export const CPCB_CATEGORIES: AQICategory[] = [
  {
    name: 'Good',
    min: 0,
    max: 50,
    color: '#00FF66',
    textColor: '#001A0D',
    bgColor: 'rgba(0, 255, 102, 0.3)',
    description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    healthAdvice: 'Enjoy outdoor activities. Air quality is ideal for everyone.',
  },
  {
    name: 'Satisfactory',
    min: 51,
    max: 100,
    color: '#80FF00',
    textColor: '#0D1A00',
    bgColor: 'rgba(128, 255, 0, 0.3)',
    description: 'Air quality is acceptable; however, there may be moderate health concerns for sensitive individuals.',
    healthAdvice: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.',
  },
  {
    name: 'Moderate',
    min: 101,
    max: 200,
    color: '#FFFF00',
    textColor: '#222200',
    bgColor: 'rgba(255, 255, 0, 0.3)',
    description: 'May cause breathing discomfort to people with lung disease and discomfort to children and older adults.',
    healthAdvice: 'Sensitive groups should limit prolonged outdoor exertion.',
  },
  {
    name: 'Poor',
    min: 201,
    max: 300,
    color: '#FF9E00',
    textColor: '#1A0F00',
    bgColor: 'rgba(255, 158, 0, 0.3)',
    description: 'May cause breathing discomfort to people on prolonged exposure and discomfort to people with heart disease.',
    healthAdvice: 'Children, older adults, and people with heart or lung disease should avoid prolonged outdoor exertion.',
  },
  {
    name: 'Very Poor',
    min: 301,
    max: 400,
    color: '#FF2222',
    textColor: '#ffffff',
    bgColor: 'rgba(255, 34, 34, 0.35)',
    description: 'May cause respiratory illness to people on prolonged exposure. Health alert for everyone.',
    healthAdvice: 'Everyone should avoid prolonged outdoor exertion. Stay indoors if possible.',
  },
  {
    name: 'Severe',
    min: 401,
    max: 500,
    color: '#FF0000',
    textColor: '#ffffff',
    bgColor: 'rgba(255, 0, 0, 0.4)',
    description: 'May cause serious health effects even on short exposure. Emergency conditions for the entire population.',
    healthAdvice: 'Everyone should stay indoors and minimize outdoor activity. Use air purifiers if available.',
  },
];

export function getCategoryByAQI(aqi: number): AQICategory {
  return CPCB_CATEGORIES.find((c) => aqi >= c.min && aqi <= c.max) || CPCB_CATEGORIES[CPCB_CATEGORIES.length - 1];
}

export const BRAND_COLORS = {
  bgPrimary: '#071724',
  bgSecondary: '#0D2233',
  neonCyan: '#16C9F5',
  electricBlue: '#268BFF',
  green: '#27D982',
  textMain: '#F4F8FC',
  textSecondary: '#9DB1C4',
};
