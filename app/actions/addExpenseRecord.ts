'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

interface RecordData {
  text: string;
  amount: number;     // Float
  category: string;
  date: string;       // ISO string
}
interface RecordResult {
  data?: RecordData;
  error?: string;
}

// yyyy-mm-dd -> noon UTC ISO to avoid timezone rollover
function toMiddayUTCISO(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split('-').map((v) => parseInt(v, 10));
  if (!y || !m || !d) throw new Error('Invalid date parts');
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).toISOString();
}

export default async function addExpenseRecord(formData: FormData): Promise<RecordResult> {
  // 1) Pull and validate fields
  const textRaw = formData.get('text');
  const amountRaw = formData.get('amount');
  const categoryRaw = formData.get('category');
  const dateRaw = formData.get('date');

  if (!textRaw || !amountRaw || !categoryRaw || !dateRaw) {
    return { error: 'Text, amount, category, and date are required.' };
  }

  const text = String(textRaw).trim();
  const category = String(categoryRaw).trim();
  const amount = Number(String(amountRaw).trim());
  if (!text || !category || !Number.isFinite(amount)) {
    return { error: 'Please provide valid text, category, and amount.' };
  }

  let isoDate: string;
  try {
    isoDate = toMiddayUTCISO(String(dateRaw).trim());
  } catch {
    return { error: 'Invalid date format. Use YYYY-MM-DD.' };
  }

  // 2) Auth → map Clerk user to your app User
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { error: 'Not authenticated.' };

  // Your User model requires a unique email → fetch from Clerk
  const clerk = await currentUser();
  const email =
    clerk?.primaryEmailAddress?.emailAddress ||
    clerk?.emailAddresses?.[0]?.emailAddress;
  if (!email) return { error: 'No email on Clerk user; cannot create local user.' };

  // Ensure a local User row exists and get its UUID id
    const appUser = await db.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
    });

    if (!appUser) {
    throw new Error('User not found in local DB');
    }


  // 3) Create the Record using the UUID FK
  try {
    const created = await db.record.create({
      data: {
        text,
        amount,                 // Float in your schema
        category,
        date: new Date(isoDate),// Prisma DateTime
        userId: appUser.id,     // <-- UUID, NOT the Clerk id
      },
      select: { text: true, amount: true, category: true, date: true },
    });

    // 4) Revalidate UI and return normalized data
    revalidatePath('/');

    return {
      data: {
        text: created.text,
        amount: created.amount,
        category: created.category,
        date: created.date.toISOString(),
      },
    };
  } catch (err) {
  if (err && typeof err === 'object' && 'code' in err && err.code === 'P2023') {
    return { error: 'Invalid UUID written to a UUID column (check userId/FKs).' };
  }
    console.error('Error adding expense record:', err);
    return { error: 'An unexpected error occurred while adding the expense record.' };
  }
}
