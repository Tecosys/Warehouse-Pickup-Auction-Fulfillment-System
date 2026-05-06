import { useState, useEffect } from 'react';
import { 
  Download, 
  ChevronDown, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  RefreshCw,
  Package,
  Users,
  Truck,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { SkeletonCard } from '../shared/LoadingComponents';

// ─── Sub-components ─────────────────────────────────────────────────────────────

const StatCard = ({ label, value, color, icon, sub }: any) => (
  <div className="card" style={{ borderTop: `4px solid ${color}`, position: 'relative', overflow: 'hidden' }}>
    {/* Background decoration */}
    <div style={{
      position: 'absolute', right: '-10px', top: '-10px',
      width: '80px', height: '80px', borderRadius: '50%',
      background: `${color}08`
    }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <div style={{ color: color, opacity: 0.7 }}>{icon}</div>
    </div>
    <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
      {value ?? '—'}
    </div>
    {sub && (
      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{sub}</div>
    )}
  </div>
);

const LifecycleNode = ({ label, val, color, percent }: any) => (
  <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, background: 'white', padding: '0 8px' }}>
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%',
      background: `${color}18`,
      border: `2px solid ${color}`,
      margin: '0 auto 10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{val}</div>
    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>{label}</div>
    {percent !== undefined && (
      <div style={{ fontSize: '0.625rem', color: color, fontWeight: 700, marginTop: '2px' }}>{percent}%</div>
    )}
  </div>
);

