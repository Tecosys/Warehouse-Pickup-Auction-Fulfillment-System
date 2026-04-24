import { 
  LayoutDashboard, 
  Gavel, 
  FileUp, 
  Layout, 
  Settings2, 
  Bell, 
  ClipboardList, 
  Truck, 
  AlertCircle,
  LogOut
} from 'lucide-react';

const Sidebar = ({ activeModule, onModuleChange, onLogout }: any) => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { icon: <Gavel size={20} />, label: 'Auction Runs' },
    { icon: <FileUp size={20} />, label: 'File Import' },
    { icon: <ClipboardList size={20} />, label: 'Fulfillment Hub' },
    { icon: <Settings2 size={20} />, label: 'Slot Management' },
    { icon: <Bell size={20} />, label: 'Batch Notifications' },
    { icon: <ClipboardList size={20} />, label: 'Inventory Clerk' },
    { icon: <Truck size={20} />, label: 'Shipping' },
    { icon: <AlertCircle size={20} />, label: 'Issues / Returns' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/Logo.png" alt="BidBoss Logo" style={{ height: '32px', width: 'auto' }} />
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <button 
            key={index} 
            onClick={() => onModuleChange(item.label)} 
            className={`nav-item ${activeModule === item.label ? 'active' : ''}`}
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Marcus V.</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Floor Manager</div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            width: '100%', 
            padding: '0.5rem', 
            background: 'none', 
            border: 'none', 
            color: 'var(--status-red)', 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            cursor: 'pointer',
            borderRadius: '0.5rem',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
