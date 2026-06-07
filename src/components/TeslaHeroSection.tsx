import React, { useState } from 'react';
import { TataCar } from '../types';
import { ChevronDown, ArrowRight, ShieldCheck, Award, Maximize2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TeslaHeroSectionProps {
  cars: TataCar[];
  pricesOverrideMap: Record<string, number>;
  onOpenBooking: (carId: string) => void;
  focusedCarId?: string;
}

export default function TeslaHeroSection({
  cars,
  pricesOverrideMap,
  onOpenBooking,
  focusedCarId
}: TeslaHeroSectionProps) {
  const visibleCars = cars.filter(c => c.displayActive);

  // Active slide index
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSpecsSlideId, setShowSpecsSlideId] = useState<string | null>(null);

  // If a child components reports a focus target change, transition there
  React.useEffect(() => {
    if (focusedCarId) {
      const idx = visibleCars.findIndex(c => c.id === focusedCarId);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  }, [focusedCarId, visibleCars]);

  const car = visibleCars[activeIndex] || visibleCars[0];

  if (!car) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col justify-center items-center text-white text-center">
        <p className="italic text-gray-500">All vehicle models are hidden in Showroom Parameters configuration area.</p>
      </div>
    );
  }

  // Calculate customized start pricing
  const currentPrice = pricesOverrideMap[car.id] !== undefined ? pricesOverrideMap[car.id] : car.startingPrice;

  return (
    <div id={`showroom-carousel`} className="relative w-full h-[100vh] overflow-hidden select-none font-sans text-white bg-[#0a0c10]">
      
      {/* Immersive Vehicle Backdrop image with Parallax fade */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={car.id}
            initial={{ opacity: 0.85, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.85, scale: 1.05 }}
            transition={{ duration: 0.65 }}
            className="w-full h-full relative"
          >
            <img 
              src={car.images.hero} 
              alt={car.name} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-[0.5] contrast-[1.05]"
            />
            {/* Dark grid linear layout to isolate labels */}
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/85" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Indicators Menu (Left side) */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-35 flex flex-col gap-3">
        {visibleCars.map((c, i) => (
          <button
            key={c.id}
            onClick={() => {
              setActiveIndex(i);
              setShowSpecsSlideId(null);
            }}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
          >
            <div className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === i ? 'w-8 bg-amber-500' : 'w-2 bg-white/40 group-hover:bg-white'
            }`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest transition duration-300 hidden md:inline-block ${
              activeIndex === i ? 'text-amber-400 opacity-100' : 'text-white/40 group-hover:text-white group-hover:opacity-15'
            }`}>
              {c.name.replace("TATA ", "")}
            </span>
          </button>
        ))}
      </div>

      {/* Model Information Overlays (Centered Top) */}
      <div className="absolute top-[18vh] left-1/2 -translate-x-1/2 z-30 text-center w-full max-w-xl px-4 pointer-events-none">
        
        {/* Active Badge */}
        {car.badge && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            key={`badge-${car.id}`}
            className="mx-auto bg-amber-500 text-slate-950 font-black tracking-widest text-[9.5px] uppercase py-1 px-3 rounded-full mb-3 inline-block shadow-md border border-amber-400/20"
          >
            {car.badge}
          </motion.div>
        )}

        {/* Vehicle Main Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          key={`name-${car.id}`}
          transition={{ duration: 0.4 }}
          className="text-4xl md:text-5xl font-extrabold tracking-[0.25em] text-white select-text cursor-[#eaeaea]"
        >
          {car.name}
        </motion.h1>

        {/* Dynamic Tagline */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          key={`tagline-${car.id}`}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-xs md:text-sm font-semibold tracking-widest text-neutral-300 mt-2 italic"
        >
          {car.tagline}
        </motion.p>

        {/* Pricing tag */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={`price-${car.id}`}
          transition={{ delay: 0.25 }}
          className="text-xs font-bold text-amber-400 tracking-wider uppercase mt-4 block"
        >
          Starting at ₹{currentPrice.toFixed(2)} {car.priceSuffix}
        </motion.p>
      </div>

      {/* Technical Spec Overlays & Actions Bar (Fixed bottom) */}
      <div className="absolute bottom-[8vh] left-1/2 -translate-x-1/2 z-30 w-full max-w-5xl px-6 flex flex-col lg:flex-row items-center justify-between gap-6 pointer-events-auto">
        
        {/* Dynamic Stats Grid */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-14 text-center">
          
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">CAPACITY / RANGE</span>
            <div className="text-xl md:text-2xl font-black font-sans text-white tracking-wider">
              {car.rangeOrEngine}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">MAX POWER</span>
            <div className="text-xl md:text-2xl font-black font-sans text-white tracking-wider">
              {car.power}
            </div>
          </div>

          {car.acceleration && (
            <div className="space-y-0.5">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">ACCELERATION</span>
              <div className="text-xl md:text-2xl font-black font-sans text-white tracking-wider">
                {car.acceleration}
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">SAFETY ASSURANCE</span>
            <div className="text-xl md:text-2xl font-black font-sans text-emerald-400 tracking-wider flex items-center justify-center gap-1">
              <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
              <span>5-Star</span>
            </div>
          </div>

        </div>

        {/* Interactive Overlay Call-to-actions */}
        <div className="flex sm:flex-row gap-3.5 w-full sm:w-auto">
          
          <button
            id={`carousel-btn-features-${car.id}`}
            onClick={() => {
              setShowSpecsSlideId(showSpecsSlideId === car.id ? null : car.id);
            }}
            className="flex-1 sm:flex-initial px-6 py-3 bg-[#111316]/90 border border-neutral-700 hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest rounded-sm transition active:scale-95 cursor-pointer text-center"
          >
            {showSpecsSlideId === car.id ? "Close Features" : "View Specs"}
          </button>

          <button
            id={`carousel-btn-booking-${car.id}`}
            onClick={() => onOpenBooking(car.id)}
            className="flex-1 sm:flex-initial px-8 py-3 bg-white text-slate-950 hover:bg-[#eaeaea] text-xs font-black uppercase tracking-widest rounded-sm transition active:scale-95 cursor-pointer text-center"
          >
            Custom order / Drive
          </button>

        </div>

      </div>

      {/* Sliding specifications detail slide panel (on focus trigger) */}
      <AnimatePresence>
        {showSpecsSlideId === car.id && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="absolute bottom-0 left-0 w-full z-40 bg-[#0e1115]/95 backdrop-blur-md border-t border-neutral-800 p-6 shadow-2xl flex flex-col md:flex-row items-start gap-8"
          >
            
            <div className="w-full md:w-1/3">
              <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">VEHICLE FACT SHEET OVERVIEW</span>
              <h4 className="text-xl font-extrabold tracking-wider text-white uppercase mt-1">
                {car.name} specifications
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans mt-2.5">
                {car.description}
              </p>

              <div className="mt-5 p-3 bg-neutral-900 border border-neutral-800 rounded-sm text-[10.5px] leading-relaxed text-neutral-300 flex items-center justify-between gap-2">
                <span className="font-semibold text-[#eaeaea]">GNCAP & BNCAP Protection</span>
                <span className="text-[10px] uppercase font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-sm">
                  ★ ★ ★ ★ ★
                </span>
              </div>
            </div>

            {/* Standard specifications breakdown */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2.5 bg-neutral-900/40 p-4 border border-neutral-850 rounded-sm text-left">
                <span className="text-[10px] uppercase text-neutral-500 font-bold block">Cabin Engineering details</span>
                <div className="flex justify-between py-1 border-b border-neutral-850/40">
                  <span className="text-neutral-450">Seating Form</span>
                  <span className="font-semibold text-[#f5f5f7]">{car.seating} Layout</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-850/40">
                  <span className="text-neutral-450">Transmission Mode</span>
                  <span className="font-semibold text-[#f5f5f7]">{car.transmission}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-850/40">
                  <span className="text-neutral-450">Engine / Battery Type</span>
                  <span className="font-semibold text-[#f5f5f7]">{car.rangeOrEngine}</span>
                </div>
              </div>

              {/* Outstanding features checklist */}
              <div className="space-y-2.5 bg-neutral-900/40 p-4 border border-neutral-850 rounded-sm text-left">
                <span className="text-[10px] uppercase text-neutral-500 font-bold block">Innovative Technology Features</span>
                <ul className="grid grid-cols-1 gap-1 px-1">
                  {car.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-neutral-300 text-[11px] leading-tight font-sans">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Slide Down dismiss button */}
            <button
              onClick={() => setShowSpecsSlideId(null)}
              className="absolute top-4 right-4 p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-sm cursor-pointer"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Symmetrical scroll indicator chevron (floats in carousel center) */}
      {activeIndex < visibleCars.length - 1 && (
        <button
          onClick={() => {
            setActiveIndex(activeIndex + 1);
            setShowSpecsSlideId(null);
          }}
          className="absolute bottom-1 right-6 transform z-30 flex flex-col items-center gap-1 animate-bounce text-neutral-500 hover:text-white transition focus:outline-hidden cursor-pointer"
        >
          <span className="text-[9px] uppercase font-bold tracking-widest hidden md:inline">Next Vehicle</span>
          <ChevronDown className="h-5 w-5" />
        </button>
      )}

    </div>
  );
}
