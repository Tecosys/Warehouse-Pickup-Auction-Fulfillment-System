import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ExternalLink
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

interface AuctionRunsPageProps {
  user: any;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AuctionRunsPage: React.FC<AuctionRunsPageProps> = () => {
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('All Runs');
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/auctions')
      .then(r => r.json())
      .then(data => {
        // Normalize to UI format
        const mapped = data.map((r: any) => ({
          id: `#${r.auctionNumber}`,
          _id: r._id,
          title: r.title,
          status: r.status === 'Active' ? 'ACTIVE' : 'ARCHIVED',
          stats: {
            orders: r.stats?.totalOrders || 0,
            fulfillment: r.stats?.readyCount || 0,
            customers: r.stats?.customersBooked || 0,
            shipping: r.stats?.shippingInQueue || 0,
            issues: r.stats?.openCases || 0
          },
          pickup: true,
          shipping: true,
          notifications: true,
          importedAt: new Date(r.importedDate).toLocaleString()
        }));
        setRuns(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading auction runs...</div>
        ) : runs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No auction runs found. Import your first run using File Import.</div>
        ) : runs
          .filter(run => activeTab === 'All Runs' || (activeTab === 'Active' && run.status === 'ACTIVE') || (activeTab === 'Archived' && run.status === 'ARCHIVED'))
          .map(run => (
            <AuctionRunCard key={run._id} run={run} onOpen={setSelectedRun} />
          ))}
      </div>
    </div>
  );
};

export default AuctionRunsPage;

