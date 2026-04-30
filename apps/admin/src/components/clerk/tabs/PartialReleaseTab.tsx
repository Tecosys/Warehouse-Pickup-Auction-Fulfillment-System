import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PartialReleaseTabProps {
  order: any;
  onBack: () => void;
  onComplete: () => void;
}

const PartialReleaseTab: React.FC<PartialReleaseTabProps> = ({ order, onBack, onComplete }) => {
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showReleased, setShowReleased] = useState(false);

  // In a real app, these would come from props or state
  const withheldLots = [
    { id: '6', lotNum: '102', description: 'Nespresso Vertuo Next Coffee Machine', sourceLoc: 'F-05-3', finalLoc: 'BIN02' },
    { id: '7', lotNum: '78', description: 'Logitech MX Master 3S Mouse', sourceLoc: 'G-02-1', finalLoc: 'BIN02' },
  ];

  const releasedLotsCount = 4; // Mock

  const handleReasonChange = (id: string, reason: string) => {
    setReasons(prev => ({ ...prev, [id]: reason }));
  };

  const allReasonsSelected = withheldLots.every(lot => reasons[lot.id]);

  return (
    <div className="animate-fade" style={{ paddingBottom: '100px' }}>
      <button 
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 600 }}
      >
        <ChevronLeft size={20} />
        Back to Order Release
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Withheld Lots — {order?.customer} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({order?.bidderNum})</span></h2>
        <p style={{ color: 'var(--text-muted)' }}>Assign a reason for each withheld lot before completing.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
        {withheldLots.map((lot) => (
          <div 
            key={lot.id} 
            className="card" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1.5rem 2rem',
              background: reasons[lot.id] ? 'white' : 'rgba(245, 158, 11, 0.03)',
              borderColor: reasons[lot.id] ? 'var(--border-color)' : 'rgba(245, 158, 11, 0.3)'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>Lot {lot.lotNum}</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{lot.description}</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Source:</span> <span style={{ fontWeight: 600 }}>{lot.sourceLoc}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Pickup:</span> <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{lot.finalLoc}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '300px' }}>
              <select 
                value={reasons[lot.id] || ''} 
                onChange={(e) => handleReasonChange(lot.id, e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  border: '1px solid var(--border-color)',
                  fontWeight: 600,
                  outline: 'none',
                  borderColor: reasons[lot.id] ? 'var(--status-teal)' : 'var(--border-color)'
                }}
              >
                <option value="" disabled>Select Reason...</option>
                <option value="Not Found">Not Found</option>
                <option value="Customer Refused">Customer Refused</option>
                <option value="Issue">Issue</option>
                <option value="Other">Other</option>
              </select>

              {(reasons[lot.id] === 'Issue' || reasons[lot.id] === 'Other') && (
                <textarea
                  placeholder="Additional notes..."
                  value={notes[lot.id] || ''}
                  onChange={(e) => setNotes(prev => ({ ...prev, [lot.id]: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.875rem',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Released Lots Collapsible */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <button 
          onClick={() => setShowReleased(!showReleased)}
          style={{ 
            width: '100%', 
            padding: '1.25rem 2rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            borderBottom: showReleased ? '1px solid var(--border-color)' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="var(--status-teal)" />
            <span style={{ fontWeight: 700 }}>Released Lots ({releasedLotsCount})</span>
          </div>
          {showReleased ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showReleased && (
          <div style={{ padding: '1rem 2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[1, 2, 3, 4].map(i => (
                  <tr key={i} style={{ borderBottom: i === 4 ? 'none' : '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>Lot {i * 100}</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Released to customer</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                      <span className="badge badge-teal">Released</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky-action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!allReasonsSelected && (
            <>
              <AlertCircle size={20} color="var(--status-amber)" />
              <span style={{ fontWeight: 600, color: 'var(--status-amber)' }}>
                {withheldLots.length - Object.keys(reasons).length} lots need a reason
              </span>
            </>
          )}
          {allReasonsSelected && (
            <>
              <CheckCircle2 size={20} color="var(--status-teal)" />
              <span style={{ fontWeight: 600, color: 'var(--status-teal)' }}>Ready to complete</span>
            </>
          )}
        </div>
        <div>
          <button 
            onClick={onComplete}
            disabled={!allReasonsSelected}
            className="btn" 
            style={{ 
              padding: '0.75rem 3rem', 
              borderRadius: '0.5rem',
              background: allReasonsSelected ? 'var(--status-teal)' : 'var(--status-gray)',
              color: 'white',
              border: 'none',
              cursor: allReasonsSelected ? 'pointer' : 'not-allowed',
              opacity: allReasonsSelected ? 1 : 0.6
            }}
          >
            Complete Partial Release
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartialReleaseTab;
