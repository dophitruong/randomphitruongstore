import { Prisma } from "@prisma/client";
import { err, handlePrismaError, ok, zodDetails } from "@/lib/api-response";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { buildProductDraftWrite } from "@/lib/product-catalog";
import { hasMeaningfulProductDraftData } from "@/lib/product-drafts";
import { getPrisma } from "@/lib/prisma";
import { productDraftInputSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

const adminProductInclude = {
  categoryRecord: true,
  images: { orderBy: { sortOrder: "asc" } },
  variants: { orderBy: [{ size: "asc" }, { colorVi: "asc" }] },
  sizeCharts: { orderBy: { size: "asc" } },
  sizeTemplate: true
} satisfies Prisma.ProductInclude;

export async function PATCH(request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  const prisma = getPrisma();

  try {
    const product = await prisma.$transaction(async (transaction) => {
      const existingProduct = await transaction.product.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          slug: true,
          categoryId: true
        }
      });

      if (!existingProduct) {
        throw new Error("DRAFT_PRODUCT_NOT_FOUND");
      }

      if (existingProduct.status !== "DRAFT") {
        throw new Error("PRODUCT_ALREADY_PUBLISHED");
      }

      const categoryId =
        (await resolveDraftCategoryId(parsed.data.categoryId)) ??
        existingProduct.categoryId;
      const catalog = buildProductDraftWrite(parsed.data, {
        productId: existingProduct.id,
        categoryId,
        existingSlug: existingProduct.slug
      });

      await transaction.productImage.deleteMany({ where: { productId: id } });
      await transaction.sizeChart.deleteMany({ where: { productId: id } });
      await transaction.productVariant.deleteMany({ where: { productId: id } });

      await transaction.product.update({
        where: { id },
        data: {
          ...catalog.productData,
          images: { create: catalog.images },
          variants: { create: catalog.variants },
          sizeCharts: { create: catalog.sizeCharts }
        }
      });

      return transaction.product.findUniqueOrThrow({
        where: { id },
        include: adminProductInclude
      });
    }, { timeout: 30000 });

    return ok(product);
  } catch (error) {
    if (error instanceof Error && error.message === "DRAFT_PRODUCT_NOT_FOUND") {
      return err("Record not found", 404);
    }

    if (error instanceof Error && error.message === "PRODUCT_ALREADY_PUBLISHED") {
      return err("Published products cannot be saved as drafts", 409);
    }

    return handlePrismaError(error);
  }
}

async function resolveDraftCategoryId(categoryId: string | null | undefined) {
  if (!categoryId) {
    return null;
  }

  const category = await getPrisma().category.findUnique({
    where: { id: categoryId },
    select: { id: true }
  });
  return category?.id ?? null;
}
