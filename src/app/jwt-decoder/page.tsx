'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Copy, Check, AlertTriangle, Clock, Shield, ChevronRight } from 'lucide-react';
import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

const faqs = [
  { question: 'What is a JWT?', answer: 'A JSON Web Token (JWT) is a compact, URL-safe token format used for securely transmitting information between parties. It consists of three parts: Header, Payload, and Signature.' },
  { question: 'Is it safe to paste my JWT here?', answer: 'Yes! All decoding happens locally in your browser. Your token never leaves your device or gets sent to any server.' },
  { question: 'Can this tool verify JWT signatures?', answer: 'This tool decodes and displays JWT contents. Signature verification requires the secret key or public key, which should never be shared in a web tool.' },
  { question: 'What does an expired JWT mean?', answer: 'If the "exp" (expiration) claim is in the past, the token has expired and should no longer be accepted by servers.' },
  { question: 'What are common JWT claims?', answer: 'Common claims include: iss (issuer), sub (subject), aud (audience), exp (expiration), nbf (not before), iat (issued at), and jti (JWT ID).' },
];

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  expiresAt: Date | null;
  issuedAt: Date | null;
}

function decodeJWT(token: string): DecodedJWT | null {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const signature = parts[2];

    const exp = payload.exp ? new Date(payload.exp * 1000) : null;
    const iat = payload.iat ? new Date(payload.iat * 1000) : null;
    const isExpired = exp ? exp < new Date() : false;

    return { header, payload, signature, isExpired, expiresAt: exp, issuedAt: iat };
  } catch {
    return null;
  }
}

function JsonView({ data, label }: { data: Record<string, unknown>; label: string }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-sm font-semibold text-amber-400">{label}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm text-slate-300 font-mono overflow-x-auto leading-relaxed">{json}</pre>
    </div>
  );
}

export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token.trim()) {
      setDecoded(null);
      setError('');
      return;
    }
    const result = decodeJWT(token);
    if (result) {
      setDecoded(result);
      setError('');
    } else {
      setDecoded(null);
      setError('Invalid JWT format. A JWT should have 3 parts separated by dots.');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950">
      {/* Hero */}
      <section className="relative pt-20 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.15),transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-6">
            <Shield className="w-4 h-4" /> 100% Client-Side Decoding
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent mb-4">
            JWT Decoder
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-slate-400 max-w-2xl mx-auto">
            Decode and inspect JSON Web Tokens instantly. View header, payload, and expiration status — all in your browser.
          </motion.p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Input */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-1">
              <div className="px-4 py-3 border-b border-white/5">
                <span className="text-sm font-medium text-slate-300">Paste your JWT</span>
              </div>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
                className="w-full h-32 bg-transparent text-amber-300 text-sm p-4 resize-none focus:outline-none placeholder:text-slate-600 font-mono break-all"
              />
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}

          {/* Decoded Output */}
          {decoded && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Status Bar */}
              <div className="flex flex-wrap gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                  decoded.isExpired
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : decoded.expiresAt
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-slate-500/10 border border-slate-500/20 text-slate-400'
                }`}>
                  <Clock className="w-4 h-4" />
                  {decoded.isExpired
                    ? `Expired ${decoded.expiresAt?.toLocaleString()}`
                    : decoded.expiresAt
                    ? `Expires ${decoded.expiresAt?.toLocaleString()}`
                    : 'No expiration set'}
                </div>
                {decoded.issuedAt && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <ChevronRight className="w-4 h-4" />
                    Issued {decoded.issuedAt.toLocaleString()}
                  </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Key className="w-4 h-4" />
                  {(decoded.header.alg as string) || 'Unknown'} Algorithm
                </div>
              </div>

              {/* Header & Payload */}
              <JsonView data={decoded.header} label="HEADER" />
              <JsonView data={decoded.payload} label="PAYLOAD" />

              {/* Signature */}
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <span className="text-sm font-semibold text-rose-400 block mb-2">SIGNATURE</span>
                <code className="text-xs text-slate-400 font-mono break-all">{decoded.signature}</code>
                <p className="text-xs text-slate-500 mt-2">⚠️ Signature verification requires the secret/public key</p>
              </div>

              {/* Common Claims */}
              {Object.keys(decoded.payload).length > 0 && (
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5">
                    <span className="text-sm font-semibold text-cyan-400">Claims Breakdown</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {Object.entries(decoded.payload).map(([key, value]) => {
                      const claimNames: Record<string, string> = {
                        iss: 'Issuer', sub: 'Subject', aud: 'Audience', exp: 'Expiration',
                        nbf: 'Not Before', iat: 'Issued At', jti: 'JWT ID',
                      };
                      const isTimestamp = ['exp', 'nbf', 'iat'].includes(key) && typeof value === 'number';
                      return (
                        <div key={key} className="flex items-start justify-between px-4 py-3">
                          <div>
                            <span className="text-sm font-mono text-amber-400">{key}</span>
                            {claimNames[key] && <span className="text-xs text-slate-500 ml-2">({claimNames[key]})</span>}
                          </div>
                          <span className="text-sm text-slate-300 font-mono text-right max-w-[60%] break-all">
                            {isTimestamp ? new Date((value as number) * 1000).toLocaleString() : String(value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      <FAQSection faqs={faqs} />
      <RelatedTools tools={[{ name: "AI Email Writer", href: "/ai-email-writer", description: "Generate professional emails instantly", icon: "✉️" }, { name: "JSON Formatter", href: "/json-formatter", description: "Format and validate JSON data", icon: "📋" }, { name: "PDF Tools", href: "/pdf-tools", description: "Merge, split, compress PDFs", icon: "📄" }]} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebApplication',
        name: 'JWT Decoder - SheruTools', url: 'https://sherutools.com/jwt-decoder',
        description: 'Free online JWT decoder. Inspect JSON Web Token header, payload, claims, and expiration status.',
        applicationCategory: 'DeveloperApplication', operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
          { '@type': 'ListItem', position: 2, name: 'JWT Decoder', item: 'https://sherutools.com/jwt-decoder' },
        ],
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      })}} />
    </div>
  );
}