const ActivityItem = ({ title, desc, time, icon, color }: any) => (
  <div style={{ display: 'flex', gap: '1rem', padding: '0.875rem 0', borderBottom: '1px solid var(--border-color)' }}>
    <div style={{
      width: '38px', height: '38px', borderRadius: '8px',
      background: `${color}12`, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h4>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', flexShrink: 0 }}>{time}</span>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</p>
    </div>
  </div>
);

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes] = await Promise.all([
        fetch('http://localhost:5000/api/auctions/dashboard-stats'),
        fetch('http://localhost:5000/api/activities/recent?limit=10')
      ]);
      const [statsData, activitiesData] = await Promise.all([
        statsRes.json(),
        activitiesRes.json()
      ]);
      setStats(statsData);
      setActivities(activitiesData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────────
  const f = stats?.fulfillment;
  const lc = stats?.lifecycle;
  const total = f?.totalOrders || 0;
  const readyPct = total > 0 ? Math.round((f?.ready / total) * 100) : 0;

  return (
    <div className="dashboard animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
            Weekly auction operations overview
            {stats?.auction && (
              <span style={{ marginLeft: '0.5rem', color: 'var(--status-teal)', fontWeight: 600 }}>
                — {stats.auction.title || `Auction #${stats.auction.auctionNumber}`}
              </span>
            )}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {stats?.auction && (
            <div className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'default' }}>
              <div className="status-dot pulse" style={{ background: 'var(--status-green)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                LIVE: AUCTION #{stats.auction.auctionNumber}
              </span>
              <ChevronDown size={14} />
            </div>
          )}
          <button
            className="btn"
            onClick={fetchData}
            title={`Last updated: ${lastRefresh.toLocaleTimeString()}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}
          >
            <RefreshCw size={15} style={{ color: 'var(--status-teal)' }} />
            Refresh
          </button>
          <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Fulfillment Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {loading ? (
          [1,2,3,4].map(i => <SkeletonCard key={i} />)
        ) : stats?.empty ? (
          <div style={{ gridColumn: '1/-1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No auction data found. Import your first run using File Import.
          </div>
        ) : (
          <>
            <StatCard
              label="Total Orders"
              value={f?.totalOrders?.toLocaleString()}
              color="#6366f1"
              icon={<Package size={20} />}
              sub={`Imported ${stats?.auction?.importedDate ? new Date(stats.auction.importedDate).toLocaleDateString() : ''}`}
            />
            <StatCard
              label="Not Started"
              value={f?.notStarted?.toLocaleString()}
              color="var(--status-gray)"
              icon={<Clock size={20} />}
              sub={f?.notStarted > 0 ? `${Math.round((f?.notStarted / total) * 100)}% of total` : 'All processed'}
            />
            <StatCard
              label="In Progress"
              value={f?.inProgress?.toLocaleString()}
              color="var(--status-amber)"
              icon={<TrendingUp size={20} />}
              sub={f?.inProgress > 0 ? `${Math.round((f?.inProgress / total) * 100)}% of total` : 'None active'}
            />
            <StatCard
              label="Ready"
              value={f?.ready?.toLocaleString()}
              color="var(--status-teal)"
              icon={<CheckCircle2 size={20} />}
              sub={`${readyPct}% fulfillment rate`}
            />
          </>
        )}
      </div>

      {/* Fulfillment Progress Bar */}
      {!loading && !stats?.empty && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.8125rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Overall Fulfillment Progress</span>
            <span style={{ color: 'var(--status-teal)' }}>{readyPct}%</span>
          </div>
          <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
            {/* Ready */}
            <div style={{ width: `${readyPct}%`, background: 'linear-gradient(90deg, #0d9488, #14b8a6)', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 10px rgba(13,148,136,0.4)' }} />
            {/* In Progress */}
            <div style={{ width: `${total > 0 ? Math.round((f?.inProgress / total) * 100) : 0}%`, background: '#fbbf24', transition: 'width 0.8s' }} />
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-teal)', display: 'inline-block' }} /> Ready ({f?.ready})</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} /> In Progress ({f?.inProgress})</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e2e8f0', display: 'inline-block' }} /> Not Started ({f?.notStarted})</span>
          </div>
        </div>
      )}

      {/* Customer Lifecycle Strip */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '1.5rem' }}>
          Customer Lifecycle Pipeline
        </h3>
        {loading ? (
          <div style={{ height: '80px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '0.5rem' }} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', height: '2px', background: 'linear-gradient(90deg, var(--status-gray), var(--status-green), var(--status-amber), var(--status-teal), var(--status-red))', left: '40px', right: '40px', zIndex: 0, opacity: 0.3 }} />
            <LifecycleNode label="Awaiting Choice" val={lc?.awaitingChoice ?? 0} color="var(--status-gray)" percent={total > 0 ? Math.round(((lc?.awaitingChoice ?? 0) / total) * 100) : 0} />
            <LifecycleNode label="Shipping Selected" val={lc?.shippingSelected ?? 0} color="var(--status-blue)" percent={total > 0 ? Math.round(((lc?.shippingSelected ?? 0) / total) * 100) : 0} />
            <LifecycleNode label="Booked" val={lc?.booked ?? 0} color="var(--status-green)" percent={total > 0 ? Math.round(((lc?.booked ?? 0) / total) * 100) : 0} />
            <LifecycleNode label="Checked In" val={lc?.checkedIn ?? 0} color="var(--status-amber)" percent={total > 0 ? Math.round(((lc?.checkedIn ?? 0) / total) * 100) : 0} />
            <LifecycleNode label="Partial Pickup" val={lc?.partiallyPickedUp ?? 0} color="#f97316" percent={total > 0 ? Math.round(((lc?.partiallyPickedUp ?? 0) / total) * 100) : 0} />
            <LifecycleNode label="Picked Up" val={lc?.pickedUp ?? 0} color="var(--status-teal)" percent={total > 0 ? Math.round(((lc?.pickedUp ?? 0) / total) * 100) : 0} />
            <LifecycleNode label="Cancelled" val={lc?.cancelled ?? 0} color="var(--status-red)" percent={total > 0 ? Math.round(((lc?.cancelled ?? 0) / total) * 100) : 0} />
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Left — Activity Feed */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>System Activity Feed</h3>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
          
          <div className="activity-feed">
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.875rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 8, borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 12, width: '90%', borderRadius: 4 }} />
                  </div>
                </div>
              ))
            ) : activities.length > 0 ? (
              activities.map((a: any) => (
                <ActivityItem
                  key={a._id}
                  title={a.title}
                  desc={a.description}
                  time={new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  icon={a.type === 'Import' ? <Package size={16} /> : a.type === 'Notification' ? <MessageSquare size={16} /> : a.type === 'Preparation' ? <CheckCircle2 size={16} /> : <RefreshCw size={16} />}
                  color={a.type === 'Import' ? '#6366f1' : a.type === 'Notification' ? 'var(--status-blue)' : a.type === 'Preparation' ? 'var(--status-teal)' : 'var(--text-muted)'}
                />
              ))
            ) : (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                <p style={{ fontSize: '0.875rem' }}>No activity logged yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Upcoming Appointments */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: 'var(--status-teal)' }} />
                Upcoming Appointments
              </h4>
            </div>
            {loading ? (
              [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8, marginBottom: 8 }} />)
            ) : stats?.upcomingAppointments?.length > 0 ? (
              stats.upcomingAppointments.map((appt: any) => {
                const statusColor = appt.fulfillmentStatus === 'Ready' ? 'var(--status-teal)' : appt.fulfillmentStatus === 'In Progress' ? 'var(--status-amber)' : 'var(--status-gray)';
                return (
                  <div key={appt._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.625rem', marginBottom: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ textAlign: 'center', minWidth: '44px' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {new Date(appt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appt.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bidder #{appt.bidderNumber}</div>
                    </div>
                    <span style={{ fontSize: '0.625rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: `${statusColor}18`, color: statusColor, whiteSpace: 'nowrap' }}>
                      {appt.fulfillmentStatus?.toUpperCase()}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <Clock size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                No upcoming appointments scheduled.
              </div>
            )}
          </div>

          {/* Shipping & Pickup Summary */}
          <div className="card">
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={16} style={{ color: 'var(--status-blue)' }} />
              Retrieval Summary
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {[
                { label: 'Awaiting', val: loading ? '—' : lc?.awaitingChoice ?? 0, color: 'var(--status-gray)' },
                { label: 'Pickup Booked', val: loading ? '—' : lc?.booked ?? 0, color: 'var(--status-green)' },
                { label: 'Shipping', val: loading ? '—' : lc?.shippingSelected ?? 0, color: 'var(--status-blue)' },
                { label: 'Picked Up', val: loading ? '—' : lc?.pickedUp ?? 0, color: 'var(--status-teal)' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Users Summary */}
          <div className="card">
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} style={{ color: '#a855f7' }} />
              Customer Status
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Checked In Today', val: loading ? '—' : lc?.checkedIn ?? 0, color: 'var(--status-amber)', dot: true },
                { label: 'Completed Pickups', val: loading ? '—' : lc?.pickedUp ?? 0, color: 'var(--status-teal)', dot: false },
                { label: 'Cancelled / Forfeited', val: loading ? '—' : lc?.cancelled ?? 0, color: 'var(--status-red)', dot: false },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                    <div className={`status-dot${row.dot ? ' pulse' : ''}`} style={{ background: row.color }} />
                    {row.label}
                  </div>
                  <span style={{ fontWeight: 700, color: row.color }}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
