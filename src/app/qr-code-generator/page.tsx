'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, Type, Mail, Phone, Wifi, Contact,
  Download, Crown, ChevronRight, Sparkles,
} from 'lucide-react';
import QRCode from 'qrcode';
import EmailCapture from '@/components/EmailCapture';

// ─── Types ────────────────────────────────────────────────────────
type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard';

interface TabDef {
  id: QRType;
  label: string;
  icon: typeof Link2;
}

const tabs: TabDef[] = [
  { id: 'url', label: 'URL', icon: Link2 },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'vcard', label: 'vCard', icon: Contact },
];

const DAILY_FREE_LIMIT = 10;

function getTodayKey() {
  return `sherutools_qr_${new Date().toISOString().slice(0, 10)}`;
}
function getUsageCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(getTodayKey()) || '0', 10);
}
function incrementUsage() {
  const k = getTodayKey();
  localStorage.setItem(k, String(getUsageCount() + 1));
}

// ─── Build payload ────────────────────────────────────────────────
function buildPayload(type: QRType, fields: Record<string, string>): string {
  switch (type) {
    case 'url': return fields.url || 'https://sherutools.com';
    case 'text': return fields.text || '';
    case 'email': {
      const e = fields.email || '';
      const s = fields.subject || '';
      const b = fields.body || '';
      return `mailto:${e}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`;
    }
    case 'phone': return `tel:${fields.phone || ''}`;
    case 'wifi': {
      const ssid = fields.ssid || '';
      const pass = fields.password || '';
      const enc = fields.encryption || 'WPA';
      return `WIFI:T:${enc};S:${ssid};P:${pass};;`;
    }
    case 'vcard': {
      const fn = fields.firstName || '';
      const ln = fields.lastName || '';
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${ln};${fn}`,
        `FN:${fn} ${ln}`,
        fields.vcardPhone ? `TEL:${fields.vcardPhone}` : '',
        fields.vcardEmail ? `EMAIL:${fields.vcardEmail}` : '',
        fields.org ? `ORG:${fields.org}` : '',
        fields.vcardUrl ? `URL:${fields.vcardUrl}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\n');
    }
  }
}

// ─── Color Picker ─────────────────────────────────────────────────
function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-9 h-9 rounded-xl overflow-hidden border-2 border-white/10 shadow-lg cursor-pointer group">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="w-full h-full" style={{ backgroundColor: value }} />
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 group-hover:ring-white/40 transition-all" />
      </div>
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
    </div>
  );
}

