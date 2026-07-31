import React from 'react';
import { AppTheme, ViewMode, FontDensity } from '../types';
import { 
  Palette, 
  LayoutGrid, 
  Table, 
  List, 
  X, 
  Check, 
  Sun, 
  Moon, 
  Maximize2, 
  Minimize2,
  Sparkles
} from 'lucide-react';

interface ThemeLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  currentViewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  currentDensity: FontDensity;
  onChangeDensity: (density: FontDensity) => void;
}

export const ThemeLayoutModal: React.FC<ThemeLayoutModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onChangeTheme,
  currentViewMode,
  onChangeViewMode,
  currentDensity,
  onChangeDensity,
}) => {
  if (!isOpen) return null;

  const themes: { id: AppTheme; name: string; desc: string; icon: string; previewBg: string; border: string }[] = [
    {
      id: 'DARK_TEAL',
      name: 'Dark Teal (เขียวเทา - มาตรฐาน 8LT)',
      desc: 'โทนสีมืดสบายตา เน้นสีเขียวมรกตและเทาดำ สำหรับการทำงานประจำวัน',
      icon: '🌙',
      previewBg: 'bg-slate-900 border-teal-500',
      border: 'border-teal-500',
    },
    {
      id: 'CLINICAL_LIGHT',
      name: 'Clinical Light (สว่างคลีนพยาบาล)',
      desc: 'โทนสีสว่างสะอาด อ่านง่าย ความคมชัดสูง สำหรับทำงานกลางวันและแท็บเล็ต',
      icon: '☀️',
      previewBg: 'bg-slate-100 border-teal-600',
      border: 'border-teal-600',
    },
    {
      id: 'OCEAN_NAVY',
      name: 'Ocean Navy (น้ำเงินเข้มเนวี)',
      desc: 'โทนสีน้ำเงินเนวีสุขุม ให้ความรู้สึกเรียบร้อยและเป็นทางการ',
      icon: '🌊',
      previewBg: 'bg-slate-950 border-blue-500',
      border: 'border-blue-500',
    },
    {
      id: 'EMERALD_NIGHT',
      name: 'Emerald Care (เขียวมรกตสดใส)',
      desc: 'โทนสีเขียวพยาบาลเข้ม เสริมความเน้นย้ำสถานะพัสดุชัดเจน',
      icon: '🌿',
      previewBg: 'bg-emerald-950 border-emerald-400',
      border: 'border-emerald-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-teal-500/10 text-teal-400 p-2.5 rounded-xl border border-teal-500/20">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>ปรับแต่งรูปแบบและธีมหน้าจอ (Layout & Theme)</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              เลือกโทนสี รูปแบบการแสดงรายการ และความหนาแน่นตัวอักษรตามความถนัด
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs">
          
          {/* Section 1: Color Themes */}
          <div>
            <label className="block text-slate-300 font-bold mb-3 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-teal-400" />
              <span>1. เลือกธีมสีของระบบ (Color Themes)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onChangeTheme(t.id)}
                  className={`cursor-pointer p-3 rounded-xl border transition flex items-start space-x-3 relative ${
                    currentTheme === t.id
                      ? 'bg-slate-800 border-teal-500 ring-2 ring-teal-500/30'
                      : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-xl">{t.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-200 flex items-center justify-between">
                      <span>{t.name}</span>
                      {currentTheme === t.id && (
                        <Check className="w-4 h-4 text-teal-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      {t.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: View Mode (Table vs Grid vs Compact) */}
          <div>
            <label className="block text-slate-300 font-bold mb-3 flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4 text-teal-400" />
              <span>2. รูปแบบการแสดงรายการพัสดุและครุภัณฑ์ (View Layout Mode)</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChangeViewMode('TABLE')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                  currentViewMode === 'TABLE'
                    ? 'bg-teal-600/20 border-teal-500 text-teal-300 font-bold ring-1 ring-teal-500'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table className="w-5 h-5 text-teal-400" />
                <span className="text-xs">มุมมองตาราง (Table)</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeViewMode('GRID')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                  currentViewMode === 'GRID'
                    ? 'bg-teal-600/20 border-teal-500 text-teal-300 font-bold ring-1 ring-teal-500'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-5 h-5 text-indigo-400" />
                <span className="text-xs">มุมมองการ์ด (Grid/Card)</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeViewMode('COMPACT')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                  currentViewMode === 'COMPACT'
                    ? 'bg-teal-600/20 border-teal-500 text-teal-300 font-bold ring-1 ring-teal-500'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <List className="w-5 h-5 text-emerald-400" />
                <span className="text-xs">รายการกะทัดรัด (Compact)</span>
              </button>
            </div>
          </div>

          {/* Section 3: Font & Spacing Density */}
          <div>
            <label className="block text-slate-300 font-bold mb-3 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-teal-400" />
              <span>3. ระดับความหนาแน่นข้อมูล (Display Density)</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChangeDensity('NORMAL')}
                className={`p-3 rounded-xl border transition flex items-center justify-between ${
                  currentDensity === 'NORMAL'
                    ? 'bg-slate-800 border-teal-500 text-teal-300 font-bold'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Maximize2 className="w-4 h-4 text-teal-400" />
                  <span>ระยะปกติ (Comfortable)</span>
                </div>
                {currentDensity === 'NORMAL' && <Check className="w-4 h-4 text-teal-400" />}
              </button>

              <button
                type="button"
                onClick={() => onChangeDensity('COMPACT')}
                className={`p-3 rounded-xl border transition flex items-center justify-between ${
                  currentDensity === 'COMPACT'
                    ? 'bg-slate-800 border-teal-500 text-teal-300 font-bold'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Minimize2 className="w-4 h-4 text-teal-400" />
                  <span>กะทัดรัด (Compact Text)</span>
                </div>
                {currentDensity === 'COMPACT' && <Check className="w-4 h-4 text-teal-400" />}
              </button>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-md"
          >
            เสร็จสิ้น
          </button>
        </div>

      </div>
    </div>
  );
};
