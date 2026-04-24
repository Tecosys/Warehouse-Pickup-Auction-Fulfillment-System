import React, { useState } from 'react';
import PrepQueueTab from './tabs/PrepQueueTab';
import OrderDetailTab from './tabs/OrderDetailTab';

export type FulfillmentTab = 'Queue' | 'Detail';

const FulfillmentHubPage = () => {
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
        <PrepQueueTab onOpenOrder={handleOpenOrder} />
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
