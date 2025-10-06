// lib/checkUser.ts
'use server';

import { currentUser } from '@clerk/nextjs/server';
import { db } from './db';

export type AppUser = {
  id: string;              // Internal UUID from your DB (use for Record.userId)
  clerkUserId: string;     // Clerk user id (e.g., "user_abc123")
  email: string;
  name: string | null;     // Full display name if you need it
  firstName: string | null;// For "Welcome back, {firstName}"
  imageUrl: string | null;
  createdAt: string;       // ISO (from your DB user.createdAt)
  lastSignInAt: string | null; // ISO; use as "last active" proxy
};

/**
 * Returns the app user (creates it if missing). If not signed in, returns null.
 */
const checkUser = async (): Promise<AppUser | null> => {
  const clerk = await currentUser();
  if (!clerk) return null; // not signed in → treat as guest

  const clerkUserId = clerk.id;

  // Prefer primary email; fall back to first available email.
  const email =
    clerk.primaryEmailAddress?.emailAddress ||
    clerk.emailAddresses?.[0]?.emailAddress ||
    null;

  if (!email) {
    // To avoid UI crashes, return null (or you could throw to force handling).
    console.warn('checkUser: Clerk user has no email; cannot create local user.');
    return null;
  }

  // Build a reasonable display name (avoid "undefined undefined")
  const name =
    [clerk.firstName, clerk.lastName].filter(Boolean).join(' ') ||
    clerk.username ||
    null;

  // 1) Look up existing local user by unique clerkUserId
  let dbUser = await db.user.findUnique({
    where: { clerkUserId },
  });

  // 2) Create if missing
  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        clerkUserId,
        email,
        name,
        imageUrl: clerk.imageUrl || null,
      },
    });
  }

  // Coerce timestamps to ISO strings for safe use in Server Components
  const dbCreatedAtISO =
    dbUser.createdAt instanceof Date
      ? dbUser.createdAt.toISOString()
      : new Date(dbUser.createdAt as unknown as string).toISOString();

  const lastSignInISO = clerk.lastSignInAt
    ? new Date(clerk.lastSignInAt).toISOString()
    : null;

  return {
    id: dbUser.id,                    // internal UUID (DB)
    clerkUserId: dbUser.clerkUserId,  // Clerk id (string)
    email: dbUser.email,
    name: dbUser.name ?? null,
    firstName: clerk.firstName ?? null,
    imageUrl: dbUser.imageUrl ?? null,
    createdAt: dbCreatedAtISO,
    lastSignInAt: lastSignInISO,
  };
};

export default checkUser;
