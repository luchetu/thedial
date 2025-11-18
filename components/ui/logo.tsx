"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 24 }: LogoProps) {
  const iconSize = size * 0.24; // Sparkle icon is 24% of total size (further reduced)
  const iconRadius = iconSize / 2; // Radius of the icon
  const gap = size * 0.07; // Gap between icon and innermost ring
  const margin = size * 0.1; // Margin from outer edge (increased to make circle smaller)
  
  // Calculate uniform spacing between rings
  // We have 3 rings, so 2 gaps between them (outer-middle, middle-inner)
  // Plus gap from icon to inner ring
  const minInnerRadius = iconRadius + gap; // Minimum inner ring radius (with gap from icon)
  const outerRadius = size / 2 - margin; // Outer ring radius
  
  // Calculate uniform spacing: divide the space from outer to min inner into equal parts
  const totalSpace = outerRadius - minInnerRadius;
  const uniformSpacing = totalSpace / 3; // Equal spacing for 3 segments (2 gaps + 1 ring width)
  
  // Calculate ring radii with uniform spacing, ensuring inner ring respects gap from icon
  const outerRingRadius = outerRadius;
  const middleRingRadius = outerRingRadius - uniformSpacing;
  const innerRingRadius = Math.max(middleRingRadius - uniformSpacing, minInnerRadius);
  
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        style={{ display: 'block' }}
      >
        {/* Concentric rings with uniform spacing */}
        <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx={size / 2} cy={size / 2} r={outerRingRadius} />
          <circle cx={size / 2} cy={size / 2} r={middleRingRadius} />
          <circle cx={size / 2} cy={size / 2} r={innerRingRadius} />
        </g>
      </svg>
      
      {/* Lucide Sparkles icon in the center */}
      <Sparkles 
        size={iconSize} 
        className="text-current relative z-10"
        strokeWidth={2.5}
      />
    </div>
  );
}

