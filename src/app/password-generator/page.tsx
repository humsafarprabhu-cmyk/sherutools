'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, Copy, Check, RefreshCw, ChevronRight, Crown,
  Eye, EyeOff, Trash2, ChevronDown, ChevronUp, Download,
  Info, Zap, Lock,
} from 'lucide-react';

/* ───── Word List for Passphrases ───── */
const WORDS = [
  'apple','river','stone','cloud','flame','ocean','tiger','maple','dream','storm',
  'pearl','eagle','frost','bloom','steel','crane','amber','cedar','delta','ember',
  'forge','gleam','haven','ivory','jewel','kneel','lunar','marsh','noble','olive',
  'prism','quest','ridge','solar','thorn','ultra','vivid','wheat','xenon','yield',
  'blaze','coral','drift','elbow','flint','grape','heron','inlet','joker','knack',
  'lemon','mango','nexus','oasis','plume','quilt','raven','surge','tulip','unity',
  'vapor','waltz','yacht','zebra','acorn','bench','cider','denim','epoch','fable',
  'ghost','hazel','index','jolly','karma','latch','moose','nerve','orbit','patch',
  'quake','roast','snail','trace','usher','vault','woven','oxide','beach','cabin',
  'dance','frown','globe','haste','igloo','judge','koala','llama','melon','night',
  'opera','piano','queen','robin','sword','tempo','urban','viola','wagon','pixel',
  'alpha','bravo','chess','dodge','elite','fiber','grain','hover','image','joust',
  'kayak','lever','magic','noted','omega','power','quota','rapid','scout','token',
  'union','valve','windy','youth','zonal','badge','crest','depth','extra','focus',
  'guide','hymns','joint','kebab','lodge','mirth','nylon','outer','pride','relay',
  'shift','trend','upper','verse','world','arena','blade','cliff','dusty','event',
  'flash','green','horse','ivory','jumbo','kiosk','light','money','noble','paint',
  'quick','round','sharp','tiger','under','voice','watch','xerox','young','zippy',
  'angel','brave','candy','diver','earth','fairy','giant','happy','inner','jelly',
  'knife','lucky','might','north','onion','pupil','quiet','royal','space','tower',
  'ultra','video','water','zones','angle','block','crisp','drive','entry','field',
  'grasp','heart','issue','jazzy','kite','label','model','newer','oxide','plant',
  'quote','raise','smile','think','usual','value','write','about','bring','catch',
  'doing','every','first','going','house','ideas','jumps','kinds','learn','maybe',
  'never','often','place','ready','stand','their','until','visit','which','yours',
];

/* ───── Crypto Random ───── */
function secureRandom(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ───── Types ───── */
type Mode = 'random' | 'passphrase' | 'pronounceable';

interface Options {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  excludeDuplicates: boolean;
}

interface HistoryEntry {
  value: string;
  timestamp: number;
  strength: string;
}

/* ───── Generators ───── */
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = '0OIl1';

function generateRandom(opts: Options): string {
  let charset = '';
  if (opts.uppercase) charset += UPPER;
  if (opts.lowercase) charset += LOWER;
  if (opts.numbers) charset += DIGITS;
  if (opts.symbols) charset += SYMS;
  if (!charset) charset = LOWER + DIGITS;
  if (opts.excludeAmbiguous) {
    charset = charset.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
  }
  const chars: string[] = [];
  const used = new Set<string>();
  for (let i = 0; i < opts.length; i++) {
    let c: string;
    let attempts = 0;
    do {
      c = charset[secureRandom(charset.length)];
      attempts++;
      if (attempts > 100) break;
    } while (opts.excludeDuplicates && used.has(c));
    chars.push(c);
    used.add(c);
  }
  return chars.join('');
}

function generatePassphrase(wordCount: number, separator: string): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(WORDS[secureRandom(WORDS.length)]);
  }
  return words.join(separator);
}

const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';
const VOWELS = 'aeiou';

function generatePronounceable(length: number): string {
  let result = '';
  let useConsonant = secureRandom(2) === 0;
  while (result.length < length) {
    const pool = useConsonant ? CONSONANTS : VOWELS;
    result += pool[secureRandom(pool.length)];
    useConsonant = !useConsonant;
  }
  return result.slice(0, length);
}

/* ───── Strength ───── */
function getStrength(value: string): { label: string; score: number; color: string } {
  const len = value.length;
  let poolSize = 0;
  if (/[a-z]/.test(value)) poolSize += 26;
  if (/[A-Z]/.test(value)) poolSize += 26;
  if (/[0-9]/.test(value)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(value)) poolSize += 32;
  const entropy = len * Math.log2(poolSize || 1);
  if (entropy < 28) return { label: 'Weak', score: 20, color: '#ef4444' };
  if (entropy < 36) return { label: 'Fair', score: 40, color: '#f97316' };
  if (entropy < 60) return { label: 'Good', score: 60, color: '#eab308' };
  if (entropy < 80) return { label: 'Strong', score: 80, color: '#22c55e' };
  return { label: 'Very Strong', score: 100, color: '#10b981' };
}

