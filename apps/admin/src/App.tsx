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
import SettingsPage from './components/settings/SettingsPage';
import { ShieldCheck, Menu, CheckCircle2, AlertCircle, Info, User, LogOut } from 'lucide-react';
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

const FooterBar = ({ selectedAuction }: any) => (
  <footer className="footer-bar">
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>AUCTION STATS:</span>
        <span style={{ fontWeight: 600, color: 'var(--status-green)' }}>
          {selectedAuction ? `Auction ${selectedAuction.auctionNumber}` : 'Loading...'}
        </span>
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
  const [auctions, setAuctions] = useState<any[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<any>(null);

  useEffect(() => {
    document.title = user ? `Bid Boss - ${user.role}` : 'Bid Boss';
    if (!user) return;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auctions`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAuctions(data);
          const savedId = sessionStorage.getItem('bidboss_selected_auction_id');
          const found = data.find((a: any) => a._id === savedId);
          if (found) {
            setSelectedAuction(found);
          } else if (data.length > 0) {
            setSelectedAuction(data[0]);
            sessionStorage.setItem('bidboss_selected_auction_id', data[0]._id);
          }
        }
      })
      .catch(console.error);
  }, [user]);

  const handleAuctionChange = (auctionId: string) => {
    const found = auctions.find((a: any) => a._id === auctionId);
    if (found) {
      setSelectedAuction(found);
      sessionStorage.setItem('bidboss_selected_auction_id', auctionId);
      showToast(`Switched view to ${found.title}`, 'info');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigateToModule = (module: string) => {
    setCurrentModule(module);
    sessionStorage.setItem('bidboss_module', module);
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
    sessionStorage.removeItem('bidboss_selected_auction_id');
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    const moduleGating: Record<string, string[]> = {
      'Dashboard': ['Admin', 'Support'],
      'Auction Runs': ['Admin'],
      'File Import': ['Admin'],
      'Fulfillment Hub': ['Admin', 'Worker', 'Support'],
      'Slot Management': ['Admin', 'Clerk', 'Support'],
      'Batch Notifications': ['Admin', 'Support'],
      'Inventory Clerk': ['Admin', 'Clerk'],
      'Shipping': ['Admin', 'Support'],
      'Issues / Returns': ['Admin', 'Clerk', 'Support'],
      'Settings': ['Admin']
    };

    const allowedRoles = moduleGating[currentModule];
    if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
      return (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--status-red)' }}>
          <ShieldCheck size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.8, display: 'block' }} />
          <h2>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>You do not have permission to view the {currentModule} module.</p>
        </div>
      );
    }

    switch (currentModule) {
      case 'Dashboard':
        return <Dashboard selectedAuction={selectedAuction} user={user} />;
      case 'Auction Runs':
        return <AuctionRunsPage onNavigate={navigateToModule} user={user} showToast={showToast} />;
      case 'File Import':
        return <FileImportPage onNavigate={navigateToModule} user={user} showToast={showToast} />;
      case 'Slot Management':
        return <SlotManagementPage selectedAuction={selectedAuction} user={user} showToast={showToast} />;
      case 'Batch Notifications':
        return <NotificationsPage selectedAuction={selectedAuction} user={user} showToast={showToast} />;
      case 'Inventory Clerk':
        return <InventoryClerkPage selectedAuction={selectedAuction} user={user} showToast={showToast} onNavigate={navigateToModule} />;
      case 'Issues / Returns':
        return <IssuesReturnsPage selectedAuction={selectedAuction} user={user} showToast={showToast} />;
      case 'Shipping':
        return <ShippingPage selectedAuction={selectedAuction} user={user} showToast={showToast} />;
      case 'Fulfillment Hub':
        return <FulfillmentHubPage selectedAuction={selectedAuction} user={user} showToast={showToast} />;
      case 'Settings':
        return <SettingsPage user={user} showToast={showToast} />;
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
                {auctions.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auction Run:</span>
                    <select
                      value={selectedAuction?._id || ''}
                      onChange={e => handleAuctionChange(e.target.value)}
                      style={{
                        padding: '0.4rem 2rem 0.4rem 0.75rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        outline: 'none',
                        border: '1px solid var(--border-color)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-main)',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1rem',
                      }}
                    >
                      {auctions.map((auc: any) => (
                        <option key={auc._id} value={auc._id} style={{ background: '#1e293b', color: 'white' }}>
                          Run #{auc.auctionNumber} - {auc.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: 'var(--accent-color, #f1f5f9)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--status-teal)',
                  border: '2px solid rgba(13, 148, 136, 0.1)'
                }}>
                  <User size={20} />
                </div>
                <div className="desktop-only" style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.2' }}>{user?.name || 'Staff User'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{user?.title || user?.role}</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.5rem 0.75rem', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: 'none', 
                  color: 'var(--status-red)', 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              >
                <LogOut size={16} />
                <span className="desktop-only">Sign Out</span>
              </button>
            </div>
          </header>


        <main className="content animate-slide" key={currentModule}>
          {renderContent()}
        </main>

        <FooterBar selectedAuction={selectedAuction} />
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
