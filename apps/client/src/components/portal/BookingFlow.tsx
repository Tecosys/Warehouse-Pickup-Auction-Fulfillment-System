'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, MapPin, Clock, Calendar, Box, Info, Loader2 } from 'lucide-react';

interface BookingFlowProps {
  orderId: string;
  onBack: () => void;
  onConfirm: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function BookingFlow({ orderId, onBack, onConfirm }: BookingFlowProps) {
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [hasAuthorizedPerson, setHasAuthorizedPerson] = useState(false);
  const [authPerson, setAuthPerson] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Order to get AuctionRunId
        const orderRes = await fetch(`${API_URL}/api/orders/${orderId}`);
        const order = await orderRes.json();
        setOrderData(order);

        if (order.auctionRun?._id) {
          // 2. Fetch Available Slots
          const slotsRes = await fetch(`${API_URL}/api/slots/available/${order.auctionRun._id}`);
          const slotsData = await slotsRes.json();
          setSlots(slotsData);
          
          // Set initial date if slots exist
          if (slotsData.length > 0) {
            setSelectedDate(slotsData[0].date);
          }
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handleConfirm = async () => {
    if (!selectedSlotId) return;

    try {
      setBookingLoading(true);
      const res = await fetch(`${API_URL}/api/orders/${orderId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slotId: selectedSlotId,
          authorizedPerson: hasAuthorizedPerson ? authPerson : undefined
        })
      });

      if (res.ok) {
        setConfirmed(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to book slot');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Network error while booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-500" size={48} />
      </div>
    );
  }

  if (confirmed) {
    const selectedSlot = slots.find(s => s._id === selectedSlotId);
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
                <div className="font-bold text-gray-900">{selectedSlot?.date} @ {selectedSlot?.startTime}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-left">
              <Box className="text-teal-600" />
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase">Booking Code</div>
                <div className="font-mono font-bold text-gray-900">{orderData?.bookingCode}</div>
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

        <button 
          onClick={onConfirm}
          className="text-teal-600 font-black text-lg hover:underline"
        >
          Back to My Order
        </button>
      </div>
    );
  }

  const uniqueDates = Array.from(new Set(slots.map(s => s.date))).sort();
  const filteredSlots = slots.filter(s => s.date === selectedDate);

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

        {slots.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center text-amber-700 animate-fade">
            <Info className="mx-auto mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">No Pickup Slots Available</h3>
            <p className="text-sm opacity-90 max-w-md mx-auto">
              There are currently no pickup time slots scheduled for this auction. Please contact support or check back later.
            </p>
          </div>
        ) : (
          <>
            {/* Date Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar mb-10">
          {uniqueDates.map((dateStr) => {
            const dateObj = new Date(dateStr + 'T00:00:00');
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = dateObj.getDate();
            
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex-shrink-0 w-24 py-4 rounded-2xl border-2 transition-all flex flex-col items-center ${
                  selectedDate === dateStr 
                  ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md' 
                  : 'border-gray-100 text-gray-400 hover:border-gray-200'
                }`}
              >
                <span className="text-xs font-black uppercase tracking-widest mb-1">{dayName}</span>
                <span className="text-lg font-bold">{dayNum}</span>
              </button>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {filteredSlots.map((slot) => {
            const isFull = slot.currentBookings >= slot.maxCapacity;
            const isNearFull = slot.currentBookings >= slot.maxCapacity * 0.8;
            const isSelected = selectedSlotId === slot._id;

            return (
              <button
                key={slot._id}
                disabled={isFull}
                onClick={() => setSelectedSlotId(slot._id)}
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
                <div className="text-lg">{slot.startTime}</div>
                {!isFull && (
                  <div className={`text-[10px] font-black uppercase mt-1 ${isSelected ? 'text-teal-100' : isNearFull ? 'text-amber-500' : 'text-gray-400'}`}>
                    {slot.maxCapacity - slot.currentBookings} spots left
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

        {/* Authorized Pickup Person Details */}
        {selectedSlotId && (
          <div className="bg-gray-50 rounded-3xl p-6 mb-32 border border-gray-100 max-w-xl animate-fade">
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input 
                type="checkbox"
                checked={hasAuthorizedPerson}
                onChange={(e) => setHasAuthorizedPerson(e.target.checked)}
                className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-gray-300"
              />
              <span className="font-bold text-gray-900">Someone else will pick up my order</span>
            </label>

            {hasAuthorizedPerson && (
              <div className="space-y-4 mt-4 animate-fade">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Authorized Person's Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={authPerson.name}
                    onChange={(e) => setAuthPerson({ ...authPerson, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 font-bold"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 416-555-0199"
                      value={authPerson.phone}
                      onChange={(e) => setAuthPerson({ ...authPerson, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. john@example.com"
                      value={authPerson.email}
                      onChange={(e) => setAuthPerson({ ...authPerson, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>

      {/* Sticky Confirm Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <button 
            disabled={!selectedSlotId || bookingLoading}
            onClick={handleConfirm}
            className={`w-full py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 ${
              selectedSlotId 
              ? 'bg-teal-500 text-white shadow-xl shadow-teal-100 hover:bg-teal-600' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {bookingLoading ? <Loader2 className="animate-spin" /> : 'Confirm Appointment'}
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
