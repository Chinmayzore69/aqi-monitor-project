import { getCategoryByAQI } from '@/lib/constants';

interface HealthAnimationProps {
  aqi: number | null;
}

export function HealthAnimation({ aqi }: HealthAnimationProps) {
  const validAqi = aqi !== null && !isNaN(aqi);
  const category = validAqi ? getCategoryByAQI(aqi!) : null;

  // Determine animation state based on AQI
  let state: 'good' | 'moderate' | 'poor' | 'veryPoor' | 'severe' | 'unknown' = 'unknown';
  if (validAqi) {
    if (aqi! <= 100) state = 'good';
    else if (aqi! <= 200) state = 'moderate';
    else if (aqi! <= 300) state = 'poor';
    else if (aqi! <= 400) state = 'veryPoor';
    else state = 'severe';
  }

  const stateConfig = {
    good: {
      color: '#27D982',
      label: 'Comfortable Breathing',
      description: 'Air quality is good. Enjoy outdoor activities!',
      emoji: '😊',
      animation: 'breathe-good',
    },
    moderate: {
      color: '#F7E535',
      label: 'Mild Concern',
      description: 'Air quality is moderate. Sensitive groups should be cautious.',
      emoji: '😐',
      animation: 'breathe-moderate',
    },
    poor: {
      color: '#FF8C42',
      label: 'Wearing a Mask',
      description: 'Air quality is poor. Consider wearing a mask outdoors.',
      emoji: '😷',
      animation: 'breathe-poor',
    },
    veryPoor: {
      color: '#FF3B3B',
      label: 'Mask Recommended',
      description: 'Air quality is very poor. Limit outdoor exposure.',
      emoji: '😷',
      animation: 'breathe-very-poor',
    },
    severe: {
      color: '#8B0000',
      label: 'Stay Indoors',
      description: 'Air quality is severe. Stay indoors and use air purifiers.',
      emoji: '🏠',
      animation: 'breathe-severe',
    },
    unknown: {
      color: '#9DB1C4',
      label: 'No Data',
      description: 'Connect a sensor to see real-time air quality health info.',
      emoji: '❓',
      animation: 'breathe-unknown',
    },
  }[state];

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      <div
        className={`relative flex items-center justify-center health-anim ${stateConfig.animation}`}
        style={{ width: 80, height: 80 }}
      >
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30"
          style={{ backgroundColor: stateConfig.color }}
        />
        {/* Person circle */}
        <div
          className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2"
          style={{
            borderColor: stateConfig.color,
            backgroundColor: `${stateConfig.color}15`,
          }}
        >
          {stateConfig.emoji}
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: stateConfig.color }}>
          {stateConfig.label}
        </p>
        <p className="text-xs text-[#9DB1C4] mt-1 max-w-[240px]">
          {stateConfig.description}
        </p>
      </div>
      {category && (
        <p className="text-[10px] text-[#9DB1C4]/60 italic max-w-[260px] text-center">
          This animation is for visual awareness only and does not diagnose health risks.
        </p>
      )}
    </div>
  );
}
