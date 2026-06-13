import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ADS_BANNERS } from "../data";

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      handleNext();
    }, 7000); // Trigger every 7 seconds
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? ADS_BANNERS.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === ADS_BANNERS.length - 1 ? 0 : prevIndex + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section id="home" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 font-sans select-none">
      {/* Outer Banner Wrapper with proportionate, responsive ratios matching both viewport sizes perfectly */}
      <div className="relative h-[130px] sm:h-[220px] md:h-[300px] lg:h-[350px] w-full rounded-2xl overflow-hidden shadow-md bg-brand-green border border-brand-green/10">
        
        {/* Slides Container */}
        {ADS_BANNERS.map((banner, index) => {
          const isActive = index === currentIndex;
          const hasError = imageErrors[banner.id];

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10 translate-x-0" : "opacity-0 z-0 translate-x-full pointer-events-none"
              }`}
            >
              {/* Pure Clean Image Slide or Blank Card if loaded error/missing */}
              {hasError ? (
                <div className="w-full h-full bg-brand-green flex flex-col items-center justify-center text-white/20">
                  {/* Clean brand-green blank card as requested */}
                  <span className="font-display font-medium text-xs sm:text-sm tracking-widest uppercase">
                    Kalyani Kitchen Specials
                  </span>
                </div>
              ) : (
                <img
                  src={banner.image}
                  alt={banner.title}
                  onError={() => {
                    setImageErrors((prev) => ({ ...prev, [banner.id]: true }));
                  }}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                />
              )}
            </div>
          );
        })}

        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-xs border border-white/5"
          aria-label="Previous slide"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-xs border border-white/5"
          aria-label="Next slide"
        >
          <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </button>

        {/* Dynamic Navigation Indicator Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5">
          {ADS_BANNERS.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex ? "bg-brand-yellow w-4 sm:w-5" : "bg-white/40 w-1.5 sm:w-2 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
