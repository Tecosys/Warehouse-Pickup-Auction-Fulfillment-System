import React, { useState, useEffect } from 'react';
import { X, Package, Calculator, CheckSquare, ArrowRight, Truck, Printer } from 'lucide-react';
import { ButtonSpinner } from '../shared/LoadingComponents';

interface OrderShippingModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const OrderShippingModal: React.FC<OrderShippingModalProps> = ({ orderId, isOpen, onClose, onRefresh }) => {
  const [order, setOrder] = useState<any>(null);
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set());
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [packingDetails, setPackingDetails] = useState('');
  const [manualOverride, setManualOverride] = useState('');
  const [isConfirmingAF360, setIsConfirmingAF360] = useState(false);
  const [isSavingParcel, setIsSavingParcel] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedRateIdMap, setSelectedRateIdMap] = useState<Record<string, string>>({});
  const [unitType, setUnitType] = useState<'Parcel' | 'Mailer' | 'Pallet' | 'Freight Piece'>('Parcel');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchDetails();
    }
  }, [isOpen, orderId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      // Fetch order details
      const orderRes = await fetch(`http://localhost:5000/api/orders/${orderId}`);
      const orderData = await orderRes.json();
      setOrder(orderData);

      // Fetch parcels details
      const parcelRes = await fetch(`http://localhost:5000/api/shipping/orders/${orderId}/parcels`);
      const parcelData = await parcelRes.json();
      setParcels(parcelData);

      // Fetch settings
      const settingsRes = await fetch('http://localhost:5000/api/settings');
      const settingsData = await settingsRes.json();
      setSettings(settingsData);

      // Pre-fill selected rates map
      const ratesMap: Record<string, string> = {};
      parcelData.forEach((p: any) => {
        if (p.selectedRateId) {
          ratesMap[p._id] = p.selectedRateId;
        }
      });
      setSelectedRateIdMap(ratesMap);
      setTrackingNumber(orderData.trackingNumber || '');
    } catch (err) {
      console.error('Error fetching shipping order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLots.size === 0) {
      alert('Please select at least one lot to include in the parcel.');
      return;
    }

    try {
      setIsSavingParcel(true);
      const res = await fetch(`http://localhost:5000/api/shipping/orders/${orderId}/parcels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lots: Array.from(selectedLots),
          dimensions: { length, width, height, weight },
          packingDetails,
          sequenceNumber: parcels.length + 1,
          unitType
        })
      });

      if (res.ok) {
        setSelectedLots(new Set());
        setLength(0);
        setWidth(0);
        setHeight(0);
        setWeight(0);
        setPackingDetails('');
        setUnitType('Parcel');
        await fetchDetails();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create parcel');
      }
    } catch (err) {
      console.error('Error creating parcel:', err);
    } finally {
      setIsSavingParcel(false);
    }
  };

  const handleDeleteParcel = async (parcelId: string) => {
    if (!confirm('Are you sure you want to delete this parcel?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/shipping/parcels/${parcelId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchDetails();
      }
    } catch (err) {
      console.error('Error deleting parcel:', err);
    }
  };

  const handleSelectRate = async (parcelId: string, rateId: string) => {
    try {
      const override = manualOverride ? parseFloat(manualOverride) : undefined;
      const res = await fetch(`http://localhost:5000/api/shipping/parcels/${parcelId}/select-rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rateId,
          manualOverrideCharge: override
        })
      });

      if (res.ok) {
        setManualOverride('');
        setSelectedRateIdMap(prev => ({ ...prev, [parcelId]: rateId }));
        await fetchDetails();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to select rate');
      }
    } catch (err) {
      console.error('Error selecting rate:', err);
    }
  };

  const handleToggleAF360 = async (checked: boolean) => {
    try {
      setIsConfirmingAF360(true);
      const res = await fetch(`http://localhost:5000/api/shipping/orders/${orderId}/af360`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addedToAF360: checked })
      });
      if (res.ok) {
        await fetchDetails();
        onRefresh();
      }
    } catch (err) {
      console.error('Error updating AF360 status:', err);
    } finally {
      setIsConfirmingAF360(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`http://localhost:5000/api/shipping/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shippingStatus: newStatus,
          trackingNumber: newStatus === 'Dispatched' ? trackingNumber : undefined
        })
      });
      if (res.ok) {
        await fetchDetails();
        onRefresh();
        if (newStatus === 'Dispatched') {
          onClose();
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const toggleLotSelection = (lotId: string) => {
    const next = new Set(selectedLots);
    if (next.has(lotId)) next.delete(lotId);
    else next.add(lotId);
    setSelectedLots(next);
  };

  // Pricing formula display helpers:
  // C * 1.13 = baseTotal
  // baseTotal / 2 = markup
  // baseTotal + markup + 2.00 = subtotal
  // subtotal * 1.13 = final charge
  const renderPricingFormula = (baseRate: number, type: 'Parcel' | 'Mailer' | 'Pallet' | 'Freight Piece' = 'Parcel') => {
    const typeKey = type === 'Freight Piece' ? 'pallet' : type.toLowerCase();
    
    const pct = settings ? (parseFloat(settings[`shipping_spread_${typeKey}_pct`]) || 0) / 100 : (type === 'Mailer' ? 0.40 : (type === 'Pallet' || type === 'Freight Piece' ? 0.18 : 0.50));
    const min = settings ? parseFloat(settings[`shipping_spread_${typeKey}_min`]) || 0 : (type === 'Mailer' ? 5.00 : (type === 'Pallet' || type === 'Freight Piece' ? 75.00 : 8.00));
    const fee = settings ? parseFloat(settings[`shipping_fee_${typeKey}`]) || 0 : (type === 'Mailer' ? 2.00 : (type === 'Pallet' || type === 'Freight Piece' ? 50.00 : 5.00));

    const spread = Math.max(baseRate * pct, min);
    const totalCharge = baseRate + spread + fee;

    return (
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Formula breakdown ({type}):</div>
        <div>Carrier Base: ${baseRate.toFixed(2)}</div>
        <div>Configured Markup: {(pct * 100).toFixed(0)}% (Min Spread: ${min.toFixed(2)})</div>
        <div>Calculated Spread: ${spread.toFixed(2)}</div>
        <div>Handling Fee: ${fee.toFixed(2)}</div>
        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>Total Charge: ${totalCharge.toFixed(2)}</div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} style={{ color: 'var(--status-teal)' }} />
              Process Shipping Order
            </h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Bidder #{order?.bidderNumber} | {order?.customer?.name}
            </span>
          </div>
          <button onClick={onClose} className="btn" style={{ padding: '0.375rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--status-teal)', borderRadius: '50%' }}></div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading shipment details...</span>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, padding: '1.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.75rem' }}>
              {/* Left Column: Parcels & Custom packing */}
              <div>
                {/* 1. Address Summary */}
                <div className="card" style={{ padding: '1rem', background: '#f8fafc', marginBottom: '1.5rem', boxShadow: 'none' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                    Shipping Destination
                  </h4>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order?.customer?.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {order?.customer?.shipTo?.address1} {order?.customer?.shipTo?.address2 && `, ${order?.customer.shipTo.address2}`}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {order?.customer?.shipTo?.city}, {order?.customer?.shipTo?.state} {order?.customer?.shipTo?.zip}
                  </p>
                </div>

                {/* 2. List of current parcels */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Truck size={18} style={{ color: 'var(--status-teal)' }} />
                    Created Parcels ({parcels.length})
                  </h4>

                  {parcels.length === 0 ? (
                    <div style={{ border: '1.5px dashed var(--border-color)', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No parcels created for this order yet. Package lots into boxes below.
                    </div>
                  ) : (
                    parcels.map((parcel) => (
                      <div className="card" key={parcel._id} style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--status-teal)', fontSize: '0.875rem' }}>
                              PARCEL #{parcel.sequenceNumber}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              Dimensions: {parcel.dimensions.length} x {parcel.dimensions.width} x {parcel.dimensions.height} cm | Weight: {parcel.dimensions.weight} kg
                            </div>
                            {parcel.packingDetails && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '0.25rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                                <strong>Packing:</strong> {parcel.packingDetails}
                              </div>
                            )}
                          </div>
                          <button onClick={() => handleDeleteParcel(parcel._id)} style={{ color: 'var(--status-red)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                            Remove
                          </button>
                        </div>

                        {/* List items packed */}
                        <div style={{ margin: '0.5rem 0', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lots packed:</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                            {parcel.lots?.map((lot: any) => (
                              <span key={lot._id} style={{ background: '#f1f5f9', color: '#1e293b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                Lot {lot.lotNumber}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Rates view */}
                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Calculator size={14} style={{ color: 'var(--status-teal)' }} />
                              Carrier Rates (Stallion & Freightcom)
                            </span>
                            <button onClick={async () => {
                              await fetch(`http://localhost:5000/api/shipping/parcels/${parcel._id}/rates`);
                              await fetchDetails();
                            }} className="btn" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                              Recalculate Quotes
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            {parcel.rates?.map((rate: any) => {
                              const isSelected = selectedRateIdMap[parcel._id] === rate.id;
                              return (
                                <div 
                                  key={rate.id} 
                                  onClick={() => handleSelectRate(parcel._id, rate.id)}
                                  style={{
                                    border: isSelected ? '2px solid var(--status-teal)' : '1px solid var(--border-color)',
                                    background: isSelected ? '#f0fdfa' : '#ffffff',
                                    borderRadius: '0.375rem',
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.8125rem' }}>
                                    <span>{rate.carrier} ({rate.provider})</span>
                                    <span style={{ color: 'var(--status-teal)' }}>${rate.customerCharge.toFixed(2)}</span>
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {rate.serviceName} | Base: ${rate.baseRate.toFixed(2)}
                                  </div>
                                  {isSelected && renderPricingFormula(rate.baseRate, parcel.unitType)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 3. Package lots into parcel Form */}
                {order?.lots?.filter((l: any) => !parcels.some(p => p.lots.some((pl: any) => pl._id === l._id))).length > 0 && (
                  <form onSubmit={handleCreateParcel} className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.025em', color: 'var(--text-muted)' }}>
                      Pack Lots into Box
                    </h4>

                    {/* Checkbox lots */}
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                        Select Lots to pack:
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {order?.lots?.filter((l: any) => !parcels.some(p => p.lots.some((pl: any) => pl._id === l._id))).map((lot: any) => (
                          <label key={lot._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.5rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8125rem' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedLots.has(lot._id)}
                              onChange={() => toggleLotSelection(lot._id)}
                              style={{ width: '15px', height: '15px', accentColor: 'var(--status-teal)' }}
                            />
                            <strong>Lot {lot.lotNumber}</strong>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Package Type Selection */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.8125rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Package Type</label>
                      <select 
                        value={unitType}
                        onChange={(e) => setUnitType(e.target.value as any)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600 }}
                      >
                        <option value="Parcel">Parcel</option>
                        <option value="Mailer">Mailer</option>
                        <option value="Pallet">Pallet</option>
                        <option value="Freight Piece">Freight Piece</option>
                      </select>
                    </div>

                    {/* Dimensions Input */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Length (cm)</label>
                        <input 
                          type="number" 
                          value={length || ''} 
                          onChange={(e) => setLength(parseFloat(e.target.value) || 0)} 
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Width (cm)</label>
                        <input 
                          type="number" 
                          value={width || ''} 
                          onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} 
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Height (cm)</label>
                        <input 
                          type="number" 
                          value={height || ''} 
                          onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} 
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Weight (kg)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={weight || ''} 
                          onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} 
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Packing details / Special handling</label>
                      <input 
                        type="text" 
                        value={packingDetails}
                        onChange={(e) => setPackingDetails(e.target.value)}
                        placeholder="e.g. bubblewrap, double walled box, fragile stickers"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSavingParcel}
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '0.625rem' }}
                    >
                      {isSavingParcel ? <ButtonSpinner /> : <><Package size={16} /> Save & Calculate Box Rates</>}
                    </button>
                  </form>
                )}
              </div>

              {/* Right Column: Calculations & Progress */}
              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.75rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                  Fulfillment Pipeline
                </h4>

                {/* 1. Status Progress Bar */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Status:</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--status-teal)', margin: '0.25rem 0' }}>
                    {order?.shippingStatus}
                  </div>
                  
                  {/* Status Indicator Bar */}
                  <div style={{ display: 'flex', gap: '2px', height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '0.5rem' }}>
                    {['Shipping Selected', 'Packing In Progress', 'Ready for Rating', 'Awaiting AF360 Charge', 'Awaiting Payment', 'Payment Confirmed', 'Label Ready', 'Dispatched'].map((st) => {
                      const stages = ['Shipping Selected', 'Packing In Progress', 'Ready for Rating', 'Awaiting AF360 Charge', 'Awaiting Payment', 'Payment Confirmed', 'Label Ready', 'Dispatched'];
                      const activeIndex = stages.indexOf(order?.shippingStatus || 'Shipping Selected');
                      const isPastOrActive = stages.indexOf(st) <= activeIndex;
                      return (
                        <div key={st} style={{ flex: 1, background: isPastOrActive ? 'var(--status-teal)' : '#e2e8f0' }} title={st}></div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Manual Override (when choosing rate) */}
                {parcels.length > 0 && !order?.addedToAF360 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.375rem' }}>
                      Override Shipping Charge ($)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g. 25.00 (optional)"
                        value={manualOverride}
                        onChange={(e) => setManualOverride(e.target.value)}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }}
                      />
                      {manualOverride && (
                        <button onClick={() => setManualOverride('')} className="btn" style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}>Clear</button>
                      )}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      Enter value here BEFORE clicking a carrier rate. That rate will be saved with this manual price instead.
                    </span>
                  </div>
                )}

                {/* 3. AF360 Checkbox toggle */}
                {parcels.some(p => p.selectedRateId) && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '0.5rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={order?.addedToAF360 || false}
                        disabled={isConfirmingAF360}
                        onChange={(e) => handleToggleAF360(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--status-teal)', marginTop: '2px' }}
                      />
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--status-teal)', display: 'block' }}>
                          Add to AuctionFlex360
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                          Confirm shipping invoice was billed in AF360. This advances the status and locks rates.
                        </span>
                      </div>
                    </label>
                  </div>
                )}

                {/* 4. Action pipeline step buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {['Shipping Selected', 'In Shipping Queue', 'Packing In Progress'].includes(order?.shippingStatus) && parcels.length > 0 && (
                    <button 
                      onClick={() => handleUpdateStatus('Ready for Rating')}
                      disabled={isUpdatingStatus}
                      className="btn btn-primary"
                      style={{ padding: '0.75rem', fontSize: '0.875rem' }}
                    >
                      Finish Packing & Rate <ArrowRight size={16} />
                    </button>
                  )}

                  {order?.shippingStatus === 'Ready for Rating' && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      Select a carrier rate on the left to proceed.
                    </div>
                  )}

                  {order?.shippingStatus === 'Awaiting AF360 Charge' && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      Complete the "Add to AuctionFlex360" step above to advance.
                    </div>
                  )}

                  {order?.shippingStatus === 'Awaiting Payment' && (
                    <button 
                      onClick={() => handleUpdateStatus('Payment Confirmed')}
                      disabled={isUpdatingStatus}
                      className="btn btn-primary"
                      style={{ padding: '0.75rem', fontSize: '0.875rem', background: 'var(--status-blue)' }}
                    >
                      Confirm Payment Received <ArrowRight size={16} />
                    </button>
                  )}

                  {order?.shippingStatus === 'Payment Confirmed' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        onClick={() => {
                          alert('Sending print commands to Thermal printer...');
                          handleUpdateStatus('Label Ready');
                        }}
                        disabled={isUpdatingStatus}
                        className="btn btn-primary"
                        style={{ padding: '0.75rem', fontSize: '0.875rem' }}
                      >
                        <Printer size={16} /> Print Shipping Labels
                      </button>
                    </div>
                  )}

                  {order?.shippingStatus === 'Label Ready' && (
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem' }}>
                        Tracking Number
                      </label>
                      <input 
                        type="text" 
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Paste tracking number..."
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem', fontFamily: 'monospace', marginBottom: '0.75rem' }}
                      />
                      <button 
                        onClick={() => handleUpdateStatus('Dispatched')}
                        disabled={isUpdatingStatus || !trackingNumber}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem', background: 'var(--status-green)' }}
                      >
                        <Truck size={16} /> Dispatch & Send Tracking
                      </button>
                    </div>
                  )}

                  {order?.shippingStatus === 'Dispatched' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-green)', fontWeight: 700, fontSize: '0.875rem', background: '#f0fdf4', padding: '0.75rem', borderRadius: '0.5rem', justifyContent: 'center' }}>
                      <CheckSquare size={16} /> Dispatched successfully!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderShippingModal;
