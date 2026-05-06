import { useState, useEffect } from 'react';
import { Search, Send, ExternalLink, Package } from 'lucide-react';
import { PageLoader, ButtonSpinner } from '../../shared/LoadingComponents';

const PreparedTab = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackings, setTrackings] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPreparedOrders();
  }, []);

  const fetchPreparedOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/shipping/prepared');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching prepared orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackingChange = (id: string, value: string) => {
    setTrackings(prev => ({ ...prev, [id]: value }));
  };

  const handleSendTracking = async (id: string) => {
    const trackingNumber = trackings[id];
    if (!trackingNumber) return;

    try {
      setIsSending(id);
      const res = await fetch(`http://localhost:5000/api/shipping/${id}/dispatch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber })
      });
      
      if (res.ok) {
        fetchPreparedOrders();
      }
    } catch (error) {
      console.error('Error sending tracking:', error);
    } finally {
      setIsSending(null);
    }
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return !q || 
      o.bidderNumber?.toLowerCase().includes(q) ||
      o.bookingCode?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q);
  });

  if (loading) return <PageLoader message="Loading prepared shipments..." />;

  return (
    <div className="animate-fade">
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ position: 'relative', width: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bidder, booking code, or customer..." 
            style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Code</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prepared</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tracking Number</th>
              <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={32} style={{ margin: '0 auto 1rem' }} />
                  No shipments ready for dispatch
                </td>
              </tr>
            ) : filtered.map((order) => (
              <tr key={order._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--status-teal)', fontFamily: 'monospace' }}>{order.bookingCode}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{order.customer?.name || 'Unknown'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bidder #{order.bidderNumber}</div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{new Date(order.updatedAt).toLocaleDateString()}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ position: 'relative', width: '240px' }}>
                    <input 
                      type="text" 
                      placeholder="Paste tracking number..." 
                      value={trackings[order._id] || ''}
                      onChange={(e) => handleTrackingChange(order._id, e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem 0.75rem', 
                        borderRadius: '0.375rem', 
                        border: '1px solid',
                        borderColor: trackings[order._id] ? 'var(--status-teal)' : 'var(--border-color)',
                        outline: 'none',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace'
                      }}
                    />
                    {trackings[order._id] && (
                      <ExternalLink size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--status-teal)', cursor: 'pointer' }} />
                    )}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <button 
                    disabled={!trackings[order._id] || isSending === order._id}
                    onClick={() => handleSendTracking(order._id)}
                    className="btn" 
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: trackings[order._id] ? 'var(--status-teal)' : 'white',
                      color: trackings[order._id] ? 'white' : 'var(--text-muted)',
                      border: trackings[order._id] ? 'none' : '1px solid var(--border-color)',
                      opacity: trackings[order._id] ? 1 : 0.5,
                      cursor: trackings[order._id] ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {isSending === order._id ? <ButtonSpinner /> : <><Send size={16} /> Send Tracking</>}
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
