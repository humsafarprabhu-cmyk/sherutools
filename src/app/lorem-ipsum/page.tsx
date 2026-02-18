'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { motion, AnimatePresence } from 'framer-motion';
import { Type, Copy, Check, Download, ChevronRight, Shield, Sparkles, Coffee, Briefcase, Cpu, List, AlignLeft, Hash, LetterText, Lock, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback, useRef, useEffect } from 'react';

// ── Corpus Data ──

const CLASSIC = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Curabitur pretium tincidunt lacus nec gravida.',
  'Nulla facilisi etiam dignissim diam quis enim lobortis scelerisque.',
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
  'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.',
  'Praesent commodo cursus magna vel scelerisque nisl consectetur et.',
  'Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.',
  'Morbi leo risus porta ac consectetur ac vestibulum at eros.',
  'Aenean lacinia bibendum nulla sed consectetur.',
  'Cras mattis consectetur purus sit amet fermentum.',
  'Donec sed odio dui nullam id dolor id nibh ultricies vehicula ut id elit.',
  'Maecenas faucibus mollis interdum etiam porta sem malesuada magna mollis euismod.',
  'Fusce dapibus tellus ac cursus commodo tortor mauris condimentum nibh.',
  'Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
  'Nullam quis risus eget urna mollis ornare vel eu leo.',
  'Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus.',
  'Donec ullamcorper nulla non metus auctor fringilla.',
  'Nulla vitae elit libero a pharetra augue.',
  'Etiam porta sem malesuada magna mollis euismod.',
  'Cras justo odio dapibus ut facilisis in egestas eget quam.',
  'Vestibulum id ligula porta felis euismod semper.',
  'Aenean eu leo quam pellentesque ornare sem lacinia quam venenatis vestibulum.',
  'Sed posuere consectetur est at lobortis.',
  'Maecenas sed diam eget risus varius blandit sit amet non magna.',
  'Donec id elit non mi porta gravida at eget metus.',
  'Duis mollis est non commodo luctus nisi erat porttitor ligula.',
  'Eget lacinia odio sem nec elit nullam id dolor id nibh ultricies vehicula.',
  'Suspendisse potenti nullam ac tortor vitae purus faucibus ornare.',
  'Aliquam erat volutpat nam libero tempore cum soluta nobis.',
  'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.',
  'Itaque earum rerum hic tenetur a sapiente delectus ut aut reiciendis.',
  'Voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.',
  'Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet.',
  'Typi non habent claritatem insitam est usus legentis in iis qui facit eorum claritatem.',
  'Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius.',
  'Claritas est etiam processus dynamicus qui sequitur mutationem consuetudium lectorum.',
  'Mirum est notare quam littera gothica quam nunc putamus parum claram.',
  'Anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima.',
  'Eodem modo typi qui nunc nobis videntur parum clari fiant sollemnes in futurum.',
  'Accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue.',
  'Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat.',
  'Vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan.',
  'Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming.',
  'Mazim placerat facer possim assum typi non habent claritatem insitam.',
  'Eros et accumsan et iusto odio dignissim qui blandit praesent.',
  'Luptatum zzril delenit augue duis dolore te feugait nulla facilisi.',
];

