"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    name: "John Smith",
    role: "Real Estate Agent",
    initials: "JS",
    quote: "TheDial has completely transformed how I handle client calls. I never miss important details anymore, and the AI summaries help me follow up more effectively. It's like having a personal assistant for every conversation."
  },
  {
    id: 2,
    name: "Maria Santos",
    role: "Financial Advisor",
    initials: "MS",
    quote: "TheDial has revolutionized my client meetings. I can focus entirely on the conversation knowing that every important detail is being captured and organized. The AI summaries are incredibly accurate and save me hours of note-taking."
  },
  {
    id: 3,
    name: "David Lee",
    role: "Sales Manager",
    initials: "DL",
    quote: "TheDial has been a game-changer for our sales team. We never lose track of client conversations, and the AI insights help us identify opportunities we might have missed. It's like having a superpower for every call."
  },
  {
    id: 4,
    name: "Sarah Johnson",
    role: "Insurance Broker",
    initials: "SJ",
    quote: "As an insurance broker, I handle dozens of calls daily. TheDial ensures I never miss a crucial detail about coverage or claims. The transcription accuracy is phenomenal and the AI summaries help me provide better service."
  },
  {
    id: 5,
    name: "Michael Chen",
    role: "Business Consultant",
    initials: "MC",
    quote: "TheDial has streamlined my consulting practice. Client calls are automatically documented, and I can reference specific points weeks later. It's transformed how I maintain client relationships and deliver value."
  }
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 30000); // Change every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full max-w-md">
      <Card className="transition-all duration-500 ease-in-out rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">{currentTestimonial.initials}</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{currentTestimonial.name}</h3>
              <p className="text-sm text-muted-foreground">{currentTestimonial.role}</p>
            </div>
          </div>
          <blockquote className="text-foreground">
            &ldquo;{currentTestimonial.quote}&rdquo;
          </blockquote>
        </CardContent>
      </Card>
      
      {/* Progress indicator */}
      <div className="flex justify-center mt-4 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToTestimonial(index)}
            className={`h-1 w-8 rounded-full transition-all duration-300 cursor-pointer hover:opacity-80 ${
              index === currentIndex ? "bg-primary" : "bg-primary/20"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
