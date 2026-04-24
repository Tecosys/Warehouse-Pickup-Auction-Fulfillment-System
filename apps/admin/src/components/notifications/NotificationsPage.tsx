import React, { useState } from 'react';
import { 
  Send, 
  History, 
  Settings2, 
  ChevronDown, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Mail,
  Smartphone,
  Edit2,
  ExternalLink,
  ChevronRight,
  UserCheck,
  MessageSquare,
  Package,
  Gavel,
  X
} from 'lucide-react';

const NotificationCard = ({ notification, onSend }: any) => (
  <div className="card animate-fade" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
    <div style={{ width: '40px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{notification.id}</div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{notification.name}</h4>
        <span style={{ 
          fontSize: '0.625rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
          background: notification.trigger === 'Auto' ? '#ccfbf1' : notification.trigger === 'Manual' ? '#f1f5f9' : '#dbeafe',
          color: notification.trigger === 'Auto' ? '#0d9488' : notification.trigger === 'Manual' ? '#64748b' : '#2563eb'
        }}>{notification.trigger}</span>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{notification.desc}</p>
    </div>
    
    <div style={{ width: '150px', fontSize: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: notification.status === 'Sent' ? 'var(--status-green)' : 'var(--text-muted)' }}>
        {notification.status === 'Sent' ? <CheckCircle2 size={14} /> : notification.status === 'Scheduled' ? <Clock size={14} style={{ color: 'var(--status-blue)' }} /> : <div style={{ width: '14px' }} />}
        <span style={{ fontWeight: 600 }}>{notification.status}</span>
      </div>
      <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{notification.recipients}</div>
    </div>

    <div style={{ width: '120px', textAlign: 'right' }}>
      {notification.trigger !== 'Auto' ? (
        <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => onSend(notification)}>
          Send Now
        </button>
      ) : (
        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>AUTOMATED</span>
      )}
    </div>
  </div>
);

const SendModal = ({ notification, onClose }: any) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
    <div className="card animate-slide" style={{ width: '600px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Send: {notification.name}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Transactional Notification • SMS & Email</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>RECIPIENT GROUP</label>
        <select className="card" style={{ width: '100%', padding: '0.75rem' }}>
          <option>All customers this auction (1,284)</option>
          <option>Customers with no choice made (412)</option>
          <option>Specific Bidder #</option>
        </select>
      </div>

      <div className="card" style={{ background: '#f8fafc', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PREVIEW</span>
          <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px' }}>SMS</span>
        </div>
        <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
          "Congratulations on your winnings from Bid Boss Auction #043. Please use your link to choose Pickup or Shipping: https://portal.bidboss.ca/x/7k2j"
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-primary" style={{ flex: 1, padding: '1rem', fontSize: '1rem' }} onClick={onClose}>
          Send to 1,284 Customers
        </button>
        <button className="btn" style={{ flex: 1, padding: '1rem' }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>
);

const TemplateEditor = ({ template, onClose }: any) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
    <div className="card animate-slide" style={{ width: '900px', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem' }} onClick={e => e.stopPropagation()}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Edit Template: {template.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none' }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>CHANNELS</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" style={{ border: '2px solid var(--status-teal)', color: 'var(--status-teal)' }}><Smartphone size={16} /> SMS</button>
            <button className="btn" style={{ border: '2px solid var(--status-teal)', color: 'var(--status-teal)' }}><Mail size={16} /> Email</button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>SMS BODY</label>
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)' }}>112 / 160 characters</span>
          </div>
          <textarea 
            className="card" 
            style={{ width: '100%', height: '120px', padding: '1rem', resize: 'none', fontSize: '0.875rem' }}
            defaultValue="Congratulations on your winnings from Bid Boss Auction #[Auction Number]. Please use your link to choose Pickup or Shipping: [Link]"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>EMAIL BODY (HTML)</label>
          <div className="card" style={{ height: '200px', border: '1px solid var(--border-color)', padding: '1rem' }}>
            Rich text editor placeholder...
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={onClose}>Save Template</button>
          <button className="btn" style={{ padding: '0.75rem 2rem' }} onClick={onClose}>Cancel</button>
        </div>
      </div>

      <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem' }}>
        <h4 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-muted)' }}>VARIABLE REFERENCE</h4>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {[
            { tag: '[Auction Number]', desc: 'e.g. 043' },
            { tag: '[Link]', desc: 'Personal portal URL' },
            { tag: '[Date]', desc: 'Appointment date' },
            { tag: '[Time]', desc: 'Appointment time' },
            { tag: '[Code]', desc: 'Booking code' },
            { tag: '[Lot Number]', desc: 'Item identifier' },
            { tag: '[Tracking Number]', desc: 'Carrier track ID' },
          ].map(v => (
            <div key={v.tag}>
              <code style={{ fontSize: '0.75rem', color: 'var(--status-teal)', fontWeight: 700 }}>{v.tag}</code>
              <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('Send Notifications');
  const [showSendModal, setShowSendModal] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState<any>(null);

  const notifications = [
    { id: '01', name: 'Initial Action Link', desc: 'Customer link to choose Pickup or Shipping', trigger: 'Manual/Batch', status: 'Not Sent', recipients: '1,284 customers' },
    { id: '02', name: 'Shipping Selected', desc: 'Confirms shipping selection + finality note', trigger: 'Auto', status: 'Sent', recipients: '412 sends' },
    { id: '03', name: 'Ready for Pickup', desc: 'Order status → Ready, choose slot or ship', trigger: 'Auto', status: 'Sent', recipients: '942 sends' },
    { id: '04', name: 'Booking Confirmation', desc: 'Confirms date, time, booking code', trigger: 'Auto', status: 'Sent', recipients: '824 sends' },
    { id: '05', name: 'Appointment Reminder', desc: 'Day before reminder with link to reschedule', trigger: 'Auto', status: 'Scheduled', recipients: '142 tomorrow' },
    { id: '06', name: 'Arrival Reminder', desc: '1 hour before appointment instructions', trigger: 'Auto', status: 'Scheduled', recipients: '12 today' },
    { id: '07', name: 'Daily Reminder', desc: 'Daily nag for customers with no choice', trigger: 'Auto', status: 'Sent', recipients: '84 sends' },
    { id: '08', name: 'Final Saturday Reminder', desc: 'Saturday morning deadline alert', trigger: 'Auto', status: 'Not Sent', recipients: '-' },
    { id: '09', name: 'Cancellation Notice', desc: 'Saturday 3 PM forfeiture notice', trigger: 'Auto', status: 'Not Sent', recipients: '-' },
    { id: '10', name: 'Pickup Confirmation', desc: 'Post-clerk release with 24h warranty note', trigger: 'Auto', status: 'Sent', recipients: '45 sends' },
    { id: '11', name: 'Return Received', desc: 'Confirms lot intake + case review note', trigger: 'Auto', status: 'Not Sent', recipients: '-' },
    { id: '12', name: 'Review Request', desc: 'Sent after pickup if no open cases', trigger: 'Auto', status: 'Sent', recipients: '38 sends' },
    { id: '13', name: 'Tracking Notification', desc: 'Order shipped with tracking number', trigger: 'Manual/Batch', status: 'Sent', recipients: '212 sends' },
  ];

  const templates = [
    ...notifications,
    { id: 'MKT', name: 'Weekly Catalogue Reminder', desc: 'Marketing blast for new auction catalogue', trigger: 'Manual', status: '-', recipients: '-' }
  ];

  return (
    <div className="notifications-page animate-slide">
      {showSendModal && <SendModal notification={showSendModal} onClose={() => setShowSendModal(null)} />}
      {showEditModal && <TemplateEditor template={showEditModal} onClose={() => setShowEditModal(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Batch Notifications</h1>
          <p style={{ color: 'var(--text-muted)' }}>Send and manage transactional messages for each auction run</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
             <span style={{ color: 'var(--text-muted)' }}>Auction:</span>
             <span>Spring Estate #043</span>
             <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {['Send Notifications', 'Notification Log', 'Templates'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.75rem 0', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--status-teal)' : '2px solid transparent', color: activeTab === tab ? 'var(--status-teal)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Send Notifications' && (
        <>
          <div className="notification-list">
            {notifications.map(n => (
              <NotificationCard key={n.id} notification={n} onSend={setShowSendModal} />
            ))}
          </div>
          <div className="card" style={{ marginTop: '3rem', border: '1px dashed var(--border-color)', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Weekly Catalogue Reminder</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Marketing Campaign (separate from transactional notifications)</p>
              </div>
              <button className="btn" style={{ background: 'var(--text-main)', color: 'white', border: 'none' }} onClick={() => setShowSendModal({ name: 'Weekly Catalogue Reminder', trigger: 'Manual' })}>
                <Gavel size={18} /> Send Catalogue Blast (5,240 recipients)
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'Notification Log' && (
        <div className="card animate-fade">
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
             <div style={{ display: 'flex', gap: '1rem' }}>
               <div style={{ position: 'relative', width: '300px' }}>
                 <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                 <input type="text" placeholder="Search by name, bidder #..." className="card" style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem' }} />
               </div>
               <button className="btn"><Filter size={16} /> Filters</button>
             </div>
             <button className="btn"><Download size={16} /> Export Log</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>SENT AT</th>
                <th style={{ padding: '1rem' }}>TYPE</th>
                <th style={{ padding: '1rem' }}>CUSTOMER</th>
                <th style={{ padding: '1rem' }}>BIDDER #</th>
                <th style={{ padding: '1rem' }}>CHANNEL</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '10:15 AM', type: 'Ready for Pickup', name: 'David Miller', bidder: '8221', channel: 'SMS', status: 'Sent' },
                { time: '10:12 AM', type: 'Initial Action Link', name: 'Sarah Wilson', bidder: '7442', channel: 'Both', status: 'Sent' },
                { time: '09:45 AM', type: 'Booking Conf.', name: 'James Chen', bidder: '9012', channel: 'Email', status: 'Failed' },
              ].map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>Today, {log.time}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{log.type}</td>
                  <td style={{ padding: '1rem' }}>{log.name}</td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>{log.bidder}</td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '8px' }}>
                    {log.channel === 'Both' || log.channel === 'SMS' ? <Smartphone size={16} color="var(--text-muted)" /> : null}
                    {log.channel === 'Both' || log.channel === 'Email' ? <Mail size={16} color="var(--text-muted)" /> : null}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', background: log.status === 'Sent' ? '#ccfbf1' : '#fef2f2', color: log.status === 'Sent' ? '#0d9488' : '#b91c1c' }}>{log.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Templates' && (
        <div className="card animate-fade">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>TEMPLATE NAME</th>
                <th style={{ padding: '1rem' }}>CHANNEL</th>
                <th style={{ padding: '1rem' }}>LAST EDITED</th>
                <th style={{ padding: '1rem' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((n, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{n.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Smartphone size={16} color="var(--status-teal)" />
                      <Mail size={16} color="var(--status-teal)" />
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>Marcus V. • 2d ago</td>
                  <td style={{ padding: '1rem' }}><button className="btn" onClick={() => setShowEditModal(n)}><Edit2 size={16} /> Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
