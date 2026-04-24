import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Settings, 
  Search, 
  Filter, 
  Download, 
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MoreVertical,
  X,
  ChevronDown
} from 'lucide-react';

const CalendarView = () => {
  const days = ['MON 21', 'TUE 22', 'WED 23', 'THU 24', 'FRI 25', 'SAT 26', 'SUN 27'];
  const times = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM'];
  
  const mockSlots = [
    { day: 0, time: 0, range: '08:00 - 09:00', booked: 1, capacity: 10, status: 'available' },
    { day: 0, time: 1, range: '09:00 - 10:00', booked: 10, capacity: 10, status: 'full' },
    { day: 1, time: 1, range: '09:00 - 10:00', booked: 2, capacity: 10, status: 'available' },
    { day: 1, time: 2, range: '10:00 - 11:00', booked: 0, capacity: 10, status: 'available' },
    { day: 2, time: 2, range: '10:00 - 11:00', booked: 5, capacity: 5, status: 'full' },
    { day: 2, time: 3, range: '11:00 - 12:00', booked: 4, capacity: 5, status: 'filling' },
    { day: 3, time: 0, range: '08:00 - 09:00', booked: 0, capacity: 10, status: 'new' },
    { day: 3, time: 2, range: '10:00 - 11:00', booked: 3, capacity: 10, status: 'available' },
    { day: 0, time: 3, range: '11:00 - 12:00', booked: 7, capacity: 10, status: 'filling' },
    { day: 4, time: 4, range: '12:00 - 01:00', booked: 8, capacity: 8, status: 'full' },
  ];

  const getSlot = (d: number, t: number) => mockSlots.find(s => s.day === d && s.time === t);

  return (
    <div className="calendar-grid animate-fade" style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: '1000px', border: '1px solid var(--border-color)', borderRadius: '0.75rem', background: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(7, 1fr)', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
          <div style={{ padding: '1rem' }}></div>
          {days.map((day, i) => (
            <div key={i} style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, borderLeft: '1px solid var(--border-color)', color: i === 3 ? 'var(--status-teal)' : 'inherit' }}>
              {day}
            </div>
          ))}
        </div>

        {times.map((time, tIdx) => (
          <div key={tIdx} style={{ display: 'grid', gridTemplateColumns: '100px repeat(7, 1fr)', borderBottom: tIdx === times.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
            <div style={{ padding: '1.5rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{time}</div>
            {Array.from({ length: 7 }).map((_, dIdx) => {
              const slot = getSlot(dIdx, tIdx);
              return (
                <div key={dIdx} style={{ padding: '0.5rem', borderLeft: '1px solid var(--border-color)', minHeight: '100px', position: 'relative' }}>
                  {slot ? (
                    <div className="animate-fade" style={{ 
                      height: '100%', borderRadius: '0.5rem', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: '1px solid transparent',
                      ...(slot.status === 'full' ? { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2' } : 
                         slot.status === 'filling' ? { background: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7' } :
                         slot.status === 'new' ? { background: 'white', color: 'var(--status-teal)', border: '2px solid var(--status-teal)' } :
                         { background: '#f0fdfa', color: '#0d9488', border: '1px solid #ccfbf1' })
                    }}>
                      <div style={{ marginBottom: '0.25rem' }}>{slot.range}</div>
                      <div style={{ fontSize: '0.875rem' }}>{slot.booked}/{slot.capacity}</div>
                      {slot.status === 'new' && <div style={{ marginTop: '0.5rem' }}>NEW SLOT</div>}
                    </div>
                  ) : (
                    <div style={{ height: '100%', border: '1px dashed #e2e8f0', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2e8f0', cursor: 'pointer' }}>
                      <Plus size={20} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const ListView = () => (
  <div className="animate-fade">
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
          <th style={{ padding: '1rem' }}>DATE</th>
          <th style={{ padding: '1rem' }}>DAY</th>
          <th style={{ padding: '1rem' }}>TIME</th>
          <th style={{ padding: '1rem' }}>CAPACITY</th>
          <th style={{ padding: '1rem' }}>BOOKED</th>
          <th style={{ padding: '1rem' }}>AVAILABLE</th>
          <th style={{ padding: '1rem' }}>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {[
          { date: 'Oct 21, 2024', day: 'Monday', time: '08:00 AM - 09:00 AM', cap: 10, booked: 1, avail: 9 },
          { date: 'Oct 21, 2024', day: 'Monday', time: '09:00 AM - 10:00 AM', cap: 10, booked: 10, avail: 0, full: true },
          { date: 'Oct 22, 2024', day: 'Tuesday', time: '09:00 AM - 10:00 AM', cap: 10, booked: 2, avail: 8 },
        ].map((slot, i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: slot.full ? '#fffbeb' : 'none' }}>
            <td style={{ padding: '1rem' }}>{slot.date}</td>
            <td style={{ padding: '1rem', fontWeight: 600 }}>{slot.day}</td>
            <td style={{ padding: '1rem' }}>{slot.time}</td>
            <td style={{ padding: '1rem' }}>{slot.cap}</td>
            <td style={{ padding: '1rem', fontWeight: 700, color: slot.full ? 'var(--status-red)' : 'inherit' }}>{slot.booked}</td>
            <td style={{ padding: '1rem' }}>{slot.avail}</td>
            <td style={{ padding: '1rem' }}>
              <button className="btn" style={{ padding: '4px' }}><MoreVertical size={16} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SlotModal = ({ onClose }: any) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
    <div className="card animate-slide" style={{ width: '500px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add Pickup Slot</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
      </div>
      
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>DATE</label>
          <input type="date" className="card" style={{ width: '100%', padding: '0.75rem' }} defaultValue="2024-10-24" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>START TIME</label>
            <input type="time" className="card" style={{ width: '100%', padding: '0.75rem' }} defaultValue="08:00" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>END TIME</label>
            <input type="time" className="card" style={{ width: '100%', padding: '0.75rem' }} defaultValue="09:00" />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>MAX APPOINTMENTS PER SLOT</label>
          <input type="number" className="card" style={{ width: '100%', padding: '0.75rem' }} defaultValue="10" />
        </div>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
        <button className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }} onClick={onClose}>Save Slot</button>
        <button className="btn" style={{ flex: 1, padding: '0.75rem' }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>
);

const SlotManagementPage = () => {
  const [activeTab, setActiveTab] = useState('Schedule View');
  const [viewType, setViewType] = useState('Calendar');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="slot-management animate-slide">
      {showModal && <SlotModal onClose={() => setShowModal(false)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Slot Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure and manage pickup appointment slots</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
             <span style={{ color: 'var(--text-muted)' }}>Viewing:</span>
             <span>Auction #043</span>
             <ChevronDown size={16} />
          </div>
          <div style={{ display: 'flex', background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '4px' }}>
            <button onClick={() => setViewType('Calendar')} style={{ padding: '6px 12px', border: 'none', background: viewType === 'Calendar' ? '#f1f5f9' : 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: viewType === 'Calendar' ? 'var(--status-teal)' : 'var(--text-muted)' }}><CalendarIcon size={16} /> Calendar</button>
            <button onClick={() => setViewType('List')} style={{ padding: '6px 12px', border: 'none', background: viewType === 'List' ? '#f1f5f9' : 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: viewType === 'List' ? 'var(--status-teal)' : 'var(--text-muted)' }}><List size={16} /> List</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add Slot
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {['Schedule View', 'Slot Settings', 'Bookings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.75rem 0', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--status-teal)' : '2px solid transparent', color: activeTab === tab ? 'var(--status-teal)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Schedule View' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="btn" style={{ padding: '6px' }}><ChevronLeft size={18} /></button>
                <button className="btn" style={{ fontSize: '0.875rem' }}>Today</button>
                <button className="btn" style={{ padding: '6px' }}><ChevronRight size={18} /></button>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>October 21 - 27, 2024</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-teal)' }}></div> AVAILABLE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-amber)' }}></div> FILLING</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-red)' }}></div> FULL</div>
            </div>
          </div>
          {viewType === 'Calendar' ? <CalendarView /> : <ListView />}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>TOTAL CAPACITY</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>240 Slots</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>BOOKED SLOTS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>184 <span style={{ color: 'var(--status-teal)', fontSize: '0.875rem' }}>76% Utilization</span></div>
            </div>
            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem' }}>PENDING APPROVALS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--status-amber)' }}>12</div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'Slot Settings' && (
        <div style={{ maxWidth: '800px' }}>
          <div className="card" style={{ background: '#f0fdfa', border: '1px solid var(--status-teal)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Copy color="var(--status-teal)" size={24} />
              <div>
                <h4 style={{ fontWeight: 700 }}>Copy Setup from Previous Auction</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Reuse the slot schedule from Auction #042.</p>
              </div>
            </div>
            <button className="btn btn-primary">Copy Settings</button>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Weekly Pickup Template</h3>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '150px' }}>
                    <input type="checkbox" defaultChecked={day !== 'Saturday' && day !== 'Sunday'} />
                    <span style={{ fontWeight: 600 }}>{day}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="time" defaultValue="08:00" className="card" style={{ padding: '0.5rem' }} />
                    <span>to</span>
                    <input type="time" defaultValue="17:00" className="card" style={{ padding: '0.5rem' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto' }}>
                     <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Interval</span>
                     <select className="card" style={{ padding: '0.5rem' }}>
                       <option>15 min</option>
                       <option>30 min</option>
                     </select>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Apply Template to Auction #043</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Bookings' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
             <div style={{ display: 'flex', gap: '1rem' }}>
               <div style={{ position: 'relative', width: '300px' }}>
                 <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                 <input type="text" placeholder="Search by name, bidder #..." className="card" style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem' }} />
               </div>
               <button className="btn"><Filter size={16} /> Filters</button>
             </div>
             <button className="btn btn-primary"><UserPlus size={18} /> Book Appointment</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>CODE</th>
                <th style={{ padding: '1rem' }}>BIDDER #</th>
                <th style={{ padding: '1rem' }}>CUSTOMER</th>
                <th style={{ padding: '1rem' }}>DATE / TIME</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem' }}>VIA</th>
                <th style={{ padding: '1rem' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {[
                { code: 'BK-9021', bidder: '8221', name: 'David Miller', date: 'Oct 24', time: '09:15 AM', status: 'Booked', via: 'Portal' },
                { code: 'BK-9018', bidder: '7442', name: 'Sarah Wilson', date: 'Oct 24', time: '10:00 AM', status: 'Rescheduled', via: 'Staff' },
                { code: 'BK-8992', bidder: '9012', name: 'James Chen', date: 'Oct 23', time: '02:30 PM', status: 'Completed', via: 'Portal' },
              ].map((b, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{b.code}</td>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>{b.bidder}</td>
                  <td style={{ padding: '1rem' }}>{b.name}</td>
                  <td style={{ padding: '1rem' }}>{b.date} • {b.time}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', background: b.status === 'Booked' ? '#f0f9ff' : b.status === 'Completed' ? '#f0fdf4' : '#fffbeb', color: b.status === 'Booked' ? '#0369a1' : b.status === 'Completed' ? '#15803d' : '#9a3412' }}>{b.status}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>{b.via}</td>
                  <td style={{ padding: '1rem' }}><button className="btn">Reschedule</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SlotManagementPage;
