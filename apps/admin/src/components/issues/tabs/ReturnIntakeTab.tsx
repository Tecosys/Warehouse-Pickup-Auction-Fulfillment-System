import { useState } from 'react';
import { Search, ScanLine, AlertCircle, CheckCircle2 } from 'lucide-react';

const ReturnIntakeTab = () => {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [hasExistingCase, setHasExistingCase] = useState(false);

  const mockLots = [
    { lotNum: '594', bidderNum: '#4492', customer: 'Dominic Santoro', description: 'Samsung 65" 4K Smart TV', auction: 'AUC-31', status: 'Picked Up' }
  ];

  const handleSelectLot = (lot: any) => {
    setSelectedLot(lot);
    setHasExistingCase(lot.lotNum === '594'); // Mock existing case logic
    setStep(2);
  };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Return Intake</h2>
        <p style={{ color: 'var(--text-muted)' }}>Scan or search for items being returned by customers.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Progress Sidebar */}
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

        {/* Main Step Content */}
        <div style={{ flex: 1 }}>
          {step === 1 && (
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by lot number, bidder #, or customer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', fontSize: '1.125rem', outline: 'none' }}
                  />
                </div>
                <button className="btn" style={{ padding: '0 2rem', borderRadius: '0.75rem' }}>
                  <ScanLine size={20} />
                  Scan QR
                </button>
              </div>

              {searchQuery.length > 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {mockLots.map(lot => (
                    <div key={lot.lotNum} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>Lot {lot.lotNum}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{lot.bidderNum} | {lot.customer}</span>
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>{lot.description} • {lot.auction}</div>
                      </div>
                      <button 
                        onClick={() => handleSelectLot(lot)}
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 2rem' }}
                      >
                        Select
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
                {hasExistingCase ? (
                  <>
                    <div style={{ color: 'var(--status-amber)', marginBottom: '1rem' }}>
                      <AlertCircle size={48} style={{ margin: '0 auto' }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Existing Case Found</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>A case already exists for Lot {selectedLot.lotNum} (CAS-88219).</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button onClick={() => setStep(3)} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                        Receive against existing case
                      </button>
                      <button onClick={() => setStep(3)} className="btn" style={{ padding: '0.75rem 2rem' }}>
                        Create new return case
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>No existing case found</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Would you like to create a new return case for this lot?</p>
                    <button onClick={() => setStep(3)} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                      Create new return case
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
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600 }}>
                    <option value="Customer Refused">Customer Refused</option>
                    <option value="Functionality Issue">Functionality Issue</option>
                    <option value="Wrong Item">Wrong Item</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Condition on Return</label>
                  <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600 }}>
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
                  style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minHeight: '120px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => setStep(1)} className="btn">Cancel</button>
                <button className="btn btn-primary" style={{ padding: '0.75rem 3rem' }} onClick={() => alert('Return Processed!')}>
                  Mark as Return Received
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
