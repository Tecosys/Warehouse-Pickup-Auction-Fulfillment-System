import React, { useState } from 'react';
import { ArrowLeft, Printer, ScanLine, CheckCircle2, AlertTriangle, MoreVertical, Flag, Edit2, X, ChevronDown } from 'lucide-react';
import { NotFoundModal, IssueModal, CompletionModal } from '../components/FulfillmentModals';

const MOCK_LOTS = [
  { id: '112', desc: 'Samsung 65" 4K Smart TV', storage: 'A2', location: '', status: 'Pending', type: 'Sort (BIN)' },
  { id: '115', desc: 'Dyson V15 Detect Vacuum', storage: 'A2', location: 'BIN12', status: 'Ready', type: 'Sort (BIN)' },
  { id: '201', desc: 'Industrial Workbench - Heavy Duty', storage: 'B1', location: '', status: 'Pending', type: 'Non-Sort (PU)' },
  { id: '205', desc: 'Pallet of Assorted Home Decor', storage: 'B3', location: '', status: 'Issue', type: 'Non-Sort (PU)' },
  { id: '312', desc: 'KitchenAid Stand Mixer - Onyx Black', storage: 'C1', location: '', status: 'Pending', type: 'Sort (BIN)' },
  { id: '315', desc: 'Apple MacBook Pro 14" M2', storage: 'C2', location: '', status: 'Not Found', type: 'Sort (BIN)' },
  { id: '401', desc: 'Bose QuietComfort Headphones', storage: 'D1', location: '', status: 'Pending', type: 'Sort (BIN)' },
  { id: '405', desc: 'DeWalt 20V Max Drill Set', storage: 'D2', location: '', status: 'Pending', type: 'Sort (BIN)' },
];

interface OrderDetailTabProps {
  orderId: string | null;
  onBack: () => void;
}

