import React, { useState } from 'react';
import { Search, Send, ExternalLink } from 'lucide-react';

const MOCK_PREPARED = [
  { id: '#BB-88219', bidderNum: '1042', customer: 'Elena Wright', items: 4, preparedAt: 'Mar 09, 2024 10:22 AM', tracking: '' },
  { id: '#BB-88220', bidderNum: '559', customer: 'Julian Mendez', items: 12, preparedAt: 'Mar 09, 2024 11:45 AM', tracking: 'UPS-123456789' },
  { id: '#BB-88221', bidderNum: '2102', customer: 'Katherine Chen', items: 1, preparedAt: 'Mar 09, 2024 09:12 AM', tracking: '' },
];

const PreparedTab = () => {
  const [trackings, setTrackings] = useState<Record<string, string>>({
    '#BB-88220': 'UPS-123456789'
  });

  const handleTrackingChange = (id: string, value: string) => {
    setTrackings(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="animate-fade">
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ position: 'relative', width: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by order, bidder, or tracking..." 
            style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order ID</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prepared At</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tracking Number</th>
              <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PREPARED.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--status-teal)' }}>{order.id}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{order.customer}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.items} items</div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{order.preparedAt}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ position: 'relative', width: '240px' }}>
                    <input 
                      type="text" 
                      placeholder="Paste tracking number..." 
                      value={trackings[order.id] || ''}
                      onChange={(e) => handleTrackingChange(order.id, e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem 0.75rem', 
                        borderRadius: '0.375rem', 
                        border: '1px solid',
                        borderColor: trackings[order.id] ? 'var(--status-teal)' : 'var(--border-color)',
                        outline: 'none',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace'
                      }}
                    />
                    {trackings[order.id] && (
                      <ExternalLink size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--status-teal)', cursor: 'pointer' }} />
                    )}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <button 
                    disabled={!trackings[order.id]}
                    className="btn" 
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: trackings[order.id] ? 'var(--status-teal)' : 'white',
                      color: trackings[order.id] ? 'white' : 'var(--text-muted)',
                      border: trackings[order.id] ? 'none' : '1px solid var(--border-color)',
                      opacity: trackings[order.id] ? 1 : 0.5,
                      cursor: trackings[order.id] ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <Send size={16} />
                    Send Tracking
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreparedTab;
