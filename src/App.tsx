import React, { useState, useEffect } from 'react';
import { TataCar, ShowroomSettings } from './types';
import { INITIAL_TATA_CARS } from './data/tataCars';
import { fetchShowroomSettings, saveShowroomSettings } from './lib/supabase';
import ShowroomHeader from './components/ShowroomHeader';
import TeslaHeroSection from './components/TeslaHeroSection';
import TestDriveModal from './components/TestDriveModal';
import ShowroomAdmin from './components/ShowroomAdmin';
import AiChatCompanion from './components/AiChatCompanion';
import { Award, BookOpen, ChevronRight, Cpu, ExternalLink, Flame, Info, Leaf, Sparkles, Terminal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [cars, setCars] = useState<TataCar[]>(INITIAL_TATA_CARS);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);

  // Layout View State
  const [activeView, setActiveView] = useState<'showroom' | 'admin'>('showroom');

  // Bookings dialog triggers
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingCarId, setBookingCarId] = useState<string>('');

  // Deployment handbook drawer trigger
  const [isHandbookOpen, setIsHandbookOpen] = useState(false);

  // State triggered from AI recommendations
  const [aiFocusedCarId, setAiFocusedCarId] = useState<string>('');

  // Store price and visibility configurations inside localStorage for instant floor update overrides
  const [pricesOverrideMap, setPricesOverrideMap] = useState<Record<string, number>>({});
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({});

  // Lead counter alerts
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    // Determine dynamic seed values from local stores
    const savedPrices = localStorage.getItem('tata_price_overrides');
    if (savedPrices) {
      setPricesOverrideMap(JSON.parse(savedPrices));
    }

    const savedVisibility = localStorage.getItem('tata_visibility_overrides');
    if (savedVisibility) {
      setVisibilityMap(JSON.parse(savedVisibility));
    }

    // Pull configuration settings securely (from Supabase or local storage default presets)
    async function initSettings() {
      try {
        const config = await fetchShowroomSettings();
        setSettings(config);
      } catch (err) {
        console.error("Failed to fetch showroom controls: ", err);
      }
    }
    initSettings();

    // Hook booking counts to display stats of leads
    const savedBookings = localStorage.getItem('tata_showroom_bookings');
    if (savedBookings) {
      try {
        const list = JSON.parse(savedBookings);
        setBookingCount(list.length);
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeView]);

  // Adjust display parameters based on visibility and price override controls
  const finalCars = cars.map((car) => {
    const overriddenPrice = pricesOverrideMap[car.id];
    const isVisible = visibilityMap[car.id] !== undefined ? visibilityMap[car.id] : car.displayActive;

    return {
      ...car,
      startingPrice: overriddenPrice !== undefined ? overriddenPrice : car.startingPrice,
      displayActive: isVisible
    };
  });

  // Handle settings adjustments
  const handleUpdateSettings = async (updated: ShowroomSettings) => {
    setSettings(updated);
    await saveShowroomSettings(updated);
  };

  // Override Starting Base prices
  const handleUpdateCarsPrices = (newPrices: Record<string, number>) => {
    setPricesOverrideMap(newPrices);
    localStorage.setItem('tata_price_overrides', JSON.stringify(newPrices));
  };

  // Toggle active inventory visibility maps
  const handleUpdateCarsVisibility = (visibleMap: Record<string, boolean>) => {
    setVisibilityMap(visibleMap);
    localStorage.setItem('tata_visibility_overrides', JSON.stringify(visibleMap));
  };

  // Trigger test drive modal pre-populated
  const handleOpenBookingModal = (carId?: string) => {
    setBookingCarId(carId || '');
    setIsBookingOpen(true);
  };

  // Focusing dynamic car slide from side indicators or AI advisor commands
  const handleFocusCar = (carId: string) => {
    setAiFocusedCarId(carId);
  };

  // Handle booking success triggers
  const handleBookingRegistered = () => {
    const listCount = localStorage.getItem('tata_showroom_bookings');
    if (listCount) {
      setBookingCount(JSON.parse(listCount).length);
    }
  };

  if (!settings) {
    return (
      <div className="h-screen bg-[#07080b] flex flex-col items-center justify-center font-sans text-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#eaeaea]">Calibrating Floor Ledger...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-[#eaeaea] antialiased select-none font-sans relative">
      
      {/* Floating Tesla-look Showroom Nav header */}
      <ShowroomHeader
        cars={finalCars}
        settings={settings}
        activeView={activeView}
        onChangeView={(view) => setActiveView(view)}
        onOpenBookingModal={handleOpenBookingModal}
        onScrollToCar={handleFocusCar}
      />

      {/* Primary body segment container */}
      <div className="pt-24 min-h-[calc(100vh-6rem)]">
        {activeView === 'showroom' ? (
          /* SHOWROOM PAGE */
          <div className="relative">
            <TeslaHeroSection
              cars={finalCars}
              pricesOverrideMap={pricesOverrideMap}
              onOpenBooking={handleOpenBookingModal}
              focusedCarId={aiFocusedCarId}
            />

            {/* Float Handbook badge on top corner */}
            <div className="absolute top-4 right-6 z-35 hidden md:block">
              <button
                onClick={() => setIsHandbookOpen(true)}
                className="bg-neutral-900/90 hover:bg-neutral-800 text-amber-400 font-extrabold text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-sm border border-neutral-800 transition shadow-lg flex items-center gap-1.5 cursor-pointer select-none"
              >
                <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                Vercel Deploy Guide
              </button>
            </div>
          </div>
        ) : (
          /* PASSWORD PROTECTED ADMIN PANEL */
          <div className="max-w-7xl mx-auto px-4 py-4">
            <ShowroomAdmin
              cars={finalCars}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onUpdateCarsPrices={handleUpdateCarsPrices}
              onUpdateCarsVisibility={handleUpdateCarsVisibility}
            />
          </div>
        )}
      </div>

      {/* Floating AI Sales Companion Chat Drawer */}
      {settings.enableInteractiveAiRecommender && activeView === 'showroom' && (
        <AiChatCompanion
          cars={finalCars}
          onFocusCar={handleFocusCar}
          onOpenBooking={handleOpenBookingModal}
        />
      )}

      {/* Small subtle footer with documentation trigger */}
      <footer className="w-full bg-[#07080b] py-6 border-t border-neutral-900 text-[11px] text-neutral-500 font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Tata Motors Passenger Vehicles • Tesla Silhouette design.</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsHandbookOpen(true)}
              className="text-amber-500 hover:text-amber-400 hover:underline cursor-pointer"
            >
              Vercel Deployment Handbook
            </button>
            <span>•</span>
            <span>Passive Sync Layer Active</span>
          </div>
        </div>
      </footer>

      {/* Test Drive modal window overlay */}
      <AnimatePresence>
        {isBookingOpen && (
          <TestDriveModal
            cars={finalCars}
            selectedCarId={bookingCarId}
            onClose={() => setIsBookingOpen(false)}
            onBookingSuccess={handleBookingRegistered}
          />
        )}
      </AnimatePresence>

      {/* HANDBOOK MODAL DRAWER OVERLAY */}
      <AnimatePresence>
        {isHandbookOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0d11] max-w-2xl w-full border border-neutral-800 p-6 rounded-sm text-left shadow-2xl relative scrollbar-thin"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-850 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-amber-500 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black tracking-[0.2em] uppercase text-white">
                      VERCEL & SUPABASE DEPLOYMENT HANDBOOK
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-medium">N2S Framework Execution Guide</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHandbookOpen(false)}
                  className="p-1 hover:bg-neutral-800 rounded-sm text-neutral-400 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Steps Area */}
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs leading-normal text-neutral-300">
                
                <div className="p-3 bg-neutral-900 border border-neutral-850/60 rounded-xs">
                  <span className="font-extrabold text-amber-500 tracking-wider">PRE-REQUISITES</span>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Ensure you have a free account on **Vercel**, **Supabase**, and a **GitHub** repository set up.
                  </p>
                </div>

                {/* Step 1 */}
                <div className="space-y-1 bg-[#12151b]/40 p-3 border border-neutral-850 rounded-xs">
                  <strong className="text-white text-[11px] tracking-wide block uppercase font-mono">1. Prepare your Supabase Instance</strong>
                  <p className="text-neutral-400 text-[11px]">
                    Create a new database project on Supabase. Navigate to the SQL Editor inside your dashboard tab, and copy/paste our SQL script. This will bootstrap the <code className="text-amber-400 font-mono">test_drives</code> and <code className="text-showroom-config text-amber-400">showroom_settings</code> tables cleanly.
                  </p>
                  <p className="text-[10px] text-neutral-500 italic mt-1 font-sans">
                    Get your connection parameters from Project Settings &rarr; API.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="space-y-1 bg-[#12151b]/40 p-3 border border-[#1a1e28] rounded-xs">
                  <strong className="text-white text-[11px] tracking-wide block uppercase font-mono">2. Push Workspace to GitHub</strong>
                  <p className="text-neutral-400 text-[11px]">
                    Create a private or public repository on GitHub. Run these terminal commands from your workspace directory:
                  </p>
                  <pre className="bg-[#101318] p-2 text-[10px] font-mono text-neutral-300 rounded-sm overflow-x-auto select-all cursor-pointer block mt-1.5 border border-neutral-850">
{`git init
git add .
git commit -m "feat: first release of Tata Motors Passenger Vehicles Showroom"
git branch -M main
git remote add origin https://github.com/your-username/tata-showroom-n2s.git
git push -u origin main`}
                  </pre>
                </div>

                {/* Step 3 */}
                <div className="space-y-1 bg-[#12151b]/40 p-3 border border-neutral-850 rounded-xs">
                  <strong className="text-white text-[11px] tracking-wide block uppercase font-mono">3. Link Repository inside Vercel</strong>
                  <p className="text-neutral-450 text-[11px]">
                    Log in to Vercel, click **"Add New"** &rarr; **"Project"**, then select your newly pushed repository.
                  </p>
                  <div className="p-2.5 bg-[#141820]/60 text-neutral-300 rounded-sm border border-neutral-850/60 mt-2 space-y-1 text-[10.5px]">
                    <span className="font-extrabold text-[#f3f4f6] block">Configure build settings inside Vercel Dashboard:</span>
                    <p>• Framework Preset: <strong className="text-amber-400">Vite</strong></p>
                    <p>• Root Directory: <strong className="text-amber-400">./</strong></p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="space-y-1 bg-[#12151b]/40 p-3 border border-neutral-850 rounded-xs">
                  <strong className="text-white text-[11px] tracking-wide block uppercase font-mono">4. Declare Production Environment keys</strong>
                  <p className="text-neutral-400 text-[11px]">
                    Add these required variables to **Environment Variables** in Vercel during the project creation flow:
                  </p>
                  <div className="space-y-1 font-mono text-[10.5px] text-amber-400 bg-neutral-900 border border-neutral-850 p-2.5 rounded-sm">
                    <div className="flex justify-between border-b border-neutral-850/40 pb-1.5">
                      <span className="font-bold">VITE_SUPABASE_URL</span>
                      <span className="text-neutral-500">_your_supabase_endpoint_</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-850/40 py-1.5">
                      <span className="font-bold">VITE_SUPABASE_ANON_KEY</span>
                      <span className="text-neutral-500">_your_supabase_anon_public_key_</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="font-bold">GEMINI_API_KEY</span>
                      <span className="text-neutral-500">_your_google_ai_studio_secret_</span>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="space-y-1 bg-[#12151b]/40 p-3 border border-neutral-850 rounded-xs">
                  <strong className="text-white text-[11px] tracking-wide block uppercase font-mono">5. Click Deploy</strong>
                  <p className="text-neutral-400 text-[11px]">
                    Vercel compiles the React code with Tailwind CSS and rolls it out onto globally performant edge servers instantly.
                  </p>
                </div>

              </div>

              {/* Footer info lock */}
              <div className="flex items-center justify-end pt-3 text-xs border-t border-neutral-850">
                <button
                  onClick={() => setIsHandbookOpen(false)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold uppercase tracking-widest rounded-sm transition cursor-pointer text-xs"
                >
                  Dismiss handbook
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
