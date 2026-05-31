import { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, Calendar, RefreshCw, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { ButtonSpinner } from '../../shared/LoadingComponents';

interface Credit {
  _id: string;
  customer: {
    name: string;
    bidderNumber: string;
    email: string;
  };
  sourceCase?: {
    caseNumber: string;
    type: string;
  };
  amount: number;
  remainingBalance: number;
  reason?: string;
  expiryDate?: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

const CreditsLedgerTab = () => {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [bidderNumber, setBidderNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/credits`);
      const data = await res.json();
      setCredits(data);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const handleIssueCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidderNumber || !amount) return;

    try {
      setSaving(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidderNumber,
          amount: parseFloat(amount),
          reason,
          expiryDate: expiryDate || undefined
        })
      });

      if (res.ok) {
        alert('Credit issued successfully!');
        setIsModalOpen(false);
        setBidderNumber('');
        setAmount('');
        setReason('');
        setExpiryDate('');
        fetchCredits();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to issue credit');
      }
    } catch (error) {
      console.error(error);
      alert('Error issuing credit');
    } finally {
      setSaving(false);
    }
  };

  const filteredCredits = credits.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.customer?.name?.toLowerCase().includes(q) ||
      c.customer?.bidderNumber?.toLowerCase().includes(q) ||
      c.reason?.toLowerCase().includes(q) ||
      c.sourceCase?.caseNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Store Credit Ledger</h2>
          <p style={{ color: 'var(--text-muted)' }}>Issue store credit and review customer credit histories.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" onClick={fetchCredits} title="Refresh credit list">
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ background: 'var(--status-teal)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} /> Issue Store Credit
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by customer name, bidder #, reason or case #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading ledger...</div>
        ) : filteredCredits.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No credits found in database.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '1rem 1.5rem' }}>CUSTOMER</th>
                <th style={{ padding: '1rem 1.5rem' }}>REASON / SOURCE</th>
                <th style={{ padding: '1rem 1.5rem' }}>AMOUNT</th>
                <th style={{ padding: '1rem 1.5rem' }}>BALANCE</th>
                <th style={{ padding: '1rem 1.5rem' }}>EXPIRY DATE</th>
                <th style={{ padding: '1rem 1.5rem' }}>STATUS</th>
                <th style={{ padding: '1rem 1.5rem' }}>ISSUED BY</th>
              </tr>
            </thead>
            <tbody>
              {filteredCredits.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 700 }}>{c.customer?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bidder #{c.customer?.bidderNumber}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 500 }}>{c.reason || 'Manual Adjustment'}</div>
                    {c.sourceCase && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--status-blue)', fontWeight: 600 }}>
                        Case: {c.sourceCase.caseNumber} ({c.sourceCase.type})
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    ${c.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--status-teal)' }}>
                    ${c.remainingBalance.toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>
                    {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'No Expiry'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '99px',
                      background: c.status === 'Active' ? '#d1fae5' : c.status === 'Partially Used' ? '#fef3c7' : '#f1f5f9',
                      color: c.status === 'Active' ? '#065f46' : c.status === 'Partially Used' ? '#92400e' : 'var(--text-muted)'
                    }}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>
                    {c.createdBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Manual Credit Modal */}
      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setIsModalOpen(false)}>
          <div className="card animate-slide" style={{ width: '480px', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)' }}>Issue Manual Store Credit</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleIssueCredit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Bidder Number</label>
                <input 
                  type="text" 
                  value={bidderNumber} 
                  onChange={e => setBidderNumber(e.target.value)} 
                  placeholder="e.g. 10452"
                  className="card" 
                  style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Credit Amount ($)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="number" 
                    step="0.01"
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    placeholder="0.00"
                    className="card" 
                    style={{ width: '100%', padding: '0.625rem 0.625rem 0.625rem 2rem', fontSize: '0.875rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Reason</label>
                <input 
                  type="text" 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  placeholder="e.g. Good gestures, damaged items compensation"
                  className="card" 
                  style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Expiry Date (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="date" 
                    value={expiryDate} 
                    onChange={e => setExpiryDate(e.target.value)} 
                    className="card" 
                    style={{ width: '100%', padding: '0.625rem 0.625rem 0.625rem 2rem', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.875rem', background: 'var(--status-teal)' }} disabled={saving}>
                  {saving ? <><ButtonSpinner /> Saving...</> : 'Confirm Issuance'}
                </button>
                <button type="button" className="btn" style={{ flex: 1, padding: '0.875rem' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CreditsLedgerTab;
