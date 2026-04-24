import React, { useState } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';

interface WalkInOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (order: any) => void;
}

const WalkInOverrideModal: React.FC<WalkInOverrideModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  if (!isOpen) return null;

  const mockSearchResults = [
    { id: '10', bidderNum: '#5521', customer: 'Sarah Jenkins', items: 12 },
    { id: '11', bidderNum: '#1129', customer: 'Mike Ross', items: 3 },
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="card animate-slide" style={{ width: '500px', padding: 0, overflow: 'hidden' }}>
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
          </div>

          {searchQuery.length > 2 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Search Results</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {mockSearchResults.map(order => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid',
                      borderColor: selectedOrder?.id === order.id ? 'var(--status-teal)' : 'var(--border-color)',
                      background: selectedOrder?.id === order.id ? 'rgba(13, 148, 136, 0.05)' : 'white',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>{order.bidderNum}</span>
                      <span style={{ fontWeight: 500 }}>{order.customer}</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{order.items} Lots</span>
                  </button>
                ))}
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
                    This will bump <strong>{selectedOrder.customer}</strong> to the top of the prep queue.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', background: '#f8fafc' }}>
          <button onClick={onClose} className="btn">Cancel</button>
          <button 
            disabled={!selectedOrder}
            onClick={() => onConfirm(selectedOrder)}
            className="btn" 
            style={{ 
              background: 'var(--status-amber)', 
              color: 'white', 
              border: 'none',
              padding: '0.75rem 1.5rem',
              opacity: selectedOrder ? 1 : 0.5,
              cursor: selectedOrder ? 'pointer' : 'not-allowed'
            }}
          >
            Bump to Top of Prep Queue
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalkInOverrideModal;
