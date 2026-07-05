import { z } from "zod";
import { err, handlePrismaError, ok, zodDetails } from "@/lib/api-response";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPrisma } from "@/lib/prisma";

const sizeTemplateInputSchema = z.object({
  nameVi: z.string().trim().min(2),
  nameEn: z.string().trim().min(2),
  fields: z.array(
    z.object({
      key: z.string().trim().min(1).regex(/^[a-z0-9_]+$/, "Key only allows lowercase letters, numbers, and underscores"),
      nameVi: z.string().trim().min(1),
      nameEn: z.string().trim().min(1)
    })
  ).min(1, "At least one field is required")
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return err("Unauthorized", 401);
  }

  try {
    const templates = await getPrisma().sizeTemplate.findMany({
      orderBy: { createdAt: "desc" }
    });
    return ok(templates);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return err("Unauthorized", 401);
  }

  try {
    const parsed = sizeTemplateInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return err("Invalid size template data", 400, zodDetails(parsed.error));
    }

    const template = await getPrisma().sizeTemplate.create({
      data: {
        nameVi: parsed.data.nameVi,
        nameEn: parsed.data.nameEn,
        fields: parsed.data.fields
      }
    });

    return ok(template, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}
