import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { 
  FileText, 
  Search, 
  Printer, 
  Calendar, 
  User as UserIcon, 
  Building2, 
  ArrowDownRight, 
  ArrowUpRight, 
  ArrowRightLeft, 
  Wrench,
  CheckCircle2
} from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenTxnModal: (type: 'RESTOCK' | 'ISSUE' | 'BORROW' | 'RETURN' | 'REPAIR') => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenTxnModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredTxns = transactions.filter((t) => {
    const matchesSearch =
      t.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.patientBed && t.patientBed.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.department && t.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            ประวัติการเบิก-จ่าย-ยืม-คืน-ส่งซ่อม (Transaction Audit Trail)
          </h2>
          <p className="text-xs text-slate-400">
            หอผู้ป่วยอายุรกรรมหญิง 8 ซ้าย (8LT) • บันทึกการเคลื่อนไหวทั้งหมด {transactions.length} รายการ
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrintReport}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl border border-slate-700 transition flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>พิมพ์รายงานส่งเวร</span>
          </button>

          <button
            onClick={() => onOpenTxnModal('ISSUE')}
            className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>+ ทำรายการเบิก/จ่าย</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="md:col-span-7 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อรายการ, ผู้ทำรายการ (พยาบาล/พนักงาน), เตียง/HN, หรือแผนก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Type Filter */}
        <div className="md:col-span-5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">ทุกประเภทการเคลื่อนไหว (All Types)</option>
            <option value="ISSUE">เบิกใช้ผู้ป่วย (Issue)</option>
            <option value="RESTOCK">รับเข้าสต็อก (Restock)</option>
            <option value="BORROW">ยืมไปต่างแผนก (Borrow)</option>
            <option value="RETURN">รับคืนพัสดุ (Return)</option>
            <option value="REPAIR">ส่งซ่อมบำรุง (Repair)</option>
          </select>
        </div>

      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 text-xs font-semibold border-b border-slate-700">
                <th className="py-3 px-4">วันเวลา</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">รายการพัสดุ/ครุภัณฑ์</th>
                <th className="py-3 px-4 text-center">จำนวน</th>
                <th className="py-3 px-4">ผู้ทำรายการ (Staff)</th>
                <th className="py-3 px-4">เตียง/HN หรือ แผนก</th>
                <th className="py-3 px-4">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลประวัติการทำรายการตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {t.timestamp}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full inline-flex items-center gap-1 ${
                        t.type === 'ISSUE' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        t.type === 'RESTOCK' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        t.type === 'BORROW' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        t.type === 'RETURN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {t.type === 'ISSUE' && <ArrowDownRight className="w-3 h-3" />}
                        {t.type === 'RESTOCK' && <ArrowUpRight className="w-3 h-3" />}
                        {t.type === 'BORROW' && <ArrowRightLeft className="w-3 h-3" />}
                        {t.type === 'RETURN' && <CheckCircle2 className="w-3 h-3" />}
                        {t.type === 'REPAIR' && <Wrench className="w-3 h-3" />}
                        
                        {t.type === 'ISSUE' ? 'เบิกใช้' :
                         t.type === 'RESTOCK' ? 'รับเข้า' :
                         t.type === 'BORROW' ? 'ยืมออก' :
                         t.type === 'RETURN' ? 'ส่งคืน' : 'ส่งซ่อม'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-200">
                      {t.itemName}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-teal-300">
                      {t.qty} {t.unit}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        <span>{t.staffName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {t.patientBed ? (
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
                          {t.patientBed}
                        </span>
                      ) : t.department ? (
                        <span className="bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-blue-900 text-[11px]">
                          {t.department}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 italic">
                      {t.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
