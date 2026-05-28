import { createPortal } from 'react-dom';
import { CheckCircle2, Printer } from 'lucide-react';

interface ReleaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  type: 'full' | 'partial';
}

const ReleaseConfirmationModal: React.FC<ReleaseConfirmationModalProps> = ({ isOpen, onClose, order, type }) => {
  if (!isOpen) return null;

  const customerName = order?.customer?.name || order?.customer || 'Unknown Customer';
  const bidderNum = order?.bidderNumber || order?.bidderNum || 'N/A';
  const auctionLabel = order?.auctionRun?.title || 'Active Auction';

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(8px)'
    }}>
      {/* Hidden print slip for 80mm receipt */}
      <div className="print-slip">
        <h1>BIDBOSS RELEASE RECEIPT</h1>
        <div style={{ marginBottom: '10px' }}>
          <div>Auction: {auctionLabel}</div>
          <div>Bidder: #{bidderNum}</div>
          <div>Customer: {customerName}</div>
          <div>Booking Code: {order?.bookingCode || 'N/A'}</div>
          <div>Type: {type === 'full' ? 'Full Release' : 'Partial Release'}</div>
        </div>
        <div style={{ borderTop: '1px solid black', paddingTop: '10px' }}>
          <strong>RELEASE STATUS:</strong>
          <div>{type === 'full' ? 'All lots successfully released.' : 'Lots released with withheld exceptions.'}</div>
        </div>
        <div className="footer" style={{ marginTop: '10px', borderTop: '1px dashed black', paddingTop: '5px', textAlign: 'center', fontSize: '8pt' }}>
          Released by: Staff<br />
          {new Date().toLocaleString()}
        </div>
      </div>

      <div className="card animate-slide" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', textAlign: 'center', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
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
          Release for <strong>{customerName} ({bidderNum})</strong> has been recorded. 
          Notifications have been sent to the customer.
        </p>

        <div className="card" style={{ background: '#f8fafc', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Release Summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Released by:</span>
            <span style={{ fontWeight: 600 }}>Staff</span>
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
            onClick={handlePrint}
            className="btn btn-primary" 
            style={{ flex: 1, padding: '0.75rem' }}
          >
            <Printer size={18} />
            Print Slip
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReleaseConfirmationModal;
