import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer } from 'lucide-react';

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: {
    auction: string;
    bidder: string;
    customer: string;
    status?: string;
    bookingCode: string;
    items: Array<{ id: string; desc: string; loc?: string; storage?: string }>;
    worker?: string;
  };
}

const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({ isOpen, onClose, title, data }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPrep = title.toLowerCase().includes('prep');

  return createPortal(
    <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card animate-fade" style={{ maxWidth: '400px', width: '100%', padding: '1.5rem', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title} Preview</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
        </div>

        <div id="receipt-content" style={{ 
          background: 'white', 
          padding: '2rem 1.5rem', 
          borderRadius: '4px', 
          fontFamily: "'Courier New', Courier, monospace", 
          color: 'black',
          marginBottom: '1.5rem',
          border: '1px solid #ddd'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid black', paddingBottom: '0.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>BIDBOSS</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{isPrep ? 'PREPARATION SLIP' : 'RELEASE CONFIRMATION'}</div>
          </div>

          <div style={{ fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.4' }}>
            <div>AUCTION: <strong>#{data.auction}</strong></div>
            <div>BIDDER: <strong style={{ fontSize: '1.2rem' }}>{data.bidder}</strong></div>
            <div>NAME: <strong>{data.customer}</strong></div>
            {data.bookingCode && <div>BOOKING: <strong>{data.bookingCode}</strong></div>}
            <div>DATE: {new Date().toLocaleDateString()}</div>
          </div>

          <div style={{ borderTop: '1px solid black', borderBottom: '1px solid black', padding: '0.5rem 0', margin: '1rem 0' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid black' }}>
                  <th style={{ padding: '4px 0' }}>LOT</th>
                  <th style={{ padding: '4px 0' }}>{isPrep ? 'STORAGE' : 'PU LOC'}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ padding: '4px 0' }}>#{item.id} {item.desc.substring(0, 15)}...</td>
                    <td style={{ padding: '4px 0', fontWeight: 900 }}>{isPrep ? (item.storage || '---') : (item.loc || '---')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '1rem' }}>
            <div>TOTAL ITEMS: {data.items.length}</div>
            {isPrep && <div style={{ marginTop: '1rem', border: '1px solid black', padding: '10px' }}>SIGN: ________________</div>}
            {!isPrep && <div style={{ marginTop: '0.5rem' }}>Thank you for bidding!</div>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ flex: 1 }} onClick={onClose}>Close</button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, background: 'var(--status-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
            onClick={handlePrint}
          >
            <Printer size={18} /> Print
          </button>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            .no-print { display: none !important; }
            #receipt-content, #receipt-content * { 
              visibility: visible; 
            }
            #receipt-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 10px;
              border: none;
            }
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default ReceiptPreviewModal;
