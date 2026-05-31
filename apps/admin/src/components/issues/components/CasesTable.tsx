import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { SkeletonTable } from '../../shared/LoadingComponents';

interface CasesTableProps {
  filterStatus?: string;
  onOpenCase: (caseData: any) => void;
  filters: {
    search: string;
    type: string;
    auctionId: string;
  };
}

const CasesTable: React.FC<CasesTableProps> = ({ filterStatus, onOpenCase, filters }) => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          status: filterStatus || 'All Statuses',
          search: filters.search,
          type: filters.type,
          auctionId: filters.auctionId
        });
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cases?${queryParams}`);
        const data = await response.json();
        setCases(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [filterStatus, filters]);

  if (loading) return <SkeletonTable rows={5} cols={8} />;

  return (
    <div className="card animate-fade" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Case #</th>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bidder #</th>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lots</th>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type</th>
            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
            <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {cases.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No cases found matching your filters.
              </td>
            </tr>
          ) : cases.map((c) => (
            <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--status-teal)', fontFamily: 'monospace' }}>{c.caseNumber}</td>
              <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>{c.bidderNumber}</td>
              <td style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ fontWeight: 600 }}>{c.customerName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {c.auctionRun?.title || `Auction #${c.auctionRun?.auctionNumber}`}
                </div>
              </td>
              <td style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: '#f1f5f9', display: 'inline-block', fontSize: '0.75rem', fontWeight: 700 }}>
                  {c.lines?.length > 0 ? `Lot ${c.lines.map((l: any) => l.lotNumber).join(', ')}` : 'N/A'}
                </div>
              </td>
              <td style={{ padding: '1.25rem 1.5rem' }}>
                <span style={{ 
                  fontSize: '0.625rem', 
                  fontWeight: 900, 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '1rem', 
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--status-blue)',
                  border: '1px solid currentColor',
                  textTransform: 'uppercase'
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {new Date(c.updatedAt).toLocaleDateString()}
                </div>
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
    </div>
  );
};

export default CasesTable;
