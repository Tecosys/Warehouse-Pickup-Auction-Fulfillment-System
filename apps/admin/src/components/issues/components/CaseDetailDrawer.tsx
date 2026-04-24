import { useState } from 'react';
import { X, Plus, Send, MessageSquare, Clock, User, CheckCircle2 } from 'lucide-react';

interface CaseDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: any;
}

const CaseDetailDrawer: React.FC<CaseDetailDrawerProps> = ({ isOpen, onClose, caseData }) => {
  const [newNote, setNewNote] = useState('');

  if (!caseData) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: isOpen ? 0 : '-600px',
      width: '600px',
      height: '100vh',
      background: 'white',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
      transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace' }}>{caseData.id}</h2>
            <span style={{ 
              fontSize: '0.625rem', 
              fontWeight: 900, 
              padding: '0.2rem 0.6rem', 
              borderRadius: '1rem', 
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--status-blue)',
              border: '1px solid currentColor'
            }}>
              {caseData.type}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-amber)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{caseData.status}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {caseData.auction} | {caseData.orderId} | {caseData.bidderNum}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {/* Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Created By</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Marcus Chen</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>April 24, 2026 at 10:22 AM</div>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Last Update</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Status changed to In Review</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>2 hours ago by Alex Chen</div>
          </div>
        </div>

        {/* Lot Details */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Lot Items</h3>
            <button style={{ color: 'var(--status-teal)', background: 'none', border: 'none', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Plus size={14} /> Add Lot
            </button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Lot #</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Reason</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {caseData.lots.map((lot: string) => (
                  <tr key={lot} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{lot}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>Damaged at Pickup</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--status-blue)' }}>Open</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button style={{ color: 'var(--status-teal)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700 }}>Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Timeline */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Case Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1rem' }}>
            <div style={{ position: 'absolute', left: '1.35rem', top: 0, bottom: 0, width: '1px', background: 'var(--border-color)' }} />
            
            {[1, 2].map(i => (
              <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'white', border: '2px solid var(--status-teal)', zIndex: 1, marginTop: '4px' }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {i === 1 ? 'Alex Chen' : 'Marcus Chen'}
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                      {i === 1 ? '2 hours ago' : 'Today, 10:22 AM'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    {i === 1 ? 'Status changed from Open to In Review. Escalating to supervisor for discount approval.' : 'Case created at release. Customer reported screen damage on lot 112.'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', background: 'white' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <textarea 
            placeholder="Add a case note..." 
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', minHeight: '80px', resize: 'none' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <button className="btn" style={{ padding: '0.625rem' }}>
            <MessageSquare size={16} /> Add Note
          </button>
          <button className="btn" style={{ padding: '0.625rem', color: 'var(--status-green)', borderColor: 'var(--status-green)' }}>
            <CheckCircle2 size={16} /> Resolve
          </button>
          <button className="btn btn-primary" style={{ padding: '0.625rem' }}>
            <Send size={16} /> Update Client
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailDrawer;