const HIPSTER = [
  'Artisan craft beer pour-over aesthetic vinyl typewriter slow-carb chambray.',
  'Fixie irony vexillologist pork belly sustainable palo santo chia kombucha.',
  'Cold-pressed thundercats mumblecore shabby chic pug selfies yr glossier.',
  'Dreamcatcher hexagon tacos shoreditch cronut ennui post-ironic kinfolk.',
  'Bushwick gentrify raw denim tousled keytar lomo health goth pitchfork.',
  'Edison bulb chartreuse roof party gastropub organic biodiesel twee.',
  'Microdosing semiotics taiyaki brunch kale chips echo park disrupt.',
  'Tofu plaid wolf heirloom intelligentsia bicycle rights crucifix tumeric.',
  'Brooklyn waistcoat scenester hashtag squid normcore jean shorts air plant.',
  'Meditation cliche try-hard cornhole paleo literally praxis hammock.',
  'Flexitarian copper mug live-edge viral tonx unicorn la croix raclette.',
  'Bitters trust fund celiac four dollar toast banjo lyft hella venmo.',
  'Seitan hot chicken mlkshk succulents snackwave austin same freegan.',
  'Marfa tote bag vaporware meggings put a bird on it cardigan leggings.',
  'Coloring book food truck next level stumptown etsy PBR&B cred bodega boys.',
  'Viral fingerstache praxis kinfolk trust fund adaptogen scenester lo-fi.',
  'Pinterest sustainable poutine tilde quinoa everyday carry gochujang.',
  'Skateboard copper mug YOLO narwhal ethical messenger bag flannel.',
  'Retro DSA photo booth street art pickled green juice mustache.',
  'Asymmetrical enamel pin hoodie taxidermy vinyl meditation swag.',
  'Sartorial cray beard activated charcoal knausgaard godard neutra.',
  'Locavore deep v hell of yuccie farm-to-table normcore pour-over.',
  'Butcher jianbing truffaut tattooed man bun direct trade mukbang.',
  'Helvetica selvage bruh shabby chic single-origin coffee letterpress.',
  'Woke occupy pop-up chicharrones cupping pabst chambray kickstarter.',
  'Solarpunk chillwave gorpcore banh mi drinking vinegar gentrify.',
  'Vegan pork belly listicle marxism ugh biodiesel actually crucifix.',
  'Cloud bread tumblr affogato kitsch fanny pack slow-carb pitchfork.',
  'Hashtag umami blue bottle raclette synth echo park small batch.',
  'Keffiyeh fashion axe wayfarers man braid schlitz craft beer XOXO.',
];

const OFFICE = [
  'Let us circle back on that deliverable and align our key stakeholders.',
  'We need to leverage our core competencies to drive synergies across the board.',
  'Moving forward we should take this offline and loop in the right people.',
  'This initiative will help us move the needle on our quarterly OKRs.',
  'Let us put a pin in that and revisit during our next stand-up.',
  'We are looking for a paradigm shift that creates a win-win scenario.',
  'The bandwidth required to execute this pivot is significant but achievable.',
  'Our north star metric indicates strong product-market fit this quarter.',
  'Please cascade this information down to your respective business units.',
  'We need to right-size our operations and optimize our burn rate.',
  'This low-hanging fruit will drive incremental revenue growth immediately.',
  'Let us boil the ocean on this one and think outside the box.',
  'The ROI on this initiative should be reflected in our bottom line.',
  'We need cross-functional alignment to ensure seamless execution.',
  'This deep dive will help us identify actionable insights and next steps.',
  'Our value proposition needs to resonate with key decision makers.',
  'Let us socialize this idea before bringing it to the leadership team.',
  'The tiger team will spearhead this transformation workstream.',
  'We should sunset legacy systems and migrate to cloud-native solutions.',
  'This requires a holistic approach to change management and adoption.',
  'Our competitive moat depends on innovation velocity and talent density.',
  'Let us streamline workflows and eliminate bottlenecks in the pipeline.',
  'The Q3 retrospective highlighted opportunities for continuous improvement.',
  'We are doubling down on customer-centricity as a strategic differentiator.',
  'This proof of concept validates our hypothesis and de-risks the investment.',
  'Stakeholder buy-in is critical for scaling this across the enterprise.',
  'Our agile methodology enables rapid iteration and faster time-to-market.',
  'The data-driven approach ensures we are making informed decisions.',
  'We need to future-proof our infrastructure for sustained growth.',
  'This synergy between teams will unlock exponential value creation.',
];

