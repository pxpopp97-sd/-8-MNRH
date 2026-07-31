import React, { useState, useEffect } from 'react';
import { DurableEquipment, EquipmentCategory, EquipmentStatus, ViewMode } from '../types';
import { 
  Stethoscope, 
  Search, 
  Plus, 
  Filter, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  ArrowRightLeft,
  ShieldCheck,
  Table,
  LayoutGrid,
  List
} from 'lucide-react';

interface DurableEquipmentViewProps {
  equipment: DurableEquipment[];
  onAddEquipment: (newEq: Omit<DurableEquipment, 'id' | 'lastUpdated'>) => void;
  onEditEquipment: (eq: DurableEquipment) => void;
  onDeleteEquipmentRequest: (eqId: string, eqName: string) => void;
  onOpenTxnModal: (type: 'BORROW' | 'RETURN' | 'REPAIR', defaultType: 'EQUIPMENT', preselectedItemId?: string) => void;
  globalViewMode?: ViewMode;
}

export const DurableEquipmentView: React.FC<DurableEquipmentViewProps> = ({
  equipment,
  onAddEquipment,
  onEditEquipment,
  onDeleteEquipmentRequest,
  onOpenTxnModal,
  globalViewMode = 'TABLE',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [localViewMode, setLocalViewMode] = useState<ViewMode>(globalViewMode);

  useEffect(() => {
    setLocalViewMode(globalViewMode);
  }, [globalViewMode]);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DurableEquipment | null>(null);

  // Form Fields
  const [formAssetNo, setFormAssetNo] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<EquipmentCategory>('เครื่องมือตรวจและรักษา');
  const [formStatus, setFormStatus] = useState<EquipmentStatus>('NORMAL');
  const [formSerialNo, setFormSerialNo] = useState('');
  const [formDepartment, setFormDepartment] = useState('8LT-Bed01');
  const [formCalibrationDue, setFormCalibrationDue] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const categories: EquipmentCategory[] = [
    'เครื่องช่วยหายใจและระบบหายใจ',
    'เครื่องเฝ้าติดตามและกระตุกหัวใจ',
    'เครื่องให้สารน้ำและยาสวมฉีด',
    'ครุภัณฑ์เคลื่อนย้ายและเตียง',
    'เครื่องมือตรวจและรักษา',
  ];

  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'NORMAL':
        return {
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          text: 'พร้อมใช้งาน',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'IN_REPAIR':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          text: 'ส่งซ่อมบำรุง',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case 'BORROWED':
        return {
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          text: 'ถูกยืมไปต่างแผนก',
          icon: <ArrowRightLeft className="w-3.5 h-3.5" />,
        };
      case 'DAMAGED':
        return {
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          text: 'ชำรุดรอจำหน่าย',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      default:
        return {
          badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          text: status,
          icon: null,
        };
    }
  };

  // Filter Logic
  const filteredEquipment = equipment.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.assetNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormAssetNo(`MNRH-8LT-EQ${String(equipment.length + 1).padStart(3, '0')}`);
    setFormName('');
    setFormCategory('เครื่องมือตรวจและรักษา');
    setFormStatus('NORMAL');
    setFormSerialNo('');
    setFormDepartment('8LT-เคาน์เตอร์พยาบาล');
    setFormCalibrationDue('');
    setFormNotes('');
    setShowAddModal(true);
  };

  const openEditModal = (eq: DurableEquipment) => {
    setEditingItem(eq);
    setFormAssetNo(eq.assetNo);
    setFormName(eq.name);
    setFormCategory(eq.category);
    setFormStatus(eq.status);
    setFormSerialNo(eq.serialNo);
    setFormDepartment(eq.department);
    setFormCalibrationDue(eq.calibrationDue || '');
    setFormNotes(eq.notes || '');
    setShowAddModal(true);
  };

  const handleSubmitForm = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!formName.trim() || !formAssetNo.trim()) return;

    if (editingItem) {
      onEditEquipment({
        ...editingItem,
        assetNo: formAssetNo,
        name: formName,
        category: formCategory,
        status: formStatus,
        serialNo: formSerialNo,
        department: formDepartment,
        calibrationDue: formCalibrationDue || undefined,
        notes: formNotes,
        lastUpdated: new Date().toLocaleString('th-TH'),
      });
    } else {
      onAddEquipment({
        assetNo: formAssetNo,
        name: formName,
        category: formCategory,
        status: formStatus,
        serialNo: formSerialNo,
        department: formDepartment,
        calibrationDue: formCalibrationDue || undefined,
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
            <Stethoscope className="w-5 h-5 text-indigo-400" />
            ทะเบียนครุภัณฑ์ทางการแพทย์ (Durable Medical Assets)
          </h2>
          <p className="text-xs text-slate-400">
            หอผู้ป่วยอายุรกรรมหญิง 8 ซ้าย (8LT) • รายการทั้งหมด {equipment.length} เครื่อง
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ ทะเบียนครุภัณฑ์ใหม่</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อครุภัณฑ์, เลขครุภัณฑ์ (MNRH-8LT-EQ...), Serial No, หรือตำแหน่ง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3 relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none"
          >
            <option value="ALL">ทุกหมวดหมู่ครุภัณฑ์</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">ทุกสถานะ (All Status)</option>
            <option value="NORMAL">🟢 พร้อมใช้งาน (Normal)</option>
            <option value="IN_REPAIR">🟡 ส่งซ่อมบำรุง (In Repair)</option>
            <option value="BORROWED">🔵 ยืมไปต่างแผนก (Borrowed)</option>
            <option value="DAMAGED">🔴 ชำรุดรอจำหน่าย (Damaged)</option>
          </select>
        </div>

        {/* Quick View Mode Switcher */}
        <div className="md:col-span-2 flex items-center justify-end space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setLocalViewMode('TABLE')}
            title="มุมมองตาราง"
            className={`p-1.5 rounded-lg transition ${
              localViewMode === 'TABLE' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLocalViewMode('GRID')}
            title="มุมมองการ์ด"
            className={`p-1.5 rounded-lg transition ${
              localViewMode === 'GRID' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLocalViewMode('COMPACT')}
            title="มุมมองกะทัดรัด"
            className={`p-1.5 rounded-lg transition ${
              localViewMode === 'COMPACT' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

      </div>


      {/* Render Equipment according to localViewMode */}
      {filteredEquipment.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          ไม่พบข้อมูลครุภัณฑ์ทางการแพทย์ตามเงื่อนไข
        </div>
      ) : localViewMode === 'GRID' ? (
        /* GRID / CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((eq) => {
            const statusConfig = getStatusBadge(eq.status);
            return (
              <div key={eq.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400">{eq.assetNo}</span>
                      <h3 className="font-bold text-slate-100 text-sm">{eq.name}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${statusConfig.badge}`}>
                      {statusConfig.icon} {statusConfig.text}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{eq.location}</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-2.5 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>หมวดหมู่:</span>
                    <span className="text-slate-200">{eq.category}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>เช็คสภาพล่าสุด:</span>
                    <span className="text-slate-200">{eq.lastMaintenanceDate || '-'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(eq)}
                      className="text-slate-400 hover:text-amber-400 p-1 transition"
                      title="แก้ไข"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEquipmentRequest(eq.id, eq.name)}
                      className="text-slate-400 hover:text-rose-400 p-1 transition"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => onOpenTxnModal('BORROW', 'EQUIPMENT', eq.id)}
                      className="bg-blue-600/80 hover:bg-blue-500 text-white px-2 py-1 rounded-lg text-xs transition"
                    >
                      ยืม/คืน
                    </button>
                    <button
                      onClick={() => onOpenTxnModal('REPAIR', 'EQUIPMENT', eq.id)}
                      className="bg-amber-600/80 hover:bg-amber-500 text-white px-2 py-1 rounded-lg text-xs transition"
                    >
                      ส่งซ่อม
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
          {filteredEquipment.map((eq) => {
            const statusConfig = getStatusBadge(eq.status);
            return (
              <div key={eq.id} className="p-3 hover:bg-slate-800/40 transition flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusConfig.badge}`}>
                    {statusConfig.text}
                  </span>
                  <div>
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      <span>{eq.name}</span>
                      <span className="text-[10px] font-mono text-indigo-400">({eq.assetNo})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{eq.category}</span>
                      <span>•</span>
                      <span>{eq.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenTxnModal('BORROW', 'EQUIPMENT', eq.id)}
                    className="bg-blue-600/80 hover:bg-blue-500 text-white px-2 py-1 rounded-lg text-[11px] transition"
                  >
                    ยืม/คืน
                  </button>
                  <button
                    onClick={() => onOpenTxnModal('REPAIR', 'EQUIPMENT', eq.id)}
                    className="bg-amber-600/80 hover:bg-amber-500 text-white px-2 py-1 rounded-lg text-[11px] transition"
                  >
                    ส่งซ่อม
                  </button>
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
                  <th className="py-3 px-4">เลขครุภัณฑ์ / ชื่อเครื่อง</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4">ตำแหน่งปัจจุบัน / เตียง</th>
                  <th className="py-3 px-4">วันสอบเทียบ / เช็คสภาพ</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredEquipment.map((eq) => {
                  return (
                    <tr key={eq.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          {eq.name}
                        </div>
                        <div className="text-[11px] text-indigo-400 font-mono mt-0.5">
                          {eq.assetNo} • S/N: {eq.serialNo || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 text-[11px]">
                          {eq.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {eq.status === 'NORMAL' && (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> พร้อมใช้งาน
                          </span>
                        )}
                        {eq.status === 'IN_REPAIR' && (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-amber-400" /> ส่งซ่อมบำรุง
                          </span>
                        )}
                        {eq.status === 'BORROWED' && (
                          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
                            <ArrowRightLeft className="w-3 h-3 text-blue-400" /> ยืมไปต่างแผนก
                          </span>
                        )}
                        {eq.status === 'DAMAGED' && (
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-400" /> ชำรุดรอจำหน่าย
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{eq.department}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {eq.calibrationDue ? (
                          <span className="text-[11px] text-slate-300 inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            {eq.calibrationDue}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        {eq.status === 'NORMAL' && (
                          <>
                            <button
                              onClick={() => onOpenTxnModal('BORROW', 'EQUIPMENT', eq.id)}
                              className="bg-blue-600/80 hover:bg-blue-500 text-white p-1.5 rounded-lg text-[11px] transition inline-flex items-center gap-1"
                              title="ยืมออกไปแผนกอื่น"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">ยืมออก</span>
                            </button>

                            <button
                              onClick={() => onOpenTxnModal('REPAIR', 'EQUIPMENT', eq.id)}
                              className="bg-amber-600/80 hover:bg-amber-500 text-white p-1.5 rounded-lg text-[11px] transition inline-flex items-center gap-1"
                              title="ส่งซ่อม"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">ส่งซ่อม</span>
                            </button>
                          </>
                        )}

                        {(eq.status === 'BORROWED' || eq.status === 'IN_REPAIR') && (
                          <button
                            onClick={() => onOpenTxnModal('RETURN', 'EQUIPMENT', eq.id)}
                            className="bg-purple-600/80 hover:bg-purple-500 text-white p-1.5 rounded-lg text-[11px] transition inline-flex items-center gap-1"
                            title="รับคืนวอร์ด"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">รับคืนวอร์ด</span>
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(eq)}
                          className="text-slate-400 hover:text-amber-400 p-1.5 transition"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteEquipmentRequest(eq.id, eq.name)}
                          className="text-slate-400 hover:text-rose-400 p-1.5 transition"
                          title="ลบท้ายทะเบียน"
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

      {/* Add / Edit Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-400" />
              {editingItem ? 'แก้ไขข้อมูลครุภัณฑ์' : 'เพิ่มทะเบียนครุภัณฑ์ใหม่'}
            </h3>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">เลขครุภัณฑ์ (Asset No) *</label>
                  <input
                    type="text"
                    required
                    value={formAssetNo}
                    onChange={(e) => setFormAssetNo(e.target.value)}
                    placeholder="เช่น MNRH-8LT-EQ01"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">หมวดหมู่ครุภัณฑ์ *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as EquipmentCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
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
                <label className="block text-slate-300 font-medium mb-1">ชื่อเครื่อง / ชื่อครุภัณฑ์ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เครื่องช่วยหายใจ Hamilton-C1"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formSerialNo}
                    onChange={(e) => setFormSerialNo(e.target.value)}
                    placeholder="หมายเลขเครื่อง S/N"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">สถานะครุภัณฑ์ *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as EquipmentStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NORMAL">🟢 พร้อมใช้งาน (Normal)</option>
                    <option value="IN_REPAIR">🟡 ส่งซ่อมบำรุง (In Repair)</option>
                    <option value="BORROWED">🔵 ยืมไปต่างแผนก (Borrowed)</option>
                    <option value="DAMAGED">🔴 ชำรุดรอจำหน่าย (Damaged)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ตำแหน่งในวอร์ด / เตียง</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="เช่น 8LT-Bed04 หรือ เคาน์เตอร์"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">วันครบกำหนดสอบเทียบ (PM)</label>
                  <input
                    type="date"
                    value={formCalibrationDue}
                    onChange={(e) => setFormCalibrationDue(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">หมายเหตุเพิ่มเติม</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="เช่น สภาพพร้อมใช้ 100%..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
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
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl transition shadow"
                >
                  {editingItem ? 'บันทึกการแก้ไข' : 'บันทึกทะเบียน'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
