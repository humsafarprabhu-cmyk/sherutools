'use client';

import { motion } from 'framer-motion';

interface Props {
  deviceType?: 'iphone' | 'android';
  children: React.ReactNode;
  className?: string;
}

export default function PhoneMockup({ deviceType = 'android', children, className = '' }: Props) {
  const isIphone = deviceType === 'iphone';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative inline-flex flex-col ${className}`}
    >
      {/* Phone frame */}
      <div className={`relative bg-slate-900 ${isIphone ? 'rounded-[3rem]' : 'rounded-[1.5rem]'} p-[3px] shadow-2xl shadow-black/40`}>
        <div className={`relative bg-black ${isIphone ? 'rounded-[2.8rem]' : 'rounded-[1.3rem]'} overflow-hidden`} style={{ width: 280, height: 560 }}>
          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 z-10 h-8 bg-black/80 backdrop-blur-sm flex items-center justify-between px-6 text-white text-[10px]">
            <span>9:41</span>
            {isIphone && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl" />
            )}
            {!isIphone && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 rounded-full border border-slate-700" />
            )}
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-white/60 rounded-sm relative">
                <div className="absolute inset-[1px] right-[2px] bg-green-400 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Screen content */}
          <div className="absolute inset-0 top-8 bottom-0 overflow-hidden bg-white dark:bg-slate-900">
            {children}
          </div>

          {/* Home indicator (iPhone) / Nav bar (Android) */}
          {isIphone ? (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
          ) : (
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-8">
              <div className="w-4 h-4 border-2 border-white/40 rounded-sm" />
              <div className="w-4 h-4 border-2 border-white/40 rounded-full" />
              <div className="w-0 h-0 border-l-[6px] border-l-white/40 border-y-[5px] border-y-transparent" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
