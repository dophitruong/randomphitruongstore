import { timingSafeEqual } from "node:crypto";

const DAY_MS = 24 * 60 * 60_000;

type ExpiredRecordStore = {
  rateLimitBucket: {
    deleteMany(args: { where: { resetAt: { lt: Date } } }): Promise<{ count: number }>;
  };
  adminSession: {
    deleteMany(args: {
      where: { OR: [{ expiresAt: { lt: Date } }, { revokedAt: { lt: Date } }] };
    }): Promise<{ count: number }>;
  };
};

// Rate-limit buckets and admin sessions are only ever inserted; without this they grow forever.
export async function deleteExpiredRecords(prisma: ExpiredRecordStore, now = new Date()) {
  const dayAgo = new Date(now.getTime() - DAY_MS);
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const [rateLimitBuckets, adminSessions] = await Promise.all([
    prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: dayAgo } } }),
    prisma.adminSession.deleteMany({
      where: { OR: [{ expiresAt: { lt: weekAgo } }, { revokedAt: { lt: weekAgo } }] }
    })
  ]);
  return { rateLimitBuckets: rateLimitBuckets.count, adminSessions: adminSessions.count };
}

// Vercel Cron sends "Authorization: Bearer <CRON_SECRET>"; with no secret set the job is refused.
export function isAuthorizedCronRequest(
  authorization: string | null,
  secret = process.env.CRON_SECRET
) {
  if (!secret || !authorization) return false;
  const supplied = Buffer.from(authorization);
  const expected = Buffer.from(`Bearer ${secret}`);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
