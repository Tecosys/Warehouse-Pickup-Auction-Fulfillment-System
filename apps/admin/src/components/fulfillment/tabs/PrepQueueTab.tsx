import { useState, useEffect } from 'react';
import { Package, ChevronRight, Clock, LayoutGrid, X } from 'lucide-react';
import { PageLoader } from '../../shared/LoadingComponents';
import BatchPickListModal from '../components/BatchPickListModal';

interface PrepQueueTabProps {
  onOpenOrder: (id: string) => void;
  selectedAuction?: any;
}

const PrepQueueTab: React.FC<PrepQueueTabProps> = ({ onOpenOrder, selectedAuction }) => {
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'appointment' | 'bidder'>('appointment');
  const [activeAuction, setActiveAuction] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ inQueue: 0, inProgress: 0, readyToday: 0 });
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const toggleOrderSelect = (id: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      let auction = selectedAuction;
      if (!auction) {
        // 1. Fetch active auction
        const auctionRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auctions/active`);
        auction = await auctionRes.json();
      }
      setActiveAuction(auction);

      if (auction && auction._id) {
        // 2. Fetch orders for this auction
        const ordersRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders?auctionRunId=${auction._id}`);
        const ordersData = await ordersRes.json();
        
        // Map backend orders to UI format (simulated mapping for now)
        const mappedOrders = ordersData.map((o: any) => ({
          id: o._id,
          bidder: o.bidderNumber,
          customer: o.customer?.name || 'Unknown Customer',
          status: o.fulfillmentStatus,
          customerStatus: o.customerStatus,
          isWalkIn: o.customerStatus === 'Checked In' && !o.appointmentTime,
          appointment: o.appointmentTime ? new Date(o.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOT SET',
          appointmentRaw: o.appointmentTime,
          lots: o.totalLots || 0,
          auction: `Auction ${auction.auctionNumber}`
        }));
        
        setOrders(mappedOrders);
        
        // Calculate stats
        setStats({
          inQueue: mappedOrders.filter((o: any) => o.status === 'Not Started').length,
          inProgress: mappedOrders.filter((o: any) => o.status === 'In Progress').length,
          readyToday: mappedOrders.filter((o: any) => o.status === 'Ready').length
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartBatchPrep = async () => {
    try {
      setLoading(true);
      await Promise.all(
        Array.from(selectedOrders).map(orderId =>
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fulfillmentStatus: 'In Progress' })
          })
        )
      );
      setSelectedOrders(new Set());
      await fetchData();
    } catch (err) {
      console.error('Error starting batch prep:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAuction?._id]);

  if (loading) {
    return <PageLoader message="Loading active auction queue..." />;
  }

  return (
    <div className="animate-fade responsive-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Auction Context */}
      <div className="responsive-flex-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ background: '#e2e8f0', padding: '0.625rem 1.25rem', borderRadius: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
          <LayoutGrid size={16} />
          {activeAuction ? `${activeAuction.title} (#${activeAuction.auctionNumber})` : 'No Active Auction'}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="card" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, outline: 'none', width: '100%' }}
          >
            <option value="appointment">Sort by: Appointment Priority</option>
            <option value="bidder">Sort by: Bidder Number</option>
          </select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="responsive-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'In Queue', val: stats.inQueue, color: 'var(--text-muted)' },
          { label: 'In Progress', val: stats.inProgress, color: 'var(--status-amber)' },
          { label: 'Ready Today', val: stats.readyToday, color: 'var(--status-teal)' }
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <div className="stat-label" style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{s.label}</div>
            <div className="stat-val" style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }} className="no-scrollbar">
        {['All', 'Not Started', 'In Progress', 'Ready', 'Walk-in'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              border: '1px solid',
              borderColor: filter === f ? 'var(--status-teal)' : 'var(--border-color)',
              background: filter === f ? 'var(--status-teal)' : 'white',
              color: filter === f ? 'white' : 'var(--text-muted)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Order Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {orders.length > 0 ? (
          orders
            .filter(o => {
              if (filter === 'All') return true;
              if (filter === 'Walk-in') return o.isWalkIn;
              return o.status === filter;
            })
            .sort((a, b) => {
              if (sortBy === 'bidder') {
                return parseInt(a.bidder, 10) - parseInt(b.bidder, 10);
              } else {
                // 1. Checked in first
                const aChecked = a.customerStatus === 'Checked In';
                const bChecked = b.customerStatus === 'Checked In';
                if (aChecked && !bChecked) return -1;
                if (!aChecked && bChecked) return 1;
                
                // If both are checked in, or both are not checked in
                // Check appointment time
                const aTime = a.appointmentRaw ? new Date(a.appointmentRaw).getTime() : null;
                const bTime = b.appointmentRaw ? new Date(b.appointmentRaw).getTime() : null;
                
                if (aTime && !bTime) return -1;
                if (!aTime && bTime) return 1;
                if (aTime && bTime && aTime !== bTime) {
                  return aTime - bTime;
                }
                
                // Otherwise sort by bidder number
                return parseInt(a.bidder, 10) - parseInt(b.bidder, 10);
              }
            })
            .map(order => (
            <div 
              key={order.id} 
              className="card" 
              style={{ 
                padding: '1.25rem', 
                borderLeft: order.isWalkIn ? '6px solid var(--status-red)' : '1px solid var(--border-color)',
                background: order.isWalkIn ? 'rgba(239, 68, 68, 0.02)' : 'white',
                position: 'relative'
              }}
            >
              {/* Row 1: Bidder, Customer, Status */}
              <div className="responsive-queue-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {['Not Started', 'In Progress'].includes(order.status) && (
                    <input 
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleOrderSelect(order.id);
                      }}
                      style={{ 
                        width: '18px', 
                        height: '18px', 
                        accentColor: 'var(--status-teal)',
                        cursor: 'pointer'
                      }}
                    />
                  )}
                  <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>#{order.bidder}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>{order.customer}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '0.625rem', 
                    fontWeight: 900, 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '0.25rem',
                    background: order.status === 'Ready' ? 'rgba(13, 148, 136, 0.1)' : order.status === 'In Progress' ? 'rgba(245, 158, 11, 0.1)' : '#f1f5f9',
                    color: order.status === 'Ready' ? 'var(--status-teal)' : order.status === 'In Progress' ? 'var(--status-amber)' : 'var(--text-muted)',
                    border: '1px solid currentColor'
                  }}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Row 2: Appointment/Walk-in, Arrival indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {order.isWalkIn ? (
                    <span style={{ background: 'var(--status-red)', color: 'white', fontSize: '0.625rem', fontWeight: 900, padding: '0.25rem 0.6rem', borderRadius: '0.25rem' }}>WALK-IN</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700 }}>
                      <Clock size={12} /> {order.appointment}
                    </div>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.auction}</span>
                </div>
                {order.customerStatus === 'Checked In' && (
                  <span style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--status-green)', background: 'rgba(34, 197, 94, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '0.25rem' }}>
                    CHECKED IN ✓
                  </span>
                )}
              </div>

              {/* Row 3: Lot Badges (simplified) */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#f8fafc', border: '1px solid var(--border-color)', padding: '0.25rem 0.6rem', borderRadius: '0.25rem' }}>
                   {order.lots} Lot{order.lots !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#f8fafc', border: '1px solid var(--border-color)', padding: '0.25rem 0.6rem', borderRadius: '0.25rem' }}>
                   Live Order
                </span>
              </div>

              {/* Row 5: Open Order Button */}
              <button 
                onClick={() => onOpenOrder(order.id)}
                className="btn btn-primary" 
                style={{ width: '100%', background: 'var(--status-teal)', padding: '0.75rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                Open Order <ChevronRight size={18} />
              </button>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>No orders in queue for this auction run.</p>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedOrders.size > 0 && (
        <div 
          className="responsive-bulk-bar"
          style={{
            position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
            width: 'calc(100% - 4rem)', maxWidth: '1336px',
            background: '#1e293b', color: 'white',
            padding: '1.25rem 2rem', borderRadius: '1rem',
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            zIndex: 50, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
        }}>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedOrders.size} order(s) selected</span>
          <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
            <button 
              className="btn" 
              style={{ background: 'var(--status-amber)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', fontWeight: 700 }}
              onClick={handleStartBatchPrep}
            >
              Start Batch Prep
            </button>
            <button 
              className="btn" 
              style={{ background: 'var(--status-teal)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', fontWeight: 700 }}
              onClick={() => setIsBatchModalOpen(true)}
            >
              Print Combined Pick List
            </button>
            <X size={24} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.5)', alignSelf: 'center' }} onClick={() => setSelectedOrders(new Set())} />
          </div>
        </div>
      )}

      <BatchPickListModal 
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        selectedOrderIds={Array.from(selectedOrders)}
      />
    </div>
  );
};

export default PrepQueueTab;
