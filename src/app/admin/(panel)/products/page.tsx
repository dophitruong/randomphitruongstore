import { AdminProductManager } from "@/components/admin-product-manager";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories, sizeTemplates] = await Promise.all([
    getPrisma().product.findMany({
      include: {
        categoryRecord: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: [{ size: "asc" }, { colorVi: "asc" }] },
        sizeCharts: { orderBy: { size: "asc" } },
        sizeTemplate: true
      },
      orderBy: { updatedAt: "desc" }
    }),
    getPrisma().category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }]
    }),
    getPrisma().sizeTemplate.findMany({
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-zinc-500">Danh mục</p>
        <h1 className="mt-2 text-4xl font-black">Sản phẩm</h1>
      </header>
      <AdminProductManager
        categories={categories}
        sizeTemplates={sizeTemplates.map((t) => ({
          ...t,
          fields: t.fields as unknown as { key: string; nameVi: string; nameEn: string }[]
        }))}
        products={products.map((product) => ({
          ...product,
          sizeTemplate: product.sizeTemplate
            ? {
                id: product.sizeTemplate.id,
                nameVi: product.sizeTemplate.nameVi,
                nameEn: product.sizeTemplate.nameEn,
                fields: product.sizeTemplate.fields as unknown as { key: string; nameVi: string; nameEn: string }[]
              }
            : null,
          sizeCharts: product.sizeCharts.map((sizeChart) => ({
            ...sizeChart,
            shoulder: serializeMeasurement(sizeChart.shoulder),
            chest: serializeMeasurement(sizeChart.chest),
            length: serializeMeasurement(sizeChart.length),
            sleeve: serializeMeasurement(sizeChart.sleeve),
            measurements: sizeChart.measurements as unknown as Record<string, number | null> | null
          }))
        }))}
      />
    </>
  );
}

function serializeMeasurement(value: { toNumber: () => number } | null) {
  return value === null ? null : value.toNumber();
}
