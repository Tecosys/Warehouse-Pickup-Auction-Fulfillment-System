import { createPortal } from 'react-dom';
import { CheckCircle2, Printer } from 'lucide-react';

interface ReleaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  type: 'full' | 'partial';
  user: any;
  releasedLots: any[];
  withheldLots: any[];
}

const ReleaseConfirmationModal: React.FC<ReleaseConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  order, 
  type, 
  user, 
  releasedLots = [], 
  withheldLots = [] 
}) => {
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
      backdropFilter: 'blur(8px)',
      padding: '1rem'
    }}>
      {/* Hidden print slip for 80mm receipt */}
      <div className="print-slip" style={{ fontFamily: 'monospace', fontSize: '9pt', color: 'black' }}>
        <h1 style={{ fontSize: '12pt', fontWeight: 'bold', textAlign: 'center', margin: '0 0 10px 0', borderBottom: '2px dashed black', paddingBottom: '5px' }}>
          BIDBOSS RELEASE RECEIPT
        </h1>
        
        <div style={{ marginBottom: '10px', lineHeight: '1.4' }}>
          <div><strong>Auction:</strong> {auctionLabel} (Run #{order?.auctionRun?.auctionNumber || 'N/A'})</div>
          <div><strong>Bidder:</strong> #{bidderNum}</div>
          <div><strong>Customer:</strong> {customerName}</div>
          <div><strong>Type:</strong> {type === 'full' ? 'Full Release' : 'Partial Release'}</div>
        </div>

        {/* Large bordered monospace booking code */}
        <div style={{ 
          border: '2px solid black', 
          padding: '8px', 
          textAlign: 'center', 
          fontSize: '14pt', 
          fontWeight: 'bold', 
          fontFamily: 'monospace',
          margin: '10px 0',
          letterSpacing: '1px'
        }}>
          {order?.bookingCode || 'N/A'}
        </div>

        {order?.authorizedPerson && order.authorizedPerson.name && (
          <div style={{ border: '1px solid black', padding: '6px', marginBottom: '10px', fontSize: '8pt' }}>
            <strong>Authorized Pick Up:</strong><br />
            {order.authorizedPerson.name}<br />
            {order.authorizedPerson.phone && `Phone: ${order.authorizedPerson.phone}`}
          </div>
        )}

        {/* Released Lots list */}
        {releasedLots && releasedLots.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid black', paddingBottom: '2px', marginBottom: '5px' }}>
              RELEASED LOTS ({releasedLots.length})
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
              <thead>
                <tr style={{ borderBottom: '1px dashed black' }}>
                  <th style={{ textAlign: 'left', width: '25%' }}>Lot #</th>
                  <th style={{ textAlign: 'left', width: '55%' }}>Description</th>
                  <th style={{ textAlign: 'right', width: '20%' }}>Location</th>
                </tr>
              </thead>
              <tbody>
                {releasedLots.map((lot: any) => (
                  <tr key={lot._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>{lot.lotNumber}</td>
                    <td style={{ verticalAlign: 'top' }}>{lot.description}</td>
                    <td style={{ verticalAlign: 'top', textAlign: 'right' }}>{lot.finalPickupLocation || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Withheld Lots list */}
        {withheldLots && withheldLots.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid black', paddingBottom: '2px', marginBottom: '5px', color: 'black' }}>
              WITHHELD LOTS ({withheldLots.length})
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
              <thead>
                <tr style={{ borderBottom: '1px dashed black' }}>
                  <th style={{ textAlign: 'left', width: '25%' }}>Lot #</th>
                  <th style={{ textAlign: 'left', width: '45%' }}>Description</th>
                  <th style={{ textAlign: 'right', width: '30%' }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {withheldLots.map((lot: any) => (
                  <tr key={lot.lotId || lot._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ verticalAlign: 'top', fontWeight: 'bold' }}>{lot.lotNumber}</td>
                    <td style={{ verticalAlign: 'top' }}>{lot.description}</td>
                    <td style={{ verticalAlign: 'top', textAlign: 'right', fontWeight: 'bold' }}>{lot.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="footer" style={{ marginTop: '15px', borderTop: '1px dashed black', paddingTop: '5px', textAlign: 'center', fontSize: '8pt' }}>
          Released by: {user?.name || 'Staff'} ({user?.role || 'Staff'})<br />
          {new Date().toLocaleString()}
        </div>
      </div>

      <div className="card animate-slide" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'white' }}>
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

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', textAlign: 'center' }}>
          {type === 'full' ? 'Release Confirmed' : 'Partial Release Saved'}
        </h2>
        
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6, textAlign: 'center' }}>
          Release for <strong>{customerName} ({bidderNum})</strong> has been recorded. 
          Notifications have been sent to the customer.
        </p>

        <div className="card" style={{ background: '#f8fafc', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Release Summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Released by:</span>
            <span style={{ fontWeight: 600 }}>{user?.name || 'Staff'} ({user?.role || 'Staff'})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Released Lots:</span>
            <span style={{ fontWeight: 600, color: 'var(--status-teal)' }}>{releasedLots.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Withheld Lots:</span>
            <span style={{ fontWeight: 600, color: withheldLots.length > 0 ? 'var(--status-amber)' : 'var(--text-muted)' }}>{withheldLots.length}</span>
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
