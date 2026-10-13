interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  imageOnly?: boolean;
}

export function Logo({ size = 'md', showTagline = false, imageOnly = false }: LogoProps) {
  const dims = {
    sm: { img: 'h-9 w-9', title: 'text-sm', tagline: 'text-[8px]' },
    md: { img: 'h-12 w-12', title: 'text-base', tagline: 'text-[9px]' },
    lg: { img: 'h-28 w-28', title: 'text-2xl', tagline: 'text-xs' },
  }[size];

  if (imageOnly) {
    return (
      <img
        src="/images/Air_Quality_Marker_Badge.png"
        alt="AQI Air Quality Marker"
        className={`${dims.img} rounded-full object-cover ring-2 ring-cyan-500/20`}
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src="/images/Air_Quality_Marker_Badge.png"
        alt="AQI Air Quality Marker logo"
        className={`${dims.img} rounded-full object-cover flex-shrink-0 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/20`}
      />
      <div className="flex flex-col leading-tight">
        <span className={`${dims.title} font-bold text-[#F4F8FC] tracking-tight`}>
          AQI Monitor
        </span>
        {showTagline && (
          <span className={`${dims.tagline} text-[#9DB1C4] font-medium tracking-wide`}>
            Cleaner Air • Healthier Tomorrow
          </span>
        )}
      </div>
    </div>
  );
}
