import { useState, useEffect, Fragment } from 'react';
import { Download, ChevronDown, ChevronUp, CheckCircle2, Package } from 'lucide-react';
import { PageLoader } from '../../shared/LoadingComponents';

interface DispatchedTabProps {
  selectedAuction?: any;
}

const DispatchedTab: React.FC<DispatchedTabProps> = ({ selectedAuction }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchDispatchedOrders();
  }, [selectedAuction?._id]);

  const fetchDispatchedOrders = async () => {
    try {
      setLoading(true);
      const url = selectedAuction?._id 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/shipping/dispatched?auctionRunId=${selectedAuction._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/shipping/dispatched`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching dispatched orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader message="Loading dispatch history..." />;

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn" style={{ fontSize: '0.875rem' }}>
          <Download size={16} />
          Export to CSV
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Code</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tracking Number</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dispatched At</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={32} style={{ margin: '0 auto 1rem' }} />
                  No dispatched history found
                </td>
              </tr>
            ) : orders.map((order) => (
              <Fragment key={order._id}>
                <tr 
                  onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                  style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                >
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--status-teal)', fontFamily: 'monospace' }}>{order.bookingCode}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{order.customer?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bidder #{order.bidderNumber}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontFamily: 'monospace' }}>{order.trackingNumber}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{new Date(order.shippedAt).toLocaleString()}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--status-green)', fontWeight: 600 }}>DISPATCHED</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {expandedId === order._id ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </td>
                </tr>
                {expandedId === order._id && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem 4rem', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-color)' }} />
                        
                        {[
                          { label: 'Shipping Selected', date: 'Customer Portal Action' },
                          { label: 'Marked In Queue', date: new Date(order.updatedAt).toLocaleString() },
                          { label: 'Prepared for Shipping', date: new Date(order.updatedAt).toLocaleString() },
                          { label: 'Dispatched & Tracking Sent', date: new Date(order.shippedAt).toLocaleString() }
                        ].map((event, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%', 
                              background: 'white', 
                              border: '2px solid var(--status-teal)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              zIndex: 1
                            }}>
                              <CheckCircle2 size={14} color="var(--status-teal)" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
                              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{event.label}</span>
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{event.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default DispatchedTab;
