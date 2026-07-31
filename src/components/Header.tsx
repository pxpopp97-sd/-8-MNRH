import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { GoogleSheetConfig, AppTheme, ViewMode } from '../types';
import { 
  Building2, 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  User as UserIcon, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Palette
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  sheetConfig: GoogleSheetConfig;
  onManualSync: () => void;
  onOpenSheetsModal: () => void;
  onOpenThemeModal: () => void;
  isLoggingIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  sheetConfig,
  onManualSync,
  onOpenSheetsModal,
  onOpenThemeModal,
  isLoggingIn = false,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('th-TH', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Ward & Hospital Identity */}
          <div className="flex items-center space-x-3">
            <div className="bg-teal-600/90 text-white p-2.5 rounded-xl shadow-md border border-teal-500/30 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  8 ซ้าย (8LT)
                </span>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {timeStr}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                ระบบจัดการพัสดุการแพทย์และครุภัณฑ์
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                หอผู้ป่วยอายุรกรรมหญิง 8 ซ้าย • โรงพยาบาลมหาราชนครราชสีมา
              </p>
            </div>
          </div>

          {/* Controls & Sync Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Google Sheets Status Badge */}
            <div 
              onClick={onOpenSheetsModal}
              className="cursor-pointer bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center space-x-2 text-xs transition-colors"
              title="ตั้งค่าและดูสถานะ Google Sheets"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <div className="flex items-center space-x-1 font-medium text-slate-200">
                  <span>Google Sheets</span>
                  {sheetConfig.syncing ? (
                    <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  ) : sheetConfig.isConnected ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-slate-400" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400">
                  {sheetConfig.syncing
                    ? 'กำลังซิงก์...'
                    : sheetConfig.isConnected
                    ? `ซิงก์แล้ว ${sheetConfig.lastSynced || ''}`
                    : 'คลิกเพื่อเชื่อมต่อ'}
                </div>
              </div>
            </div>

            {/* Quick Sync Button */}
            {sheetConfig.isConnected && (
              <button
                onClick={onManualSync}
                disabled={sheetConfig.syncing}
                className="bg-teal-700 hover:bg-teal-600 text-white p-2 rounded-lg text-xs font-medium transition flex items-center space-x-1 disabled:opacity-50"
                title="กดซิงก์ทันทีเข้า Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sheetConfig.syncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">ซิงก์ทันที</span>
              </button>
            )}

            {/* Open Spreadsheet Button */}
            {sheetConfig.spreadsheetUrl && (
              <a
                href={sheetConfig.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-700/80 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5"
                title="เปิดไฟล์ Google Sheet"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">เปิด Sheet</span>
              </a>
            )}

            {/* Theme & Layout Switcher Button */}
            <button
              onClick={onOpenThemeModal}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
              title="ปรับแต่งสีและรูปแบบการแสดงผล"
            >
              <Palette className="w-4 h-4 text-teal-400" />
              <span>ปรับรูปแบบ</span>
            </button>

            {/* User Account / Google Sign-in */}
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full border border-teal-400" />
                ) : (
                  <UserIcon className="w-4 h-4 text-teal-300" />
                )}
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-teal-400 font-mono">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="text-slate-400 hover:text-rose-400 p-1 transition"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-medium px-3 py-1.5 rounded-lg text-xs transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.74-2.1-6.68-4.93H1.28v3.15C3.25 21.3 7.31 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12c0 1.95.46 3.79 1.28 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.58l4.04 3.15c.94-2.83 3.58-4.98 6.68-4.98z"/>
                </svg>
                <span>{isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบ Google'}</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
