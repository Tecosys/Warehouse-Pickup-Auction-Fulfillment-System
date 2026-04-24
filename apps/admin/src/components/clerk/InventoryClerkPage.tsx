import { useState } from 'react';
import { Plus } from 'lucide-react';
import CheckInTab from './tabs/CheckInTab';
import OrderReleaseTab from './tabs/OrderReleaseTab';
import PartialReleaseTab from './tabs/PartialReleaseTab';
import WalkInOverrideModal from './modals/WalkInOverrideModal';
import ReleaseConfirmationModal from './modals/ReleaseConfirmationModal';

export type TabType = 'Check-in & Search' | 'Order Release' | 'Partial Release';

const InventoryClerkPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Check-in & Search');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'full' | 'partial'>('full');

  const handleOpenRelease = (order: any) => {
    setSelectedOrder(order);
    setActiveTab('Order Release');
  };

  const handleReviewWithheld = () => {
    setActiveTab('Partial Release');
  };

  return (
    <div className="inventory-clerk-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Inventory Clerk</h1>
          <p style={{ color: 'var(--text-muted)' }}>Customer check-in and order release</p>
        </div>
        <button 
          onClick={() => setIsWalkInModalOpen(true)}
          className="btn btn-primary" 
          style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', background: 'var(--status-teal)' }}
        >
          <Plus size={20} />
          Walk-in Override
        </button>
      </div>

      <div className="tabs-container" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        {(['Check-in & Search', 'Order Release', 'Partial Release'] as TabType[]).map((tab) => (
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
        {activeTab === 'Check-in & Search' && <CheckInTab onOpenRelease={handleOpenRelease} />}
        {activeTab === 'Order Release' && (
          <OrderReleaseTab 
            order={selectedOrder} 
            onReviewWithheld={handleReviewWithheld} 
            onBack={() => setActiveTab('Check-in & Search')}
            onComplete={() => {
              setConfirmType('full');
              setIsConfirmModalOpen(true);
            }}
          />
        )}
        {activeTab === 'Partial Release' && (
          <PartialReleaseTab 
            order={selectedOrder} 
            onBack={() => setActiveTab('Order Release')}
            onComplete={() => {
              setConfirmType('partial');
              setIsConfirmModalOpen(true);
            }}
          />
        )}
      </div>

      <WalkInOverrideModal 
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        onConfirm={(order) => {
          setIsWalkInModalOpen(false);
          handleOpenRelease(order);
        }}
      />

      <ReleaseConfirmationModal
        isOpen={isConfirmModalOpen}
        type={confirmType}
        order={selectedOrder}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setActiveTab('Check-in & Search');
          setSelectedOrder(null);
        }}
      />

      <style>{`
        .inventory-clerk-container {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        
        .badge-teal { background: rgba(13, 148, 136, 0.1); color: var(--status-teal); }
        .badge-amber { background: rgba(245, 158, 11, 0.1); color: var(--status-amber); }
        .badge-blue { background: rgba(59, 130, 246, 0.1); color: var(--status-blue); }
        .badge-red { background: rgba(239, 68, 68, 0.1); color: var(--status-red); }
        .badge-gray { background: rgba(148, 163, 184, 0.1); color: var(--status-gray); }
        
        .info-box {
          padding: 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }
        
        .info-box-amber {
          background: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: #92400e;
        }
        
        .sticky-action-bar {
          position: fixed;
          bottom: var(--footer-height);
          left: var(--sidebar-width);
          right: 0;
          background: white;
          border-top: 1px solid var(--border-color);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
          z-index: 100;
        }
      `}</style>
    </div>
  );
};

export default InventoryClerkPage;
