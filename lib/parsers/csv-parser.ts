import Papa from 'papaparse';
import type { RawTransaction } from '@/types';

// Column name mappings for different bank export formats
const COLUMN_MAPS = {
  chase: {
    date: ['Transaction Date', 'Post Date'],
    description: ['Description'],
    amount: ['Amount'],
  },
  bofa: {
    date: ['Date'],
    description: ['Description'],
    amount: ['Amount'],
  },
  wellsfargo: {
    date: ['Date'],
    description: ['Description'],
    amount: ['Amount'],
  },
  capitalOne: {
    date: ['Transaction Date'],
    description: ['Description', 'Transaction Description'],
    amount: ['Debit', 'Credit', 'Transaction Amount'],
  },
};

function findColumn(headers: string[], candidates: string[]): string | null {
  const headerLower = headers.map((h) => h.trim().toLowerCase());
  for (const candidate of candidates) {
    const idx = headerLower.indexOf(candidate.toLowerCase());
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function detectBankFormat(headers: string[]): keyof typeof COLUMN_MAPS {
  const h = headers.map((h) => h.toLowerCase());
  if (h.includes('transaction date') && h.includes('post date')) return 'chase';
  if (h.includes('debit') || h.includes('credit')) return 'capitalOne';
  return 'bofa';
}

function parseAmount(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  return Math.abs(isNaN(num) ? 0 : num);
}

export function parseCSV(csvText: string): RawTransaction[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error('Failed to parse CSV file');
  }

  const headers = result.meta.fields ?? [];
  const format = detectBankFormat(headers);
  const map = COLUMN_MAPS[format];

  const dateCol = findColumn(headers, map.date);
  const descCol = findColumn(headers, map.description);
  let amountCol = findColumn(headers, map.amount);

  if (!dateCol || !descCol || !amountCol) {
    const genericDate = findColumn(headers, ['Date', 'Transaction Date', 'Posted Date']);
    const genericDesc = findColumn(headers, ['Description', 'Merchant', 'Name', 'Memo']);
    const genericAmount = findColumn(headers, ['Amount', 'Debit', 'Transaction Amount']);

    if (!genericDate || !genericDesc || !genericAmount) {
      throw new Error(
        `Unrecognized CSV format. Found columns: ${headers.join(', ')}. ` +
          `Expected columns for Date, Description, and Amount.`
      );
    }
    amountCol = genericAmount;
  }

  const transactions: RawTransaction[] = [];

  for (const row of result.data) {
    const rawDate = (dateCol ? row[dateCol] : '') ?? '';
    const rawDesc = (descCol ? row[descCol] : '') ?? '';
    let rawAmount = (amountCol ? row[amountCol] : '0') ?? '0';

    // Capital One splits debit/credit into separate columns
    if (format === 'capitalOne') {
      const debitCol = findColumn(headers, ['Debit']);
      const creditCol = findColumn(headers, ['Credit']);
      const debit = debitCol ? row[debitCol] : '';
      const credit = creditCol ? row[creditCol] : '';
      rawAmount = debit || credit || '0';
    }

    const amount = parseAmount(rawAmount);
    if (amount === 0) continue;

    const date = new Date(rawDate);
    if (isNaN(date.getTime())) continue;

    transactions.push({
      id: `txn_${Math.random().toString(36).slice(2)}`,
      date: date.toISOString().split('T')[0],
      merchant: rawDesc.trim(),
      amount,
      raw_description: rawDesc.trim(),
    });
  }

  return transactions;
}
