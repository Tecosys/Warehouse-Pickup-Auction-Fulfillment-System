import { useState } from 'react';
import { Search, Filter, AlertTriangle, Plus } from 'lucide-react';
import CasesTable from './components/CasesTable';
import CaseDetailDrawer from './components/CaseDetailDrawer';
import ReturnIntakeTab from './tabs/ReturnIntakeTab';

export type CaseStatus = 'Open' | 'In Review' | 'Resolved';
export type CaseTab = 'All Cases' | 'Open' | 'In Review' | 'Resolved' | 'Return Intake';

const IssuesReturnsPage = () => {
  const [activeTab, setActiveTab] = useState<CaseTab>('All Cases');
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenCase = (caseData: any) => {
    setSelectedCase(caseData);
    setIsDrawerOpen(true);
  };

  return (
    <div className="issues-returns-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Issues / Returns</h1>
          <p style={{ color: 'var(--text-muted)' }}>Internal case management and return intake</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: 'var(--status-teal)' }}>
          <Plus size={20} />
          Open New Case
        </button>
      </div>

      <div className="tabs-container" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        {(['All Cases', 'Open', 'In Review', 'Resolved', 'Return Intake'] as CaseTab[]).map((tab) => (
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
        {activeTab !== 'Return Intake' ? (
          <>
            {/* Filter Bar */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 150px', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Search</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Bidder # or Customer..." 
                      style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Case Type</label>
                  <select style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}>
                    <option>All Types</option>
                    <option>Missing in Prep</option>
                    <option>Missing at Release</option>
                    <option>Customer Refused</option>
                    <option>Issue at Pickup</option>
                    <option>Returned Item</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Auction</label>
                  <select style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}>
                    <option>All Auctions</option>
                    <option>Auction 31</option>
                    <option>Auction 30</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Status</label>
                  <select style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}>
                    <option>All Statuses</option>
                    <option>Open</option>
                    <option>In Review</option>
                    <option>Resolved</option>
                  </select>
                </div>
                <button className="btn btn-primary" style={{ height: '42px', width: '100%' }}>
                  <Filter size={16} />
                  Filter
                </button>
              </div>
            </div>

            {/* Aging Alert */}
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
                  14 cases open over 24 hours — 2 cases open over 48 hours
                </span>
              </div>
              <button className="btn" style={{ border: 'none', background: 'none', color: 'var(--status-amber)', fontWeight: 700, textDecoration: 'underline' }}>
                View Aging
              </button>
            </div>

            {/* Main Table */}
            <CasesTable filterStatus={activeTab === 'All Cases' ? undefined : activeTab as CaseStatus} onOpenCase={handleOpenCase} />
          </>
        ) : (
          <ReturnIntakeTab />
        )}
      </div>

      <CaseDetailDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        caseData={selectedCase} 
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