const TECH = [
  'The microservice architecture enables horizontal scaling across distributed clusters.',
  'We need to refactor the legacy monolith into event-driven serverless functions.',
  'The CI/CD pipeline automates deployment through containerized Docker environments.',
  'Kubernetes orchestration handles pod scheduling and automatic failover recovery.',
  'GraphQL resolvers efficiently batch database queries to prevent N+1 problems.',
  'The WebSocket connection maintains real-time bidirectional data synchronization.',
  'TypeScript generics enforce compile-time type safety across the entire codebase.',
  'Redis caching layer reduces database latency from 200ms to sub-millisecond responses.',
  'The event sourcing pattern captures every state mutation as an immutable log entry.',
  'Terraform infrastructure-as-code provisions cloud resources declaratively and reproducibly.',
  'React server components enable zero-bundle-size rendering with streaming HTML.',
  'The neural network model achieves 99.2% accuracy after fine-tuning on domain data.',
  'Edge computing pushes processing closer to users reducing round-trip latency significantly.',
  'The B-tree index optimization reduced query execution time by three orders of magnitude.',
  'Observability stack with OpenTelemetry provides distributed tracing across all services.',
  'The garbage collector pause times were eliminated using concurrent mark-sweep algorithms.',
  'WebAssembly modules run at near-native speed directly in the browser sandbox.',
  'The consensus algorithm ensures Byzantine fault tolerance across five replica nodes.',
  'Zero-knowledge proofs enable private transactions without revealing underlying data.',
  'The load balancer distributes traffic using consistent hashing with virtual nodes.',
  'Incremental static regeneration combines build-time performance with dynamic content freshness.',
  'The CAP theorem forces us to choose between consistency and availability during partitions.',
  'CRDT data structures enable conflict-free replication in offline-first applications.',
  'The JIT compiler dynamically optimizes hot paths based on runtime profiling data.',
  'Bloom filters provide probabilistic set membership queries with zero false negatives.',
  'The rate limiter uses a sliding window algorithm with token bucket overflow protection.',
  'Differential privacy adds calibrated noise to query results preserving individual anonymity.',
  'The reverse proxy terminates TLS and forwards decrypted traffic to upstream backends.',
  'Feature flags enable progressive rollouts and instant kill switches for risky deployments.',
  'The dependency injection container manages object lifecycles and resolves circular references.',
];

const CORPORA: Record<string, string[]> = { classic: CLASSIC, hipster: HIPSTER, office: OFFICE, tech: TECH };

// ── Helpers ──

