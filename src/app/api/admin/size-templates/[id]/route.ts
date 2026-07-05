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

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return err("Unauthorized", 401);
  }

  const { id } = await context.params;

  try {
    const parsed = sizeTemplateInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return err("Invalid size template data", 400, zodDetails(parsed.error));
    }

    const template = await getPrisma().sizeTemplate.update({
      where: { id },
      data: {
        nameVi: parsed.data.nameVi,
        nameEn: parsed.data.nameEn,
        fields: parsed.data.fields
      }
    });

    return ok(template);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return err("Unauthorized", 401);
  }

  const { id } = await context.params;

  try {
    await getPrisma().sizeTemplate.delete({
      where: { id }
    });
    return ok({ deleted: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}
