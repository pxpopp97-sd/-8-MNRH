import React, { useState } from 'react';
import { GoogleSheetConfig } from '../types';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clock, 
  Layers, 
  Sparkles,
  Lock
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetConfig;
  onInitSheet: () => Promise<void>;
  onManualSync: () => Promise<void>;
  onLoadFromSheet: (sheetId: string) => Promise<void>;
  onUpdateAutoSyncInterval: (intervalSec: number) => void;
  onToggleAutoSync: (enabled: boolean) => void;
  isAuthenticated: boolean;
  onLogin: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  config,
  onInitSheet,
  onManualSync,
  onLoadFromSheet,
  onUpdateAutoSyncInterval,
  onToggleAutoSync,
  isAuthenticated,
  onLogin,
}) => {
  const [manualSheetId, setManualSheetId] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  if (!isOpen) return null;

  const handleInit = async () => {
    setLoadingAction(true);
    try {
      await onInitSheet();
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSyncNow = async () => {
    setLoadingAction(true);
    try {
      await onManualSync();
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLoadManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSheetId.trim()) return;
    setLoadingAction(true);
    try {
      await onLoadFromSheet(manualSheetId.trim());
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">ตั้งค่าการซิงก์ Google Sheets แบบอัตโนมัติ</h3>
            <p className="text-xs text-slate-400">
              หอผู้ป่วยอายุรกรรมหญิง 8 ซ้าย • โรงพยาบาลมหาราชนครราชสีมา
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 text-center my-4">
            <Lock className="w-8 h-8 text-teal-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-white mb-1">กรุณาเข้าสู่ระบบด้วย Google Account</h4>
            <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
              เพื่อสร้างและอัปเดตไฟล์ Google Sheet ใน Google Drive ของคุณโดยอัตโนมัติ
            </p>
            <button
              onClick={onLogin}
              className="bg-white hover:bg-slate-100 text-slate-900 font-semibold px-4 py-2 rounded-xl text-xs transition inline-flex items-center space-x-2 shadow"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.74-2.1-6.68-4.93H1.28v3.15C3.25 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12c0 1.95.46 3.79 1.28 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.58l4.04 3.15c.94-2.83 3.58-4.98 6.68-4.98z"/>
              </svg>
              <span>เข้าสู่ระบบ Google Auth</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            
            {/* Connection Status Card */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 font-medium">สถานะการเชื่อมต่อ</span>
                {config.isConnected ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> เชื่อมต่อแล้ว
                  </span>
                ) : (
                  <span className="bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> ยังไม่เชื่อมต่อ
                  </span>
                )}
              </div>

              {config.spreadsheetUrl && (
                <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400 truncate max-w-[220px]">
                    ID: {config.spreadsheetId}
                  </span>
                  <a
                    href={config.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <span>เปิดไฟล์ Google Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {config.lastSynced && (
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>ซิงก์ข้อมูลล่าสุด: {config.lastSynced}</span>
                </div>
              )}
            </div>

            {/* Auto Create / Auto Initialize Button */}
            {!config.isConnected ? (
              <div className="space-y-3">
                <button
                  onClick={handleInit}
                  disabled={loadingAction}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>
                    {loadingAction
                      ? 'กำลังสร้างและเตรียมไฟล์ Google Sheet...'
                      : 'สร้างไฟล์ Google Sheet อัตโนมัติ (1-Click Setup)'}
                  </span>
                </button>

                <div className="relative text-center my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <span className="relative bg-slate-900 px-3 text-[11px] text-slate-500">หรือดึงข้อมูลจาก Sheet ID เดิม</span>
                </div>

                <form onSubmit={handleLoadManual} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ใส่ Google Spreadsheet ID (เช่น 1BxiM...)"
                    value={manualSheetId}
                    onChange={(e) => setManualSheetId(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
                  >
                    ดึงข้อมูล
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Manual Sync Button */}
                <button
                  onClick={handleSyncNow}
                  disabled={loadingAction || config.syncing}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${config.syncing ? 'animate-spin' : ''}`} />
                  <span>{config.syncing ? 'กำลังซิงก์ข้อมูล...' : 'สั่งซิงก์ข้อมูลลง Sheet ทันที (Manual Sync)'}</span>
                </button>

                {/* Auto Sync Settings */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">เปิดซิงก์อัตโนมัติ (Auto-Sync)</div>
                      <div className="text-[11px] text-slate-400">ซิงก์ยอดพัสดุและประวัติเบิกทุกระยะเวลาที่กำหนด</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.autoSyncEnabled}
                      onChange={(e) => onToggleAutoSync(e.target.checked)}
                      className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
                    />
                  </div>

                  {config.autoSyncEnabled && (
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-slate-400">ความถี่ในการซิงก์:</span>
                      <select
                        value={config.autoSyncIntervalSec}
                        onChange={(e) => onUpdateAutoSyncInterval(parseInt(e.target.value, 10))}
                        className="bg-slate-900 border border-slate-700 text-teal-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                      >
                        <option value={15}>ทุก 15 วินาที (Real-time)</option>
                        <option value={30}>ทุก 30 วินาที</option>
                        <option value={60}>ทุก 1 นาที</option>
                        <option value={300}>ทุก 5 นาที</option>
                      </select>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Structure Info */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1 mb-1">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                โครงสร้างแผ่นงานใน Google Sheet (4 แท็บ):
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li><span className="text-slate-200 font-mono">Overview_Dashboard</span>: แดชบอร์ดสรุปยอดรวม</li>
                <li><span className="text-slate-200 font-mono">Medical_Supplies</span>: ตารางทะเบียนพัสดุการแพทย์</li>
                <li><span className="text-slate-200 font-mono">Durable_Equipment</span>: ทะเบียนและสถานะครุภัณฑ์</li>
                <li><span className="text-slate-200 font-mono">Transactions_Log</span>: ประวัติการเบิก-จ่าย-ยืม-คืน-ซ่อม</li>
              </ul>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
