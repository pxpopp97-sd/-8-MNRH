import React from 'react';
import { MedicalSupply, DurableEquipment, Transaction } from '../types';
import { 
  Package, 
  Stethoscope, 
  AlertTriangle, 
  Wrench, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  Activity,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend, 
  CartesianGrid 
} from 'recharts';

interface DashboardViewProps {
  supplies: MedicalSupply[];
  equipment: DurableEquipment[];
  transactions: Transaction[];
  onOpenTxnModal: (type: 'RESTOCK' | 'ISSUE' | 'BORROW' | 'RETURN' | 'REPAIR', defaultType?: 'SUPPLY' | 'EQUIPMENT') => void;
  onNavigateToSupplies: () => void;
  onNavigateToEquipment: () => void;
  onOpenSheetsModal: () => void;
  isSheetConnected: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  supplies,
  equipment,
  transactions,
  onOpenTxnModal,
  onNavigateToSupplies,
  onNavigateToEquipment,
  onOpenSheetsModal,
  isSheetConnected,
}) => {
  // Calculations
  const lowStockSupplies = supplies.filter(s => s.stock <= s.minLevel);
  const expiringSupplies = supplies.filter(s => {
    if (!s.expiryDate) return false;
    const exp = new Date(s.expiryDate).getTime();
    const now = new Date().getTime();
    const diffDays = (exp - now) / (1000 * 3600 * 24);
    return diffDays <= 60 && diffDays >= 0;
  });

  const eqNormal = equipment.filter(e => e.status === 'NORMAL').length;
  const eqRepair = equipment.filter(e => e.status === 'IN_REPAIR').length;
  const eqBorrowed = equipment.filter(e => e.status === 'BORROWED').length;
  const eqDamaged = equipment.filter(e => e.status === 'DAMAGED').length;

  // Recharts Data 1: Stock vs Min Level
  const supplyChartData = supplies.slice(0, 8).map(s => ({
    name: s.name.length > 18 ? s.name.substring(0, 16) + '...' : s.name,
    คงเหลือ: s.stock,
    เกณฑ์ขั้นต่ำ: s.minLevel,
  }));

  // Recharts Data 2: Equipment Status Donut
  const equipmentStatusData = [
    { name: 'พร้อมใช้งาน', value: eqNormal, color: '#10B981' },
    { name: 'ส่งซ่อมบำรุง', value: eqRepair, color: '#F59E0B' },
    { name: 'ยืมไปต่างแผนก', value: eqBorrowed, color: '#3B82F6' },
    { name: 'ชำรุดรอจำหน่าย', value: eqDamaged, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Recharts Data 3: Transaction Type summary
  const txnTypeCounts = {
    ISSUE: transactions.filter(t => t.type === 'ISSUE').length,
    RESTOCK: transactions.filter(t => t.type === 'RESTOCK').length,
    BORROW: transactions.filter(t => t.type === 'BORROW').length,
    RETURN: transactions.filter(t => t.type === 'RETURN').length,
    REPAIR: transactions.filter(t => t.type === 'REPAIR').length,
  };

  const txnChartData = [
    { name: 'เบิกใช้ผู้ป่วย', count: txnTypeCounts.ISSUE, color: '#6366F1' },
    { name: 'รับเข้าสต็อก', count: txnTypeCounts.RESTOCK, color: '#10B981' },
    { name: 'ยืมไปแผนกอื่น', count: txnTypeCounts.BORROW, color: '#3B82F6' },
    { name: 'ส่งคืนพัสดุ', count: txnTypeCounts.RETURN, color: '#8B5CF6' },
    { name: 'ส่งซ่อมบำรุง', count: txnTypeCounts.REPAIR, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">

      {/* Sheet Integration Banner */}
      {!isSheetConnected && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/20 text-amber-400 p-2.5 rounded-xl border border-amber-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-200">
                ยังไม่ได้เชื่อมต่อ Google Sheets สำหรับซิงก์ข้อมูลอัตโนมัติ
              </h3>
              <p className="text-xs text-amber-300/80">
                ระบบกำลังใช้งานข้อมูลชั่วคราวในเครื่อง คุณสามารถเชื่อมต่อ Google Sheets เพื่อบันทึกข้อมูลเข้า Google Drive วอร์ด 8 ซ้ายได้ทันที
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSheetsModal}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-2 whitespace-nowrap shadow-md"
          >
            <span>เชื่อมต่อ Google Sheets ตอนนี้</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Action Shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            แดชบอร์ดสรุปยอดพัสดุและครุภัณฑ์ (Real-time Dashboard)
          </h2>
          <p className="text-xs text-slate-400">
            หอผู้ป่วยอายุรกรรมหญิง 8 ซ้าย (8LT) • โรงพยาบาลมหาราชนครราชสีมา
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenTxnModal('ISSUE', 'SUPPLY')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>เบิกใช้พัสดุ</span>
          </button>

          <button
            onClick={() => onOpenTxnModal('RESTOCK', 'SUPPLY')}
            className="bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>รับเข้าสต็อก</span>
          </button>

          <button
            onClick={() => onOpenTxnModal('BORROW', 'EQUIPMENT')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
          >
            <Stethoscope className="w-4 h-4" />
            <span>บันทึกการยืมครุภัณฑ์</span>
          </button>

          <button
            onClick={() => onOpenTxnModal('REPAIR', 'EQUIPMENT')}
            className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
          >
            <Wrench className="w-4 h-4" />
            <span>ส่งซ่อมครุภัณฑ์</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Supplies */}
        <div 
          onClick={onNavigateToSupplies}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 rounded-2xl p-5 cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">รายการพัสดุการแพทย์</span>
            <div className="bg-teal-500/10 text-teal-400 p-2.5 rounded-xl border border-teal-500/20 group-hover:scale-105 transition">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">{supplies.length}</span>
            <span className="text-xs text-slate-400 font-medium">รายการในคลัง</span>
          </div>
          <div className="mt-3 text-[11px] text-teal-400 flex items-center gap-1 font-medium">
            <span>ดูรายการพัสดุทั้งหมด</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Low Stock Warning */}
        <div 
          onClick={onNavigateToSupplies}
          className={`bg-slate-900/80 hover:bg-slate-850 border rounded-2xl p-5 cursor-pointer transition shadow-sm group ${
            lowStockSupplies.length > 0 ? 'border-rose-500/40' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">พัสดุวิกฤต / เหลือน้อย</span>
            <div className={`p-2.5 rounded-xl border group-hover:scale-105 transition ${
              lowStockSupplies.length > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-3xl font-bold tracking-tight ${lowStockSupplies.length > 0 ? 'text-rose-400' : 'text-white'}`}>
              {lowStockSupplies.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">ต้องรีบเบิกเพิ่ม</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>ใกล้หมดอายุ ({expiringSupplies.length})</span>
            <span className="text-rose-400 font-semibold">เช็คสต็อกด่วน</span>
          </div>
        </div>

        {/* Card 3: Total Equipment */}
        <div 
          onClick={onNavigateToEquipment}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 rounded-2xl p-5 cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">ครุภัณฑ์ทางการแพทย์</span>
            <div className="bg-indigo-500/10 text-indigo-400 p-2.5 rounded-xl border border-indigo-500/20 group-hover:scale-105 transition">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white tracking-tight">{equipment.length}</span>
            <span className="text-xs text-slate-400 font-medium">เครื่องทั้งหมด</span>
          </div>
          <div className="mt-3 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>พร้อมใช้ {eqNormal} เครื่อง</span>
          </div>
        </div>

        {/* Card 4: Equipment In Repair & Borrowed */}
        <div 
          onClick={onNavigateToEquipment}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 rounded-2xl p-5 cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">สถานะไม่อยู่ในวอร์ด</span>
            <div className="bg-amber-500/10 text-amber-400 p-2.5 rounded-xl border border-amber-500/20 group-hover:scale-105 transition">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-amber-400 tracking-tight">{eqRepair + eqBorrowed}</span>
            <span className="text-xs text-slate-400 font-medium">เครื่อง</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>ส่งซ่อม ({eqRepair})</span>
            <span>ยืมออก ({eqBorrowed})</span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Stock vs Threshold (8 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-400" />
                ระดับพัสดุการแพทย์เทียบกับจุดสั่งเบิก (Stock vs Min Level)
              </h3>
              <p className="text-xs text-slate-400">
                แสดงจำนวนคงเหลือเทียบกับเกณฑ์ขั้นต่ำ 8 รายการแรก
              </p>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="คงเหลือ" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="เกณฑ์ขั้นต่ำ" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Equipment Status Donut (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-indigo-400" />
                สัดส่วนสถานะครุภัณฑ์ วอร์ด 8 ซ้าย
              </h3>
              <p className="text-xs text-slate-400">
                จำแนกตามสถานะความพร้อมใช้งาน
              </p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={equipmentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {equipmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Critical Stock Alert & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Low Stock Alert Box (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold text-white">แจ้งเตือนพัสดุวิกฤต/ใกล้หมด</h3>
            </div>
            <span className="bg-rose-500/20 text-rose-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-500/30">
              {lowStockSupplies.length} รายการ
            </span>
          </div>

          {lowStockSupplies.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              พัสดุการแพทย์ทุกรายการคงเหลืออยู่ในระดับปกติ
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {lowStockSupplies.map(s => (
                <div key={s.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{s.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ที่เก็บ: {s.location} • เกณฑ์: {s.minLevel} {s.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-rose-400">{s.stock}</span>
                    <span className="text-[11px] text-slate-400 ml-1">{s.unit}</span>
                    <button
                      onClick={() => onOpenTxnModal('RESTOCK', 'SUPPLY')}
                      className="block text-[10px] text-teal-400 hover:text-teal-300 underline font-medium mt-0.5"
                    >
                      + เบิกเพิ่ม
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Log (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-bold text-white">รายการเคลื่อนไหวล่าสุด (Recent Log)</h3>
            </div>
            <span className="text-xs text-slate-400">อัปเดต Real-time</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md mt-0.5 ${
                    t.type === 'ISSUE' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                    t.type === 'RESTOCK' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    t.type === 'BORROW' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    t.type === 'RETURN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {t.type === 'ISSUE' ? 'เบิกใช้' :
                     t.type === 'RESTOCK' ? 'รับเข้า' :
                     t.type === 'BORROW' ? 'ยืมออก' :
                     t.type === 'RETURN' ? 'ส่งคืน' : 'ส่งซ่อม'}
                  </span>

                  <div>
                    <div className="text-xs font-semibold text-slate-200">{t.itemName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      โดย: {t.staffName} {t.patientBed ? `• เตียง/HN: ${t.patientBed}` : ''} {t.department ? `• แผนก: ${t.department}` : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">
                    {t.qty} {t.unit}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {t.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
