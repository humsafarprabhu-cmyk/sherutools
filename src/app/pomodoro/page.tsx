'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Play, Pause, RotateCcw, SkipForward, Maximize, Minimize, Settings, Volume2, VolumeX, Timer, X } from 'lucide-react';

// ─── Types ───
type TimerMode = 'work' | 'shortBreak' | 'longBreak';
type AmbientSound = 'off' | 'whitenoise' | 'rain' | 'cafe';

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStart: boolean;
  soundEnabled: boolean;
  ambientSound: AmbientSound;
}

interface SessionRecord {
  task: string;
  mode: TimerMode;
  duration: number;
  completedAt: string;
}

interface DailyStats {
  date: string;
  focusMinutes: number;
  pomodorosCompleted: number;
  sessions: SessionRecord[];
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStart: false,
  soundEnabled: true,
  ambientSound: 'off',
};

const MODE_LABELS: Record<TimerMode, string> = {
  work: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadSettings(): PomodoroSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const s = localStorage.getItem('pomodoro-settings');
    return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

function saveSettings(s: PomodoroSettings) {
  localStorage.setItem('pomodoro-settings', JSON.stringify(s));
}

function loadStats(): DailyStats {
  if (typeof window === 'undefined') return { date: getTodayKey(), focusMinutes: 0, pomodorosCompleted: 0, sessions: [] };
  try {
    const s = localStorage.getItem('pomodoro-stats');
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed.date === getTodayKey()) return parsed;
    }
  } catch {}
  return { date: getTodayKey(), focusMinutes: 0, pomodorosCompleted: 0, sessions: [] };
}

function saveStats(s: DailyStats) {
  localStorage.setItem('pomodoro-stats', JSON.stringify(s));
}

// ─── Web Audio helpers ───
function playCompletionSound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    // Pleasant two-tone chime
    [520, 660, 780].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.5);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch {}
}

class AmbientPlayer {
  private ctx: AudioContext | null = null;
  private nodes: AudioNode[] = [];
  private oscs: OscillatorNode[] = [];

  start(type: AmbientSound) {
    this.stop();
    if (type === 'off') return;
    try {
      this.ctx = new AudioContext();
      if (type === 'whitenoise') this.whiteNoise();
      else if (type === 'rain') this.rainSound();
      else if (type === 'cafe') this.cafeSound();
    } catch {}
  }

  private whiteNoise() {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.05;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start();
    this.nodes.push(src, gain, filter);
  }

  private rainSound() {
    if (!this.ctx) return;
    // Brown noise + filtered = rain-like
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * white) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.15;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 400;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 4000;
    src.connect(hp).connect(lp).connect(gain).connect(this.ctx.destination);
    src.start();
    this.nodes.push(src, gain, hp, lp);
  }

  private cafeSound() {
    if (!this.ctx) return;
    // Multiple detuned oscillators at low volume for murmur
    const gain = this.ctx.createGain();
    gain.gain.value = 0.03;
    gain.connect(this.ctx.destination);
    this.nodes.push(gain);
    for (let i = 0; i < 6; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 100 + Math.random() * 200;
      const oscGain = this.ctx.createGain();
      oscGain.gain.value = 0.3 + Math.random() * 0.4;
      // Slow random modulation
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.1 + Math.random() * 0.5;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.3;
      lfo.connect(lfoGain).connect(oscGain.gain);
      osc.connect(oscGain).connect(gain);
      osc.start();
      lfo.start();
      this.oscs.push(osc, lfo);
      this.nodes.push(oscGain, lfoGain);
    }
    // Add filtered noise for chatter
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 800;
    bp.Q.value = 0.5;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.4;
    src.connect(bp).connect(noiseGain).connect(gain);
    src.start();
    this.nodes.push(src, bp, noiseGain);
  }

  stop() {
    this.oscs.forEach(o => { try { o.stop(); } catch {} });
    this.oscs = [];
    this.nodes = [];
    if (this.ctx) { try { this.ctx.close(); } catch {} this.ctx = null; }
  }
}

