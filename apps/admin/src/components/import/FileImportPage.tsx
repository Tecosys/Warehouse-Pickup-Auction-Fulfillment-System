import { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  ArrowRight,
  Users,
  Package,
  Send,
  ExternalLink,
  X,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';

// ─── File Upload Zone ──────────────────────────────────────────────────────────

const FileZone = ({ label, desc, required, file, onUpload, fieldKey }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (f: File | null) => {
    if (!f) return <FileSpreadsheet size={32} />;
    const ext = f.name.split('.').pop()?.toLowerCase();
    return ext === 'xlsx' || ext === 'xls'
      ? <FileSpreadsheet size={32} />
      : <FileText size={32} />;
  };

  return (
    <div className={`card`} style={{ 
      textAlign: 'center', 
      border: file ? '2px solid var(--status-teal)' : '2px dashed var(--border-color)',
      background: file ? '#f0fdfa' : 'white',
      padding: '2rem',
      position: 'relative',
      transition: 'all 0.2s'
    }}>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={(e) => onUpload(e.target.files?.[0] || null)}
        style={{ display: 'none' }}
        accept=".csv,.xlsx,.xls"
        id={`file-input-${fieldKey}`}
      />
      <div style={{ color: file ? 'var(--status-teal)' : 'var(--text-muted)', marginBottom: '1rem' }}>
        {getFileIcon(file)}
      </div>
      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>{label}</h4>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{desc}</p>
      
      {file ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={14} color="var(--status-teal)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
          <button 
            onClick={() => { onUpload(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} 
            style={{ background: 'none', border: 'none', color: 'var(--status-red)', cursor: 'pointer', padding: 0 }}
            title="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button className="btn" style={{ fontSize: '0.75rem' }} onClick={() => fileInputRef.current?.click()}>
          Browse Files
        </button>
      )}

      <div style={{ marginTop: '1rem', fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
        REQUIRED FIELDS: {required}
      </div>
      <div style={{ marginTop: '0.25rem', fontSize: '0.625rem', color: 'var(--text-muted)' }}>
        Accepts .csv or .xlsx
      </div>
    </div>
  );
};

// ─── Success Screen ────────────────────────────────────────────────────────────

const PostImportSuccess = ({ stats, run, orders, onReset, onNavigate }: any) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const copyLink = (id: string) => {
    const link = `http://localhost:3001/portal/${id}`;
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sendBatch = async () => {
    setSending(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionRunId: run._id, type: 1 })
      });
      if (response.ok) {
        setSent(true);
      } else {
        alert('Failed to send batch notifications.');
      }
    } catch (err) {
      alert('Error sending notifications.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="success-screen animate-fade">
      <div className="card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem', borderTop: '6px solid var(--status-green)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: 'var(--status-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle2 size={40} />
        </div>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Import Complete</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Auction {run.auctionNumber} — {run.title} is ready</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '2.5rem' }}>
          {[
            { label: 'Orders Created', val: stats.ordersCreated, icon: <FileText size={18} /> },
            { label: 'Lots Created', val: stats.lotsCreated, icon: <Package size={18} /> },
            { label: 'Customers Matched', val: stats.customersMatched, icon: <Users size={18} /> },
            { label: 'Issues Flagged', val: stats.issuesFlagged, icon: <AlertTriangle size={18} />, color: stats.issuesFlagged > 0 ? 'var(--status-red)' : 'var(--text-muted)' }
          ].map((stat, i) => (
            <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
              <div style={{ color: stat.color || 'var(--text-muted)', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stat.val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {stats.issuesFlagged > 0 && (
          <div style={{ marginTop: '1.5rem', padding: '0.75rem 1.25rem', background: '#fef3c7', borderRadius: '0.5rem', color: '#92400e', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <AlertTriangle size={16} />
            <span>{stats.issuesFlagged} bidder(s) from HiBid were not found in the AuctionFlex bidders list. Review in the Issues module.</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Next Step: Send Customer Links</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Notify customers to choose Pickup or Shipping.</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={sendBatch}
              disabled={sending || sent}
              style={{ 
                padding: '1rem', 
                fontSize: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.75rem', 
                background: sent ? 'var(--status-teal)' : sending ? 'var(--text-muted)' : 'var(--status-teal)',
                opacity: sending || sent ? 0.75 : 1
              }}
            >
              <Send size={20} /> {sending ? 'Sending...' : sent ? 'Initial Links Sent! ✓' : 'Send Initial Customer Links'}
            </button>
            <button className="btn" onClick={() => onNavigate('Batch Notifications')} style={{ padding: '1rem', fontWeight: 600 }}>
              Send One by One (Manual Review)
            </button>
            <button className="btn" style={{ border: 'none', color: 'var(--text-muted)', fontSize: '0.875rem' }} onClick={onReset}>
              Skip for now, go to Dashboard
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Generated Booking Links</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Bidder</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Booking Code</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Link</th>
                </tr>
              </thead>
              <tbody>
                {orders?.slice(0, 10).map((o: any) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 600 }}>{o.bidderNumber}</td>
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{o.bookingCode}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => copyLink(o._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === o._id ? 'var(--status-green)' : 'var(--status-teal)' }}
                      >
                        {copied === o._id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders?.length > 10 && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>...and {orders.length - 10} more</p>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
        <button onClick={() => onNavigate('Auction Runs')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--status-teal)', fontWeight: 600, cursor: 'pointer' }}>
          Open Auction Run <ExternalLink size={16} />
        </button>
        <button onClick={() => onNavigate('Fulfillment Hub')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--status-teal)', fontWeight: 600, cursor: 'pointer' }}>
          Go to Fulfillment Hub <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Field Mapping Reference Panel ────────────────────────────────────────────

const MappingReference = () => (
  <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f8fafc', border: '1px solid var(--border-color)' }}>
    <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      Phase 1 Field Mapping Logic
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.75rem' }}>
      {[
        {
          source: 'HiBid Winning Results',
          color: '#3b82f6',
          bg: '#eff6ff',
          fields: [
            { field: 'Winning Bidder', maps: 'Matches AuctionFlex BidderNumber' },
            { field: 'Lot', maps: 'Matches ManyFast Lot+Section' },
          ]
        },
        {
          source: 'AuctionFlex Bidders',
          color: '#8b5cf6',
          bg: '#f5f3ff',
          fields: [
            { field: 'Source of Truth', maps: 'Primary for Name/Address' },
            { field: 'IsShippingRequested', maps: 'Auto-flags order for shipping' },
          ]
        },
        {
          source: 'ManyFast Manifest',
          color: '#0d9488',
          bg: '#f0fdfa',
          fields: [
            { field: 'Lot + Section', maps: 'Linked to HiBid lot #' },
            { field: 'Manifest Item ID', maps: 'Stored as LPN for QR scanning' },
          ]
        },
      ].map((src, i) => (
        <div key={i} style={{ padding: '0.875rem', background: src.bg, borderRadius: '0.5rem', border: `1px solid ${src.color}30` }}>
          <div style={{ fontWeight: 700, color: src.color, marginBottom: '0.5rem', fontSize: '0.75rem' }}>{src.source}</div>
          {src.fields.map((f, j) => (
            <div key={j} style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.375rem' }}>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{f.field}</span>
              <span style={{ color: '#64748b' }}>{f.maps}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const FileImportPage = ({ onNavigate }: any) => {
  const [activeTab, setActiveTab] = useState('New Import');
  const [step, setStep] = useState(0); // 0: Setup, 1: Progress, 2: Success
  const [files, setFiles] = useState<any>({ hibid: null, auctionflex: null, manyfast: null });
  const [auctionInfo, setAuctionInfo] = useState({ number: '', title: '' });
  const [importProgress, setImportProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Initializing import...');
  const [importResult, setImportResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const allFilesUploaded = files.hibid && files.auctionflex && files.manyfast && auctionInfo.number && auctionInfo.title;

  const startImport = async () => {
    setStep(1);
    setImportProgress(10);
    setStatusMsg('Uploading files to server...');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('hibid', files.hibid);
    formData.append('auctionflex', files.auctionflex);
    formData.append('manyfast', files.manyfast);
    formData.append('auctionNumber', auctionInfo.number);
    formData.append('auctionTitle', auctionInfo.title);

    try {
      setImportProgress(30);
      setStatusMsg('Parsing source files...');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${response.status}`);
      }

      const result = await response.json();
      setImportProgress(100);
      setImportResult(result);
      setStep(2);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Import failed. Please check the backend is running.');
      setStep(0);
    }
  };

  const handleReset = () => {
    setStep(0);
    setFiles({ hibid: null, auctionflex: null, manyfast: null });
    setAuctionInfo({ number: '', title: '' });
    setImportResult(null);
    setErrorMsg('');
    setImportProgress(0);
  };

  return (
    <div className="file-import">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>File Import</h1>
          <p style={{ color: 'var(--text-muted)' }}>Phase 1 Alignment: HiBid, AuctionFlex, and ManyFast sources</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {['New Import', 'Import History'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '0.75rem 0', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === tab ? '2px solid var(--status-teal)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--status-teal)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'New Import' && (
        <div className="new-import-flow">
          {step === 0 && (
            <>
              {errorMsg && (
                <div style={{ padding: '1rem 1.25rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <AlertTriangle size={18} />
                  <span>{errorMsg}</span>
                  <button onClick={() => setErrorMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><X size={16} /></button>
                </div>
              )}

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--status-teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>1</div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Auction Reference</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', paddingLeft: '2.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Auction #</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 31" 
                      value={auctionInfo.number}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d+$/.test(val)) {
                          setAuctionInfo({...auctionInfo, number: val});
                        }
                      }}
                      className="card"
                      style={{ width: '100%', padding: '0.75rem 1rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Auction Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. BidBoss Premium Liquidation Auction #31" 
                      value={auctionInfo.title}
                      onChange={(e) => setAuctionInfo({...auctionInfo, title: e.target.value})}
                      className="card"
                      style={{ width: '100%', padding: '0.75rem 1rem' }}
                    />
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--status-teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>2</div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Source Data Files</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', paddingLeft: '2.5rem' }}>
                  <FileZone 
                    fieldKey="hibid"
                    label="HiBid Lots Export" 
                    desc="Winning bidder and lot results" 
                    required="Lot, Winning Bidder"
                    file={files.hibid}
                    onUpload={(f: any) => setFiles({...files, hibid: f})}
                  />
                  <FileZone 
                    fieldKey="auctionflex"
                    label="AuctionFlex Bidders" 
                    desc="Source of truth for customer info" 
                    required="BidderNumber, Name, IsShippingRequested"
                    file={files.auctionflex}
                    onUpload={(f: any) => setFiles({...files, auctionflex: f})}
                  />
                  <FileZone 
                    fieldKey="manyfast"
                    label="ManyFastScan CSV" 
                    desc="QR codes, LPNs, and locations" 
                    required="Manifest Item ID, Lot, Section"
                    file={files.manyfast}
                    onUpload={(f: any) => setFiles({...files, manyfast: f})}
                  />
                </div>
              </div>

              <MappingReference />

              <div className="card" style={{
                background: allFilesUploaded ? '#f0fdfa' : '#f8fafc',
                border: `1px solid ${allFilesUploaded ? 'var(--status-teal)' : 'var(--border-color)'}`,
                padding: '1.5rem 2rem',
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Import Checklist</p>
                    {[
                      { label: 'Auction details entered', ok: !!auctionInfo.number && !!auctionInfo.title },
                      { label: 'HiBid results attached', ok: !!files.hibid },
                      { label: 'AuctionFlex bidders attached', ok: !!files.auctionflex },
                      { label: 'ManyFast manifest attached', ok: !!files.manyfast },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                        {item.ok
                          ? <CheckCircle2 size={15} color="var(--status-teal)" />
                          : <div style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0 }} />}
                        <span style={{ color: item.ok ? '#0f172a' : 'var(--text-muted)', fontWeight: item.ok ? 600 : 400 }}>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn btn-primary"
                      onClick={allFilesUploaded ? startImport : undefined}
                      disabled={!allFilesUploaded}
                      style={{
                        padding: '1rem 3rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                        background: allFilesUploaded ? 'var(--status-teal)' : undefined,
                        minWidth: '200px'
                      }}
                    >
                      Process & Align Run
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              {/* Premium orbital loader */}
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 2.5rem' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--status-teal)', borderRightColor: 'rgba(13,148,136,0.3)', animation: 'bb-spin 0.9s linear infinite' }} />
                <div style={{ position: 'absolute', inset: '13px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'rgba(13,148,136,0.5)', animation: 'bb-spin 1.5s linear infinite reverse' }} />
                <div style={{ position: 'absolute', inset: '24px', borderRadius: '50%', background: 'var(--status-teal)', animation: 'bb-pulse 1.8s ease-in-out infinite' }} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{statusMsg}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9375rem' }}>
                Matching HiBid → AuctionFlex → ManyFast records...
              </p>
              {/* Glowing progress bar */}
              <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  <span>Progress</span>
                  <span style={{ color: 'var(--status-teal)' }}>{importProgress}%</span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${importProgress}%`,
                    background: 'linear-gradient(90deg, #0d9488, #14b8a6)',
                    borderRadius: '999px',
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 12px rgba(13,148,136,0.5)'
                  }} />
                </div>
              </div>
              <style>{`
                @keyframes bb-spin { to { transform: rotate(360deg); } }
                @keyframes bb-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.8); opacity: 0.6; } }
              `}</style>
            </div>
          )}

          {step === 2 && importResult && (
            <PostImportSuccess 
              stats={importResult.stats}
              run={importResult.run} 
              orders={importResult.orders}
              onReset={handleReset}
              onNavigate={onNavigate}
            />
          )}
        </div>
      )}

      {activeTab === 'Import History' && (
        <div className="card">
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Historical logs are being migrated to the new alignment structure.</p>
        </div>
      )}
    </div>
  );
};

export default FileImportPage;
