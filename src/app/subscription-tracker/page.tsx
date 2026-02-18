'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, DollarSign, TrendingUp, AlertTriangle, Calendar, 
  BarChart3, PieChart, Bell, Download, Upload, X, Edit3, Check,
  CreditCard, Wallet, ArrowUpRight, ArrowDownRight, Search, Filter
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  cycle: 'monthly' | 'yearly' | 'weekly';
  category: string;
  nextBilling: string;
  color: string;
  icon: string;
  active: boolean;
  notes: string;
  createdAt: number;
}

const CATEGORIES = [
  { name: 'Streaming', icon: '🎬', color: '#e11d48' },
  { name: 'Music', icon: '🎵', color: '#7c3aed' },
  { name: 'Cloud Storage', icon: '☁️', color: '#2563eb' },
  { name: 'Productivity', icon: '⚡', color: '#f59e0b' },
  { name: 'Gaming', icon: '🎮', color: '#22c55e' },
  { name: 'News/Media', icon: '📰', color: '#06b6d4' },
  { name: 'Fitness', icon: '💪', color: '#ec4899' },
  { name: 'Software', icon: '💻', color: '#8b5cf6' },
  { name: 'Education', icon: '📚', color: '#f97316' },
  { name: 'Food', icon: '🍕', color: '#ef4444' },
  { name: 'Shopping', icon: '🛒', color: '#14b8a6' },
  { name: 'Other', icon: '📦', color: '#64748b' },
];

const POPULAR_SUBS = [
  { name: 'Netflix', amount: 15.49, category: 'Streaming', icon: '🎬', color: '#e50914' },
  { name: 'Spotify', amount: 11.99, category: 'Music', icon: '🎵', color: '#1db954' },
  { name: 'YouTube Premium', amount: 13.99, category: 'Streaming', icon: '▶️', color: '#ff0000' },
  { name: 'Amazon Prime', amount: 14.99, category: 'Shopping', icon: '📦', color: '#ff9900' },
  { name: 'Disney+', amount: 13.99, category: 'Streaming', icon: '🏰', color: '#113ccf' },
  { name: 'Apple Music', amount: 10.99, category: 'Music', icon: '🍎', color: '#fc3c44' },
  { name: 'iCloud+', amount: 2.99, category: 'Cloud Storage', icon: '☁️', color: '#3693f3' },
  { name: 'Google One', amount: 2.99, category: 'Cloud Storage', icon: '🔵', color: '#4285f4' },
  { name: 'ChatGPT Plus', amount: 20.00, category: 'Software', icon: '🤖', color: '#10a37f' },
  { name: 'Adobe CC', amount: 54.99, category: 'Software', icon: '🎨', color: '#ff0000' },
  { name: 'Microsoft 365', amount: 9.99, category: 'Productivity', icon: '📊', color: '#0078d4' },
  { name: 'Notion', amount: 10.00, category: 'Productivity', icon: '📝', color: '#000000' },
  { name: 'HBO Max', amount: 15.99, category: 'Streaming', icon: '🎭', color: '#5822b4' },
  { name: 'Hulu', amount: 7.99, category: 'Streaming', icon: '📺', color: '#1ce783' },
  { name: 'Gym Membership', amount: 29.99, category: 'Fitness', icon: '💪', color: '#ef4444' },
  { name: 'Dropbox', amount: 11.99, category: 'Cloud Storage', icon: '📁', color: '#0061ff' },
];

const CURRENCIES = ['$', '€', '£', '₹', '¥', 'A$', 'C$'];

const faqs = [
  { question: 'How does the subscription tracker work?', answer: 'Add your subscriptions with name, amount, billing cycle, and category. The tool calculates your total monthly and yearly spending, shows category breakdowns, and alerts you about upcoming billing dates. All data is stored locally in your browser — nothing is sent to any server.' },
  { question: 'Is my subscription data private?', answer: 'Yes, 100%. All data is stored in your browser\'s localStorage. We don\'t collect, store, or transmit any of your subscription information. Your financial data never leaves your device.' },
  { question: 'Can I export my subscription data?', answer: 'Yes! Free users can export as JSON. Pro users get CSV and PDF exports with detailed reports, charts, and spending analysis.' },
  { question: 'How do billing reminders work?', answer: 'The tool shows upcoming billing dates sorted by proximity. Pro users can set custom reminder notifications before each billing date.' },
  { question: 'What\'s the average person spending on subscriptions?', answer: 'Studies show the average American spends $200-300/month on subscriptions, and most people underestimate their spending by 2-3x. Our tool helps you see the real number and find subscriptions to cut.' },
];

