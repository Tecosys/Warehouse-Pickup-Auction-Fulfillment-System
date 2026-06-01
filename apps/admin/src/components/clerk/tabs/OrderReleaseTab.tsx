import { useState, useEffect } from 'react';
import { PageLoader, ButtonSpinner } from '../../shared/LoadingComponents';
import { Printer, AlertTriangle, ChevronLeft, ScanLine, ArrowRight } from 'lucide-react';
import ReceiptPreviewModal from '../../fulfillment/components/ReceiptPreviewModal';
import QRScannerModal from '../../shared/QRScannerModal';

interface OrderReleaseTabProps {
  order: any;
  onBack: () => void;
  onComplete: (releasedLots: any[], withheldLots: any[]) => void;
  user: any;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigate: (module: string) => void;
}

const OrderReleaseTab: React.FC<OrderReleaseTabProps> = ({ order, onBack, onComplete, user, showToast, onNavigate }) => {
  const [lots, setLots] = useState<any[]>([]);
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [completing, setCompleting] = useState(false);

  // New merged states
  const [isReviewingWithheld, setIsReviewingWithheld] = useState(false);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [managerOverride, setManagerOverride] = useState(false);

  useEffect(() => {
    if (order?._id) {
      fetchLots();
    }
  }, [order?._id]);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${order._id}`);
      const data = await res.json();
      setLots(data.lots || []);
      // Initially select all non-issue lots
      setSelectedLots(new Set(data.lots?.filter((l: any) => !l.metadata?.flagged).map((l: any) => l._id)));
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLot = (id: string) => {
    const newSelected = new Set(selectedLots);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLots(newSelected);
  };

  const selectAll = () => setSelectedLots(new Set(lots.map(l => l._id)));
  const deselectAll = () => setSelectedLots(new Set());

  const handlePrint = () => {
    setIsPreviewOpen(true);
  };

  const handleRequestHelper = () => {
    showToast("Helper request sent. Support will bring order to pickup area.", "success");
  };

  const handlePrepareNow = () => {
    onNavigate("Fulfillment Hub");
  };

  const handleReasonChange = (id: string, reason: string) => {
    setReasons(prev => ({ ...prev, [id]: reason }));
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);

      const releasedLotIds = Array.from(selectedLots);
      const withheldLotsArray = lots.filter(l => !selectedLots.has(l._id));
      
      const caseWithheldLots = withheldLotsArray.map(lot => ({
        lotId: lot._id,
        lotNumber: lot.lotNumber,
        description: lot.description,
        reason: reasons[lot._id] || 'Other',
        notes: notes[lot._id] || ''
      }));

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${order._id}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          releasedLotIds,
          withheldLots: caseWithheldLots,
          staffUser: user?.name || 'Staff'
        })
      });

      if (res.ok) {
        const releasedLotsArray = lots.filter(l => selectedLots.has(l._id));
        showToast("Order release completed successfully!", "success");
        onComplete(releasedLotsArray, caseWithheldLots);
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to complete release.", "error");
      }
    } catch (error) {
      console.error('Error completing release:', error);
      showToast("Network error during release.", "error");
    } finally {
      setCompleting(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    const matchedLot = lots.find(
      l => l.lotNumber === decodedText || 
           l.lpn === decodedText || 
           l.manifestItemId === decodedText
    );
    if (matchedLot) {
      toggleLot(matchedLot._id);
      showToast(`Lot ${matchedLot.lotNumber} toggled.`, 'info');
    } else {
      showToast(`No lot found with identifier: ${decodedText}`, 'error');
    }
  };

  if (!order) return <div style={{ padding: '4rem', textAlign: 'center' }}>No order selected. Please go back to search.</div>;
  if (loading) return <PageLoader message="Loading order lots..." />;

  const withheldCount = lots.length - selectedLots.size;
  const withheldLotsList = lots.filter(l => !selectedLots.has(l._id));
  const allReasonsSelected = withheldLotsList.every(lot => reasons[lot._id]);

  const isPrepared = order.fulfillmentStatus === 'Ready';
  const isReleaseBlocked = !isPrepared && !managerOverride;

  return (
    <div className="animate-fade" style={{ paddingBottom: '100px' }}>
      <ReceiptPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Release Confirmation"
        data={{
          auction: order.auctionRun?.title || "AUC-31",
          bidder: order.bidderNumber,
          customer: order.customer?.name,
          bookingCode: order.bookingCode,
          items: lots.filter(l => selectedLots.has(l._id)).map(l => ({ id: l.lotNumber, desc: l.description, loc: l.finalPickupLocation || 'N/A' })),
          worker: user?.name || "Staff"
        }}
      />

      <QRScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScan={handleScanSuccess}
        title="Scan ManyFastScan QR / LPN"
      />

      <button 
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 600 }}
      >
        <ChevronLeft size={20} />
        Back to Check-in & Search
      </button>

      {/* Warning Box for Unprepared Orders */}
      {!isPrepared && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '1.5rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} color="var(--status-red)" />
            <div>
              <h3 style={{ fontWeight: 800, color: '#991b1b', margin: 0 }}>Order Not Prepared Yet</h3>
              <p style={{ fontSize: '0.875rem', color: '#b91c1c', margin: '0.25rem 0 0 0' }}>
                This order is in <strong>{order.fulfillmentStatus}</strong> state. It must be prepared before release.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={handleRequestHelper} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Request Helper
            </button>
            <button onClick={handlePrepareNow} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Prepare Now
            </button>
            <div style={{ flexGrow: 1 }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--status-red)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={managerOverride} 
                onChange={(e) => setManagerOverride(e.target.checked)} 
                style={{ width: '18px', height: '18px', accentColor: 'var(--status-red)' }} 
              />
              Manager Override (Proceed)
            </label>
          </div>
        </div>
      )}

      {!isReviewingWithheld ? (
        <div className="responsive-detail-grid" style={{ display: 'grid', gridTemplateColumns: '38% 62%', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column - Order Summary */}
          <div className="card" style={{ position: 'sticky', top: '100px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>{order.customer?.name}</h2>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--status-teal)' }}>#{order.bidderNumber}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Code</label>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '1.125rem' }}>{order.bookingCode}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Auction #</label>
                  <div style={{ fontWeight: 600 }}>{order.auctionRun?.auctionNumber}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-teal">{order.fulfillmentStatus}</span>
                <span className="badge badge-blue">{order.customerStatus}</span>
              </div>

              {order.authorizedPerson && order.authorizedPerson.name && (
                <div style={{ padding: '1rem', background: 'rgba(13, 148, 136, 0.05)', border: '1px solid rgba(13, 148, 136, 0.2)', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Authorized Pick Up Person</label>
                  <div style={{ fontWeight: 700, color: 'var(--status-teal)' }}>{order.authorizedPerson.name}</div>
                  {order.authorizedPerson.phone && <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>Phone: {order.authorizedPerson.phone}</div>}
                  {order.authorizedPerson.email && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Email: {order.authorizedPerson.email}</div>}
                </div>
              )}

              {lots.some(l => l.metadata?.flagged) && (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <AlertTriangle size={20} color="var(--status-red)" />
                  <div style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: 500 }}>
                    This order has flagged lot(s). Review before completing release.
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={handlePrint} className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                <Printer size={18} />
                Print Pickup Summary
              </button>
              <button 
                onClick={() => setIsScannerOpen(true)} 
                disabled={isReleaseBlocked}
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', background: 'var(--status-teal)', opacity: isReleaseBlocked ? 0.6 : 1 }}
              >
                <ScanLine size={18} />
                Scan ManyFastScan QR
              </button>
            </div>
          </div>

          {/* Right Column - Lots Selection Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--status-teal)', boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.1)', opacity: isReleaseBlocked ? 0.7 : 1, pointerEvents: isReleaseBlocked ? 'none' : 'auto' }}>
            <div className="responsive-flex-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdfa' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                {lots.length} Lots — <span style={{ color: 'var(--status-teal)' }}>{selectedLots.size} Selected</span> — <span style={{ color: withheldCount > 0 ? 'var(--status-amber)' : 'inherit' }}>{withheldCount} Withheld</span>
              </h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={selectAll} className="btn" style={{ border: 'none', background: 'none', color: 'var(--status-teal)', fontSize: '0.875rem', fontWeight: 600 }}>Select All</button>
                <div style={{ width: '1px', height: '16px', background: 'var(--border-color)' }} />
                <button onClick={deselectAll} className="btn" style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Deselect All</button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ width: '50px', padding: '1rem 1.5rem' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedLots.size === lots.length && lots.length > 0}
                        onChange={selectedLots.size === lots.length ? deselectAll : selectAll}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--status-teal)' }}
                      />
                    </th>
                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lot #</th>
                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</th>
                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pickup Loc</th>
                    <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prep State</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot) => {
                    const isSelected = selectedLots.has(lot._id);
                    return (
                      <tr 
                        key={lot._id} 
                        onClick={() => toggleLot(lot._id)}
                        style={{ 
                          borderBottom: '1px solid var(--border-color)', 
                          cursor: 'pointer',
                          background: isSelected ? 'white' : 'rgba(245, 158, 11, 0.05)'
                        }}
                      >
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => {}} // Handled by row click
                            style={{ width: '18px', height: '18px', accentColor: 'var(--status-teal)' }}
                          />
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>{lot.lotNumber}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontWeight: 500 }}>{lot.description}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {lot.lpn || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{lot.finalPickupLocation || 'N/A'}</span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span className={`badge ${lot.status === 'Ready' ? 'badge-teal' : lot.status === 'Pending' ? 'badge-gray' : 'badge-red'}`}>
                            {lot.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Merged Withheld Lots Questionnaire Form */
        <div className="card animate-fade" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Withheld Lots — {order?.customer?.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({order?.bidderNumber})</span></h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Assign a reason for each withheld lot before completing release.</p>
            </div>
            <button onClick={() => setIsReviewingWithheld(false)} className="btn" style={{ fontSize: '0.875rem' }}>
              Back to Selection
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            {withheldLotsList.map((lot) => (
              <div 
                key={lot._id} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1.5rem',
                  background: reasons[lot._id] ? 'white' : 'rgba(245, 158, 11, 0.03)',
                  borderColor: reasons[lot._id] ? 'var(--border-color)' : 'rgba(245, 158, 11, 0.3)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 800 }}>Lot {lot.lotNumber}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{lot.description}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8125rem' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Storage:</span> <span style={{ fontWeight: 600 }}>{lot.sourceLocation || 'N/A'}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Staged:</span> <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{lot.finalPickupLocation || 'N/A'}</span></div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '280px', maxWidth: '100%' }}>
                  <select 
                    value={reasons[lot._id] || ''} 
                    onChange={(e) => handleReasonChange(lot._id, e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '0.625rem', 
                      borderRadius: '0.5rem', 
                      border: '1px solid var(--border-color)',
                      fontWeight: 600,
                      outline: 'none',
                      borderColor: reasons[lot._id] ? 'var(--status-teal)' : 'var(--border-color)'
                    }}
                  >
                    <option value="" disabled>Select Reason...</option>
                    <option value="Missing at Release">Missing at Release</option>
                    <option value="Customer Refused">Customer Refused</option>
                    <option value="Issue">Issue / Damaged</option>
                    <option value="Other">Other</option>
                  </select>

                  {(reasons[lot._id] === 'Issue' || reasons[lot._id] === 'Other' || reasons[lot._id] === 'Missing at Release') && (
                    <textarea
                      placeholder="Additional notes..."
                      value={notes[lot._id] || ''}
                      onChange={(e) => setNotes(prev => ({ ...prev, [lot._id]: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8125rem',
                        minHeight: '60px',
                        resize: 'vertical'
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Action Bar */}
      <div className="sticky-action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--status-teal)' }}>{selectedLots.size} Selected</span>
            <span style={{ margin: '0 0.75rem', color: 'var(--border-color)' }}>|</span>
            <span style={{ color: withheldCount > 0 ? 'var(--status-amber)' : 'var(--text-muted)' }}>{withheldCount} Withheld</span>
          </div>
        </div>
        
        <div>
          {isReleaseBlocked ? (
            <button 
              disabled={true}
              className="btn" 
              style={{ padding: '0.75rem 3rem', borderRadius: '0.5rem', background: 'var(--status-gray)', color: 'white', border: 'none', cursor: 'not-allowed' }}
            >
              Release Blocked (Unprepared)
            </button>
          ) : isReviewingWithheld ? (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setIsReviewingWithheld(false)} 
                className="btn" 
                style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem' }}
              >
                Back
              </button>
              <button 
                onClick={handleComplete}
                disabled={!allReasonsSelected || completing}
                className="btn btn-primary" 
                style={{ 
                  padding: '0.75rem 3rem', 
                  borderRadius: '0.5rem',
                  background: allReasonsSelected ? 'var(--status-teal)' : 'var(--status-gray)',
                  opacity: allReasonsSelected ? 1 : 0.6
                }}
              >
                {completing ? <><ButtonSpinner /> Completing...</> : 'Complete Partial Release'}
              </button>
            </div>
          ) : withheldCount > 0 ? (
            <button 
              onClick={() => setIsReviewingWithheld(true)}
              className="btn" 
              style={{ padding: '0.75rem 2.5rem', background: 'var(--status-amber)', color: 'white', border: 'none', borderRadius: '0.5rem' }}
            >
              Proceed to Withheld Details
              <ArrowRight size={16} style={{ marginLeft: '0.5rem', display: 'inline' }} />
            </button>
          ) : (
            <button 
              onClick={handleComplete} 
              disabled={completing}
              className="btn btn-primary" 
              style={{ padding: '0.75rem 3rem', borderRadius: '0.5rem' }}
            >
              {completing ? <><ButtonSpinner /> Completing...</> : 'Complete Release'}
            </button>
          )}
        </div>
      </div>
      
      <style>{`
        .sticky-action-bar {
          position: fixed;
          bottom: 0;
          left: var(--sidebar-width);
          right: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(0,0,0,0.05);
          padding: 1.25rem 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 -10px 15px -3px rgba(0, 0, 0, 0.05);
          z-index: 100;
        }
      `}</style>
    </div>
  );
};

export default OrderReleaseTab;
