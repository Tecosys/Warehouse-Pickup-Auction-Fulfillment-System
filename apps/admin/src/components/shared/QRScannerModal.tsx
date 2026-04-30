import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
  title?: string;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan, title = "Scan ManyFastScan Label" }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the container is rendered
      const timer = setTimeout(() => {
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        
        scannerRef.current.render(
          (decodedText) => {
            onScan(decodedText);
            if (scannerRef.current) {
              scannerRef.current.clear();
            }
            onClose();
          },
          () => {
            // parse error, ignore
          }
        );
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(error => {
            console.error("Failed to clear scanner", error);
          });
        }
      };
    }
  }, [isOpen, onClose, onScan]);

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(0,0,0,0.8)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 2000,
      padding: '1.5rem'
    }} onClick={onClose}>
      <div 
        className="card animate-slide" 
        style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'white' }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--status-teal)', borderRadius: '0.5rem' }}>
              <Camera size={20} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div id="qr-reader" style={{ width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}></div>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Position the ManyFastScan QR code within the frame to scan.
          </p>
        </div>

        <button 
          className="btn" 
          style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }} 
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
      
      <style>{`
        #qr-reader {
          border: none !important;
        }
        #qr-reader__dashboard_section_csr button {
          background: var(--status-teal) !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-weight: 600 !important;
        }
        #qr-reader__camera_selection {
          padding: 8px !important;
          border-radius: 4px !important;
          border: 1px solid var(--border-color) !important;
          margin-bottom: 10px !important;
        }
      `}</style>
    </div>
  );
};

export default QRScannerModal;
