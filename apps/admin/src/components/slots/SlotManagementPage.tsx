import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Trash2 } from 'lucide-react';
import { PageLoader, ButtonSpinner } from '../shared/LoadingComponents';

// ─── List View ─────────────────────────────────────────────────────────────────
const ListView = ({ slots, onDelete, onViewBookings }: any) => (
  <div className="card animate-fade" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
      <thead>
        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
          <th style={{ padding: '1rem 1.5rem' }}>DATE</th>
          <th style={{ padding: '1rem 1.5rem' }}>TIME SLOT</th>
          <th style={{ padding: '1rem 1.5rem' }}>CAPACITY</th>
          <th style={{ padding: '1rem 1.5rem' }}>BOOKED</th>
          <th style={{ padding: '1rem 1.5rem' }}>AVAILABILITY</th>
          <th style={{ padding: '1rem 1.5rem' }}>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {slots.length === 0 ? (
          <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No slots initialized yet. Use "Initialize Slots" to create a schedule.
          </td></tr>
        ) : slots.map((slot: any) => {
          const pct = Math.round((slot.currentBookings / slot.maxCapacity) * 100);
          const isFull = slot.currentBookings >= slot.maxCapacity;
          return (
            <tr key={slot._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>
                {new Date(slot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </td>
              <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', fontWeight: 600 }}>{slot.startTime} – {slot.endTime}</td>
              <td style={{ padding: '1rem 1.5rem' }}>{slot.maxCapacity}</td>
              <td style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>{slot.currentBookings}</td>
              <td style={{ padding: '1rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', minWidth: '80px' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: isFull ? '#ef4444' : pct > 70 ? '#f59e0b' : '#0d9488', borderRadius: '999px', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '99px',
                    background: isFull ? '#fee2e2' : '#ccfbf1',
                    color: isFull ? '#b91c1c' : '#0d9488'
                  }}>{isFull ? 'FULL' : `${slot.maxCapacity - slot.currentBookings} left`}</span>
                </div>
              </td>
              <td style={{ padding: '1rem 1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => onViewBookings(slot)}>
                    View ({slot.currentBookings})
                  </button>
                  <button className="btn" style={{ padding: '4px', color: 'var(--status-red)' }} onClick={() => onDelete(slot._id)} title="Delete slot">
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  </div>
);

// ─── Calendar View ─────────────────────────────────────────────────────────────
const CalendarView = ({ slots, weekStart, onNavigate, onInitClick }: { slots: any[]; weekStart: Date; onNavigate: (dir: number) => void; onInitClick: (date: string) => void }) => {
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Standard warehouse hours for the grid
  const times = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  return (
    <div className="animate-fade">
      {/* Calendar Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'white', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn" onClick={() => onNavigate(-1)} style={{ padding: '0.5rem' }}>← Prev Week</button>
          <button className="btn" onClick={() => onNavigate(0)} style={{ padding: '0.5rem 1rem' }}>Today</button>
          <button className="btn" onClick={() => onNavigate(1)} style={{ padding: '0.5rem' }}>Next Week →</button>
        </div>
        <div style={{ fontWeight: 700, color: 'var(--status-teal)' }}>
          {new Date(weekDates[0] + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – {new Date(weekDates[6] + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '1000px', border: '1px solid var(--border-color)', borderRadius: '0.75rem', background: 'white', overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(7, 1fr)`, background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 800 }}>TIME</div>
            {weekDates.map(d => {
              const isToday = d === new Date().toISOString().split('T')[0];
              return (
                <div key={d} style={{ 
                  padding: '1rem', textAlign: 'center', borderLeft: '1px solid var(--border-color)', 
                  background: isToday ? 'rgba(13,148,136,0.05)' : 'transparent'
                }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: isToday ? 'var(--status-teal)' : 'var(--text-main)' }}>
                    {new Date(d + 'T00:00:00').getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Rows */}
          {times.map(time => (
            <div key={time} style={{ display: 'grid', gridTemplateColumns: `80px repeat(7, 1fr)`, borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', background: '#fcfcfc' }}>{time}</div>
              {weekDates.map(date => {
                const slot = slots.find(s => s.date === date && s.startTime === time);
                return (
                  <div key={date} style={{ padding: '0.25rem', borderLeft: '1px solid var(--border-color)', minHeight: '60px', position: 'relative' }}>
                    {slot ? (
                      <div style={{
                        height: '100%', borderRadius: '0.375rem', padding: '0.4rem 0.5rem',
                        background: slot.currentBookings >= slot.maxCapacity ? '#fee2e2' : slot.currentBookings >= slot.maxCapacity * 0.7 ? '#fef3c7' : '#f0fdfa',
                        color: slot.currentBookings >= slot.maxCapacity ? '#b91c1c' : slot.currentBookings >= slot.maxCapacity * 0.7 ? '#92400e' : '#0d9488',
                        fontSize: '0.75rem', fontWeight: 700,
                        border: '1px solid currentColor',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{slot.currentBookings}/{slot.maxCapacity}</span>
                        </div>
                        <div style={{ fontSize: '0.6rem', marginTop: '2px', opacity: 0.8 }}>
                          {slot.currentBookings >= slot.maxCapacity ? 'FULL' : `${slot.maxCapacity - slot.currentBookings} left`}
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => onInitClick(date)}
                        className="hover-bg"
                        style={{ 
                          width: '100%', height: '100%', border: '1px dashed #e2e8f0', borderRadius: '0.375rem', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0',
                          background: 'none', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MonthView = ({ slots, referenceDate, onNavigate, onInitClick, onSelectWeek }: any) => {
  const d = new Date(referenceDate);
  const month = d.getMonth();
  const year = d.getFullYear();
  
  const firstDay = new Date(year, month, 1);
  
  // Grid start (Sunday of the first week)
  const startOffset = firstDay.getDay();
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startOffset);

  const days = Array.from({ length: 42 }, (_, i) => {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);
    return day;
  });

  const monthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="animate-fade">
      {/* Month Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'white', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn" onClick={() => onNavigate(-1)} style={{ padding: '0.5rem' }}>← Prev Month</button>
          <button className="btn" onClick={() => onNavigate(0)} style={{ padding: '0.5rem 1rem' }}>Today</button>
          <button className="btn" onClick={() => onNavigate(1)} style={{ padding: '0.5rem' }}>Next Month →</button>
        </div>
        <div style={{ fontWeight: 800, color: 'var(--status-teal)', fontSize: '1.125rem' }}>{monthLabel}</div>
      </div>

      <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.75rem', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>{day}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((day, i) => {
            const dateStr = day.toISOString().split('T')[0];
            const isCurrentMonth = day.getMonth() === month;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const daySlots = slots.filter((s: any) => s.date === dateStr);
            const totalCap = daySlots.reduce((a: any, s: any) => a + s.maxCapacity, 0);
            const totalBooked = daySlots.reduce((a: any, s: any) => a + s.currentBookings, 0);
            
            return (
              <div 
                key={i} 
                style={{ 
                  minHeight: '110px', 
                  padding: '0.5rem', 
                  borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid var(--border-color)',
                  borderBottom: i >= 35 ? 'none' : '1px solid var(--border-color)',
                  background: isCurrentMonth ? 'white' : '#fafafa',
                  opacity: isCurrentMonth ? 1 : 0.4,
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => onSelectWeek(day)}
              >
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 700, 
                  color: isToday ? 'var(--status-teal)' : 'var(--text-main)',
                  display: 'flex', justifyContent: 'space-between'
                }}>
                  <span style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    background: isToday ? 'var(--status-teal)' : 'transparent',
                    color: isToday ? 'white' : 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{day.getDate()}</span>
                </div>

                {daySlots.length > 0 ? (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>{daySlots.length} Slots</div>
                    <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${Math.round((totalBooked / totalCap) * 100)}%`, 
                        background: totalBooked >= totalCap ? 'var(--status-red)' : 'var(--status-teal)' 
                      }} />
                    </div>
                    <div style={{ fontSize: '0.6rem', marginTop: '4px', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {totalBooked}/{totalCap} Booked
                    </div>
                  </div>
                ) : (
                  isCurrentMonth && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onInitClick(dateStr); }}
                      style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                    >
                      <Plus size={16} />
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Initialize Slots Modal ────────────────────────────────────────────────────
const InitModal = ({ auctionId, preselectedDate, onClose, onSuccess, showToast }: any) => {
  const [config, setConfig] = useState({ start: '09:00', end: '17:00', interval: 30, capacity: 5 });
  const [saving, setSaving] = useState(false);
  // Generate next 14 days as date options
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set(preselectedDate ? [preselectedDate] : []));

  const toggleDate = (d: string) => {
    const next = new Set(selectedDates);
    next.has(d) ? next.delete(d) : next.add(d);
    setSelectedDates(next);
  };

  const handleSubmit = async () => {
    if (selectedDates.size === 0) return showToast('Select at least one date', 'error');
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/slots/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionRunId: auctionId, dates: Array.from(selectedDates).sort(), config })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Created ${data.created} slots successfully!`);
        onSuccess();
        onClose();
      } else throw new Error(data.error);
    } catch (e: any) {
      showToast(e.message || 'Failed to initialize slots', 'error');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div className="card animate-slide" style={{ width: '100%', maxWidth: '540px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-main)' }}>Initialize Pickup Slots</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }} className="hover-bg">
            <X size={18} />
          </button>
        </div>

        {/* Date picker */}
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Select Dates</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {dateOptions.map(d => (
            <button key={d} onClick={() => toggleDate(d)} style={{
              padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '0.5rem', border: '2px solid',
              borderColor: selectedDates.has(d) ? 'var(--status-teal)' : 'var(--border-color)',
              background: selectedDates.has(d) ? 'rgba(13,148,136,0.08)' : 'white',
              color: selectedDates.has(d) ? 'var(--status-teal)' : 'var(--text-muted)',
              cursor: 'pointer'
            }}>
              {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </button>
          ))}
        </div>

        {/* Time config */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {[['Start Time', 'start', 'time'], ['End Time', 'end', 'time']].map(([label, key, type]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>{label}</label>
              <input type={type} value={(config as any)[key]} onChange={e => setConfig({ ...config, [key]: e.target.value })}
                className="card" style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          {[['Interval (min)', 'interval'], ['Capacity per Slot', 'capacity']].map(([label, key]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>{label}</label>
              <input type="number" value={(config as any)[key]} onChange={e => setConfig({ ...config, [key]: parseInt(e.target.value) })}
                className="card" style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem' }} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" style={{ flex: 1, padding: '0.875rem' }} onClick={handleSubmit} disabled={saving}>
            {saving ? <><ButtonSpinner /> Creating...</> : `Create Slots (${selectedDates.size} date${selectedDates.size !== 1 ? 's' : ''})`}
          </button>
          <button className="btn" style={{ flex: 1, padding: '0.875rem' }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Clone Slots Modal ──────────────────────────────────────────────────────────
const CloneModal = ({ auctionId, onClose, onSuccess, showToast }: any) => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [fromAuctionId, setFromAuctionId] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Generate next 14 days as date options
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set([]));

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auctions`)
      .then(r => r.json())
      .then(data => {
        setAuctions(data);
        const previous = data.find((a: any) => a._id !== auctionId);
        if (previous) {
          setFromAuctionId(previous._id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [auctionId]);

  const toggleDate = (d: string) => {
    const next = new Set(selectedDates);
    next.has(d) ? next.delete(d) : next.add(d);
    setSelectedDates(next);
  };

  const handleSubmit = async () => {
    if (!fromAuctionId) return showToast('Select a source auction run to clone from', 'error');
    if (selectedDates.size === 0) return showToast('Select at least one date', 'error');
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/slots/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fromAuctionRunId: fromAuctionId, 
          toAuctionRunId: auctionId, 
          newDates: Array.from(selectedDates).sort() 
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Cloned slots successfully!`);
        onSuccess();
        onClose();
      } else throw new Error(data.error);
    } catch (e: any) {
      showToast(e.message || 'Failed to clone slots', 'error');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div className="card animate-slide" style={{ width: '100%', maxWidth: '540px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-main)' }}>Copy Last Run Settings</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }} className="hover-bg">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading auctions...</div>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Source Auction Run</label>
              <select 
                value={fromAuctionId} 
                onChange={e => setFromAuctionId(e.target.value)} 
                className="card" 
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <option value="">-- Select Source Auction --</option>
                {auctions.map((a: any) => (
                  <option key={a._id} value={a._id} disabled={a._id === auctionId}>
                    {a.title || `Auction #${a.auctionNumber}`} {a._id === auctionId ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date picker */}
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Select Target Dates</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
              {dateOptions.map(d => (
                <button key={d} onClick={() => toggleDate(d)} style={{
                  padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '0.5rem', border: '2px solid',
                  borderColor: selectedDates.has(d) ? 'var(--status-teal)' : 'var(--border-color)',
                  background: selectedDates.has(d) ? 'rgba(13,148,136,0.08)' : 'white',
                  color: selectedDates.has(d) ? 'var(--status-teal)' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}>
                  {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" style={{ flex: 1, padding: '0.875rem' }} onClick={handleSubmit} disabled={saving || !fromAuctionId || selectedDates.size === 0}>
                {saving ? <><ButtonSpinner /> Cloning...</> : `Clone Settings (${selectedDates.size} date${selectedDates.size !== 1 ? 's' : ''})`}
              </button>
              <button className="btn" style={{ flex: 1, padding: '0.875rem' }} onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

// ─── Bookings Modal (who is in this slot) ─────────────────────────────────────
const SlotBookingsModal = ({ slot, onClose, onReschedule }: any) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/slots/${slot._id}/bookings`)
      .then(r => r.json()).then(setOrders).catch(console.error)
      .finally(() => setLoading(false));
  }, [slot._id]);

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div className="card animate-slide" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', maxHeight: '80vh', overflowY: 'auto', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)' }}>Bookings for {slot.date}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{slot.startTime} – {slot.endTime} · {slot.currentBookings}/{slot.maxCapacity} booked</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }} className="hover-bg">
            <X size={18} />
          </button>
        </div>
        {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
          : orders.length === 0 ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No bookings in this slot yet.</div>
          : orders.map((o: any) => (
            <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{o.customer?.name || `Bidder #${o.bidderNumber}`}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{o.bookingCode} · #{o.bidderNumber}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '99px', background: o.fulfillmentStatus === 'Ready' ? '#ccfbf1' : '#fef3c7', color: o.fulfillmentStatus === 'Ready' ? '#0d9488' : '#92400e' }}>
                  {o.fulfillmentStatus}
                </span>
                <button className="btn" style={{ fontSize: '0.75rem', padding: '4px 10px', color: 'var(--status-teal)', borderColor: 'var(--status-teal)' }} onClick={() => onReschedule(o)}>
                  Reschedule
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>,
    document.body
  );
};

// ─── Reschedule Modal ──────────────────────────────────────────────────────────
const RescheduleModal = ({ order, slots, onClose, onSuccess, showToast }: any) => {
  const [newSlotId, setNewSlotId] = useState('');
  const [saving, setSaving] = useState(false);

  const handleReschedule = async () => {
    if (!newSlotId) return;
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/slots/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order._id, newSlotId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${order.customer?.name || `Bidder #${order.bidderNumber}`} rescheduled!`);
        onSuccess();
        onClose();
      } else throw new Error(data.error);
    } catch (e: any) {
      showToast(e.message || 'Reschedule failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const availableSlots = slots.filter((s: any) => s.currentBookings < s.maxCapacity && s._id !== order.selectedSlot);

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div className="card animate-slide" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)' }}>Reschedule: {order.customer?.name || `Bidder #${order.bidderNumber}`}</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }} className="hover-bg">
            <X size={18} />
          </button>
        </div>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Select New Time Slot</label>
        <select value={newSlotId} onChange={e => setNewSlotId(e.target.value)} className="card" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem' }}>
          <option value="">-- Choose a slot --</option>
          {availableSlots.map((s: any) => (
            <option key={s._id} value={s._id}>
              {s.date} · {s.startTime}–{s.endTime} ({s.maxCapacity - s.currentBookings} spots left)
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" style={{ flex: 1, padding: '0.875rem', background: 'var(--status-teal)' }} onClick={handleReschedule} disabled={!newSlotId || saving}>
            {saving ? <><ButtonSpinner /> Saving...</> : 'Confirm Reschedule'}
          </button>
          <button className="btn" style={{ flex: 1, padding: '0.875rem' }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
interface SlotManagementPageProps {
  user: any;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  selectedAuction?: any;
}

const SlotManagementPage: React.FC<SlotManagementPageProps> = ({ user, showToast, selectedAuction }) => {
  const [viewType, setViewType] = useState<'List' | 'Week' | 'Month'>('List');
  const [activeAuction, setActiveAuction] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showInitModal, setShowInitModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [initDate, setInitDate] = useState<string | null>(null);
  const [viewingSlot, setViewingSlot] = useState<any>(null);
  const [reschedulingOrder, setReschedulingOrder] = useState<any>(null);
  
  const [currentReferenceDate, setCurrentReferenceDate] = useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });

  const canManageSlots = ['Admin', 'Clerk', 'Support'].includes(user?.role);

  const navigate = (direction: number) => {
    const next = new Date(currentReferenceDate);
    if (direction === 0) {
      setCurrentReferenceDate(new Date());
      return;
    }
    
    if (viewType === 'Week') {
      next.setDate(next.getDate() + (direction * 7));
    } else {
      next.setMonth(next.getMonth() + direction);
    }
    setCurrentReferenceDate(next);
  };

  const getWeekStart = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    return new Date(date.setDate(diff));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      let auction = selectedAuction;
      if (!auction) {
        const auctionRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auctions/active`);
        if (!auctionRes.ok) throw new Error('No active auction');
        auction = await auctionRes.json();
      }
      setActiveAuction(auction);

      if (auction && auction._id) {
        const slotsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/slots/all/${auction._id}`);
        const slotsData = await slotsRes.json();
        setSlots(Array.isArray(slotsData) ? slotsData : []);
      } else {
        setSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedAuction?._id]);

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Delete this slot? This cannot be undone.')) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/slots/${slotId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      showToast('Slot deleted');
      fetchData();
    } else {
      showToast(data.error || 'Could not delete slot', 'error');
    }
  };

  if (loading) return <PageLoader message="Loading slot schedule..." />;

  const totalCapacity = slots.reduce((a, s) => a + s.maxCapacity, 0);
  const totalBooked = slots.reduce((a, s) => a + s.currentBookings, 0);
  const availableSlots = slots.filter(s => s.currentBookings < s.maxCapacity).length;

  return (
    <>
      {showInitModal && activeAuction && (
        <InitModal 
          auctionId={activeAuction._id} 
          preselectedDate={initDate}
          onClose={() => { setShowInitModal(false); setInitDate(null); }} 
          onSuccess={fetchData} 
          showToast={showToast} 
        />
      )}
      {showCloneModal && activeAuction && (
        <CloneModal
          auctionId={activeAuction._id}
          onClose={() => setShowCloneModal(false)}
          onSuccess={fetchData}
          showToast={showToast}
        />
      )}
      {viewingSlot && (
        <SlotBookingsModal
          slot={viewingSlot}
          onClose={() => setViewingSlot(null)}
          onReschedule={(order: any) => { setReschedulingOrder(order); setViewingSlot(null); }}
        />
      )}
      {reschedulingOrder && (
        <RescheduleModal
          order={reschedulingOrder}
          slots={slots}
          onClose={() => setReschedulingOrder(null)}
          onSuccess={fetchData}
          showToast={showToast}
        />
      )}

      <div className="animate-slide">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Slot Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {activeAuction ? `${activeAuction.title || `Auction #${activeAuction.auctionNumber}`}` : 'No active auction'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '4px' }}>
            {(['List', 'Week', 'Month'] as const).map(v => (
              <button key={v} onClick={() => setViewType(v)} style={{ padding: '6px 14px', border: 'none', background: viewType === v ? '#f1f5f9' : 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: viewType === v ? 'var(--status-teal)' : 'var(--text-muted)' }}>{v}</button>
            ))}
          </div>
          {canManageSlots && (
            <>
              <button className="btn" style={{ background: 'white', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} onClick={() => setShowCloneModal(true)}>
                Copy Last Run Settings
              </button>
              <button className="btn btn-primary" onClick={() => setShowInitModal(true)}>
                <Plus size={18} /> Initialize Slots
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Slots', val: slots.length, color: '#6366f1' },
          { label: 'Total Capacity', val: totalCapacity, color: 'var(--status-teal)' },
          { label: 'Booked', val: totalBooked, color: 'var(--status-amber)' },
          { label: 'Slots Available', val: availableSlots, color: 'var(--status-green)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ borderTop: `3px solid ${s.color}`, padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {viewType === 'List' && <ListView slots={slots} onDelete={handleDeleteSlot} onViewBookings={setViewingSlot} />}
      
      {viewType === 'Week' && (
        <CalendarView 
          slots={slots} 
          weekStart={getWeekStart(currentReferenceDate)} 
          onNavigate={navigate} 
          onInitClick={(date) => { setInitDate(date); setShowInitModal(true); }}
        />
      )}

      {viewType === 'Month' && (
        <MonthView 
          slots={slots} 
          referenceDate={currentReferenceDate} 
          onNavigate={navigate} 
          onInitClick={(date: string) => { setInitDate(date); setShowInitModal(true); }}
          onSelectWeek={(day: Date) => { setCurrentReferenceDate(day); setViewType('Week'); }}
        />
      )}
    </div>
    </>
  );
};

export default SlotManagementPage;
