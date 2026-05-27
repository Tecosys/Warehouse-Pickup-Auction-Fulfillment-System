import { useState } from 'react';
import { Package, Truck, CheckCircle2, ChevronDown } from 'lucide-react';
import InQueueTab from './tabs/InQueueTab';
import PreparedTab from './tabs/PreparedTab';
import DispatchedTab from './tabs/DispatchedTab';

export type ShippingTab = 'In Queue' | 'Prepared for Shipping' | 'Dispatched';

interface ShippingPageProps {
  selectedAuction?: any;
  user: any;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ShippingPage: React.FC<ShippingPageProps> = ({ selectedAuction }) => {
  const [activeTab, setActiveTab] = useState<ShippingTab>('In Queue');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [prepareTrigger, setPrepareTrigger] = useState(0);

  const handleTabChange = (tab: ShippingTab) => {
    setActiveTab(tab);
    setSelectedOrders(new Set());
  };

  return (
    <div className="shipping-container">
      {/* Context Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Shipping</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage orders selected for shipping and coordinate dispatch.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Auction Run</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {selectedAuction ? `Run #${selectedAuction.auctionNumber} - ${selectedAuction.title}` : 'No Auction Selected'}
              <ChevronDown size={16} />
            </div>
          </div>
          {activeTab === 'In Queue' && (
            <button 
              className="btn btn-primary" 
              disabled={selectedOrders.size === 0}
              onClick={() => setPrepareTrigger(prev => prev + 1)}
              style={{ 
                padding: '0.75rem 1.5rem', 
                background: 'var(--status-teal)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                opacity: selectedOrders.size === 0 ? 0.6 : 1,
                cursor: selectedOrders.size === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <CheckCircle2 size={18} />
              Mark as Prepared {selectedOrders.size > 0 ? `(${selectedOrders.size})` : ''}
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Pending Queue', value: '142', icon: <Package size={24} />, color: 'var(--status-amber)' },
          { label: 'Ready to Label', value: '58', icon: <Package size={24} />, color: 'var(--status-blue)' },
          { label: 'Today\'s Dispatched', value: '324', icon: <Truck size={24} />, color: 'var(--status-green)' }
        ].map((stat, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '1rem', 
              background: `rgba(${stat.color === 'var(--status-amber)' ? '245, 158, 11' : stat.color === 'var(--status-blue)' ? '59, 130, 246' : '34, 197, 94'}, 0.1)`, 
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{stat.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        {(['In Queue', 'Prepared for Shipping', 'Dispatched'] as ShippingTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
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
              marginRight: '0.5rem',
              marginBottom: '-1px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content animate-slide">
        {activeTab === 'In Queue' && (
          <InQueueTab 
            selectedAuction={selectedAuction}
            selectedOrders={selectedOrders} 
            setSelectedOrders={setSelectedOrders} 
            triggerPrepare={prepareTrigger} 
          />
        )}
        {activeTab === 'Prepared for Shipping' && <PreparedTab selectedAuction={selectedAuction} />}
        {activeTab === 'Dispatched' && <DispatchedTab selectedAuction={selectedAuction} />}
      </div>

      <style>{`
        .shipping-container {
          max-width: 1400px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
};

export default ShippingPage;
