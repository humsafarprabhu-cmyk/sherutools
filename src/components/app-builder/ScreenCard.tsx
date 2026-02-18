'use client';

import { motion } from 'framer-motion';
import { Edit3, Trash2, GripVertical } from 'lucide-react';
import PhoneMockup from './PhoneMockup';

export interface ScreenData {
  name: string;
  code: string;
  preview: string; // HTML string for preview
  html?: string;   // Full HTML document for WebView/iframe
  icon?: string;   // Emoji icon for tab bar
}

interface Props {
  screen: ScreenData;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ScreenCard({ screen, index, isSelected, onSelect, onEdit, onDelete }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      onClick={onSelect}
      className={`relative cursor-pointer group transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 rounded-2xl' : ''}`}
    >
      {/* Drag handle */}
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab">
        <GripVertical className="w-4 h-4 text-slate-400" />
      </div>

      <PhoneMockup className="transform scale-[0.55] origin-top-left">
        <div
          className="w-full h-full overflow-hidden text-[10px]"
          dangerouslySetInnerHTML={{ __html: screen.preview }}
        />
      </PhoneMockup>

      {/* Screen name & actions */}
      <div className="mt-[-140px] relative z-10 px-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{screen.name}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
