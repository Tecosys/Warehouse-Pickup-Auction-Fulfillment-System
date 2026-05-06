import { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle } from 'lucide-react';
import { ButtonSpinner } from '../../shared/LoadingComponents';

interface CheckInTabProps {
  onOpenRelease: (order: any) => void;
}

const CheckInTab: React.FC<CheckInTabProps> = ({ onOpenRelease }) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [checkedIn, setCheckedIn] = useState<any[]>([]);
  const [awaiting, setAwaiting] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch initial lists (Checked-in today, Awaiting today)
  const fetchLists = async () => {
    try {
      setLoading(true);
      // Fetch checked-in orders
      const ciRes = await fetch('http://localhost:5000/api/orders?customerStatus=Checked In');
      const ciData = await ciRes.json();
      setCheckedIn(ciData);

      // Fetch booked orders (awaiting arrival)
      const awRes = await fetch('http://localhost:5000/api/orders?customerStatus=Booked');
      const awData = await awRes.json();
      setAwaiting(awData);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  // Search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.length > 1) {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:5000/api/orders?search=${search}`);
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
  }, [search]);

  const handleCheckIn = async (orderId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerStatus: 'Checked In' })
      });

      if (res.ok) {
        setSearch('');
        fetchLists();
      }
    } catch (error) {
      console.error('Check-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>Customer Check-In</h2>
        
        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '3rem' }}>
          <Search size={24} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search Bidder Number or Booking Code..." 
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
          <div className="card" style={{ marginTop: '-2.5rem', marginBottom: '3rem', padding: '0.5rem', borderTop: 'none', borderRadius: '0 0 1rem 1rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            {searchResults.map(result => (
              <div 
                key={result._id} 
                onClick={() => handleCheckIn(result._id)}
                style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: '0.5rem' }} 
                className="hover-bg"
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem' }}>#{result.bidderNumber} — {result.customer?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {result.appointmentTime ? `Appt: ${new Date(result.appointmentTime).toLocaleString()}` : 'No Appointment'}
                  </div>
                </div>
                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Check In</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Checked In List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--status-teal)' }}>
              <CheckCircle size={18} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase' }}>Checked-In Today ({checkedIn.length})</h3>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {checkedIn.map(b => (
                <div key={b._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>#{b.bidderNumber} {b.customer?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {b.fulfillmentStatus}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--status-teal)', background: '#f0fdfa', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>ARRIVED</span>
                    <button 
                      onClick={() => onOpenRelease(b)}
                      className="btn" 
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      Release
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Awaiting List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
              <Clock size={18} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase' }}>Awaiting Arrival ({awaiting.length})</h3>
            </div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {awaiting.map(b => (
                <div key={b._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>#{b.bidderNumber} {b.customer?.name}</div>
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInTab;