function secureRandom(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function pickRandom<T>(arr: T[]): T {
  return arr[secureRandom(arr.length)];
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type GenType = 'paragraphs' | 'sentences' | 'words' | 'lists';
type Variant = 'classic' | 'hipster' | 'office' | 'tech';
type ListStyle = 'bullet' | 'numbered';

function generateText(opts: {
  type: GenType;
  amount: number;
  variant: Variant;
  startClassic: boolean;
  htmlOutput: boolean;
  listStyle: ListStyle;
}): string {
  const { type, amount, variant, startClassic, htmlOutput, listStyle } = opts;
  const corpus = CORPORA[variant];

  const getSentences = (count: number): string[] => {
    const sentences: string[] = [];
    if (startClassic && variant === 'classic') {
      sentences.push(CLASSIC[0]);
    }
    while (sentences.length < count) {
      const shuffledCorpus = shuffled(corpus);
      for (const s of shuffledCorpus) {
        if (sentences.length >= count) break;
        if (sentences.length === 0 && startClassic && variant === 'classic' && s === CLASSIC[0]) continue;
        sentences.push(s);
      }
    }
    return sentences;
  };

  const getWords = (count: number): string => {
    const allWords: string[] = [];
    if (startClassic && variant === 'classic') {
      allWords.push(...'Lorem ipsum dolor sit amet'.split(' '));
    }
    let safety = 0;
    while (allWords.length < count && safety < 100) {
      const s = pickRandom(corpus);
      allWords.push(...s.replace(/[.,;:!?]/g, '').split(/\s+/));
      safety++;
    }
    return allWords.slice(0, count).join(' ') + '.';
  };

  switch (type) {
    case 'paragraphs': {
      const paragraphs: string[] = [];
      for (let i = 0; i < amount; i++) {
        const sentCount = 4 + secureRandom(4); // 4-7 sentences per paragraph
        const sents = getSentences(sentCount);
        if (i > 0 || !startClassic) {
          // shuffle for variety after first
        }
        paragraphs.push(sents.join(' '));
      }
      if (startClassic && variant === 'classic' && paragraphs.length > 0) {
        if (!paragraphs[0].startsWith('Lorem ipsum')) {
          paragraphs[0] = CLASSIC[0] + ' ' + paragraphs[0];
        }
      }
      return htmlOutput
        ? paragraphs.map(p => `<p>${p}</p>`).join('\n\n')
        : paragraphs.join('\n\n');
    }
    case 'sentences': {
      const sents = getSentences(amount);
      return htmlOutput
        ? `<p>${sents.join(' ')}</p>`
        : sents.join(' ');
    }
    case 'words': {
      const text = getWords(amount);
      return htmlOutput ? `<p>${text}</p>` : text;
    }
    case 'lists': {
      const items = getSentences(amount);
      if (htmlOutput) {
        const tag = listStyle === 'numbered' ? 'ol' : 'ul';
        return `<${tag}>\n${items.map(i => `  <li>${i}</li>`).join('\n')}\n</${tag}>`;
      }
      return items.map((item, i) =>
        listStyle === 'numbered' ? `${i + 1}. ${item}` : `• ${item}`
      ).join('\n');
    }
  }
}

// ── Stats ──
function countStats(text: string) {
  const plain = text.replace(/<[^>]*>/g, '');
  const words = plain.trim().split(/\s+/).filter(Boolean).length;
  const chars = plain.length;
  const paragraphs = plain.split(/\n\s*\n/).filter(s => s.trim()).length || 1;
  return { words, chars, paragraphs };
}

// ── Component ──

const typeOptions: { value: GenType; label: string; icon: typeof AlignLeft; max: number }[] = [
  { value: 'paragraphs', label: 'Paragraphs', icon: AlignLeft, max: 50 },
  { value: 'sentences', label: 'Sentences', icon: LetterText, max: 200 },
  { value: 'words', label: 'Words', icon: Hash, max: 5000 },
  { value: 'lists', label: 'Lists', icon: List, max: 50 },
];

const variantOptions: { value: Variant; label: string; icon: typeof Type; color: string }[] = [
  { value: 'classic', label: 'Classic', icon: Type, color: 'text-violet-400' },
  { value: 'hipster', label: 'Hipster', icon: Coffee, color: 'text-amber-400' },
  { value: 'office', label: 'Office', icon: Briefcase, color: 'text-blue-400' },
  { value: 'tech', label: 'Tech', icon: Cpu, color: 'text-emerald-400' },
];

interface HistoryEntry {
  text: string;
  type: GenType;
  variant: Variant;
  amount: number;
  timestamp: number;
}

export default function LoremIpsumPage() {
  const [genType, setGenType] = useState<GenType>('paragraphs');
  const [amount, setAmount] = useState(3);
  const [variant, setVariant] = useState<Variant>('classic');
  const [startClassic, setStartClassic] = useState(true);
  const [htmlOutput, setHtmlOutput] = useState(false);
  const [listStyle, setListStyle] = useState<ListStyle>('bullet');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const currentMax = typeOptions.find(t => t.value === genType)!.max;

  useEffect(() => {
    if (amount > currentMax) setAmount(currentMax);
  }, [genType, amount, currentMax]);

  const handleGenerate = useCallback(() => {
    const text = generateText({ type: genType, amount, variant, startClassic, htmlOutput, listStyle });
    setOutput(text);
    setHistory(prev => [{ text, type: genType, variant, amount, timestamp: Date.now() }, ...prev].slice(0, 5));
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }, [genType, amount, variant, startClassic, htmlOutput, listStyle]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lorem-ipsum-${variant}-${genType}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, variant, genType]);

  const stats = output ? countStats(output) : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-blue-500 transition-colors">SheruTools</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 dark:text-white">Lorem Ipsum Generator</span>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 mb-4">
            <Type className="w-8 h-8 text-violet-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Lorem Ipsum <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Generator</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Generate placeholder text instantly. Classic, hipster, office, and tech variants.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl p-6 mb-6 space-y-6"
        >
          {/* Type Selector */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Output Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {typeOptions.map(t => (
                <button
                  key={t.value}
                  onClick={() => { setGenType(t.value); if (t.value !== 'lists') setAmount(Math.min(amount, t.max)); }}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    genType === t.value
                      ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Amount</span>
              <span className="text-violet-500 font-bold text-base">{amount}</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={currentMax}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-violet-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-violet-500/30"
              />
              <input
                type="number"
                min={1}
                max={currentMax}
                value={amount}
                onChange={e => setAmount(Math.max(1, Math.min(currentMax, Number(e.target.value) || 1)))}
                className="w-20 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Variant */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Text Variant</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {variantOptions.map(v => (
                <button
                  key={v.value}
                  onClick={() => setVariant(v.value)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    variant === v.value
                      ? 'bg-white dark:bg-white/10 border-2 border-violet-500 text-violet-600 dark:text-violet-400 shadow-sm'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 border-2 border-transparent'
                  }`}
                >
                  <v.icon className={`w-4 h-4 ${variant === v.value ? v.color : ''}`} />
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Style (only for lists) */}
          <AnimatePresence>
            {genType === 'lists' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">List Style</label>
                <div className="flex gap-2">
                  {(['bullet', 'numbered'] as const).map(ls => (
                    <button
                      key={ls}
                      onClick={() => setListStyle(ls)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        listStyle === ls
                          ? 'bg-violet-500 text-white'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {ls === 'bullet' ? '• Bulleted' : '1. Numbered'}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={startClassic}
                  onChange={e => setStartClassic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-white/10 rounded-full peer-checked:bg-violet-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">Start with &ldquo;Lorem ipsum...&rdquo;</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={htmlOutput}
                  onChange={e => setHtmlOutput(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-white/10 rounded-full peer-checked:bg-violet-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">HTML Output</span>
            </label>
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate Text
          </motion.button>
        </motion.div>

        {/* Output */}
        <AnimatePresence>
          {output && (
            <motion.div
              ref={outputRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl mb-6"
            >
              {/* Floating copy button */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 text-sm font-medium transition-all"
                >
                  <Download className="w-4 h-4" />
                  .txt
                </motion.button>
              </div>

              <div className="p-6 pt-14 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                  {output}
                </pre>
              </div>

              {/* Stats bar */}
              {stats && (
                <div className="border-t border-slate-200 dark:border-white/10 px-6 py-3 flex flex-wrap gap-6 text-xs text-slate-500 dark:text-slate-400">
                  <span><strong className="text-slate-700 dark:text-slate-200">{stats.words.toLocaleString()}</strong> words</span>
                  <span><strong className="text-slate-700 dark:text-slate-200">{stats.chars.toLocaleString()}</strong> characters</span>
                  <span><strong className="text-slate-700 dark:text-slate-200">{stats.paragraphs}</strong> paragraph{stats.paragraphs !== 1 ? 's' : ''}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-violet-500 transition-colors mb-3"
            >
              <Clock className="w-4 h-4" />
              History ({history.length})
              <ChevronRight className={`w-3 h-3 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {history.map((entry, i) => (
                    <button
                      key={entry.timestamp}
                      onClick={() => setOutput(entry.text)}
                      className="w-full text-left p-3 rounded-xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-violet-500/50 transition-all"
                    >
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span className="capitalize">{entry.variant}</span>
                        <span>•</span>
                        <span>{entry.amount} {entry.type}</span>
                        <span>•</span>
                        <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{entry.text.replace(/<[^>]*>/g, '').slice(0, 100)}...</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pro Upsell */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent border border-violet-500/20 p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Unlock Pro Features</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Custom word lists — paste your own words to generate unique placeholder text. Plus simulated API access for developers.
              </p>
              <a
                href="https://sherutools.lemonsqueezy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
              >
                Get Pro — $1.99
              </a>
            </div>
          </div>
        </motion.div>

        {/* Privacy Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500"
        >
          <Shield className="w-3.5 h-3.5" />
          100% client-side. No data leaves your browser.
        </motion.div>
      </div>
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"What is Lorem Ipsum?","answer":"Lorem Ipsum is placeholder text used in design and development to fill layouts before final content is ready."},{"question":"Can I generate different amounts of text?","answer":"Yes! Generate paragraphs, sentences, or words in any quantity you need."},{"question":"Is this Lorem Ipsum generator free?","answer":"Yes, completely free with no limits or sign-up required."},{"question":"Can I copy the generated text?","answer":"Yes, copy generated Lorem Ipsum text to your clipboard with one click."}]} />
      <RelatedTools tools={[{"name":"Word Counter","href":"/word-counter","description":"Count words, characters, and reading time","icon":"📊"},{"name":"Markdown Editor","href":"/markdown-editor","description":"Write and preview Markdown","icon":"📝"},{"name":"AI Email Writer","href":"/ai-email-writer","description":"Generate professional emails with AI","icon":"📧"},{"name":"Text Compare","href":"/text-compare","description":"Compare two texts side by side","icon":"🔄"}]} />
      </div>
    </div>
  );
}
