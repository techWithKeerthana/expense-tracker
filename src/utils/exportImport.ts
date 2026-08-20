import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Transaction } from '../types';

const TRANSACTION_FIELDS: (keyof Transaction)[] = [
  'id',
  'title',
  'amount',
  'type',
  'category',
  'date',
  'notes',
  'receiptUri',
  'createdAt',
  'updatedAt',
];

function escapeCsvValue(value: unknown): string {
  const str = value === undefined || value === null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function transactionsToCsv(transactions: Transaction[]): string {
  const header = TRANSACTION_FIELDS.join(',');
  const rows = transactions.map((t) =>
    TRANSACTION_FIELDS.map((field) => escapeCsvValue(t[field])).join(',')
  );
  return [header, ...rows].join('\n');
}

export function csvToTransactions(csv: string): Transaction[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const record: Record<string, string> = {};
    header.forEach((key, i) => {
      record[key] = values[i] ?? '';
    });
    return {
      id: record.id,
      title: record.title,
      amount: Number(record.amount),
      type: record.type as Transaction['type'],
      category: record.category as Transaction['category'],
      date: record.date,
      notes: record.notes || undefined,
      receiptUri: record.receiptUri || undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function exportFile(
  transactions: Transaction[],
  format: 'csv' | 'json'
): Promise<void> {
  const content =
    format === 'json' ? JSON.stringify(transactions, null, 2) : transactionsToCsv(transactions);
  const fileName = `expense-tracker-backup-${Date.now()}.${format}`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: format === 'json' ? 'application/json' : 'text/csv',
      dialogTitle: 'Export transactions',
    });
  }
}

async function importFile(fileUri: string): Promise<Transaction[]> {
  const content = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const trimmed = content.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  }
  return csvToTransactions(trimmed);
}

export const exportImportService = { exportFile, importFile };
