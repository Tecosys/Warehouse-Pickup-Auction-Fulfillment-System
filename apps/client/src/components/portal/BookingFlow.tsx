'use client';

import React, { useState } from 'react';
import { ChevronLeft, CheckCircle2, MapPin, Clock, Calendar, Box, Info } from 'lucide-react';

interface BookingFlowProps {
  onBack: () => void;
  onConfirm: () => void;
}

const DATES = [
  { day: 'Mon', date: 'May 12' },
  { day: 'Tue', date: 'May 13' },
  { day: 'Wed', date: 'May 14' },
  { day: 'Thu', date: 'May 15' },
  { day: 'Fri', date: 'May 16' },
];

const SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
];

export default function BookingFlow({ onBack, onConfirm }: BookingFlowProps) {
  const [selectedDate, setSelectedDate] = useState('May 12');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade">
        <div className="w-24 h-24 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 size={56} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Appointment Confirmed!</h1>
        <p className="text-gray-500 text-lg mb-10">We've reserved your pickup slot.</p>

        <div className="bg-gray-50 rounded-3xl p-8 w-full max-w-sm mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-left">
              <Calendar className="text-teal-600" />
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase">Date & Time</div>
                <div className="font-bold text-gray-900">Mon, May 12 @ {selectedSlot}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-left">
              <Box className="text-teal-600" />
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase">Booking Code</div>
                <div className="font-mono font-bold text-gray-900">BB31-1221</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-left">
              <MapPin className="text-teal-600" />
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase">Location</div>
                <div className="font-bold text-gray-900 leading-tight">Entrance is at the back through the side bay door.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 max-w-sm mb-12 flex gap-3 text-left">
          <Info className="text-amber-500 flex-shrink-0" size={20} />
          <p className="text-xs text-amber-800 leading-relaxed">
            Please reschedule or arrive on time. Slots are limited. Missing your slot may result in delays or order cancellation.
          </p>
        </div>

        <button 
          onClick={onConfirm}
          className="text-teal-600 font-black text-lg hover:underline"
        >
          Back to My Order
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 font-bold mb-8 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={20} />
          Back to My Order
        </button>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Choose your pickup time</h1>
        <p className="text-gray-500 mb-10">Select an available date and time slot below.</p>

        {/* Date Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar mb-10">
          {DATES.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`flex-shrink-0 w-24 py-4 rounded-2xl border-2 transition-all flex flex-col items-center ${
                selectedDate === d.date 
                ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md' 
                : 'border-gray-100 text-gray-400 hover:border-gray-200'
              }`}
            >
              <span className="text-xs font-black uppercase tracking-widest mb-1">{d.day}</span>
              <span className="text-lg font-bold">{d.date.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-32">
          {SLOTS.map((slot, i) => {
            const isFull = i === 2 || i === 5; // Mock full slots
            const isNearFull = i === 1 || i === 8; // Mock near full
            const isSelected = selectedSlot === slot;

            return (
              <button
                key={slot}
                disabled={isFull}
                onClick={() => setSelectedSlot(slot)}
                className={`py-6 rounded-2xl border-2 font-bold transition-all text-center relative overflow-hidden ${
                  isFull 
                  ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                  : isSelected
                  ? 'bg-teal-500 border-teal-500 text-white shadow-lg'
                  : isNearFull
                  ? 'border-amber-200 bg-white text-gray-900 hover:border-amber-400'
                  : 'border-gray-100 bg-white text-gray-900 hover:border-teal-200'
                }`}
              >
                <div className="text-lg">{slot}</div>
                {!isFull && (
                  <div className={`text-[10px] font-black uppercase mt-1 ${isSelected ? 'text-teal-100' : isNearFull ? 'text-amber-500' : 'text-gray-400'}`}>
                    {isNearFull ? 'Only 2 left' : '8 spots left'}
                  </div>
                )}
                {isFull && <div className="text-[10px] font-black uppercase mt-1 text-gray-400">Full</div>}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Confirm Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <button 
            disabled={!selectedSlot}
            onClick={() => setConfirmed(true)}
            className={`w-full py-5 rounded-2xl font-black text-xl transition-all ${
              selectedSlot 
              ? 'bg-teal-500 text-white shadow-xl shadow-teal-100 hover:bg-teal-600' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Confirm Appointment
          </button>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
