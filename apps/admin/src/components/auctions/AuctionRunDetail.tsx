import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  ChevronRight, 
  Search, 
  Filter,
  Download,
  MoreVertical,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

const OrdersTab = () => (
  <div style={{ padding: '1rem 0' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
      <div style={{ position: 'relative', width: '300px' }}>
        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search orders..." className="card" style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', fontSize: '0.875rem' }} />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Filter size={16} /> Filter
        </button>
        <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Download size={16} /> Export
        </button>
      </div>
    </div>

    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
          <th style={{ padding: '1rem' }}>BIDDER #</th>
          <th style={{ padding: '1rem' }}>CUSTOMER NAME</th>
          <th style={{ padding: '1rem' }}>LOTS</th>
          <th style={{ padding: '1rem' }}>FULFILLMENT</th>
          <th style={{ padding: '1rem' }}>CUSTOMER STATUS</th>
          <th style={{ padding: '1rem' }}>APPOINTMENT</th>
          <th style={{ padding: '1rem' }}>ACTION</th>
        </tr>
      </thead>
      <tbody>
        {[
          { bidder: '8221', name: 'David Miller', lots: 12, fStatus: 'Ready', cStatus: 'Checked In', appt: 'Today 14:15', flagged: true },
          { bidder: '8442', name: 'Elena Kostic', lots: 3, fStatus: 'In Progress', cStatus: 'Booked', appt: 'Today 14:30' },
          { bidder: '9012', name: 'Robert Fox', lots: 7, fStatus: 'Not Started', cStatus: 'Awaiting Choice', appt: '-' },
          { bidder: '7823', name: 'Sarah Jenkins', lots: 1, fStatus: 'Ready', cStatus: 'Picked Up', appt: 'Yesterday' },
        ].map((order, i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
            <td style={{ padding: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>{order.bidder}</td>
            <td style={{ padding: '1rem' }}>{order.name}</td>
            <td style={{ padding: '1rem' }}>{order.lots}</td>
            <td style={{ padding: '1rem' }}>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                background: order.fStatus === 'Ready' ? '#ccfbf1' : order.fStatus === 'In Progress' ? '#fef3c7' : '#f1f5f9',
                color: order.fStatus === 'Ready' ? '#0d9488' : order.fStatus === 'In Progress' ? '#92400e' : '#64748b',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {order.fStatus}
                {order.flagged && <AlertTriangle size={14} style={{ color: 'var(--status-red)' }} />}
              </span>
            </td>
            <td style={{ padding: '1rem' }}>{order.cStatus}</td>
            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{order.appt}</td>
            <td style={{ padding: '1rem' }}>
              <button className="btn" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Open Order</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AuctionRunDetail = ({ run, onBack }: any) => {
  const [activeTab, setActiveTab] = useState('Orders');
  const tabs = ['Orders', 'Bookings', 'Notifications', 'Shipping', 'Issues'];

  return (
    <div className="auction-run-detail">
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--status-teal)', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to All Auction Runs
      </button>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{run.title}</h2>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                padding: '2px 8px', 
                borderRadius: '4px', 
                background: run.status === 'ACTIVE' ? '#ccfbf1' : '#f1f5f9', 
                color: run.status === 'ACTIVE' ? '#0d9488' : '#64748b'
              }}>
                {run.status}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem' }}>
              <span>Run ID: {run.id}</span>
              <span>Imported: {run.importedAt}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Pickup Window</span>
              <div style={{ width: '40px', height: '20px', borderRadius: '10px', background: 'var(--status-teal)', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', right: '2px', top: '2px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Shipping</span>
              <div style={{ width: '40px', height: '20px', borderRadius: '10px', background: 'var(--status-teal)', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', right: '2px', top: '2px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '0.75rem 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === tab ? '2px solid var(--status-teal)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--status-teal)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'Orders' && <OrdersTab />}
        {activeTab !== 'Orders' && (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3 style={{ marginBottom: '1rem' }}>{activeTab} Table Placeholder</h3>
            <p>This section will contain the {activeTab} data for this auction run.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionRunDetail;
