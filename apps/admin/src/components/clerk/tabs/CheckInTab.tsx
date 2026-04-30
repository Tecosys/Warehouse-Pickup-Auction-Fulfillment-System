import { useState, useEffect } from 'react';
import { Search, Clock, Loader2 } from 'lucide-react';

interface CheckInTabProps {
  onOpenRelease: (order: any) => void;
}

const CheckInTab: React.FC<CheckInTabProps> = ({ onOpenRelease }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [checkedInOrders, setCheckedInOrders] = useState<any[]>([]);
  const [awaitingOrders, setAwaitingOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      // In a real app, we'd have a specific summary endpoint
      // For now, search all and filter locally for the dashboard view
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/search?q= `);
      const data = await response.json();
      
      setCheckedInOrders(data.filter((o: any) => o.customerStatus === 'Checked In'));
      setAwaitingOrders(data.filter((o: any) => o.customerStatus === 'Booked'));
    } catch (error) {
      console.error("Fetch summary failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/search?q=${searchQuery}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCheckIn = async (orderId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/check-in`, {
        method: 'PATCH'
      });
      if (response.ok) {
        fetchSummary();
        handleSearch();
      }
    } catch (error) {
      console.error("Check-in failed", error);
    }
  };

  return (
    <div className="animate-fade">
      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={20} 
              style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input
              type="text"
              placeholder="Search by customer name, bidder number, or booking code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3.5rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-color)',
                fontSize: '1.125rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--status-teal)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>
          <button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="btn btn-primary" 
            style={{ padding: '0 2.5rem', borderRadius: '0.75rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isSearching && <Loader2 size={18} className="animate-spin" />}
            Search
          </button>
        </div>
        
        {searchResults.length > 0 && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Search Results</h3>
            <div className="search-results-grid" style={{ display: 'grid', gap: '1rem' }}>
              {searchResults.map(order => (
                <div key={order._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{order.customer?.name} <span style={{ color: 'var(--status-teal)', marginLeft: '0.5rem' }}>#{order.bidderNumber}</span></div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status: {order.customerStatus} • Booking: {order.bookingCode || 'N/A'}</div>
                  </div>
                  <div>
                    {order.customerStatus === 'Checked In' ? (
                      <button onClick={() => onOpenRelease(order)} className="btn btn-primary" style={{ background: 'var(--status-teal)' }}>Open Release</button>
                    ) : (
                      <button onClick={() => handleCheckIn(order._id)} className="btn">Check In</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Checked In Section */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: 'var(--status-teal)' }}>
                <Clock size={20} />
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Checked-in Today</h2>
            </div>
            <span className="badge badge-teal">{checkedInOrders.length} ACTIVE</span>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bidder #</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
              ) : checkedInOrders.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No one checked in yet.</td></tr>
              ) : checkedInOrders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, fontSize: '1.125rem' }}>#{order.bidderNumber}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{order.customer?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.appointmentTime ? new Date(order.appointmentTime).toLocaleTimeString() : 'No Appt'}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => onOpenRelease(order)}
                      className="btn" 
                      style={{ 
                        background: 'var(--status-teal)', 
                        color: 'white', 
                        border: 'none',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      Open Release
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Awaiting Arrival Section */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: 'var(--text-muted)' }}>
                <Clock size={20} />
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Awaiting Arrival Today</h2>
            </div>
            <span className="badge badge-gray">{awaitingOrders.length} REMAINING</span>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bidder #</th>
                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
              ) : awaitingOrders.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No scheduled arrivals.</td></tr>
              ) : awaitingOrders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{order.bidderNumber}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{order.customer?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.appointmentTime ? new Date(order.appointmentTime).toLocaleTimeString() : 'No Appt'}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <button onClick={() => handleCheckIn(order._id)} className="btn" style={{ padding: '0.5rem 1.5rem' }}>
                      Check In
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CheckInTab;
