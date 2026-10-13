import { getCategoryByAQI } from '@/lib/constants';

interface AQIGaugeProps {
  value: number | null;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function AQIGauge({ value, label, size = 'md', animate = true }: AQIGaugeProps) {
  const dims = {
    sm: { size: 120, stroke: 8, fontSize: 28 },
    md: { size: 180, stroke: 10, fontSize: 42 },
    lg: { size: 240, stroke: 12, fontSize: 56 },
  }[size];

  const radius = (dims.size - dims.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const validValue = value !== null && !isNaN(value);
  const displayValue = validValue ? Math.min(500, Math.max(0, value!)) : 0;
  const progress = validValue ? displayValue / 500 : 0;
  const dashOffset = circumference * (1 - progress * 0.75);
  const category = validValue ? getCategoryByAQI(displayValue) : null;
  const color = category?.color || '#9DB1C4';

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: dims.size, height: dims.size }}>
      <svg width={dims.size} height={dims.size} className="-rotate-[135deg]">
        <defs>
          <linearGradient id={`gauge-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16C9F5" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id={`gauge-glow-${size}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background track */}
        <circle
          cx={dims.size / 2}
          cy={dims.size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={dims.stroke}
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        {validValue && (
          <circle
            cx={dims.size / 2}
            cy={dims.size / 2}
            r={radius}
            fill="none"
            stroke={`url(#gauge-grad-${size})`}
            strokeWidth={dims.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            filter={`url(#gauge-glow-${size})`}
            style={{
              transition: animate ? 'stroke-dashoffset 1s ease-out' : 'none',
            }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold tabular-nums"
          style={{ fontSize: dims.fontSize, color: validValue ? color : '#9DB1C4' }}
        >
          {validValue ? Math.round(displayValue) : '—'}
        </span>
        {label && (
          <span className="text-xs text-[#9DB1C4] mt-1">{label}</span>
        )}
        {category && (
          <span
            className="text-xs font-semibold mt-0.5 px-2 py-0.5 rounded-full"
            style={{ color: category.textColor, backgroundColor: category.bgColor }}
          >
            {category.name}
          </span>
        )}
      </div>
    </div>
  );
}
