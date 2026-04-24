import React from 'react';
import { 
  Download, 
  ChevronDown, 
  MoreVertical, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  History
} from 'lucide-react';

const StatCard = ({ label, value, color, icon, trend, flagged }: any) => (
  <div className="card" style={{ borderTop: `4px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
      {icon}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
      <span style={{ fontSize: '1.875rem', fontWeight: 700 }}>{value}</span>
      {flagged && (
        <span style={{ color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
          <AlertTriangle size={14} /> {flagged} lots flagged
        </span>
      )}
    </div>
    {trend && (
      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: trend.startsWith('+') ? 'var(--status-green)' : 'var(--text-muted)' }}>
        {trend} from last run
      </div>
    )}
  </div>
);

const ActivityItem = ({ type, title, desc, time, icon, color }: any) => (
  <div style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
    <div style={{ 
      width: '40px', 
      height: '40px', 
      borderRadius: '8px', 
      background: `${color}15`, 
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{title}</h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{time}</span>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</p>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Weekly auction operations overview</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="status-dot pulse" style={{ background: 'var(--status-green)' }}></div>
            <span>LIVE: AUCTION 31 — MODERNIST ESTATES</span>
            <ChevronDown size={16} />
          </div>
          <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Fulfillment Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Orders" value="1,284" color="#e2e8f0" trend="+12%" />
        <StatCard label="Not Started" value="412" color="var(--status-gray)" />
        <StatCard label="In Progress" value="642" color="var(--status-amber)" />
        <StatCard label="Ready" value="218" color="var(--status-teal)" flagged="12" />
      </div>

      {/* Customer Lifecycle Strip */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
          Customer Lifecycle Pipeline
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', height: '2px', background: '#e2e8f0', left: '40px', right: '40px', zIndex: 0 }} />
          {[
            { label: 'Awaiting Choice', val: '1,284', color: 'var(--status-gray)' },
            { label: 'Booked', val: '892', color: 'var(--status-green)' },
            { label: 'Checked In', val: '124', color: 'var(--status-amber)' },
            { label: 'Picked Up', val: '12', color: 'var(--status-teal)' },
            { label: 'Cancelled', val: '42', color: 'var(--status-red)' }
          ].map((step, i) => (
            <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1, background: 'white', padding: '0 10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: step.color, margin: '0 auto 10px' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{step.val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{step.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Live Activity & Comms</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" style={{ fontSize: '0.75rem' }}>All Events</button>
              <button className="btn" style={{ fontSize: '0.75rem' }}>Alerts</button>
              <button className="btn" style={{ fontSize: '0.75rem' }}>Comms</button>
            </div>
          </div>
          
          <div className="activity-feed">
            <ActivityItem 
              title="SMS Sent to #8241 (Jordan Smith)" 
              desc='"Your order for Auction 31 is now prepared and ready..."'
              time="14:02:11"
              icon={<MessageSquare size={18} />}
              color="#3b82f6"
            />
            <ActivityItem 
              title="Order marked Ready: #8442" 
              desc='Staging Area: Zone B-14. 3 Items processed.'
              time="13:58:45"
              icon={<CheckCircle2 size={18} />}
              color="#0d9488"
            />
            <ActivityItem 
              title="Customer Checked-in: Lisa Ray" 
              desc='Arrival: Loading Dock 3. Order status: Ready.'
              time="13:55:02"
              icon={<Clock size={18} />}
              color="#f59e0b"
            />
            <ActivityItem 
              title="Issue Reported: #8911" 
              desc='Lot 142 "Teak Credenza" reported with hairline scratch.'
              time="13:42:19"
              icon={<AlertTriangle size={18} />}
              color="#ef4444"
            />
          </div>
          <button className="btn" style={{ width: '100%', marginTop: '1.5rem', color: 'var(--status-teal)', border: 'none' }}>
            Load more activity
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Upcoming Appointments</h4>
              <a href="#" style={{ fontSize: '0.75rem', color: 'var(--status-teal)', fontWeight: 600 }}>VIEW ALL</a>
            </div>
            {[
              { time: '14:15', name: 'David Miller', bidder: '#8221', status: 'READY', color: 'var(--status-teal)' },
              { time: '14:30', name: 'Elena Kostic', bidder: '#8442', status: 'IN PROGRESS', color: 'var(--status-amber)' }
            ].map((app, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{app.time}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{app.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.bidder}</div>
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: `${app.color}15`, color: app.color }}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>

          <div className="card">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Shipping Summary</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>142</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Queue</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>89</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prepared</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>412</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dispatched</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Issues Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                  <div className="status-dot pulse" style={{ background: 'var(--status-teal)' }}></div> Open Issues
                </div>
                <span style={{ fontWeight: 600 }}>14</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                  <div className="status-dot" style={{ background: 'var(--status-amber)' }}></div> Awaiting Response
                </div>
                <span style={{ fontWeight: 600 }}>28</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                  <div className="status-dot" style={{ background: 'var(--status-green)' }}></div> Resolved (Today)
                </div>
                <span style={{ fontWeight: 600 }}>42</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
