import { MedicalSupply, DurableEquipment, Transaction } from '../types';
import { getAccessToken } from './firebaseAuth';

export async function initGoogleSheet(supplies: MedicalSupply[], equipment: DurableEquipment[], transactions: Transaction[]) {
  const token = getAccessToken();
  if (!token) {
    throw new Error('ยังไม่ได้เข้าสู่ระบบ Google Auth');
  }

  const res = await fetch('/api/sheets/init', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ supplies, equipment, transactions }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to initialize sheet');
  }

  return data as { success: boolean; spreadsheetId: string; spreadsheetUrl: string };
}

export async function syncToGoogleSheet(
  spreadsheetId: string,
  supplies: MedicalSupply[],
  equipment: DurableEquipment[],
  transactions: Transaction[]
) {
  const token = getAccessToken();
  if (!token) {
    throw new Error('ยังไม่ได้เข้าสู่ระบบ Google Auth');
  }

  const res = await fetch('/api/sheets/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ spreadsheetId, supplies, equipment, transactions }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to sync to Google Sheet');
  }

  return data as { success: boolean; syncedAt: string };
}

export async function loadFromGoogleSheet(spreadsheetId: string) {
  const token = getAccessToken();
  if (!token) {
    throw new Error('ยังไม่ได้เข้าสู่ระบบ Google Auth');
  }

  const res = await fetch('/api/sheets/load', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ spreadsheetId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load from Google Sheet');
  }

  return data as { supplies: MedicalSupply[]; equipment: DurableEquipment[]; transactions: Transaction[] };
}
