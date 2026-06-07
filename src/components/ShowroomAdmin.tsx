import React, { useState, useEffect } from 'react';
import { 
  Lock, Check, Trash2, Sliders, Database, EyeOff, Eye, Cpu, HelpCircle, 
  RefreshCw, Layers, Sparkles, User, Mail, Calendar, MapPin, BadgePercent, DollarSign 
} from 'lucide-react';
import { ShowroomSettings, TestDriveBooking, TataCar } from '../types';
import { 
  fetchBookings, 
  updateBookingStatus, 
  deleteBookingRecord, 
  isSupabaseConfigured,
  saveShowroomSettings
} from '../lib/supabase';
import { motion } from 'motion/react';

interface ShowroomAdminProps {
  cars: TataCar[];
  settings: ShowroomSettings;
  onUpdateSettings: (updated: ShowroomSettings) => void;
  onUpdateCarsPrices: (prices: Record<string, number>) => void;
  onUpdateCarsVisibility: (visibleMap: Record<string, boolean>) => void;
}

export default function ShowroomAdmin({
  cars,
  settings,
  onUpdateSettings,
  onUpdateCarsPrices,
  onUpdateCarsVisibility
}: ShowroomAdminProps) {
  // Password wall state
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passError, setPassError] = useState(false);

  // Sub-tabs state
  const [activeTab, setActiveTab] = useState<'leads' | 'showroom' | 'database'>('leads');

  // Bookings list state
  const [bookings, setBookings] = useState<TestDriveBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Settings State Form
  const [announcementMsg, setAnnouncementMsg] = useState(settings.announcementText);
  const [showAnnouncement, setShowAnnouncement] = useState(settings.showAnnouncement);
  const [featuredId, setFeaturedId] = useState(settings.featuredCarId);
  const [aiRecommender, setAiRecommender] = useState(settings.enableInteractiveAiRecommender);

  // Dynamic values form
  const [pricesMap, setPricesMap] = useState<Record<string, number>>(
    cars.reduce((acc, car) => ({ ...acc, [car.id]: car.startingPrice }), {})
  );
  const [activeCarMap, setActiveCarMap] = useState<Record<string, boolean>>(
    cars.reduce((acc, car) => ({ ...acc, [car.id]: car.displayActive }), {})
  );

  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    // If authenticated, pre-pull lead listings
    if (isAuthenticated) {
      handleLoadBookings();
    }
  }, [isAuthenticated]);

  const handleVerifyPassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password === '1212') {
      setIsAuthenticated(true);
      setPassError(false);
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

  const handleLoadBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: TestDriveBooking['status']) => {
    const ok = await updateBookingStatus(id, nextStatus);
    if (ok) {
      handleLoadBookings();
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (confirm("Are you sure you want to completely delete this booking record? This action cannot be undone.")) {
      const ok = await deleteBookingRecord(id);
      if (ok) {
        handleLoadBookings();
      }
    }
  };

  const handleSaveShowroomControls = async () => {
    const updatedSettings: ShowroomSettings = {
      id: settings.id,
      announcementText: announcementMsg,
      showAnnouncement: showAnnouncement,
      featuredCarId: featuredId,
      enableInteractiveAiRecommender: aiRecommender,
      requireAdminApproval: settings.requireAdminApproval
    };

    // Save configuration settings
    onUpdateSettings(updatedSettings);

    // Save Price Override updates
    onUpdateCarsPrices(pricesMap);

    // Save layout Visibility updates
    onUpdateCarsVisibility(activeCarMap);

    setSettingsSuccess(true);
    setTimeout(() => {
      setSettingsSuccess(false);
    }, 3000);
  };

  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase();
    return (
      b.customerName.toLowerCase().includes(query) ||
      b.carName.toLowerCase().includes(query) ||
      b.email.toLowerCase().includes(query) ||
      b.locationBranch.toLowerCase().includes(query)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-[#0b0c0f] border border-neutral-850 rounded-sm shadow-xl text-center select-none animate-fade-in font-sans">
        <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-sm flex items-center justify-center mx-auto mb-5">
          <Lock className="h-5 w-5" />
        </div>
        
        <h2 className="text-sm font-extrabold tracking-[0.2em] text-white uppercase mb-1">
          CONCURRENT ACCESS SECURED
        </h2>
        <p className="text-[11px] text-neutral-400 uppercase tracking-widest mb-6">
          Tata Motors Dealer Ledger System
        </p>

        <form onSubmit={handleVerifyPassword} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Security Access passcode
            </label>
            <input
              type="password"
              placeholder="••••"
              className={`w-full bg-[#14161c] border rounded-sm py-2 px-3 text-center text-lg font-mono text-white focus:outline-hidden tracking-[0.4em] ${
                passError ? 'border-rose-600 focus:border-rose-600' : 'border-neutral-800 focus:border-amber-500'
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPassError(false);
              }}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 text-xs font-extrabold uppercase tracking-widest rounded-sm transition cursor-pointer"
          >
            Authorize Terminal
          </button>
        </form>

        <div className="mt-8 text-[11px] bg-neutral-900/60 p-3 rounded-sm border border-neutral-850 text-neutral-400 flex flex-col gap-1.5 leading-normal">
          <p className="font-semibold text-neutral-300">💡 Hint for Testing:</p>
          <p>The code uses standard password <span className="text-amber-400 font-bold">'1212'</span> configured by instructions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-6 p-6 bg-[#0c0d10] border border-neutral-850 rounded-sm text-neutral-200 font-sans select-none animate-fade-in space-y-6">
      
      {/* Superuser Banner Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-850 pb-5">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">DEALERSHIP MANAGEMENT BACKEND</span>
          <h2 className="text-lg font-black tracking-wider text-white uppercase mt-0.5">Control Panel</h2>
        </div>

        {/* Top Status Tabs bar */}
        <div className="flex bg-neutral-900 rounded-sm p-1 text-xs">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-1.5 font-bold uppercase tracking-wider rounded-xs transition cursor-pointer ${
              activeTab === 'leads' ? 'bg-[#181b22] text-amber-400 border border-neutral-800' : 'text-neutral-450 hover:text-white'
            }`}
          >
            Reservations
          </button>
          
          <button
            onClick={() => setActiveTab('showroom')}
            className={`px-4 py-1.5 font-bold uppercase tracking-wider rounded-xs transition cursor-pointer ${
              activeTab === 'showroom' ? 'bg-[#181b22] text-amber-400 border border-neutral-800' : 'text-neutral-450 hover:text-white'
            }`}
          >
            Showroom Config
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-1.5 font-bold uppercase tracking-wider rounded-xs transition cursor-pointer ${
              activeTab === 'database' ? 'bg-[#181b22] text-amber-400 border border-neutral-800' : 'text-neutral-450 hover:text-white'
            }`}
          >
            Supabase DB Setup
          </button>
        </div>
      </div>

      {/* Main Tab Area switch */}
      <div>
        
        {/* LEADS PANEL */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-sm font-extrabold tracking-widest text-[#eaeaea] uppercase flex items-center gap-2">
                <Sliders className="h-4 w-4 text-neutral-400" /> Live Inbound Reservations
              </h3>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Query customer name, vehicle, etc..."
                  className="bg-[#12141a] border border-neutral-800 text-xs py-1.5 px-3 rounded-sm text-white focus:outline-hidden focus:border-amber-500 w-full sm:w-60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <button
                  onClick={handleLoadBookings}
                  disabled={loadingBookings}
                  className="p-2 bg-neutral-850 hover:bg-neutral-800 rounded-sm text-neutral-200 transition cursor-pointer"
                  title="Force Refresh Database"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingBookings ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loadingBookings ? (
              <div className="py-20 text-center text-xs text-neutral-450 animate-pulse">
                Synchronizing with Supabase API hooks...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-neutral-850 text-xs text-neutral-500 italic">
                No active bookings matched query constraints. Share your floor link to sign up customers!
              </div>
            ) : (
              <div className="overflow-x-auto border border-neutral-850 rounded-sm">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-[#101318] text-neutral-400 font-bold uppercase tracking-wider text-[10px] border-b border-neutral-850">
                    <tr>
                      <th className="p-3">Customer & Contact</th>
                      <th className="p-3">Selected Model</th>
                      <th className="p-3">Schedule Slot</th>
                      <th className="p-3">Location Branch</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Ledger actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-900/40">
                        <td className="p-3">
                          <div className="font-extrabold text-[#f3f4f6]">{b.customerName}</div>
                          <div className="text-[10px] text-neutral-500 mt-0.5 space-y-0.5 text-left">
                            <span className="block italic">{b.email}</span>
                            <span className="block font-mono">{b.phone}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10.5px] font-bold rounded-xs font-mono uppercase">
                            {b.carName}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-[#eaeaea] font-mono">{b.preferredDate}</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">{b.preferredTimeSlot}</div>
                        </td>
                        <td className="p-3 font-semibold text-neutral-400 text-left">
                          {b.locationBranch}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-extrabold uppercase tracking-wide border ${
                            b.status === 'Confirmed' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : b.status === 'Completed'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : b.status === 'Contacted'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : b.status === 'Cancelled'
                              ? 'bg-red-500/10 text-red-500 border-red-500/20'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <select
                            className="bg-[#12141a] border border-neutral-800 text-[11px] py-1 px-1.5 rounded-sm text-neutral-200 focus:outline-hidden"
                            value={b.status}
                            onChange={(e) => handleUpdateStatus(b.id, e.target.value as any)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => handleDeleteRecord(b.id)}
                            className="p-1.5 bg-neutral-850 hover:bg-red-950/20 text-neutral-400 hover:text-red-500 rounded-sm transition cursor-pointer"
                            title="Purge reservation"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="text-[11px] text-neutral-450 leading-relaxed text-left bg-neutral-900/40 p-3 rounded-sm border border-neutral-850">
              ⚡ Database storage utilizes live Supabase credentials if configured. If not configured, records remain beautifully persistent in standard offline local pools to enable hassle-free testing.
            </div>
          </div>
        )}

        {/* SHOWROOM CORE CONFIG */}
        {activeTab === 'showroom' && (
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold tracking-widest text-[#eaeaea] uppercase">
              Showroom View controls
            </h3>

            {settingsSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-900/50 p-3.5 rounded-sm text-xs text-emerald-300 font-bold animate-fade-in">
                🚀 Store Layout & Specifications Updated Dynamically. Changes mirror instantly on Showroom Floor.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
              
              {/* Box 1: Banners & Promos */}
              <div className="bg-[#111317] border border-neutral-850 p-5 rounded-sm space-y-4">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">HOMEPAGE SPECS & PROMOS</span>
                
                <div className="space-y-1.5">
                  <label className="block text-[#eaeaea] font-semibold">Slide-Marquee Banner Announcement</label>
                  <textarea
                    rows={2}
                    className="w-full bg-[#171a21]/80 border border-neutral-800 text-xs py-2 px-3 rounded-sm text-white focus:border-amber-500 focus:outline-hidden leading-relaxed font-sans"
                    value={announcementMsg}
                    onChange={(e) => setAnnouncementMsg(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-b border-neutral-850/50">
                  <div>
                    <label className="block text-[#eaeaea] font-semibold">Enable FrontAnnouncement</label>
                    <span className="text-[10px] text-neutral-500 leading-normal block">Show notification banner at floor top</span>
                  </div>
                  <button
                    onClick={() => setShowAnnouncement(!showAnnouncement)}
                    className={`p-1.5 px-3 rounded-sm font-bold uppercase text-[10px] transition ${
                      showAnnouncement ? 'bg-amber-500 text-slate-950' : 'bg-neutral-800 text-neutral-450'
                    }`}
                  >
                    {showAnnouncement ? "Visible" : "Hidden"}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[#eaeaea] font-semibold">Select Featured Highlight Car</label>
                  <select
                    className="w-full bg-[#171a21]/80 border border-neutral-800 py-2 px-3 rounded-sm text-white"
                    value={featuredId}
                    onChange={(e) => setFeaturedId(e.target.value)}
                  >
                    {cars.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-850/50">
                  <div>
                    <label className="block text-[#eaeaea] font-semibold">AI Assistant Concierge</label>
                    <span className="text-[10px] text-neutral-500 leading-normal block">Display floating intelligent recommendation helper chatbot</span>
                  </div>
                  <button
                    onClick={() => setAiRecommender(!aiRecommender)}
                    className={`p-1.5 px-3 rounded-sm font-bold uppercase text-[10px] transition ${
                      aiRecommender ? 'bg-amber-500 text-slate-950' : 'bg-neutral-800 text-neutral-450'
                    }`}
                  >
                    {aiRecommender ? "Enabled" : "Disabled"}
                  </button>
                </div>

              </div>

              {/* Box 2: Price Override Settings */}
              <div className="bg-[#111317] border border-neutral-850 p-5 rounded-sm space-y-4">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-neutral-450" /> Price Override Ledger (MSRP Lakhs)
                </span>
                
                <p className="text-[11px] text-neutral-400">
                  Showroom managers can override standard starting prices here. Real-time updates push directly to the public floor view.
                </p>

                <div className="space-y-3.5 pt-2 max-h-[300px] overflow-y-auto pr-1">
                  {cars.map((car) => (
                    <div key={car.id} className="flex items-center justify-between gap-3 bg-[#171a20]/40 p-2.5 border border-neutral-850/60 rounded-xs">
                      <div className="flex-1">
                        <span className="font-bold text-[#eaeaea] block text-[11px]">{car.name}</span>
                        <span className="text-[10px] text-neutral-550 block capitalize italic">{car.type} Type • {car.seating}</span>
                      </div>
                      
                      {/* Price input field */}
                      <div className="flex items-center bg-[#121419] border border-neutral-800 px-2 rounded-sm w-32 shrink-0">
                        <span className="text-[#eaeaea] font-bold text-xs pr-1">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          maxLength={6}
                          className="w-full bg-transparent text-white focus:outline-hidden font-mono font-bold text-xs py-1.5"
                          value={pricesMap[car.id] !== undefined ? pricesMap[car.id] : car.startingPrice}
                          onChange={(e) => setPricesMap({
                            ...pricesMap,
                            [car.id]: parseFloat(e.target.value) || 0
                          })}
                        />
                        <span className="text-[10px] text-neutral-500 font-bold pl-1">L</span>
                      </div>

                      {/* Display toggle button */}
                      <button
                        type="button"
                        onClick={() => setActiveCarMap({
                          ...activeCarMap,
                          [car.id]: !activeCarMap[car.id]
                        })}
                        className={`p-1.5 rounded-sm transition shrink-0 ${
                          activeCarMap[car.id] ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}
                        title={activeCarMap[car.id] ? "Model is Active on Floor" : "Model is Hidden on Floor"}
                      >
                        {activeCarMap[car.id] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>

                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Action buttons save */}
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleSaveShowroomControls}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 font-extrabold uppercase tracking-widest text-xs rounded-sm transition shadow-lg shadow-amber-500/15 cursor-pointer flex items-center gap-2"
              >
                <Sliders className="h-4 w-4" /> Apply Showroom Parameters
              </button>
            </div>
          </div>
        )}

        {/* SUPABASE TELEMETRY SQL */}
        {activeTab === 'database' && (
          <div className="space-y-5 text-left text-xs">
            <h3 className="text-sm font-extrabold tracking-widest text-[#eaeaea] uppercase flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-neutral-400" /> Database Telemetry & Setup Logs
            </h3>

            {/* Integration check */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-[#111317] border border-neutral-850 p-4 rounded-sm space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Connection Status</span>
                <div className="flex items-center gap-2.5">
                  <div className={`h-3 w-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 border border-emerald-400 shadow-sm animate-pulse' : 'bg-neutral-600'}`} />
                  <span className="font-bold text-[#f5f5f7]">
                    {isSupabaseConfigured ? "Connected to Remote Supabase DB Instance" : "Operating on Local Storage Mirror (Isolated Mode)"}
                  </span>
                </div>
                <p className="text-[11.5px] text-neutral-400 leading-relaxed font-sans">
                  The application searches for client variables <strong className="text-white">VITE_SUPABASE_URL</strong> and <strong className="text-white">VITE_SUPABASE_ANON_KEY</strong>. 
                  Provide them in the backend secrets panel in your builder to establish an instant synchronized link.
                </p>
              </div>

              <div className="bg-[#111317] border border-neutral-850 p-4 rounded-sm space-y-2.5 font-sans leading-relaxed text-neutral-400">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Production Setup Instructions</span>
                <p>
                  To sync perfectly with Supabase's realtime listener network, execute the provided SQL script in your Supabase SQL editor to bootstrap table indexes.
                </p>
              </div>

            </div>

            {/* SQL Script Box */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Supabase SQL Bootstrap Script</span>
              <pre className="bg-[#0e1014] text-neutral-300 p-4 border border-neutral-850 text-[11px] rounded-sm font-mono overflow-x-auto select-all cursor-pointer block leading-normal whitespace-pre-wrap max-h-[300px]">
{`-- 1. Create Test Drive Reservations Table
create table if not exists test_drives (
  id text primary key,
  car_id text not null,
  car_name text not null,
  customer_name text not null,
  email text not null,
  phone text not null,
  preferred_date date not null,
  preferred_timeslot text not null,
  location_branch text not null,
  status text not null default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  comments text
);

-- 2. Create Showroom Core Configuration Table
create table if not exists showroom_settings (
  id text primary key,
  announcement_text text,
  show_announcement boolean default true,
  featured_car_id text,
  enable_ai_recommender boolean default true,
  require_admin_approval boolean default false
);

-- 3. Seed Default Control record
insert into showroom_settings (id, announcement_text, show_announcement, featured_car_id, enable_ai_recommender)
values ('tata-showroom-config', '⭐ Experience the Future of Mobility: TATA CURVV.ev in showrooms. Book a Test Drive!', true, 'tata-curvv-ev', true)
on conflict (id) do nothing;`}
              </pre>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
