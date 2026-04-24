import { useState, useEffect } from 'react';
import { Printer, AlertTriangle, ChevronLeft } from 'lucide-react';

const MOCK_LOTS = [
  { id: '1', lotNum: '594', description: 'Samsung 65" 4K Smart TV', sourceLoc: 'A-12-3', finalLoc: 'BIN01', status: 'Ready' },
  { id: '2', lotNum: '669', description: 'KitchenAid Stand Mixer - Onyx Black', sourceLoc: 'B-04-1', finalLoc: 'BIN01', status: 'Ready' },
  { id: '3', lotNum: '1321', description: 'Apple AirPods Pro (2nd Gen)', sourceLoc: 'C-01-4', finalLoc: 'BIN01', status: 'Ready' },
  { id: '4', lotNum: '9', description: 'DeWalt 20V Max Cordless Drill Kit', sourceLoc: 'D-09-2', finalLoc: 'PU04', status: 'Ready' },
  { id: '5', lotNum: '34', description: 'Dyson V15 Detect Vacuum', sourceLoc: 'E-02-1', finalLoc: 'PU04', status: 'Ready' },
  { id: '6', lotNum: '102', description: 'Nespresso Vertuo Next Coffee Machine', sourceLoc: 'F-05-3', finalLoc: 'BIN02', status: 'Issue' },
];

interface OrderReleaseTabProps {
  order: any;
  onReviewWithheld: () => void;
  onBack: () => void;
  onComplete: () => void;
}

const OrderReleaseTab: React.FC<OrderReleaseTabProps> = ({ order, onReviewWithheld, onBack, onComplete }) => {
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set(MOCK_LOTS.map(l => l.id)));
  const [withheldCount, setWithheldCount] = useState(0);

  useEffect(() => {
    setWithheldCount(MOCK_LOTS.length - selectedLots.size);
  }, [selectedLots]);

  const toggleLot = (id: string) => {
    const newSelected = new Set(selectedLots);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLots(newSelected);
  };

  const selectAll = () => setSelectedLots(new Set(MOCK_LOTS.map(l => l.id)));
  const deselectAll = () => setSelectedLots(new Set());

  if (!order) return <div style={{ padding: '4rem', textAlign: 'center' }}>No order selected. Please go back to search.</div>;

  return (
    <div className="animate-fade" style={{ paddingBottom: '100px' }}>
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>{order.customer}</h2>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--status-teal)' }}>{order.bidderNum}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Code</label>
                <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '1.125rem' }}>ABC-123-XYZ</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Auction #</label>
                <div style={{ fontWeight: 600 }}>AUC-31</div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Authorized Pickup Person</label>
              <div className="info-box info-box-amber" style={{ marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 700 }}>Authorized Pickup:</span> James Santoro — 416-555-0192
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge badge-teal">{order.fulfillment}</span>
              <span className="badge badge-blue">{order.customerStatus}</span>
            </div>

            {MOCK_LOTS.some(l => l.status === 'Issue') && (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <AlertTriangle size={20} color="var(--status-red)" />
                <div style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: 500 }}>
                  This order has 1 flagged lot(s). Review before completing release.
                </div>
              </div>
            )}
            
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Checked in by <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Marcus Chen</span> at 10:22 AM
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>
              <Printer size={18} />
              Print Pickup Summary
            </button>
            <button className="btn" style={{ width: '100%', justifyContent: 'center', color: 'var(--status-amber)', borderColor: 'var(--status-amber)' }}>
              Request Helper
            </button>
          </div>
        </div>

        {/* Right Column - Lot Release Panel */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              {MOCK_LOTS.length} Lots — <span style={{ color: 'var(--status-teal)' }}>{selectedLots.size} Selected</span> — {withheldCount} Withheld
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
                    checked={selectedLots.size === MOCK_LOTS.length}
                    onChange={selectedLots.size === MOCK_LOTS.length ? deselectAll : selectAll}
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
              {MOCK_LOTS.map((lot) => {
                const isSelected = selectedLots.has(lot.id);
                return (
                  <tr 
                    key={lot.id} 
                    onClick={() => toggleLot(lot.id)}
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
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>{lot.lotNum}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 500 }}>{lot.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source: {lot.sourceLoc}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{lot.finalLoc}</span>
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
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--status-teal)' }}>{selectedLots.size} Selected</span>
          <span style={{ margin: '0 0.75rem', color: 'var(--border-color)' }}>|</span>
          <span style={{ color: withheldCount > 0 ? 'var(--status-amber)' : 'var(--text-muted)' }}>{withheldCount} Withheld</span>
        </div>
        <div>
          {withheldCount > 0 ? (
            <button 
              onClick={onReviewWithheld}
              className="btn" 
              style={{ padding: '0.75rem 2rem', background: 'var(--status-amber)', color: 'white', border: 'none', borderRadius: '0.5rem' }}
            >
              Review Withheld Lots <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
            </button>
          ) : (
            <button onClick={onComplete} className="btn btn-primary" style={{ padding: '0.75rem 3rem', borderRadius: '0.5rem' }}>
              Complete Release
            </button>
          )}
        </div>
      </div>
      
      <style>{`
        .sticky-action-bar {
          position: fixed;
          bottom: var(--footer-height);
          left: var(--sidebar-width);
          right: 0;
          background: white;
          border-top: 1px solid var(--border-color);
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

const ArrowRight = ({ size, style }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default OrderReleaseTab;
