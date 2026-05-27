import { useState } from 'react';
import PrepQueueTab from './tabs/PrepQueueTab';
import OrderDetailTab from './tabs/OrderDetailTab';

export type FulfillmentTab = 'Queue' | 'Detail';

interface FulfillmentHubPageProps {
  user: any;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  selectedAuction?: any;
}

const FulfillmentHubPage: React.FC<FulfillmentHubPageProps> = ({ selectedAuction }) => {
  const [activeTab, setActiveTab] = useState<FulfillmentTab>('Queue');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleOpenOrder = (id: string) => {
    setSelectedOrderId(id);
    setActiveTab('Detail');
  };

  const handleBackToQueue = () => {
    setSelectedOrderId(null);
    setActiveTab('Queue');
  };

  return (
    <div className="fulfillment-hub" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {activeTab === 'Queue' ? (
        <PrepQueueTab onOpenOrder={handleOpenOrder} selectedAuction={selectedAuction} />
      ) : (
        <OrderDetailTab orderId={selectedOrderId} onBack={handleBackToQueue} />
      )}

      <style>{`
        .fulfillment-hub {
          background: #f9fafb;
          min-height: calc(100vh - var(--header-height));
        }
      `}</style>
    </div>
  );
};

export default FulfillmentHubPage;
