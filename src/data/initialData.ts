import { MedicalSupply, DurableEquipment, Transaction } from '../types';

export const INITIAL_SUPPLIES: MedicalSupply[] = [
  {
    id: 'SUP-001',
    code: '8LT-MED-001',
    name: 'สายดูดเสมหะ (Suction Catheter) #14',
    category: 'สายและอุปกรณ์ระบาย',
    stock: 45,
    unit: 'เส้น',
    minLevel: 50,
    expiryDate: '2027-05-15',
    location: 'ตู้ A1 ชั้น 2 (ห้องพัสดุ 8 ซ้าย)',
    notes: 'ใช้บ่อยในผู้ป่วย Tracheostomy',
    lastUpdated: '2026-07-30 08:30'
  },
  {
    id: 'SUP-002',
    code: '8LT-MED-002',
    name: 'สายดูดเสมหะ (Suction Catheter) #12',
    category: 'สายและอุปกรณ์ระบาย',
    stock: 120,
    unit: 'เส้น',
    minLevel: 40,
    expiryDate: '2027-06-20',
    location: 'ตู้ A1 ชั้น 2 (ห้องพัสดุ 8 ซ้าย)',
    notes: 'สำรองพร้อมใช้',
    lastUpdated: '2026-07-30 09:15'
  },
  {
    id: 'SUP-003',
    code: '8LT-MED-003',
    name: 'สายสวนปัสสาวะ Foley Catheter 2-way #16',
    category: 'สายและอุปกรณ์ระบาย',
    stock: 18,
    unit: 'เส้น',
    minLevel: 25,
    expiryDate: '2026-09-10',
    location: 'ตู้ A2 ชั้น 1',
    notes: 'สต็อกเหลือน้อย ใกล้ถึงจุดสั่งซื้อ',
    lastUpdated: '2026-07-29 14:00'
  },
  {
    id: 'SUP-004',
    code: '8LT-MED-004',
    name: 'ถุงมือสเตอไรด์ (Sterile Gloves) Size M',
    category: 'ชุดทำแผลและสเตอไรด์',
    stock: 80,
    unit: 'คู่',
    minLevel: 60,
    expiryDate: '2027-11-01',
    location: 'ตู้ B1 ชั้น 3',
    notes: 'ใช้สำหรับทำ Dressing และหัตถการ sterile',
    lastUpdated: '2026-07-30 07:45'
  },
  {
    id: 'SUP-005',
    code: '8LT-MED-005',
    name: 'ชุดให้สารน้ำ IV Infusion Set',
    category: 'อุปกรณ์ให้สารน้ำและยา',
    stock: 150,
    unit: 'ชุด',
    minLevel: 50,
    expiryDate: '2028-01-15',
    location: 'ตู้ C1 ชั้น 1',
    notes: 'มาตรฐานโรงพยาบาลมหาราช',
    lastUpdated: '2026-07-30 10:00'
  },
  {
    id: 'SUP-006',
    code: '8LT-MED-006',
    name: 'กระบอกฉีดยา Syringe 50 ml (Catheter Tip)',
    category: 'อุปกรณ์ให้สารน้ำและยา',
    stock: 12,
    unit: 'ชิ้น',
    minLevel: 30,
    expiryDate: '2026-08-15',
    location: 'ตู้ C2 ชั้น 2',
    notes: 'ใช้สำหรับ Feed อาหารผู้ป่วย NG Tube - เตือนใกล้หมดและใกล้หมดอายุ',
    lastUpdated: '2026-07-30 11:20'
  },
  {
    id: 'SUP-007',
    code: '8LT-MED-007',
    name: 'หน้ากากออกซิเจนพร้อมถุงสำรอง (O2 Mask with Bag)',
    category: 'อุปกรณ์ระบบทางเดินหายใจ',
    stock: 22,
    unit: 'ชุด',
    minLevel: 15,
    expiryDate: '2027-08-30',
    location: 'ตู้ D1 ชั้น 1 (ห้องฉุกเฉิน 8 ซ้าย)',
    notes: 'เตรียมพร้อมสำหรับผู้ป่วย Hypoxia',
    lastUpdated: '2026-07-28 16:30'
  },
  {
    id: 'SUP-008',
    code: '8LT-MED-008',
    name: 'สายให้ออกซิเจนทางรูจมูก (Nasal Cannula)',
    category: 'อุปกรณ์ระบบทางเดินหายใจ',
    stock: 65,
    unit: 'เส้น',
    minLevel: 30,
    expiryDate: '2027-12-10',
    location: 'ตู้ D1 ชั้น 2',
    notes: 'พร้อมใช้งาน',
    lastUpdated: '2026-07-30 09:00'
  },
  {
    id: 'SUP-009',
    code: '8LT-MED-009',
    name: 'ผ้าก๊อซทำแผล Sterile Gauze Pads 4x4 นิ้ว',
    category: 'ชุดทำแผลและสเตอไรด์',
    stock: 210,
    unit: 'ซอง',
    minLevel: 100,
    expiryDate: '2027-03-31',
    location: 'ตู้ B2 ชั้น 1',
    notes: 'บรรจุซองละ 5 ชิ้น',
    lastUpdated: '2026-07-30 08:00'
  },
  {
    id: 'SUP-010',
    code: '8LT-MED-010',
    name: 'พลาสเตอร์เยื่อกระดาษ Micropore 1 นิ้ว',
    category: 'วัสดุสิ้นเปลืองทั่วไป',
    stock: 35,
    unit: 'ม้วน',
    minLevel: 20,
    expiryDate: '2028-05-01',
    location: 'ตู้ E1 ชั้น 1',
    notes: 'ใช้ยึดติดสาย IV และแผลทำสะอาด',
    lastUpdated: '2026-07-29 11:10'
  }
];

