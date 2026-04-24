import { CheckCircle2, Printer } from 'lucide-react';

interface ReleaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  type: 'full' | 'partial';
}

const ReleaseConfirmationModal: React.FC<ReleaseConfirmationModalProps> = ({ isOpen, onClose, order, type }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="card animate-slide" style={{ width: '500px', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: 'rgba(34, 197, 94, 0.1)', 
          color: 'var(--status-green)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <CheckCircle2 size={48} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          {type === 'full' ? 'Release Confirmed' : 'Partial Release Saved'}
        </h2>
        
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Release for <strong>{order?.customer} ({order?.bidderNum})</strong> has been recorded. 
          Notifications have been sent to the customer.
        </p>

        <div className="card" style={{ background: '#f8fafc', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Release Summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Released by:</span>
            <span style={{ fontWeight: 600 }}>Marcus Chen</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Timestamp:</span>
            <span style={{ fontWeight: 600 }}>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={onClose} 
            className="btn" 
            style={{ flex: 1, padding: '0.75rem' }}
          >
            Close
          </button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, padding: '0.75rem' }}
          >
            <Printer size={18} />
            Print Slip
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReleaseConfirmationModal;
