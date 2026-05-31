import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

const AuctionRunCard = ({ run, onOpen, onDelete }: any) => {
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!showMenu) return;
    const handleClose = () => setShowMenu(false);
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, [showMenu]);

  return (
    <div className="card" style={{ marginBottom: '1.5rem', position: 'relative' }}>
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
        <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
          <button onClick={() => onOpen(run)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Open Run <ExternalLink size={16} />
          </button>
          <button 
            className="btn" 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div className="card animate-fade-in" style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '4px',
              zIndex: 10,
              padding: '0.25rem 0',
              minWidth: '130px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
              background: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem'
            }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onDelete(run);
                }}
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  color: 'var(--status-red)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Delete Run
              </button>
            </div>
          )}
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
};

interface AuctionRunsPageProps {
  user: any;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigate?: (module: string) => void;
}

const AuctionRunsPage: React.FC<AuctionRunsPageProps> = ({ onNavigate, showToast }) => {
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('All Runs');
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [channelFilter, setChannelFilter] = useState('all');
  const [runToDelete, setRunToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!runToDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auctions/${runToDelete._id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (response.ok) {
        showToast?.('Auction run and all associated data deleted successfully.', 'success');
        setRuns(runs.filter(r => r._id !== runToDelete._id));
      } else {
        showToast?.(data.error || 'Failed to delete auction run.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast?.('An error occurred while deleting the auction run.', 'error');
    } finally {
      setDeleting(false);
      setRunToDelete(null);
    }
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auctions`)
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
          importedAt: new Date(r.importedDate).toLocaleString(),
          importedDate: r.importedDate
        }));
        setRuns(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (selectedRun) {
    return <AuctionRunDetail run={selectedRun} onBack={() => setSelectedRun(null)} />;
  }

  // Filter and Sort logic
  const filteredRuns = runs
    .filter(run => {
      // Tab status filter
      if (activeTab === 'Active' && run.status !== 'ACTIVE') return false;
      if (activeTab === 'Archived' && run.status !== 'ARCHIVED') return false;

      // Search Query filter (checks Run ID or Title)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchTitle = run.title?.toLowerCase().includes(query);
        const matchId = run.id?.toLowerCase().includes(query);
        if (!matchTitle && !matchId) return false;
      }

      // Channel filter
      if (channelFilter === 'pickup' && !run.pickup) return false;
      if (channelFilter === 'shipping' && !run.shipping) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.importedDate).getTime() - new Date(a.importedDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.importedDate).getTime() - new Date(b.importedDate).getTime();
      }
      if (sortBy === 'orders') {
        return b.stats.orders - a.stats.orders;
      }
      if (sortBy === 'fulfillment') {
        return b.stats.fulfillment - a.stats.fulfillment;
      }
      return 0;
    });

  return (
    <div className="auction-runs">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Auction Runs</h1>
          <p style={{ color: 'var(--text-muted)' }}>All weekly auction cycles — active and archived</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by Run ID or Title..." 
              className="card"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}
            />
          </div>

          <select 
            className="card"
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            style={{ padding: '0.625rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', border: '1px solid var(--border-color)', fontWeight: 600, cursor: 'pointer', background: 'white' }}
          >
            <option value="all">All Channels</option>
            <option value="pickup">Pickup Enabled</option>
            <option value="shipping">Shipping Enabled</option>
          </select>

          <select 
            className="card"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '0.625rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', border: '1px solid var(--border-color)', fontWeight: 600, cursor: 'pointer', background: 'white' }}
          >
            <option value="newest">Newest Imported</option>
            <option value="oldest">Oldest Imported</option>
            <option value="orders">Most Orders</option>
            <option value="fulfillment">Highest Fulfillment %</option>
          </select>

          <button 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => onNavigate?.('File Import')}
          >
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
        ) : filteredRuns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No matching auction runs found. Try adjusting your filters.</div>
        ) : filteredRuns.map(run => (
          <AuctionRunCard key={run._id} run={run} onOpen={setSelectedRun} onDelete={setRunToDelete} />
        ))}
      </div>

      {/* Confirmation Modal */}
      {runToDelete && createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1500,
          padding: '1.5rem',
          backdropFilter: 'blur(2px)'
        }}>
          <div className="card animate-slide" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
              Delete Auction Run?
            </h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{runToDelete.title} ({runToDelete.id})</strong>? 
              <br /><br />
              <div style={{ color: 'var(--status-red)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                <AlertCircle size={18} /> WARNING: This action is permanent and cannot be undone.
              </div>
              It will permanently delete:
              <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                <li>All associated orders ({runToDelete.stats.orders})</li>
                <li>All associated lot items</li>
                <li>All customer cases and issue reports</li>
                <li>All notification logs and related credits</li>
              </ul>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                onClick={() => setRunToDelete(null)} 
                className="btn" 
                disabled={deleting}
                style={{ fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete} 
                className="btn btn-primary"
                disabled={deleting}
                style={{ background: 'var(--status-red)', borderColor: 'var(--status-red)', fontWeight: 600 }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Run'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AuctionRunsPage;

