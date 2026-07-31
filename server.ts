import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to instantiate google auth client with Bearer token
function getGoogleAuthClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ward: '8LT - Female Medical Ward, Maharat Nakhon Ratchasima Hospital' });
});

// 2. Init / Find or Create Google Spreadsheet
app.post('/api/sheets/init', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthenticated. Google Access Token missing.' });
    }
    const token = authHeader.split(' ')[1];
    const auth = getGoogleAuthClient(token);

    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    const SPREADSHEET_NAME = 'ระบบพัสดุและครุภัณฑ์_หอผู้ป่วย8ซ้าย_มหาราช';

    // Search existing file in Drive
    const searchRes = await drive.files.list({
      q: `name = '${SPREADSHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
      fields: 'files(id, name, webViewLink)',
    });

    let spreadsheetId = '';
    let spreadsheetUrl = '';

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      spreadsheetId = searchRes.data.files[0].id!;
      spreadsheetUrl = searchRes.data.files[0].webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    } else {
      // Create new Spreadsheet
      const createRes = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: SPREADSHEET_NAME,
          },
          sheets: [
            { properties: { title: 'Overview_Dashboard' } },
            { properties: { title: 'Medical_Supplies' } },
            { properties: { title: 'Durable_Equipment' } },
            { properties: { title: 'Transactions_Log' } },
          ],
        },
      });

      spreadsheetId = createRes.data.spreadsheetId!;
      spreadsheetUrl = createRes.data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

      // Format Header Rows and initial structure
      const initialSuppliesData = [
        ['ID', 'รหัสพัสดุ', 'ชื่อพัสดุการแพทย์', 'หมวดหมู่', 'คงเหลือ', 'หน่วยนับ', 'เกณฑ์ขั้นต่ำ', 'วันหมดอายุ', 'สถานที่เก็บ', 'หมายเหตุ', 'อัปเดตล่าสุด'],
        ...(req.body.supplies || []).map((s: any) => [
          s.id, s.code, s.name, s.category, s.stock, s.unit, s.minLevel, s.expiryDate || '', s.location, s.notes || '', s.lastUpdated
        ])
      ];

      const initialEquipmentData = [
        ['ID', 'เลขครุภัณฑ์', 'ชื่อครุภัณฑ์', 'หมวดหมู่', 'สถานะ', 'Serial No', 'ตำแหน่ง/เตียง', 'วันสอบเทียบ', 'หมายเหตุ', 'อัปเดตล่าสุด'],
        ...(req.body.equipment || []).map((e: any) => [
          e.id, e.assetNo, e.name, e.category, e.status, e.serialNo, e.department, e.calibrationDue || '', e.notes || '', e.lastUpdated
        ])
      ];

      const initialTxnData = [
        ['ID', 'วันเวลา', 'ประเภทรายการ', 'ชนิดพัสดุ', 'ID รายการ', 'ชื่อรายการ', 'จำนวน', 'หน่วย', 'ผู้ทำรายการ', 'เตียง/HN', 'แผนก', 'หมายเหตุ'],
        ...(req.body.transactions || []).map((t: any) => [
          t.id, t.timestamp, t.type, t.itemType, t.itemId, t.itemName, t.qty, t.unit, t.staffName, t.patientBed || '', t.department || '', t.notes || ''
        ])
      ];

      const overviewData = [
        ['หอผู้ป่วยอายุรกรรมหญิง 8 ซ้าย โรงพยาบาลมหาราชนครราชสีมา'],
        ['ระบบจัดการพัสดุการแพทย์และครุภัณฑ์ (Maharat Ward 8LT Inventory System)'],
        [''],
        ['รายงานสรุปข้อมูลสต็อกล่าสุด (Auto Synced)'],
        ['รายการพัสดุทางการแพทย์ทั้งหมด', req.body.supplies?.length || 0],
        ['รายการครุภัณฑ์ทั้งหมด', req.body.equipment?.length || 0],
        ['วันที่ซิงก์ข้อมูลล่าสุด', new Date().toLocaleString('th-TH')]
      ];

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: [
            { range: 'Overview_Dashboard!A1', values: overviewData },
            { range: 'Medical_Supplies!A1', values: initialSuppliesData },
            { range: 'Durable_Equipment!A1', values: initialEquipmentData },
            { range: 'Transactions_Log!A1', values: initialTxnData },
          ],
        },
      });
    }

    res.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl,
    });
  } catch (error: any) {
    console.error('Error in /api/sheets/init:', error);
    res.status(500).json({ error: error.message || 'Failed to initialize Google Sheet' });
  }
});

// 3. Sync Application Data to Google Sheet
app.post('/api/sheets/sync', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthenticated. Token missing.' });
    }
    const token = authHeader.split(' ')[1];
    const { spreadsheetId, supplies, equipment, transactions } = req.body;

    if (!spreadsheetId) {
      return res.status(400).json({ error: 'spreadsheetId is required' });
    }

    const auth = getGoogleAuthClient(token);
    const sheets = google.sheets({ version: 'v4', auth });

    const suppliesRows = [
      ['ID', 'รหัสพัสดุ', 'ชื่อพัสดุการแพทย์', 'หมวดหมู่', 'คงเหลือ', 'หน่วยนับ', 'เกณฑ์ขั้นต่ำ', 'วันหมดอายุ', 'สถานที่เก็บ', 'หมายเหตุ', 'อัปเดตล่าสุด'],
      ...(supplies || []).map((s: any) => [
        s.id, s.code, s.name, s.category, s.stock, s.unit, s.minLevel, s.expiryDate || '', s.location, s.notes || '', s.lastUpdated
      ])
    ];

    const equipmentRows = [
      ['ID', 'เลขครุภัณฑ์', 'ชื่อครุภัณฑ์', 'หมวดหมู่', 'สถานะ', 'Serial No', 'ตำแหน่ง/เตียง', 'วันสอบเทียบ', 'หมายเหตุ', 'อัปเดตล่าสุด'],
      ...(equipment || []).map((e: any) => [
        e.id, e.assetNo, e.name, e.category, e.status, e.serialNo, e.department, e.calibrationDue || '', e.notes || '', e.lastUpdated
      ])
    ];

    const txnRows = [
      ['ID', 'วันเวลา', 'ประเภทรายการ', 'ชนิดพัสดุ', 'ID รายการ', 'ชื่อรายการ', 'จำนวน', 'หน่วย', 'ผู้ทำรายการ', 'เตียง/HN', 'แผนก', 'หมายเหตุ'],
      ...(transactions || []).map((t: any) => [
        t.id, t.timestamp, t.type, t.itemType, t.itemId, t.itemName, t.qty, t.unit, t.staffName, t.patientBed || '', t.department || '', t.notes || ''
      ])
    ];

    const nowStr = new Date().toLocaleString('th-TH');
    const lowStockCount = (supplies || []).filter((s: any) => s.stock <= s.minLevel).length;
    const inRepairCount = (equipment || []).filter((e: any) => e.status === 'IN_REPAIR').length;

    const overviewRows = [
      ['หอผู้ป่วยอายุรกรรมหญิง 8 ซ้าย โรงพยาบาลมหาราชนครราชสีมา'],
      ['ระบบจัดการพัสดุการแพทย์และครุภัณฑ์ (Auto Sync Dashboard)'],
      [''],
      ['ตัวชี้วัดสำคัญ (Real-time Key Metrics)'],
      ['พัสดุการแพทย์ทั้งหมด (รายการ)', (supplies || []).length],
      ['พัสดุวิกฤต/เหลือน้อยกว่าเกณฑ์', lowStockCount],
      ['ครุภัณฑ์ทางการแพทย์ทั้งหมด (เครื่อง)', (equipment || []).length],
      ['ครุภัณฑ์ส่งซ่อมบำรุง', inRepairCount],
      ['อัปเดตล่าสุด ณ เวลา', nowStr]
    ];

    // Clear and write updated values
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: 'Overview_Dashboard!A1:Z50', values: overviewRows },
          { range: 'Medical_Supplies!A1:Z500', values: suppliesRows },
          { range: 'Durable_Equipment!A1:Z500', values: equipmentRows },
          { range: 'Transactions_Log!A1:Z1000', values: txnRows },
        ],
      },
    });

    res.json({ success: true, syncedAt: nowStr });
  } catch (error: any) {
    console.error('Error in /api/sheets/sync:', error);
    res.status(500).json({ error: error.message || 'Failed to sync to Google Sheet' });
  }
});

// 4. Load Data From Google Sheet
app.post('/api/sheets/load', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthenticated. Token missing.' });
    }
    const token = authHeader.split(' ')[1];
    const { spreadsheetId } = req.body;

    if (!spreadsheetId) {
      return res.status(400).json({ error: 'spreadsheetId is required' });
    }

    const auth = getGoogleAuthClient(token);
    const sheets = google.sheets({ version: 'v4', auth });

    const batchRes = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: ['Medical_Supplies!A2:K500', 'Durable_Equipment!A2:J500', 'Transactions_Log!A2:L1000'],
    });

    const valueRanges = batchRes.data.valueRanges || [];

    const suppliesRaw = valueRanges[0]?.values || [];
    const equipmentRaw = valueRanges[1]?.values || [];
    const txnsRaw = valueRanges[2]?.values || [];

    const supplies = suppliesRaw.map((row) => ({
      id: row[0] || '',
      code: row[1] || '',
      name: row[2] || '',
      category: row[3] || 'วัสดุสิ้นเปลืองทั่วไป',
      stock: parseInt(row[4] || '0', 10),
      unit: row[5] || 'ชิ้น',
      minLevel: parseInt(row[6] || '0', 10),
      expiryDate: row[7] || '',
      location: row[8] || '',
      notes: row[9] || '',
      lastUpdated: row[10] || new Date().toLocaleString('th-TH'),
    }));

    const equipment = equipmentRaw.map((row) => ({
      id: row[0] || '',
      assetNo: row[1] || '',
      name: row[2] || '',
      category: row[3] || 'เครื่องมือตรวจและรักษา',
      status: row[4] || 'NORMAL',
      serialNo: row[5] || '',
      department: row[6] || '',
      calibrationDue: row[7] || '',
      notes: row[8] || '',
      lastUpdated: row[9] || new Date().toLocaleString('th-TH'),
    }));

    const transactions = txnsRaw.map((row) => ({
      id: row[0] || '',
      timestamp: row[1] || '',
      type: row[2] || 'ISSUE',
      itemType: row[3] || 'SUPPLY',
      itemId: row[4] || '',
      itemName: row[5] || '',
      qty: parseInt(row[6] || '1', 10),
      unit: row[7] || 'ชิ้น',
      staffName: row[8] || '',
      patientBed: row[9] || '',
      department: row[10] || '',
      notes: row[11] || '',
    }));

    res.json({ supplies, equipment, transactions });
  } catch (error: any) {
    console.error('Error in /api/sheets/load:', error);
    res.status(500).json({ error: error.message || 'Failed to load data from Google Sheet' });
  }
});

// ----------------------------------------------------
// VITE / STATIC SERVING SETUP
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
