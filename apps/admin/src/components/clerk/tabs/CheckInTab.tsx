import { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, List } from 'lucide-react';
import { ButtonSpinner } from '../../shared/LoadingComponents';

interface CheckInTabProps {
  onOpenRelease: (order: any) => void;
  selectedAuction?: any;
  user: any;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CheckInTab: React.FC<CheckInTabProps> = ({ onOpenRelease, selectedAuction, user, showToast }) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [checkedIn, setCheckedIn] = useState<any[]>([]);
  const [awaiting, setAwaiting] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Checked In' | 'Booked' | 'Awaiting Choice' | 'Shipping'>('All');
  const [loading, setLoading] = useState(false);

  // Fetch lists (Checked-in, Awaiting, and All orders) scoped to active auction
  const fetchLists = async () => {
    if (!selectedAuction?._id) return;
    try {
      setLoading(true);
      // Fetch checked-in orders for active run
      const ciRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders?customerStatus=Checked In&auctionRunId=${selectedAuction._id}`);
      const ciData = await ciRes.json();
      setCheckedIn(ciData);

      // Fetch booked orders (awaiting arrival) for active run
      const awRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders?customerStatus=Booked&auctionRunId=${selectedAuction._id}`);
      const awData = await awRes.json();
      setAwaiting(awData);

      // Fetch all orders for active run to populate full list
      const allRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders?auctionRunId=${selectedAuction._id}`);
      const allData = await allRes.json();
      setAllOrders(allData);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, [selectedAuction?._id]);

  // Search logic scoped to active auction
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.length > 1) {
        if (!selectedAuction?._id) return;
        setLoading(true);
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders?search=${search}&auctionRunId=${selectedAuction._id}`);
          const data = await res.json();
          setSearchResults(data);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedAuction?._id]);

  const handleCheckIn = async (orderId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerStatus: 'Checked In',
          staffUser: user?.name || 'Staff'
        })
      });

      if (res.ok) {
        setSearch('');
        showToast('Customer successfully checked in!', 'success');
        fetchLists();
      } else {
        showToast('Check-in failed.', 'error');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      showToast('Network error during check-in.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    switch (activeFilter) {
      case 'Checked In':
        return allOrders.filter(o => o.customerStatus === 'Checked In');
      case 'Booked':
        return allOrders.filter(o => o.customerStatus === 'Booked');
      case 'Awaiting Choice':
        return allOrders.filter(o => o.customerStatus === 'Awaiting Choice');
      case 'Shipping':
        return allOrders.filter(o => o.retrievalMethod === 'Shipping' || o.customerStatus === 'Shipping Selected');
      default:
        return allOrders;
    }
  };

  const getFulfillmentBadgeClass = (status: string) => {
    if (status === 'Ready') return 'badge-teal';
    if (status === 'In Progress') return 'badge-amber';
    return 'badge-gray';
  };

  const getPaymentBadgeClass = (status: string) => {
    if (status === 'Paid') return 'badge-teal';
    if (status === 'Unpaid') return 'badge-red';
    return 'badge-gray';
  };

  return (
    <div className="animate-fade">
      <div className="responsive-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
          Customer Check-In — {selectedAuction ? `Auction Run #${selectedAuction.auctionNumber}` : 'Active Run'}
        </h2>
        
        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '3rem' }}>
          <Search size={24} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search Bidder Number, Name, or Booking Code..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="card" 
            style={{ 
              width: '100%', 
              padding: '1.5rem 1.5rem 1.5rem 4rem', 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              border: searchResults.length > 0 ? '2px solid var(--status-teal)' : '1px solid var(--border-color)',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
            }} 
          />
          {loading && (
            <div style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)' }}>
              <ButtonSpinner />
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="card" style={{ marginTop: '-2.5rem', marginBottom: '3rem', padding: '0.5rem', borderTop: 'none', borderRadius: '0 0 1rem 1rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, position: 'relative' }}>
            {searchResults.map(result => (
              <div 
                key={result._id} 
                onClick={() => {
                  if (result.customerStatus === 'Checked In') {
                    onOpenRelease(result);
                  } else {
                    handleCheckIn(result._id);
                  }
                }}
                style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '0.5rem' }} 
                className="hover-bg"
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>#{result.bidderNumber} — {result.customer?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {result.appointmentTime ? `Appt: ${new Date(result.appointmentTime).toLocaleString()}` : 'No Appointment'} | Status: {result.customerStatus}
                  </div>
                </div>
                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  {result.customerStatus === 'Checked In' ? 'Go to Release' : 'Check In'}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="responsive-grid-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          {/* Checked In List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--status-teal)' }}>
              <CheckCircle size={18} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase' }}>Checked-In Today ({checkedIn.length})</h3>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {checkedIn.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'white', borderRadius: '0.75rem', border: '1px dashed var(--border-color)' }}>
                  No checked-in bidders.
                </div>
              ) : (
                checkedIn.map(b => (
                  <div key={b._id} className="card responsive-checkin-row" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>#{b.bidderNumber} {b.customer?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {b.fulfillmentStatus}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--status-teal)', background: '#f0fdfa', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-flex', alignItems: 'center' }}>ARRIVED</span>
                      <button 
                        onClick={() => onOpenRelease(b)}
                        className="btn" 
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        Release
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Awaiting List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
              <Clock size={18} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase' }}>Awaiting Arrival ({awaiting.length})</h3>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {awaiting.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'white', borderRadius: '0.75rem', border: '1px dashed var(--border-color)' }}>
                  No bookings scheduled for today.
                </div>
              ) : (
                awaiting.map(b => {
                  const isLate = b.appointmentTime && new Date() > new Date(b.appointmentTime);
                  return (
                    <div key={b._id} className="card responsive-checkin-row" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8, borderLeft: isLate ? '4px solid var(--status-red)' : '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          #{b.bidderNumber} {b.customer?.name}
                          {isLate && (
                            <span style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--status-red)', background: '#fee2e2', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', marginLeft: '0.5rem' }}>LATE</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Appt: {b.appointmentTime ? new Date(b.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                      </div>
                      <button 
                        onClick={() => handleCheckIn(b._id)}
                        className="btn" 
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        Check In
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Global Orders Queue List */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <List size={20} color="var(--status-teal)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>All Orders Queue</h3>
          </div>

          {/* Filter Bar */}
          <div className="tabs-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {(['All', 'Checked In', 'Booked', 'Awaiting Choice', 'Shipping'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`btn ${activeFilter === filter ? 'btn-primary' : ''}`}
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: '0.375rem', 
                  background: activeFilter === filter ? 'var(--status-teal)' : 'none',
                  border: activeFilter === filter ? 'none' : '1px solid var(--border-color)',
                  color: activeFilter === filter ? 'white' : 'var(--text-main)',
                  fontWeight: 600
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Table List */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700 }}>Bidder</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700 }}>Customer Name</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700 }}>Appointment</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700 }}>Status Badges</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 700 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredOrders().length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No orders found matching this filter.
                    </td>
                  </tr>
                ) : (
                  getFilteredOrders().map(o => (
                    <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>#{o.bidderNumber}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                        <div>{o.customer?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{o.bookingCode}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {o.retrievalMethod === 'Shipping' || o.customerStatus === 'Shipping Selected' ? (
                          <span style={{ color: 'var(--status-blue)', fontWeight: 600 }}>Shipping</span>
                        ) : o.appointmentTime ? (
                          <span>{new Date(o.appointmentTime).toLocaleDateString()} at {new Date(o.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        ) : (
                          <span style={{ color: 'var(--status-amber)', fontWeight: 600 }}>No Appointment</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          <span className={`badge ${o.customerStatus === 'Checked In' ? 'badge-teal' : o.customerStatus === 'Picked Up' ? 'badge-teal' : 'badge-gray'}`} style={{ fontSize: '0.65rem' }}>
                            {o.customerStatus}
                          </span>
                          <span className={`badge ${getFulfillmentBadgeClass(o.fulfillmentStatus)}`} style={{ fontSize: '0.65rem' }}>
                            {o.fulfillmentStatus === 'Ready' ? 'Prepared' : 'Not Prepared'}
                          </span>
                          <span className={`badge ${getPaymentBadgeClass(o.paymentStatus)}`} style={{ fontSize: '0.65rem' }}>
                            {o.paymentStatus || 'Unpaid'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        {o.customerStatus === 'Checked In' ? (
                          <button onClick={() => onOpenRelease(o)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', background: 'var(--status-teal)' }}>
                            Release
                          </button>
                        ) : o.customerStatus === 'Picked Up' || o.customerStatus === 'Cancelled' ? (
                          <button onClick={() => onOpenRelease(o)} className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                            View
                          </button>
                        ) : (
                          <button onClick={() => handleCheckIn(o._id)} className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                            Check In
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInTab;
