import { useState } from 'react';
import { ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ButtonSpinner } from '../../shared/LoadingComponents';

interface PartialReleaseTabProps {
  order: any;
  withheldLots: any[];
  orderLots: any[];
  onBack: () => void;
  onComplete: () => void;
}

const PartialReleaseTab: React.FC<PartialReleaseTabProps> = ({ order, withheldLots, orderLots, onBack, onComplete }) => {
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [completing, setCompleting] = useState(false);

  const handleReasonChange = (id: string, reason: string) => {
    setReasons(prev => ({ ...prev, [id]: reason }));
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);

      const releasedLotIds = orderLots
        .filter(lot => !withheldLots.some(wl => wl._id === lot._id))
        .map(lot => lot._id);

      const caseWithheldLots = withheldLots.map(lot => ({
        lotId: lot._id,
        lotNumber: lot.lotNumber,
        reason: reasons[lot._id],
        notes: notes[lot._id] || ''
      }));

      const res = await fetch(`http://localhost:5000/api/orders/${order._id}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releasedLotIds,
          withheldLots: caseWithheldLots
        })
      });

      if (res.ok) {
        onComplete();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to complete partial release');
      }
    } catch (error: any) {
      console.error('Error completing partial release:', error);
      alert(error.message || 'Failed to complete partial release. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const allReasonsSelected = withheldLots.every(lot => reasons[lot._id]);

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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Withheld Lots — {order?.customer?.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({order?.bidderNumber})</span></h2>
        <p style={{ color: 'var(--text-muted)' }}>Assign a reason for each withheld lot before completing.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
        {withheldLots.map((lot) => (
          <div 
            key={lot._id} 
            className="card responsive-partial-row" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1.5rem 2rem',
              background: reasons[lot._id] ? 'white' : 'rgba(245, 158, 11, 0.03)',
              borderColor: reasons[lot._id] ? 'var(--border-color)' : 'rgba(245, 158, 11, 0.3)'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>Lot {lot.lotNumber}</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{lot.description}</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Source:</span> <span style={{ fontWeight: 600 }}>{lot.metadata?.sourceLocation || lot.metadata?.location || 'N/A'}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Pickup:</span> <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{lot.metadata?.location || 'N/A'}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '300px' }}>
              <select 
                value={reasons[lot._id] || ''} 
                onChange={(e) => handleReasonChange(lot._id, e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
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
              <span style={{ fontWeight: 600, color: 'var(--status-teal)' }}>Ready to complete partial release</span>
            </>
          )}
        </div>
        <div>
          <button 
            onClick={handleComplete}
            disabled={!allReasonsSelected || completing}
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
            {completing ? <><ButtonSpinner /> Completing...</> : 'Complete Partial Release'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartialReleaseTab;
