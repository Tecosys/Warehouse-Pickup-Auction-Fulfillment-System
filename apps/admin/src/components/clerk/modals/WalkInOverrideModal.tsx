import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, AlertCircle } from 'lucide-react';
import { ButtonSpinner } from '../../shared/LoadingComponents';

interface WalkInOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (order: any) => void;
}

const WalkInOverrideModal: React.FC<WalkInOverrideModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:5000/api/orders?search=${searchQuery}`);
          const data = await res.json();
          setSearchResults(data);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!selectedOrder) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/orders/${selectedOrder._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerStatus: 'Checked In',
          // Explicitly clear appointmentTime so it classifies as a Walk-in (or it defaults to Checked In walk-in badge)
          appointmentTime: null
        })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        onConfirm(updatedOrder);
      } else {
        alert('Failed to check in walk-in order');
      }
    } catch (err) {
      console.error(err);
      alert('Error checking in walk-in');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(8px)',
      padding: '1rem'
    }}>
      <div className="card animate-slide" style={{ width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Walk-in Priority Override</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Find order by bidder # or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                outline: 'none'
              }}
            />
            {loading && (
              <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                <ButtonSpinner />
              </div>
            )}
          </div>

          {searchQuery.length > 1 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Search Results</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {searchResults.map(order => (
                  <button
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid',
                      borderColor: selectedOrder?._id === order._id ? 'var(--status-teal)' : 'var(--border-color)',
                      background: selectedOrder?._id === order._id ? 'rgba(13, 148, 136, 0.05)' : 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>#{order.bidderNumber}</span>
                      <span style={{ fontWeight: 500 }}>{order.customer?.name}</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{order.totalLots || 0} Lots</span>
                  </button>
                ))}
                {searchResults.length === 0 && !loading && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', padding: '0.5rem' }}>No orders found.</div>
                )}
              </div>
            </div>
          )}

          {selectedOrder && (
            <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertCircle size={20} color="var(--status-amber)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#92400e' }}>Confirm Priority Override?</div>
                  <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                    This will check in <strong>{selectedOrder.customer?.name}</strong> as a walk-in and place them at the top of the prep queue.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', background: '#f8fafc' }}>
          <button onClick={onClose} className="btn">Cancel</button>
          <button 
            disabled={!selectedOrder || loading}
            onClick={handleConfirm}
            className="btn" 
            style={{ 
              background: 'var(--status-teal)', 
              color: 'white', 
              border: 'none',
              padding: '0.75rem 1.5rem',
              opacity: selectedOrder ? 1 : 0.5,
              cursor: selectedOrder ? 'pointer' : 'not-allowed'
            }}
          >
            {loading ? <ButtonSpinner /> : 'Check In Walk-In'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WalkInOverrideModal;
