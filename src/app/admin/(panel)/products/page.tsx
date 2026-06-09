import { AdminProductManager } from "@/components/admin-product-manager";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getPrisma().product.findMany({
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-zinc-500">Catalog</p>
        <h1 className="mt-2 text-4xl font-black">Products</h1>
      </header>
      <AdminProductManager products={products} />
    </>
  );
}
