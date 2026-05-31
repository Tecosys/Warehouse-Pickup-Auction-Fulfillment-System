import { useState, useEffect } from 'react';
import { Save, Settings, ShieldAlert, Mail, MessageSquare, Info, ShieldCheck, Calendar, Clock } from 'lucide-react';

interface SettingsPageProps {
  user: any;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState<'General' | 'Shipping' | 'Pickup' | 'Disputes' | 'Risk' | 'Providers' | 'PortalWording' | 'Templates'>('General');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // General Defaults
  const [buyerPremium, setBuyerPremium] = useState(15);
  const [taxRate, setTaxRate] = useState(13);
  const [creditExpiry, setCreditExpiry] = useState(12);
  const [googleReviewLink, setGoogleReviewLink] = useState('https://g.page/r/bidboss/review');
  const [restockingFeePercent, setRestockingFeePercent] = useState(10);
  const [restockingFeeFlat, setRestockingFeeFlat] = useState(50);

  // Shipping Formulas
  const [shippingSpreadParcelPct, setShippingSpreadParcelPct] = useState(50);
  const [shippingSpreadParcelMin, setShippingSpreadParcelMin] = useState(8);
  const [shippingFeeParcel, setShippingFeeParcel] = useState(5);
  const [shippingSpreadMailerPct, setShippingSpreadMailerPct] = useState(40);
  const [shippingSpreadMailerMin, setShippingSpreadMailerMin] = useState(5);
  const [shippingFeeMailer, setShippingFeeMailer] = useState(2);
  const [shippingSpreadPalletPct, setShippingSpreadPalletPct] = useState(18);
  const [shippingSpreadPalletMin, setShippingSpreadPalletMin] = useState(75);
  const [shippingFeePallet, setShippingFeePallet] = useState(50);

  // Pickup Slots Rules
  const [pickupRescheduleLimitHours, setPickupRescheduleLimitHours] = useState(2);

  // Disputes & Returns
  const [disputeWindowHours, setDisputeWindowHours] = useState(24);
  const [disputeEligibleGrades, setDisputeEligibleGrades] = useState('A,B');

  // Risk Rules
  const [riskHighValueThreshold, setRiskHighValueThreshold] = useState(300);
  const [riskComplaintRatioLimit, setRiskComplaintRatioLimit] = useState(25);

  // Provider Settings
  const [twilioSenderNumber, setTwilioSenderNumber] = useState('+15551234567');
  const [supportEmail, setSupportEmail] = useState('support@bidbossinc.ca');
  const [companyName, setCompanyName] = useState('Bid Boss Inc.');

  // Portal Wording
  const [customerPortalPickupRules, setCustomerPortalPickupRules] = useState('Please pick up your won items during your booked slot.');
  const [customerPortalShippingAgreement, setCustomerPortalShippingAgreement] = useState('Shipping selection is binding. Pickups will not be allowed once shipping is confirmed.');

