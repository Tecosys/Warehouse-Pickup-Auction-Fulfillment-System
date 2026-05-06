'use client';

import React, { useState, useEffect } from 'react';
import { Box, Calendar, ChevronDown, ChevronUp, MapPin, HelpCircle, ArrowRight, CheckCircle2, Truck, Clock, ShieldCheck } from 'lucide-react';
import BookingFlow from '@/components/portal/BookingFlow';

export default function CustomerPortal({ params }: { params: { token: string } }) {
  const [activeView, setActiveView] = useState<'landing' | 'booking'>('landing');
  const [showLots, setShowLots] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shippingLoading, setShippingLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // Assuming token is orderId for now
      const res = await fetch(`http://localhost:5000/api/orders/${params.token}`);
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.token]);

  const handleConfirmShipping = async () => {
    if (!window.confirm("Confirming shipping is irreversible. You will not be able to choose pickup after this. Proceed?")) return;
    
    try {
      setShippingLoading(true);
      const res = await fetch(`http://localhost:5000/api/orders/${params.token}/confirm-shipping`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchOrder();
      }
    } catch (error) {
      console.error('Error confirming shipping:', error);
    } finally {
      setShippingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-8">
        {/* Orbital loader */}
        <div style={{ position: 'relative', width: '72px', height: '72px' }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#00A87E',
            borderRightColor: 'rgba(0,168,126,0.25)',
            animation: 'portal-spin 0.9s linear infinite'
          }} />
          <div style={{
            position: 'absolute', inset: '12px', borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'rgba(0,168,126,0.45)',
            animation: 'portal-spin 1.5s linear infinite reverse'
          }} />
          <div style={{
            position: 'absolute', inset: '23px', borderRadius: '50%',
            background: '#00A87E',
            animation: 'portal-pulse 1.8s ease-in-out infinite'
          }} />
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-gray-800 mb-1">Loading your order...</p>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#00A87E',
                animation: `portal-bounce 1.2s ease-in-out ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes portal-spin { to { transform: rotate(360deg); } }
          @keyframes portal-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.75); opacity: 0.5; } }
          @keyframes portal-bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.35; } 40% { transform: translateY(-8px); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
        <p className="text-gray-500">Please check your link and try again.</p>
      </div>
    );
  }

  const isBooked = order.customerStatus === 'Booked';
  const isShippingConfirmed = order.isShippingConfirmed || order.retrievalMethod === 'Shipping';

  if (activeView === 'booking') {
    return (
      <BookingFlow 
        orderId={order._id}
        onBack={() => setActiveView('landing')} 
        onConfirm={() => {
          fetchOrder();
          setActiveView('landing');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-[#f9fafb]">
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
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Hello, {order.customer?.name}</h1>
          <p className="text-gray-500 font-medium">Auction #{order.auctionRun?.auctionNumber} — {order.auctionRun?.title}</p>
        </div>

        {/* Status Stepper */}
        <div className="mb-12 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center relative">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
             
             {[
               { label: 'Won', icon: <Box size={16} />, done: true, current: false },
               { label: isShippingConfirmed ? 'Shipping' : 'Booking', icon: isShippingConfirmed ? <Truck size={16} /> : <Calendar size={16} />, done: isBooked || isShippingConfirmed, current: !isBooked && !isShippingConfirmed },
               { label: 'Ready', icon: <Clock size={16} />, done: order.fulfillmentStatus === 'Ready', current: false },
               { label: 'Done', icon: <CheckCircle2 size={16} />, done: order.customerStatus === 'Picked Up', current: false },
             ].map((step, i) => (
               <div key={i} className="flex flex-col items-center gap-2 relative z-10 bg-white px-2">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                   step.done ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 
                   step.current ? 'bg-white border-4 border-teal-500 text-teal-600 shadow-xl' : 
                   'bg-white border-2 border-gray-100 text-gray-300'
                 }`}>
                   {step.icon}
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${
                   step.done || step.current ? 'text-gray-900' : 'text-gray-300'
                 }`}>{step.label}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Booking Code / Reference</label>
              <div className="text-2xl font-mono font-bold text-[#0d9488]">{order.bookingCode}</div>
            </div>
            <div className="flex flex-col md:items-end">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                isBooked || isShippingConfirmed ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isBooked || isShippingConfirmed ? 'bg-teal-500' : 'bg-amber-500'}`} />
                {order.customerStatus}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <button 
              onClick={() => setShowLots(!showLots)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-lg font-bold">You won <span className="text-[#0d9488]">{order.lots?.length || 0} lots</span></span>
              {showLots ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {showLots && (
              <div className="mt-4 space-y-2 animate-slide">
                {order.lots?.map((lot: any) => (
                  <div key={lot._id} className="flex gap-4 text-sm py-2 border-b border-gray-50 last:border-0">
                    <span className="font-bold text-gray-400">#{lot.lotNumber}</span>
                    <span className="text-gray-700">{lot.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Pickup Card */}
          <div className={`bg-white rounded-3xl border-2 p-8 transition-all duration-300 transform ${
            isShippingConfirmed ? 'opacity-40 grayscale pointer-events-none' : 'hover:-translate-y-1'
          } ${
            isBooked ? 'border-[#0d9488] shadow-lg shadow-teal-500/10' : 'border-transparent shadow-md hover:shadow-xl hover:border-teal-500/20'
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
                  <div className="text-lg font-black">{new Date(order.appointmentTime).toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center px-2">
                  <button onClick={() => setActiveView('booking')} className="text-[#0d9488] text-sm font-bold hover:underline">Reschedule</button>
                </div>
              </div>
            )}
          </div>

          {/* Shipping Card */}
          <div className={`bg-white rounded-3xl border-2 p-8 transition-all duration-300 transform ${
            isBooked ? 'opacity-40 grayscale pointer-events-none' : 'hover:-translate-y-1'
          } ${
            isShippingConfirmed ? 'border-[#0d9488] shadow-lg shadow-teal-500/10' : 'border-transparent shadow-md hover:shadow-xl hover:border-teal-500/20'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
              isShippingConfirmed ? 'bg-teal-50 text-[#0d9488]' : 'bg-gray-50 text-gray-400'
            }`}>
              <Truck size={24} />
            </div>
            <h2 className="text-xl font-bold mb-2">Shipping</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {isShippingConfirmed 
                ? 'Your order is in the shipping queue.' 
                : 'Have your order shipped to your address.'}
            </p>
            
            {isShippingConfirmed ? (
              <div className="bg-teal-50 text-[#0f766e] p-4 rounded-xl text-center">
                <div className="text-sm font-bold uppercase tracking-wider mb-1">Status</div>
                <div className="text-lg font-black">Shipping Confirmed</div>
              </div>
            ) : (
              <button 
                onClick={handleConfirmShipping}
                disabled={shippingLoading}
                className="w-full border-2 border-[#0d9488] text-[#0d9488] font-bold py-4 rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
              >
                {shippingLoading ? <Loader2 className="animate-spin" size={20} /> : 'Request Shipping'}
              </button>
            )}
          </div>
        </div>

        {/* Requirements Section (Hidden if shipping) */}
        {!isShippingConfirmed && (
          <div className="bg-[#1e293b] text-white rounded-3xl p-8 mb-12 flex flex-col md:flex-row gap-8 items-center">
             <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                   <ShieldCheck className="text-teal-400" size={24} />
                   Pickup Requirements
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                   To ensure a fast and secure collection, please have your **Booking Code** and **Photo ID** ready. 
                </p>
             </div>
             <div className="flex gap-4">
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center">
                   <div className="text-xs text-slate-500 font-bold uppercase mb-1">Gate Code</div>
                   <div className="text-lg font-mono font-bold text-teal-400">#4492</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center">
                   <div className="text-xs text-slate-500 font-bold uppercase mb-1">Warehouse</div>
                   <div className="text-lg font-bold">BAY 4</div>
                </div>
             </div>
          </div>
        )}
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
