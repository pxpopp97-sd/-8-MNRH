import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  MedicalSupply, 
  DurableEquipment, 
  Transaction, 
  GoogleSheetConfig,
  TransactionType,
  AppTheme,
  ViewMode,
  FontDensity 
} from './types';
import { 
  INITIAL_SUPPLIES, 
  INITIAL_EQUIPMENT, 
  INITIAL_TRANSACTIONS 
} from './data/initialData';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './services/firebaseAuth';
import { 
  initGoogleSheet, 
  syncToGoogleSheet, 
  loadFromGoogleSheet 
} from './services/sheetsClient';

import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MedicalSuppliesView } from './components/MedicalSuppliesView';
import { DurableEquipmentView } from './components/DurableEquipmentView';
import { TransactionsView } from './components/TransactionsView';
import { TransactionModal } from './components/TransactionModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { UserConfirmationModal } from './components/UserConfirmationModal';
import { ThemeLayoutModal } from './components/ThemeLayoutModal';

import { 
  LayoutDashboard, 
  Package, 
  Stethoscope, 
  FileText, 
  FileSpreadsheet, 
  Building2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'supplies' | 'equipment' | 'transactions'>('dashboard');

  // Core App Data
  const [supplies, setSupplies] = useState<MedicalSupply[]>(INITIAL_SUPPLIES);
  const [equipment, setEquipment] = useState<DurableEquipment[]>(INITIAL_EQUIPMENT);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // User Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Google Sheets Config State
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>({
    spreadsheetId: null,
    spreadsheetUrl: null,
    isConnected: false,
    lastSynced: null,
    autoSyncEnabled: true,
    autoSyncIntervalSec: 30,
    syncing: false,
    error: null,
  });

  // Theme and Layout Customization State
  const [appTheme, setAppTheme] = useState<AppTheme>('DARK_TEAL');
  const [viewMode, setViewMode] = useState<ViewMode>('TABLE');
  const [fontDensity, setFontDensity] = useState<FontDensity>('NORMAL');
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Modal Controls
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  
  // Transaction Modal State
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [txnModalDefaultType, setTxnModalDefaultType] = useState<TransactionType>('ISSUE');
  const [txnModalDefaultItemType, setTxnModalDefaultItemType] = useState<'SUPPLY' | 'EQUIPMENT'>('SUPPLY');
  const [txnModalPreselectedId, setTxnModalPreselectedId] = useState<string | undefined>(undefined);

  // User Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // 1. Initialize Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Google Login Handler
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        showToast(`ยินดีต้อนรับ ${result.user.displayName || result.user.email} (โรงพยาบาลมหาราชนครราชสีมา)`);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      showToast('เกิดข้อผิดพลาดในการเข้าสู่ระบบ Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 3. Google Logout Handler
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setSheetConfig((prev) => ({ ...prev, isConnected: false, spreadsheetId: null, spreadsheetUrl: null }));
    showToast('ออกจากระบบแล้ว');
  };

  // 4. Initialize / Create Google Sheet
  const handleInitSheet = async () => {
    if (!getAccessToken()) {
      showToast('กรุณาเข้าสู่ระบบ Google Auth ก่อนดำเนินการ');
      return;
    }

    setSheetConfig((prev) => ({ ...prev, syncing: true, error: null }));
    try {
      const result = await initGoogleSheet(supplies, equipment, transactions);
      setSheetConfig((prev) => ({
        ...prev,
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
        isConnected: true,
        lastSynced: new Date().toLocaleString('th-TH'),
        syncing: false,
      }));
      showToast('สร้างและเชื่อมต่อ Google Sheet สำเร็จเรียบร้อย!');
    } catch (err: any) {
      console.error('Init Sheet error:', err);
      setSheetConfig((prev) => ({ ...prev, syncing: false, error: err.message }));
      showToast(`ไม่สามารถสร้าง Sheet: ${err.message}`);
    }
  };

  // 5. Manual / Auto Sync Handler
  const handleSyncToSheet = useCallback(async () => {
    if (!sheetConfig.spreadsheetId || !sheetConfig.isConnected || !getAccessToken()) return;

    setSheetConfig((prev) => ({ ...prev, syncing: true }));
    try {
      const res = await syncToGoogleSheet(sheetConfig.spreadsheetId, supplies, equipment, transactions);
      setSheetConfig((prev) => ({
        ...prev,
        syncing: false,
        lastSynced: res.syncedAt,
      }));
    } catch (err: any) {
      console.error('Sync error:', err);
      setSheetConfig((prev) => ({ ...prev, syncing: false, error: err.message }));
    }
  }, [sheetConfig.spreadsheetId, sheetConfig.isConnected, supplies, equipment, transactions]);

  // 6. Load Data from manual Sheet ID
  const handleLoadFromSheet = async (sheetId: string) => {
    if (!getAccessToken()) {
      showToast('กรุณาเข้าสู่ระบบ Google Auth');
      return;
    }
    setSheetConfig((prev) => ({ ...prev, syncing: true }));
    try {
      const data = await loadFromGoogleSheet(sheetId);
      if (data.supplies.length > 0) setSupplies(data.supplies);
      if (data.equipment.length > 0) setEquipment(data.equipment);
      if (data.transactions.length > 0) setTransactions(data.transactions);

      setSheetConfig((prev) => ({
        ...prev,
        spreadsheetId: sheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
        isConnected: true,
        lastSynced: new Date().toLocaleString('th-TH'),
        syncing: false,
      }));
      showToast('โหลดข้อมูลจาก Google Sheet สำเร็จ!');
      setShowSheetsModal(false);
    } catch (err: any) {
      console.error('Load Sheet error:', err);
      setSheetConfig((prev) => ({ ...prev, syncing: false }));
      showToast(`โหลด Sheet ล้มเหลว: ${err.message}`);
    }
  };

  // 7. Auto Sync Interval Timer
  useEffect(() => {
    if (!sheetConfig.autoSyncEnabled || !sheetConfig.isConnected || !sheetConfig.spreadsheetId) {
      return;
    }

    const intervalMs = (sheetConfig.autoSyncIntervalSec || 30) * 1000;
    const timer = setInterval(() => {
      handleSyncToSheet();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [sheetConfig.autoSyncEnabled, sheetConfig.isConnected, sheetConfig.spreadsheetId, sheetConfig.autoSyncIntervalSec, handleSyncToSheet]);

  // --- Core CRUD Handlers ---

  // Add Supply
  const handleAddSupply = (newSup: Omit<MedicalSupply, 'id' | 'lastUpdated'>) => {
    const id = `SUP-${String(supplies.length + 1).padStart(3, '0')}`;
    const fullSup: MedicalSupply = {
      ...newSup,
      id,
      lastUpdated: new Date().toLocaleString('th-TH'),
    };
    setSupplies((prev) => [fullSup, ...prev]);
    showToast(`เพิ่มพัสดุ "${fullSup.name}" เรียบร้อยแล้ว`);

    // Add log
    const newTxn: Transaction = {
      id: `TXN-${Date.now()}`,
      timestamp: new Date().toLocaleString('th-TH'),
      type: 'RESTOCK',
      itemType: 'SUPPLY',
      itemId: fullSup.id,
      itemName: fullSup.name,
      qty: fullSup.stock,
      unit: fullSup.unit,
      staffName: 'เจ้าหน้าที่พัสดุ 8 ซ้าย',
      notes: 'เพิ่มรายการใหม่ในระบบ',
    };
    setTransactions((prev) => [newTxn, ...prev]);
  };

  // Edit Supply
  const handleEditSupply = (updated: MedicalSupply) => {
    setSupplies((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast(`แก้ไขพัสดุ "${updated.name}" เรียบร้อย`);
  };

  // Delete Supply (with confirmation)
  const handleDeleteSupplyRequest = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: `ยืนยันลบพัสดุการแพทย์ "${name}"`,
      message: `คุณกำลังจะลบรายการพัสดุนี้ออกจากระบบ ข้อมูลใน Google Sheet จะถูกอัปเดตตามด้วย คุณแน่ใจหรือไม่?`,
      isDanger: true,
      onConfirm: () => {
        setSupplies((prev) => prev.filter((s) => s.id !== id));
        showToast(`ลบพัสดุ "${name}" ออกจากคลังแล้ว`);
      },
    });
  };

  // Add Equipment
  const handleAddEquipment = (newEq: Omit<DurableEquipment, 'id' | 'lastUpdated'>) => {
    const id = `EQ-${String(equipment.length + 1).padStart(3, '0')}`;
    const fullEq: DurableEquipment = {
      ...newEq,
      id,
      lastUpdated: new Date().toLocaleString('th-TH'),
    };
    setEquipment((prev) => [fullEq, ...prev]);
    showToast(`ลงทะเบียนครุภัณฑ์ "${fullEq.name}" เรียบร้อยแล้ว`);
  };

  // Edit Equipment
  const handleEditEquipment = (updated: DurableEquipment) => {
    setEquipment((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    showToast(`อัปเดตครุภัณฑ์ "${updated.name}" เรียบร้อย`);
  };

  // Delete Equipment Request
  const handleDeleteEquipmentRequest = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: `ยืนยันลบแท่นครุภัณฑ์ "${name}"`,
      message: `การลบทเบียนครุภัณฑ์นี้จะมีผลถาวรในตารางข้อมูล 8 ซ้าย คุณแน่ใจหรือไม่?`,
      isDanger: true,
      onConfirm: () => {
        setEquipment((prev) => prev.filter((e) => e.id !== id));
        showToast(`ลบครุภัณฑ์ "${name}" เรียบร้อย`);
      },
    });
  };

  // Execute Transaction (เบิก-จ่าย-ยืม-คืน-ส่งซ่อม)
  const handleExecuteTransaction = (txnData: {
    type: TransactionType;
    itemType: 'SUPPLY' | 'EQUIPMENT';
    itemId: string;
    itemName: string;
    qty: number;
    unit: string;
    staffName: string;
    patientBed?: string;
    department?: string;
    notes?: string;
  }) => {
    const newTxn: Transaction = {
      id: `TXN-${Date.now()}`,
      timestamp: new Date().toLocaleString('th-TH'),
      ...txnData,
    };

    // Update Supplies / Equipment state
    if (txnData.itemType === 'SUPPLY') {
      setSupplies((prev) =>
        prev.map((s) => {
          if (s.id === txnData.itemId) {
            let newStock = s.stock;
            if (txnData.type === 'ISSUE') newStock = Math.max(0, s.stock - txnData.qty);
            else if (txnData.type === 'RESTOCK') newStock = s.stock + txnData.qty;
            else if (txnData.type === 'RETURN') newStock = s.stock + txnData.qty;

            return {
              ...s,
              stock: newStock,
              lastUpdated: new Date().toLocaleString('th-TH'),
            };
          }
          return s;
        })
      );
    } else {
      // Equipment Status update
      setEquipment((prev) =>
        prev.map((e) => {
          if (e.id === txnData.itemId) {
            let newStatus = e.status;
            let newDept = e.department;

            if (txnData.type === 'BORROW') {
              newStatus = 'BORROWED';
              if (txnData.department) newDept = `ยืมไป ${txnData.department}`;
            } else if (txnData.type === 'REPAIR') {
              newStatus = 'IN_REPAIR';
              newDept = 'ศูนย์ซ่อมบำรุง (ส่งซ่อม)';
            } else if (txnData.type === 'RETURN') {
              newStatus = 'NORMAL';
              newDept = '8LT-เคาน์เตอร์พยาบาล (คืนวอร์ดแล้ว)';
            }

            return {
              ...e,
              status: newStatus,
              department: newDept,
              lastUpdated: new Date().toLocaleString('th-TH'),
            };
          }
          return e;
        })
      );
    }

    setTransactions((prev) => [newTxn, ...prev]);
    showToast(`บันทึกรายการ "${txnData.itemName}" สำเร็จ`);
  };

  // Helper to trigger transaction modal with default parameters
  const openTxnModal = (
    type: TransactionType,
    itemType: 'SUPPLY' | 'EQUIPMENT' = 'SUPPLY',
    preselectedId?: string
  ) => {
    setTxnModalDefaultType(type);
    setTxnModalDefaultItemType(itemType);
    setTxnModalPreselectedId(preselectedId);
    setShowTxnModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-teal-600 text-white font-medium text-xs px-4 py-3 rounded-2xl shadow-2xl border border-teal-400/40 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* App Header */}
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        sheetConfig={sheetConfig}
        onManualSync={handleSyncToSheet}
        onOpenSheetsModal={() => setShowSheetsModal(true)}
        onOpenThemeModal={() => setShowThemeModal(true)}
        isLoggingIn={isLoggingIn}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ภาพรวมและ Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('supplies')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'supplies'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>คลังพัสดุการแพทย์ ({supplies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'equipment'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>ทะเบียนครุภัณฑ์ ({equipment.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ประวัติเบิก-จ่าย-ยืม ({transactions.length})</span>
          </button>

        </div>

        {/* View Content Rendering */}
        {activeTab === 'dashboard' && (
          <DashboardView
            supplies={supplies}
            equipment={equipment}
            transactions={transactions}
            onOpenTxnModal={openTxnModal}
            onNavigateToSupplies={() => setActiveTab('supplies')}
            onNavigateToEquipment={() => setActiveTab('equipment')}
            onOpenSheetsModal={() => setShowSheetsModal(true)}
            isSheetConnected={sheetConfig.isConnected}
          />
        )}

        {activeTab === 'supplies' && (
          <MedicalSuppliesView
            supplies={supplies}
            onAddSupply={handleAddSupply}
            onEditSupply={handleEditSupply}
            onDeleteSupplyRequest={handleDeleteSupplyRequest}
            onOpenTxnModal={openTxnModal}
            globalViewMode={viewMode}
          />
        )}

        {activeTab === 'equipment' && (
          <DurableEquipmentView
            equipment={equipment}
            onAddEquipment={handleAddEquipment}
            onEditEquipment={handleEditEquipment}
            onDeleteEquipmentRequest={handleDeleteEquipmentRequest}
            onOpenTxnModal={openTxnModal}
            globalViewMode={viewMode}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            onOpenTxnModal={openTxnModal}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-teal-400" />
            <span className="font-medium text-slate-300">
              หอผู้ป่วยอายุรกรรมหญิง 8 ซ้าย (Ward 8LT) • โรงพยาบาลมหาราชนครราชสีมา
            </span>
          </div>
          <div>
            ระบบเชื่อมโยง Google Sheets & Real-time Auto-Sync • {new Date().getFullYear()}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={showTxnModal}
        onClose={() => setShowTxnModal(false)}
        supplies={supplies}
        equipment={equipment}
        defaultType={txnModalDefaultType}
        defaultItemType={txnModalDefaultItemType}
        preselectedItemId={txnModalPreselectedId}
        onSubmitTransaction={handleExecuteTransaction}
      />

      <GoogleSheetsModal
        isOpen={showSheetsModal}
        onClose={() => setShowSheetsModal(false)}
        config={sheetConfig}
        onInitSheet={handleInitSheet}
        onManualSync={handleSyncToSheet}
        onLoadFromSheet={handleLoadFromSheet}
        onUpdateAutoSyncInterval={(sec) => setSheetConfig((prev) => ({ ...prev, autoSyncIntervalSec: sec }))}
        onToggleAutoSync={(enabled) => setSheetConfig((prev) => ({ ...prev, autoSyncEnabled: enabled }))}
        isAuthenticated={!!user}
        onLogin={handleLogin}
      />

      <UserConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
      />

      <ThemeLayoutModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentTheme={appTheme}
        onChangeTheme={(theme) => setAppTheme(theme)}
        currentViewMode={viewMode}
        onChangeViewMode={(mode) => setViewMode(mode)}
        currentDensity={fontDensity}
        onChangeDensity={(density) => setFontDensity(density)}
      />


    </div>
  );
}