  // Template Editor State
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateSaving, setTemplateSaving] = useState(false);

  // Template Form State
  const [templateName, setTemplateName] = useState('');
  const [templateChannel, setTemplateChannel] = useState<'SMS' | 'Email' | 'Both'>('Both');
  const [templateSmsText, setTemplateSmsText] = useState('');
  const [templateEmailSubject, setTemplateEmailSubject] = useState('');
  const [templateEmailBody, setTemplateEmailBody] = useState('');
  const [templateIsEnabled, setTemplateIsEnabled] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchTemplates();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings`);
      if (res.ok) {
        const data = await res.json();
        // Load General Defaults
        setBuyerPremium(data.buyer_premium * 100);
        setTaxRate(data.tax_rate * 100);
        setCreditExpiry(data.credit_expiry_months);
        setGoogleReviewLink(data.google_review_link);
        setRestockingFeePercent(data.restocking_fee_percent ?? 10);
        setRestockingFeeFlat(data.restocking_fee_flat ?? 50);

        // Load Shipping Spreads
        setShippingSpreadParcelPct(data.shipping_spread_parcel_pct ?? 50);
        setShippingSpreadParcelMin(data.shipping_spread_parcel_min ?? 8);
        setShippingFeeParcel(data.shipping_fee_parcel ?? 5);
        setShippingSpreadMailerPct(data.shipping_spread_mailer_pct ?? 40);
        setShippingSpreadMailerMin(data.shipping_spread_mailer_min ?? 5);
        setShippingFeeMailer(data.shipping_fee_mailer ?? 2);
        setShippingSpreadPalletPct(data.shipping_spread_pallet_pct ?? 18);
        setShippingSpreadPalletMin(data.shipping_spread_pallet_min ?? 75);
        setShippingFeePallet(data.shipping_fee_pallet ?? 50);

        // Load Pickup Slot Rules
        setPickupRescheduleLimitHours(data.pickup_reschedule_limit_hours ?? 2);

        // Load Disputes & Returns
        setDisputeWindowHours(data.dispute_window_hours ?? 24);
        setDisputeEligibleGrades(data.dispute_eligible_grades ?? 'A,B');

        // Load Risk Rules
        setRiskHighValueThreshold(data.risk_high_value_threshold ?? 300);
        setRiskComplaintRatioLimit(data.risk_complaint_ratio_limit ?? 25);

        // Load Provider Settings
        setTwilioSenderNumber(data.twilio_sender_number ?? '+15551234567');
        setSupportEmail(data.support_email ?? 'support@bidbossinc.ca');
        setCompanyName(data.company_name ?? 'Bid Boss Inc.');

        // Load Portal Wording
        setCustomerPortalPickupRules(data.customer_portal_pickup_rules ?? 'Please pick up your won items during your booked slot.');
        setCustomerPortalShippingAgreement(data.customer_portal_shipping_agreement ?? 'Shipping selection is binding. Pickups will not be allowed once shipping is confirmed.');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      showToast('Failed to load settings from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/templates`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
        if (data.length > 0) {
          selectTemplate(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const selectTemplate = (temp: any) => {
    setSelectedTemplate(temp);
    setTemplateName(temp.name);
    setTemplateChannel(temp.channel);
    setTemplateSmsText(temp.smsText);
    setTemplateEmailSubject(temp.emailSubject);
    setTemplateEmailBody(temp.emailBody);
    setTemplateIsEnabled(temp.isEnabled);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_premium: buyerPremium / 100,
          tax_rate: taxRate / 100,
          credit_expiry_months: creditExpiry,
          google_review_link: googleReviewLink,
          restocking_fee_percent: restockingFeePercent,
          restocking_fee_flat: restockingFeeFlat,

          shipping_spread_parcel_pct: shippingSpreadParcelPct,
          shipping_spread_parcel_min: shippingSpreadParcelMin,
          shipping_fee_parcel: shippingFeeParcel,
          shipping_spread_mailer_pct: shippingSpreadMailerPct,
          shipping_spread_mailer_min: shippingSpreadMailerMin,
          shipping_fee_mailer: shippingFeeMailer,
          shipping_spread_pallet_pct: shippingSpreadPalletPct,
          shipping_spread_pallet_min: shippingSpreadPalletMin,
          shipping_fee_pallet: shippingFeePallet,

          pickup_reschedule_limit_hours: pickupRescheduleLimitHours,
          dispute_window_hours: disputeWindowHours,
          dispute_eligible_grades: disputeEligibleGrades,

          risk_high_value_threshold: riskHighValueThreshold,
          risk_complaint_ratio_limit: riskComplaintRatioLimit,

          twilio_sender_number: twilioSenderNumber,
          support_email: supportEmail,
          company_name: companyName,

          customer_portal_pickup_rules: customerPortalPickupRules,
          customer_portal_shipping_agreement: customerPortalShippingAgreement
        })
      });

      if (res.ok) {
        showToast('System settings saved successfully!', 'success');
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

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      setTemplateSaving(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/templates/${selectedTemplate.templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          channel: templateChannel,
          smsText: templateSmsText,
          emailSubject: templateEmailSubject,
          emailBody: templateEmailBody,
          isEnabled: templateIsEnabled
        })
      });

      if (res.ok) {
        showToast('Template updated successfully!', 'success');
        fetchTemplates();
      } else {
        throw new Error('Failed to update template');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save template.', 'error');
    } finally {
      setTemplateSaving(false);
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
    <div className="animate-slide" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure core rules, shipping formulas, risk badges, and templates.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Vertical Side Navigation Tabs */}
        <div className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {[
            { id: 'General', label: 'General Defaults', icon: <Settings size={16} /> },
            { id: 'Shipping', label: 'Shipping Formulas', icon: <Info size={16} /> },
            { id: 'Pickup', label: 'Pickup Slot Rules', icon: <Calendar size={16} /> },
            { id: 'Disputes', label: 'Disputes & Returns', icon: <Clock size={16} /> },
            { id: 'Risk', label: 'Risk & Verification', icon: <ShieldCheck size={16} /> },
            { id: 'Providers', label: 'Provider Settings', icon: <Mail size={16} /> },
            { id: 'PortalWording', label: 'Portal Wording', icon: <Info size={16} /> },
            { id: 'Templates', label: 'Communication Templates', icon: <MessageSquare size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                background: activeTab === tab.id ? 'var(--status-teal)' : 'none',
                color: activeTab === tab.id ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                textAlign: 'left',
                transition: 'all 0.15s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Settings Form Container */}
        <div style={{ flex: 1 }}>
          {activeTab !== 'Templates' ? (
            <form onSubmit={handleSaveSettings} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {activeTab === 'General' && (
                <>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>General Auction & Finance Defaults</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>BUYER PREMIUM (%)</label>
                      <input type="number" step="0.1" value={buyerPremium} onChange={e => setBuyerPremium(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>TAX RATE (HST %)</label>
                      <input type="number" step="0.1" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>CREDIT EXPIRY (MONTHS)</label>
                      <input type="number" value={creditExpiry} onChange={e => setCreditExpiry(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>GOOGLE REVIEW REDIRECT LINK</label>
                      <input type="url" value={googleReviewLink} onChange={e => setGoogleReviewLink(e.target.value)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>RESTOCKING FEE (%)</label>
                      <input type="number" value={restockingFeePercent} onChange={e => setRestockingFeePercent(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>RESTOCKING FLAT CHARGE ($)</label>
                      <input type="number" value={restockingFeeFlat} onChange={e => setRestockingFeeFlat(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Shipping' && (
                <>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>Shipping Markup Formulas</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                    {/* Parcel */}
                    <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--status-teal)', display: 'block', marginBottom: '0.75rem' }}>Parcel Type</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input type="number" value={shippingSpreadParcelPct} onChange={e => setShippingSpreadParcelPct(parseInt(e.target.value) || 0)} placeholder="Spread %" style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                        <input type="number" value={shippingSpreadParcelMin} onChange={e => setShippingSpreadParcelMin(parseFloat(e.target.value) || 0)} placeholder="Min Spread $" style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                        <input type="number" value={shippingFeeParcel} onChange={e => setShippingFeeParcel(parseFloat(e.target.value) || 0)} placeholder="Handling Fee $" style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                      </div>
                    </div>
                    {/* Mailer */}
                    <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--status-blue)', display: 'block', marginBottom: '0.75rem' }}>Mailer Type</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input type="number" value={shippingSpreadMailerPct} onChange={e => setShippingSpreadMailerPct(parseInt(e.target.value) || 0)} placeholder="Spread %" style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                        <input type="number" value={shippingSpreadMailerMin} onChange={e => setShippingSpreadMailerMin(parseFloat(e.target.value) || 0)} placeholder="Min Spread $" style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                        <input type="number" value={shippingFeeMailer} onChange={e => setShippingFeeMailer(parseFloat(e.target.value) || 0)} placeholder="Handling Fee $" style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                      </div>
                    </div>
                    {/* Pallet */}
                    <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--status-amber)', display: 'block', marginBottom: '0.75rem' }}>Pallet / Freight</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input type="number" value={shippingSpreadPalletPct} onChange={e => setShippingSpreadPalletPct(parseInt(e.target.value) || 0)} placeholder="Spread %" style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                        <input type="number" value={shippingSpreadPalletMin} onChange={e => setShippingSpreadPalletMin(parseFloat(e.target.value) || 0)} placeholder="Min Spread $" style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                        <input type="number" value={shippingFeePallet} onChange={e => setShippingFeePallet(parseFloat(e.target.value) || 0)} placeholder="Handling Fee $" style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Pickup' && (
                <>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>Pickup Slots Rules</h3>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>RESCHEDULE LIMIT DEADLINE (HOURS BEFORE APPOINTMENT)</label>
                    <input type="number" value={pickupRescheduleLimitHours} onChange={e => setPickupRescheduleLimitHours(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Customers cannot reschedule their pickup time online if the appointment is closer than this duration.</p>
                  </div>
                </>
              )}

              {activeTab === 'Disputes' && (
                <>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>Dispute & Warranty Policy</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>DISPUTE WINDOW LIMIT (HOURS AFTER RELEASE)</label>
                      <input type="number" value={disputeWindowHours} onChange={e => setDisputeWindowHours(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>ELIGIBLE RETURN ITEM GRADES (COMMA SEPARATED)</label>
                      <input type="text" value={disputeEligibleGrades} onChange={e => setDisputeEligibleGrades(e.target.value)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Risk' && (
                <>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>Risk Thresholds & Quality Scoring</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>HIGH VALUE REVIEW THRESHOLD ($)</label>
                      <input type="number" value={riskHighValueThreshold} onChange={e => setRiskHighValueThreshold(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Flag unverified orders with value exceeding this limit for manual review.</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>AMBER/RED COMPLAINT RATIO LIMIT (%)</label>
                      <input type="number" value={riskComplaintRatioLimit} onChange={e => setRiskComplaintRatioLimit(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Threshold for marking accounts amber/red due to returns frequency.</p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Providers' && (
                <>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>Provider Credentials & Sender Settings</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>COMPANY LEGAL NAME</label>
                      <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>TWILIO OUTBOUND SMS SENDER NUMBER</label>
                      <input type="text" value={twilioSenderNumber} onChange={e => setTwilioSenderNumber(e.target.value)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>SUPPORT EMAIL ADDRESS</label>
                      <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'PortalWording' && (
                <>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>Customer Portal Notice Wording</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>PICKUP POLICY NOTICE TERMS</label>
                      <textarea value={customerPortalPickupRules} onChange={e => setCustomerPortalPickupRules(e.target.value)} style={{ width: '100%', minHeight: '80px', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>SHIPPING AGREEMENT BINDING TERMS</label>
                      <textarea value={customerPortalShippingAgreement} onChange={e => setCustomerPortalShippingAgreement(e.target.value)} style={{ width: '100%', minHeight: '80px', padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem' }} required />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
                <ShieldAlert size={20} style={{ color: 'var(--status-red)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#991b1b', display: 'block' }}>Warning: System-wide Parameters</span>
                  <span style={{ fontSize: '0.75rem', color: '#7f1d1d', display: 'block', marginTop: '0.25rem' }}>
                    Updating core variables affects calculations globally. Please review values before submitting.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <button 
                  type="submit" disabled={saving} className="btn btn-primary"
                  style={{ padding: '0.75rem 2.5rem', background: 'var(--status-teal)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>
              {/* Templates Sidebar */}
              <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Template Directory</h4>
                {templates.map(t => (
                  <button
                    key={t.templateId}
                    onClick={() => selectTemplate(t)}
                    style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid',
                      borderColor: selectedTemplate?.templateId === t.templateId ? 'var(--status-teal)' : 'var(--border-color)',
                      background: selectedTemplate?.templateId === t.templateId ? 'rgba(13, 148, 136, 0.04)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: selectedTemplate?.templateId === t.templateId ? 'var(--status-teal)' : 'var(--text-main)', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>#{t.templateId} {t.name}</span>
                      {!t.isEnabled && <span style={{ fontSize: '0.7rem', color: 'var(--status-red)', fontWeight: 600 }}>Disabled</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                      {['SMS', 'Both'].includes(t.channel) && <span style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}><MessageSquare size={10} /> SMS</span>}
                      {['Email', 'Both'].includes(t.channel) && <span style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}><Mail size={10} /> Email</span>}
                    </div>
                  </button>
                ))}
              </div>

              {/* Template Editor Form */}
              {selectedTemplate ? (
                <form onSubmit={handleSaveTemplate} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Edit Template #{selectedTemplate.templateId}</h3>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{selectedTemplate.name}</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={templateIsEnabled}
                        onChange={e => setTemplateIsEnabled(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--status-teal)' }}
                      />
                      Enabled
                    </label>
                  </div>

                  {/* Channel Selector */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>DELIVERY CHANNELS</label>
                      <select
                        value={templateChannel}
                        onChange={e => setTemplateChannel(e.target.value as any)}
                        style={{ width: '100%', padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 600 }}
                      >
                        <option value="Both">Both SMS and Email</option>
                        <option value="SMS">SMS Only</option>
                        <option value="Email">Email Only</option>
                      </select>
                    </div>

                    {/* Placeholders list */}
                    {selectedTemplate.variables?.length > 0 && (
                      <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Info size={12} style={{ color: 'var(--status-teal)' }} /> Available Placeholders
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                          {selectedTemplate.variables.map((v: string) => (
                            <code key={v} style={{ background: 'white', border: '1px solid var(--border-color)', color: 'var(--status-teal)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {`{${v}}`}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Email Subject field */}
                  {['Email', 'Both'].includes(templateChannel) && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>EMAIL SUBJECT</label>
                      <input
                        type="text"
                        value={templateEmailSubject}
                        onChange={e => setTemplateEmailSubject(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', outline: 'none', fontWeight: 500 }}
                        required
                      />
                    </div>
                  )}

                  {/* SMS text field */}
                  {['SMS', 'Both'].includes(templateChannel) && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>SMS TEXT MESSAGE CONTENT</label>
                      <textarea
                        value={templateSmsText}
                        onChange={e => setTemplateSmsText(e.target.value)}
                        style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical' }}
                        required
                      />
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>
                        Characters: {templateSmsText?.length || 0}
                      </div>
                    </div>
                  )}

                  {/* Email body text area */}
                  {['Email', 'Both'].includes(templateChannel) && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>EMAIL BODY CONTENT</label>
                      <textarea
                        value={templateEmailBody}
                        onChange={e => setTemplateEmailBody(e.target.value)}
                        style={{ width: '100%', minHeight: '180px', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical' }}
                        required
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                    <button
                      type="submit"
                      disabled={templateSaving}
                      className="btn btn-primary"
                      style={{ padding: '0.75rem 2rem', background: 'var(--status-teal)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Save size={18} />
                      {templateSaving ? 'Saving Template...' : 'Save Template Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No template selected.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
