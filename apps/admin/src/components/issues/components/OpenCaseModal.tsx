import React, { useState, useEffect } from 'react';
import { X, Search, AlertCircle } from 'lucide-react';

interface OpenCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const OpenCaseModal: React.FC<OpenCaseModalProps> = ({ isOpen, onClose, onSave }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [caseType, setCaseType] = useState('Issue');
  const [selectedLots, setSelectedLots] = useState<{ [lotId: string]: boolean }>({});
  const [lotNotes, setLotNotes] = useState<{ [lotId: string]: string }>({});
  const [generalNotes, setGeneralNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state
      setSearchQuery('');
      setSearchResults([]);
      setSelectedOrder(null);
      setCaseType('Issue');
      setSelectedLots({});
      setLotNotes({});
      setGeneralNotes('');
      setError(null);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      setError(null);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders?search=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setSearchResults(data);
      if (data.length === 0) {
        setError('No orders found matching search query.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during search.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectOrder = async (order: any) => {
    try {
      setLoadingOrderDetails(true);
      setError(null);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${order._id}`);
      if (!res.ok) throw new Error('Failed to load order details');
      const data = await res.json();
      setSelectedOrder(data);
      // Initialize selected lots: select all by default
      const initialSelection: { [id: string]: boolean } = {};
      const initialNotes: { [id: string]: string } = {};
      (data.lots || []).forEach((lot: any) => {
        initialSelection[lot._id] = true;
        initialNotes[lot._id] = '';
      });
      setSelectedLots(initialSelection);
      setLotNotes(initialNotes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order details.');
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const toggleLotSelection = (lotId: string) => {
    setSelectedLots(prev => ({
      ...prev,
      [lotId]: !prev[lotId]
    }));
  };

  const handleLotNoteChange = (lotId: string, notes: string) => {
    setLotNotes(prev => ({
      ...prev,
      [lotId]: notes
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) {
      setError('Please select an order first.');
      return;
    }

    const lotIdsToInclude = Object.keys(selectedLots).filter(id => selectedLots[id]);
    if (lotIdsToInclude.length === 0) {
      setError('Please select at least one lot to open a case.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const lines = lotIdsToInclude.map(id => {
        const lot = selectedOrder.lots.find((l: any) => l._id === id);
        return {
          lotNumber: lot?.lotNumber || 'UNKNOWN',
          reason: caseType,
          status: 'Open',
          notes: lotNotes[id]?.trim() || generalNotes || `Manual case opened for lot #${lot?.lotNumber}`
        };
      });

      const payload = {
        orderId: selectedOrder._id,
        type: caseType,
        lines,
        refundStatus: 'None',
        refundAmount: 0,
        refundMethod: ''
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create case');
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the case.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
      <div className="card animate-fade" style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '1.5rem', background: '#ffffff', color: 'var(--text-main)', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Open New Case Manually</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.25rem' }}>
          
          {error && (
            <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--status-red)', marginBottom: '1rem', fontSize: '0.875rem', alignItems: 'center' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Order Search (if no order selected) */}
          {!selectedOrder ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Search Order</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Enter Bidder Number or Booking Code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                  />
                </div>
                <button className="btn btn-primary" onClick={handleSearch} disabled={searching} style={{ background: 'var(--status-teal)', padding: '0.625rem 1.25rem' }}>
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Search Results</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {searchResults.map((order) => (
                      <div
                        key={order._id}
                        className="card hover-bg"
                        onClick={() => handleSelectOrder(order)}
                        style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Bidder #{order.bidderNumber}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer: {order.customer?.name || 'Unknown'} | Retrieval: {order.retrievalMethod}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: '#f1f5f9', color: 'var(--text-muted)' }}>
                          {order.fulfillmentStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Order Selected, configure Case */
            <form onSubmit={handleSubmit}>
              <div className="card" style={{ padding: '1rem', background: '#f8fafc', marginBottom: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Order</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>Bidder #{selectedOrder.bidderNumber}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Customer: {selectedOrder.customer?.name}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--status-teal)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Change Order
                  </button>
                </div>
              </div>

              {/* Case Config */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Case Type</label>
                  <select
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                  >
                    <option value="Issue">Issue</option>
                    <option value="Missing in Prep">Missing in Prep</option>
                    <option value="Missing at Release">Missing at Release</option>
                    <option value="Refused">Refused</option>
                    <option value="Return">Return</option>
                    <option value="Dispute">Dispute</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>General Case Notes</label>
                  <textarea
                    placeholder="Enter overall notes about this case..."
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minHeight: '60px', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Lot Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                  Select Affected Lots & Custom Line Notes
                </label>
                {loadingOrderDetails ? (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading lots...</div>
                ) : !selectedOrder.lots || selectedOrder.lots.length === 0 ? (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No lots found in this order.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedOrder.lots.map((lot: any) => (
                      <div
                        key={lot._id}
                        style={{
                          padding: '0.75rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: '0.5rem',
                          background: selectedLots[lot._id] ? 'rgba(13,148,136,0.02)' : 'transparent',
                          borderColor: selectedLots[lot._id] ? 'rgba(13,148,136,0.2)' : 'var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: selectedLots[lot._id] ? '0.5rem' : 0 }}>
                          <input
                            type="checkbox"
                            checked={!!selectedLots[lot._id]}
                            onChange={() => toggleLotSelection(lot._id)}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--status-teal)' }}
                          />
                          <div>
                            <span style={{ fontWeight: 800, marginRight: '0.5rem' }}>Lot #{lot.lotNumber}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({lot.status})</span>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{lot.description}</div>
                          </div>
                        </div>

                        {selectedLots[lot._id] && (
                          <div style={{ paddingLeft: '2rem' }}>
                            <input
                              type="text"
                              placeholder="Line-specific note/reason (optional)..."
                              value={lotNotes[lot._id] || ''}
                              onChange={(e) => handleLotNoteChange(lot._id, e.target.value)}
                              style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', outline: 'none' }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          {selectedOrder && (
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: 'var(--status-teal)', color: 'white', border: 'none', justifyContent: 'center' }}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Creating Case...' : 'Create Case'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
