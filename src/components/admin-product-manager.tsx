"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ProductWithImages } from "@/types";
import { AdminTable } from "./admin-table";

const formSchema = z.object({
  nameVi: z.string().trim().min(2),
  nameEn: z.string().trim().min(2),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  descriptionVi: z.string().trim().min(10),
  descriptionEn: z.string().trim().min(10),
  category: z.enum(["SUKAJAN", "BOMBER", "HOODIE", "JACKET", "SEASONAL"]),
  price: z.number().int().positive(),
  images: z.string().trim().min(5),
  sizes: z.string().trim().min(1),
  colors: z.string().trim().min(1),
  materialVi: z.string().trim().min(2),
  materialEn: z.string().trim().min(2),
  isFeatured: z.boolean(),
  isActive: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

const defaults: FormValues = {
  nameVi: "",
  nameEn: "",
  slug: "",
  descriptionVi: "",
  descriptionEn: "",
  category: "SUKAJAN",
  price: 1500000,
  images: "",
  sizes: "M, L, XL",
  colors: "Black",
  materialVi: "",
  materialEn: "",
  isFeatured: false,
  isActive: true
};

export function AdminProductManager({
  products
}: {
  products: ProductWithImages[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults
  });

  function createProduct() {
    setEditingId(null);
    setServerError("");
    reset(defaults);
    setOpen(true);
  }

  function editProduct(product: ProductWithImages) {
    setEditingId(product.id);
    setServerError("");
    reset({
      nameVi: product.nameVi,
      nameEn: product.nameEn,
      slug: product.slug,
      descriptionVi: product.descriptionVi,
      descriptionEn: product.descriptionEn,
      category: product.category,
      price: product.price,
      images: product.images.map((image) => image.url).join("\n"),
      sizes: product.sizes.join(", "),
      colors: product.colors.join(", "),
      materialVi: product.materialVi,
      materialEn: product.materialEn,
      isFeatured: product.isFeatured,
      isActive: product.isActive
    });
    setOpen(true);
  }

  async function save(values: FormValues) {
    setServerError("");
    const endpoint = editingId ? `/api/products/${editingId}` : "/api/products";
    const response = await fetch(endpoint, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        images: values.images
          .split(/\r?\n/)
          .map((value) => value.trim())
          .filter(Boolean),
        sizes: values.sizes
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        colors: values.colors
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      })
    });
    const result = await response.json();
    if (!response.ok) {
      setServerError(result.error ?? "Unable to save product");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function remove(product: ProductWithImages) {
    if (!window.confirm(`Delete or archive "${product.nameEn}"?`)) {
      return;
    }
    const response = await fetch(`/api/products/${product.id}`, {
      method: "DELETE"
    });
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button className="button-primary" onClick={createProduct} type="button">
          <Plus size={16} />
          New product
        </button>
      </div>
      <AdminTable
        headers={["Product", "Category", "Price", "Featured", "Active", "Actions"]}
      >
        {products.map((product) => (
          <tr key={product.id}>
            <td className="px-4 py-4">
              <p className="font-bold">{product.nameEn}</p>
              <p className="mt-1 text-xs text-zinc-500">{product.slug}</p>
            </td>
            <td className="px-4 py-4">{product.category}</td>
            <td className="px-4 py-4">
              {new Intl.NumberFormat("vi-VN").format(product.price)} VND
            </td>
            <td className="px-4 py-4">{product.isFeatured ? "Yes" : "No"}</td>
            <td className="px-4 py-4">{product.isActive ? "Yes" : "No"}</td>
            <td className="px-4 py-4">
              <div className="flex gap-2">
                <button
                  aria-label="Edit product"
                  className="border border-zinc-300 p-2 hover:bg-zinc-100"
                  onClick={() => editProduct(product)}
                  type="button"
                >
                  <Pencil size={15} />
                </button>
                <button
                  aria-label="Delete product"
                  className="border border-zinc-300 p-2 text-red-700 hover:bg-red-50"
                  onClick={() => remove(product)}
                  type="button"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4">
          <div className="mx-auto my-6 max-w-4xl bg-white p-5 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">
                {editingId ? "Edit product" : "New product"}
              </h2>
              <button
                aria-label="Close"
                className="p-2"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X />
              </button>
            </div>
            <form
              className="mt-6 grid gap-5 sm:grid-cols-2"
              onSubmit={handleSubmit(save)}
            >
              <AdminField label="Name (VI)" error={errors.nameVi?.message}>
                <input className="field" {...register("nameVi")} />
              </AdminField>
              <AdminField label="Name (EN)" error={errors.nameEn?.message}>
                <input className="field" {...register("nameEn")} />
              </AdminField>
              <AdminField label="Slug" error={errors.slug?.message}>
                <input className="field" {...register("slug")} />
              </AdminField>
              <AdminField label="Category" error={errors.category?.message}>
                <select className="field" {...register("category")}>
                  <option value="SUKAJAN">Sukajan</option>
                  <option value="BOMBER">Bomber</option>
                  <option value="HOODIE">Hoodie</option>
                  <option value="JACKET">Jacket</option>
                  <option value="SEASONAL">Seasonal</option>
                </select>
              </AdminField>
              <AdminField label="Price (VND)" error={errors.price?.message}>
                <input
                  className="field"
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                />
              </AdminField>
              <AdminField label="Sizes (comma separated)" error={errors.sizes?.message}>
                <input className="field" {...register("sizes")} />
              </AdminField>
              <AdminField label="Colors (comma separated)" error={errors.colors?.message}>
                <input className="field" {...register("colors")} />
              </AdminField>
              <AdminField label="Material (VI)" error={errors.materialVi?.message}>
                <input className="field" {...register("materialVi")} />
              </AdminField>
              <AdminField label="Material (EN)" error={errors.materialEn?.message}>
                <input className="field" {...register("materialEn")} />
              </AdminField>
              <div className="sm:col-span-2">
                <AdminField
                  label="Image URLs (one per line)"
                  error={errors.images?.message}
                >
                  <textarea className="field min-h-24" {...register("images")} />
                </AdminField>
              </div>
              <div className="sm:col-span-2">
                <AdminField
                  label="Description (VI)"
                  error={errors.descriptionVi?.message}
                >
                  <textarea
                    className="field min-h-24"
                    {...register("descriptionVi")}
                  />
                </AdminField>
              </div>
              <div className="sm:col-span-2">
                <AdminField
                  label="Description (EN)"
                  error={errors.descriptionEn?.message}
                >
                  <textarea
                    className="field min-h-24"
                    {...register("descriptionEn")}
                  />
                </AdminField>
              </div>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" {...register("isFeatured")} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" {...register("isActive")} />
                Active
              </label>
              {serverError ? (
                <p className="error-text sm:col-span-2">{serverError}</p>
              ) : null}
              <button
                className="button-primary sm:col-span-2 sm:justify-self-start"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Saving..." : "Save product"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function AdminField({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error ? <span className="error-text">{error}</span> : null}
    </label>
  );
}
