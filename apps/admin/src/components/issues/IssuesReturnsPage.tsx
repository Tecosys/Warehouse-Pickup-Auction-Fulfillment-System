import { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, Plus } from 'lucide-react';
import CasesTable from './components/CasesTable';
import CaseDetailDrawer from './components/CaseDetailDrawer';
import ReturnIntakeTab from './tabs/ReturnIntakeTab';
import CreditsLedgerTab from './tabs/CreditsLedgerTab';
import { OpenCaseModal } from './components/OpenCaseModal';

export type CaseStatus = 'Open' | 'In Review' | 'Resolved';
export type CaseTab = 'All Cases' | 'Open' | 'In Review' | 'Resolved' | 'Return Intake' | 'Store Credits';

interface IssuesReturnsPageProps {
  selectedAuction?: any;
  user: any;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const IssuesReturnsPage: React.FC<IssuesReturnsPageProps> = ({ selectedAuction, user }) => {
  const [activeTab, setActiveTab] = useState<CaseTab>(() => {
    return user?.role === 'Clerk' ? 'Return Intake' : 'All Cases';
  });
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    type: 'All Types',
    auctionId: selectedAuction?._id || 'All Auctions'
  });

  const [auctions, setAuctions] = useState<any[]>([]);
  const [stats, setStats] = useState({ over24h: 0, over48h: 0 });

  useEffect(() => {
    // Fetch auctions for filter
    fetch('http://localhost:5000/api/auctions')
      .then(res => res.json())
      .then(data => setAuctions(data))
      .catch(console.error);

    // Fetch aging stats
    fetch('http://localhost:5000/api/cases/stats/aging')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      auctionId: selectedAuction?._id || 'All Auctions'
    }));
  }, [selectedAuction?._id]);

  const handleOpenCase = (caseData: any) => {
    setSelectedCase(caseData);
    setIsDrawerOpen(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const tabs = user?.role === 'Clerk'
    ? (['Return Intake'] as CaseTab[])
    : (['All Cases', 'Open', 'In Review', 'Resolved', 'Return Intake', 'Store Credits'] as CaseTab[]);

  return (
    <div className="issues-returns-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Issues / Returns</h1>
          <p style={{ color: 'var(--text-muted)' }}>Internal case management and return intake</p>
        </div>
        {user?.role !== 'Clerk' && (
          <button 
            className="btn btn-primary" 
            onClick={() => setIsNewCaseModalOpen(true)}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: 'var(--status-teal)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={20} />
            Open New Case
          </button>
        )}
      </div>

      <div className="tabs-container" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '1rem 0.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              color: activeTab === tab ? 'var(--status-teal)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '3px solid var(--status-teal)' : '3px solid transparent',
              transition: 'all 0.2s',
              marginBottom: '-1px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content animate-slide">
        {activeTab === 'Store Credits' ? (
          <CreditsLedgerTab />
        ) : activeTab === 'Return Intake' ? (
          <ReturnIntakeTab />
        ) : (
          <>
            {/* Filter Bar */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Search</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Bidder #, Case # or Customer..." 
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Case Type</label>
                  <select 
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                  >
                    <option>All Types</option>
                    <option>Missing in Prep</option>
                    <option>Missing at Release</option>
                    <option>Refused</option>
                    <option>Issue</option>
                    <option>Return</option>
                    <option>Dispute</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Auction</label>
                  <select 
                    value={filters.auctionId}
                    onChange={(e) => handleFilterChange('auctionId', e.target.value)}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                  >
                    <option>All Auctions</option>
                    {auctions.map(a => (
                      <option key={a._id} value={a._id}>{a.title || `Auction #${a.auctionNumber}`}</option>
                    ))}
                  </select>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ height: '42px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
                  onClick={() => setFilters({ search: '', type: 'All Types', auctionId: selectedAuction?._id || 'All Auctions' })}
                >
                  <Filter size={16} />
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Aging Alert */}
            {(stats.over24h > 0 || stats.over48h > 0) && (
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.05)', 
                border: '1px solid rgba(245, 158, 11, 0.2)', 
                padding: '1rem 1.5rem', 
                borderRadius: '0.75rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertTriangle size={20} color="var(--status-amber)" />
                  <span style={{ fontWeight: 600, color: '#92400e' }}>
                    {stats.over24h} cases open over 24 hours {stats.over48h > 0 && `— ${stats.over48h} cases open over 48 hours`}
                  </span>
                </div>
                <button className="btn" style={{ border: 'none', background: 'none', color: 'var(--status-amber)', fontWeight: 700, textDecoration: 'underline' }}>
                  View Aging
                </button>
              </div>
            )}

            {/* Main Table */}
            <CasesTable 
              filterStatus={['All Cases', 'Return Intake', 'Store Credits'].includes(activeTab) ? undefined : activeTab as any} 
              onOpenCase={handleOpenCase}
              filters={filters}
            />
          </>
        )}
      </div>

      <CaseDetailDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        caseData={selectedCase} 
        user={user}
        onUpdate={() => {
          // Trigger refresh if needed
          setFilters({...filters});
        }}
      />

      <OpenCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        onSave={() => setFilters({ ...filters })}
      />

      <style>{`
        .issues-returns-container {
          max-width: 1400px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
};

export default IssuesReturnsPage;
