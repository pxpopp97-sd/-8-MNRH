import React, { useState, useEffect } from 'react';
import { MedicalSupply, DurableEquipment, TransactionType } from '../types';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  ArrowRightLeft, 
  Wrench, 
  CheckCircle2, 
  X,
  Building2,
  User,
  Bed
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplies: MedicalSupply[];
  equipment: DurableEquipment[];
  defaultType?: TransactionType;
  defaultItemType?: 'SUPPLY' | 'EQUIPMENT';
  preselectedItemId?: string;
  onSubmitTransaction: (txnData: {
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
  }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  supplies,
  equipment,
  defaultType = 'ISSUE',
  defaultItemType = 'SUPPLY',
  preselectedItemId,
  onSubmitTransaction,
}) => {
  const [txnType, setTxnType] = useState<TransactionType>(defaultType);
  const [itemType, setItemType] = useState<'SUPPLY' | 'EQUIPMENT'>(defaultItemType);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<string>('ชิ้น');
  const [staffName, setStaffName] = useState<string>('พว.สมหญิง ใจดี (RN 8LT)');
  const [patientBed, setPatientBed] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    setTxnType(defaultType);
    setItemType(defaultItemType);
    if (preselectedItemId) {
      setSelectedItemId(preselectedItemId);
    } else if (defaultItemType === 'SUPPLY' && supplies.length > 0) {
      setSelectedItemId(supplies[0].id);
      setUnit(supplies[0].unit);
    } else if (defaultItemType === 'EQUIPMENT' && equipment.length > 0) {
      setSelectedItemId(equipment[0].id);
      setUnit('เครื่อง');
    }
  }, [defaultType, defaultItemType, preselectedItemId, supplies, equipment]);

  // When selectedItemId changes, auto update unit
  const handleItemChange = (id: string) => {
    setSelectedItemId(id);
    if (itemType === 'SUPPLY') {
      const sup = supplies.find(s => s.id === id);
      if (sup) setUnit(sup.unit);
    } else {
      setUnit('เครื่อง');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let itemName = '';
    if (itemType === 'SUPPLY') {
      const sup = supplies.find(s => s.id === selectedItemId);
      itemName = sup ? sup.name : 'พัสดุการแพทย์';
    } else {
      const eq = equipment.find(e => e.id === selectedItemId);
      itemName = eq ? `${eq.name} (${eq.assetNo})` : 'ครุภัณฑ์';
    }

    onSubmitTransaction({
      type: txnType,
      itemType,
      itemId: selectedItemId,
      itemName,
      qty,
      unit,
      staffName,
      patientBed: patientBed.trim() || undefined,
      department: department.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {txnType === 'ISSUE' && <ArrowDownRight className="w-5 h-5 text-indigo-400" />}
            {txnType === 'RESTOCK' && <ArrowUpRight className="w-5 h-5 text-teal-400" />}
            {txnType === 'BORROW' && <ArrowRightLeft className="w-5 h-5 text-blue-400" />}
            {txnType === 'RETURN' && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
            {txnType === 'REPAIR' && <Wrench className="w-5 h-5 text-amber-400" />}
            
            <span>
              {txnType === 'ISSUE' ? 'บันทึกการเบิกใช้พัสดุ (Issue)' :
               txnType === 'RESTOCK' ? 'บันทึกรับเข้าสต็อก (Restock)' :
               txnType === 'BORROW' ? 'บันทึกยืมพัสดุ/ครุภัณฑ์ (Borrow)' :
               txnType === 'RETURN' ? 'บันทึกการรับคืน (Return)' : 'บันทึกส่งซ่อมบำรุง (Repair)'}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            หอผู้ป่วยอายุรกรรมหญิง 8 ซ้าย • ซิงก์ข้อมูลอัตโนมัติเข้า Google Sheets
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Item Type Switcher (Supply vs Equipment) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setItemType('SUPPLY');
                if (supplies.length > 0) handleItemChange(supplies[0].id);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                itemType === 'SUPPLY' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              พัสดุทางการแพทย์ (Supplies)
            </button>
            <button
              type="button"
              onClick={() => {
                setItemType('EQUIPMENT');
                if (equipment.length > 0) handleItemChange(equipment[0].id);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                itemType === 'EQUIPMENT' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ครุภัณฑ์ทางการแพทย์ (Equipment)
            </button>
          </div>

          {/* Select Item */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              เลือก{itemType === 'SUPPLY' ? 'พัสดุการแพทย์' : 'ครุภัณฑ์'} *
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => handleItemChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
            >
              {itemType === 'SUPPLY'
                ? supplies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (คงเหลือ {s.stock} {s.unit}) - {s.code}
                    </option>
                  ))
                : equipment.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} [{e.assetNo}] - สถานะ: {e.status}
                    </option>
                  ))}
            </select>
          </div>

          {/* Qty & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">จำนวน *</label>
              <input
                type="number"
                min={1}
                required
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value || '1', 10))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">หน่วยนับ *</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Staff Name */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">ชื่อผู้ทำรายการ (พยาบาล/พนักงานวอร์ด) *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="เช่น พว.สมหญิง ใจดี (RN 8LT)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Patient Bed / HN (For ISSUE or BORROW) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">เตียงผู้ป่วย / HN (ถ้ามี)</label>
              <div className="relative">
                <Bed className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={patientBed}
                  onChange={(e) => setPatientBed(e.target.value)}
                  placeholder="เช่น 8LT-Bed04 หรือ HN 640192"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">แผนกที่เกี่ยวข้อง (ถ้ามี)</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="เช่น หอ 8 ขวา / ศูนย์ซ่อม"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">หมายเหตุเพิ่มเติม</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ระบุวัตถุประสงค์ หรือรายละเอียดเพิ่มเติม..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2 rounded-xl transition shadow"
            >
              บันทึกรายการทันที
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
