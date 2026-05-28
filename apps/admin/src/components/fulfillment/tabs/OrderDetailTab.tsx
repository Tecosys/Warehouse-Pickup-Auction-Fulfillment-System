import { useState, useEffect } from 'react';
import { ArrowLeft, Printer, ScanLine, CheckCircle2, MoreVertical, Flag, X } from 'lucide-react';
import { NotFoundModal, IssueModal, CompletionModal, CancellationModal } from '../components/FulfillmentModals';
import ReceiptPreviewModal from '../components/ReceiptPreviewModal';
import QRScannerModal from '../../shared/QRScannerModal';
import { PageLoader } from '../../shared/LoadingComponents';

interface OrderDetailTabProps {
  orderId: string | null;
  onBack: () => void;
}

const OrderDetailTab: React.FC<OrderDetailTabProps> = ({ orderId, onBack }) => {
  // ── Live State ────────────────────────────────────────────────────────────────
  const [order, setOrder] = useState<any>(null);
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── UI State ──────────────────────────────────────────────────────────────────
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [bulkLocation, setBulkLocation] = useState('');
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set());
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeLotId, setActiveLotId] = useState<string | null>(null);

  // ── Added Functional States ────────────────────────────────────────────────────
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [lotTypeFilter, setLotTypeFilter] = useState<'All' | 'Non-Sort' | 'Sort'>('All');
  const [activeLotMenuId, setActiveLotMenuId] = useState<string | null>(null);
  const [selectedLotForAction, setSelectedLotForAction] = useState<any>(null);

  // Dropdown outside click handler
  useEffect(() => {
    const handleWindowClick = () => setActiveLotMenuId(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  // ── Fetch Order ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
        const data = await res.json();
        setOrder(data);
        // Build lots array with local location state
        const enriched = (data.lots || []).map((l: any) => ({
          ...l,
          _location: l.finalPickupLocation || '',
          _status: l.status || 'Pending'
        }));
        setLots(enriched);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, reloadTrigger]);

  // ── Derived Stats ─────────────────────────────────────────────────────────────
  const readyCount = lots.filter(l => l._status === 'Ready').length;
  const flaggedCount = lots.filter(l => l._status === 'Hold/Issue' || l._status === 'Not Found' || l._status === 'Not Found in Prep').length;
  const untouchedCount = lots.filter(l => l._status === 'Pending').length;
  const progress = lots.length > 0 ? Math.round(((readyCount + flaggedCount) / lots.length) * 100) : 0;

  const filteredLots = lots.filter(l => {
    if (lotTypeFilter === 'All') return true;
    return l.type === lotTypeFilter;
  });

  const sortedLots = [...filteredLots].sort((a, b) => {
    const locA = a.sourceLocation || '';
    const locB = b.sourceLocation || '';
    return locA.localeCompare(locB, undefined, { numeric: true, sensitivity: 'base' });
  });

  const handleNotFoundConfirm = async (notes: string) => {
    if (!selectedLotForAction) return;
    const lotId = selectedLotForAction._id;
    try {
      await fetch(`http://localhost:5000/api/lots/${lotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Not Found in Prep', notes })
      });
      setReloadTrigger(prev => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setActiveModal(null);
      setSelectedLotForAction(null);
    }
  };

  const handleIssueConfirm = async ({ reason, notes }: { reason: string, notes: string }) => {
    if (!selectedLotForAction) return;
    const lotId = selectedLotForAction._id;
    try {
      const fullNotes = `[${reason}] ${notes}`;
      await fetch(`http://localhost:5000/api/lots/${lotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Hold/Issue', notes: fullNotes })
      });
      setReloadTrigger(prev => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setActiveModal(null);
      setSelectedLotForAction(null);
    }
  };

  const handleResetLotStatus = async (lotId: string) => {
    try {
      await fetch(`http://localhost:5000/api/lots/${lotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Pending' })
      });
      setReloadTrigger(prev => prev + 1);
    } catch (e) {
      console.error(e);
    }
  };

  // ── Lot Actions ───────────────────────────────────────────────────────────────
  const toggleLotSelect = (id: string) => {
    const next = new Set(selectedLots);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLots(next);
  };

  const updateLotLocation = (id: string, location: string) => {
    setLots(prev => prev.map(l => l._id === id ? { ...l, _location: location } : l));
  };

  const handleLotComplete = async (id: string, location: string) => {
    if (!location.trim()) return;
    setLots(prev => prev.map(l => l._id === id ? { ...l, _status: 'Ready', _location: location } : l));
    // Persist to DB
    await fetch(`http://localhost:5000/api/lots/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Ready', finalPickupLocation: location })
    }).catch(console.error);
  };

  const applyBulkLocation = async () => {
    if (!bulkLocation.trim()) return;
    setLots(prev => prev.map(l =>
      selectedLots.has(l._id) ? { ...l, _status: 'Ready', _location: bulkLocation } : l
    ));
    // Persist all selected
    await Promise.all(
      Array.from(selectedLots).map(id =>
        fetch(`http://localhost:5000/api/lots/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Ready', finalPickupLocation: bulkLocation })
        }).catch(console.error)
      )
    );
    setSelectedLots(new Set());
    setBulkLocation('');
  };

  const handleStartPrep = async () => {
    setSaving(true);
    await fetch(`http://localhost:5000/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fulfillmentStatus: 'In Progress' })
    }).catch(console.error);
    setOrder((prev: any) => ({ ...prev, fulfillmentStatus: 'In Progress' }));
    setSaving(false);
  };

  const handleCompletePrep = async () => {
    setSaving(true);
    const finalPrepStatus = flaggedCount > 0 ? 'Ready with Flag' : 'Ready';
    await fetch(`http://localhost:5000/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        fulfillmentStatus: 'Ready',
        prepStatus: finalPrepStatus,
        lifecycleStatus: 'Ready'
      })
    }).catch(console.error);
    setOrder((prev: any) => ({ 
      ...prev, 
      fulfillmentStatus: 'Ready',
      prepStatus: finalPrepStatus,
      lifecycleStatus: 'Ready'
    }));
    setSaving(false);
    setActiveModal(null);
    onBack();
  };

  const handleCancelOrder = async () => {
    setSaving(true);
    await fetch(`http://localhost:5000/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerStatus: 'Cancelled' })
    }).catch(console.error);
    setSaving(false);
    setActiveModal(null);
    onBack();
  };

  const handleScanSuccess = (decodedText: string) => {
    // Match by manifestItemId (ManyFast LPN) or lotNumber
    const matched = lots.find(l =>
      l.manifestItemId === decodedText || l.lpn === decodedText || l.lotNumber === decodedText
    );
    if (matched) {
      const next = new Set(selectedLots);
      next.add(matched._id);
      setSelectedLots(next);
      setActiveLotId(matched._id);
      setTimeout(() => setActiveLotId(null), 2000);
    } else {
      alert(`No lot found for: ${decodedText}`);
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────────
  if (loading) return <PageLoader message="Loading order details..." />;
  if (!order) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Order not found. <button onClick={onBack} style={{ color: 'var(--status-teal)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Go back</button>
    </div>
  );

  const customerName = order.customer?.name || `Bidder #${order.bidderNumber}`;
  const auctionLabel = order.auctionRun?.title || `Auction #${order.auctionRun?.auctionNumber || ''}`;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <ReceiptPreviewModal
        isOpen={activeModal === 'Receipt'}
        onClose={() => setActiveModal(null)}
        title="Preparation Slip"
        data={{
          auction: auctionLabel,
          bidder: order.bidderNumber,
          customer: customerName,
          status: order.fulfillmentStatus,
          bookingCode: order.bookingCode,
          items: lots.map(l => ({ id: l.lotNumber, desc: l.description, storage: l.sourceLocation })),
          worker: 'Staff'
        }}
      />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanSuccess}
        title="Scan ManyFastScan LPN / Lot #"
      />

      {/* Hidden print slip */}
      <div className="print-slip">
        <h1>BIDBOSS PREPARATION SLIP</h1>
        <div style={{ marginBottom: '10px' }}>
          <div>{auctionLabel}</div>
          <div>Bidder: #{order.bidderNumber}</div>
          <div>Customer: {customerName}</div>
          <div>Booking Code: {order.bookingCode}</div>
        </div>
        <div style={{ borderTop: '1px solid black', paddingTop: '10px' }}>
          <strong>LOTS (Source Order):</strong>
          {[...lots].sort((a, b) => (a.sourceLocation || '').localeCompare(b.sourceLocation || '', undefined, { numeric: true })).map(l => (
            <div key={l._id} className="lot-line">
              <span>[{l.sourceLocation}] Lot #{l.lotNumber}</span>
              <span>{l.description?.substring(0, 20)}...</span>
            </div>
          ))}
        </div>
        <div className="footer">
          Prepared by: Staff<br />
          {new Date().toLocaleString()}
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="responsive-flex-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', background: 'white', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-teal)', fontWeight: 700, cursor: 'pointer' }}>
          <ArrowLeft size={18} /> Back to Prep Queue
        </button>
        <div className="responsive-action-bar" style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" onClick={() => setActiveModal('Cancel')} style={{ padding: '0.5rem 1rem', color: 'var(--status-red)', borderColor: 'var(--status-red)', justifyContent: 'center' }}>
            Cancel Order
          </button>
          <button className="btn" onClick={() => setActiveModal('Receipt')} style={{ padding: '0.5rem 1rem', justifyContent: 'center' }}>
            <Printer size={18} /> Print Prep Slip
          </button>
          <button className="btn" onClick={() => setIsScannerOpen(true)} style={{ padding: '0.5rem 1rem', color: 'var(--status-teal)', borderColor: 'var(--status-teal)', justifyContent: 'center' }}>
            <ScanLine size={18} /> Scan LPN
          </button>
          {order.fulfillmentStatus !== 'Ready' && (
            <button
              className="btn btn-primary"
              disabled={untouchedCount > 0 || saving}
              style={{ padding: '0.5rem 1.5rem', background: 'var(--status-teal)', opacity: untouchedCount > 0 ? 0.5 : 1, justifyContent: 'center' }}
              onClick={() => setActiveModal('Complete')}
            >
              Complete Preparation
            </button>
          )}
        </div>
      </div>

      <div className="fulfillment-layout-grid responsive-detail-grid" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', padding: '2rem', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Fulfillment Detail</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>#{order.bidderNumber}</h2>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{customerName}</div>
              {order.bookingCode && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                  {order.bookingCode}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Fulfillment Status</span>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 900, padding: '0.25rem 0.75rem', borderRadius: '1rem',
                  background: order.fulfillmentStatus === 'In Progress' ? 'rgba(245, 158, 11, 0.1)' : order.fulfillmentStatus === 'Ready' ? 'rgba(13, 148, 136, 0.1)' : '#f1f5f9',
                  color: order.fulfillmentStatus === 'In Progress' ? 'var(--status-amber)' : order.fulfillmentStatus === 'Ready' ? 'var(--status-teal)' : 'var(--text-muted)',
                  border: '1px solid currentColor'
                }}>{order.fulfillmentStatus?.toUpperCase() || 'NOT STARTED'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Customer Status</span>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 900, padding: '0.25rem 0.75rem', borderRadius: '1rem',
                  background: order.customerStatus === 'Checked In' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                  color: order.customerStatus === 'Checked In' ? 'var(--status-green)' : 'var(--status-amber)',
                  border: '1px solid currentColor'
                }}>{order.customerStatus?.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Retrieval</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{order.retrievalMethod || 'Undecided'}</span>
              </div>
            </div>

            {order.customerStatus === 'Checked In' && (
              <div style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--status-green)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <CheckCircle2 size={16} /> Customer has checked in
              </div>
            )}

            {order.fulfillmentStatus === 'Not Started' ? (
              <button
                onClick={handleStartPrep}
                disabled={saving}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', background: 'var(--status-teal)', fontSize: '1rem' }}
              >
                {saving ? 'Starting...' : 'Start Preparation'}
              </button>
            ) : order.fulfillmentStatus === 'In Progress' ? (
              <button
                onClick={() => setActiveModal('Complete')}
                disabled={untouchedCount > 0 || saving}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', background: 'var(--status-teal)', fontSize: '1rem', opacity: untouchedCount > 0 ? 0.5 : 1 }}
              >
                Complete Preparation
              </button>
            ) : (
              <div className="bg-teal-50 text-[#0d9488] border border-teal-100 p-4 rounded-xl text-center font-bold">
                ✓ Preparation Completed
              </div>
            )}
          </div>

          {/* Progress Card */}
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--status-teal)' }}>Picking Progress</span>
              <span style={{ color: 'var(--status-teal)' }}>{progress}%</span>
            </div>
            <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0d9488, #14b8a6)',
                borderRadius: '5px',
                transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: '0 0 8px rgba(13,148,136,0.4)'
              }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
              {readyCount + flaggedCount} of {lots.length} lots accounted for
            </div>

            {untouchedCount > 0 && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.05)', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.1)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--status-red)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Attention Needed</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {untouchedCount} lot(s) still need a pickup location assigned.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Lot List */}
        <div>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="responsive-flex-header" style={{ display: 'flex', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                {['All', 'Non-Sort', 'Sort'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => setLotTypeFilter(t as any)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      fontSize: '0.875rem', 
                      fontWeight: 700, 
                      color: (t === 'All' ? lotTypeFilter === 'All' : lotTypeFilter === t) ? 'var(--status-teal)' : 'var(--text-muted)', 
                      borderBottom: (t === 'All' ? lotTypeFilter === 'All' : lotTypeFilter === t) ? '2px solid var(--status-teal)' : 'none', 
                      paddingBottom: '0.5rem', 
                      cursor: 'pointer' 
                    }}
                  >
                    {t === 'All' ? 'All Lots' : t}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {lots.length} Lots Total
              </div>
            </div>

            {sortedLots.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No lots found matching this filter.
              </div>
            ) : (
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedLots.map(lot => (
                  <div
                    key={lot._id}
                    className="card responsive-lot-card"
                    style={{
                      padding: '1.25rem',
                      background: activeLotId === lot._id
                        ? 'rgba(13,148,136,0.08)'
                        : lot._status === 'Ready' ? '#f0fdfa'
                        : (lot._status === 'Not Found' || lot._status === 'Not Found in Prep') ? 'rgba(245,158,11,0.05)'
                        : lot._status === 'Hold/Issue' ? 'rgba(239,68,68,0.05)' : 'white',
                      border: activeLotId === lot._id
                        ? '2px solid var(--status-teal)'
                        : lot._status === 'Ready' ? '1px solid rgba(13,148,136,0.2)' : '1px solid var(--border-color)',
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 280px 40px',
                      gap: '1.5rem',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      opacity: order.fulfillmentStatus === 'Not Started' ? 0.55 : 1,
                      pointerEvents: order.fulfillmentStatus === 'Not Started' ? 'none' : 'auto'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLots.has(lot._id)}
                      onChange={() => toggleLotSelect(lot._id)}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--status-teal)' }}
                    />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.125rem', fontWeight: 800 }}>Lot {lot.lotNumber}</span>
                        {lot._status === 'Ready' && <CheckCircle2 size={18} color="var(--status-teal)" />}
                        {(lot._status === 'Not Found' || lot._status === 'Not Found in Prep') && <X size={18} color="var(--status-amber)" />}
                        {lot._status === 'Hold/Issue' && <Flag size={18} color="var(--status-red)" />}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{lot.description || 'No description'}</div>
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {lot.sourceLocation && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontFamily: 'monospace' }}>
                            SRC: {lot.sourceLocation}
                          </span>
                        )}
                        {lot.manifestItemId && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            LPN: {lot.manifestItemId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Enter BIN or PU location..."
                        value={lot._location}
                        onChange={e => updateLotLocation(lot._id, e.target.value)}
                        onBlur={() => handleLotComplete(lot._id, lot._location)}
                        className="card"
                        style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', fontSize: '0.875rem', outline: 'none' }}
                        readOnly={lot._status === 'Ready' || order.fulfillmentStatus === 'Ready'}
                      />
                      <ScanLine
                        size={18}
                        onClick={() => setIsScannerOpen(true)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--status-teal)', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ textAlign: 'right', position: 'relative' }}>
                      <div 
                        style={{ cursor: 'pointer', padding: '0.25rem' }} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLotMenuId(activeLotMenuId === lot._id ? null : lot._id);
                        }}
                      >
                        <MoreVertical size={20} color="var(--text-muted)" />
                      </div>
                      {activeLotMenuId === lot._id && (
                        <div 
                          className="card"
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            zIndex: 100,
                            minWidth: '160px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            padding: '0.5rem 0',
                            background: 'white',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              color: 'var(--status-amber)'
                            }}
                            className="hover-bg"
                            onClick={() => {
                              setSelectedLotForAction(lot);
                              setActiveModal('NotFound');
                              setActiveLotMenuId(null);
                            }}
                          >
                            Mark as Not Found
                          </button>
                          <button
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'none',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              color: 'var(--status-red)'
                            }}
                            className="hover-bg"
                            onClick={() => {
                              setSelectedLotForAction(lot);
                              setActiveModal('Issue');
                              setActiveLotMenuId(null);
                            }}
                          >
                            Mark as Hold/Issue
                          </button>
                          {lot._status !== 'Pending' && (
                            <button
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                color: 'var(--text-muted)'
                              }}
                              className="hover-bg"
                              onClick={() => {
                                handleResetLotStatus(lot._id);
                                setActiveLotMenuId(null);
                              }}
                            >
                              Reset to Pending
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedLots.size > 0 && (
        <div 
          className="responsive-bulk-bar"
          style={{
            position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          width: 'calc(100% - 4rem)', maxWidth: '1336px',
          background: '#1e293b', color: 'white',
          padding: '1.25rem 2rem', borderRadius: '1rem',
          display: 'flex', alignItems: 'center', gap: '1.5rem',
          zIndex: 50, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
        }}>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedLots.size} lots selected</span>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Assign location to all selected lots..."
              value={bulkLocation}
              onChange={e => setBulkLocation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyBulkLocation()}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
            />
          </div>
          <button className="btn" style={{ background: 'var(--status-teal)', color: 'white', border: 'none', padding: '0.75rem 2rem', fontWeight: 700 }} onClick={applyBulkLocation}>
            Apply to All
          </button>
          <X size={24} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }} onClick={() => setSelectedLots(new Set())} />
        </div>
      )}

      {/* Modals */}
      <NotFoundModal isOpen={activeModal === 'NotFound'} onClose={() => { setActiveModal(null); setSelectedLotForAction(null); }} onConfirm={handleNotFoundConfirm} />
      <IssueModal isOpen={activeModal === 'Issue'} onClose={() => { setActiveModal(null); setSelectedLotForAction(null); }} onConfirm={handleIssueConfirm} />
      <CompletionModal isOpen={activeModal === 'Complete'} onClose={() => setActiveModal(null)} onConfirm={handleCompletePrep} flaggedCount={flaggedCount} />
      <CancellationModal isOpen={activeModal === 'Cancel'} onClose={() => setActiveModal(null)} onConfirm={handleCancelOrder} />
    </div>
  );
};

export default OrderDetailTab;
