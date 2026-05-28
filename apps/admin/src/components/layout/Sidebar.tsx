import { 
  LayoutDashboard, 
  Gavel, 
  FileUp, 
  Settings2, 
  Sliders,
  Bell, 
  ClipboardList, 
  Truck, 
  AlertCircle,
  X
} from 'lucide-react';

const Sidebar = ({ activeModule, onModuleChange, onLogout, isOpen, onClose, user }: any) => {
  const allMenuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['Admin', 'Support'] },
    { icon: <Gavel size={20} />, label: 'Auction Runs', roles: ['Admin'] },
    { icon: <FileUp size={20} />, label: 'File Import', roles: ['Admin'] },
    { icon: <ClipboardList size={20} />, label: 'Fulfillment Hub', roles: ['Admin', 'Worker', 'Support'] },
    { icon: <Settings2 size={20} />, label: 'Slot Management', roles: ['Admin', 'Clerk'] },
    { icon: <Bell size={20} />, label: 'Batch Notifications', roles: ['Admin', 'Support'] },
    { icon: <ClipboardList size={20} />, label: 'Inventory Clerk', roles: ['Admin', 'Clerk'] },
    { icon: <Truck size={20} />, label: 'Shipping', roles: ['Admin', 'Support'] },
    { icon: <AlertCircle size={20} />, label: 'Issues / Returns', roles: ['Admin', 'Clerk', 'Support'] },
    { icon: <Sliders size={20} />, label: 'Settings', roles: ['Admin'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src="/Logo.png" alt="BidBoss Logo" style={{ height: '32px', width: 'auto' }} />
        <button 
          className="mobile-only" 
          onClick={onClose}
          style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>
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

    </aside>
  );
};


export default Sidebar;
