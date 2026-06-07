import React from 'react';
import { ShieldCheck, CalendarRange, Lock, Settings, Sparkles } from 'lucide-react';
import { ShowroomSettings, TataCar } from '../types';

interface ShowroomHeaderProps {
  cars: TataCar[];
  settings: ShowroomSettings;
  activeView: 'showroom' | 'admin';
  onChangeView: (view: 'showroom' | 'admin') => void;
  onOpenBookingModal: (carId?: string) => void;
  onScrollToCar: (carId: string) => void;
}

export default function ShowroomHeader({
  cars,
  settings,
  activeView,
  onChangeView,
  onOpenBookingModal,
  onScrollToCar
}: ShowroomHeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-45 flex flex-col font-sans select-none">
      {/* Announcement Bar */}
      {settings.showAnnouncement && settings.announcementText && (
        <div id="announcement-banner" className="bg-[#171717] text-[#f5f5f7] py-2 px-4 text-center text-xs font-semibold tracking-wide border-b border-neutral-800 transition-all duration-300 animate-pulse-subtle flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" />
          <span>{settings.announcementText}</span>
          <button 
            onClick={() => onOpenBookingModal()} 
            className="underline hover:text-amber-300 ml-1.5 cursor-pointer text-[10px] uppercase font-bold tracking-wider"
          >
            Schedule Now &rarr;
          </button>
        </div>
      )}

      {/* Primary Floating Nav bar */}
      <div className="w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-6 py-3.5 flex items-center justify-between text-white">
        
        {/* Model Brand Title */}
        <div 
          onClick={() => onChangeView('showroom')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="text-sm font-black tracking-[0.25em] text-[#F3F4F6] group-hover:text-amber-400 transition-all font-mono uppercase">
            TATA MOTORS
          </span>
          <span className="text-[10px] font-bold text-gray-400 border border-neutral-700/60 rounded px-1.5 py-0.5 tracking-wider uppercase bg-neutral-900/40 hidden sm:inline-block">
            Showroom
          </span>
        </div>

        {/* Center shortcuts (only when in showroom mode) */}
        {activeView === 'showroom' && (
          <nav className="hidden lg:flex items-center gap-7 text-[12.5px] font-semibold tracking-wider text-gray-300">
            {cars.filter(c => c.displayActive).map((car) => (
              <button
                id={`nav-link-${car.id}`}
                key={car.id}
                onClick={() => onScrollToCar(car.id)}
                className="hover:text-white transition duration-200 cursor-pointer py-1 relative after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[1.5px] after:bg-white after:transition-all hover:after:left-0 hover:after:w-full"
              >
                {car.name.replace("TATA ", "")}
              </button>
            ))}
          </nav>
        )}

        {/* Right side Actions */}
        <div className="flex items-center gap-3">
          
          <button
            id="nav-btn-showroom"
            onClick={() => {
              onChangeView('showroom');
            }}
            className={`px-3 py-1.5 rounded text-xs font-bold tracking-wider cursor-pointer transition ${
              activeView === 'showroom'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Showroom Floor
          </button>

          <button
            id="nav-btn-booking"
            onClick={() => onOpenBookingModal()}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.97] text-slate-950 text-xs font-bold uppercase tracking-widest rounded-sm transition shadow-lg shadow-amber-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarRange className="h-4 w-4" />
            Book Drive
          </button>

          {/* Secure Locked Control Area */}
          <button
            id="nav-btn-admin"
            onClick={() => onChangeView('admin')}
            title="Access Secure Showroom Management Console"
            className={`p-2 rounded-sm cursor-pointer transition ${
              activeView === 'admin'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-xs'
                : 'text-gray-400 hover:text-white bg-[#101010]/30 hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Admin (1212)</span>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
}
