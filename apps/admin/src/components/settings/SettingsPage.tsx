import { useState, useEffect } from 'react';
import { Save, Settings, ShieldAlert } from 'lucide-react';

interface SettingsPageProps {
  user: any;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Configurations State
  const [buyerPremium, setBuyerPremium] = useState(15);
  const [taxRate, setTaxRate] = useState(13);
  const [disputeWindow, setDisputeWindow] = useState(24);
  const [creditExpiry, setCreditExpiry] = useState(12);
  const [googleReviewLink, setGoogleReviewLink] = useState('https://g.page/r/bidboss/review');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/settings');
      if (res.ok) {
        const data = await res.json();
        setBuyerPremium(data.buyer_premium * 100);
        setTaxRate(data.tax_rate * 100);
        setDisputeWindow(data.dispute_window_hours);
        setCreditExpiry(data.credit_expiry_months);
        setGoogleReviewLink(data.google_review_link);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      showToast('Failed to load settings from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_premium: buyerPremium / 100,
          tax_rate: taxRate / 100,
          dispute_window_hours: disputeWindow,
          credit_expiry_months: creditExpiry,
          google_review_link: googleReviewLink
        })
      });

      if (res.ok) {
        showToast('Settings saved successfully!', 'success');
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--status-teal)', borderRadius: '50%' }}></div>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="animate-slide" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>System Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure financial constants, warranties, and review links for Bid Boss Operations.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <Settings size={20} style={{ color: 'var(--status-teal)' }} />
          Configuration Parameters
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Buyer Premium */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              BUYER PREMIUM (%)
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="100"
                value={buyerPremium}
                onChange={e => setBuyerPremium(parseFloat(e.target.value) || 0)}
                className="card"
                style={{ width: '100%', padding: '0.75rem 2rem 0.75rem 1rem', outline: 'none' }}
                required
              />
              <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>%</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Multiplier applied to the winning hammer price on import. Default: 15%.
            </p>
          </div>

          {/* Ontario HST */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              TAX RATE (HST %)
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="100"
                value={taxRate}
                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                className="card"
                style={{ width: '100%', padding: '0.75rem 2rem 0.75rem 1rem', outline: 'none' }}
                required
              />
              <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>%</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Default sales tax applied during item catalog import. Default: 13% Ontario HST.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Dispute Window */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              WARRANTY DISPUTE WINDOW (HOURS)
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                min="1"
                value={disputeWindow}
                onChange={e => setDisputeWindow(parseInt(e.target.value) || 0)}
                className="card"
                style={{ width: '100%', padding: '0.75rem 2rem 0.75rem 1rem', outline: 'none' }}
                required
              />
              <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>hrs</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Strict return deadline following the release complete timestamp. Default: 24 hours.
            </p>
          </div>

          {/* Credit Expiry */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              CREDIT EXPIRY (MONTHS)
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                min="0"
                value={creditExpiry}
                onChange={e => setCreditExpiry(parseInt(e.target.value) || 0)}
                className="card"
                style={{ width: '100%', padding: '0.75rem 2rem 0.75rem 1rem', outline: 'none' }}
                required
              />
              <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>mo</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Duration store credits remain active. Set to 0 for no expiration. Default: 12 months.
            </p>
          </div>
        </div>

        {/* Google Review link */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            GOOGLE REVIEW REDIRECT LINK
          </label>
          <input 
            type="url" 
            value={googleReviewLink}
            onChange={e => setGoogleReviewLink(e.target.value)}
            className="card"
            style={{ width: '100%', padding: '0.75rem 1.25rem', outline: 'none' }}
            placeholder="e.g. https://g.page/r/..."
            required
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            URL inserted dynamically into the Google Review request notification (Type 12).
          </p>
        </div>

        {/* Safeguard Warning */}
        <div style={{ display: 'flex', gap: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
          <ShieldAlert size={20} style={{ color: 'var(--status-red)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#991b1b', display: 'block' }}>Warning: System-wide Parameters</span>
            <span style={{ fontSize: '0.75rem', color: '#7f1d1d', display: 'block', marginTop: '0.25rem' }}>
              Updating buyer premium or tax rates affects all future imports. These changes will not affect previously imported auctions.
            </span>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <button 
            type="submit" 
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '0.75rem 2rem', background: 'var(--status-teal)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
