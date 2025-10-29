'use client';

import Image from 'next/image';

const logos = [
  {
    name: 'Eleven Labs',
    src: 'https://11labs-nonprd-15f22c1d.s3.eu-west-3.amazonaws.com/0b9cd3e1-9fad-4a5b-b3a0-c96b0a1f1d2b/elevenlabs-logo-black.svg',
  },
  {
    name: 'OpenAI',
    src: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/ChatGPT-Logo.svg',
  },
  {
    name: 'Android',
    src: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg',
  },
  {
    name: 'iOS',
    src: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/IOS_logo.svg',
  },
];

export default function SlidingLogos() {
  return (
    <section className="w-full py-8 md:py-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <p className="text-center text-sm text-muted-foreground mb-8">The technologies we use to make thedial possible</p>
        <div className="overflow-hidden">
          <div className="flex animate-slide gap-8 md:gap-12">
            {logos.map((logo, index) => (
              <div key={index} className="flex items-center justify-center h-16">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={128}
                  height={48}
                  className="max-h-12 max-w-32 object-contain opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
            {logos.map((logo, index) => (
              <div key={`duplicate-${index}`} className="flex items-center justify-center h-16">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={128}
                  height={48}
                  className="max-h-12 max-w-32 object-contain opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
