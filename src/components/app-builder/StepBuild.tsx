'use client';

import { motion } from 'framer-motion';
import { Download, Smartphone, Rocket, Lock, Loader2, CheckCircle, XCircle, Globe, Save, Zap, Image } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ScreenData } from './ScreenCard';

interface Props {
  screens: ScreenData[];
  appName: string;
  primaryColor: string;
}

export default function StepBuild({ screens, appName, primaryColor }: Props) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  // Save project to localStorage
  const saveProject = () => {
    const project = { appName, primaryColor, screens, savedAt: Date.now() };
    const projects = JSON.parse(localStorage.getItem('sherutools_app_projects') || '[]');
    projects.unshift(project);
    localStorage.setItem('sherutools_app_projects', JSON.stringify(projects.slice(0, 10)));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Confetti */}
      {showConfetti && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your App is Ready!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{screens.length} screens generated for &ldquo;{appName}&rdquo;</p>
        </motion.div>
      )}

      {/* Save Project */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveProject}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
        >
          <Save className="w-4 h-4" />
          {saved ? '✅ Saved!' : 'Save Project'}
        </motion.button>
      </div>

      {/* App Icon */}
      <AppIconGenerator appName={appName} primaryColor={primaryColor} />

      {/* Download as Web App (PWA) - INSTANT */}
      <DownloadWebApp screens={screens} appName={appName} primaryColor={primaryColor} />

      {/* Download ZIP Source Code */}
      <DownloadZip screens={screens} appName={appName} primaryColor={primaryColor} />

      {/* Build APK */}
      <APKBuildSection screens={screens} appName={appName} primaryColor={primaryColor} />

      {/* Pro upsell */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 border border-purple-500/20 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-slate-900 dark:text-white">Unlock Pro</h3>
        </div>
        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>✨ Unlimited app generations</li>
          <li>📱 8+ screens per app</li>
          <li>🔨 Priority APK builds</li>
          <li>🎨 AI-generated app icons</li>
          <li>🔔 Push notifications config</li>
        </ul>
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-lg">
          Upgrade — $19.99/mo
        </button>
      </div>
    </motion.div>
  );
}

