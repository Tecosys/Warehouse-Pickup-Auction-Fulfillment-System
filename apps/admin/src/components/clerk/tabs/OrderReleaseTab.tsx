import { useState, useEffect } from 'react';
import { PageLoader, ButtonSpinner } from '../../shared/LoadingComponents';
import { Printer, AlertTriangle, ChevronLeft, ScanLine } from 'lucide-react';
import ReceiptPreviewModal from '../../fulfillment/components/ReceiptPreviewModal';
import QRScannerModal from '../../shared/QRScannerModal';

interface OrderReleaseTabProps {
  order: any;
  onReviewWithheld: () => void;
  onBack: () => void;
  onComplete: () => void;
}

const OrderReleaseTab: React.FC<OrderReleaseTabProps> = ({ order, onReviewWithheld, onBack, onComplete }) => {
  const [lots, setLots] = useState<any[]>([]);
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (order?._id) {
      fetchLots();
    }
  }, [order?._id]);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/orders/${order._id}`);
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

  const handleComplete = async () => {
    try {
      setCompleting(true);
      const res = await fetch(`http://localhost:5000/api/orders/${order._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerStatus: 'Picked Up',
          fulfillmentStatus: 'Completed'
        })
      });
      if (res.ok) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing release:', error);
    } finally {
      setCompleting(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    // Search for lot by lotNumber or manifestItemId (LPN)
    const matchedLot = lots.find(l => l.lotNumber === decodedText || l.lpn === decodedText);
    if (matchedLot) {
      toggleLot(matchedLot._id);
      alert(`Lot ${matchedLot.lotNumber} toggled.`);
    } else {
      alert(`No lot found with identifier: ${decodedText}`);
    }
  };

  if (!order) return <div style={{ padding: '4rem', textAlign: 'center' }}>No order selected. Please go back to search.</div>;
  if (loading) return <PageLoader message="Loading order lots..." />;

  const withheldCount = lots.length - selectedLots.size;

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
          items: lots.filter(l => selectedLots.has(l._id)).map(l => ({ id: l.lotNumber, desc: l.description, loc: l.metadata?.location || 'N/A' })),
          worker: "Staff"
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

      <div style={{ display: 'grid', gridTemplateColumns: '38% 62%', gap: '2rem', alignItems: 'start' }}>
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
            <button onClick={() => setIsScannerOpen(true)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--status-teal)' }}>
              <ScanLine size={18} />
              Scan ManyFastScan QR
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--status-teal)', boxShadow: '0 4px 6px -1px rgba(13, 148, 136, 0.1)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdfa' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              {lots.length} Lots — <span style={{ color: 'var(--status-teal)' }}>{selectedLots.size} Selected</span> — <span style={{ color: withheldCount > 0 ? 'var(--status-amber)' : 'inherit' }}>{withheldCount} Withheld</span>
            </h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button onClick={selectAll} className="btn" style={{ border: 'none', background: 'none', color: 'var(--status-teal)', fontSize: '0.875rem', fontWeight: 600 }}>Select All</button>
              <div style={{ width: '1px', height: '16px', background: 'var(--border-color)' }} />
              <button onClick={deselectAll} className="btn" style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Deselect All</button>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
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
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{lot.metadata?.location || 'N/A'}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {isSelected ? (
                        <span className="badge badge-teal">Ready</span>
                      ) : (
                        <span className="badge badge-amber">Withheld</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
          {withheldCount > 0 ? (
            <button 
              onClick={() => onReviewWithheld(lots.filter(l => !selectedLots.has(l._id)))}
              className="btn" 
              style={{ padding: '0.75rem 2rem', background: 'var(--status-amber)', color: 'white', border: 'none', borderRadius: '0.5rem' }}
            >
              Review Withheld Lots
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
