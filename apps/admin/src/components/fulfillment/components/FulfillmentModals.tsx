import React from 'react';
import { AlertTriangle, Flag, X, CheckCircle2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  confirmColor?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, children, confirmText = 'Confirm', confirmColor = 'var(--status-teal)' }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card animate-fade" style={{ maxWidth: '400px', width: '100%', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>{children}</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1, background: confirmColor }} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export const NotFoundModal = ({ isOpen, onClose, onConfirm }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} onConfirm={onConfirm} title="Mark as Not Found" confirmColor="var(--status-amber)">
    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
      This lot will be flagged and an internal case will be created automatically.
    </p>
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Add a note (optional):</label>
    <textarea 
      placeholder="Where did you check?" 
      style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minHeight: '80px', outline: 'none' }}
    />
  </Modal>
);

export const IssueModal = ({ isOpen, onClose, onConfirm }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} onConfirm={onConfirm} title="Report Issue" confirmColor="var(--status-red)">
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Reason</label>
      <select style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }}>
        <option>Damaged</option>
        <option>Suspicious</option>
        <option>Missing Parts</option>
        <option>Other</option>
      </select>
    </div>
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Note</label>
    <textarea 
      placeholder="Describe the issue..." 
      style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minHeight: '80px', outline: 'none' }}
    />
  </Modal>
);

export const CompletionModal = ({ isOpen, onClose, onConfirm, flaggedCount }: any) => (
  <Modal 
    isOpen={isOpen} 
    onClose={onClose} 
    onConfirm={onConfirm} 
    title="Complete Preparation"
    confirmText="Confirm Ready"
  >
    {flaggedCount > 0 ? (
      <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <AlertTriangle size={24} color="var(--status-red)" />
        <p style={{ fontSize: '0.875rem', color: '#991b1b', margin: 0, fontWeight: 500 }}>
          <strong>{flaggedCount} lot(s) are flagged.</strong> The order will be marked Ready with a flag indicator. Cases have been created for flagged lots. Confirm?
        </p>
      </div>
    ) : (
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
        Mark order as <strong>Ready</strong>? This will notify the customer that their invoice is ready and they can proceed to checkout/pickup.
      </p>
    )}
  </Modal>
);
