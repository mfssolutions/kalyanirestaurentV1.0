import React from "react";

export function AboutUs() {
  return (
    <section id="about-us" className="bg-white py-16 scroll-mt-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Descriptive Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 relative pb-3 font-display">
              About Us
              <span className="absolute bottom-0 left-0 w-16 h-1 bg-brand-green rounded" />
            </h2>
            
            <div className="text-neutral-700 space-y-5 text-sm sm:text-base leading-relaxed">
              <p>
                Welcome to <strong className="text-neutral-950 font-bold">Kalyani Restaurant</strong>, where tradition meets taste. Established with a passion for authentic Indian cuisine, we bring you the finest flavors from across the subcontinent, prepared with fresh ingredients and time-honored recipes.
              </p>
              <p>
                Our chefs specialize in aromatic biryanis, rich curries, and delectable starters that have been loved by our customers for years. Every dish is crafted with care to deliver an unforgettable dining experience.
              </p>
              <p>
                Whether you're dining in or ordering from the comfort of your home, we promise quality, consistency, and the warmth of home-cooked food in every bite.
              </p>
            </div>
          </div>

          {/* Right Column: Key Accented Metric Cards from Image 2 */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Metric Card 1: 10+ Years of Service */}
            <div className="flex bg-brand-green/3 hover:bg-brand-green/5 border-1 border-brand-green/10 rounded-r-xl overflow-hidden transition-all duration-300 shadow-sm">
              <div className="w-1.5 bg-brand-green" />
              <div className="p-6 flex flex-col justify-center">
                <span className="text-3xl font-extrabold text-brand-green leading-none font-display">
                  10+
                </span>
                <span className="text-xs sm:text-sm text-neutral-600 font-medium mt-2">
                  Years of Service
                </span>
              </div>
            </div>

            {/* Metric Card 2: 50+ Dishes on Menu */}
            <div className="flex bg-brand-green/3 hover:bg-brand-green/5 border-1 border-brand-green/10 rounded-r-xl overflow-hidden transition-all duration-300 shadow-sm">
              <div className="w-1.5 bg-brand-green" />
              <div className="p-6 flex flex-col justify-center">
                <span className="text-3xl font-extrabold text-brand-green leading-none font-display">
                  50+
                </span>
                <span className="text-xs sm:text-sm text-neutral-600 font-medium mt-2">
                  Dishes on Menu
                </span>
              </div>
            </div>

            {/* Metric Card 3: 10K+ Happy Customers */}
            <div className="flex bg-brand-green/3 hover:bg-brand-green/5 border-1 border-brand-green/10 rounded-r-xl overflow-hidden transition-all duration-300 shadow-sm">
              <div className="w-1.5 bg-brand-green" />
              <div className="p-6 flex flex-col justify-center">
                <span className="text-3xl font-extrabold text-brand-green leading-none font-display">
                  10K+
                </span>
                <span className="text-xs sm:text-sm text-neutral-600 font-medium mt-2">
                  Happy Customers
                </span>
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </section>
  );
}
