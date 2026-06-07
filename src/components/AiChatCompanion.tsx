import React, { useState } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, User, ArrowRight, ChevronRight, CheckCircle, Flame, Leaf, Award } from 'lucide-react';
import { TataCar } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AiChatCompanionProps {
  cars: TataCar[];
  onFocusCar: (carId: string) => void;
  onOpenBooking: (carId: string) => void;
}

export default function AiChatCompanion({
  cars,
  onFocusCar,
  onOpenBooking
}: AiChatCompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Dialog flow
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; text: string; recommendedCarId?: string }>>([
    { 
      role: 'ai', 
      text: "Namaste! I am your Tata Motors Digital Advisor. Share what you look for in your next premium drive (budget, size, safety priority), and I will match you with the ideal model!" 
    }
  ]);

  // Form State Preferences
  const [budget, setBudget] = useState<number>(20);
  const [fuel, setFuel] = useState<string>('Any');
  const [seating, setSeating] = useState<string>('Any');
  const [stylePr, setStylePr] = useState<string>('Safety & Performance');

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userQuery = `Search details: Budget Limit < ₹${budget} Lakhs, Fuel priority: "${fuel}", Seating: "${seating}", Key priority: "${stylePr}"`;
    
    // Add user question
    const updatedMessages = [...messages, { role: 'user' as const, text: userQuery }];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/gemini/recommend-car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dialogueHistory: updatedMessages.map(m => ({ role: m.role, text: m.text })),
          userPreferences: {
            maxBudget: budget,
            fuelPreference: fuel,
            seatingNeed: seating,
            styleValue: stylePr
          }
        })
      });

      if (!response.ok) {
        throw new Error('Advisor API un-synchronized.');
      }

      const rawData = await response.json();
      
      setMessages([
        ...updatedMessages,
        {
          role: 'ai',
          text: rawData.aiMessage,
          recommendedCarId: rawData.suggestedCarId
        }
      ]);

      // Auto scroll or target focus recommended car
      if (rawData.suggestedCarId) {
        onFocusCar(rawData.suggestedCarId);
      }

    } catch (err) {
      console.error(err);
      setMessages([
        ...updatedMessages,
        {
          role: 'ai',
          text: "My neural link is currently calibrating. Based on standard diagnostic rules, our flagship TATA CURVV.ev coupe or the robust 5-Star TATA NEXON are perfect matches for progressive drivers who prioritize safety and build quality."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans select-none text-[#eaeaea]">
      
      {/* Small floating button */}
      <button
        id="btn-ai-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all outline-hidden cursor-pointer group"
      >
        {isOpen ? (
          <X className="h-6 w-6 stroke-[2.2]" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#101010] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#101010]"></span>
            </span>
          </div>
        )}
      </button>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="absolute bottom-16 right-0 w-[350px] sm:w-[410px] h-[550px] bg-[#0e1115]/95 backdrop-blur-md border border-neutral-800 rounded-sm shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Panel Header */}
            <div className="bg-[#13161c] border-b border-neutral-850 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 px-2.5 rounded text-[10px] font-black uppercase text-slate-950 bg-amber-500">
                  AI Advisor
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-widest uppercase">TATA AI Concierge</h4>
                  <span className="text-[9px] text-[#4dff91] font-bold block mt-0.5">🟢 Online • Gemini 3.5</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message Dialog Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-left scrollbar-thin">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'ai' && (
                    <div className="w-6 h-6 bg-amber-500 rounded-sm text-slate-950 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      AI
                    </div>
                  )}
                  
                  <div className="space-y-2 max-w-[80%]">
                    <div className={`p-3 rounded-sm leading-relaxed ${
                      message.role === 'user' 
                        ? 'bg-[#1b1f28]/95 border border-neutral-800 text-right text-gray-300 ml-auto' 
                        : 'bg-[#14171d] border border-neutral-850 text-left text-gray-200'
                    }`}>
                      {message.text}
                    </div>

                    {/* Highly stylized Recommended Car Tagline card */}
                    {message.role === 'ai' && message.recommendedCarId && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-sm space-y-2 text-left animate-fade-in relative overflow-hidden">
                        <div className="flex items-start justify-between gap-2.5">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">RECOMMENDED COMPANION</span>
                            <h5 className="font-extrabold text-white text-xs mt-0.5 uppercase tracking-wide">
                              {cars.find(c => c.id === message.recommendedCarId)?.name || "TATA Vehicle"}
                            </h5>
                          </div>
                          <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                        </div>
                        
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => onFocusCar(message.recommendedCarId!)}
                            className="bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-bold text-white px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
                          >
                            Show Floor
                          </button>
                          
                          <button
                            onClick={() => onOpenBooking(message.recommendedCarId!)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[10px] px-2.5 py-1 rounded transition uppercase tracking-wider cursor-pointer"
                          >
                            Book Drive
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 p-2 justify-start items-center text-[10px] text-neutral-450 italic">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping mr-1" />
                  Advisor Gemini is selecting vehicles & safety parameters...
                </div>
              )}
            </div>

            {/* Quick Filter Selectors Controls panel */}
            <form onSubmit={handleAskAI} className="bg-[#12151b] border-t border-neutral-850 p-3.5 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block text-left">
                Refine Your Requirement Parameters:
              </span>

              {/* Simple Controls selectors */}
              <div className="grid grid-cols-2 gap-2 text-[10.5px] text-left">
                <div>
                  <label className="text-neutral-500 block mb-0.5">MSRP Limit: <strong className="text-white">₹{budget}L</strong></label>
                  <input
                    type="range"
                    min="7"
                    max="30"
                    step="1"
                    className="w-full accent-amber-500"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <label className="text-neutral-500 block mb-0.5">Preferred Fuel</label>
                  <select
                    className="w-full bg-[#171b22] border border-neutral-800 p-1 rounded-xs text-[#eaeaea]"
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                  >
                    <option value="Any">Petrol / EV / Diesel</option>
                    <option value="EV">Pure EV Only</option>
                    <option value="SUV">High-Torque SUV</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-500 block mb-0.5">Seating capacity</label>
                  <select
                    className="w-full bg-[#171b22] border border-neutral-800 p-1 rounded-xs text-[#eaeaea]"
                    value={seating}
                    onChange={(e) => setSeating(e.target.value)}
                  >
                    <option value="Any">Standard 5 Seats</option>
                    <option value="6-7">Flagship 3-Rows (6/7)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-500 block mb-0.5">Cabin focus</label>
                  <select
                    className="w-full bg-[#171b22] border border-neutral-800 p-1 rounded-xs text-[#eaeaea]"
                    value={stylePr}
                    onChange={(e) => setStylePr(e.target.value)}
                  >
                    <option value="Safety & Performance">Safety Rating First</option>
                    <option value="Ultra Luxury Comfort">Executive Captain Lounge</option>
                    <option value="Urban Mobility Connectivity">Micro EV Versatility</option>
                  </select>
                </div>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-8.5 bg-amber-500 hover:bg-amber-600 active:scale-95 transition-all text-slate-950 uppercase font-black tracking-widest text-[10.5px] rounded-xs flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-amber-500/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Find My Perfect Tata Car
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
