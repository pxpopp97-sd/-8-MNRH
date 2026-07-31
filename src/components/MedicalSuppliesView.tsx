import React, { useState, useEffect } from 'react';
import { MedicalSupply, SupplyCategory, ViewMode } from '../types';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  ArrowDownRight, 
  ArrowUpRight,
  MapPin,
  Calendar,
  Table,
  LayoutGrid,
  List
} from 'lucide-react';

interface MedicalSuppliesViewProps {
  supplies: MedicalSupply[];
  onAddSupply: (newSupply: Omit<MedicalSupply, 'id' | 'lastUpdated'>) => void;
  onEditSupply: (supply: MedicalSupply) => void;
  onDeleteSupplyRequest: (supplyId: string, supplyName: string) => void;
  onOpenTxnModal: (type: 'RESTOCK' | 'ISSUE', defaultType: 'SUPPLY', preselectedItemId?: string) => void;
  globalViewMode?: ViewMode;
}

export const MedicalSuppliesView: React.FC<MedicalSuppliesViewProps> = ({
  supplies,
  onAddSupply,
  onEditSupply,
  onDeleteSupplyRequest,
  onOpenTxnModal,
  globalViewMode = 'TABLE',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'EXPIRING'>('ALL');
  const [localViewMode, setLocalViewMode] = useState<ViewMode>(globalViewMode);

  useEffect(() => {
    setLocalViewMode(globalViewMode);
  }, [globalViewMode]);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicalSupply | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<SupplyCategory>('วัสดุสิ้นเปลืองทั่วไป');
  const [formStock, setFormStock] = useState<number>(10);
  const [formUnit, setFormUnit] = useState('ชิ้น');
  const [formMinLevel, setFormMinLevel] = useState<number>(20);
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formLocation, setFormLocation] = useState('ตู้ A1 (ห้องพัสดุ 8 ซ้าย)');
  const [formNotes, setFormNotes] = useState('');

  const categories: SupplyCategory[] = [
    'ชุดทำแผลและสเตอไรด์',
    'สายและอุปกรณ์ระบาย',
    'อุปกรณ์ให้สารน้ำและยา',
    'อุปกรณ์ระบบทางเดินหายใจ',
    'วัสดุสิ้นเปลืองทั่วไป',
  ];

  // Filter Logic
  const filteredSupplies = supplies.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'LOW') {
      matchesStock = s.stock <= s.minLevel;
    } else if (stockFilter === 'EXPIRING') {
      if (!s.expiryDate) matchesStock = false;
      else {
        const exp = new Date(s.expiryDate).getTime();
        const now = new Date().getTime();
        const diffDays = (exp - now) / (1000 * 3600 * 24);
        matchesStock = diffDays <= 60;
      }
    }

    return matchesSearch && matchesCat && matchesStock;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormCode(`8LT-MED-${String(supplies.length + 1).padStart(3, '0')}`);
    setFormName('');
    setFormCategory('วัสดุสิ้นเปลืองทั่วไป');
    setFormStock(50);
    setFormUnit('ชิ้น');
    setFormMinLevel(20);
    setFormExpiryDate('');
    setFormLocation('ตู้ A1 (ห้องพัสดุ 8 ซ้าย)');
    setFormNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (s: MedicalSupply) => {
    setEditingItem(s);
    setFormCode(s.code);
    setFormName(s.name);
    setFormCategory(s.category);
    setFormStock(s.stock);
    setFormUnit(s.unit);
    setFormMinLevel(s.minLevel);
    setFormExpiryDate(s.expiryDate || '');
    setFormLocation(s.location);
    setFormNotes(s.notes || '');
    setShowAddModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    if (editingItem) {
      onEditSupply({
        ...editingItem,
        code: formCode,
        name: formName,
        category: formCategory,
        stock: formStock,
        unit: formUnit,
        minLevel: formMinLevel,
        expiryDate: formExpiryDate || undefined,
        location: formLocation,
        notes: formNotes,
        lastUpdated: new Date().toLocaleString('th-TH'),
      });
    } else {
      onAddSupply({
        code: formCode,
        name: formName,
        category: formCategory,
        stock: formStock,
        unit: formUnit,
        minLevel: formMinLevel,
        expiryDate: formExpiryDate || undefined,
        location: formLocation,
        notes: formNotes,
      });
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-400" />
            คลังพัสดุทางการแพทย์ (Medical Supplies Inventory)
          </h2>
          <p className="text-xs text-slate-400">
            หอผู้ป่วยอายุรกรรมหญิง 8 ซ้าย (8LT) • รายการทั้งหมด {supplies.length} รายการ
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มรายการพัสดุใหม่</span>
        </button>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อพัสดุ, รหัสพัสดุ, หรือสถานที่เก็บ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3 relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 appearance-none"
          >
            <option value="ALL">ทุกหมวดหมู่พัสดุ</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Alert Filter Toggle Buttons */}
        <div className="md:col-span-3 flex items-center justify-end space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setStockFilter('ALL')}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition ${
              stockFilter === 'ALL' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setStockFilter('LOW')}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition ${
              stockFilter === 'LOW' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            สต็อกต่ำ
          </button>
          <button
            onClick={() => setStockFilter('EXPIRING')}
            className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition ${
              stockFilter === 'EXPIRING' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ใกล้หมดอายุ
          </button>
        </div>

        {/* Quick View Mode Switcher */}
        <div className="md:col-span-2 flex items-center justify-end space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setLocalViewMode('TABLE')}
            title="มุมมองตาราง"
            className={`p-1.5 rounded-lg transition ${
              localViewMode === 'TABLE' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLocalViewMode('GRID')}
            title="มุมมองการ์ด"
            className={`p-1.5 rounded-lg transition ${
              localViewMode === 'GRID' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLocalViewMode('COMPACT')}
            title="มุมมองกะทัดรัด"
            className={`p-1.5 rounded-lg transition ${
              localViewMode === 'COMPACT' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

      </div>


      {/* Render Supplies according to localViewMode */}
      {filteredSupplies.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          ไม่พบข้อมูลพัสดุการแพทย์ตามเงื่อนไขที่ค้นหา
        </div>
      ) : localViewMode === 'GRID' ? (
        /* GRID / CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSupplies.map((s) => {
            const isLow = s.stock <= s.minLevel;
            return (
              <div key={s.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-teal-400/90">{s.code}</span>
                      <h3 className="font-bold text-slate-100 text-sm">{s.name}</h3>
                    </div>
                    {isLow && (
                      <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3 h-3" /> สต็อกต่ำ
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{s.location}</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">คงเหลือ</span>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {s.stock}
                    </span>
                    <span className="text-xs text-slate-400"> / {s.minLevel} {s.unit}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(s)}
                      className="text-slate-400 hover:text-amber-400 p-1 transition"
                      title="แก้ไข"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSupplyRequest(s.id, s.name)}
                      className="text-slate-400 hover:text-rose-400 p-1 transition"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => onOpenTxnModal('ISSUE', 'SUPPLY', s.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg text-xs transition font-semibold"
                    >
                      เบิกใช้
                    </button>
                    <button
                      onClick={() => onOpenTxnModal('RESTOCK', 'SUPPLY', s.id)}
                      className="bg-teal-600 hover:bg-teal-500 text-white px-2.5 py-1 rounded-lg text-xs transition font-semibold"
                    >
                      เติมสต็อก
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : localViewMode === 'COMPACT' ? (
        /* COMPACT LIST VIEW */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden">
          {filteredSupplies.map((s) => {
            const isLow = s.stock <= s.minLevel;
            return (
              <div key={s.id} className="p-3 hover:bg-slate-800/40 transition flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isLow ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <div>
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      <span>{s.name}</span>
                      <span className="text-[10px] font-mono text-teal-400/80">({s.code})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{s.category}</span>
                      <span>•</span>
                      <span>{s.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>{s.stock}</span>
                    <span className="text-slate-400 text-[11px]"> {s.unit}</span>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => onOpenTxnModal('ISSUE', 'SUPPLY', s.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded-lg text-[11px] transition"
                    >
                      เบิก
                    </button>
                    <button
                      onClick={() => onOpenTxnModal('RESTOCK', 'SUPPLY', s.id)}
                      className="bg-teal-600 hover:bg-teal-500 text-white px-2 py-1 rounded-lg text-[11px] transition"
                    >
                      เติม
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (DEFAULT) */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 text-xs font-semibold border-b border-slate-700">
                  <th className="py-3 px-4">รหัส / พัสดุ</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4 text-center">คงเหลือ / เกณฑ์</th>
                  <th className="py-3 px-4">สถานที่เก็บ</th>
                  <th className="py-3 px-4">วันหมดอายุ</th>
                  <th className="py-3 px-4 text-right">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredSupplies.map((s) => {
                  const isLow = s.stock <= s.minLevel;
                  let expStatus: 'NORMAL' | 'WARN' | 'EXPIRED' = 'NORMAL';
                  if (s.expiryDate) {
                    const diffDays = (new Date(s.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
                    if (diffDays < 0) expStatus = 'EXPIRED';
                    else if (diffDays <= 60) expStatus = 'WARN';
                  }

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          {s.name}
                          {isLow && (
                            <span className="bg-rose-500/20 text-rose-300 text-[10px] px-1.5 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> สต็อกต่ำ
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-teal-400/80 font-mono mt-0.5">
                          {s.code} {s.notes ? `• ${s.notes}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 text-[11px]">
                          {s.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-baseline space-x-1">
                          <span className={`text-base font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {s.stock}
                          </span>
                          <span className="text-slate-400 text-[11px]">/ {s.minLevel} {s.unit}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{s.location}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {s.expiryDate ? (
                          <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium ${
                            expStatus === 'EXPIRED' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            expStatus === 'WARN' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'text-slate-300'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {s.expiryDate}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => onOpenTxnModal('ISSUE', 'SUPPLY', s.id)}
                          className="bg-indigo-600/80 hover:bg-indigo-500 text-white p-1.5 rounded-lg text-[11px] transition inline-flex items-center gap-1"
                          title="เบิกใช้ผู้ป่วย"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">เบิกใช้</span>
                        </button>

                        <button
                          onClick={() => onOpenTxnModal('RESTOCK', 'SUPPLY', s.id)}
                          className="bg-teal-600/80 hover:bg-teal-500 text-white p-1.5 rounded-lg text-[11px] transition inline-flex items-center gap-1"
                          title="เติมสต็อก"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">เติมสต็อก</span>
                        </button>

                        <button
                          onClick={() => openEditModal(s)}
                          className="text-slate-400 hover:text-amber-400 p-1.5 transition"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteSupplyRequest(s.id, s.name)}
                          className="text-slate-400 hover:text-rose-400 p-1.5 transition"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Supply Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-400" />
              {editingItem ? 'แก้ไขข้อมูลพัสดุการแพทย์' : 'เพิ่มรายการพัสดุการแพทย์ใหม่'}
            </h3>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">รหัสพัสดุ *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">หมวดหมู่ *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as SupplyCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ชื่อพัสดุการแพทย์ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สายดูดเสมหะ (Suction Catheter) #14"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">คงเหลือเริ่มต้น</label>
                  <input
                    type="number"
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(parseInt(e.target.value || '0', 10))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">หน่วยนับ</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="เส้น, ชิ้น, กล่อง"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">เกณฑ์ขั้นต่ำ (เตือน)</label>
                  <input
                    type="number"
                    min={1}
                    value={formMinLevel}
                    onChange={(e) => setFormMinLevel(parseInt(e.target.value || '1', 10))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">สถานที่เก็บใน 8 ซ้าย</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="เช่น ตู้ A1 ชั้น 2"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">วันหมดอายุ (ถ้ามี)</label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">หมายเหตุเพิ่มเติม</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="รายละเอียดเพิ่มเติม..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2 rounded-xl transition shadow"
                >
                  {editingItem ? 'บันทึกการแก้ไข' : 'บันทึกเพิ่มพัสดุ'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
