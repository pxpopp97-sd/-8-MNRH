export type SupplyCategory = 
  | 'ชุดทำแผลและสเตอไรด์' // Wound dressing & sterile
  | 'สายและอุปกรณ์ระบาย' // Tubes & Drainage (Suction, Foley, NG)
  | 'อุปกรณ์ให้สารน้ำและยา' // IV & Medication (IV set, Syringe, Needle)
  | 'อุปกรณ์ระบบทางเดินหายใจ' // Respiratory (O2 mask, Cannula, Trach)
  | 'วัสดุสิ้นเปลืองทั่วไป'; // General Consumables (Gauze, Tape, Gloves)

export type EquipmentCategory = 
  | 'เครื่องช่วยหายใจและระบบหายใจ' // Ventilator & Respiratory
  | 'เครื่องเฝ้าติดตามและกระตุกหัวใจ' // Monitor & AED
  | 'เครื่องให้สารน้ำและยาสวมฉีด' // Infusion & Syringe Pump
  | 'ครุภัณฑ์เคลื่อนย้ายและเตียง' // Patient Bed & Transport
  | 'เครื่องมือตรวจและรักษา'; // Diagnostic & Surgical

export type EquipmentStatus = 'NORMAL' | 'IN_REPAIR' | 'BORROWED' | 'DAMAGED';

export type TransactionType = 'RESTOCK' | 'ISSUE' | 'BORROW' | 'RETURN' | 'REPAIR';

export interface MedicalSupply {
  id: string;
  code: string; // รหัสพัสดุ
  name: string; // ชื่อพัสดุการแพทย์
  category: SupplyCategory;
  stock: number; // จำนวนคงเหลือ
  unit: string; // หน่วยนับ (กล่อง, ชิ้น, เส้น, ถุง)
  minLevel: number; // จุดสั่งเบิก/เกณฑ์ต่ำสุด
  expiryDate?: string; // วันหมดอายุ (YYYY-MM-DD)
  location: string; // ตู้/ชั้นเก็บใน 8 ซ้าย
  notes?: string;
  lastUpdated: string;
}

export interface DurableEquipment {
  id: string;
  assetNo: string; // เลขครุภัณฑ์ (เช่น MNRH-8LT-EQ01)
  name: string; // ชื่อครุภัณฑ์
  category: EquipmentCategory;
  status: EquipmentStatus;
  serialNo: string;
  department: string; // แผนกปัจจุบัน/เตียง (เช่น 8LT-Bed05 หรือ ยืมไป 8ขวา)
  calibrationDue?: string; // วันกำหนดสอบเทียบ/เช็คสภาพ
  notes?: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  timestamp: string; // ISO String หรือ YYYY-MM-DD HH:mm
  type: TransactionType;
  itemType: 'SUPPLY' | 'EQUIPMENT';
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
  staffName: string; // พยาบาล/ผู้ปฏิบัติงาน
  patientBed?: string; // เตียงผู้ป่วย/HN
  department?: string; // แผนกที่ยืมไป
  notes?: string;
}

export interface GoogleSheetConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  isConnected: boolean;
  lastSynced: string | null;
  autoSyncEnabled: boolean;
  autoSyncIntervalSec: number;
  syncing: boolean;
  error?: string | null;
}

export interface WardStats {
  totalSupplies: number;
  lowStockCount: number;
  expiringSoonCount: number;
  totalEquipment: number;
  equipmentNormal: number;
  equipmentInRepair: number;
  equipmentBorrowed: number;
  equipmentDamaged: number;
}

export type AppTheme = 'DARK_TEAL' | 'CLINICAL_LIGHT' | 'OCEAN_NAVY' | 'EMERALD_NIGHT';
export type ViewMode = 'TABLE' | 'GRID' | 'COMPACT';
export type FontDensity = 'NORMAL' | 'COMPACT';