function getEntropy(value: string): number {
  let poolSize = 0;
  if (/[a-z]/.test(value)) poolSize += 26;
  if (/[A-Z]/.test(value)) poolSize += 26;
  if (/[0-9]/.test(value)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(value)) poolSize += 32;
  return Math.round(value.length * Math.log2(poolSize || 1));
}

/* ───── Component ───── */
export default function PasswordGeneratorPage() {
  const [mode, setMode] = useState<Mode>('random');
  const [options, setOptions] = useState<Options>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
    excludeDuplicates: false,
  });
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);
  const [showValue, setShowValue] = useState(true);
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);
  const [bulkCopied, setBulkCopied] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');

  const generate = useCallback(() => {
    let value = '';
    switch (mode) {
      case 'random': value = generateRandom(options); break;
      case 'passphrase': value = generatePassphrase(wordCount, separator); break;
      case 'pronounceable': value = generatePronounceable(options.length); break;
    }
    setGenerated(value);
    setCopied(false);
    const strength = getStrength(value);
    setHistory(prev => [{ value, timestamp: Date.now(), strength: strength.label }, ...prev].slice(0, 10));
  }, [mode, options, wordCount, separator]);

  useEffect(() => { generate(); }, []);

  const copyToClipboard = async (text: string, idx?: number) => {
    await navigator.clipboard.writeText(text);
    if (idx !== undefined) {
      setBulkCopied(idx);
      setTimeout(() => setBulkCopied(null), 1500);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const generateBulk = () => {
    const results: string[] = [];
    for (let i = 0; i < bulkCount; i++) {
      switch (mode) {
        case 'random': results.push(generateRandom(options)); break;
        case 'passphrase': results.push(generatePassphrase(wordCount, separator)); break;
        case 'pronounceable': results.push(generatePronounceable(options.length)); break;
      }
    }
    setBulkPasswords(results);
  };

  const strength = generated ? getStrength(generated) : null;
  const entropy = generated ? getEntropy(generated) : 0;

  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-600'}`}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Ambient BG */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">SheruTools</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-emerald-400">Password Generator</span>
        </nav>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
            <Shield className="w-4 h-4" /> Web Crypto API Powered
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Password <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Generator</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">Generate strong, secure passwords with true cryptographic randomness.</p>
        </motion.div>

        {/* Mode Tabs */}
        <div className="flex gap-2 justify-center mb-8">
          {(['random', 'passphrase', 'pronounceable'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setBulkPasswords([]); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                mode === m
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Generated Password Display */}
        <motion.div
          className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-6"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 min-w-0 relative">
              <div
                className={`font-mono text-xl md:text-2xl break-all leading-relaxed ${!showValue ? 'blur-md select-none' : ''}`}
                style={{ textShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}
              >
                {generated || 'Click generate'}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setShowValue(!showValue)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" title={showValue ? 'Hide' : 'Show'}>
                {showValue ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              <button onClick={() => copyToClipboard(generated)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" title="Copy">
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="w-5 h-5 text-emerald-400" />
                    </motion.div>
                  ) : (
                    <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Copy className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Strength Meter */}
          {strength && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Strength: <span style={{ color: strength.color }}>{strength.label}</span></span>
                <span className="text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" /> {entropy} bits entropy
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: strength.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${strength.score}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <motion.button
            onClick={generate}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
          >
            <RefreshCw className="w-5 h-5" /> Generate
          </motion.button>
        </motion.div>

        {/* Options */}
        <motion.div
          className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-4">Options</h3>

          {mode === 'random' && (
            <>
              {/* Length Slider */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Length</span>
                  <span className="text-sm font-mono text-emerald-400">{options.length}</span>
                </div>
                <input
                  type="range"
                  min={4} max={128}
                  value={options.length}
                  onChange={e => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>4</span><span>128</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ToggleSwitch checked={options.uppercase} onChange={v => setOptions(p => ({ ...p, uppercase: v }))} label="Uppercase (A-Z)" />
                <ToggleSwitch checked={options.lowercase} onChange={v => setOptions(p => ({ ...p, lowercase: v }))} label="Lowercase (a-z)" />
                <ToggleSwitch checked={options.numbers} onChange={v => setOptions(p => ({ ...p, numbers: v }))} label="Numbers (0-9)" />
                <ToggleSwitch checked={options.symbols} onChange={v => setOptions(p => ({ ...p, symbols: v }))} label="Symbols (!@#$%)" />
                <ToggleSwitch checked={options.excludeAmbiguous} onChange={v => setOptions(p => ({ ...p, excludeAmbiguous: v }))} label="Exclude Ambiguous (0OIl1)" />
                <ToggleSwitch checked={options.excludeDuplicates} onChange={v => setOptions(p => ({ ...p, excludeDuplicates: v }))} label="No Duplicates" />
              </div>
            </>
          )}

          {mode === 'passphrase' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Words</span>
                  <span className="text-sm font-mono text-emerald-400">{wordCount}</span>
                </div>
                <input
                  type="range" min={3} max={8} value={wordCount}
                  onChange={e => setWordCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div>
                <span className="text-sm text-gray-400 block mb-2">Separator</span>
                <div className="flex gap-2">
                  {['-', '.', '_', ' '].map(s => (
                    <button
                      key={s}
                      onClick={() => setSeparator(s)}
                      className={`px-4 py-2 rounded-lg font-mono text-lg transition-all ${
                        separator === s ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {s === ' ' ? '␣' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === 'pronounceable' && (
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Length</span>
                <span className="text-sm font-mono text-emerald-400">{options.length}</span>
              </div>
              <input
                type="range" min={4} max={32} value={options.length}
                onChange={e => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          )}
        </motion.div>

        {/* Bulk Generate */}
        <motion.div
          className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" /> Bulk Generate
          </h3>
          <div className="flex gap-3 mb-4 flex-wrap">
            {[5, 10, 20].map(n => (
              <button
                key={n}
                onClick={() => setBulkCount(n)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  bulkCount === n ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {n} passwords
              </button>
            ))}
          </div>
          <button
            onClick={generateBulk}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Generate {bulkCount}
          </button>

          {bulkPasswords.length > 0 && (
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
              {bulkPasswords.map((pw, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 group">
                  <span className="text-xs text-gray-500 w-6">{i + 1}.</span>
                  <span className="flex-1 font-mono text-sm break-all">{pw}</span>
                  <button onClick={() => copyToClipboard(pw, i)} className="p-1.5 rounded hover:bg-white/10 transition-colors shrink-0">
                    {bulkCopied === i ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* History */}
        <motion.div
          className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              History <span className="text-sm text-gray-500 font-normal">({history.length})</span>
            </h3>
            {showHistory ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {history.length === 0 ? (
                  <p className="text-gray-500 text-sm mt-4">No history yet. Generate some passwords!</p>
                ) : (
                  <div className="mt-4 space-y-2">
                    {history.map((entry, i) => (
                      <div key={entry.timestamp + i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <span className="flex-1 font-mono text-sm break-all">{entry.value}</span>
                        <span className="text-xs text-gray-500 shrink-0">{entry.strength}</span>
                        <button onClick={() => copyToClipboard(entry.value)} className="p-1.5 rounded hover:bg-white/10 transition-colors shrink-0">
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => setHistory([])} className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 mt-2">
                      <Trash2 className="w-3 h-3" /> Clear history
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pro Upsell */}
        <motion.div
          className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 mb-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <Crown className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Password Generator Pro</h3>
              <p className="text-gray-400 text-sm mb-3">Generate up to 100 at once, export as CSV/TXT, and check against known breaches.</p>
              <a
                href="#pro"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 transition-colors"
              >
                <Lock className="w-4 h-4" /> Get Pro — $2.99
              </a>
            </div>
          </div>
        </motion.div>

        {/* Privacy Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400">
            <Shield className="w-4 h-4 text-emerald-400" /> Generated locally. Never sent to any server.
          </div>
        </div>
      </div>
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"How secure are the generated passwords?","answer":"Passwords are generated using cryptographically secure random number generation in your browser. They never leave your device."},{"question":"Can I customize password requirements?","answer":"Yes! Set length, include/exclude uppercase, lowercase, numbers, and special characters."},{"question":"Is this password generator free?","answer":"Yes, completely free with no limits. Generate as many passwords as you need."},{"question":"Are my passwords stored anywhere?","answer":"No! Passwords are generated locally in your browser and never sent to any server."}]} />
      <RelatedTools tools={[{"name":"QR Code Generator","href":"/qr-code-generator","description":"Generate QR codes for any data","icon":"📱"},{"name":"Base64","href":"/base64","description":"Encode and decode Base64 strings","icon":"🔤"},{"name":"JSON Formatter","href":"/json-formatter","description":"Format and validate JSON","icon":"📋"},{"name":"Regex Tester","href":"/regex-tester","description":"Test regular expressions","icon":"🔍"}]} />
      </div>
    </div>
  );
}
