'use server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

async function deleteRecord(recordId: string): Promise<{
  message?: string;
  error?: string;
}> {
  const { userId : clerkUserId } = await auth();

  if (!clerkUserId) return { error: 'Not authenticated' };

  // Find the app user row by Clerk id (created earlier via upsert/webhook)
  const appUser = await db.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });

  try {
    await db.record.delete({
      where: {
        id: recordId,
            userId: appUser?.id, // Ensure the record belongs to the authenticated user
      },
    });

    revalidatePath('/');

    return { message: 'Record deleted' };
  } catch (error) {
    console.error('Error deleting record:', error); // Log the error
    return { error: 'Database error' };
  }
}

export default deleteRecord;