const OrderDetailTab: React.FC<OrderDetailTabProps> = ({ orderId, onBack }) => {
  const [prepStatus, setPrepStatus] = useState<'Not Started' | 'In Progress' | 'Ready'>('Not Started');
  const [customerStatus] = useState('Checked In');
  const [lots, setLots] = useState(MOCK_LOTS);
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set());
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [bulkLocation, setBulkLocation] = useState('');

  const readyCount = lots.filter(l => l.status === 'Ready').length;
  const flaggedCount = lots.filter(l => l.status === 'Issue' || l.status === 'Not Found').length;
  const untouchedCount = lots.filter(l => l.status === 'Pending').length;
  const progress = Math.round(((readyCount + flaggedCount) / lots.length) * 100);

  const toggleLotSelect = (id: string) => {
    const next = new Set(selectedLots);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLots(next);
  };

  const applyBulkLocation = () => {
    setLots(prev => prev.map(l => selectedLots.has(l.id) ? { ...l, status: 'Ready', location: bulkLocation } : l));
    setSelectedLots(new Set());
    setBulkLocation('');
  };

  const handleStartPrep = () => {
    setPrepStatus('In Progress');
    // In real app, would save worker name and start timestamp here
  };

  const handlePrintSlip = () => {
    const content = `
BIDBOSS PREPARATION SLIP
------------------------
Auction: #31
Bidder: #8821
Customer: Sarah O'Connor
Status: ${prepStatus}
Booking Code: BB31-1221

LOTS (Source Location Order):
${lots.map(l => `[${l.storage}] Lot #${l.id} - ${l.desc}`).join('\n')}

Prepared by: Marcus V.
${new Date().toLocaleString()}
    `;
    alert("Sending to 80mm Thermal Printer...\n" + content);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Back & Print Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', background: 'white', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-teal)', fontWeight: 700, cursor: 'pointer' }}>
          <ArrowLeft size={18} /> Back to Prep Queue
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" onClick={handlePrintSlip} style={{ padding: '0.5rem 1rem' }}><Printer size={18} /> Print Prep Slip</button>
          {prepStatus !== 'Ready' && (
            <button 
              className="btn btn-primary" 
              disabled={untouchedCount > 0}
              style={{ padding: '0.5rem 1.5rem', background: 'var(--status-teal)', opacity: untouchedCount > 0 ? 0.5 : 1 }} 
              onClick={() => setActiveModal('Complete')}
            >
              Complete Preparation
            </button>
          )}
        </div>
      </div>

      <div className="fulfillment-layout-grid" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', padding: '2rem', alignItems: 'start' }}>
        {/* Left Column: Header & Progress */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Fulfillment Detail</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>#{orderId?.split('-')[1] || '8821'}</h2>
              <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>Sarah O'Connor</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Fulfillment Status</span>
                <span style={{ 
                  fontSize: '0.75rem', fontWeight: 900, padding: '0.25rem 0.75rem', borderRadius: '1rem', 
                  background: prepStatus === 'In Progress' ? 'rgba(245, 158, 11, 0.1)' : prepStatus === 'Ready' ? 'rgba(13, 148, 136, 0.1)' : '#f1f5f9',
                  color: prepStatus === 'In Progress' ? 'var(--status-amber)' : prepStatus === 'Ready' ? 'var(--status-teal)' : 'var(--text-muted)',
                  border: '1px solid currentColor'
                }}>{prepStatus.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Customer Status</span>
                <span style={{ 
                  fontSize: '0.75rem', fontWeight: 900, padding: '0.25rem 0.75rem', borderRadius: '1rem', 
                  background: 'rgba(34, 197, 94, 0.1)', color: 'var(--status-green)', border: '1px solid currentColor'
                }}>{customerStatus.toUpperCase()}</span>
              </div>
            </div>

            {customerStatus === 'Checked In' && (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--status-green)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <CheckCircle2 size={16} /> Customer has checked in
              </div>
            )}

            {prepStatus === 'Not Started' ? (
              <button 
                onClick={handleStartPrep}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', background: 'var(--status-teal)', fontSize: '1rem' }}
              >
                Start Preparation
              </button>
            ) : prepStatus === 'In Progress' ? (
              <button 
                className="btn" 
                style={{ width: '100%', padding: '1rem', border: '2px solid var(--status-teal)', color: 'var(--status-teal)', background: 'none', fontSize: '1rem', fontWeight: 700 }}
              >
                Continue Preparation
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fdfa', borderRadius: '0.5rem', border: '1px solid var(--status-teal)', color: 'var(--status-teal)', fontWeight: 700 }}>
                Preparation Complete ✓
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--status-teal)' }}>Picking Progress</span>
              <span style={{ color: 'var(--status-teal)' }}>{progress}%</span>
            </div>
            <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--status-teal)', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
              {readyCount + flaggedCount} of {lots.length} lots accounted for
            </div>

            {untouchedCount > 0 && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--status-red)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Attention Needed</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {untouchedCount} lot(s) still need an action (Assign or Flag).
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lot List */}
        <div>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: '#f8fafc', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                {['All Lots', 'Non-Sort (PU)', 'Sort (BIN)'].map(t => (
                  <button key={t} style={{ background: 'none', border: 'none', fontSize: '0.875rem', fontWeight: 700, color: t === 'All Lots' ? 'var(--status-teal)' : 'var(--text-muted)', borderBottom: t === 'All Lots' ? '2px solid var(--status-teal)' : 'none', paddingBottom: '0.5rem', cursor: 'pointer' }}>{t}</button>
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Sorted by: Storage Location
              </div>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lots.map(lot => (
                <div 
                  key={lot.id} 
                  className="card" 
                  style={{ 
                    padding: '1.25rem', 
                    background: lot.status === 'Ready' ? '#f0fdfa' : lot.status === 'Not Found' ? 'rgba(245, 158, 11, 0.05)' : lot.status === 'Issue' ? 'rgba(239, 68, 68, 0.05)' : 'white',
                    border: lot.status === 'Ready' ? '1px solid rgba(13, 148, 136, 0.2)' : '1px solid var(--border-color)',
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 280px 40px',
                    gap: '1.5rem',
                    alignItems: 'center',
                    opacity: prepStatus === 'Not Started' ? 0.6 : 1,
                    pointerEvents: prepStatus === 'Not Started' ? 'none' : 'auto'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedLots.has(lot.id)}
                    onChange={() => toggleLotSelect(lot.id)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--status-teal)' }}
                  />
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '1.125rem', fontWeight: 800 }}>Lot {lot.id}</span>
                      {lot.status === 'Ready' && <CheckCircle2 size={18} color="var(--status-teal)" />}
                      {lot.status === 'Not Found' && <X size={18} color="var(--status-amber)" />}
                      {lot.status === 'Issue' && <Flag size={18} color="var(--status-red)" />}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{lot.desc}</div>
                    <div style={{ marginTop: '0.75rem', display: 'inline-block', fontSize: '0.75rem', fontWeight: 800, background: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      SOURCE: {lot.storage}
                    </div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="BIN or PU Location..."
                      value={lot.location}
                      className="card"
                      style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', fontSize: '0.875rem', outline: 'none' }}
                      readOnly={lot.status === 'Ready' || prepStatus === 'Ready'}
                    />
                    <ScanLine size={18} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ cursor: 'pointer' }} onClick={() => setActiveModal('NotFound')}>
                      <MoreVertical size={20} color="var(--text-muted)" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedLots.size > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: '2rem', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: 'calc(100% - 4rem)', 
          maxWidth: '1336px',
          background: '#1e293b', 
          color: 'white', 
          padding: '1.25rem 2rem', 
          borderRadius: '1rem',
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem', 
          zIndex: 50,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedLots.size} lots selected</span>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Assign location to all selected lots..." 
              value={bulkLocation}
              onChange={(e) => setBulkLocation(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
            />
          </div>
          <button className="btn" style={{ background: 'var(--status-teal)', color: 'white', border: 'none', padding: '0.75rem 2rem', fontWeight: 700 }} onClick={applyBulkLocation}>Apply to All</button>
          <X size={24} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }} onClick={() => setSelectedLots(new Set())} />
        </div>
      )}

      {/* Mobile Sticky Bar (Hidden on Desktop if needed, but keeping for now as a safe fallback) */}
      <div className="mobile-only-bar" style={{ display: 'none' }}>
        <div style={{ position: 'sticky', bottom: 0, background: 'white', padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', zIndex: 10 }}>
          <button className="btn" style={{ padding: '0.75rem' }} onClick={onBack}>Pause</button>
          <button className="btn btn-primary" style={{ padding: '0.75rem', background: 'var(--status-teal)' }} onClick={() => setActiveModal('Complete')}><CheckCircle2 size={18} /> Complete Order</button>
        </div>
      </div>

      {/* Modals */}
      <NotFoundModal isOpen={activeModal === 'NotFound'} onClose={() => setActiveModal(null)} onConfirm={() => setActiveModal(null)} />
      <IssueModal isOpen={activeModal === 'Issue'} onClose={() => setActiveModal(null)} onConfirm={() => setActiveModal(null)} />
      <CompletionModal isOpen={activeModal === 'Complete'} onClose={() => setActiveModal(null)} onConfirm={() => { setActiveModal(null); onBack(); }} flaggedCount={flaggedCount} />
    </div>
  );
};

export default OrderDetailTab;
