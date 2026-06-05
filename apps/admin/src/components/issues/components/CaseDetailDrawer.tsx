import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Clock, CheckCircle2, DollarSign, Image as ImageIcon, Video as VideoIcon, ExternalLink, FileText } from 'lucide-react';
import { ButtonSpinner } from '../../shared/LoadingComponents';

interface CaseDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: any;
  user?: any;
  onUpdate: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CaseDetailDrawer: React.FC<CaseDetailDrawerProps> = ({ isOpen, onClose, caseData, onUpdate, showToast }) => {
  const [caseDetails, setCaseDetails] = useState<any>(null);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [savingResolution, setSavingResolution] = useState(false);

  // Editable resolution fields
  const [refundStatus, setRefundStatus] = useState<'None' | 'Requested' | 'Authorized' | 'Applied'>('None');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundMethod, setRefundMethod] = useState<string>('');
  const [caseStatus, setCaseStatus] = useState<'Open' | 'In Review' | 'Resolved'>('Open');

  useEffect(() => {
    if (isOpen && caseData?._id) {
      fetchCaseDetails();
    } else {
      setCaseDetails(null);
    }
  }, [isOpen, caseData]);

  useEffect(() => {
    if (caseDetails) {
      setRefundStatus(caseDetails.refundStatus || 'None');
      setRefundAmount(caseDetails.refundAmount || 0);
      setRefundMethod(caseDetails.refundMethod || '');
      setCaseStatus(caseDetails.status || 'Open');
    }
  }, [caseDetails]);

  const fetchCaseDetails = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cases/${caseData._id}`);
      if (res.ok) {
        const data = await res.json();
        setCaseDetails(data);
      } else {
        setCaseDetails(caseData);
      }
    } catch (err) {
      console.error('Error fetching case details:', err);
      setCaseDetails(caseData);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cases/${caseData._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        await fetchCaseDetails();
        onUpdate();
        if (newStatus === 'Resolved') {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error updating case status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setNotesLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cases/${caseData._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote, status: caseStatus })
      });
      
      if (res.ok) {
        setNewNote('');
        await fetchCaseDetails();
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding case note:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSaveResolution = async () => {
    try {
      setSavingResolution(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cases/${caseData._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundStatus,
          refundAmount,
          refundMethod,
          status: caseStatus
        })
      });
      
      if (res.ok) {
        showToast('Resolution details saved successfully!', 'success');
        await fetchCaseDetails();
        onUpdate();
      } else {
        showToast('Failed to save resolution details.', 'error');
      }
    } catch (error) {
      console.error('Error saving resolution:', error);
    } finally {
      setSavingResolution(false);
    }
  };

  const [releasingLot, setReleasingLot] = useState<string | null>(null);

  const handleReleaseLot = async (lotNumber: string) => {
    try {
      setReleasingLot(lotNumber);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cases/${caseData._id}/release-lot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lotNumber })
      });
      
      if (res.ok) {
        showToast(`Lot ${lotNumber} has been marked as found and released!`, 'success');
        await fetchCaseDetails();
        onUpdate();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to release lot.', 'error');
      }
    } catch (error) {
      console.error('Error releasing lot:', error);
      showToast('Network error releasing lot.', 'error');
    } finally {
      setReleasingLot(null);
    }
  };

  if (!isOpen || !caseData) return null;

  const currentCase = caseDetails || caseData;

  const getMediaUrl = (pathStr: string) => {
    if (!pathStr) return '';
    if (pathStr.startsWith('data:')) return pathStr;
    if (pathStr.startsWith('http://') || pathStr.startsWith('https://')) return pathStr;
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const rootUrl = apiUrl.replace(/\/api\/?$/, '');
    
    if (pathStr.startsWith('/uploads')) return `${rootUrl}${pathStr}`;
    return `${rootUrl}/uploads/cases/${pathStr}`;
  };

  const isVideo = (pathStr: string) => {
    if (pathStr.startsWith('data:')) {
      return pathStr.startsWith('data:video/');
    }
    const ext = pathStr.split('.').pop()?.toLowerCase();
    return ext ? ['mp4', 'mov', 'webm', 'avi', 'm4v'].includes(ext) : false;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: isOpen ? 0 : '-100%',
      width: '100%',
      maxWidth: '650px',
      height: '100vh',
      background: 'white',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
      transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)' }}>{currentCase.caseNumber}</h2>
            <span style={{ 
              fontSize: '0.625rem', 
              fontWeight: 900, 
              padding: '0.2rem 0.6rem', 
              borderRadius: '1rem', 
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--status-blue)',
              border: '1px solid currentColor',
              textTransform: 'uppercase'
            }}>
              {currentCase.type}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: currentCase.status === 'Open' ? 'var(--status-amber)' : currentCase.status === 'In Review' ? 'var(--status-blue)' : 'var(--status-green)' 
              }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{currentCase.status}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {currentCase.auctionRun?.title || `Auction #${currentCase.auctionRun?.auctionNumber}`}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>
      </div>

      {/* Main Scrollable Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {/* Customer & Order Card */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.025em' }}>
            Order & Bidder Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Customer Name</div>
              <div style={{ fontWeight: 700 }}>{currentCase.customerName}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Bidder Number</div>
              <div style={{ fontWeight: 700 }}>#{currentCase.bidderNumber}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Order Link</div>
              <div style={{ fontWeight: 700, color: 'var(--status-teal)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={14} />
                <span>{currentCase.order?.bookingCode || 'Booking Details'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                  ({currentCase.order?.fulfillmentStatus || 'Paid'})
                </span>
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Case Creator</div>
              <div style={{ fontWeight: 700 }}>{currentCase.createdBy || 'System'}</div>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1rem', background: '#f8fafc', border: 'none', boxShadow: 'none' }}>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Opened On</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <Clock size={14} color="var(--text-muted)" />
              <span>{new Date(currentCase.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="card" style={{ padding: '1rem', background: '#f8fafc', border: 'none', boxShadow: 'none' }}>
            <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Last Activity</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <Clock size={14} color="var(--text-muted)" />
              <span>{new Date(currentCase.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Disputed Lot details */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Disputed Lots</h3>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', width: '80px' }}>Lot #</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Reason</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Notes / Details</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', width: '120px' }}>Status / Action</th>
                </tr>
              </thead>
              <tbody>
                {currentCase.lines?.filter((l: any) => l.lotNumber !== 'GENERAL').map((line: any, idx: number) => {
                  const isWithheld = line.reason === 'Missing at Release' || line.reason === 'Missing in Prep' || line.reason === 'Customer Refused' || line.reason === 'Issue' || line.status === 'Open';
                  const isResolved = line.status === 'Resolved';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Lot {line.lotNumber}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 700 }}>
                          {line.reason}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{line.notes || 'No details'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {isResolved ? (
                          <span style={{ color: 'var(--status-green)', fontWeight: 'bold', fontSize: '0.75rem' }}>Found & Released</span>
                        ) : isWithheld ? (
                          <button
                            type="button"
                            onClick={() => handleReleaseLot(line.lotNumber)}
                            disabled={releasingLot === line.lotNumber}
                            style={{
                              padding: '4px 8px',
                              background: 'var(--status-teal)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {releasingLot === line.lotNumber ? 'Releasing...' : 'Found & Release'}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Pending Review</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {(!currentCase.lines || currentCase.lines.filter((l: any) => l.lotNumber !== 'GENERAL').length === 0) && (
                  <tr>
                    <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No specific lot records listed.</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Evidence Attachments */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Evidence & Uploaded Proof ({currentCase.evidence?.length || 0})
          </h3>
          {(!currentCase.evidence || currentCase.evidence.length === 0) ? (
            <div style={{ border: '1.5px dashed var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No photo/video evidence uploaded by client.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
              {currentCase.evidence.map((path: string, i: number) => {
                const url = getMediaUrl(path);
                const isVid = isVideo(path);
                return (
                  <div 
                    key={i} 
                    onClick={() => window.open(url, '_blank')}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      height: '110px',
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#0f172a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Click to view full size"
                  >
                    {isVid ? (
                      <>
                        <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                        <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', padding: '2px', borderRadius: '4px', color: 'white', display: 'flex', alignItems: 'center' }}>
                          <VideoIcon size={12} />
                        </div>
                      </>
                    ) : (
                      <>
                        <img src={url} alt={`Evidence ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => {
                          // fallback
                          (e.target as HTMLElement).style.display = 'none';
                        }} />
                        <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', padding: '2px', borderRadius: '4px', color: 'white', display: 'flex', alignItems: 'center' }}>
                          <ImageIcon size={12} />
                        </div>
                      </>
                    )}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.4)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                    >
                      <ExternalLink size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resolution Fields Panel */}
        <div className="card animate-fade" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem', background: '#fdfefe' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', textTransform: 'uppercase', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={18} style={{ color: 'var(--status-teal)' }} />
            Resolution & Refund Processing
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Case Status</label>
              <select 
                value={caseStatus}
                onChange={(e) => setCaseStatus(e.target.value as any)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
              >
                <option value="Open">Open</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Refund Status</label>
              <select 
                value={refundStatus}
                onChange={(e) => setRefundStatus(e.target.value as any)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
              >
                <option value="None">None</option>
                <option value="Requested">Requested</option>
                <option value="Authorized">Authorized</option>
                <option value="Applied">Applied</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Refund Amount ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={refundAmount || ''}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
                placeholder="0.00"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>Refund Method</label>
              <input 
                type="text" 
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
                placeholder="e.g. Credit Card, Store Credit"
              />
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleSaveResolution}
            disabled={savingResolution}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.625rem', background: 'var(--status-teal)', color: 'white', border: 'none', fontWeight: 700 }}
          >
            {savingResolution ? <ButtonSpinner /> : 'Save Resolution & Refund Details'}
          </button>
        </div>

        {/* Case Notes & Timeline History */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Case Timeline Logs
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentCase.lines?.map((line: any, idx: number) => {
              const isStaff = line.lotNumber === 'GENERAL' || line.reason === 'Staff Update';
              return (
                <div 
                  key={idx} 
                  style={{
                    background: isStaff ? '#f0fdfa' : '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderLeft: isStaff ? '4px solid var(--status-teal)' : '4px solid var(--status-blue)',
                    borderRadius: '0.375rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.8125rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <span style={{ color: isStaff ? 'var(--status-teal)' : 'var(--text-main)' }}>
                      {isStaff ? 'Staff Activity Note' : `Lot ${line.lotNumber} Record`}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {isStaff ? `Action: ${line.reason}` : `Type: ${line.reason}`}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                    {line.notes || 'No description provided.'}
                  </div>
                </div>
              );
            })}
            {(!currentCase.lines || currentCase.lines.length === 0) && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
                No events recorded in this case yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Add Note Action */}
      <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', background: 'white' }}>
        <form onSubmit={handleAddNote}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <textarea 
              placeholder="Add a case note or client resolution updates..." 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', minHeight: '60px', resize: 'none', fontSize: '0.875rem' }}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '0.625rem', background: 'var(--status-blue)', color: 'white', border: 'none' }}
              disabled={notesLoading}
            >
              {notesLoading ? <ButtonSpinner /> : <><MessageSquare size={16} /> Add Internal Note</>}
            </button>
            <button 
              type="button"
              className="btn"
              style={{ padding: '0.625rem', borderColor: 'var(--border-color)' }}
              onClick={() => handleUpdateStatus('Resolved')}
              disabled={loading || currentCase.status === 'Resolved'}
            >
              {loading ? <ButtonSpinner /> : <><CheckCircle2 size={16} /> Resolve Case</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseDetailDrawer;
