import { useState } from 'react';
import { Search, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ButtonSpinner } from '../../shared/LoadingComponents';

const ReturnIntakeTab = () => {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [lots, setLots] = useState<any[]>([]);
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [existingCases, setExistingCases] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [reason, setReason] = useState('Customer Refused');
  const [condition, setCondition] = useState('As Sold');
  const [notes, setNotes] = useState('');
  const [useExistingCase, setUseExistingCase] = useState<string | null>(null);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    try {
      setSearching(true);
      const res = await fetch(`http://localhost:5000/api/lots/search?q=${searchQuery}`);
      const data = await res.json();
      setLots(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLot = async (lot: any) => {
    setSelectedLot(lot);
    // Check for existing cases for this order/bidder
    try {
      const res = await fetch(`http://localhost:5000/api/cases?search=${lot.bidderNumber}`);
      const data = await res.json();
      setExistingCases(data.filter((c: any) => c.status !== 'Resolved'));
      setStep(2);
    } catch (error) {
      console.error('Case check failed:', error);
      setStep(2);
    }
  };

  const handleProcessReturn = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch('http://localhost:5000/api/cases/return-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotId: selectedLot._id,
          reason,
          condition,
          notes,
          existingCaseId: useExistingCase
        })
      });

      if (res.ok) {
        alert('Return processed successfully!');
        // Reset
        setStep(1);
        setSearchQuery('');
        setLots([]);
        setSelectedLot(null);
      }
    } catch (error) {
      console.error('Return processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Return Intake</h2>
        <p style={{ color: 'var(--text-muted)' }}>Scan or search for items being returned by customers.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { n: 1, label: 'Find Order/Lot' },
            { n: 2, label: 'Case Selection' },
            { n: 3, label: 'Confirm Return' }
          ].map((s) => (
            <div 
              key={s.n} 
              style={{ 
                padding: '1rem', 
                borderRadius: '0.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                background: step === s.n ? 'rgba(13, 148, 136, 0.05)' : 'white',
                border: '1px solid',
                borderColor: step === s.n ? 'var(--status-teal)' : 'var(--border-color)',
                color: step === s.n ? 'var(--status-teal)' : 'var(--text-muted)',
                fontWeight: 700
              }}
            >
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: step > s.n ? 'var(--status-teal)' : step === s.n ? 'var(--status-teal)' : 'var(--border-color)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem'
              }}>
                {step > s.n ? <CheckCircle2 size={16} /> : s.n}
              </div>
              {s.label}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          {step === 1 && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by lot number or bidder #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', fontSize: '1.125rem', outline: 'none' }}
                  />
                </div>
                <button className="btn btn-primary" style={{ padding: '0 2rem', borderRadius: '0.75rem' }} onClick={handleSearch} disabled={searching}>
                  {searching ? <Loader2 className="animate-spin" /> : 'Search'}
                </button>
              </div>

              {lots.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {lots.map(lot => (
                    <div key={lot._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>Lot {lot.lotNumber}</span>
                          <span style={{ color: 'var(--text-muted)' }}>Bidder #{lot.bidderNumber}</span>
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>{lot.auctionRun?.title} • Status: <span style={{ fontWeight: 700 }}>{lot.status}</span></div>
                      </div>
                      <button onClick={() => handleSelectLot(lot)} className="btn btn-primary" style={{ padding: '0.5rem 2rem' }}>
                        Process Return
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade">
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                {existingCases.length > 0 ? (
                  <>
                    <div style={{ color: 'var(--status-amber)', marginBottom: '1rem' }}>
                      <AlertCircle size={48} style={{ margin: '0 auto' }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Existing Cases Found</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We found active cases for this bidder. Would you like to link this return to one of them?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                      {existingCases.map(c => (
                        <button 
                          key={c._id}
                          onClick={() => { setUseExistingCase(c._id); setStep(3); }}
                          className="btn" 
                          style={{ justifyContent: 'space-between', padding: '1rem' }}
                        >
                          <span>{c.caseNumber} — {c.type}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{c.status}</span>
                        </button>
                      ))}
                      <button onClick={() => { setUseExistingCase(null); setStep(3); }} className="btn" style={{ borderStyle: 'dashed' }}>
                        No, create a new return case
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>No existing cases found</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Preparing to create a new return case for Lot {selectedLot.lotNumber}.</p>
                    <button onClick={() => setStep(3)} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                      Continue to Details
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card animate-fade" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Return Reason</label>
                  <select value={reason} onChange={(e) => setReason(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600 }}>
                    <option value="Customer Refused">Customer Refused</option>
                    <option value="Functionality Issue">Functionality Issue</option>
                    <option value="Wrong Item">Wrong Item</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Condition on Return</label>
                  <select value={condition} onChange={(e) => setCondition(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600 }}>
                    <option value="As Sold">As Sold</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Missing Parts">Missing Parts</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Internal Notes</label>
                <textarea 
                  placeholder="Additional details about the return condition..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minHeight: '120px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => setStep(1)} className="btn" disabled={isProcessing}>Cancel</button>
                <button className="btn btn-primary" style={{ padding: '0.75rem 3rem' }} onClick={handleProcessReturn} disabled={isProcessing}>
                  {isProcessing ? <ButtonSpinner /> : 'Mark as Return Received'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnIntakeTab;
