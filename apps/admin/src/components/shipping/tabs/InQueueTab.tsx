import { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import { PageLoader } from '../../shared/LoadingComponents';
import OrderShippingModal from '../OrderShippingModal';

interface InQueueTabProps {
  selectedAuction?: any;
  selectedOrders: Set<string>;
  setSelectedOrders: (s: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  triggerPrepare: number;
}

const InQueueTab: React.FC<InQueueTabProps> = ({ selectedAuction, selectedOrders, setSelectedOrders, triggerPrepare }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchShippingOrders();
  }, [selectedAuction?._id]);

  useEffect(() => {
    if (triggerPrepare > 0 && selectedOrders.size > 0) {
      markAsPrepared();
    }
  }, [triggerPrepare]);

  const fetchShippingOrders = async () => {
    try {
      setLoading(true);
      const url = selectedAuction?._id 
        ? `http://localhost:5000/api/shipping/queue?auctionRunId=${selectedAuction._id}`
        : 'http://localhost:5000/api/shipping/queue';
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching shipping queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const openShippingModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedOrders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOrders(next);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filtered.length) setSelectedOrders(new Set());
    else setSelectedOrders(new Set(filtered.map((o: any) => o._id)));
  };

  const markAsPrepared = async () => {
    try {
      for (const id of Array.from(selectedOrders)) {
        await fetch(`http://localhost:5000/api/shipping/${id}/prepare`, {
          method: 'PATCH'
        });
      }
      setSelectedOrders(new Set());
      fetchShippingOrders();
    } catch (error) {
      console.error('Error updating orders:', error);
    }
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return !q || 
      o.bidderNumber?.toLowerCase().includes(q) ||
      o.bookingCode?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q);
  });

  if (loading) {
    return <PageLoader message="Loading shipping queue..." />;
  }

  return (
    <div className="animate-fade">
      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by bidder #, booking code, or customer..." 
              style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
            />
          </div>
        </div>
        
        {selectedOrders.size > 0 && (
          <button className="btn" onClick={markAsPrepared} style={{ background: 'var(--status-teal)', color: 'white', border: 'none', padding: '0.625rem 1.25rem' }}>
            Mark {selectedOrders.size} as Prepared
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ width: '60px', padding: '1rem 1.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={selectedOrders.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--status-teal)' }}
                />
              </th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Code</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bidder #</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ship To</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={32} style={{ margin: '0 auto 1rem' }} />
                  No orders in shipping queue
                </td>
              </tr>
            ) : filtered.map((order: any) => (
              <tr 
                key={order._id} 
                style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName !== 'INPUT') {
                    openShippingModal(order._id);
                  }
                }}
                className="hover-row"
              >
                <td style={{ padding: '1rem 1.5rem' }} onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedOrders.has(order._id)}
                    onChange={() => toggleSelect(order._id)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--status-teal)' }}
                  />
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--status-teal)', fontFamily: 'monospace' }}>{order.bookingCode}</td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>#{order.bidderNumber}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {order.customer?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                    </div>
                    <span style={{ fontWeight: 600 }}>{order.customer?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {order.customer?.shipTo?.city ? `${order.customer.shipTo.city}, ${order.customer.shipTo.state}` : 'Address on file'}
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: '#f0fdfa', color: 'var(--status-teal)' }}>
                    {order.shippingStatus || order.customerStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedOrderId && (
        <OrderShippingModal 
          orderId={selectedOrderId} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onRefresh={fetchShippingOrders}
        />
      )}
    </div>
  );
};

export default InQueueTab;