// ─── SVG Progress Ring ───
function ProgressRing({ progress, mode, size = 280, stroke = 10 }: { progress: number; mode: TimerMode; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const isBreak = mode !== 'work';
  const gradientId = 'timer-gradient';

  return (
    <svg width={size} height={size} className="transform -rotate-90 drop-shadow-lg">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          {isBreak ? (
            <>
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </>
          )}
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-slate-200 dark:text-white/10"
        strokeWidth={stroke}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={stroke + 2}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        filter="url(#glow)"
        className="transition-[stroke-dashoffset] duration-1000 ease-linear"
      />
    </svg>
  );
}

// ─── Session Dots ───
function SessionDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            i < current
              ? 'bg-red-500 dark:bg-red-400'
              : i === current
              ? 'bg-red-500 dark:bg-red-400'
              : 'bg-slate-300 dark:bg-white/20'
          }`}
          animate={i === current ? { scale: [1, 1.3, 1] } : {}}
          transition={i === current ? { duration: 1.5, repeat: Infinity } : {}}
        />
      ))}
    </div>
  );
}

export default function PomodoroTimer() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [stats, setStatsState] = useState<DailyStats>({ date: getTodayKey(), focusMinutes: 0, pomodorosCompleted: 0, sessions: [] });
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [task, setTask] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const endTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ambientRef = useRef<AmbientPlayer | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const s = loadSettings();
    setSettings(s);
    const duration = s.workDuration * 60;
    setTimeLeft(duration);
    setTotalTime(duration);
    setStatsState(loadStats());
    ambientRef.current = new AmbientPlayer();
    return () => { ambientRef.current?.stop(); };
  }, []);

  // Timer with drift correction
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    endTimeRef.current = Date.now() + timeLeft * 1000;
    intervalRef.current = setInterval(() => {
      const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
      if (remaining <= 0) {
        setTimeLeft(0);
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setTimeLeft(remaining);
      }
    }, 250);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle timer completion
  const handleComplete = useCallback(() => {
    if (settings.soundEnabled) playCompletionSound();

    // Browser notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const body = mode === 'work' ? 'Great work! Time for a break.' : 'Break is over! Ready to focus?';
      new Notification('Pomodoro Timer', { body, icon: '/favicon.ico' });
    }

    // Update stats
    const newStats = { ...stats };
    if (newStats.date !== getTodayKey()) {
      newStats.date = getTodayKey();
      newStats.focusMinutes = 0;
      newStats.pomodorosCompleted = 0;
      newStats.sessions = [];
    }

    newStats.sessions.push({
      task: task || 'Untitled',
      mode,
      duration: totalTime / 60,
      completedAt: new Date().toLocaleTimeString(),
    });

    if (mode === 'work') {
      newStats.focusMinutes += settings.workDuration;
      newStats.pomodorosCompleted += 1;
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);

      // Next: long break every 4, else short break
      if (newCount % 4 === 0) {
        switchMode('longBreak', newStats);
      } else {
        switchMode('shortBreak', newStats);
      }
    } else {
      switchMode('work', newStats);
    }
  }, [mode, settings, stats, task, totalTime, pomodoroCount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (timeLeft === 0 && mounted) {
      handleComplete();
    }
  }, [timeLeft, mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  function switchMode(newMode: TimerMode, updatedStats?: DailyStats) {
    const durations: Record<TimerMode, number> = {
      work: settings.workDuration,
      shortBreak: settings.shortBreakDuration,
      longBreak: settings.longBreakDuration,
    };
    const dur = durations[newMode] * 60;
    setMode(newMode);
    setTimeLeft(dur);
    setTotalTime(dur);
    if (updatedStats) {
      setStatsState(updatedStats);
      saveStats(updatedStats);
    }
    if (settings.autoStart) {
      setIsRunning(true);
    }
  }

  function handleStart() {
    // Request notification permission
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(true);
  }

  function handlePause() {
    setIsRunning(false);
  }

  function handleReset() {
    setIsRunning(false);
    const durations: Record<TimerMode, number> = {
      work: settings.workDuration,
      shortBreak: settings.shortBreakDuration,
      longBreak: settings.longBreakDuration,
    };
    const dur = durations[mode] * 60;
    setTimeLeft(dur);
    setTotalTime(dur);
  }

  function handleSkip() {
    setIsRunning(false);
    if (mode === 'work') {
      const newCount = pomodoroCount;
      if ((newCount + 1) % 4 === 0) switchMode('longBreak');
      else switchMode('shortBreak');
    } else {
      switchMode('work');
    }
  }

  function updateSettings(partial: Partial<PomodoroSettings>) {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);
    saveSettings(newSettings);

    // If changing duration of current mode while not running, update timer
    if (!isRunning) {
      if (partial.workDuration !== undefined && mode === 'work') {
        setTimeLeft(partial.workDuration * 60);
        setTotalTime(partial.workDuration * 60);
      }
      if (partial.shortBreakDuration !== undefined && mode === 'shortBreak') {
        setTimeLeft(partial.shortBreakDuration * 60);
        setTotalTime(partial.shortBreakDuration * 60);
      }
      if (partial.longBreakDuration !== undefined && mode === 'longBreak') {
        setTimeLeft(partial.longBreakDuration * 60);
        setTotalTime(partial.longBreakDuration * 60);
      }
    }

    // Ambient sound
    if (partial.ambientSound !== undefined) {
      ambientRef.current?.stop();
      if (partial.ambientSound !== 'off') {
        ambientRef.current?.start(partial.ambientSound);
      }
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = totalTime > 0 ? timeLeft / totalTime : 1;
  const isBreak = mode !== 'work';

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <Link href="/" className="hover:text-blue-500 transition-colors">SheruTools</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 dark:text-white font-medium">Pomodoro Timer</span>
        </nav>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 text-sm font-medium mb-3">
            <Timer className="w-4 h-4" />
            {MODE_LABELS[mode]}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Pomodoro Timer
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Stay focused with the Pomodoro technique
          </p>
        </motion.div>

        {/* Task Input */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <input
            type="text"
            value={task}
            onChange={e => setTask(e.target.value)}
            placeholder="What are you working on?"
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-center text-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 transition-all"
          />
        </motion.div>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative">
            <ProgressRing progress={progress} mode={mode} />
            {/* Time display in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl md:text-7xl font-bold tabular-nums transition-colors duration-300 ${
                isBreak ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
              }`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Pomodoro {(pomodoroCount % 4) + 1}/4
              </span>
            </div>
          </div>

          {/* Session Dots */}
          <div className="mt-4">
            <SessionDots current={pomodoroCount % 4} total={4} />
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={isRunning ? handlePause : handleStart}
            className={`px-8 py-4 rounded-2xl text-white font-semibold text-lg flex items-center gap-2 transition-all shadow-lg ${
              isRunning
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-orange-500/25'
                : isBreak
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-500/25'
                : 'bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-red-500/25'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isRunning ? 'Pause' : 'Start'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Skip"
          >
            <SkipForward className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Quick actions row */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showSettings
                ? 'bg-red-500/10 text-red-500'
                : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            Sound {settings.soundEnabled ? 'On' : 'Off'}
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Settings</h3>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Duration sliders */}
                {[
                  { label: 'Work Duration', key: 'workDuration' as const, min: 1, max: 60, value: settings.workDuration, suffix: 'min' },
                  { label: 'Short Break', key: 'shortBreakDuration' as const, min: 1, max: 30, value: settings.shortBreakDuration, suffix: 'min' },
                  { label: 'Long Break', key: 'longBreakDuration' as const, min: 1, max: 60, value: settings.longBreakDuration, suffix: 'min' },
                ].map(item => (
                  <div key={item.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                      <span className="font-medium text-slate-900 dark:text-white">{item.value} {item.suffix}</span>
                    </div>
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      value={item.value}
                      onChange={e => updateSettings({ [item.key]: parseInt(e.target.value) })}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 dark:bg-white/10 accent-red-500"
                    />
                  </div>
                ))}

                {/* Auto-start toggle */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Auto-start next timer</span>
                  <div
                    onClick={() => updateSettings({ autoStart: !settings.autoStart })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      settings.autoStart ? 'bg-red-500' : 'bg-slate-300 dark:bg-white/20'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      settings.autoStart ? 'translate-x-5' : ''
                    }`} />
                  </div>
                </label>

                {/* Ambient sound */}
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 block mb-2">Ambient Sound</span>
                  <div className="flex gap-2">
                    {([['off', '🔇 Off'], ['whitenoise', '📻 White Noise'], ['rain', '🌧️ Rain'], ['cafe', '☕ Cafe']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => updateSettings({ ambientSound: val })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          settings.ambientSound === val
                            ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl text-center">
            <div className="text-3xl font-bold text-red-500 dark:text-red-400">{stats.pomodorosCompleted}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pomodoros Today</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl text-center">
            <div className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">
              {stats.focusMinutes >= 60
                ? `${Math.floor(stats.focusMinutes / 60)}h ${stats.focusMinutes % 60}m`
                : `${stats.focusMinutes}m`
              }
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Focus Time Today</div>
          </div>
        </motion.div>

        {/* History */}
        {stats.sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Today&apos;s Sessions</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...stats.sessions].reverse().map((session, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${session.mode === 'work' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <div>
                      <span className="text-sm text-slate-900 dark:text-white">{session.task}</span>
                      <span className="text-xs text-slate-400 ml-2">{session.duration}min {session.mode === 'work' ? 'focus' : 'break'}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{session.completedAt}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
