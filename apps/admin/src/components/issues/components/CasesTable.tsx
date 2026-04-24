import React from 'react';
import { ChevronRight } from 'lucide-react';

const MOCK_CASES = [
  { id: 'CAS-88219', auction: 'AUC-31', bidderNum: 'B-9442', customer: 'Jonathan Harker', orderId: '#ORD-2023-4412', lots: ['112', '114'], type: 'DAMAGED ITEM', status: 'In Review', created: '2026-04-24 10:22', updated: '2h ago' },
  { id: 'CAS-88104', auction: 'AUC-31', bidderNum: 'B-1033', customer: 'Mina Murray', orderId: '#ORD-2023-5591', lots: ['88'], type: 'MISSING LOT', status: 'Open', created: '2026-04-23 15:45', updated: 'Aging: 7 Days' },
  { id: 'CAS-88092', auction: 'AUC-30', bidderNum: 'B-4402', customer: 'Arthur Holmwood', orderId: '#ORD-2023-3112', lots: ['402'], type: 'RETURNS', status: 'In Review', created: '2026-04-22 09:12', updated: 'Pending Intake' },
  { id: 'CAS-87991', auction: 'AUC-30', bidderNum: 'B-0012', customer: 'Abraham Van Helsing', orderId: '#ORD-2023-1102', lots: ['22'], type: 'WRONG ITEM', status: 'Resolved', created: '2026-04-21 14:30', updated: 'Resolved' },
];

interface CasesTableProps {
  filterStatus?: string;
  onOpenCase: (caseData: any) => void;
}

const CasesTable: React.FC<CasesTableProps> = ({ filterStatus, onOpenCase }) => {
  const filteredCases = filterStatus 
    ? MOCK_CASES.filter(c => c.status === filterStatus) 
    : MOCK_CASES;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Case #</th>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bidder #</th>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order ID</th>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lots</th>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</th>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
            <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCases.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--status-teal)', fontFamily: 'monospace' }}>{c.id}</td>
              <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>{c.bidderNum}</td>
              <td style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ fontWeight: 600 }}>{c.customer}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.auction}</div>
              </td>
              <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>{c.orderId}</td>
              <td style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: '#f1f5f9', display: 'inline-block', fontSize: '0.75rem', fontWeight: 700 }}>
                  Lot {c.lots.join(', ')}
                </div>
              </td>
              <td style={{ padding: '1.25rem 1.5rem' }}>
                <span style={{ 
                  fontSize: '0.625rem', 
                  fontWeight: 900, 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '1rem', 
                  background: c.type === 'DAMAGED ITEM' ? 'rgba(245, 158, 11, 0.1)' : c.type === 'MISSING LOT' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  color: c.type === 'DAMAGED ITEM' ? 'var(--status-amber)' : c.type === 'MISSING LOT' ? 'var(--status-red)' : 'var(--status-blue)',
                  border: '1px solid currentColor'
                }}>
                  {c.type}
                </span>
              </td>
              <td style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: c.status === 'Open' ? 'var(--status-amber)' : c.status === 'In Review' ? 'var(--status-blue)' : 'var(--status-green)' 
                  }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{c.status}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{c.updated}</div>
              </td>
              <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                <button 
                  onClick={() => onOpenCase(c)}
                  style={{ background: 'none', border: 'none', color: 'var(--status-teal)', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Details
                  <ChevronRight size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CasesTable;
