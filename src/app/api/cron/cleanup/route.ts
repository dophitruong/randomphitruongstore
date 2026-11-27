import { err, handlePrismaError, ok } from "@/lib/api-response";
import { deleteExpiredRecords, isAuthorizedCronRequest } from "@/lib/expired-records";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request.headers.get("authorization"))) {
    return err("Unauthorized", 401);
  }

  try {
    return ok(await deleteExpiredRecords(getPrisma()));
  } catch (error) {
    return handlePrismaError(error);
  }
}
