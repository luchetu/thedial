import React from "react";

type WaveLoaderProps = {
  size?: number; // height in px
  width?: number; // total width in px
  bars?: number; // number of waves
  className?: string;
};

// Simple brand-friendly wave equalizer that inherits currentColor
export function WaveLoader({ size = 14, width = 24, bars = 4, className }: WaveLoaderProps) {
  const barWidth = width / (bars * 2 - 1);
  const heights = [0.35, 0.7, 1, 0.7];
  const items = Array.from({ length: bars });
  return (
    <span className={className} aria-hidden>
      <svg width={width} height={size} viewBox={`0 0 ${width} ${size}`} fill="currentColor" role="img">
        {items.map((_, i) => {
          const h = heights[i % heights.length] * size;
          const x = i * barWidth * 1.5;
          return (
            <rect
              key={i}
              x={x}
              y={(size - h) / 2}
              width={barWidth}
              height={h}
              rx={barWidth / 2}
              style={{ animation: `wavePulse 1.2s ${i * 0.12}s infinite ease-in-out` }}
            />
          );
        })}
      </svg>
      <style jsx>{`
        @keyframes wavePulse {
          0%, 100% { opacity: 0.35; transform: scaleY(0.6); }
          40%, 60% { opacity: 1; transform: scaleY(1); }
        }
        svg rect { transform-origin: center; }
      `}</style>
    </span>
  );
}


