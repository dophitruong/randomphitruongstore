import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { err, handlePrismaError, ok, zodDetails } from "@/lib/api-response";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildProductDraftWrite } from "@/lib/product-catalog";
import { hasMeaningfulProductDraftData } from "@/lib/product-drafts";
import { getPrisma } from "@/lib/prisma";
import { productDraftInputSchema } from "@/lib/validations";

const adminProductInclude = {
  categoryRecord: true,
  images: { orderBy: { sortOrder: "asc" } },
  variants: { orderBy: [{ size: "asc" }, { colorVi: "asc" }] },
  sizeCharts: { orderBy: { size: "asc" } },
  sizeTemplate: true
} satisfies Prisma.ProductInclude;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return err("Unauthorized", 401);
  }

  const parsed = productDraftInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return err("Invalid draft data", 400, zodDetails(parsed.error));
  }

  if (!hasMeaningfulProductDraftData(parsed.data)) {
    return err("Enter product details before saving a draft", 400);
  }

  const prisma = getPrisma();
  const id = randomUUID();

  try {
    const categoryId = await resolveDraftCategoryId(parsed.data.categoryId);
    if (!categoryId) {
      return err("A product category is required before saving drafts", 400);
    }

    const catalog = buildProductDraftWrite(parsed.data, {
      productId: id,
      categoryId
    });
    const product = await prisma.product.create({
      data: {
        id,
        ...catalog.productData,
        images: { create: catalog.images },
        variants: { create: catalog.variants },
        sizeCharts: { create: catalog.sizeCharts }
      },
      include: adminProductInclude
    });

    return ok(product, 201);
  } catch (error) {
    return handlePrismaError(error);
  }
}

async function resolveDraftCategoryId(categoryId: string | null | undefined) {
  const prisma = getPrisma();

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true }
    });
    if (category) {
      return category.id;
    }
  }

  const fallback = await prisma.category.findFirst({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    select: { id: true }
  });
  return fallback?.id ?? null;
}
