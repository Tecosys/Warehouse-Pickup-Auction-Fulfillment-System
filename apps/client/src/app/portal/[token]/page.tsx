'use client';

import React, { useState } from 'react';
import { Box, Calendar, ChevronDown, ChevronUp, MapPin, Phone, HelpCircle, ArrowRight, CheckCircle2, Truck, Clock } from 'lucide-react';
import BookingFlow from '@/components/portal/BookingFlow';

export default function CustomerPortal({ params }: { params: { token: string } }) {
  const [activeView, setActiveView] = useState<'landing' | 'booking'>('landing');
  const [showLots, setShowLots] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [shippingSelected, setShippingSelected] = useState(false);
  const [authorizedPerson, setAuthorizedPerson] = useState<{ name: string; phone: string } | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);

  const mockOrder = {
    customerName: "Jonathan Harker",
    auctionNum: "31",
    auctionTitle: "Weekly Electronics & Overstock Liquidation",
    lotCount: 12,
    bookingCode: "BB31-1221",
    status: isBooked ? "Booked" : "Awaiting Choice"
  };

  if (activeView === 'booking') {
    return (
      <BookingFlow 
        onBack={() => setActiveView('landing')} 
        onConfirm={() => {
          setIsBooked(true);
          setActiveView('landing');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/Logo.png" alt="BidBoss Logo" className="h-8 w-auto" />
          </div>
          <a href="mailto:support@bidbossinc.ca" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1.5">
            <HelpCircle size={14} />
            Need help? Contact us
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Hello, {mockOrder.customerName}</h1>
          <p className="text-gray-500">Auction {mockOrder.auctionNum} — {mockOrder.auctionTitle}</p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Booking Code / Reference</label>
              <div className="text-2xl font-mono font-bold text-[#0d9488]">{mockOrder.bookingCode}</div>
            </div>
            <div className="flex flex-col md:items-end">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                isBooked ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isBooked ? 'bg-teal-500' : 'bg-amber-500'}`} />
                {mockOrder.status}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <button 
              onClick={() => setShowLots(!showLots)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-lg font-bold">You won <span className="text-[#0d9488]">{mockOrder.lotCount} lots</span></span>
              {showLots ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {showLots && (
              <div className="mt-4 space-y-2 animate-slide">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 text-sm py-2 border-b border-gray-50 last:border-0">
                    <span className="font-bold text-gray-400">#{(i * 112)}</span>
                    <span className="text-gray-700">Samsung 65" 4K Smart TV - Factory Sealed</span>
                  </div>
                ))}
                <div className="text-sm text-gray-400 italic">...and {mockOrder.lotCount - 3} more items</div>
              </div>
            )}
          </div>
        </div>

        {/* Action Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Pickup Card */}
          <div className={`bg-white rounded-2xl border-2 p-8 transition-all ${
            isBooked ? 'border-[#0d9488]' : 'border-transparent shadow-sm hover:shadow-md'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
              isBooked ? 'bg-teal-50 text-[#0d9488]' : 'bg-gray-50 text-gray-400'
            }`}>
              <MapPin size={24} />
            </div>
            <h2 className="text-xl font-bold mb-2">Pickup</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Choose a time to collect your order from our warehouse.
            </p>

            {!isBooked ? (
              <button 
                onClick={() => setActiveView('booking')}
                className="w-full bg-[#0d9488] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#0f766e] transition-colors"
              >
                Book Appointment
                <ArrowRight size={18} />
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-teal-50 text-[#0f766e] p-4 rounded-xl text-center">
                  <div className="text-sm font-bold uppercase tracking-wider mb-1">Confirmed Slot</div>
                  <div className="text-lg font-black">Mon, May 12 @ 2:30 PM</div>
                </div>
                <div className="flex justify-between items-center px-2">
                  <button onClick={() => setActiveView('booking')} className="text-[#0d9488] text-sm font-bold hover:underline">Reschedule</button>
                  <button className="text-red-500 text-sm font-bold hover:underline">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Shipping Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-transparent p-8 opacity-60 grayscale cursor-not-allowed">
            <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center mb-6">
              <Truck size={24} />
            </div>
            <h2 className="text-xl font-bold mb-2">Shipping</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Have your order shipped to your address.
            </p>
            <button disabled className="w-full border-2 border-gray-200 text-gray-400 font-bold py-4 rounded-xl">
              Request Shipping
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="text-center px-4 mb-12">
          <p className="text-xs text-gray-400 leading-loose max-w-lg mx-auto">
            Once shipping is selected, it cannot be changed back to pickup through this portal. For changes, contact us.
            Appointment slots are limited. Please reschedule or arrive on time.
          </p>
        </div>

        {/* Authorized Pickup Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Authorized Pickup Person</h3>
              {!authorizedPerson ? (
                <p className="text-sm text-gray-400 mt-1">Want someone else to pick up on your behalf?</p>
              ) : (
                <p className="text-[#0d9488] font-bold mt-1">{authorizedPerson.name} — {authorizedPerson.phone}</p>
              )}
            </div>
            <button 
              onClick={() => setShowAuthForm(!showAuthForm)}
              className="text-[#0d9488] font-bold text-sm"
            >
              {authorizedPerson ? 'Edit' : 'Add Person →'}
            </button>
          </div>

          {showAuthForm && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-slide">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-[#0d9488]"
                    placeholder="Enter name..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-lg border border-gray-200 outline-none focus:border-[#0d9488]"
                    placeholder="Enter phone..."
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  setAuthorizedPerson({ name: "James Santoro", phone: "416-555-0192" });
                  setShowAuthForm(false);
                }}
                className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg font-bold text-sm"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