function AppIconGenerator({ appName, primaryColor }: { appName: string; primaryColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [iconUrl, setIconUrl] = useState('');
  const [iconStyle, setIconStyle] = useState(0);

  const styles = [
    { name: 'Gradient', bg: 'gradient' },
    { name: 'Solid', bg: 'solid' },
    { name: 'Glass', bg: 'glass' },
    { name: 'Dark', bg: 'dark' },
  ];

  const generateIcon = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    // Background
    const r = parseInt(primaryColor.slice(1, 3), 16);
    const g = parseInt(primaryColor.slice(3, 5), 16);
    const b = parseInt(primaryColor.slice(5, 7), 16);

    const style = styles[iconStyle];
    const radius = 112; // iOS-style rounded square

    // Rounded rect path
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();

    if (style.bg === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, primaryColor);
      grad.addColorStop(0.5, `rgba(${Math.min(r + 40, 255)}, ${Math.min(g + 20, 255)}, ${b}, 1)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${Math.min(b + 60, 255)}, 1)`);
      ctx.fillStyle = grad;
    } else if (style.bg === 'solid') {
      ctx.fillStyle = primaryColor;
    } else if (style.bg === 'glass') {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.6)`);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#1e293b';
    }
    ctx.fillRect(0, 0, size, size);

    // Subtle pattern for glass
    if (style.bg === 'glass') {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(0, 0, size, size / 2);
    }

    // Dark style accent
    if (style.bg === 'dark') {
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(size * 0.7, size * 0.3, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.15;
      ctx.fillRect(0, 0, size, size);
      ctx.globalAlpha = 1;
    }

    // Letter
    const letter = (appName || 'A').charAt(0).toUpperCase();
    ctx.fillStyle = style.bg === 'dark' ? '#f1f5f9' : '#ffffff';
    ctx.font = 'bold 220px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 20;
    ctx.fillText(letter, size / 2, size / 2 - 10);
    ctx.shadowBlur = 0;

    // Small app name below letter
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = style.bg === 'dark' ? 'rgba(241,245,249,0.6)' : 'rgba(255,255,255,0.7)';
    const shortName = appName.length > 12 ? appName.substring(0, 12) : appName;
    ctx.fillText(shortName, size / 2, size / 2 + 130);

    setIconUrl(canvas.toDataURL('image/png'));
  }, [appName, primaryColor, iconStyle]);

  useEffect(() => { generateIcon(); }, [generateIcon]);

  const downloadIcon = () => {
    if (!iconUrl) return;
    const a = document.createElement('a');
    a.href = iconUrl;
    a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-icon.png`;
    a.click();
  };

  return (
    <div className="p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Image className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">App Icon</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Auto-generated icon for your app</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="shrink-0">
          {iconUrl && (
            <img src={iconUrl} alt="App Icon" className="w-24 h-24 rounded-2xl shadow-xl" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Style picker */}
        <div className="flex-1 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase">Style</p>
          <div className="flex flex-wrap gap-2">
            {styles.map((s, i) => (
              <button
                key={i}
                onClick={() => setIconStyle(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  iconStyle === i
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <button
            onClick={downloadIcon}
            className="mt-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-500 text-sm font-medium hover:bg-purple-500/20 transition-all"
          >
            Download Icon (512x512)
          </button>
        </div>
      </div>
    </div>
  );
}

function DownloadWebApp({ screens, appName, primaryColor }: Props) {
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);
    try {
      // Build a single HTML file with all screens + navigation
      const html = buildFullAppHtml(screens, appName, primaryColor);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-app'}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Globe className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white">Download as Web App</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">INSTANT</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Single HTML file — open in any browser, works offline</p>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={download}
        disabled={downloading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Zap className="w-5 h-5" />
        {downloading ? 'Generating...' : 'Download Web App (Instant)'}
      </motion.button>
    </div>
  );
}

function DownloadZip({ screens, appName, primaryColor }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const downloadZip = async () => {
    setDownloading(true);
    setProgress(0);
    const interval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 15, 90)), 200);

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const safeName = appName.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase() || 'my-app';

      // app.json
      zip.file('app.json', JSON.stringify({
        expo: {
          name: appName || 'My App', slug: safeName, version: '1.0.0', orientation: 'portrait',
          userInterfaceStyle: 'dark',
          splash: { backgroundColor: primaryColor },
          android: { package: `com.${safeName}.app` },
        },
      }, null, 2));

      // package.json
      zip.file('package.json', JSON.stringify({
        name: safeName, version: '1.0.0', main: 'node_modules/expo/AppEntry.js',
        scripts: { start: 'expo start', android: 'expo start --android' },
        dependencies: {
          expo: '~51.0.0', 'expo-status-bar': '~1.12.1', react: '18.2.0', 'react-native': '0.74.5',
          '@react-navigation/native': '^6.1.18', '@react-navigation/bottom-tabs': '^6.6.1',
          'react-native-screens': '~3.31.1', 'react-native-safe-area-context': '4.10.5',
        },
        devDependencies: { '@babel/core': '^7.20.0' },
      }, null, 2));

      zip.file('babel.config.js', `module.exports = function(api) { api.cache(true); return { presets: ['babel-preset-expo'] }; };\n`);

      const screensDir = zip.folder('screens')!;
      screens.forEach(s => {
        const fileName = s.name.replace(/[^a-zA-Z0-9]/g, '') + 'Screen.tsx';
        screensDir.file(fileName, s.code || `import React from 'react';\nimport { View, Text } from 'react-native';\nexport default function ${s.name.replace(/[^a-zA-Z0-9]/g, '')}Screen() { return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>${s.name}</Text></View>; }`);
      });

      // Also include HTML files
      const htmlDir = zip.folder('web')!;
      screens.forEach(s => {
        if (s.html) htmlDir.file(`${s.name.replace(/[^a-zA-Z0-9]/g, '')}.html`, s.html);
      });
      htmlDir.file('index.html', buildFullAppHtml(screens, appName, primaryColor));

      // App.tsx with navigation
      const imports = screens.map(s => `import ${s.name.replace(/[^a-zA-Z0-9]/g, '')}Screen from './screens/${s.name.replace(/[^a-zA-Z0-9]/g, '')}Screen';`).join('\n');
      const tabs = screens.map(s => `        <Tab.Screen name="${s.name}" component={${s.name.replace(/[^a-zA-Z0-9]/g, '')}Screen} />`).join('\n');
      zip.file('App.tsx', `import React from 'react';\nimport { NavigationContainer } from '@react-navigation/native';\nimport { createBottomTabNavigator } from '@react-navigation/bottom-tabs';\nimport { StatusBar } from 'expo-status-bar';\n${imports}\nconst Tab = createBottomTabNavigator();\nexport default function App() {\n  return (\n    <NavigationContainer>\n      <Tab.Navigator screenOptions={{ headerStyle: { backgroundColor: '${primaryColor}' }, headerTintColor: '#fff', tabBarActiveTintColor: '${primaryColor}', tabBarStyle: { backgroundColor: '#0f172a' } }}>\n${tabs}\n      </Tab.Navigator>\n      <StatusBar style="light" />\n    </NavigationContainer>\n  );\n}\n`);

      zip.file('README.md', `# ${appName}\n\nGenerated by [SheruTools AI App Builder](https://sherutools.com/app-builder)\n\n## Run as Web App\nOpen \`web/index.html\` in any browser.\n\n## Run as Mobile App\n\`\`\`bash\nnpm install\nnpx expo start\n\`\`\`\n\n## Build APK\n\`\`\`bash\nnpx eas build --platform android --profile preview\n\`\`\`\n`);

      clearInterval(interval);
      setProgress(100);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}-project.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Download className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Download Source Code</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Expo project ZIP + Web app — run with npx expo start</p>
        </div>
      </div>
      {downloading && (
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
        </div>
      )}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={downloadZip}
        disabled={downloading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        {downloading ? 'Generating ZIP...' : 'Download Project ZIP'}
      </motion.button>
    </div>
  );
}

function APKBuildSection({ screens, appName, primaryColor }: Props) {
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success' | 'failed'>('idle');
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [buildError, setBuildError] = useState('');
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const startBuild = async () => {
    setBuildStatus('building');
    setBuildProgress(0);
    setBuildLogs(['Starting build...']);
    setBuildError('');

    try {
      const res = await fetch('/api/build-apk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName,
          primaryColor,
          screens: screens.map(s => ({
            name: s.name,
            code: s.code || generateDefaultScreenCode(s.name, primaryColor),
          })),
        }),
      });

      if (!res.ok) throw new Error('Build server unavailable');
      const data = await res.json();
      const buildId = data.buildId;

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/build-apk?buildId=${buildId}`);
          const status = await statusRes.json();
          setBuildProgress(status.progress || 0);
          setBuildLogs(status.logs || []);

          if (status.status === 'success') {
            clearInterval(pollRef.current!);
            setBuildStatus('success');
            setDownloadUrl(status.downloadUrl);
          } else if (status.status === 'failed') {
            clearInterval(pollRef.current!);
            setBuildStatus('failed');
            setBuildError(status.error || 'Build failed');
          }
        } catch { /* retry */ }
      }, 3000);
    } catch (err) {
      setBuildStatus('failed');
      setBuildError(err instanceof Error ? err.message : 'Build failed');
    }
  };

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  return (
    <div className="p-6 rounded-2xl border border-orange-500/20 bg-orange-500/5 space-y-4 relative overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Build Android APK</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real installable APK via cloud build — takes 5-8 minutes</p>
        </div>
      </div>

      {buildStatus === 'building' && (
        <div className="space-y-2">
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${buildProgress}%` }} transition={{ duration: 0.5 }} />
          </div>
          <p className="text-xs text-slate-400">{buildProgress}% — {buildLogs[buildLogs.length - 1] || 'Building...'}</p>
        </div>
      )}

      {buildStatus === 'building' && buildLogs.length > 0 && (
        <div className="max-h-32 overflow-y-auto bg-black/20 rounded-lg p-3 font-mono text-xs text-orange-400 space-y-0.5">
          {buildLogs.map((log, i) => <div key={i}>{'>'} {log}</div>)}
        </div>
      )}

      {buildStatus === 'success' && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-400 font-medium">APK built successfully!</span>
        </div>
      )}

      {buildStatus === 'failed' && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <XCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-400">{buildError}</span>
        </div>
      )}

      {buildStatus === 'idle' && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startBuild}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:from-orange-500 hover:to-amber-500 transition-all">
          <Rocket className="w-5 h-5" /> Build APK (Cloud)
        </motion.button>
      )}

      {buildStatus === 'building' && (
        <button disabled className="w-full py-3 rounded-xl bg-slate-200 dark:bg-white/5 text-slate-400 font-bold cursor-not-allowed flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Building APK...
        </button>
      )}

      {buildStatus === 'success' && downloadUrl && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={async () => {
            try {
              const res = await fetch(downloadUrl);
              if (res.redirected) { window.open(res.url, '_blank'); }
              else if (res.ok) { const data = await res.json(); if (data.downloadUrl) window.open(data.downloadUrl, '_blank'); }
              else { window.open(downloadUrl, '_blank'); }
            } catch { window.open(downloadUrl, '_blank'); }
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg flex items-center justify-center gap-2">
          <Download className="w-5 h-5" /> Download APK
        </motion.button>
      )}

      {buildStatus === 'failed' && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startBuild}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-lg flex items-center justify-center gap-2">
          <Rocket className="w-5 h-5" /> Retry Build
        </motion.button>
      )}
    </div>
  );
}

