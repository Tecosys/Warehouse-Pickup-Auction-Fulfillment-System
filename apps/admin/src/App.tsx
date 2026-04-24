import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import AuctionRunsPage from './components/auctions/AuctionRunsPage';
import FileImportPage from './components/import/FileImportPage';
import SlotManagementPage from './components/slots/SlotManagementPage';
import NotificationsPage from './components/notifications/NotificationsPage';
import InventoryClerkPage from './components/clerk/InventoryClerkPage';
import IssuesReturnsPage from './components/issues/IssuesReturnsPage';
import ShippingPage from './components/shipping/ShippingPage';
import FulfillmentHubPage from './components/fulfillment/FulfillmentHubPage';
import { Activity, Users, ShieldCheck } from 'lucide-react';

const FooterBar = () => (
  <footer className="footer-bar">
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>AUCTION STATS:</span>
        <span style={{ fontWeight: 600, color: 'var(--status-green)' }}>Auction 31</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>TOTAL VALUE:</span>
        <span style={{ fontWeight: 600 }}>$1,420,950.00</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>SETTLED:</span>
        <span style={{ fontWeight: 600, color: 'var(--status-green)' }}>92%</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>ACTIVE USERS:</span>
        <span style={{ fontWeight: 600 }}>142</span>
      </div>
    </div>
    
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <div className="status-dot" style={{ background: 'var(--status-green)', width: '6px', height: '6px' }}></div>
      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>SYSTEMS NOMINAL</span>
    </div>
  </footer>
);

import LoginPage from './components/auth/LoginPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentModule, setCurrentModule] = useState('Dashboard');

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (currentModule) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Auction Runs':
        return <AuctionRunsPage />;
      case 'File Import':
        return <FileImportPage onNavigate={setCurrentModule} />;
      case 'Slot Management':
        return <SlotManagementPage />;
      case 'Batch Notifications':
        return <NotificationsPage />;
      case 'Inventory Clerk':
        return <InventoryClerkPage />;
      case 'Issues / Returns':
        return <IssuesReturnsPage />;
      case 'Shipping':
        return <ShippingPage />;
      case 'Fulfillment Hub':
        return <FulfillmentHubPage />;
      default:
        return (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h2>{currentModule}</h2>
            <p>Module implementation in progress...</p>
          </div>
        );
    }
  };

  return (
    <>
      <Sidebar 
        activeModule={currentModule} 
        onModuleChange={setCurrentModule} 
        onLogout={() => setIsAuthenticated(false)}
      />
      <div className="main-layout">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Activity size={18} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>System Load: 12%</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Users size={18} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Workers: 8 Active</span>
            </div>
            <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }} />
            <button 
              className="btn" 
              style={{ border: 'none', padding: '0.25rem' }}
              onClick={() => setIsAuthenticated(false)}
              title="Log Out"
            >
              <ShieldCheck size={20} color="var(--status-teal)" />
            </button>
          </div>
        </header>

        <main className="content animate-slide" key={currentModule}>
          {renderContent()}
        </main>

        <FooterBar />
      </div>
    </>
  );
}

export default App;
