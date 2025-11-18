import { ReactNode } from 'react';
import { WaveBackground } from './wave-background';
import { TestimonialCarousel } from './TestimonialCarousel';
import { Logo } from '@/components/ui/logo';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex h-screen">
      {/* Logo - Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-center">
          <Logo size={40} className="text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground ml-2 leading-none">thedial</span>
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