// Build a single HTML file with all screens + tab navigation
function buildFullAppHtml(screens: ScreenData[], appName: string, primaryColor: string): string {
  const hasHtmlScreens = screens.some(s => s.html);
  
  if (!hasHtmlScreens) {
    // Fallback for old-style screens
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${appName}</title></head><body style="font-family:system-ui;background:#0f172a;color:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh"><h1>${appName}</h1></body></html>`;
  }

  const tabHtml = screens.map((s, i) => 
    `<button onclick="showScreen(${i})" class="tab${i === 0 ? ' active' : ''}" id="tab-${i}">${s.icon || '📱'}<span>${s.name}</span></button>`
  ).join('\n        ');

  const screenFrames = screens.map((s, i) =>
    `<iframe id="screen-${i}" class="screen-frame${i === 0 ? ' active' : ''}" sandbox="allow-scripts allow-same-origin" srcdoc="${(s.html || '').replace(/"/g, '&quot;')}"></iframe>`
  ).join('\n      ');

  const letter = (appName || 'A').charAt(0).toUpperCase();
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="theme-color" content="${primaryColor}">
  <title>${appName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; overflow: hidden; height: 100vh; display: flex; flex-direction: column; }
    /* Splash screen */
    .splash { position: fixed; inset: 0; z-index: 999; background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd); display: flex; flex-direction: column; align-items: center; justify-content: center; transition: opacity 0.5s, transform 0.5s; }
    .splash.hidden { opacity: 0; transform: scale(1.1); pointer-events: none; }
    .splash-icon { width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold; color: #fff; backdrop-filter: blur(10px); margin-bottom: 16px; animation: splashPulse 1.5s ease-in-out infinite; }
    .splash-name { color: #fff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .splash-sub { color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 8px; }
    @keyframes splashPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .screen-container { flex: 1; position: relative; overflow: hidden; }
    .screen-frame { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; display: none; }
    .screen-frame.active { display: block; }
    .tab-bar { display: flex; background: #1e293b; border-top: 1px solid rgba(255,255,255,0.1); padding: 8px 0 env(safe-area-inset-bottom, 8px); }
    .tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 0; background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; transition: all 0.2s; }
    .tab.active { color: ${primaryColor}; transform: scale(1.1); }
    .tab span { font-size: 10px; font-weight: 500; }
  </style>
</head>
<body>
  <!-- Splash Screen -->
  <div class="splash" id="splash">
    <div class="splash-icon">${letter}</div>
    <div class="splash-name">${appName}</div>
    <div class="splash-sub">Built with SheruTools AI</div>
  </div>

  <div class="screen-container">
    ${screenFrames}
  </div>
  <nav class="tab-bar">
    ${tabHtml}
  </nav>
  <script>
    // Hide splash after 1.5s
    setTimeout(() => document.getElementById('splash').classList.add('hidden'), 1500);
    setTimeout(() => document.getElementById('splash').style.display = 'none', 2000);

    function showScreen(index) {
      document.querySelectorAll('.screen-frame').forEach((f, i) => f.classList.toggle('active', i === index));
      document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', i === index));
    }
  </script>
</body>
</html>`;
}

function generateDefaultScreenCode(name: string, color: string): string {
  const safeName = name.replace(/[^a-zA-Z0-9]/g, '');
  return `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function ${safeName}Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${name}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f1f5f9' },
});
`;
}
