'use server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

async function getUserRecord(): Promise<{
  record?: number;
  daysWithRecords?: number;
  error?: string;
}> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return { error: 'User not found' };
  }

  const appUser = await db.user.findUnique({
    where: { clerkUserId },
    select: { id: true }, // UUID
  });
  if (!appUser) return { error: 'User not found in database' };

  try {
    const records = await db.record.findMany({
      where: { userId: appUser.id }, // <-- UUID, not Clerk id
      select: { amount: true, date: true },
    });


    const record = records.reduce((sum, record) => sum + record.amount, 0);

    // Count the number of days with valid sleep records
    const daysWithRecords = records.filter(
      (record) => record.amount > 0
    ).length;

    return { record, daysWithRecords };
  } catch (error) {
    console.error('Error fetching user record:', error); // Log the error
    return { error: 'Database error' };
  }
}

export default getUserRecord;