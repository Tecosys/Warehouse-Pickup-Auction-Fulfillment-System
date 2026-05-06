import { useState } from 'react';
import { X, Plus, Send, MessageSquare, Clock, User, CheckCircle2, Loader2 } from 'lucide-react';
import { ButtonSpinner } from '../../shared/LoadingComponents';

interface CaseDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: any;
  user: any;
  onUpdate: () => void;
}

const CaseDetailDrawer: React.FC<CaseDetailDrawerProps> = ({ isOpen, onClose, caseData, user, onUpdate }) => {
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!caseData) return null;

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/cases/${caseData._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error updating case status:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace' }}>{caseData.caseNumber}</h2>
            <span style={{ 
              fontSize: '0.625rem', 
              fontWeight: 900, 
              padding: '0.2rem 0.6rem', 
              borderRadius: '1rem', 
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--status-blue)',
              border: '1px solid currentColor',
              textTransform: 'uppercase'
            }}>
              {caseData.type}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: caseData.status === 'Open' ? 'var(--status-amber)' : caseData.status === 'In Review' ? 'var(--status-blue)' : 'var(--status-green)' 
              }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{caseData.status}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {caseData.auctionRun?.title} | Bidder #{caseData.bidderNumber}
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
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{caseData.createdBy || 'System'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {new Date(caseData.createdAt).toLocaleString()}
            </div>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Last Update</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {caseData.status === 'Resolved' ? 'Case Resolved' : 'Awaiting Action'}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {new Date(caseData.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Lot Details */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Lot Items</h3>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Lot #</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Reason</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {caseData.lines?.map((line: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{line.lotNumber}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{line.reason}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{line.notes || 'No notes'}</td>
                  </tr>
                ))}
                {(!caseData.lines || caseData.lines.length === 0) && (
                  <tr>
                    <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No specific lots linked.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Placeholder */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Case Timeline</h3>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
            Case activity history will appear here.
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
        <div style={{ display: 'grid', gridTemplateColumns: (user?.role === 'Admin' && caseData.status !== 'Resolved') ? '1fr 1.2fr 1fr' : '1fr 1fr', gap: '1rem' }}>
          <button className="btn" style={{ padding: '0.625rem' }} onClick={() => handleUpdateStatus('In Review')}>
            <MessageSquare size={16} /> Mark In Review
          </button>
          
          {user?.role === 'Admin' && caseData.status !== 'Resolved' && (
            <button 
              className="btn" 
              style={{ padding: '0.625rem', color: 'var(--status-green)', borderColor: 'var(--status-green)' }}
              onClick={() => handleUpdateStatus('Resolved')}
              disabled={loading}
            >
              {loading ? <ButtonSpinner /> : <><CheckCircle2 size={16} /> Resolve Case</>}
            </button>
          )}
          
          <button className="btn btn-primary" style={{ padding: '0.625rem' }}>
            <Send size={16} /> Update Client
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailDrawer;
