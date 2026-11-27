import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deleteExpiredRecords, isAuthorizedCronRequest } from "../src/lib/expired-records";

describe("expired record cleanup", () => {
  it("deletes rate-limit buckets older than a day and admin sessions dead for a week", async () => {
    const calls: Record<string, unknown> = {};
    const prisma = {
      rateLimitBucket: {
        deleteMany: async (args: unknown) => {
          calls.rateLimitBucket = args;
          return { count: 3 };
        }
      },
      adminSession: {
        deleteMany: async (args: unknown) => {
          calls.adminSession = args;
          return { count: 1 };
        }
      }
    };

    const result = await deleteExpiredRecords(prisma, new Date("2026-11-27T00:00:00.000Z"));

    assert.deepEqual(result, { rateLimitBuckets: 3, adminSessions: 1 });
    assert.deepEqual(calls.rateLimitBucket, {
      where: { resetAt: { lt: new Date("2026-11-26T00:00:00.000Z") } }
    });
    assert.deepEqual(calls.adminSession, {
      where: {
        OR: [
          { expiresAt: { lt: new Date("2026-11-20T00:00:00.000Z") } },
          { revokedAt: { lt: new Date("2026-11-20T00:00:00.000Z") } }
        ]
      }
    });
  });

  it("only accepts the cron secret as a bearer token, and refuses when no secret is set", () => {
    assert.equal(isAuthorizedCronRequest("Bearer s3cret", "s3cret"), true);
    assert.equal(isAuthorizedCronRequest("Bearer wrong", "s3cret"), false);
    assert.equal(isAuthorizedCronRequest(null, "s3cret"), false);
    assert.equal(isAuthorizedCronRequest("Bearer ", ""), false);
    assert.equal(isAuthorizedCronRequest("Bearer x", undefined), false);
  });
});
