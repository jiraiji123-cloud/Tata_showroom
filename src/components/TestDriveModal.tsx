import React, { useState } from 'react';
import { X, Check, Calendar, MapPin, User, Mail, Phone, Info, Leaf, ShieldAlert } from 'lucide-react';
import { TataCar, TestDriveBooking } from '../types';
import { submitBooking } from '../lib/supabase';
import { motion } from 'motion/react';

interface TestDriveModalProps {
  cars: TataCar[];
  selectedCarId?: string;
  onClose: () => void;
  onBookingSuccess: () => void;
}

const BRANCHES = [
  "Mumbai (Ghatkopar West Showroom)",
  "New Delhi (South Ext. Ring Road)",
  "Bangalore (Whitefield IT Hub Floor)",
  "Pune (Koregaon Park Flagship Store)",
  "Kolkata (Salt Lake Sector V Hub)"
];

const SLOTS = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM"
];

export default function TestDriveModal({
  cars,
  selectedCarId = '',
  onClose,
  onBookingSuccess
}: TestDriveModalProps) {
  const [carId, setCarId] = useState(selectedCarId || (cars[0]?.id || ''));
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState(SLOTS[1]);
  const [locationBranch, setLocationBranch] = useState(BRANCHES[0]);
  const [comments, setComments] = useState('');

  // UX support
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeCar = cars.find(c => c.id === carId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !email.trim() || !phone.trim() || !preferredDate) {
      setErrorMsg('All contact fields and appointment dates are required.');
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please specify a valid email address.');
      return;
    }

    // Phone validation
    if (!/^\+?[0-9\s-]{10,15}$/.test(phone)) {
      setErrorMsg('Please supply a valid telephone number.');
      return;
    }

    setLoading(true);

    const bookingPayload: TestDriveBooking = {
      id: `booking-${Date.now()}`,
      carId,
      carName: activeCar?.name || 'TATA Vehicle',
      customerName,
      email,
      phone,
      preferredDate,
      preferredTimeSlot,
      locationBranch,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      comments
    };

    try {
      const response = await submitBooking(bookingPayload);
      setSuccess(true);
      setTimeout(() => {
        onBookingSuccess();
        onClose();
      }, 2500);
    } catch (e) {
      console.error(e);
      setErrorMsg('Database synchronization offline. Preserving local record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="bg-[#0e1013] rounded-sm max-w-2xl w-full border border-neutral-800 shadow-2xl overflow-hidden flex flex-col text-[#eaeaea] max-h-[92vh]"
      >
        {/* Banner Header */}
        <div className="border-b border-neutral-850 p-5 flex items-center justify-between bg-[#13161b]">
          <div>
            <h3 className="text-base font-extrabold tracking-widest text-[#f3f4f6] uppercase">
              Schedule Your Test Drive
            </h3>
            <p className="text-xs text-neutral-400 mt-1 font-sans">
              Enter details below, and our dealer concierges will arrange your prioritized drive.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 rounded-sm text-neutral-450 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4 my-10 animate-fade-in">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Check className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h4 className="text-lg font-bold text-emerald-400">Request Registered Successfully!</h4>
            <div className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              We have locked in your booking slot for the <span className="font-semibold text-white">{activeCar?.name}</span>. A luxury automotive guide will contact you shortly via email/phone to confirm.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
            
            {errorMsg && (
              <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-sm text-xs text-red-300 font-semibold mb-2 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Vehicle Selection dropdown */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-neutral-400 uppercase tracking-wider">Select Vehicles</label>
              <select
                className="w-full bg-[#171a21]/80 hover:bg-[#1a1e27] border border-neutral-800 text-sm py-2.5 px-3 rounded-sm text-white focus:border-amber-500 outline-hidden font-bold transition"
                value={carId}
                onChange={(e) => setCarId(e.target.value)}
              >
                {cars.filter(c => c.displayActive).map((car) => (
                  <option key={car.id} value={car.id} className="bg-[#0e1013] text-[#f5f5f7]">
                    {car.name} ({car.type === 'EV' ? 'Electric Vehicle' : car.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Car Specs Card */}
            {activeCar && (
              <div className="bg-[#14161d] border border-neutral-850 p-4 rounded-sm flex flex-col sm:flex-row items-center gap-4 text-xs">
                <img 
                  src={activeCar.images.hero} 
                  alt={activeCar.name} 
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-1/3 h-20 object-cover rounded-sm border border-neutral-800"
                />
                <div className="flex-1 space-y-1 w-full text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#f5f5f7]">{activeCar.name}</span>
                    {activeCar.type === 'EV' && (
                      <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 border border-emerald-500/20 uppercase">
                        <Leaf className="h-2.5 w-2.5" /> Pure EV
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-450 text-[11px] leading-relaxed italic">{activeCar.tagline}</p>
                  
                  {/* Miniature Spec grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-850/50 text-[10px] uppercase font-semibold text-neutral-300">
                    <div>
                      <span className="text-neutral-500 block text-[9px]">Capacity</span>
                      <span>{activeCar.rangeOrEngine}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[9px]">Output</span>
                      <span>{activeCar.power}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[9px]">Seating</span>
                      <span>{activeCar.seating}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* General Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-neutral-550" /> Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Navdeep Singh"
                  className="w-full bg-[#171a21]/80 border border-neutral-800 text-sm py-2 px-3 rounded-sm text-white focus:border-amber-500 outline-hidden tracking-wide transition"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-neutral-550" /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. user@domain.com"
                  className="w-full bg-[#171a21]/80 border border-neutral-800 text-sm py-2 px-3 rounded-sm text-white focus:border-amber-500 outline-hidden tracking-wide transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={120}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-neutral-550" /> Mobile / Telephone
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-[#171a21]/80 border border-neutral-800 text-sm py-2 px-3 rounded-sm text-white focus:border-amber-500 outline-hidden tracking-wide transition"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={25}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-neutral-550" /> Select Showroom Branch
                </label>
                <select
                  className="w-full bg-[#171a21]/80 border border-neutral-800 text-xs py-2.5 px-2.5 rounded-sm text-white focus:border-amber-500 outline-hidden transition"
                  value={locationBranch}
                  onChange={(e) => setLocationBranch(e.target.value)}
                >
                  {BRANCHES.map((b, i) => (
                    <option key={i} value={b} className="bg-[#0e1013] text-[#eaeaea]">{b}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-neutral-550" /> Preferred Date
                </label>
                <input
                  type="date"
                  className="w-full bg-[#171a21]/80 border border-neutral-800 text-sm py-2 px-3 rounded-sm text-white focus:border-amber-500 outline-hidden font-mono transition"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  Preferred Time Slot
                </label>
                <select
                  className="w-full bg-[#171a21]/80 border border-[#1a1c22] border-neutral-800 text-xs py-2.5 px-3 rounded-sm text-white focus:border-amber-500 outline-hidden transition"
                  value={preferredTimeSlot}
                  onChange={(e) => setPreferredTimeSlot(e.target.value)}
                >
                  {SLOTS.map((s, i) => (
                    <option key={i} value={s} className="bg-[#0e1013] text-[#eaeaea]">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-neutral-400 uppercase tracking-wider">Custom Remarks / Special Requests</label>
              <textarea
                rows={2}
                placeholder="Let us know if you require structural access specifications, home test-drive setup, or quick appraisal for exchange vehicles."
                className="w-full bg-[#171a21]/80 border border-neutral-800 py-2 px-3 rounded-sm text-white focus:border-amber-500 outline-hidden tracking-wide font-sans text-xs transition"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                maxLength={400}
              />
            </div>

            <div className="p-3 bg-neutral-900/40 border border-neutral-850 rounded-sm text-[11px] leading-relaxed text-neutral-400 flex gap-2">
              <Info className="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <strong>Secure Authentication:</strong> Booking request goes directly into our unified N2S/Supabase ledger. No credit card required. Cancellation is free.
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-850/80">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-450 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 text-slate-950 text-xs font-extrabold uppercase tracking-widest rounded-sm transition active:scale-[0.98] cursor-pointer inline-flex items-center gap-1"
              >
                {loading ? "Registering..." : "Confirm Booking"}
              </button>
            </div>

          </form>
        )}
      </motion.div>
    </div>
  );
}
