import { useState, useEffect } from 'react';
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
import { ShieldCheck, Menu, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import LoginPage from './components/auth/LoginPage';

// Global Toast System
const Toast = ({ message, type, onClose }: any) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {type === 'success' && <CheckCircle2 size={18} color="var(--status-teal)" />}
      {type === 'error' && <AlertCircle size={18} color="var(--status-red)" />}
      {type === 'info' && <Info size={18} color="var(--status-amber)" />}
      <span>{message}</span>
    </div>
  );
};

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
      <div style={{ gap: '0.5rem', alignItems: 'center', display: 'none' }}>
        {/* Hide complex stats on small screens or keep them hidden for clean UI */}
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>SETTLED:</span>
        <span style={{ fontWeight: 600, color: 'var(--status-green)' }}>92%</span>
      </div>
    </div>
    
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <div className="status-dot" style={{ background: 'var(--status-green)', width: '6px', height: '6px' }}></div>
      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}>SYSTEMS NOMINAL</span>
    </div>
  </footer>
);

function App() {
  const [user, setUser] = useState<{ role: string; name: string; title: string } | null>(() => {
    const savedUser = sessionStorage.getItem('bidboss_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentModule, setCurrentModule] = useState(() => {
    return sessionStorage.getItem('bidboss_module') || 'Dashboard';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogin = (userData: { role: string; name: string; title: string }) => {
    sessionStorage.setItem('bidboss_user', JSON.stringify(userData));
    setUser(userData);
    
    // Set initial module based on role
    let initialModule = 'Dashboard';
    if (userData.role === 'Worker') {
      initialModule = 'Fulfillment Hub';
    } else if (userData.role === 'Clerk') {
      initialModule = 'Inventory Clerk';
    }
    
    setCurrentModule(initialModule);
    sessionStorage.setItem('bidboss_module', initialModule);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bidboss_user');
    sessionStorage.removeItem('bidboss_module');
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {

    switch (currentModule) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Auction Runs':
        return <AuctionRunsPage user={user} showToast={showToast} />;
      case 'File Import':
        return <FileImportPage onNavigate={setCurrentModule} user={user} showToast={showToast} />;
      case 'Slot Management':
        return <SlotManagementPage user={user} showToast={showToast} />;
      case 'Batch Notifications':
        return <NotificationsPage user={user} showToast={showToast} />;
      case 'Inventory Clerk':
        return <InventoryClerkPage user={user} showToast={showToast} />;
      case 'Issues / Returns':
        return <IssuesReturnsPage user={user} showToast={showToast} />;
      case 'Shipping':
        return <ShippingPage user={user} showToast={showToast} />;
      case 'Fulfillment Hub':
        return <FulfillmentHubPage user={user} showToast={showToast} />;
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
      <div 
        className={`mobile-overlay ${isSidebarOpen ? 'visible' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeModule={currentModule} 
        user={user}
        onModuleChange={(module: string) => {
          setCurrentModule(module);
          sessionStorage.setItem('bidboss_module', module);
          setIsSidebarOpen(false); // Close sidebar on mobile after selection
        }} 
        onLogout={handleLogout}
      />
        
        <div className="main-layout">
          <header className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                className="btn mobile-only" 
                style={{ display: 'none', border: 'none', padding: '0.5rem' }} 
                onClick={() => setIsSidebarOpen(true)}
                id="hamburger-menu"
              >
                <Menu size={24} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-green)' }}>
                  <div className="status-dot pulse" style={{ background: 'var(--status-green)' }}></div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Warehouse Status: {user.role} Portal</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <button 
                className="btn" 
                style={{ border: 'none', padding: '0.25rem' }}
                onClick={handleLogout}
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

      <div className="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-only { display: flex !important; }
          .desktop-only { display: none !important; }
          .header { justify-content: space-between; }
        }
      `}</style>
    </>
  );
}

export default App;
