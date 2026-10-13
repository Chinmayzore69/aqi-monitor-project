interface TrendChartProps {
  data: { value: number; label: string; timestamp: string }[];
  color?: string;
  height?: number;
  max?: number;
}

export function TrendChart({ data, color = '#16C9F5', height = 120, max = 500 }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-[#9DB1C4]/50" style={{ height }}>
        No trend data yet
      </div>
    );
  }

  const points = data.slice().reverse();
  const width = 100;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const maxValue = Math.max(max, ...points.map((p) => p.value));

  const pathD = points
    .map((p, i) => {
      const x = i * step;
      const y = height - (p.value / maxValue) * (height - 10) - 5;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  const areaD = pathD + ` L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height }}
      >
        <defs>
          <linearGradient id={`trend-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#trend-grad-${color.replace('#', '')})`} />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => {
          const x = i * step;
          const y = height - (p.value / maxValue) * (height - 10) - 5;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1.5}
              fill={color}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-[9px] text-[#9DB1C4]/50 mt-1">
        <span>{points[0]?.label || ''}</span>
        <span>{points[points.length - 1]?.label || ''}</span>
      </div>
    </div>
  );
}

interface HistoryChartProps {
  data: { value: number; timestamp: string }[];
  height?: number;
}

export function HistoryChart({ data, height = 200 }: HistoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-[#9DB1C4]/50" style={{ height }}>
        No historical readings to display
      </div>
    );
  }

  const points = data.slice().reverse();
  const width = 100;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const maxValue = Math.max(500, ...points.map((p) => p.value));

  const pathD = points
    .map((p, i) => {
      const x = i * step;
      const y = height - (p.value / maxValue) * (height - 20) - 10;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');

  const areaD = pathD + ` L ${width} ${height} L 0 ${height} Z`;

  // Grid lines at AQI thresholds
  const thresholds = [50, 100, 200, 300, 400, 500];

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height }}
      >
        <defs>
          <linearGradient id="history-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16C9F5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#16C9F5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {thresholds.map((t) => {
          const y = height - (t / maxValue) * (height - 20) - 10;
          return (
            <g key={t}>
              <line
                x1="0"
                y1={y}
                x2={width}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="2 2"
              />
              <text
                x="2"
                y={y - 1}
                fill="rgba(159,177,196,0.4)"
                fontSize="6"
                vectorEffect="non-scaling-stroke"
              >
                {t}
              </text>
            </g>
          );
        })}
        <path d={areaD} fill="url(#history-grad)" />
        <path
          d={pathD}
          fill="none"
          stroke="#16C9F5"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