export const INITIAL_EQUIPMENT: DurableEquipment[] = [
  {
    id: 'EQ-001',
    assetNo: 'MNRH-8LT-EQ001',
    name: 'เครื่องช่วยหายใจชนิดควบคุมด้วยปริมาตรและแรงดัน (Ventilator Hamilton-C1)',
    category: 'เครื่องช่วยหายใจและระบบหายใจ',
    status: 'NORMAL',
    serialNo: 'HM-884920',
    department: '8LT-Bed04 (ไอซียู/เคสหนัก)',
    calibrationDue: '2026-11-15',
    notes: 'ตรวจสอบการทำงานประจำเวรเช้า สมบูรณ์ 100%',
    lastUpdated: '2026-07-30 08:00'
  },
  {
    id: 'EQ-002',
    assetNo: 'MNRH-8LT-EQ002',
    name: 'เครื่องวัดสัญญาณชีพและออกซิเจนในเลือด (Vital Sign Monitor Edan iM8)',
    category: 'เครื่องเฝ้าติดตามและกระตุกหัวใจ',
    status: 'NORMAL',
    serialNo: 'ED-992104',
    department: '8LT-Bed02',
    calibrationDue: '2026-10-01',
    notes: 'แบตเตอรี่สำรองใช้งานได้ปกติ',
    lastUpdated: '2026-07-30 07:30'
  },
  {
    id: 'EQ-003',
    assetNo: 'MNRH-8LT-EQ003',
    name: 'เครื่องให้สารน้ำทางหลอดเลือดดำ (Infusion Pump Terumo TE-171)',
    category: 'เครื่องให้สารน้ำและยาสวมฉีด',
    status: 'IN_REPAIR',
    serialNo: 'TR-443109',
    department: 'ศูนย์ซ่อมบำรุงเครื่องมือแพทย์ (ส่งซ่อม)',
    calibrationDue: '2026-08-05',
    notes: 'ส่งซ่อม: สัญญาณเตือน Occlusion ผิดปกติ (ใบส่งซ่อม #69/69)',
    lastUpdated: '2026-07-29 15:20'
  },
  {
    id: 'EQ-004',
    assetNo: 'MNRH-8LT-EQ004',
    name: 'เครื่องฉีดยาควบคุมด้วยไฟฟ้า (Syringe Driver Pump Nipro)',
    category: 'เครื่องให้สารน้ำและยาสวมฉีด',
    status: 'NORMAL',
    serialNo: 'NP-102938',
    department: '8LT-Bed08',
    calibrationDue: '2026-12-20',
    notes: 'ใช้ฉีดยากลุ่ม Inotrope',
    lastUpdated: '2026-07-30 09:40'
  },
  {
    id: 'EQ-005',
    assetNo: 'MNRH-8LT-EQ005',
    name: 'เครื่องดูดเสมหะเคลื่อนที่ (Portable Suction Machine)',
    category: 'เครื่องช่วยหายใจและระบบหายใจ',
    status: 'BORROWED',
    serialNo: 'PS-339201',
    department: 'หอผู้ป่วยอายุรกรรมหญิง 8 ขวา (8RT)',
    calibrationDue: '2026-09-30',
    notes: 'ยืมไปหอ 8 ขวา โดย พว.สมหญิง เมื่อ 29 ก.ค. 69',
    lastUpdated: '2026-07-29 18:00'
  },
  {
    id: 'EQ-006',
    assetNo: 'MNRH-8LT-EQ006',
    name: 'เครื่องกระตุกหัวใจอัตโนมัติ/Defibrillator (Zoll R Series)',
    category: 'เครื่องเฝ้าติดตามและกระตุกหัวใจ',
    status: 'NORMAL',
    serialNo: 'ZL-774920',
    department: 'รถฉุกเฉิน Crash Cart (8LT-Nurses Station)',
    calibrationDue: '2026-08-25',
    notes: 'ทดสอบ Discharge 30 Joules ผ่านรอบเช้าทุกวัน',
    lastUpdated: '2026-07-30 08:00'
  },
  {
    id: 'EQ-007',
    assetNo: 'MNRH-8LT-EQ007',
    name: 'เตียงผู้ป่วยปรับไฟฟ้า 3 ฟังก์ชั่น (Electric Patient Bed)',
    category: 'ครุภัณฑ์เคลื่อนย้ายและเตียง',
    status: 'NORMAL',
    serialNo: 'EB-8012',
    department: '8LT-Bed01',
    calibrationDue: '2027-01-15',
    notes: 'ราวกั้นเตียงและรีโมทใช้งานปกติ',
    lastUpdated: '2026-07-25 10:00'
  },
  {
    id: 'EQ-008',
    assetNo: 'MNRH-8LT-EQ008',
    name: 'รถเข็นฉุกเฉินประจำวอร์ด (Emergency Crash Cart)',
    category: 'ครุภัณฑ์เคลื่อนย้ายและเตียง',
    status: 'NORMAL',
    serialNo: 'CC-8LT-01',
    department: 'เคาน์เตอร์พยาบาล 8 ซ้าย',
    calibrationDue: '2026-08-01',
    notes: 'ล็อกซีลหมายเลข #MNRH-9982 พร้อมใช้งาน 24 ชม.',
    lastUpdated: '2026-07-30 08:00'
  },
  {
    id: 'EQ-009',
    assetNo: 'MNRH-8LT-EQ009',
    name: 'เครื่องตรวจคลื่นไฟฟ้าหัวใจ 12 Leaks (ECG 12 Leads Machine)',
    category: 'เครื่องมือตรวจและรักษา',
    status: 'DAMAGED',
    serialNo: 'ECG-55102',
    department: 'ห้องเก็บครุภัณฑ์ชำรุดรอแทงจำหน่าย',
    calibrationDue: '2026-06-01',
    notes: 'สาย Lead ชำรุดและหัวพิมพ์กระดาษเสื่อมสภาพ รออนุมัติซื้อทดแทน',
    lastUpdated: '2026-07-15 11:00'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-1001',
    timestamp: '2026-07-30 08:30',
    type: 'ISSUE',
    itemType: 'SUPPLY',
    itemId: 'SUP-001',
    itemName: 'สายดูดเสมหะ (Suction Catheter) #14',
    qty: 10,
    unit: 'เส้น',
    staffName: 'พว.สุดารัตน์ ใจดี (RN)',
    patientBed: '8LT-Bed04 (HN 6401928)',
    notes: 'เบิกใช้หัตถการดูดเสมหะประจำเวร'
  },
  {
    id: 'TXN-1002',
    timestamp: '2026-07-30 09:15',
    type: 'RESTOCK',
    itemType: 'SUPPLY',
    itemId: 'SUP-005',
    itemName: 'ชุดให้สารน้ำ IV Infusion Set',
    qty: 50,
    unit: 'ชุด',
    staffName: 'พว.อนงค์ รัตนอุบล (Head Nurse)',
    notes: 'รับพัสดุเบิกงวดประจำสัปดาห์จากคลังกลาง รพ.มหาราช'
  },
  {
    id: 'TXN-1003',
    timestamp: '2026-07-29 18:00',
    type: 'BORROW',
    itemType: 'EQUIPMENT',
    itemId: 'EQ-005',
    itemName: 'เครื่องดูดเสมหะเคลื่อนที่ (Portable Suction Machine)',
    qty: 1,
    unit: 'เครื่อง',
    staffName: 'พว.ณิชาภา บุญส่ง (RN 8LT)',
    department: 'หอผู้ป่วย 8 ขวา (8RT)',
    notes: 'พว.สมหญิง หอ 8 ขวา มารับยืมเนื่องจากเคสแน่น'
  },
  {
    id: 'TXN-1004',
    timestamp: '2026-07-29 15:20',
    type: 'REPAIR',
    itemType: 'EQUIPMENT',
    itemId: 'EQ-003',
    itemName: 'เครื่องให้สารน้ำทางหลอดเลือดดำ (Infusion Pump Terumo TE-171)',
    qty: 1,
    unit: 'เครื่อง',
    staffName: 'คุณสมชาย (เจ้าหน้าที่เวชกิจ 8LT)',
    department: 'ศูนย์ซ่อมบำรุง รพ.มหาราชนครราชสีมา',
    notes: 'ส่งซ่อมอาการ Occlusion Alarm ผิดปกติ'
  }
];
