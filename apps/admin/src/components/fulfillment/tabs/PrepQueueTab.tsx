import React, { useState } from 'react';
import { Package, ChevronRight, Clock, AlertTriangle, CheckCircle2, MoreVertical, LayoutGrid, List } from 'lucide-react';

const MOCK_ORDERS = [
  { id: 'ORD-8821', bidder: '8821', customer: 'Sarah O\'Connor', status: 'In Progress', customerStatus: 'Checked In', isWalkIn: true, appointment: 'WALK-IN', lots: 12, puCount: 8, binCount: 4, storageRange: 'A2–B06', auction: 'Auction 31' },
  { id: 'ORD-4582', bidder: '4582', customer: 'Marcus Sterling', status: 'Not Started', customerStatus: 'Booked', isWalkIn: false, appointment: 'Thu 2:30 PM', lots: 6, puCount: 4, binCount: 2, storageRange: 'C4', auction: 'Auction 31' },
  { id: 'ORD-2102', bidder: '2102', customer: 'Katherine Chen', status: 'Ready', customerStatus: 'Checked In', isWalkIn: false, appointment: 'Thu 11:30 AM', lots: 1, puCount: 1, binCount: 0, storageRange: 'X01', auction: 'Auction 31', flagged: true },
];

interface PrepQueueTabProps {
  onOpenOrder: (id: string) => void;
}

const PrepQueueTab: React.FC<PrepQueueTabProps> = ({ onOpenOrder }) => {
  const [filter, setFilter] = useState('All');

  return (
    <div className="animate-fade" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Auction Context */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ background: '#e2e8f0', padding: '0.625rem 1.25rem', borderRadius: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
          <LayoutGrid size={16} />
          Auction 31 — Modernist Estates
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select className="card" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, outline: 'none' }}>
            <option>Sort by: Appointment Priority</option>
            <option>Sort by: Source Location</option>
            <option>Sort by: Total Lots (High-Low)</option>
          </select>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'In Queue', val: '12', color: 'var(--text-muted)' },
          { label: 'In Progress', val: '4', color: 'var(--status-amber)' },
          { label: 'Ready Today', val: '28', color: 'var(--status-teal)' }
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }} className="no-scrollbar">
        {['All', 'Sort Only (BIN)', 'Non-Sort (PU)', 'Mixed', 'Walk-in'].map(f => (
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {MOCK_ORDERS.length > 0 ? (
          MOCK_ORDERS.map(order => (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
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
                  {order.flagged && <AlertTriangle size={16} color="var(--status-red)" style={{ marginLeft: '-0.25rem' }} />}
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

              {/* Row 3: Lot Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#f8fafc', border: '1px solid var(--border-color)', padding: '0.25rem 0.6rem', borderRadius: '0.25rem' }}>
                  {order.lots} Lots
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', background: 'rgba(99, 102, 241, 0.05)', padding: '0.25rem 0.6rem', borderRadius: '0.25rem' }}>
                  {order.puCount} PU
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-teal)', background: 'rgba(13, 148, 136, 0.05)', padding: '0.25rem 0.6rem', borderRadius: '0.25rem' }}>
                  {order.binCount} BIN
                </span>
              </div>

              {/* Row 4: Storage Range */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                  Storage: {order.storageRange}
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
    </div>
  );
};

export default PrepQueueTab;
