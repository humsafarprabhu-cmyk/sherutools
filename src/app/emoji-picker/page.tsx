'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, Heart, Clock, Star, Smile, ChevronRight, Home, X, Check } from 'lucide-react';
import Link from 'next/link';
import { emojis, CATEGORIES, SKIN_TONES, SKIN_TONE_COMPATIBLE, EMOJI_COMBOS, type Emoji, type Category } from '@/data/emojis';

const CATEGORY_ICONS: Record<string, string> = {
  All: '🔤',
  Smileys: '😀',
  People: '👋',
  Animals: '🐶',
  Food: '🍕',
  Travel: '✈️',
  Activities: '⚽',
  Objects: '💡',
  Symbols: '❤️',
  Flags: '🏳️',
};

const SIZE_MAP = { small: 'text-2xl', medium: 'text-3xl', large: 'text-4xl' } as const;
type EmojiSize = keyof typeof SIZE_MAP;

function getCodePoints(emoji: string): string {
  return [...emoji].map(c => 'U+' + c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')).join(' ');
}

function getHtmlEntity(emoji: string): string {
  return [...emoji].map(c => '&#x' + c.codePointAt(0)!.toString(16).toUpperCase() + ';').join('');
}

function getCssCode(emoji: string): string {
  return [...emoji].map(c => '\\' + c.codePointAt(0)!.toString(16).toUpperCase()).join('');
}

function getUnicodeEscape(emoji: string): string {
  return [...emoji].map(c => {
    const cp = c.codePointAt(0)!;
    if (cp > 0xFFFF) {
      const h = Math.floor((cp - 0x10000) / 0x400) + 0xD800;
      const l = ((cp - 0x10000) % 0x400) + 0xDC00;
      return `\\u${h.toString(16).toUpperCase()}\\u${l.toString(16).toUpperCase()}`;
    }
    return `\\u${cp.toString(16).toUpperCase().padStart(4, '0')}`;
  }).join('');
}

function applySkinTone(emoji: string, modifier: string): string {
  if (!modifier) return emoji;
  const base = [...emoji][0];
  if (SKIN_TONE_COMPATIBLE.has(base)) {
    return base + modifier + emoji.slice(base.length);
  }
  return emoji;
}

export default function EmojiPickerPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [skinTone, setSkinTone] = useState(0);
  const [emojiSize, setEmojiSize] = useState<EmojiSize>('medium');
  const [selectedEmoji, setSelectedEmoji] = useState<Emoji | null>(null);
  const [copiedText, setCopiedText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showSkinTones, setShowSkinTones] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const skinToneRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const r = localStorage.getItem('emoji-recent');
      if (r) setRecentlyUsed(JSON.parse(r));
      const f = localStorage.getItem('emoji-favorites');
      if (f) setFavorites(JSON.parse(f));
    } catch {}
  }, []);

  // Close skin tone picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (skinToneRef.current && !skinToneRef.current.contains(e.target as Node)) {
        setShowSkinTones(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    let result = emojis;
    if (category !== 'All') {
      result = result.filter(e => e.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.keywords.some(k => k.includes(q))
      );
    }
    return result;
  }, [search, category]);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedText(label);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    }
  }, []);

  const handleEmojiClick = useCallback((emoji: Emoji) => {
    const withTone = applySkinTone(emoji.emoji, SKIN_TONES[skinTone].modifier);
    copyToClipboard(withTone, `${withTone} copied!`);
    setSelectedEmoji(emoji);

    // Update recently used
    setRecentlyUsed(prev => {
      const next = [emoji.emoji, ...prev.filter(e => e !== emoji.emoji)].slice(0, 24);
      try { localStorage.setItem('emoji-recent', JSON.stringify(next)); } catch {}
      return next;
    });
  }, [skinTone, copyToClipboard]);

  const toggleFavorite = useCallback((emojiChar: string) => {
    setFavorites(prev => {
      const next = prev.includes(emojiChar)
        ? prev.filter(e => e !== emojiChar)
        : [emojiChar, ...prev].slice(0, 48);
      try { localStorage.setItem('emoji-favorites', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const favoriteEmojis = useMemo(() => {
    return favorites.map(f => emojis.find(e => e.emoji === f)).filter(Boolean) as Emoji[];
  }, [favorites]);

  const recentEmojis = useMemo(() => {
    return recentlyUsed.map(r => emojis.find(e => e.emoji === r)).filter(Boolean) as Emoji[];
  }, [recentlyUsed]);

  const currentEmoji = selectedEmoji
    ? applySkinTone(selectedEmoji.emoji, SKIN_TONES[skinTone].modifier)
    : null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <Home className="w-3.5 h-3.5" /> SheruTools
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">Emoji Picker</span>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600 dark:text-amber-400 mb-3">
            <Smile className="w-4 h-4" /> Emoji Picker
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Emoji Picker & Search
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Search, browse, and copy emojis instantly. Click any emoji to copy it to your clipboard.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Panel */}
          <div className="space-y-4">
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search emojis... (e.g. smile, heart, fire)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-base transition-all"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); searchRef.current?.focus(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>

            {/* Controls Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap items-center gap-3"
            >
              {/* Skin Tone Picker */}
              <div ref={skinToneRef} className="relative">
                <button
                  onClick={() => setShowSkinTones(!showSkinTones)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm hover:border-amber-500/50 transition-all"
                >
                  <span className="text-lg">{SKIN_TONES[skinTone].modifier ? '👋' + SKIN_TONES[skinTone].modifier : '👋'}</span>
                  <span className="text-slate-600 dark:text-slate-300 text-xs">Skin Tone</span>
                </button>
                <AnimatePresence>
                  {showSkinTones && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                      className="absolute top-full left-0 mt-1 z-20 flex gap-1 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-xl"
                    >
                      {SKIN_TONES.map((tone, i) => (
                        <button
                          key={i}
                          onClick={() => { setSkinTone(i); setShowSkinTones(false); }}
                          className={`text-2xl p-1 rounded-lg transition-all hover:scale-110 ${skinTone === i ? 'bg-amber-500/20 ring-2 ring-amber-500' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}
                          title={tone.name}
                        >
                          {tone.modifier ? '👋' + tone.modifier : '👋'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Size Selector */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Size:</span>
                {(Object.keys(SIZE_MAP) as EmojiSize[]).map(size => (
                  <button
                    key={size}
                    onClick={() => setEmojiSize(size)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${emojiSize === size ? 'bg-amber-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400 ml-auto">
                {filtered.length} emoji{filtered.length !== 1 ? 's' : ''}
              </div>
            </motion.div>

            {/* Category Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
            >
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    category === cat
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                      : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-amber-500/30'
                  }`}
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* Recently Used */}
            {recentEmojis.length > 0 && !search && category === 'All' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <Clock className="w-4 h-4" /> Recently Used
                </div>
                <div className="flex flex-wrap gap-1">
                  {recentEmojis.slice(0, 12).map((emoji, i) => (
                    <button
                      key={emoji.emoji + i}
                      onClick={() => handleEmojiClick(emoji)}
                      className={`${SIZE_MAP[emojiSize]} p-1.5 rounded-lg hover:bg-amber-500/10 hover:scale-110 transition-all duration-150 cursor-pointer`}
                      title={emoji.name}
                    >
                      {applySkinTone(emoji.emoji, SKIN_TONES[skinTone].modifier)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Favorites */}
            {favoriteEmojis.length > 0 && !search && category === 'All' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <Star className="w-4 h-4 text-amber-500" /> Favorites
                </div>
                <div className="flex flex-wrap gap-1">
                  {favoriteEmojis.map((emoji, i) => (
                    <button
                      key={emoji.emoji + i}
                      onClick={() => handleEmojiClick(emoji)}
                      className={`${SIZE_MAP[emojiSize]} p-1.5 rounded-lg hover:bg-amber-500/10 hover:scale-110 transition-all duration-150 cursor-pointer`}
                      title={emoji.name}
                    >
                      {applySkinTone(emoji.emoji, SKIN_TONES[skinTone].modifier)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Emoji Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10"
            >
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Smile className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No emojis found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-0.5">
                  {filtered.map((emoji) => (
                    <button
                      key={emoji.emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      onContextMenu={(e) => { e.preventDefault(); toggleFavorite(emoji.emoji); }}
                      className={`${SIZE_MAP[emojiSize]} p-1.5 rounded-lg hover:bg-amber-500/10 hover:scale-125 transition-all duration-150 cursor-pointer relative group`}
                      title={`${emoji.name} (right-click to favorite)`}
                    >
                      {applySkinTone(emoji.emoji, SKIN_TONES[skinTone].modifier)}
                      {favorites.includes(emoji.emoji) && (
                        <span className="absolute -top-0.5 -right-0.5 text-[8px]">⭐</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Emoji Combos */}
            {!search && category === 'All' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <h3 className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  🔥 Popular Emoji Combos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EMOJI_COMBOS.map(combo => (
                    <button
                      key={combo.emojis}
                      onClick={() => copyToClipboard(combo.emojis, `${combo.emojis} copied!`)}
                      className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{combo.emojis}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{combo.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Emoji Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 lg:sticky lg:top-24 lg:self-start"
          >
            {/* Selected Emoji Details */}
            <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
              {selectedEmoji ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-7xl mb-2">{currentEmoji}</div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedEmoji.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedEmoji.category}</p>
                    <button
                      onClick={() => toggleFavorite(selectedEmoji.emoji)}
                      className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        favorites.includes(selectedEmoji.emoji)
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-amber-500/10'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${favorites.includes(selectedEmoji.emoji) ? 'fill-current' : ''}`} />
                      {favorites.includes(selectedEmoji.emoji) ? 'Favorited' : 'Add to Favorites'}
                    </button>
                  </div>

                  {/* Copy Formats */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Copy As</p>
                    {[
                      { label: 'Emoji', value: currentEmoji! },
                      { label: 'Unicode', value: getCodePoints(currentEmoji!) },
                      { label: 'HTML Entity', value: getHtmlEntity(currentEmoji!) },
                      { label: 'CSS', value: getCssCode(currentEmoji!) },
                      { label: 'JS Escape', value: getUnicodeEscape(currentEmoji!) },
                    ].map(fmt => (
                      <button
                        key={fmt.label}
                        onClick={() => copyToClipboard(fmt.value, `${fmt.label} copied!`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all group text-left"
                      >
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">{fmt.label}</div>
                          <div className="text-xs text-slate-700 dark:text-slate-200 font-mono truncate">{fmt.value}</div>
                        </div>
                        <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 flex-shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>

                  {/* Keywords */}
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedEmoji.keywords.map(kw => (
                        <span key={kw} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] text-slate-500 dark:text-slate-400">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Smile className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Click an emoji to see details</p>
                  <p className="text-xs mt-1 text-slate-400/60">Right-click to favorite</p>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">💡 Tips</h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-1.5"><Heart className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" /> Click any emoji to copy it</li>
                <li className="flex items-start gap-1.5"><Heart className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" /> Right-click to add to favorites</li>
                <li className="flex items-start gap-1.5"><Heart className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" /> Use the skin tone picker for hand emojis</li>
                <li className="flex items-start gap-1.5"><Heart className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" /> Copy as HTML, CSS, or Unicode escape</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl"
          >
            <Check className="w-4 h-4 text-green-400 dark:text-green-600" />
            <span className="text-sm font-medium">{copiedText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"How do I copy emojis?","answer":"Simply click on any emoji to copy it to your clipboard. You can then paste it anywhere."},{"question":"Can I search for specific emojis?","answer":"Yes! Use the search bar to find emojis by name or keyword. Browse by category or search for exactly what you need."},{"question":"Is this emoji picker free?","answer":"Yes, completely free with no limits. Browse and copy thousands of emojis with no sign-up required."},{"question":"Are these emojis compatible with all platforms?","answer":"Yes, these are standard Unicode emojis that work on all modern platforms including iOS, Android, Windows, macOS, and web browsers."}]} />
      <RelatedTools tools={[{"name":"Lorem Ipsum","href":"/lorem-ipsum","description":"Generate placeholder text instantly","icon":"📄"},{"name":"Word Counter","href":"/word-counter","description":"Count words, characters, and reading time","icon":"📊"},{"name":"Markdown Editor","href":"/markdown-editor","description":"Write and preview Markdown","icon":"📝"},{"name":"Text Compare","href":"/text-compare","description":"Compare two texts side by side","icon":"🔄"}]} />
      </div>
    </div>
  );
}
