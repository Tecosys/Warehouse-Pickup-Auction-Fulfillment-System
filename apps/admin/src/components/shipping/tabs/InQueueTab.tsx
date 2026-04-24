import React, { useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';

const MOCK_ORDERS = [
  { id: '#BB-88219', bidderNum: '1042', customer: 'Elena Wright', items: 4, source: 'BIDBOSS LIVE', date: 'Mar 08, 2024' },
  { id: '#BB-88220', bidderNum: '559', customer: 'Julian Mendez', items: 12, source: 'EXTERNAL API', date: 'Mar 08, 2024' },
  { id: '#BB-88221', bidderNum: '2102', customer: 'Katherine Chen', items: 1, source: 'BIDBOSS LIVE', date: 'Mar 07, 2024' },
  { id: '#BB-88222', bidderNum: '88', customer: 'Robert Baxter', items: 7, source: 'PHONE BID', date: 'Mar 07, 2024' },
  { id: '#BB-88223', bidderNum: '441', customer: 'Sarah Lodge', items: 3, source: 'BIDBOSS LIVE', date: 'Mar 08, 2024' },
];

const InQueueTab = () => {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const next = new Set(selectedOrders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOrders(next);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === MOCK_ORDERS.length) setSelectedOrders(new Set());
    else setSelectedOrders(new Set(MOCK_ORDERS.map(o => o.id)));
  };

  return (
    <div className="animate-fade">
      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by order, bidder, or customer..." 
              style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '40px', height: '20px', background: 'var(--border-color)', borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }} />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Show Unassigned Only</span>
          </div>
        </div>
        
        {selectedOrders.size > 0 && (
          <button className="btn" style={{ background: 'var(--status-teal)', color: 'white', border: 'none', padding: '0.625rem 1.25rem' }}>
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
                  checked={selectedOrders.size === MOCK_ORDERS.length}
                  onChange={toggleSelectAll}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--status-teal)' }}
                />
              </th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order ID</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bidder #</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lots</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Source</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
              <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ORDERS.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedOrders.has(order.id)}
                    onChange={() => toggleSelect(order.id)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--status-teal)' }}
                  />
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--status-teal)' }}>{order.id}</td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700 }}>{order.bidderNum}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {order.customer.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span style={{ fontWeight: 600 }}>{order.customer}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>{order.items} items</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    fontSize: '0.625rem', 
                    fontWeight: 900, 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '1rem', 
                    background: order.source === 'BIDBOSS LIVE' ? 'rgba(59, 130, 246, 0.1)' : order.source === 'EXTERNAL API' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: order.source === 'BIDBOSS LIVE' ? 'var(--status-blue)' : order.source === 'EXTERNAL API' ? '#a855f7' : 'var(--status-amber)',
                    border: '1px solid currentColor'
                  }}>
                    {order.source}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{order.date}</td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <button className="btn" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <CheckCircle2 size={20} />
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

export default InQueueTab;
