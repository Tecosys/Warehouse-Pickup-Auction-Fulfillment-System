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
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { SkeletonCard, ButtonSpinner } from '../shared/LoadingComponents';

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

const Dashboard = ({ selectedAuction, user }: { selectedAuction?: any; user?: any }) => {
  const [activeTab, setActiveTab] = useState<'Operations' | 'Closeout'>('Operations');
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Closeout states
  const [closeoutSummary, setCloseoutSummary] = useState<any>(null);
  const [closeoutLoading, setCloseoutLoading] = useState(false);
  const [closeoutProcessing, setCloseoutProcessing] = useState(false);
  const [confirmCloseoutCheckbox, setConfirmCloseoutCheckbox] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsUrl = selectedAuction
        ? `http://localhost:5000/api/auctions/dashboard-stats?auctionRunId=${selectedAuction._id}`
        : 'http://localhost:5000/api/auctions/dashboard-stats';
      const [statsRes, activitiesRes] = await Promise.all([
        fetch(statsUrl),
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

  const fetchCloseoutSummary = async () => {
    if (!selectedAuction?._id) return;
    try {
      setCloseoutLoading(true);
      const res = await fetch(`http://localhost:5000/api/auctions/${selectedAuction._id}/closeout-summary`);
      if (res.ok) {
        const data = await res.json();
        setCloseoutSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch closeout summary:', err);
    } finally {
      setCloseoutLoading(false);
    }
  };

  const handleExecuteCloseout = async () => {
    if (!selectedAuction?._id || !confirmCloseoutCheckbox) return;
    try {
      setCloseoutProcessing(true);
      const res = await fetch(`http://localhost:5000/api/auctions/${selectedAuction._id}/closeout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffUser: user?.name || 'Admin' })
      });
      if (res.ok) {
        setConfirmCloseoutCheckbox(false);
        await fetchCloseoutSummary();
        await fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to complete closeout');
      }
    } catch (err) {
      console.error('Closeout failed:', err);
      alert('Network error during closeout execution.');
    } finally {
      setCloseoutProcessing(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (activeTab === 'Closeout') {
      fetchCloseoutSummary();
    }
  }, [selectedAuction?._id, activeTab]);

  useEffect(() => {
    // Auto-refresh operations tab every 60 seconds if selected
    if (activeTab === 'Operations') {
      const interval = setInterval(fetchData, 60000);
      return () => clearInterval(interval);
    }
  }, [selectedAuction?._id, activeTab]);

  const [closeoutSubTab, setCloseoutSubTab] = useState<'Overview' | 'PaidUnpaid' | 'Shipping' | 'Credits' | 'Cases' | 'Abandoned' | 'ManualAdjustments' | 'AccountingPack' | 'AuditLog'>('Overview');
  const [closeoutOrders, setCloseoutOrders] = useState<any[]>([]);
  const [closeoutCredits, setCloseoutCredits] = useState<any[]>([]);
  const [closeoutCases, setCloseoutCases] = useState<any[]>([]);
  const [closeoutActivities, setCloseoutActivities] = useState<any[]>([]);
  const [subTabLoading, setSubTabLoading] = useState(false);

  // Manual Credit Form
  const [manualCreditBidder, setManualCreditBidder] = useState('');
  const [manualCreditAmount, setManualCreditAmount] = useState('');
  const [manualCreditReason, setManualCreditReason] = useState('');
  const [manualCreditProcessing, setManualCreditProcessing] = useState(false);

  const fetchSubTabData = async (tab: string) => {
    if (!selectedAuction?._id) return;
    try {
      setSubTabLoading(true);
      if (tab === 'PaidUnpaid' || tab === 'Shipping' || tab === 'Abandoned' || tab === 'AccountingPack') {
        const res = await fetch(`http://localhost:5000/api/orders?auctionRunId=${selectedAuction._id}`);
        const data = await res.json();
        setCloseoutOrders(data || []);
      } else if (tab === 'Credits') {
        const res = await fetch(`http://localhost:5000/api/credits`);
        const data = await res.json();
        setCloseoutCredits(data || []);
      } else if (tab === 'Cases') {
        const res = await fetch(`http://localhost:5000/api/cases?auctionRunId=${selectedAuction._id}`);
        const data = await res.json();
        setCloseoutCases(data || []);
      } else if (tab === 'ManualAdjustments' || tab === 'AuditLog') {
        const res = await fetch(`http://localhost:5000/api/activities/recent?limit=100`);
        const data = await res.json();
        setCloseoutActivities(data || []);
      }
    } catch (err) {
      console.error('Sub tab fetch error:', err);
    } finally {
      setSubTabLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, status: string) => {
    const reason = prompt('Please enter a brief note for this manual payment override:');
    if (reason === null) return; // cancelled
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status, notes: reason })
      });
      if (res.ok) {
        alert('Payment status updated and logged to audit trail.');
        fetchSubTabData(closeoutSubTab);
      } else {
        alert('Failed to update payment status.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueManualCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCreditBidder || !manualCreditAmount) return;
    try {
      setManualCreditProcessing(true);
      const res = await fetch('http://localhost:5000/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidderNumber: manualCreditBidder,
          amount: parseFloat(manualCreditAmount),
          reason: manualCreditReason,
          staffUser: user?.name || 'Admin'
        })
      });
      if (res.ok) {
        alert('Manual store credit issued successfully.');
        setManualCreditBidder('');
        setManualCreditAmount('');
        setManualCreditReason('');
        fetchSubTabData('Credits');
        fetchCloseoutSummary();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to issue credit.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setManualCreditProcessing(false);
    }
  };

  const handleDownloadAccountingPack = () => {
    if (!selectedAuction) return;
    const summary = {
      auctionNumber: selectedAuction.auctionNumber,
      auctionTitle: selectedAuction.title,
      closedAt: new Date().toISOString(),
      restockedOrders: closeoutOrders.filter(o => o.customerStatus === 'Cancelled').map(o => ({
        bidder: o.bidderNumber,
        totalHammer: o.totalHammer,
        restockingFee: Math.max((o.totalHammer || 0) * 0.1, 50)
      })),
      totalCreditsIssued: closeoutCredits.reduce((sum, c) => sum + c.amount, 0),
      openCases: closeoutCases.filter(c => c.status !== 'Resolved').map(c => ({
        number: c.caseNumber,
        type: c.type,
        status: c.status
      }))
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AUC-${selectedAuction.auctionNumber}-accounting-pack.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (activeTab === 'Closeout') {
      fetchSubTabData(closeoutSubTab);
    }
  }, [closeoutSubTab, selectedAuction?._id, activeTab]);

  const renderCloseoutTab = () => {
    if (closeoutLoading) {
      return (
        <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--status-teal)', borderRadius: '50%' }}></div>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading closeout summary...</span>
        </div>
      );
    }

    if (!closeoutSummary) {
      return <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No closeout summary available.</div>;
    }

    const {
      readyForBooks,
      unreleasedCount,
      unpaidCount,
      openShippingCount,
      openCasesCount,
      returnsCount,
      activeCreditsCount,
      restockingPercent,
      restockingFlat
    } = closeoutSummary;

    const hasWarnings = unreleasedCount > 0 || unpaidCount > 0 || openShippingCount > 0 || openCasesCount > 0;

    return (
      <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Run status banner */}
        <div className="card" style={{
          padding: '1.5rem',
          background: readyForBooks ? 'rgba(13, 148, 136, 0.05)' : 'rgba(245, 158, 11, 0.03)',
          border: '1px solid',
          borderColor: readyForBooks ? 'rgba(13, 148, 136, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: readyForBooks ? 'var(--status-teal)' : 'var(--status-amber)' }}>
              Run Status: {readyForBooks ? 'Locked (Ready for Books)' : 'Active / Pending Closeout'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              {readyForBooks 
                ? 'All operations for this run have been completed and locked. Financial ledgers are ready for export.'
                : 'Process outstanding pickup, shipping, payment, and return events before closing this run.'}
            </p>
          </div>
          <span className={`badge ${readyForBooks ? 'badge-teal' : 'badge-amber'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
            {readyForBooks ? 'READY FOR BOOKS' : 'OPEN'}
          </span>
        </div>

        {/* Sub-Tabs Selector */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
          {[
            { id: 'Overview', label: 'Overview' },
            { id: 'PaidUnpaid', label: 'Paid/Unpaid' },
            { id: 'Shipping', label: 'Shipping Reconcile' },
            { id: 'Credits', label: 'Store Credits' },
            { id: 'Cases', label: 'Open Cases' },
            { id: 'Abandoned', label: 'Abandoned Orders' },
            { id: 'ManualAdjustments', label: 'Manual Adjustments' },
            { id: 'AccountingPack', label: 'Accounting Pack' },
            { id: 'AuditLog', label: 'Closeout Audit' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setCloseoutSubTab(t.id as any)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                background: closeoutSubTab === t.id ? 'var(--status-teal)' : 'none',
                color: closeoutSubTab === t.id ? 'white' : 'var(--text-muted)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8125rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {subTabLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid var(--border-color)', borderTopColor: 'var(--status-teal)', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading records...</span>
          </div>
        ) : (
          <>
            {closeoutSubTab === 'Overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  {[
                    { label: 'Unreleased Winnings', val: unreleasedCount, color: unreleasedCount > 0 ? 'var(--status-amber)' : 'var(--text-muted)', desc: 'Orders still awaiting pickup or shipping release.' },
                    { label: 'Unpaid Orders', val: unpaidCount, color: unpaidCount > 0 ? 'var(--status-red)' : 'var(--text-muted)', desc: 'Orders without completed payment validation.' },
                    { label: 'Pending Shipments', val: openShippingCount, color: openShippingCount > 0 ? 'var(--status-blue)' : 'var(--text-muted)', desc: 'Shipping orders that have not been dispatched.' },
                    { label: 'Open Cases / Claims', val: openCasesCount, color: openCasesCount > 0 ? 'var(--status-red)' : 'var(--text-muted)', desc: 'Active customer dispute tickets.' },
                    { label: 'Returns Received', val: returnsCount, color: 'var(--status-teal)', desc: 'Items checked back in under warranty.' },
                    { label: 'Active Store Credits', val: activeCreditsCount, color: 'var(--text-main)', desc: 'Global active/partially used credits balance.' }
                  ].map((item, index) => (
                    <div className="card" key={index} style={{ padding: '1.5rem' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                      <div style={{ fontSize: '2.25rem', fontWeight: 800, color: item.color, margin: '0.5rem 0' }}>{item.val}</div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>

                {!readyForBooks ? (
                  <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Closeout Action & Restocking Policy Guidance
                    </h4>
                    
                    {hasWarnings && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.25rem 1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <ShieldAlert size={24} style={{ color: 'var(--status-red)', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#991b1b', display: 'block' }}>Warning: Outstanding Items Remain</span>
                          <span style={{ fontSize: '0.875rem', color: '#7f1d1d', display: 'block', marginTop: '0.25rem', lineHeight: '1.4' }}>
                            There are still unreleased orders, unpaid balances, or open shipments. Continuing with the closeout will automatically cancel all unreleased/unpaid orders, set their associated lots back to 'Hold/Issue' state, and calculate/log the restocking policy fee of <strong>{restockingPercent}%</strong> (minimum flat fee of <strong>${restockingFlat.toFixed(2)}</strong>) for each abandoned item.
                          </span>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                        <input 
                          type="checkbox" 
                          checked={confirmCloseoutCheckbox} 
                          onChange={(e) => setConfirmCloseoutCheckbox(e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--status-teal)' }}
                        />
                        I confirm that all preparation is complete and I want to close out this auction run.
                      </label>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '2rem' }}>
                        Closing the auction run will lock the run to "Ready for Books", cancel abandoned orders, apply restocking fees, and generate detailed audit activity logs. This action cannot be undone.
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        disabled={!confirmCloseoutCheckbox || closeoutProcessing}
                        onClick={handleExecuteCloseout}
                        className="btn btn-primary"
                        style={{
                          padding: '0.75rem 2.5rem',
                          background: (confirmCloseoutCheckbox && !closeoutProcessing) ? 'var(--status-teal)' : 'var(--status-gray)',
                          color: 'white',
                          border: 'none',
                          cursor: (confirmCloseoutCheckbox && !closeoutProcessing) ? 'pointer' : 'not-allowed',
                          opacity: (confirmCloseoutCheckbox && !closeoutProcessing) ? 1 : 0.6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9375rem'
                        }}
                      >
                        {closeoutProcessing ? <><ButtonSpinner /> Processing Closeout...</> : <>Close Auction Run & Lock to 'Ready for Books'</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--status-teal)', background: 'rgba(13, 148, 136, 0.01)', textAlign: 'center' }}>
                    <CheckCircle2 size={48} style={{ color: 'var(--status-teal)', margin: '0 auto 1rem' }} />
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--status-teal)' }}>Auction Closeout Complete</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '600px', margin: '0.5rem auto 0 auto', lineHeight: '1.4' }}>
                      This auction run has been successfully closed and marked as <strong>Ready for Books</strong>. Abandoned orders have been restocked, and restocking fees have been generated/logged. QuickBooks-ready file summaries can now be exported.
                    </p>
                  </div>
                )}
              </div>
            )}

            {closeoutSubTab === 'PaidUnpaid' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>Payment Status & Reconciliation Overview</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>Manually review or reconcile payments from AuctionFlex360.</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Bidder #</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Customer</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Total Hammer</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Tax</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Paid Status</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Manual Reconcile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closeoutOrders.map(o => (
                      <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                        <td style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>#{o.bidderNumber}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>{o.customer?.name || '—'}</td>
                        <td style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>${(o.totalHammer || 0).toFixed(2)}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>${(o.taxAmount || 0).toFixed(2)}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>
                          <span className={`badge ${o.paymentStatus === 'Paid' ? 'badge-teal' : 'badge-amber'}`}>{o.paymentStatus}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>
                          <select 
                            value={o.paymentStatus} 
                            onChange={(e) => handleUpdatePaymentStatus(o._id, e.target.value)}
                            style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', outline: 'none' }}
                          >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                            <option value="Manual Review">Manual Review</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {closeoutSubTab === 'Shipping' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>Shipping Financial Reconciliation</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>Est. profits based on carrier cost vs customer charge.</p>
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.8125rem', color: '#166534', fontWeight: 700 }}>
                    Est. Shipping Margin: ${closeoutOrders.filter(o => o.retrievalMethod === 'Shipping').reduce((sum, o) => sum + ((o.totalHammer || 0) * 0.08), 0).toFixed(2)}
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Bidder #</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Customer</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Method</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Internal Billing Status</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Tracking Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closeoutOrders.filter(o => o.retrievalMethod === 'Shipping').map(o => (
                      <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                        <td style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>#{o.bidderNumber}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>{o.customer?.name || '—'}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>{o.retrievalMethod}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>
                          <span className="badge badge-blue">{o.shippingStatus || 'Awaiting Prep'}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1.5rem', fontFamily: 'monospace' }}>{o.trackingNumber || 'Awaiting Dispatch'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {closeoutSubTab === 'Credits' && (
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
                <form onSubmit={handleIssueManualCredit} className="card" style={{ padding: '1.5rem' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '0.9375rem', marginBottom: '1rem' }}>Issue Store Credit</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Bidder Number</label>
                      <input 
                        type="text" 
                        required
                        value={manualCreditBidder}
                        onChange={(e) => setManualCreditBidder(e.target.value)}
                        placeholder="e.g. 10025" 
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Credit Amount ($)</label>
                      <input 
                        type="number" 
                        required
                        min="0.01"
                        step="0.01"
                        value={manualCreditAmount}
                        onChange={(e) => setManualCreditAmount(e.target.value)}
                        placeholder="e.g. 25.00" 
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Internal Reason</label>
                      <input 
                        type="text" 
                        value={manualCreditReason}
                        onChange={(e) => setManualCreditReason(e.target.value)}
                        placeholder="Goodwill, broken lot refund, etc." 
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}
                      />
                    </div>
                    <button type="submit" disabled={manualCreditProcessing} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      {manualCreditProcessing ? 'Processing...' : 'Issue Credit'}
                    </button>
                  </div>
                </form>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>Active Store Credit Ledger</h4>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Customer</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Amount</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Remaining</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closeoutCredits.map(c => (
                        <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                          <td style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>{c.customer?.name || 'Manual Customer'}</td>
                          <td style={{ padding: '0.75rem 1.5rem' }}>${(c.amount || 0).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 1.5rem', fontWeight: 700, color: 'var(--status-teal)' }}>${(c.remainingBalance || 0).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 1.5rem' }}>
                            <span className="badge badge-teal">{c.status}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)' }}>{c.reason || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {closeoutSubTab === 'Cases' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>Outstanding Customer Disputes & Cases</h4>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Case #</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Customer-Facing</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closeoutCases.map(c => (
                      <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                        <td style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>{c.caseNumber}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>{c.type}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>
                          <span className={`badge ${c.status === 'Resolved' ? 'badge-teal' : 'badge-amber'}`}>{c.status}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>{c.customerFacingStatus || 'Pending Review'}</td>
                        <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {closeoutSubTab === 'Abandoned' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>Abandoned & Forfeited Orders</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>Shows orders restocked or flagged due to no-shows.</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Bidder #</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Customer</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Total Hammer</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Restocking Fee</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Current Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closeoutOrders.filter(o => o.customerStatus === 'Cancelled' || o.lifecycleStatus === 'Cancelled').map(o => {
                      const fee = Math.max((o.totalHammer || 0) * 0.1, 50);
                      return (
                        <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                          <td style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>#{o.bidderNumber}</td>
                          <td style={{ padding: '0.75rem 1.5rem' }}>{o.customer?.name || '—'}</td>
                          <td style={{ padding: '0.75rem 1.5rem' }}>${(o.totalHammer || 0).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 1.5rem', color: 'var(--status-red)', fontWeight: 700 }}>${fee.toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 1.5rem' }}>
                            <span className="badge badge-red">Cancelled / Forfeited</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {closeoutSubTab === 'ManualAdjustments' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>Manual & Override Adjustment Log</h4>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Event</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Details / Reason</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Operator</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closeoutActivities.filter(a => a.type === 'System').map(a => (
                      <tr key={a._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                        <td style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>{a.title}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>{a.description} {a.notes ? `(${a.notes})` : ''}</td>
                        <td style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>{a.user}</td>
                        <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {closeoutSubTab === 'AccountingPack' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1.125rem', margin: 0 }}>Consolidated accounting summary</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Export a clean transaction pack documenting store credits, restocking fee receipts, and manual adjustments, ready for your bookkeeper or QuickBooks upload.
                  </p>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Run ID Reference:</span>
                      <span style={{ fontWeight: 700 }}>{selectedAuction?.auctionNumber || 'AUC-V1'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Closed Orders:</span>
                      <span style={{ fontWeight: 700 }}>{closeoutOrders.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Credits Issued:</span>
                      <span style={{ fontWeight: 700, color: 'var(--status-teal)' }}>${closeoutCredits.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={handleDownloadAccountingPack} className="btn btn-primary" style={{ justifyContent: 'center', padding: '0.75rem 2rem' }}>
                    <Download size={18} /> Export Accounting Pack (JSON)
                  </button>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '1rem' }}>QuickBooks Online (QBO) Account mapping guidance</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>1. Hammer Revenue:</strong> Map gross lot price totals to Hammer Revenue account.
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>2. Restocking Income:</strong> Map the generated restocking fee amounts ($50 flat / 10% defaults) to Restocking / Liquidated Damage fees.
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>3. Store Credit Liabilities:</strong> Map newly issued credit balances to Customer Credit Liability.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {closeoutSubTab === 'AuditLog' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>System Closeout Audit trail</h4>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Operator</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Event type</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Action taken</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem' }}>Date/Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closeoutActivities.map(a => (
                      <tr key={a._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                        <td style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>{a.user}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>
                          <span className="badge badge-teal">{a.type}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>{a.title} — {a.description}</td>
                        <td style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

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
            onClick={activeTab === 'Closeout' ? fetchCloseoutSummary : fetchData}
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

      {/* Tabs Switcher for Admin */}
      {(user?.role === 'Admin' || user?.role === 'Support') && (
        <div className="tabs-container" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          {(['Operations', 'Closeout'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 0.5rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                color: activeTab === tab ? 'var(--status-teal)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '3px solid var(--status-teal)' : '3px solid transparent',
                transition: 'all 0.2s',
                marginBottom: '-1px'
              }}
            >
              {tab === 'Operations' ? 'Weekly Operations' : 'Auction Closeout'}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'Closeout' ? renderCloseoutTab() : (
        <>

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
      </>
      )}
    </div>
  );
};

export default Dashboard;
