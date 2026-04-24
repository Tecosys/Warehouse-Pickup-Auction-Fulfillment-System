import React, { useState, useEffect } from 'react';
import { 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  ArrowRight,
  Database,
  Users,
  Package,
  Send,
  ExternalLink,
  Loader2,
  X,
  History,
  FileSpreadsheet,
  FileText,
  AlertTriangle
} from 'lucide-react';

const FileZone = ({ label, desc, required, file, onUpload, onError }: any) => (
  <div className={`card`} style={{ 
    textAlign: 'center', 
    border: file ? '2px solid var(--status-teal)' : '2px dashed var(--border-color)',
    background: file ? '#f0fdfa' : 'white',
    padding: '2rem'
  }}>
    <div style={{ color: file ? 'var(--status-teal)' : 'var(--text-muted)', marginBottom: '1rem' }}>
      <FileSpreadsheet size={32} />
    </div>
    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</h4>
    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{desc}</p>
    
    {file ? (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{file.name}</span>
        <button onClick={() => onUpload(null)} style={{ background: 'none', border: 'none', color: 'var(--status-red)', cursor: 'pointer' }}>
          <X size={16} />
        </button>
      </div>
    ) : (
      <button className="btn" style={{ fontSize: '0.75rem' }} onClick={() => onUpload({ name: `${label}.csv`, size: '124 KB' })}>
        Browse Files
      </button>
    )}

    <div style={{ marginTop: '1rem', fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)' }}>
      REQUIRED: {required}
    </div>
  </div>
);

const PostImportSuccess = ({ run, onReset, onNavigate }: any) => (
  <div className="success-screen animate-fade">
    <div className="card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem', borderTop: '6px solid var(--status-green)' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: 'var(--status-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
        <CheckCircle2 size={40} />
      </div>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Import Complete</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Auction {run.number} — {run.title} is ready</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '2.5rem' }}>
        {[
          { label: 'Orders Created', val: '1,284', icon: <FileText size={18} /> },
          { label: 'Lots Created', val: '4,512', icon: <Package size={18} /> },
          { label: 'Customers Matched', val: '942', icon: <Users size={18} /> },
          { label: 'Issues Flagged', val: '3', icon: <AlertTriangle size={18} />, color: 'var(--status-red)' }
        ].map((stat, i) => (
          <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
            <div style={{ color: stat.color || 'var(--text-muted)', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stat.val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Next Step: Send Initial Customer Links</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Notify all winning customers to choose Pickup or Shipping.</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="btn btn-primary" style={{ padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <Send size={20} /> Send Batch Notification
        </button>
        <button className="btn" style={{ padding: '1rem', fontWeight: 600 }}>
          Send One by One (Manual Review)
        </button>
        <button className="btn" style={{ border: 'none', color: 'var(--text-muted)', fontSize: '0.875rem' }} onClick={onReset}>
          Skip for now, go to Dashboard
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
        <button onClick={() => onNavigate('Auction Runs')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--status-teal)', fontWeight: 600, cursor: 'pointer' }}>
          Open Auction Run <ExternalLink size={16} />
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--status-teal)', fontWeight: 600, cursor: 'pointer' }}>
          View Orders List <ArrowRight size={16} />
        </button>
      </div>
    </div>
  </div>
);

const FileImportPage = ({ onNavigate }: any) => {
  const [activeTab, setActiveTab] = useState('New Import');
  const [step, setStep] = useState(0); // 0: Setup, 1: Progress, 2: Success
  const [files, setFiles] = useState<any>({ catalog: null, winning: null, bidders: null });
  const [importProgress, setImportProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Initializing import...');

  const allFilesUploaded = files.catalog && files.winning && files.bidders;

  const startImport = () => {
    setStep(1);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setImportProgress(p);
      if (p < 20) setStatusMsg('Validating file structures...');
      else if (p < 40) setStatusMsg('Creating order records (412/1284)...');
      else if (p < 60) setStatusMsg('Matching bidder details...');
      else if (p < 80) setStatusMsg('Saving lot storage locations...');
      else if (p < 100) setStatusMsg('Finalizing auction run ID-2024-043...');
      
      if (p >= 100) {
        clearInterval(interval);
        setStep(2);
      }
    }, 150);
  };

  return (
    <div className="file-import">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>File Import</h1>
          <p style={{ color: 'var(--text-muted)' }}>Upload source files to create or update an auction run</p>
        </div>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search imports..." 
            className="card"
            style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}
          />
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
              {/* Step 1: Run Setup */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--status-teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1</div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Link to Auction Run</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', paddingLeft: '2.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>AUCTION NUMBER</label>
                    <input type="text" className="card" placeholder="e.g. 043" style={{ width: '100%', padding: '0.75rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>AUCTION TITLE</label>
                    <input type="text" className="card" placeholder="e.g. Summer Sports Memorabilia" style={{ width: '100%', padding: '0.75rem' }} />
                  </div>
                </div>
              </div>

              {/* Step 2: Upload Files */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--status-teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Source Data Files</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', paddingLeft: '2.5rem' }}>
                  <FileZone 
                    label="Catalog / Lot-Location" 
                    desc="Lot numbers & storage locations" 
                    required="Lot Number, Storage Location"
                    file={files.catalog}
                    onUpload={(f: any) => setFiles({...files, catalog: f})}
                  />
                  <FileZone 
                    label="Winning Results" 
                    desc="Bidder numbers & amounts" 
                    required="Lot Number, Bidder Number"
                    file={files.winning}
                    onUpload={(f: any) => setFiles({...files, winning: f})}
                  />
                  <FileZone 
                    label="Bidders List" 
                    desc="Names, Phone & Email" 
                    required="Bidder Number, Name, Email"
                    file={files.bidders}
                    onUpload={(f: any) => setFiles({...files, bidders: f})}
                  />
                </div>
              </div>

              {/* Step 3: Validation */}
              {allFilesUploaded && (
                <div className="card" style={{ background: '#f8fafc', border: '1px solid var(--status-teal)', padding: '2rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                       <CheckCircle2 color="var(--status-green)" size={24} />
                       <div>
                         <h4 style={{ fontWeight: 700 }}>Pre-import Validation Successful</h4>
                         <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>3 files ready — 1,284 orders detected across 4,512 lots.</p>
                       </div>
                     </div>
                     <button className="btn btn-primary" onClick={startImport} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                       Run Import
                     </button>
                   </div>
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <Loader2 size={48} className="pulse" style={{ color: 'var(--status-teal)', margin: '0 auto 2rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{statusMsg}</h2>
              <div style={{ maxWidth: '500px', height: '8px', background: '#e2e8f0', borderRadius: '4px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: 'var(--status-teal)', width: `${importProgress}%`, transition: 'width 0.2s' }} />
              </div>
              <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)' }}>Please do not close this window while the import is in progress.</p>
            </div>
          )}

          {step === 2 && (
            <PostImportSuccess 
              run={{ number: '043', title: 'Summer Sports Memorabilia' }} 
              onReset={() => { setStep(0); setFiles({ catalog: null, winning: null, bidders: null }); }}
              onNavigate={onNavigate}
            />
          )}
        </div>
      )}

      {activeTab === 'Import History' && (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>DATE / TIME</th>
                <th style={{ padding: '1rem' }}>AUCTION RUN</th>
                <th style={{ padding: '1rem' }}>RECORDS</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem' }}>IMPORTED BY</th>
                <th style={{ padding: '1rem' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2024-04-24 10:30', run: 'RUN-042', records: '1,248 Orders', status: 'Success', user: 'Marcus V.' },
                { date: '2024-04-17 09:15', run: 'RUN-041', records: '3,892 Orders', status: 'Success', user: 'Marcus V.' },
                { date: '2024-04-10 14:00', run: 'RUN-040', records: '512 Orders', status: 'Partial', user: 'Elena K.' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{row.date}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{row.run}</td>
                  <td style={{ padding: '1rem' }}>{row.records}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      background: row.status === 'Success' ? '#ccfbf1' : '#fef3c7',
                      color: row.status === 'Success' ? '#0d9488' : '#92400e',
                      fontWeight: 600
                    }}>{row.status}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>{row.user}</td>
                  <td style={{ padding: '1rem' }}><button className="btn">View Log</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileImportPage;
