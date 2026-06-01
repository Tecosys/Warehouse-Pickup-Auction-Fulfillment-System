'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  Clock, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  Upload, 
  Trash2, 
  ShieldAlert, 
  ArrowLeft,
  FileText,
  DollarSign
} from 'lucide-react';
import BookingFlow from '@/components/portal/BookingFlow';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CustomerPortal({ params }: { params: any }) {
  const resolvedParams: any = React.use(params);
  const token = resolvedParams.token;
  const [activeView, setActiveView] = useState<'landing' | 'booking'>('landing');
  const [showLots, setShowLots] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shippingLoading, setShippingLoading] = useState(false);
  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'order' | 'items' | 'tickets'>('order');

  // Dispute States
  const [selectedLotForDispute, setSelectedLotForDispute] = useState<any>(null);
  const [disputeReason, setDisputeReason] = useState('Damaged / Broken');
  const [disputeNotes, setDisputeNotes] = useState('');
  const [evidencePaths, setEvidencePaths] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Tickets States
  const [cases, setCases] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // Assuming token is orderId for now
      const res = await fetch(`${API_URL}/api/orders/${token}`);
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    if (!order?._id) return;
    try {
      setTicketsLoading(true);
      const res = await fetch(`${API_URL}/api/cases/orders/${order._id}`);
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [token]);

  useEffect(() => {
    if (order?._id) {
      fetchCases();
    }
  }, [order?._id, activeTab]);

  const handleConfirmShipping = async () => {
    if (!window.confirm("Confirming shipping is irreversible. You will not be able to choose pickup after this. Proceed?")) return;
    
    try {
      setShippingLoading(true);
      const res = await fetch(`${API_URL}/api/orders/${token}/confirm-shipping`, {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/api/cases/upload-evidence`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setEvidencePaths(prev => [...prev, data.filePath]);
      } else {
        alert('Failed to upload file. Please try again.');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidencePaths(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotForDispute || !order) return;

    try {
      setSubmittingDispute(true);
      const payload = {
        orderId: order._id,
        type: 'Dispute',
        lines: [{
          lotNumber: selectedLotForDispute.lotNumber,
          reason: disputeReason,
          status: 'Disputed',
          notes: disputeNotes
        }],
        evidence: evidencePaths
      };

      const res = await fetch(`${API_URL}/api/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Dispute submitted successfully. Our staff will review it shortly.');
        setSelectedLotForDispute(null);
        setDisputeNotes('');
        setEvidencePaths([]);
        setActiveTab('tickets');
        fetchCases();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit dispute.');
      }
    } catch (err) {
      console.error('Error submitting dispute:', err);
      alert('Error submitting dispute.');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const getDisputeCountdown = () => {
    if (!order.completeTimestamp) {
      return { eligible: false, text: 'Awaiting Pickup Release' };
    }
    if (!order.disputeDeadline) {
      return { eligible: false, text: 'No dispute deadline' };
    }
    const deadline = new Date(order.disputeDeadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    
    if (diffTime <= 0) {
      return { eligible: false, text: 'Dispute window closed' };
    }
    
    const diffHoursTotal = Math.ceil(diffTime / (1000 * 60 * 60));
    if (diffHoursTotal < 24) {
      return {
        eligible: true,
        text: `${diffHoursTotal}h remaining`
      };
    }
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return {
      eligible: true,
      text: `${diffDays}d ${diffHours}h remaining`
    };
  };

  const getMediaUrl = (pathStr: string) => {
    if (!pathStr) return '';
    if (pathStr.startsWith('http://') || pathStr.startsWith('https://')) return pathStr;
    if (pathStr.startsWith('/uploads')) return `${API_URL}${pathStr}`;
    return `${API_URL}/uploads/cases/${pathStr}`;
  };

  const isVideo = (pathStr: string) => {
    const ext = pathStr.split('.').pop()?.toLowerCase();
    return ext ? ['mp4', 'mov', 'webm', 'avi'].includes(ext) : false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-8">
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#0d9488] font-black text-xl tracking-tight">BIDBOSS<span className="text-gray-400 font-normal">PORTAL</span></span>
          </div>
          <a href="mailto:support@bidbossinc.ca" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1.5">
            <HelpCircle size={14} />
            Need help? Contact us
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Customer Greeting */}
        <div className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Hello, {order.customer?.name}</h1>
            <p className="text-gray-500 font-medium">Auction #{order.auctionRun?.auctionNumber} — {order.auctionRun?.title}</p>
          </div>
          <div className="bg-[#f0fdfa] border border-teal-100 rounded-2xl px-4 py-2 flex items-center gap-2 self-center md:self-auto">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Bidder:</span>
            <span className="text-[#0d9488] font-black">#{order.bidderNumber}</span>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 gap-6 overflow-x-auto whitespace-nowrap no-scrollbar scroll-smooth">
          {[
            { id: 'order', label: 'Schedule & Track', count: null },
            { id: 'items', label: 'Won Items & Disputes', count: order.lots?.length || 0 },
            { id: 'tickets', label: 'Support Tickets & Returns', count: cases.length || null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedLotForDispute(null); // Clear dispute state when swapping tabs
              }}
              className={`pb-4 text-sm font-extrabold transition-all relative flex-shrink-0 ${
                activeTab === tab.id ? 'text-[#0d9488]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] bg-gray-100 text-gray-500">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0d9488]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="animate-slide">
          {/* TAB 1: SCHEDULE & TRACK */}
          {activeTab === 'order' && (
            <div>
              {/* Status Stepper */}
              <div className="mb-10 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center relative">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                  
                  {[
                    { label: 'Won', icon: <Box size={16} />, done: true, current: false },
                    { label: isShippingConfirmed ? 'Shipping' : 'Booking', icon: isShippingConfirmed ? <Truck size={16} /> : <Calendar size={16} />, done: isBooked || isShippingConfirmed, current: !isBooked && !isShippingConfirmed },
                    { label: 'Ready', icon: <Clock size={16} />, done: order.fulfillmentStatus === 'Ready' || order.shippingStatus === 'Ready to Ship' || order.shippingStatus === 'Dispatched', current: false },
                    { label: 'Done', icon: <CheckCircle2 size={16} />, done: order.customerStatus === 'Picked Up' || order.shippingStatus === 'Dispatched', current: false },
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

              {/* Order Summary Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Booking Reference</label>
                    <div className="text-2xl font-mono font-bold text-[#0d9488]">{order.bookingCode}</div>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                      isBooked || isShippingConfirmed ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${isBooked || isShippingConfirmed ? 'bg-teal-500' : 'bg-amber-500'}`} />
                      {order.shippingStatus ? `Shipping: ${order.shippingStatus}` : `Pickup: ${order.customerStatus}`}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <button 
                    onClick={() => setShowLots(!showLots)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="text-lg font-bold">Won items list <span className="text-[#0d9488]">({order.lots?.length || 0} lots)</span></span>
                    {showLots ? <ChevronUp /> : <ChevronDown />}
                  </button>
                  
                  {showLots && (
                    <div className="mt-4 space-y-2 animate-slide">
                      {order.lots?.map((lot: any) => (
                        <div key={lot._id} className="flex gap-4 text-sm py-2.5 border-b border-gray-50 last:border-0 items-center">
                          <span className="font-bold text-gray-400">Lot {lot.lotNumber}</span>
                          <span className="text-gray-700 flex-1">{lot.description}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500 font-bold">{lot.status || 'Won'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Actions */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Pickup Scheduling */}
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
                  <h2 className="text-xl font-bold mb-2">Self-Pickup</h2>
                  <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    Schedule a time slot to check in and pick up your items at our primary warehouse.
                  </p>

                  {!isBooked ? (
                    <button 
                      onClick={() => setActiveView('booking')}
                      className="w-full bg-[#0d9488] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#0f766e] transition-colors"
                    >
                      Book Pickup Slot
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-teal-50 text-[#0f766e] p-4 rounded-xl text-center">
                        <div className="text-sm font-bold uppercase tracking-wider mb-1">Confirmed Appointment</div>
                        <div className="text-lg font-black">{new Date(order.appointmentTime).toLocaleString()}</div>
                      </div>
                      {order.authorizedPerson && order.authorizedPerson.name && (
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Authorized Pickup Person</div>
                          <div className="text-sm font-bold text-gray-800">{order.authorizedPerson.name}</div>
                          {order.authorizedPerson.phone && <div className="text-xs text-gray-500">{order.authorizedPerson.phone}</div>}
                          {order.authorizedPerson.email && <div className="text-xs text-gray-500">{order.authorizedPerson.email}</div>}
                        </div>
                      )}
                      <div className="flex justify-between items-center px-2">
                        <button onClick={() => setActiveView('booking')} className="text-[#0d9488] text-sm font-bold hover:underline">Reschedule Appointment</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shipping Queue */}
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
                  <h2 className="text-xl font-bold mb-2">Deliver / Ship</h2>
                  <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    Request delivery. We consolidate items and dispatch via local courier/postal service.
                  </p>
                  
                  {isShippingConfirmed ? (
                    <div className="space-y-4">
                      <div className="bg-teal-50 text-[#0f766e] p-4 rounded-xl text-center">
                        <div className="text-sm font-bold uppercase tracking-wider mb-1">Fulfillment Status</div>
                        <div className="text-lg font-black">{order.shippingStatus || 'Shipping Confirmed'}</div>
                      </div>
                      {order.trackingNumber && (
                        <div className="p-3 bg-slate-50 border rounded-xl font-mono text-center text-sm">
                          Tracking: <a href={`https://www.google.com/search?q=${order.trackingNumber}`} target="_blank" rel="noreferrer" className="text-[#0d9488] underline font-bold">{order.trackingNumber}</a>
                        </div>
                      )}
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

              {/* Warehouse Requirements */}
              {!isShippingConfirmed && (
                <div className="bg-[#1e293b] text-white rounded-3xl p-8 mb-12 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <ShieldCheck className="text-teal-400" size={24} />
                      Fulfillment collection rules
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Please check-in at the gate with your **Booking Code** and photo ID. Staff will fetch your items.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center">
                      <div className="text-xs text-slate-500 font-bold uppercase mb-1">Gate Code</div>
                      <div className="text-lg font-mono font-bold text-teal-400">#4492</div>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center">
                      <div className="text-xs text-slate-500 font-bold uppercase mb-1">Pickup Bay</div>
                      <div className="text-lg font-bold">BAY 4</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WON ITEMS & DISPUTES */}
          {activeTab === 'items' && (
            <div>
              {!selectedLotForDispute ? (
                <div>
                  <h3 className="text-lg font-extrabold mb-4">Won Items dispute eligibility</h3>
                  <div className="grid gap-4">
                    {order.lots?.map((lot: any) => {
                      const countdown = getDisputeCountdown();
                      const grade = (lot.condition || '').toUpperCase().trim();
                      const isEligibleGrade = !lot.condition || 
                        grade.startsWith('A') || 
                        grade.startsWith('B') || 
                        grade.includes('GRADE A') || 
                        grade.includes('GRADE B');
                      
                      const canDispute = countdown.eligible && isEligibleGrade;
                      const eligibilityText = !isEligibleGrade 
                        ? 'Not eligible due to grade' 
                        : countdown.text;
                      return (
                        <div key={lot._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div>
                            <span className="inline-block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Lot #{lot.lotNumber}</span>
                            <h4 className="font-bold text-gray-800">{lot.description || 'Auction Lot Item'}</h4>
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                              <Clock size={12} />
                              <span>Dispute status: </span>
                              <span className={`font-bold ${canDispute ? 'text-teal-600' : 'text-rose-500'}`}>
                                {eligibilityText}
                              </span>
                            </div>
                            {lot.condition && (
                              <div className="text-xs text-gray-400 mt-1">Grade: <span className="font-bold">{lot.condition}</span></div>
                            )}
                          </div>
                          <div>
                            {canDispute ? (
                              <button 
                                onClick={() => setSelectedLotForDispute(lot)}
                                className="w-full sm:w-auto bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
                              >
                                File Dispute
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 font-bold bg-gray-50 px-3 py-2 rounded-xl block text-center">
                                Dispute Unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Dispute Submission Form */
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8">
                  <button 
                    onClick={() => setSelectedLotForDispute(null)}
                    className="inline-flex items-center gap-1 text-sm font-extrabold text-[#0d9488] mb-6 hover:underline"
                  >
                    <ArrowLeft size={16} /> Back to Won Items
                  </button>

                  <h3 className="text-2xl font-black mb-1">Submit Dispute Case</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Filing a dispute on: <strong>Lot #{selectedLotForDispute.lotNumber}</strong> - {selectedLotForDispute.description}
                  </p>

                  <form onSubmit={handleSubmitDispute} className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Select Issue Reason</label>
                      <select 
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-semibold"
                      >
                        <option value="Damaged / Broken">Damaged / Broken / Defective</option>
                        <option value="Missing Item">Missing from Order</option>
                        <option value="Wrong Item">Received Wrong Item</option>
                        <option value="Description Inaccurate">Web Description Inaccurate</option>
                        <option value="Other">Other Issues</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Description / Explanation</label>
                      <textarea 
                        value={disputeNotes}
                        onChange={(e) => setDisputeNotes(e.target.value)}
                        placeholder="Detail exactly what was wrong with this item. Providing serial numbers or exact damage helps speed up review..."
                        rows={4}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm leading-relaxed"
                        required
                      />
                    </div>

                    {/* File Attachment / Evidence Upload */}
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                        Upload Proof/Evidence (Photo or Video)
                      </label>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {evidencePaths.map((path, idx) => {
                          const isVid = isVideo(path);
                          const mediaUrl = getMediaUrl(path);
                          return (
                            <div key={idx} className="relative border rounded-xl h-24 bg-slate-900 overflow-hidden flex items-center justify-center">
                              {isVid ? (
                                <video src={mediaUrl} className="w-full height-full object-cover" muted />
                              ) : (
                                <img src={mediaUrl} alt="Dispute Evidence" className="w-full h-full object-cover" />
                              )}
                              <button 
                                type="button"
                                onClick={() => handleRemoveEvidence(idx)}
                                className="absolute top-1.5 right-1.5 p-1 bg-red-600 rounded-full text-white hover:bg-red-700 transition"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          );
                        })}

                        {evidencePaths.length < 4 && (
                          <label className={`border-2 border-dashed border-gray-200 hover:border-[#0d9488] rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer transition ${
                            uploading ? 'pointer-events-none opacity-55' : ''
                          }`}>
                            {uploading ? (
                              <Loader2 className="animate-spin text-gray-400" size={24} />
                            ) : (
                              <>
                                <Upload className="text-gray-400 mb-1" size={20} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Upload File</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*,video/*" 
                              onChange={handleFileUpload} 
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 block">
                        * You can upload up to 4 images/videos showing lot condition (Max 15MB each).
                      </span>
                    </div>

                    <button 
                      type="submit"
                      disabled={submittingDispute}
                      className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      {submittingDispute ? <Loader2 className="animate-spin" size={20} /> : 'Submit Dispute'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUPPORT TICKETS & RETURNS */}
          {activeTab === 'tickets' && (
            <div>
              <h3 className="text-lg font-extrabold mb-4">Support Ticket Status</h3>
              {ticketsLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="animate-spin text-[#0d9488]" size={36} />
                </div>
              ) : cases.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-150 p-8 text-center text-gray-500">
                  <ShieldAlert size={36} className="mx-auto mb-3 text-gray-300" />
                  No support cases or returns filed for this order.
                </div>
              ) : (
                <div className="space-y-4">
                  {cases.map((c: any) => {
                    const isExpanded = expandedCaseId === c._id;
                    return (
                      <div key={c._id} className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
                        {/* Summary Header */}
                        <div 
                          onClick={() => setExpandedCaseId(isExpanded ? null : c._id)}
                          className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
                        >
                          <div>
                            <div className="flex items-center gap-2.5 mb-1.5">
                              <span className="font-mono text-sm font-black text-[#0d9488]">{c.caseNumber}</span>
                              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 font-extrabold rounded-md uppercase border border-blue-100">{c.type}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Opened on {new Date(c.createdAt).toLocaleDateString()} | Affected lots: {c.lines?.map((l: any) => `Lot ${l.lotNumber}`).join(', ')}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            {/* Case status badge */}
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                              c.status === 'Open' ? 'bg-amber-50 text-amber-700' :
                              c.status === 'In Review' ? 'bg-blue-50 text-blue-700' :
                              'bg-teal-50 text-teal-700'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                c.status === 'Open' ? 'bg-amber-500' :
                                c.status === 'In Review' ? 'bg-blue-500' :
                                'bg-teal-500'
                              }`} />
                              {c.status}
                            </span>
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 p-5 bg-gray-50/50 space-y-5 animate-slide">
                            {/* Refund Tracker */}
                            {c.refundStatus !== 'None' && (
                              <div className="bg-[#f0fdfa] border border-teal-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Refund Tracking</span>
                                  <span className="text-sm font-bold text-gray-700">
                                    Refund Status: <span className="text-[#0d9488] font-black">{c.refundStatus}</span>
                                  </span>
                                  {c.refundMethod && (
                                    <p className="text-xs text-gray-500 mt-0.5">Method: {c.refundMethod}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Refund Amount</span>
                                  <span className="text-lg font-black text-[#0f766e]">${c.refundAmount?.toFixed(2)}</span>
                                </div>
                              </div>
                            )}

                            {/* Disputed Lot Details */}
                            <div>
                              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Details Filed</h4>
                              <div className="space-y-2">
                                {c.lines?.map((line: any, index: number) => (
                                  <div key={index} className="bg-white p-3.5 rounded-xl border border-gray-200/60">
                                    <div className="flex justify-between font-bold text-xs text-gray-500 mb-1.5">
                                      <span>{line.lotNumber === 'GENERAL' ? 'General Case Note' : `Lot ${line.lotNumber}`}</span>
                                      <span>{line.reason}</span>
                                    </div>
                                    <p className="text-sm text-gray-800 leading-relaxed whiteSpace-pre-wrap">{line.notes}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Evidence Attachments preview */}
                            {c.evidence?.length > 0 && (
                              <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Evidence Attached</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {c.evidence.map((path: string, i: number) => {
                                    const url = getMediaUrl(path);
                                    const isVid = isVideo(path);
                                    return (
                                      <div 
                                        key={i} 
                                        onClick={() => window.open(url, '_blank')}
                                        className="h-16 rounded-lg border bg-slate-900 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-85 transition relative"
                                        title="Click to view full size"
                                      >
                                        {isVid ? (
                                          <video src={url} className="w-full h-full object-cover" muted />
                                        ) : (
                                          <img src={url} alt="Evidence item" className="w-full h-full object-cover" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
