import { useState } from 'react';
import { Search, Clock } from 'lucide-react';

const MOCK_CHECKED_IN = [
  { id: '1', bidderNum: '#4492', customer: 'Dominic Santoro', items: 14, total: '$1,240.00', slot: '10:15 AM', status: 'LATE', fulfillment: 'Ready', customerStatus: 'Checked In' },
  { id: '2', bidderNum: '#9102', customer: 'Sarah McAllister', items: 3, total: '$425.00', slot: '10:45 AM', fulfillment: 'Ready', customerStatus: 'Checked In' },
  { id: '3', bidderNum: '#2231', customer: 'Robert J. Vance', items: 32, total: '$8,910.00', slot: '11:00 AM', fulfillment: 'Ready', customerStatus: 'Checked In' },
];

const MOCK_AWAITING = [
  { id: '4', bidderNum: '#5512', customer: 'Elena Rodriguez', items: 6, status: 'Unpaid', slot: '11:15 AM', fulfillment: 'Ready', customerStatus: 'Booked' },
  { id: '5', bidderNum: '#3381', customer: 'Kevin O\'Shea', items: 1, status: 'Paid', slot: '11:30 AM', fulfillment: 'Ready', customerStatus: 'Booked' },
  { id: '6', bidderNum: '#8827', customer: 'Linda Wu-Stevens', items: 19, status: 'Paid', slot: '11:30 AM', fulfillment: 'Ready', customerStatus: 'Booked' },
];

interface CheckInTabProps {
  onOpenRelease: (order: any) => void;
}

const CheckInTab: React.FC<CheckInTabProps> = ({ onOpenRelease }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="animate-fade">
      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={20} 
              style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input
              type="text"
              placeholder="Search by customer name, bidder number, or booking code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3.5rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-color)',
                fontSize: '1.125rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--status-teal)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>
          <button className="btn btn-primary" style={{ padding: '0 2.5rem', borderRadius: '0.75rem', fontSize: '1.125rem' }}>
            Search
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filter By:</span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['Today\'s Slot', 'VIP Bidders', 'Past Due Only', 'Palletized Orders'].map(filter => (
              <button key={filter} className="btn" style={{ fontSize: '0.875rem', borderRadius: '2rem', padding: '0.4rem 1.25rem' }}>
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Checked In Section */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: 'var(--status-teal)' }}>
                <Clock size={20} />
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Checked-in Today</h2>
            </div>
            <span className="badge badge-teal">12 ACTIVE</span>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bidder #</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Slot</th>
                <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CHECKED_IN.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, fontSize: '1.125rem' }}>{order.bidderNum}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{order.customer}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.items} Items • {order.total}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem', 
                      background: order.status === 'LATE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: order.status === 'LATE' ? 'var(--status-red)' : 'var(--status-green)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'inline-block'
                    }}>
                      {order.slot} {order.status && `(${order.status})`}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => onOpenRelease(order)}
                      className="btn" 
                      style={{ 
                        background: 'var(--status-teal)', 
                        color: 'white', 
                        border: 'none',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      Open Release
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Awaiting Arrival Section */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: 'var(--text-muted)' }}>
                <Clock size={20} />
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Awaiting Arrival Today</h2>
            </div>
            <span className="badge badge-gray">28 REMAINING</span>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bidder #</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Time</th>
                <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_AWAITING.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>{order.bidderNum}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{order.customer}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.items} Items • {order.status}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{order.slot}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <button className="btn" style={{ padding: '0.5rem 1.5rem' }}>
                      Check In
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
            <button className="btn" style={{ border: 'none', background: 'none', color: 'var(--status-teal)', fontSize: '0.875rem' }}>
              View All 28 Scheduled Arrivals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInTab;
