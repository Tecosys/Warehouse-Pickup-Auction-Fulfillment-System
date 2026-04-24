import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  MoreVertical, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Truck,
  MessageSquare,
  Clock,
  ExternalLink,
  History
} from 'lucide-react';
import AuctionRunDetail from './AuctionRunDetail';

const AuctionRunCard = ({ run, onOpen }: any) => (
  <div className="card" style={{ marginBottom: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
          {run.id}
        </span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{run.title}</h3>
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          padding: '2px 8px', 
          borderRadius: '4px', 
          background: run.status === 'ACTIVE' ? '#ccfbf1' : '#f1f5f9', 
          color: run.status === 'ACTIVE' ? '#0d9488' : '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
          {run.status}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => onOpen(run)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Open Run <ExternalLink size={16} />
        </button>
        <button className="btn"><MoreVertical size={18} /></button>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
      {[
        { label: 'ORDERS', val: run.stats.orders, color: 'var(--text-main)' },
        { label: 'FULFILLMENT', val: run.stats.fulfillment + '%', color: 'var(--status-teal)' },
        { label: 'CUSTOMERS', val: run.stats.customers, color: 'var(--status-blue)' },
        { label: 'SHIPPING', val: run.stats.shipping, color: 'var(--text-main)' },
        { label: 'ISSUES', val: run.stats.issues, color: run.stats.issues > 0 ? 'var(--status-red)' : 'var(--text-muted)' }
      ].map((stat, i) => (
        <div key={i} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.label}</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: stat.color }}>{stat.val}</div>
        </div>
      ))}
    </div>

    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8125rem', fontWeight: 500 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: run.pickup ? 'var(--status-teal)' : 'var(--text-muted)' }}>
        {run.pickup ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
        Pickup {run.pickup ? 'Enabled' : 'Disabled'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: run.shipping ? 'var(--status-teal)' : 'var(--text-muted)' }}>
        {run.shipping ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
        Shipping {run.shipping ? 'Enabled' : 'Disabled'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: run.notifications ? 'var(--status-teal)' : 'var(--text-muted)' }}>
        {run.notifications ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        Auto-Notifications
      </div>
    </div>
  </div>
);

const AuctionRunsPage = () => {
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('All Runs');

  const mockRuns = [
    {
      id: 'ID-2024-042',
      title: 'Spring Estate Collection #14',
      status: 'ACTIVE',
      stats: { orders: '1,248', fulfillment: 82, customers: '942', shipping: '412', issues: 3 },
      pickup: true,
      shipping: true,
      notifications: true,
      importedAt: '2024-04-24 10:30'
    },
    {
      id: 'ID-2024-041',
      title: 'Global Electronics Liquidation',
      status: 'ACTIVE',
      stats: { orders: '3,892', fulfillment: 24, customers: '2,105', shipping: '12', issues: 0 },
      pickup: false,
      shipping: true,
      notifications: true,
      importedAt: '2024-04-17 09:15'
    },
    {
      id: 'ID-2024-040',
      title: 'Collector Vehicle Event #2',
      status: 'ARCHIVED',
      stats: { orders: '512', fulfillment: 100, customers: '488', shipping: '488', issues: 12 },
      pickup: true,
      shipping: true,
      notifications: true,
      importedAt: '2024-04-10 14:00'
    }
  ];

  if (selectedRun) {
    return <AuctionRunDetail run={selectedRun} onBack={() => setSelectedRun(null)} />;
  }

  return (
    <div className="auction-runs">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Auction Runs</h1>
          <p style={{ color: 'var(--text-muted)' }}>All weekly auction cycles — active and archived</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by Run ID or Title..." 
              className="card"
              style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}
            />
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} />
            Create New Auction Run
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
        {['All Runs', 'Active', 'Archived'].map(tab => (
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

      <div className="runs-list">
        {mockRuns
          .filter(run => activeTab === 'All Runs' || (activeTab === 'Active' && run.status === 'ACTIVE') || (activeTab === 'Archived' && run.status === 'ARCHIVED'))
          .map(run => (
            <AuctionRunCard key={run.id} run={run} onOpen={setSelectedRun} />
          ))}
      </div>
    </div>
  );
};

export default AuctionRunsPage;