export default function SubscriptionTracker() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [currency, setCurrency] = useState('$');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCycle, setFormCycle] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [formCategory, setFormCategory] = useState('Other');
  const [formNextBilling, setFormNextBilling] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sherutools_subscriptions');
    if (saved) {
      try { setSubs(JSON.parse(saved)); } catch {}
    }
    const savedCurrency = localStorage.getItem('sherutools_sub_currency');
    if (savedCurrency) setCurrency(savedCurrency);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (subs.length > 0) {
      localStorage.setItem('sherutools_subscriptions', JSON.stringify(subs));
    }
  }, [subs]);

  useEffect(() => {
    localStorage.setItem('sherutools_sub_currency', currency);
  }, [currency]);

  const resetForm = () => {
    setFormName(''); setFormAmount(''); setFormCycle('monthly');
    setFormCategory('Other'); setFormNextBilling(''); setFormNotes('');
    setEditingId(null);
  };

  const addOrUpdateSub = () => {
    if (!formName || !formAmount) return;
    const cat = CATEGORIES.find(c => c.name === formCategory) || CATEGORIES[CATEGORIES.length - 1];
    const sub: Subscription = {
      id: editingId || crypto.randomUUID(),
      name: formName,
      amount: parseFloat(formAmount),
      currency,
      cycle: formCycle,
      category: formCategory,
      nextBilling: formNextBilling || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      color: cat.color,
      icon: cat.icon,
      active: true,
      notes: formNotes,
      createdAt: editingId ? subs.find(s => s.id === editingId)?.createdAt || Date.now() : Date.now(),
    };

    if (editingId) {
      setSubs(prev => prev.map(s => s.id === editingId ? sub : s));
    } else {
      setSubs(prev => [...prev, sub]);
    }
    resetForm();
    setShowAdd(false);
  };

  const quickAdd = (popular: typeof POPULAR_SUBS[0]) => {
    const cat = CATEGORIES.find(c => c.name === popular.category) || CATEGORIES[CATEGORIES.length - 1];
    const sub: Subscription = {
      id: crypto.randomUUID(),
      name: popular.name,
      amount: popular.amount,
      currency,
      cycle: 'monthly',
      category: popular.category,
      nextBilling: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      color: popular.color || cat.color,
      icon: popular.icon || cat.icon,
      active: true,
      notes: '',
      createdAt: Date.now(),
    };
    setSubs(prev => [...prev, sub]);
  };

  const deleteSub = (id: string) => {
    setSubs(prev => {
      const updated = prev.filter(s => s.id !== id);
      if (updated.length === 0) localStorage.removeItem('sherutools_subscriptions');
      return updated;
    });
  };

  const editSub = (sub: Subscription) => {
    setFormName(sub.name);
    setFormAmount(sub.amount.toString());
    setFormCycle(sub.cycle);
    setFormCategory(sub.category);
    setFormNextBilling(sub.nextBilling);
    setFormNotes(sub.notes);
    setEditingId(sub.id);
    setShowAdd(true);
  };

  const toggleActive = (id: string) => {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const getMonthlyAmount = (sub: Subscription) => {
    if (sub.cycle === 'yearly') return sub.amount / 12;
    if (sub.cycle === 'weekly') return sub.amount * 4.33;
    return sub.amount;
  };

  // Stats
  const stats = useMemo(() => {
    const active = subs.filter(s => s.active);
    const monthly = active.reduce((sum, s) => sum + getMonthlyAmount(s), 0);
    const yearly = monthly * 12;
    const daily = monthly / 30;

    const byCategory: Record<string, number> = {};
    active.forEach(s => {
      byCategory[s.category] = (byCategory[s.category] || 0) + getMonthlyAmount(s);
    });

    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

    // Upcoming billing
    const upcoming = [...active]
      .filter(s => s.nextBilling)
      .sort((a, b) => new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime())
      .slice(0, 5);

    return { monthly, yearly, daily, byCategory, topCategory, upcoming, activeCount: active.length, totalCount: subs.length };
  }, [subs]);

  // Filter & search
  const filtered = useMemo(() => {
    return subs.filter(s => {
      if (filterCategory !== 'All' && s.category !== filterCategory) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [subs, filterCategory, search]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(subs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subscriptions.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) setSubs(data);
      } catch { alert('Invalid JSON file'); }
    };
    input.click();
  };

  const categoryColors = Object.entries(stats.byCategory).map(([cat, amount]) => {
    const c = CATEGORIES.find(ca => ca.name === cat);
    return { name: cat, amount, color: c?.color || '#64748b', icon: c?.icon || '📦', pct: stats.monthly > 0 ? (amount / stats.monthly) * 100 : 0 };
  }).sort((a, b) => b.amount - a.amount);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-yellow-500/5" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 text-sm font-medium text-red-500 dark:text-red-400">
              <DollarSign className="w-4 h-4" /> Subscription Tracker
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white">
              Stop Wasting Money on{' '}
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Forgotten Subscriptions
              </span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              The average person spends {currency}200+/month on subscriptions and doesn&apos;t even know it. 
              Track, analyze, and cut unnecessary spending. 100% private — data stays in your browser.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard icon={<Wallet className="w-5 h-5" />} label="Monthly" value={`${currency}${stats.monthly.toFixed(2)}`} color="from-red-500 to-orange-500" sub={`${currency}${stats.daily.toFixed(2)}/day`} />
          <StatsCard icon={<TrendingUp className="w-5 h-5" />} label="Yearly" value={`${currency}${stats.yearly.toFixed(2)}`} color="from-orange-500 to-yellow-500" sub={`${stats.activeCount} active`} />
          <StatsCard icon={<CreditCard className="w-5 h-5" />} label="Top Category" value={stats.topCategory ? stats.topCategory[0] : 'N/A'} color="from-purple-500 to-pink-500" sub={stats.topCategory ? `${currency}${stats.topCategory[1].toFixed(2)}/mo` : ''} />
          <StatsCard icon={<AlertTriangle className="w-5 h-5" />} label="Next Billing" value={stats.upcoming[0] ? daysUntil(stats.upcoming[0].nextBilling) : 'N/A'} color="from-blue-500 to-cyan-500" sub={stats.upcoming[0]?.name || ''} />
        </div>

        {/* Category Breakdown Bar */}
        {categoryColors.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Spending Breakdown</h3>
            <div className="w-full h-6 rounded-full overflow-hidden flex">
              {categoryColors.map((c, i) => (
                <motion.div key={i} initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="h-full relative group cursor-pointer" style={{ backgroundColor: c.color, minWidth: c.pct > 2 ? undefined : '2px' }}
                  title={`${c.icon} ${c.name}: ${currency}${c.amount.toFixed(2)}/mo (${c.pct.toFixed(0)}%)`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              {categoryColors.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{c.icon} {c.name} ({c.pct.toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { resetForm(); setShowAdd(true); }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold shadow-lg shadow-red-500/25 flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Subscription
          </motion.button>
          <button onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
            ⚡ Quick Add
          </button>
          <div className="flex-1" />
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." 
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm w-40 focus:w-56 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/30" />
          </div>
          <select value={currency} onChange={e => setCurrency(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm">
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm">
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
          </select>
          <button onClick={exportJSON} className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all" title="Export">
            <Download className="w-4 h-4 text-slate-500" />
          </button>
          <button onClick={importJSON} className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all" title="Import">
            <Upload className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Quick Add Popular */}
        <AnimatePresence>
          {showQuickAdd && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden">
              <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Popular Subscriptions — Tap to Add</h3>
                  <button onClick={() => setShowQuickAdd(false)}><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SUBS.map((p, i) => {
                    const alreadyAdded = subs.some(s => s.name === p.name);
                    return (
                      <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => !alreadyAdded && quickAdd(p)}
                        disabled={alreadyAdded}
                        className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
                          alreadyAdded
                            ? 'bg-green-500/10 border-green-500/20 text-green-500 cursor-default'
                            : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-red-500/30'
                        }`}>
                        {p.icon} {p.name} <span className="text-slate-400">{currency}{p.amount}</span>
                        {alreadyAdded && <Check className="w-3 h-3" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subscription List */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 space-y-4">
            <div className="text-6xl">💸</div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No Subscriptions Yet</h3>
            <p className="text-slate-500 dark:text-slate-400">Add your first subscription to start tracking your spending.</p>
            <button onClick={() => setShowQuickAdd(true)}
              className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-medium text-sm hover:bg-red-500/20 transition-all">
              ⚡ Quick Add Popular Ones
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((sub, i) => (
                <motion.div key={sub.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group p-4 rounded-2xl border transition-all ${
                    sub.active 
                      ? 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10' 
                      : 'bg-slate-50 dark:bg-white/[0.01] border-slate-200/50 dark:border-white/[0.03] opacity-60'
                  }`}>
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: sub.color + '15' }}>
                      {sub.icon}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${sub.active ? 'text-slate-900 dark:text-white' : 'line-through text-slate-500'}`}>{sub.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: sub.color + '20', color: sub.color }}>
                          {sub.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Next: {formatDate(sub.nextBilling)}</span>
                        <span>{sub.cycle}</span>
                        {sub.notes && <span>📝 {sub.notes}</span>}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{sub.currency}{sub.amount.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">/{sub.cycle === 'yearly' ? 'yr' : sub.cycle === 'weekly' ? 'wk' : 'mo'}</div>
                      {sub.cycle !== 'monthly' && (
                        <div className="text-[10px] text-slate-400">{sub.currency}{getMonthlyAmount(sub).toFixed(2)}/mo</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => toggleActive(sub.id)}
                        className={`p-2 rounded-lg transition-colors ${sub.active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-slate-200 dark:bg-white/5 text-slate-400 hover:bg-slate-300'}`}
                        title={sub.active ? 'Pause' : 'Resume'}>
                        {sub.active ? <Check className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </button>
                      <button onClick={() => editSub(sub)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteSub(sub.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Upcoming Billing */}
        {stats.upcoming.length > 0 && (
          <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4" /> Upcoming Billing
            </h3>
            <div className="space-y-2">
              {stats.upcoming.map((sub, i) => {
                const days = daysUntilNum(sub.nextBilling);
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-lg">{sub.icon}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex-1">{sub.name}</span>
                    <span className="text-slate-500">{sub.currency}{sub.amount}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      days <= 3 ? 'bg-red-500/10 text-red-500' : days <= 7 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days} days`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Insight Card */}
        {subs.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/20 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">💡 Spending Insight</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              You&apos;re spending <strong className="text-red-500">{currency}{stats.monthly.toFixed(2)}/month</strong> ({currency}{stats.yearly.toFixed(2)}/year) on {stats.activeCount} active subscriptions. 
              That&apos;s <strong>{currency}{stats.daily.toFixed(2)} every single day</strong> — even while you sleep! 
              {stats.monthly > 100 && ` In 5 years, that's ${currency}${(stats.yearly * 5).toFixed(0)} if invested could grow to ${currency}${(stats.yearly * 5 * 1.4).toFixed(0)} with 8% returns.`}
            </p>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => { setShowAdd(false); resetForm(); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingId ? 'Edit' : 'Add'} Subscription</h2>
                <button onClick={() => { setShowAdd(false); resetForm(); }}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Name</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Netflix, Spotify..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Amount ({currency})</label>
                    <input type="number" step="0.01" value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="9.99"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Billing Cycle</label>
                    <select value={formCycle} onChange={e => setFormCycle(e.target.value as 'monthly' | 'yearly' | 'weekly')}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm">
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat.name} onClick={() => setFormCategory(cat.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          formCategory === cat.name
                            ? 'border-red-500/30 bg-red-500/10 text-red-500'
                            : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                        }`}>
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Next Billing Date</label>
                  <input type="date" value={formNextBilling} onChange={e => setFormNextBilling(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Notes (optional)</label>
                  <input value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Family plan, annual deal..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={addOrUpdateSub} disabled={!formName || !formAmount}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {editingId ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? 'Update Subscription' : 'Add Subscription'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ & Related */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <FAQSection faqs={faqs} />
      </section>
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <RelatedTools tools={[{name:"Salary Calculator",href:"/salary-calculator",description:"Convert salary between hourly, weekly, monthly, yearly.",icon:"💰"},{name:"AI Resume Scorer",href:"/resume-scorer",description:"Get AI feedback on your resume with scoring.",icon:"📄"},{name:"Invoice Generator",href:"/invoice-generator",description:"Create professional invoices in seconds.",icon:"🧾"},{name:"Password Generator",href:"/password-generator",description:"Generate strong, secure passwords.",icon:"🔐"}]} />
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Subscription Tracker",
        "description": "Track all your subscriptions, see monthly spending, get billing reminders. Free, private, no sign-up.",
        "url": "https://sherutools.com/subscription-tracker",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      })}} />
    </div>
  );
}

// Helper components
function StatsCard({ icon, label, value, color, sub }: { icon: React.ReactNode; label: string; value: string; color: string; sub: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3`}>{icon}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</div>
      <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </motion.div>
  );
}

function formatDate(date: string): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysUntilNum(date: string): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function daysUntil(date: string): string {
  const days = daysUntilNum(date);
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
}
