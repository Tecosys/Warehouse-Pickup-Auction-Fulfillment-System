import { useState, Fragment } from 'react';
import { Download, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

const MOCK_DISPATCHED = [
  { id: '#BB-88190', bidderNum: '102', customer: 'Arthur Dent', items: 3, tracking: 'FEDEX-992182', dispatchedAt: 'Mar 08, 2024 4:30 PM', sentAt: 'Mar 08, 2024 4:35 PM' },
  { id: '#BB-88185', bidderNum: '440', customer: 'Ford Prefect', items: 1, tracking: 'DHL-88122', dispatchedAt: 'Mar 08, 2024 2:15 PM', sentAt: 'Mar 08, 2024 2:20 PM' },
];

const DispatchedTab = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn" style={{ fontSize: '0.875rem' }}>
          <Download size={16} />
          Export to CSV
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order ID</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tracking Number</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dispatched At</th>
              <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tracking Sent</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DISPATCHED.map((order) => (
              <Fragment key={order.id}>
                <tr 
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                >
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--status-teal)' }}>{order.id}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{order.customer}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontFamily: 'monospace' }}>{order.tracking}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{order.dispatchedAt}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--status-green)', fontWeight: 600 }}>{order.sentAt}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {expandedId === order.id ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem 4rem', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-color)' }} />
                        
                        {[
                          { label: 'Shipping Selected', date: 'Mar 07, 2:00 PM' },
                          { label: 'Marked In Queue', date: 'Mar 08, 9:00 AM' },
                          { label: 'Prepared for Shipping', date: 'Mar 08, 10:22 AM' },
                          { label: 'Tracking Entered', date: 'Mar 08, 4:25 PM' },
                          { label: 'Tracking Notification Sent', date: 'Mar 08, 4:35 PM' },
                          { label: 'Dispatched', date: 'Mar 08, 4:35 PM' }
                        ].map((event, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%', 
                              background: 'white', 
                              border: '2px solid var(--status-teal)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              zIndex: 1
                            }}>
                              <CheckCircle2 size={14} color="var(--status-teal)" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
                              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{event.label}</span>
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{event.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DispatchedTab;
