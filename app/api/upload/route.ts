import { parseCSV } from '@/lib/parsers/csv-parser';
import { parsePDF } from '@/lib/parsers/pdf-parser';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let transactions;

    if (fileName.endsWith('.csv')) {
      const text = await file.text();
      transactions = parseCSV(text);
    } else if (fileName.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      transactions = await parsePDF(buffer);
    } else {
      return Response.json(
        { error: 'Unsupported file type. Please upload a CSV or PDF.' },
        { status: 400 }
      );
    }

    if (transactions.length === 0) {
      return Response.json(
        { error: 'No transactions found in the file. Please check the format.' },
        { status: 400 }
      );
    }

    return Response.json({ transactions, count: transactions.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse file';
    return Response.json({ error: message }, { status: 500 });
  }
}
