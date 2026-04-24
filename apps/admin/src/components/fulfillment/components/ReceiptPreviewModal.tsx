import React from 'react';
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

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card animate-fade" style={{ maxWidth: '450px', width: '100%', padding: '1.5rem', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title} Preview</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
        </div>

        {/* Realistic Receipt Preview */}
        <div style={{ 
          background: 'white', 
          padding: '2rem 1.5rem', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          borderRadius: '4px', 
          fontFamily: 'monospace', 
          color: 'black',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Jagged Edge Top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(45deg, transparent 33.333%, #f8fafc 33.333%, #f8fafc 66.666%, transparent 66.666%), linear-gradient(-45deg, transparent 33.333%, #f8fafc 33.333%, #f8fafc 66.666%, transparent 66.666%)', backgroundSize: '8px 16px' }}></div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.25rem' }}>BIDBOSS</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Fulfillment Center</div>
            <div style={{ margin: '1rem 0', borderTop: '1px dashed black', borderBottom: '1px dashed black', padding: '0.5rem 0' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>#{data.bidder}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{data.customer}</div>
            </div>
          </div>

          <div style={{ fontSize: '0.8125rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>AUCTION:</span> <span>{data.auction}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>DATE:</span> <span>{new Date().toLocaleDateString()}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CODE:</span> <span>{data.bookingCode}</span></div>
            {data.status && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>STATUS:</span> <span>{data.status}</span></div>}
          </div>

          <div style={{ borderTop: '1px solid black', paddingTop: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>ITEMS TO PICK:</div>
            {data.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span>[{item.storage || item.loc}] #{item.id}</span>
                <span style={{ flex: 1, marginLeft: '0.5rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.desc}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>TOTAL ITEMS: {data.items.length}</div>
            <div style={{ fontSize: '0.625rem', color: '#666' }}>
              Prepared by: {data.worker || 'Marcus V.'}<br />
              {new Date().toLocaleString()}
            </div>
          </div>

          {/* Jagged Edge Bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(45deg, transparent 33.333%, #f8fafc 33.333%, #f8fafc 66.666%, transparent 66.666%), linear-gradient(-45deg, transparent 33.333%, #f8fafc 33.333%, #f8fafc 66.666%, transparent 66.666%)', backgroundSize: '8px 16px', transform: 'rotate(180deg)' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ flex: 1 }} onClick={onClose}>Close Preview</button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, background: 'var(--status-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} 
            onClick={handlePrint}
          >
            <Printer size={18} /> Print Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreviewModal;
