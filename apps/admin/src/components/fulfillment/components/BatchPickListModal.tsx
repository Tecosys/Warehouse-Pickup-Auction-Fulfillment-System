import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Loader2 } from 'lucide-react';

interface BatchPickListModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrderIds: string[];
}

const BatchPickListModal: React.FC<BatchPickListModalProps> = ({ isOpen, onClose, selectedOrderIds }) => {
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || selectedOrderIds.length === 0) return;

    const fetchLots = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/lots?orderIds=${selectedOrderIds.join(',')}`);
        const data = await res.json();
        
        // Sort lots alphabetically/numerically by sourceLocation
        const sorted = data.sort((a: any, b: any) => {
          const locA = a.sourceLocation || '';
          const locB = b.sourceLocation || '';
          if (locA === locB) {
            // If locations match, sub-sort by lot number
            const aNum = parseInt(a.lotNumber, 10);
            const bNum = parseInt(b.lotNumber, 10);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            return a.lotNumber.localeCompare(b.lotNumber, undefined, { numeric: true });
          }
          return locA.localeCompare(locB, undefined, { numeric: true, sensitivity: 'base' });
        });

        setLots(sorted);
      } catch (err) {
        console.error('Error fetching batch lots:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, [isOpen, selectedOrderIds]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Extract unique bidder numbers for display in the summary
  const bidderNumbers = Array.from(new Set(lots.map(l => l.order?.bidderNumber))).filter(Boolean);

  return createPortal(
    <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card animate-fade" style={{ maxWidth: '700px', width: '100%', padding: '1.5rem', background: '#f8fafc', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batch Picking List</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Loader2 className="animate-spin text-[#0d9488]" size={36} />
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, marginBottom: '1.5rem', paddingRight: '0.25rem' }}>
            <div id="batch-pick-list-content" style={{ 
              background: 'white', 
              padding: '2rem 1.5rem', 
              borderRadius: '4px', 
              fontFamily: "'Courier New', Courier, monospace", 
              color: 'black',
              border: '1px solid #ddd'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid black', paddingBottom: '0.5rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>BIDBOSS</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>COMBINED BATCH PICKING LIST</div>
              </div>

              <div style={{ fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <div>DATE: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
                <div>SELECTED ORDERS: {selectedOrderIds.length}</div>
                <div>BIDDERS IN BATCH: <strong>{bidderNumbers.map(n => `#${n}`).join(', ')}</strong></div>
              </div>

              <div style={{ borderTop: '1px solid black', borderBottom: '1px solid black', padding: '0.5rem 0', margin: '1rem 0' }}>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid black' }}>
                      <th style={{ padding: '6px 4px', width: '90px' }}>LOCATION</th>
                      <th style={{ padding: '6px 4px', width: '70px' }}>LOT</th>
                      <th style={{ padding: '6px 4px' }}>DESCRIPTION</th>
                      <th style={{ padding: '6px 4px', width: '120px' }}>BIDDER</th>
                      <th style={{ padding: '6px 4px', width: '90px', borderLeft: '1px dashed #999', textAlign: 'center' }}>ASSIGNED BIN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((lot, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '6px 4px', fontWeight: 900, fontSize: '0.9rem' }}>{lot.sourceLocation || 'TBD'}</td>
                        <td style={{ padding: '6px 4px' }}>#{lot.lotNumber}</td>
                        <td style={{ padding: '6px 4px', fontSize: '0.75rem' }}>{lot.description?.substring(0, 30)}...</td>
                        <td style={{ padding: '6px 4px', fontSize: '0.75rem' }}>
                          #{lot.order?.bidderNumber} ({lot.order?.customer?.name || 'Walk-in'})
                        </td>
                        <td style={{ padding: '6px 4px', borderLeft: '1px dashed #999', textAlign: 'center' }}>
                          [ &nbsp; &nbsp; &nbsp; ]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '1.5rem', fontWeight: 700 }}>
                <div>TOTAL LOTS IN WALK: {lots.length}</div>
                <div>WORKER SIGN: _________________</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
          <button className="btn" style={{ flex: 1 }} onClick={onClose}>Close</button>
          <button 
            className="btn btn-primary" 
            disabled={loading}
            style={{ flex: 1, background: 'var(--status-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
            onClick={handlePrint}
          >
            <Printer size={18} /> Print Picking List
          </button>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            .no-print { display: none !important; }
            #batch-pick-list-content, #batch-pick-list-content * { 
              visibility: visible; 
            }
            #batch-pick-list-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 10px;
              border: none;
            }
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default BatchPickListModal;