// ─── Upgrade Modal ────────────────────────────────────────────────
function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const features = [
    'Custom foreground + background colors',
    'Add logo/image in center of QR code',
    'Download as SVG, PNG, or JPEG',
    'Bulk generation (paste multiple URLs)',
    'Remove SheruTools branding',
    'Higher resolution up to 2048px',
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 max-w-md w-full relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />

            <div className="relative text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">QR Code Generator Pro</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">One-time payment, lifetime access</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">$4.99</span>
                <span className="text-slate-400 text-sm ml-1">one-time</span>
              </div>
            </div>

            <div className="relative space-y-3 mb-8">
              {features.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{f}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => window.open('https://sherutools.lemonsqueezy.com/buy/qr-code-generator-pro', '_blank')}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all text-sm"
            >
              Get Pro Now
            </motion.button>

            <button onClick={onClose} className="mt-3 w-full text-center text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Maybe later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function QRCodeGeneratorPage() {
  const [type, setType] = useState<QRType>('url');
  const [fields, setFields] = useState<Record<string, string>>({ url: 'https://' });
  const [fgColor, setFgColor] = useState('#000000');
  const [size, setSize] = useState(300);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });

  const updateField = (key: string, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
  };

  // Tab indicator
  useEffect(() => {
    const idx = tabs.findIndex(t => t.id === type);
    const el = tabRefs.current[idx];
    if (el) {
      setTabIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [type]);

  // Generate QR
  const generateQR = useCallback(async () => {
    const payload = buildPayload(type, fields);
    if (!payload) { setQrDataUrl(''); return; }
    try {
      const url = await QRCode.toDataURL(payload, {
        width: size,
        margin: 2,
        color: { dark: fgColor, light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(url);
    } catch { setQrDataUrl(''); }
  }, [type, fields, fgColor, size]);

  useEffect(() => {
    const t = setTimeout(generateQR, 150);
    return () => clearTimeout(t);
  }, [generateQR]);

  // Download
  const handleDownload = () => {
    if (getUsageCount() >= DAILY_FREE_LIMIT) {
      setShowUpgrade(true);
      return;
    }
    if (!qrDataUrl) return;

    // Draw to canvas with branding
    const canvas = document.createElement('canvas');
    const brandingHeight = 28;
    canvas.width = size;
    canvas.height = size + brandingHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, size, size);
      ctx.fillStyle = '#999999';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Made with SheruTools', size / 2, size + 18);

      const link = document.createElement('a');
      link.download = 'qrcode-sherutools.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      incrementUsage();
    };
    img.src = qrDataUrl;
  };

  // Reset fields on type change
  useEffect(() => {
    const defaults: Record<QRType, Record<string, string>> = {
      url: { url: 'https://' },
      text: { text: '' },
      email: { email: '', subject: '', body: '' },
      phone: { phone: '' },
      wifi: { ssid: '', password: '', encryption: 'WPA' },
      vcard: { firstName: '', lastName: '', vcardPhone: '', vcardEmail: '', org: '', vcardUrl: '' },
    };
    setFields(defaults[type]);
  }, [type]);

  const remainingUses = Math.max(0, DAILY_FREE_LIMIT - getUsageCount());

  return (
    <div className="dot-pattern min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <a href="/" className="hover:text-blue-500 transition-colors">SheruTools</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">QR Code Generator</span>
        </nav>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Free <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">QR Code Generator</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Generate QR codes for URLs, WiFi, vCards, email and more. Customize colors and download instantly.
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl"
          >
            {/* Tabs */}
            <div className="relative mb-6">
              <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 overflow-x-auto relative">
                <motion.div
                  className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-white/10 shadow-sm"
                  animate={{ left: tabIndicator.left, width: tabIndicator.width }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
                {tabs.map((tab, i) => (
                  <button
                    key={tab.id}
                    ref={el => { tabRefs.current[i] = el; }}
                    onClick={() => setType(tab.id)}
                    className={`relative z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      type === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div key={type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  {type === 'url' && (
                    <InputField label="URL" placeholder="https://example.com" value={fields.url || ''} onChange={v => updateField('url', v)} />
                  )}
                  {type === 'text' && (
                    <TextareaField label="Text" placeholder="Enter your text..." value={fields.text || ''} onChange={v => updateField('text', v)} />
                  )}
                  {type === 'email' && (<>
                    <InputField label="Email" placeholder="name@example.com" value={fields.email || ''} onChange={v => updateField('email', v)} />
                    <InputField label="Subject" placeholder="Subject line" value={fields.subject || ''} onChange={v => updateField('subject', v)} />
                    <TextareaField label="Body" placeholder="Email body..." value={fields.body || ''} onChange={v => updateField('body', v)} />
                  </>)}
                  {type === 'phone' && (
                    <InputField label="Phone Number" placeholder="+1234567890" value={fields.phone || ''} onChange={v => updateField('phone', v)} />
                  )}
                  {type === 'wifi' && (<>
                    <InputField label="Network Name (SSID)" placeholder="MyWiFi" value={fields.ssid || ''} onChange={v => updateField('ssid', v)} />
                    <InputField label="Password" placeholder="••••••••" value={fields.password || ''} onChange={v => updateField('password', v)} type="password" />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Encryption</label>
                      <select
                        value={fields.encryption || 'WPA'}
                        onChange={e => updateField('encryption', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None</option>
                      </select>
                    </div>
                  </>)}
                  {type === 'vcard' && (<>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="First Name" placeholder="John" value={fields.firstName || ''} onChange={v => updateField('firstName', v)} />
                      <InputField label="Last Name" placeholder="Doe" value={fields.lastName || ''} onChange={v => updateField('lastName', v)} />
                    </div>
                    <InputField label="Phone" placeholder="+1234567890" value={fields.vcardPhone || ''} onChange={v => updateField('vcardPhone', v)} />
                    <InputField label="Email" placeholder="john@example.com" value={fields.vcardEmail || ''} onChange={v => updateField('vcardEmail', v)} />
                    <InputField label="Organization" placeholder="Company" value={fields.org || ''} onChange={v => updateField('org', v)} />
                    <InputField label="Website" placeholder="https://..." value={fields.vcardUrl || ''} onChange={v => updateField('vcardUrl', v)} />
                  </>)}
                </motion.div>
              </AnimatePresence>

              {/* Color & Size */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-4">
                <ColorPicker label="Foreground Color" value={fgColor} onChange={setFgColor} />

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Size: {size}px
                  </label>
                  <input
                    type="range" min={128} max={512} step={16} value={size}
                    onChange={e => setSize(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>128px</span><span>512px</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center"
          >
            {/* QR Preview Card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative p-8 rounded-3xl bg-white/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-2xl shadow-blue-500/5 dark:shadow-blue-500/10"
            >
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <AnimatePresence mode="wait">
                {qrDataUrl ? (
                  <motion.div
                    key={qrDataUrl.slice(-20)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                  >
                    <img
                      src={qrDataUrl}
                      alt="QR Code Preview"
                      className="w-64 h-64 rounded-xl"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="w-64 h-64 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center"
                  >
                    <p className="text-sm text-slate-400">Enter data to generate QR code</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <canvas ref={canvasRef} className="hidden" />
            </motion.div>

            {/* Download + Info */}
            <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-xs">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" /> Download PNG
              </motion.button>

              <p className="text-xs text-slate-400 text-center">
                {remainingUses} free downloads remaining today
              </p>

              {/* Pro CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowUpgrade(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium rounded-xl hover:bg-emerald-500/5 transition-all text-sm"
              >
                <Crown className="w-4 h-4" /> Unlock Pro Features
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Email Capture */}
      <EmailCapture variant="compact" />

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}

// ─── Reusable Fields ──────────────────────────────────────────────
function InputField({ label, placeholder, value, onChange, type = 'text' }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
      />
    </div>
  );
}

function TextareaField({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
      />
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"What types of QR codes can I generate?","answer":"Generate QR codes for URLs, text, WiFi credentials, vCards, email, phone numbers, and more."},{"question":"Can I customize QR code colors and style?","answer":"Yes! Change foreground/background colors, add logos, adjust error correction level, and customize the style."},{"question":"Can I download QR codes as images?","answer":"Yes, download QR codes as PNG or SVG files in high resolution, ready for print or digital use."},{"question":"Is this QR code generator free?","answer":"Yes, completely free with all features. No sign-up or watermarks."}]} />
      <RelatedTools tools={[{"name":"Password Generator","href":"/password-generator","description":"Generate secure passwords","icon":"🔐"},{"name":"Base64","href":"/base64","description":"Encode and decode Base64","icon":"🔤"},{"name":"Emoji Picker","href":"/emoji-picker","description":"Browse and copy emojis","icon":"😀"},{"name":"Unit Converter","href":"/unit-converter","description":"Convert between units","icon":"📐"}]} />
      </div>
    </div>
  );
}
