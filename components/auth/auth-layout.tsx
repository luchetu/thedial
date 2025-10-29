import { ReactNode } from 'react';
import { WaveBackground } from './wave-background';
import { TestimonialCarousel } from './TestimonialCarousel';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex h-screen">
      {/* Logo - Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-center">
          <div className="relative inline-flex h-8 w-8 items-center justify-center">
            {/* Signal waves */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/30"></div>
            <div className="absolute inset-0 rounded-full border border-primary/20 scale-125"></div>
            <div className="absolute inset-0 rounded-full border border-primary/10 scale-150"></div>
            {/* Center circle with d */}
            <span className="relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold leading-none">
              d
            </span>
          </div>
          <span className="ml-2 text-xl font-bold tracking-tight text-foreground">TheDial</span>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        {children}
      </div>

      {/* Right Side - Wave Background with Testimonial */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden h-screen">
        <WaveBackground />
        <div className="relative z-10 flex items-center justify-center p-8">
          <TestimonialCarousel />
        </div>
      </div>
    </div>
  );
};
