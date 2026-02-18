'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Sparkles, Eye, Paintbrush, Download, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import StepDescribe from '@/components/app-builder/StepDescribe';
import StepPreview from '@/components/app-builder/StepPreview';
import StepCustomize from '@/components/app-builder/StepCustomize';
import StepBuild from '@/components/app-builder/StepBuild';
import { ScreenData } from '@/components/app-builder/ScreenCard';
import FAQSection from '@/components/FAQSection';

const steps = [
  { icon: Sparkles, label: 'Describe' },
  { icon: Eye, label: 'Preview' },
  { icon: Paintbrush, label: 'Customize' },
  { icon: Download, label: 'Build' },
];

const faqs = [
  { question: 'How does the AI App Builder work?', answer: 'Describe your app idea in plain English, choose a template or go fully custom, and our AI generates a complete React Native/Expo project with multiple screens, navigation, and beautiful UI components. You can preview, customize, and download everything.' },
  { question: 'Do I need coding experience to use this?', answer: 'Not at all! The AI handles all the code generation. You just describe what you want, preview the screens visually in phone mockups, tweak colors and text, then download your complete project.' },
  { question: 'What do I get when I download?', answer: 'A complete Expo/React Native project ZIP with App.tsx, screen components, navigation setup, package.json, app.json, and a README with setup instructions. Run `npx expo start` and see your app instantly.' },
  { question: 'Can I build a real Android APK?', answer: 'Yes! Download the project and use Expo\'s EAS Build service, or wait for our upcoming one-click APK build feature (coming soon). Pro users will get APK builds included.' },
  { question: 'Is it free?', answer: 'The free tier gives you 1 app generation per day with up to 4 screens and full project download. Pro ($19.99/mo) unlocks unlimited apps, 8+ screens, APK building, custom icons, and more.' },
  { question: 'What technologies does the generated app use?', answer: 'Apps are built with React Native + Expo, React Navigation for screen navigation, and React Native Paper for beautiful Material Design UI components. Everything is TypeScript.' },
];

export default function AppBuilderPage() {
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState('');
  const [appName, setAppName] = useState('');
  const [template, setTemplate] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai-app-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, template, appName: appName || 'My App', primaryColor }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScreens(data.screens || []);
      setSelectedScreen(0);
      setStep(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-sm font-medium text-blue-500 dark:text-blue-400">
              <Smartphone className="w-4 h-4" /> AI-Powered App Builder
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white">
              Build Android Apps{' '}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Without Coding
              </span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Describe your app idea, AI generates beautiful screens with navigation.
              Preview in phone mockups, customize everything, download your Expo project.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Steps */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  i === step
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : i < step
                    ? 'bg-blue-500/10 text-blue-500 cursor-pointer hover:bg-blue-500/20'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                }`}
              >
                <s.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 rounded-full transition-colors ${i < step ? 'bg-blue-500' : 'bg-slate-200 dark:bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Back button */}
        {step > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setStep(step - 1)}
            className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </motion.button>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepDescribe
              key="describe"
              description={description}
              setDescription={setDescription}
              appName={appName}
              setAppName={setAppName}
              template={template}
              setTemplate={setTemplate}
              primaryColor={primaryColor}
              setPrimaryColor={setPrimaryColor}
              onGenerate={generate}
              loading={loading}
            />
          )}
          {step === 1 && (
            <StepPreview
              key="preview"
              screens={screens}
              selectedScreen={selectedScreen}
              setSelectedScreen={setSelectedScreen}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepCustomize
              key="customize"
              screens={screens}
              setScreens={setScreens}
              primaryColor={primaryColor}
              setPrimaryColor={setPrimaryColor}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepBuild
              key="build"
              screens={screens}
              appName={appName}
              primaryColor={primaryColor}
            />
          )}
        </AnimatePresence>
      </div>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <FAQSection faqs={faqs} />
      </section>
    </div>
  );
}
