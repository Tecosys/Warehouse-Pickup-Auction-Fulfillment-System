// Shared premium loading components for the BidBoss admin panel

// ─── Full-page Loading Screen ─────────────────────────────────────────────────
export const PageLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '2rem',
    padding: '4rem'
  }}>
    {/* Logo mark + orbit ring */}
    <div style={{ position: 'relative', width: '72px', height: '72px' }}>
      {/* Outer orbit */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        border: '3px solid transparent',
        borderTopColor: 'var(--status-teal)',
        borderRightColor: 'rgba(13,148,136,0.3)',
        animation: 'bb-spin 0.9s linear infinite'
      }} />
      {/* Inner orbit */}
      <div style={{
        position: 'absolute',
        inset: '12px',
        borderRadius: '50%',
        border: '2px solid transparent',
        borderTopColor: 'rgba(13,148,136,0.5)',
        animation: 'bb-spin 1.4s linear infinite reverse'
      }} />
      {/* Center dot */}
      <div style={{
        position: 'absolute',
        inset: '22px',
        borderRadius: '50%',
        background: 'var(--status-teal)',
        animation: 'bb-pulse 1.8s ease-in-out infinite'
      }} />
    </div>

    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: '0.9375rem',
        fontWeight: 600,
        color: 'var(--text-main)',
        marginBottom: '0.375rem',
        letterSpacing: '-0.01em'
      }}>{message}</div>
      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'var(--status-teal)',
              animation: `bb-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              opacity: 0.6
            }}
          />
        ))}
      </div>
    </div>

    <style>{`
      @keyframes bb-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes bb-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(0.85); opacity: 0.6; }
      }
      @keyframes bb-bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40% { transform: translateY(-6px); opacity: 1; }
      }
    `}</style>
  </div>
);

// ─── Skeleton Card Row ─────────────────────────────────────────────────────────
export const SkeletonRow = ({ cols = 4 }: { cols?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1.5rem', padding: '1.25rem 0', borderBottom: '1px solid var(--border-color)' }}>
    {Array.from({ length: cols }).map((_, i) => (
      <div key={i}>
        <div className="skeleton" style={{
          height: i === 0 ? '20px' : '16px',
          width: i === 0 ? '70%' : `${50 + Math.random() * 30}%`,
          borderRadius: '0.375rem'
        }} />
      </div>
    ))}
  </div>
);

// ─── Skeleton Table (rows of shimmer) ─────────────────────────────────────────
export const SkeletonTable = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    {/* Fake header */}
    <div style={{
      background: '#f8fafc',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.875rem 1.5rem',
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '1.5rem'
    }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: '12px', width: '60%', borderRadius: '0.25rem' }} />
      ))}
    </div>
    <div style={{ padding: '0 1.5rem' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </div>
  </div>
);

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
export const SkeletonCard = () => (
  <div className="card" style={{ padding: '1.5rem' }}>
    <div className="skeleton" style={{ height: '14px', width: '40%', marginBottom: '1rem', borderRadius: '0.375rem' }} />
    <div className="skeleton" style={{ height: '32px', width: '60%', marginBottom: '0.75rem', borderRadius: '0.5rem' }} />
    <div className="skeleton" style={{ height: '12px', width: '80%', borderRadius: '0.25rem' }} />
  </div>
);

// ─── Inline Button Spinner ─────────────────────────────────────────────────────
export const ButtonSpinner = () => (
  <div style={{
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: 'white',
    animation: 'bb-spin 0.7s linear infinite',
    flexShrink: 0
  }} />
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export const ProgressBar = ({ value = 0, label }: { value: number; label?: string }) => (
  <div>
    {label && (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        <span>{label}</span>
        <span style={{ color: 'var(--status-teal)' }}>{value}%</span>
      </div>
    )}
    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${value}%`,
        background: 'linear-gradient(90deg, #0d9488, #14b8a6)',
        borderRadius: '999px',
        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 0 8px rgba(13,148,136,0.4)'
      }} />
    </div>
  </div>
);
