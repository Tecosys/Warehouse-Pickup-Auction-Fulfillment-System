import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, 
  Search, 
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Truck,
  Clock,
  X,
  ChevronRight
} from 'lucide-react';

const getNotificationName = (type: number) => {
  const names: Record<number, string> = {
    1: 'Catalogue Announcement',
    2: 'Initial Action Link',
    3: 'Ready for Pickup Notice',
    4: 'Booking Confirmation',
    5: 'Reschedule Confirmation',
    6: 'Pickup Reminder (24h)',
    7: 'Pickup Reminder (2h)',
    8: 'Checked-in Confirmed',
    9: 'Walk-in Override',
    10: 'Release Confirmation Receipt',
    11: 'Withheld Lot Return Slip',
    12: 'Return Intake Confirmation',
    13: 'Shipping Tracking Dispatched'
  };
  return names[type] || `Notification #${type}`;
};

const AuctionRunDetail = ({ run, onBack }: any) => {
  const [activeTab, setActiveTab] = useState('Orders');
  const tabs = ['Orders', 'Bookings', 'Notifications', 'Shipping', 'Issues'];

  // State loaded from server
  const [orders, setOrders] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filter states
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersFilter, setOrdersFilter] = useState('All'); // 'All' | 'Not Started' | 'In Progress' | 'Ready'
  const [notifSearch, setNotifSearch] = useState('');
  const [shippingTab, setShippingTab] = useState('In Queue'); // 'In Queue' | 'Prepared' | 'Dispatched'
  const [shippingSearch, setShippingSearch] = useState('');

  // Dialog / Modal states
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [activeOrderLots, setActiveOrderLots] = useState<any[]>([]);

  const [selectedSlotForBookings, setSelectedSlotForBookings] = useState<any>(null);
  const [slotBookings, setSlotBookings] = useState<any[]>([]);

  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  const refetchAllData = () => {
    setLoading(true);
    
    // 1. Fetch Orders for this Auction Run
    const fetchOrders = fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders?auctionRunId=${run._id}`)
      .then(r => r.json())
      .catch(err => { console.error(err); return []; });

    // 2. Fetch Slots for this Auction Run
    const fetchSlots = fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/slots/all/${run._id}`)
      .then(r => r.json())
      .catch(err => { console.error(err); return []; });

    // 3. Fetch Cases/Issues for this Auction Run
    const fetchCases = fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cases?auctionId=${run._id}`)
      .then(r => r.json())
      .catch(err => { console.error(err); return []; });

    // 4. Fetch Notifications log
    const fetchNotifications = fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/logs/all`)
      .then(r => r.json())
      .catch(err => { console.error(err); return []; });

    Promise.all([fetchOrders, fetchSlots, fetchCases, fetchNotifications])
      .then(([ordersData, slotsData, casesData, notifsData]) => {
        setOrders(ordersData);
        setSlots(slotsData);
        setCases(casesData);
        
        // Filter notification logs that belong to the fetched orders of this run
        const orderIds = new Set(ordersData.map((o: any) => o._id));
        const filteredNotifs = notifsData.filter((n: any) => orderIds.has(n.order?._id || n.order));
        setNotifications(filteredNotifs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refetchAllData();
  }, [run._id]);

  // Handler for detailed order lookup
  const handleOpenOrderDetails = (orderId: string) => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${orderId}`)
      .then(r => r.json())
      .then(data => {
        setActiveOrder(data);
        setActiveOrderLots(data.lots || []);
      })
      .catch(console.error);
  };

  // Handler for slot bookings details lookup
  const handleViewSlotBookings = (slot: any) => {
    setSelectedSlotForBookings(slot);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/slots/${slot._id}/bookings`)
      .then(r => r.json())
      .then(data => {
        setSlotBookings(data);
      })
      .catch(console.error);
  };

  // Handler to pack/prepare shipping orders
  const handlePrepareShipping = (orderId: string) => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/shipping/${orderId}/prepare`, {
      method: 'PATCH'
    })
      .then(r => r.json())
      .then(() => {
        refetchAllData();
      })
      .catch(console.error);
  };

  // Handler to dispatch tracking to shipping orders
  const handleDispatchShipping = () => {
    if (!dispatchingOrderId || !trackingNumber.trim()) return;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/shipping/${dispatchingOrderId}/dispatch`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingNumber })
    })
      .then(r => r.json())
      .then(() => {
        setDispatchingOrderId(null);
        setTrackingNumber('');
        refetchAllData();
      })
      .catch(console.error);
  };

  // Handler to resolve ticket cases
  const handleResolveCase = (caseId: string) => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cases/${caseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' })
    })
      .then(r => r.json())
      .then(() => {
        refetchAllData();
      })
      .catch(console.error);
  };

  return (
    <div className="auction-run-detail" style={{ position: 'relative' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--status-teal)', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to All Auction Runs
      </button>

      {/* Hero card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{run.title}</h2>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                padding: '2px 8px', 
                borderRadius: '4px', 
                background: run.status === 'ACTIVE' ? '#ccfbf1' : '#f1f5f9', 
                color: run.status === 'ACTIVE' ? '#0d9488' : '#64748b'
              }}>
                {run.status}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem' }}>
              <span>Run ID: {run.id}</span>
              <span>Imported: {run.importedAt}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Pickup Window</span>
              <div style={{ width: '40px', height: '20px', borderRadius: '10px', background: 'var(--status-teal)', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', right: '2px', top: '2px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Shipping</span>
              <div style={{ width: '40px', height: '20px', borderRadius: '10px', background: 'var(--status-teal)', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', right: '2px', top: '2px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '0.75rem 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === tab ? '2px solid var(--status-teal)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--status-teal)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Tab Rendering Area */}
      <div className="tab-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading run details...</div>
        ) : (
          <>
            {/* ORDERS TAB */}
            {activeTab === 'Orders' && (
              <div style={{ padding: '1rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', width: '100%', maxWidth: '600px' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        placeholder="Search orders by Bidder # or Name..." 
                        className="card" 
                        value={ordersSearch}
                        onChange={e => setOrdersSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', fontSize: '0.875rem' }} 
                      />
                    </div>
                    
                    <select
                      className="card"
                      value={ordersFilter}
                      onChange={e => setOrdersFilter(e.target.value)}
                      style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', border: '1px solid var(--border-color)', fontWeight: 600, background: 'white' }}
                    >
                      <option value="All">All Fulfillment Statuses</option>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Ready">Ready</option>
                    </select>
                  </div>
                  
                  <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Download size={16} /> Export CSV
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>BIDDER #</th>
                        <th style={{ padding: '1rem' }}>CUSTOMER NAME</th>
                        <th style={{ padding: '1rem' }}>FULFILLMENT</th>
                        <th style={{ padding: '1rem' }}>CUSTOMER STATUS</th>
                        <th style={{ padding: '1rem' }}>METHOD / TIME</th>
                        <th style={{ padding: '1rem' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(o => {
                          const query = ordersSearch.toLowerCase();
                          const matchSearch = o.bidderNumber?.toLowerCase().includes(query) || 
                            o.customer?.name?.toLowerCase().includes(query) || 
                            o.hibidData?.name?.toLowerCase().includes(query);
                          
                          const matchFilter = ordersFilter === 'All' || o.fulfillmentStatus === ordersFilter;
                          return matchSearch && matchFilter;
                        })
                        .map((order, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem', fontWeight: 700 }}>{order.bidderNumber}</td>
                            <td style={{ padding: '1rem' }}>{order.customer?.name || order.hibidData?.name || `Bidder #${order.bidderNumber}`}</td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                background: order.fulfillmentStatus === 'Ready' ? '#ccfbf1' : order.fulfillmentStatus === 'In Progress' ? '#fef3c7' : '#f1f5f9',
                                color: order.fulfillmentStatus === 'Ready' ? '#0d9488' : order.fulfillmentStatus === 'In Progress' ? '#92400e' : '#64748b',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                {order.fulfillmentStatus}
                              </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ fontWeight: 600, color: order.customerStatus === 'Picked Up' ? 'var(--status-teal)' : order.customerStatus === 'Cancelled' ? 'var(--status-red)' : 'var(--text-main)' }}>
                                {order.customerStatus}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                              {order.retrievalMethod === 'Shipping' ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--status-blue)', fontWeight: 600 }}>
                                  <Truck size={14} /> Shipping
                                </span>
                              ) : order.appointmentTime ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Calendar size={14} /> {new Date(order.appointmentTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                              ) : (
                                <span>Undecided / Walk-in</span>
                              )}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <button onClick={() => handleOpenOrderDetails(order._id)} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '4px' }}>Open Order</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'Bookings' && (
              <div style={{ padding: '1rem 0' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Pickup Slots Schedule</h3>
                {slots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                    <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No slots initialized for this auction run.</p>
                    <p style={{ fontSize: '0.875rem' }}>Please navigate to the <strong>Slot Management</strong> menu tab in the main sidebar to configure slots for this run.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
                    <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem' }}>DATE</th>
                            <th style={{ padding: '0.75rem' }}>TIME WINDOW</th>
                            <th style={{ padding: '0.75rem' }}>BOOKINGS</th>
                            <th style={{ padding: '0.75rem' }}>ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slots.map((slot, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: selectedSlotForBookings?._id === slot._id ? 'rgba(13,148,136,0.05)' : 'none' }}>
                              <td style={{ padding: '0.75rem', fontWeight: 600 }}>{slot.date}</td>
                              <td style={{ padding: '0.75rem' }}>{slot.startTime} - {slot.endTime}</td>
                              <td style={{ padding: '0.75rem' }}>
                                <span style={{ fontWeight: 700, color: slot.currentBookings >= slot.maxCapacity ? 'var(--status-red)' : 'var(--text-main)' }}>
                                  {slot.currentBookings}
                                </span> / {slot.maxCapacity}
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <button onClick={() => handleViewSlotBookings(slot)} className="btn" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>
                                  View Bidders <ChevronRight size={14} style={{ marginLeft: '2px', display: 'inline' }} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', background: '#f8fafc' }}>
                      <h4 style={{ fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        {selectedSlotForBookings ? `Bidders in slot: ${selectedSlotForBookings.date} (${selectedSlotForBookings.startTime}-${selectedSlotForBookings.endTime})` : 'Select a Slot to view booked bidders'}
                      </h4>
                      {selectedSlotForBookings ? (
                        slotBookings.length === 0 ? (
                          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>No customers booked in this slot yet.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {slotBookings.map((b, idx) => (
                              <div key={idx} style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 700 }}>{b.customer?.name || `Bidder #${b.bidderNumber}`}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bidder #{b.bidderNumber} | Code: {b.bookingCode}</div>
                                </div>
                                <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: b.fulfillmentStatus === 'Ready' ? '#ccfbf1' : '#f1f5f9', color: b.fulfillmentStatus === 'Ready' ? '#0d9488' : '#64748b', fontWeight: 600 }}>
                                  {b.fulfillmentStatus}
                                </span>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <Clock size={36} style={{ marginBottom: '0.5rem', color: '#cbd5e1' }} />
                          <p>Click "View Bidders" next to any pickup slot on the left to see who is scheduled.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'Notifications' && (
              <div style={{ padding: '1rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Filter logs by Bidder #..." 
                      className="card" 
                      value={notifSearch}
                      onChange={e => setNotifSearch(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', fontSize: '0.875rem' }} 
                    />
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>CUSTOMER</th>
                        <th style={{ padding: '1rem' }}>CAMPAIGN TYPE</th>
                        <th style={{ padding: '1rem' }}>CHANNEL</th>
                        <th style={{ padding: '1rem' }}>STATUS</th>
                        <th style={{ padding: '1rem' }}>DATE / TIME SENT</th>
                        <th style={{ padding: '1rem' }}>MESSAGE PREVIEW</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No communication logs recorded yet for this run.</td>
                        </tr>
                      ) : notifications
                        .filter(n => !notifSearch.trim() || n.customer?.name?.toLowerCase().includes(notifSearch.toLowerCase()) || n.order?.bidderNumber?.includes(notifSearch))
                        .map((n, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: 600 }}>{n.customer?.name || 'Unknown'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SMS: {n.customer?.phone || 'N/A'}</div>
                            </td>
                            <td style={{ padding: '1rem', fontWeight: 600 }}>{getNotificationName(n.type)}</td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                {n.channel}
                              </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ 
                                padding: '3px 8px', 
                                borderRadius: '4px', 
                                background: n.status === 'Sent' ? '#ccfbf1' : n.status === 'Failed' ? '#fee2e2' : '#f1f5f9',
                                color: n.status === 'Sent' ? '#0d9488' : n.status === 'Failed' ? '#991b1b' : '#64748b',
                                fontWeight: 700,
                                fontSize: '0.75rem'
                              }}>
                                {n.status}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(n.sentAt || n.createdAt).toLocaleString()}</td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={n.content}>
                              {n.content}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SHIPPING TAB */}
            {activeTab === 'Shipping' && (
              <div style={{ padding: '1rem 0' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  {['In Queue', 'Prepared', 'Dispatched'].map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setShippingTab(sub)}
                      style={{ 
                        padding: '0.5rem 0', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: shippingTab === sub ? '2px solid var(--status-teal)' : '2px solid transparent',
                        color: shippingTab === sub ? 'var(--status-teal)' : 'var(--text-muted)',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {sub} ({
                        orders.filter(o => o.retrievalMethod === 'Shipping' && (
                          (sub === 'In Queue' && o.shippingStatus === 'In Queue') ||
                          (sub === 'Prepared' && o.shippingStatus === 'Prepared') ||
                          (sub === 'Dispatched' && o.shippingStatus === 'Dispatched')
                        )).length
                      })
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Search shipping by Bidder #..." 
                      className="card" 
                      value={shippingSearch}
                      onChange={e => setShippingSearch(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', fontSize: '0.875rem' }} 
                    />
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>BIDDER #</th>
                        <th style={{ padding: '1rem' }}>CUSTOMER</th>
                        <th style={{ padding: '1rem' }}>DELIVERY ADDRESS</th>
                        <th style={{ padding: '1rem' }}>PREP STATUS</th>
                        {shippingTab === 'Dispatched' && <th style={{ padding: '1rem' }}>TRACKING NUMBER</th>}
                        <th style={{ padding: '1rem' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(o => o.retrievalMethod === 'Shipping' && o.shippingStatus === shippingTab && (!shippingSearch.trim() || o.bidderNumber?.includes(shippingSearch)))
                        .map((order, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem', fontWeight: 700 }}>{order.bidderNumber}</td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: 600 }}>{order.customer?.name || order.hibidData?.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customer?.email || order.hibidData?.email}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              {order.customer?.address || order.hibidData?.address || 'No Address Provided'}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ padding: '3px 8px', borderRadius: '4px', background: order.fulfillmentStatus === 'Ready' ? '#ccfbf1' : '#f1f5f9', color: order.fulfillmentStatus === 'Ready' ? '#0d9488' : '#64748b', fontWeight: 600 }}>
                                {order.fulfillmentStatus === 'Ready' ? 'Items Picked' : 'Not Picked'}
                              </span>
                            </td>
                            {shippingTab === 'Dispatched' && (
                              <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--status-teal)' }}>
                                {order.trackingNumber || 'N/A'}
                              </td>
                            )}
                            <td style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleOpenOrderDetails(order._id)} className="btn" style={{ padding: '3px 8px', fontSize: '0.75rem' }}>Details</button>
                                {shippingTab === 'In Queue' && (
                                  <button 
                                    onClick={() => handlePrepareShipping(order._id)} 
                                    className="btn btn-primary" 
                                    style={{ padding: '3px 8px', fontSize: '0.75rem', background: 'var(--status-teal)' }}
                                    disabled={order.fulfillmentStatus !== 'Ready'}
                                    title={order.fulfillmentStatus !== 'Ready' ? 'Must be fully prepared by workers first' : ''}
                                  >
                                    Mark Packed
                                  </button>
                                )}
                                {shippingTab === 'Prepared' && (
                                  <button 
                                    onClick={() => setDispatchingOrderId(order._id)} 
                                    className="btn btn-primary" 
                                    style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                  >
                                    Dispatch
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      {orders.filter(o => o.retrievalMethod === 'Shipping' && o.shippingStatus === shippingTab).length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No shipping orders currently in this status.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ISSUES TAB */}
            {activeTab === 'Issues' && (
              <div style={{ padding: '1rem 0' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Open Tickets & Returns</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>CASE NUMBER</th>
                        <th style={{ padding: '1rem' }}>CUSTOMER</th>
                        <th style={{ padding: '1rem' }}>BIDDER #</th>
                        <th style={{ padding: '1rem' }}>ISSUE TYPE</th>
                        <th style={{ padding: '1rem' }}>STATUS</th>
                        <th style={{ padding: '1rem' }}>AFFECTED LOTS</th>
                        <th style={{ padding: '1rem' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No cases or exceptions reported for this run.</td>
                        </tr>
                      ) : cases.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', fontWeight: 700 }}>{c.caseNumber}</td>
                          <td style={{ padding: '1rem' }}>{c.customerName}</td>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>{c.bidderNumber}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ fontWeight: 600, color: c.type === 'Return' ? 'var(--status-teal)' : 'var(--status-red)' }}>
                              {c.type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ 
                              padding: '3px 8px', 
                              borderRadius: '4px', 
                              background: c.status === 'Resolved' ? '#ccfbf1' : c.status === 'In Review' ? '#fef3c7' : '#fee2e2',
                              color: c.status === 'Resolved' ? '#0d9488' : c.status === 'In Review' ? '#b45309' : '#991b1b',
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}>
                              {c.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {c.lines?.map((line: any, idx: number) => (
                              <div key={idx} style={{ fontSize: '0.8rem' }}>
                                <strong>Lot #{line.lotNumber}</strong>: {line.reason || 'Not specified'}
                              </div>
                            ))}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {c.status !== 'Resolved' && (
                              <button 
                                onClick={() => handleResolveCase(c._id)} 
                                className="btn btn-primary" 
                                style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--status-teal)' }}
                              >
                                Resolve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── MODALS RENDERED WITH PORTALS ─── */}

      {/* 1. ORDER DETAILS DRAWER / MODAL */}
      {activeOrder && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500, padding: '1.5rem' }} onClick={() => setActiveOrder(null)}>
          <div className="card animate-slide" style={{ maxWidth: '750px', width: '100%', padding: '2rem', background: 'white', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Bidder #{activeOrder.bidderNumber} Overview</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Fulfillment Details & Invoice matching</p>
              </div>
              <button onClick={() => setActiveOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Customer Contact</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} /> {activeOrder.customer?.email || activeOrder.hibidData?.email || 'N/A'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> {activeOrder.customer?.phone || activeOrder.hibidData?.phone || 'N/A'}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={16} style={{ marginTop: '2px' }} />
                    <span>{activeOrder.customer?.address || activeOrder.hibidData?.address || 'No pickup/delivery address provided'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Fulfillment State</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div>Fulfillment: <strong style={{ color: 'var(--status-teal)' }}>{activeOrder.fulfillmentStatus}</strong></div>
                  <div>Lifecycle status: <strong>{activeOrder.customerStatus}</strong></div>
                  <div>Retrieval route: <strong>{activeOrder.retrievalMethod}</strong></div>
                  {activeOrder.workerName && <div>Prepared by: <strong>{activeOrder.workerName}</strong></div>}
                </div>
              </div>
            </div>

            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Associated Lot Lines ({activeOrderLots.length})</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '6px' }}>LOT #</th>
                    <th style={{ padding: '6px' }}>DESCRIPTION</th>
                    <th style={{ padding: '6px' }}>SOURCE LOCATION</th>
                    <th style={{ padding: '6px' }}>TYPE</th>
                    <th style={{ padding: '6px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrderLots.map((lot: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 6px', fontWeight: 700 }}>{lot.lotNumber}</td>
                      <td style={{ padding: '8px 6px' }}>{lot.description}</td>
                      <td style={{ padding: '8px 6px', fontWeight: 600 }}>{lot.sourceLocation || 'N/A'}</td>
                      <td style={{ padding: '8px 6px' }}>{lot.type}</td>
                      <td style={{ padding: '8px 6px' }}>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', background: lot.status === 'Ready' ? '#ccfbf1' : lot.status === 'Pending' ? '#f1f5f9' : '#fee2e2', color: lot.status === 'Ready' ? '#0d9488' : lot.status === 'Pending' ? '#64748b' : '#991b1b', fontWeight: 600, fontSize: '0.75rem' }}>
                          {lot.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveOrder(null)} className="btn btn-primary">Close Details</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2. SHIPPING DISPATCH DETAILS INPUT MODAL */}
      {dispatchingOrderId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1600, padding: '1.5rem' }}>
          <div className="card animate-slide" style={{ maxWidth: '400px', width: '100%', padding: '1.5rem', background: 'white' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem' }}>Enter Tracking Details</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Entering the tracking details will notify the customer via Resend Email API and SMS alerts instantly.</p>
            
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Carrier / Tracking Number</label>
            <input 
              type="text"
              placeholder="e.g. UPS-1Z999AA10123456784"
              className="card"
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: '0.5rem' }}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setDispatchingOrderId(null); setTrackingNumber(''); }} className="btn" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleDispatchShipping} className="btn btn-primary" style={{ flex: 1 }} disabled={!trackingNumber.trim()}>Dispatch</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AuctionRunDetail;
