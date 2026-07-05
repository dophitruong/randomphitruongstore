"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { useForm, useWatch, useFieldArray, Controller } from "react-hook-form";
import { parseMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { z } from "zod";
import {
  duplicateProductImageUrlIndex,
  isSupportedProductImageUrl,
  MAX_PRODUCT_IMAGES,
  moveProductImageUrl,
  removeProductImageUrl,
  setPrimaryProductImageUrl,
  splitProductImageUrls
} from "@/lib/product-images";
import type { ProductWithImages, SizeTemplateDTO } from "@/types";
import { AdminTable } from "./admin-table";

type CategoryOption = {
  id: string;
  nameVi: string;
  nameEn: string;
  slug: string;
};

const optionalMeasurementSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().positive().optional()
);

const formSchema = z.object({
  nameVi: z.string().trim().min(2),
  nameEn: z.string().trim().min(2),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễđìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]+(?:-[a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễđìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]+)*$/,
      "Slug only allows lowercase letters, numbers, and hyphens (e.g. sukajan-hac-song) / Slug chỉ được chứa chữ thường không dấu hoặc có dấu tiếng Việt, số và dấu gạch ngang."
    ),
  descriptionVi: z.string().trim().min(10),
  descriptionEn: z.string().trim().min(10),
  categoryId: z.string().uuid(),
  basePrice: z.number().int().positive(),
  orderLeadTimeMinDays: z.number().int().positive(),
  orderLeadTimeMaxDays: z.number().int().positive(),
  images: z.string().superRefine((value, context) => {
    const urls = splitProductImageUrls(value);
    if (urls.length === 0) {
      context.addIssue({
        code: "custom",
        message: "At least one product image is required"
      });
      return;
    }

    if (urls.length > MAX_PRODUCT_IMAGES) {
      context.addIssue({
        code: "custom",
        message: `Products can have at most ${MAX_PRODUCT_IMAGES} images`
      });
    }

    const invalidIndex = urls.findIndex(
      (url) => !isSupportedProductImageUrl(url)
    );
    if (invalidIndex !== -1) {
      context.addIssue({
        code: "custom",
        message: `Image ${invalidIndex + 1} must be an absolute URL or a local path`
      });
    }

    const duplicateIndex = duplicateProductImageUrlIndex(urls);
    if (duplicateIndex !== -1) {
      context.addIssue({
        code: "custom",
        message: `Image ${duplicateIndex + 1} duplicates an existing image`
      });
    }
  }),
  variants: z.array(z.object({
    size: z.string().trim().min(1, "Size is required"),
    colorVi: z.string().trim().min(1, "Color (VI) is required"),
    colorEn: z.string().trim().optional(),
    priceAdjustment: z.number().int(),
    isAvailable: z.boolean()
  })).min(1, "At least one variant is required"),
  sizeTemplateId: z.string().uuid().nullable().or(z.literal("")).optional(),
  sizeCharts: z.array(z.object({
    size: z.string().trim().min(1, "Size is required"),
    shoulder: optionalMeasurementSchema,
    chest: optionalMeasurementSchema,
    length: optionalMeasurementSchema,
    sleeve: optionalMeasurementSchema,
    measurements: z.record(optionalMeasurementSchema).nullable().optional(),
    unit: z.string().trim().min(1)
  })),
  materialVi: z.string().trim().min(2),
  materialEn: z.string().trim().min(2),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK"]),
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
  categoryId: "",
  basePrice: 1500000,
  orderLeadTimeMinDays: 7,
  orderLeadTimeMaxDays: 10,
  images: "",
  variants: [
    { size: "M", colorVi: "Black", colorEn: "Black", priceAdjustment: 0, isAvailable: true },
    { size: "L", colorVi: "Black", colorEn: "Black", priceAdjustment: 0, isAvailable: true },
    { size: "XL", colorVi: "Black", colorEn: "Black", priceAdjustment: 0, isAvailable: true }
  ],
  sizeTemplateId: "",
  sizeCharts: [],
  materialVi: "",
  materialEn: "",
  stockStatus: "IN_STOCK",
  isFeatured: false,
  isActive: true
};

const pageSize = 10;

export function AdminProductManager({
  categories: categoryOptions,
  products,
  sizeTemplates = []
}: {
  categories: CategoryOption[];
  products: ProductWithImages[];
  sizeTemplates?: SizeTemplateDTO[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState("ACTIVE");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  
  // Size Template Management State
  const [templates, setTemplates] = useState<SizeTemplateDTO[]>(sizeTemplates);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<SizeTemplateDTO> | null>(null);
  const [templateFormError, setTemplateFormError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    getValues,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults
  });
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants"
  });
  const { fields: sizeChartFields, append: appendSizeChart, remove: removeSizeChart } = useFieldArray({
    control,
    name: "sizeCharts"
  });
  const imageText = useWatch({ control, name: "images" });
  const imageUrls = splitProductImageUrls(imageText);
  const imageUploadLimitReached = imageUrls.length >= MAX_PRODUCT_IMAGES;
  
  const selectedTemplateId = useWatch({ control, name: "sizeTemplateId" });
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId);
  const [isUploading, setIsUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);

    const handleFocus = () => {
      window.scrollTo(window.scrollX, window.scrollY);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      mediaQuery.removeEventListener("change", handler);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.nameVi.toLowerCase().includes(normalizedQuery) ||
        product.nameEn.toLowerCase().includes(normalizedQuery) ||
        product.slug.toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        categoryFilter === "ALL" || product.categoryId === categoryFilter;
      const matchesVisibility =
        visibilityFilter === "ALL" ||
        (visibilityFilter === "ACTIVE" && product.isActive) ||
        (visibilityFilter === "INACTIVE" && !product.isActive) ||
        (visibilityFilter === "FEATURED" && product.isFeatured);
      const matchesStock =
        stockFilter === "ALL" || product.stockStatus === stockFilter;
      return matchesQuery && matchesCategory && matchesVisibility && matchesStock;
    });
  }, [categoryFilter, products, query, stockFilter, visibilityFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateCategory(value: string) {
    setCategoryFilter(value);
    setPage(1);
  }

  function updateVisibility(value: string) {
    setVisibilityFilter(value);
    setPage(1);
  }

  function updateStock(value: string) {
    setStockFilter(value);
    setPage(1);
  }

  function createProduct() {
    setEditingId(null);
    setServerError("");
    reset({ ...defaults, categoryId: categoryOptions[0]?.id ?? "" });
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
      categoryId: product.categoryId,
      basePrice: product.basePrice,
      orderLeadTimeMinDays: product.orderLeadTimeMinDays ?? 7,
      orderLeadTimeMaxDays: product.orderLeadTimeMaxDays ?? 10,
      images: product.images.map((image) => image.url).join("\n"),
      variants: product.variants.map((v) => ({
        size: v.size,
        colorVi: v.colorVi,
        colorEn: v.colorEn || v.colorVi,
        priceAdjustment: v.priceAdjustment,
        isAvailable: v.isAvailable
      })),
      sizeTemplateId: product.sizeTemplateId || "",
      sizeCharts: (product.sizeCharts ?? []).map((s) => ({
        size: s.size,
        shoulder: s.shoulder !== null && s.shoulder !== undefined ? Number(s.shoulder) : undefined,
        chest: s.chest !== null && s.chest !== undefined ? Number(s.chest) : undefined,
        length: s.length !== null && s.length !== undefined ? Number(s.length) : undefined,
        sleeve: s.sleeve !== null && s.sleeve !== undefined ? Number(s.sleeve) : undefined,
        measurements: s.measurements ? (s.measurements as Record<string, number>) : {},
        unit: s.unit || "cm"
      })),
      materialVi: product.materialVi,
      materialEn: product.materialEn,
      stockStatus: product.stockStatus,
      isFeatured: product.isFeatured,
      isActive: product.isActive
    });
    setOpen(true);
  }

  function updateImageUrls(urls: string[]) {
    setValue("images", urls.join("\n"), {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  async function save(values: FormValues) {
    setServerError("");
    const endpoint = editingId ? `/api/products/${editingId}` : "/api/products";
    const response = await fetch(endpoint, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        categoryId: values.categoryId,
        images: splitProductImageUrls(values.images)
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

  async function uploadProductImages(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setServerError("");
    const selectedFiles = Array.from(files);
    const currentUrls = splitProductImageUrls(getValues("images"));
    const remainingSlots = MAX_PRODUCT_IMAGES - currentUrls.length;

    if (remainingSlots <= 0) {
      setServerError(`Products can have at most ${MAX_PRODUCT_IMAGES} images`);
      return;
    }

    if (selectedFiles.length > remainingSlots) {
      setServerError(
        `You can add ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"}`
      );
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("purpose", "ADMIN_PRODUCT_IMAGE");
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        const result = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !result.url) {
          throw new Error(result.error ?? "Unable to upload image");
        }
        uploadedUrls.push(result.url);
      }

      updateImageUrls([...currentUrls, ...uploadedUrls]);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Unable to upload image"
      );
    } finally {
      setIsUploading(false);
    }
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

  async function saveTemplate(templateData: { id?: string; nameVi: string; nameEn: string; fields: any[] }) {
    setTemplateFormError("");
    const isEdit = !!templateData.id;
    const endpoint = isEdit ? `/api/admin/size-templates/${templateData.id}` : "/api/admin/size-templates";
    
    try {
      const res = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData)
      });
      
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? "Failed to save template");
      }
      
      if (isEdit) {
        setTemplates(prev => prev.map(t => t.id === templateData.id ? result.data : t));
      } else {
        setTemplates(prev => [result.data, ...prev]);
      }
      setEditingTemplate(null);
    } catch (err: any) {
      setTemplateFormError(err.message || "An error occurred");
    }
  }

  async function deleteTemplate(id: string) {
    if (!window.confirm("Are you sure you want to delete this template? Products using it will revert to default (shirt) fields.")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/size-templates/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? "Failed to delete template");
      }
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (selectedTemplateId === id) {
        setValue("sizeTemplateId", "");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  }

  return (
    <>
      <div className="mb-5 grid gap-3 xl:grid-cols-[minmax(260px,1fr)_190px_170px_170px_auto]">
        <label className="relative min-w-0">
          <span className="sr-only">Search products</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            size={17}
          />
          <input
            className="min-h-11 w-full border border-zinc-300 bg-white py-2 pl-10 pr-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#a72b1f] focus:ring-2 focus:ring-[#a72b1f]/15"
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search name or slug..."
            type="search"
            value={query}
          />
        </label>
        <select
          aria-label="Filter by category"
          className="min-h-11 border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900 outline-none focus:border-[#a72b1f]"
          onChange={(event) => updateCategory(event.target.value)}
          value={categoryFilter}
        >
          <option value="ALL">All categories / Tất cả danh mục</option>
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameEn} / {category.nameVi}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by visibility"
          className="min-h-11 border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900 outline-none focus:border-[#a72b1f]"
          onChange={(event) => updateVisibility(event.target.value)}
          value={visibilityFilter}
        >
          <option value="ACTIVE">Active / Hoạt động</option>
          <option value="ALL">All status / Tất cả trạng thái</option>
          <option value="INACTIVE">Inactive / Không hoạt động (Lưu trữ)</option>
          <option value="FEATURED">Featured / Nổi bật</option>
        </select>
        <select
          aria-label="Filter by stock"
          className="min-h-11 border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900 outline-none focus:border-[#a72b1f]"
          onChange={(event) => updateStock(event.target.value)}
          value={stockFilter}
        >
          <option value="ALL">All stock / Tất cả tồn kho</option>
          <option value="IN_STOCK">In stock / Còn hàng</option>
          <option value="OUT_OF_STOCK">Out of stock / Hết hàng</option>
        </select>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#171715] px-5 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#a72b1f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a72b1f]"
          onClick={createProduct}
          type="button"
        >
          <Plus size={16} />
          New product
        </button>
      </div>
      <AdminTable
        headers={[
          "Product",
          "Category",
          "Price",
          "Stock",
          "Featured",
          "Active",
          "Actions"
        ]}
      >
        {paginatedProducts.map((product) => (
          <tr key={product.id}>
            <td className="px-4 py-4">
              <p className="font-bold">{product.nameEn}</p>
              <p className="mt-1 text-xs text-zinc-500">{product.slug}</p>
              {product.images.length > 0 ? (
                <div className="mt-3 flex max-w-[320px] gap-2 overflow-x-auto pb-1">
                  {product.images.map((image, index) => (
                    <div
                      className="relative size-12 shrink-0 overflow-hidden border border-zinc-200 bg-zinc-100"
                      key={image.id}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={`${product.nameEn} image ${index + 1}`}
                        className="h-full w-full object-cover"
                        src={image.url}
                      />
                      {index === 0 ? (
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-center text-[0.5rem] font-black uppercase tracking-[0.08em] text-white">
                          Primary
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-zinc-400">No images</p>
              )}
            </td>
            <td className="px-4 py-4">
              <CategoryBadge
                category={product.categoryRecord?.nameEn ?? "Uncategorized"}
              />
            </td>
            <td className="px-4 py-4">
              {new Intl.NumberFormat("vi-VN").format(product.basePrice)}{" "}
              VND
              {product.variants.length ? (
                <p className="mt-1 text-xs text-zinc-500">
                  {product.variants.length} variants
                </p>
              ) : null}
            </td>
            <td className="px-4 py-4">
              <StockBadge status={product.stockStatus} />
            </td>
            <td className="px-4 py-4">
              <BooleanBadge enabled={product.isFeatured} label="Featured" />
            </td>
            <td className="px-4 py-4">
              <BooleanBadge
                enabled={product.isActive}
                label={product.isActive ? "Active" : "Inactive"}
              />
            </td>
            <td className="px-4 py-4">
              <div className="flex gap-2">
                <button
                  aria-label="Edit product"
                  className="grid size-10 place-items-center border border-zinc-300 bg-white text-zinc-800 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                  onClick={() => editProduct(product)}
                  type="button"
                >
                  <Pencil size={15} />
                </button>
                <button
                  aria-label="Delete product"
                  className="grid size-10 place-items-center border border-red-200 bg-white text-red-700 transition-colors hover:border-red-700 hover:bg-red-700 hover:text-white"
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
      {filteredProducts.length === 0 ? (
        <div className="border-x border-b border-zinc-200 bg-white px-5 py-12 text-center text-sm text-zinc-500">
          No products match the selected filters.
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 border border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-zinc-500">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, filteredProducts.length)} of{" "}
            {filteredProducts.length} products
          </p>
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous page"
              className="grid size-9 place-items-center border border-zinc-300 bg-white text-zinc-800 transition-colors hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-300"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              type="button"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-24 text-center text-xs font-bold text-zinc-700">
              Page {currentPage} / {pageCount}
            </span>
            <button
              aria-label="Next page"
              className="grid size-9 place-items-center border border-zinc-300 bg-white text-zinc-800 transition-colors hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-300"
              disabled={currentPage === pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              type="button"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4">
          <div className="mx-auto my-6 max-w-4xl border border-zinc-200 bg-white p-5 text-zinc-950 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black">
                {editingId ? "Edit product" : "New product"}
              </h2>
              <button
                aria-label="Close"
                className="grid size-10 place-items-center bg-zinc-100 text-zinc-800 transition-colors hover:bg-zinc-900 hover:text-white"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X />
              </button>
            </div>
            <form
              className="mt-6 grid gap-5 sm:grid-cols-2"
              onSubmit={handleSubmit(save, (errs) => {
                const firstErrorKey = Object.keys(errs)[0];
                if (firstErrorKey) {
                  const errorElement = document.getElementsByName(firstErrorKey)[0] ||
                                       document.querySelector(`[name^="${firstErrorKey}"]`);
                  if (errorElement) {
                    errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
                    if (typeof (errorElement as HTMLElement).focus === "function") {
                      (errorElement as HTMLElement).focus();
                    }
                  }
                }
              })}
            >
              <AdminField label="Name (VI) / Tên (Tiếng Việt)" error={errors.nameVi?.message}>
                <input className="field" {...register("nameVi")} />
              </AdminField>
              <AdminField label="Name (EN) / Tên (Tiếng Anh)" error={errors.nameEn?.message}>
                <input className="field" {...register("nameEn")} />
              </AdminField>
              <AdminField label="Slug / Đường dẫn tĩnh (vd: sukajan-hac-song)" error={errors.slug?.message}>
                <input className="field" {...register("slug")} />
              </AdminField>
              <AdminField
                label="Catalog category / Danh mục sản phẩm"
                error={errors.categoryId?.message}
              >
                <select className="field" {...register("categoryId")}>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nameEn} / {category.nameVi}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField
                label="Base price (VND) / Giá gốc (VND)"
                error={errors.basePrice?.message}
              >
                <input
                  className="field"
                  type="number"
                  {...register("basePrice", { valueAsNumber: true })}
                />
              </AdminField>
              <AdminField
                label="Lead time min days / Hẹn giao tối thiểu (ngày)"
                error={errors.orderLeadTimeMinDays?.message}
              >
                <input
                  className="field"
                  type="number"
                  {...register("orderLeadTimeMinDays", { valueAsNumber: true })}
                />
              </AdminField>
              <AdminField
                label="Lead time max days / Hẹn giao tối đa (ngày)"
                error={errors.orderLeadTimeMaxDays?.message}
              >
                <input
                  className="field"
                  type="number"
                  {...register("orderLeadTimeMaxDays", { valueAsNumber: true })}
                />
              </AdminField>
              {/* Bilingual Guidance Box */}
              <div className="sm:col-span-2 border-l-4 border-amber-500 bg-amber-50 p-4 text-amber-900 text-xs space-y-3 rounded-r-md">
                <h4 className="font-bold text-sm uppercase tracking-wide flex items-center gap-1.5">
                  💡 Guide & Instructions / Hướng dẫn nhập liệu
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="font-bold text-[#a72b1f]">🇺🇸 ENGLISH GUIDE</p>
                    <ul className="list-disc list-inside space-y-1 text-zinc-700">
                      <li><strong>Price Adjustment:</strong> Value added to base price. E.g. base is 1,500,000 and adjustment is 100,000 &rarr; final variant price is 1,600,000 VND. Set <code className="bg-zinc-200 px-1 rounded">0</code> for no adjustment.</li>
                      <li><strong>Color (EN):</strong> Color name shown to English storefront users (e.g., &quot;Black&quot;, &quot;Navy&quot;).</li>
                      <li><strong>Size Chart:</strong> Enter measurements (Shoulder, Chest, etc.) for each size. Select unit (<code className="bg-zinc-200 px-1 rounded">cm</code> / <code className="bg-zinc-200 px-1 rounded">inch</code>). Leave empty if not applicable.</li>
                    </ul>
                  </div>
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-amber-200 pt-3 sm:pt-0 sm:pl-4">
                    <p className="font-bold text-[#a72b1f]">🇻🇳 HƯỚNG DẪN TIẾNG VIỆT</p>
                    <ul className="list-disc list-inside space-y-1 text-zinc-700">
                      <li><strong>Điều chỉnh giá:</strong> Số tiền cộng thêm vào giá gốc. VD: Giá gốc 1.500.000đ, điều chỉnh giá là 100.000đ &rarr; giá biến thể này là 1.600.000đ. Nhập <code className="bg-zinc-200 px-1 rounded">0</code> nếu không đổi.</li>
                      <li><strong>Màu (VI):</strong> Tên màu hiển thị ở giao diện tiếng Việt (vd: &quot;Đen&quot;, &quot;Xanh Navy&quot;).</li>
                      <li><strong>Bảng Size:</strong> Nhập kích thước vai, ngực, dài áo, tay áo tương ứng từng size. Chọn đơn vị <code className="bg-zinc-200 px-1 rounded">cm</code> / <code className="bg-zinc-200 px-1 rounded">inch</code>. Bỏ trống nếu không có.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div className="sm:col-span-2 border border-zinc-200 p-4 bg-zinc-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">Product Variants / Biến thể sản phẩm</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Manage product sizing, colors, pricing adjustments, and availability. / Quản lý kích thước, màu sắc, điều chỉnh giá và trạng thái còn hàng.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => appendVariant({ size: "", colorVi: "", colorEn: "", priceAdjustment: 0, isAvailable: true })}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-[#a72b1f] transition-colors"
                  >
                    <Plus size={14} /> Add Variant / Thêm biến thể
                  </button>
                </div>

                {errors.variants?.message && (
                  <p className="text-xs font-bold text-red-600 mb-3">{errors.variants.message}</p>
                )}

                {/* Desktop View */}
                {(!isMounted || !isMobile) && (
                  <div className="hidden md:block overflow-x-auto border border-zinc-200">
                  <table className="w-full text-left text-xs bg-white min-w-[500px]">
                    <thead className="bg-zinc-100 uppercase tracking-wider text-zinc-700 font-bold border-b border-zinc-200">
                      <tr>
                        <th className="px-3 py-2.5 w-[90px]">Size / Size *</th>
                        <th className="px-3 py-2.5">Color (VI) / Màu (VI) *</th>
                        <th className="px-3 py-2.5">Color (EN) / Màu (EN)</th>
                        <th className="px-3 py-2.5 w-[160px]">Price Adj / Chênh giá (VND)</th>
                        <th className="px-3 py-2.5 w-[100px] text-center">Available / Có sẵn</th>
                        <th className="px-3 py-2.5 w-[70px] text-center">Remove / Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {variantFields.map((field, index) => (
                        <tr key={field.id} className="hover:bg-zinc-50/50">
                          <td className="p-2">
                            <input
                              className="field py-1 px-2 text-xs w-full"
                              placeholder="e.g. M"
                              {...register(`variants.${index}.size` as const)}
                            />
                            {errors.variants?.[index]?.size?.message && (
                              <p className="text-[10px] text-red-600 mt-0.5">{errors.variants[index].size.message}</p>
                            )}
                          </td>
                          <td className="p-2">
                            <input
                              className="field py-1 px-2 text-xs w-full"
                              placeholder="e.g. Đen"
                              {...register(`variants.${index}.colorVi` as const)}
                            />
                            {errors.variants?.[index]?.colorVi?.message && (
                              <p className="text-[10px] text-red-600 mt-0.5">{errors.variants[index].colorVi.message}</p>
                            )}
                          </td>
                          <td className="p-2">
                            <input
                              className="field py-1 px-2 text-xs w-full"
                              placeholder="e.g. Black"
                              {...register(`variants.${index}.colorEn` as const)}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              className="field py-1 px-2 text-xs w-full"
                              {...register(`variants.${index}.priceAdjustment` as const, {
                                setValueAs: (value) => (value === "" || value === null || value === undefined || Number.isNaN(Number(value)) ? 0 : Number(value))
                              })}
                            />
                            {errors.variants?.[index]?.priceAdjustment?.message && (
                              <p className="text-[10px] text-red-600 mt-0.5">{errors.variants[index].priceAdjustment.message}</p>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              className="size-5 rounded border-zinc-300 text-[#a72b1f] focus:ring-[#a72b1f] cursor-pointer"
                              {...register(`variants.${index}.isAvailable` as const)}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="text-zinc-400 hover:text-red-600 p-1 transition-colors inline-flex items-center justify-center"
                              title="Remove variant"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {variantFields.length === 0 && (
                    <div className="p-6 text-center text-zinc-500 bg-white">
                      No variants added. Click &quot;Add Variant&quot; to create one.
                    </div>
                  )}
                  </div>
                )}

                {/* Mobile View */}
                {isMounted && isMobile && (
                  <div className="block md:hidden space-y-3">
                  {variantFields.map((field, index) => (
                    <div key={field.id} className="bg-white border border-zinc-200 p-4 rounded-md shadow-sm relative space-y-3">
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-zinc-400 hover:text-red-600 p-2 transition-colors inline-flex items-center justify-center bg-zinc-50 hover:bg-red-50 rounded-full"
                          title="Remove variant"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="pr-10 grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-[10px] uppercase font-bold text-zinc-500">Size / Kích thước *</span>
                          <input
                            className="field mt-1 py-1.5 px-2 text-xs w-full font-bold"
                            placeholder="e.g. M"
                            {...register(`variants.${index}.size` as const)}
                          />
                          {errors.variants?.[index]?.size?.message && (
                            <p className="text-[10px] text-red-600 mt-0.5">{errors.variants[index].size.message}</p>
                          )}
                        </label>
                        <label className="block">
                          <span className="text-[10px] uppercase font-bold text-zinc-500">Price Adj / Chênh giá (VND)</span>
                          <input
                            type="number"
                            className="field mt-1 py-1.5 px-2 text-xs w-full font-bold text-[#a72b1f]"
                            placeholder="0"
                            {...register(`variants.${index}.priceAdjustment` as const, {
                              setValueAs: (value) => (value === "" || value === null || value === undefined || Number.isNaN(Number(value)) ? 0 : Number(value))
                            })}
                          />
                          {errors.variants?.[index]?.priceAdjustment?.message && (
                            <p className="text-[10px] text-red-600 mt-0.5">{errors.variants[index].priceAdjustment.message}</p>
                          )}
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-[10px] uppercase font-bold text-zinc-500">Color (VI) / Màu (VI) *</span>
                          <input
                            className="field mt-1 py-1.5 px-2 text-xs w-full"
                            placeholder="e.g. Đen"
                            {...register(`variants.${index}.colorVi` as const)}
                          />
                          {errors.variants?.[index]?.colorVi?.message && (
                            <p className="text-[10px] text-red-600 mt-0.5">{errors.variants[index].colorVi.message}</p>
                          )}
                        </label>
                        <label className="block">
                          <span className="text-[10px] uppercase font-bold text-zinc-500">Color (EN) / Màu (EN)</span>
                          <input
                            className="field mt-1 py-1.5 px-2 text-xs w-full"
                            placeholder="e.g. Black"
                            {...register(`variants.${index}.colorEn` as const)}
                          />
                        </label>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            className="size-5 rounded border-zinc-300 text-[#a72b1f] focus:ring-[#a72b1f] accent-black cursor-pointer"
                            {...register(`variants.${index}.isAvailable` as const)}
                          />
                          Available / Có sẵn
                        </label>
                        <span className="text-[10px] text-zinc-400 font-bold">Variant #{index + 1}</span>
                      </div>
                    </div>
                  ))}
                  {variantFields.length === 0 && (
                    <div className="p-6 text-center text-zinc-500 bg-white border border-dashed border-zinc-300 rounded-md">
                      No variants added. Click &quot;Add Variant / Thêm biến thể&quot; to create one.
                    </div>
                  )}
                  </div>
                )}
              </div>

              {/* Size Chart Section */}
              <div className="sm:col-span-2 border border-zinc-200 p-4 bg-zinc-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">Product Size Chart / Bảng Size sản phẩm</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Define detailed measurements for each size. / Định nghĩa số đo chi tiết cho từng kích thước của sản phẩm.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="min-h-9 border border-zinc-300 bg-white px-2 py-1 text-xs font-bold text-zinc-900 outline-none focus:border-[#a72b1f] focus:ring-2 focus:ring-[#a72b1f]/15"
                      {...register("sizeTemplateId")}
                    >
                      <option value="">Default (Shirt / Áo)</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nameEn} / {t.nameVi}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setTemplatesModalOpen(true)}
                      className="min-h-9 px-3 py-1 text-xs font-bold border border-zinc-300 bg-white hover:bg-zinc-50 transition-colors"
                    >
                      Manage Templates / Quản lý mẫu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const templateInitValues: any = { size: "", unit: "cm" };
                        if (activeTemplate) {
                          templateInitValues.measurements = {};
                          activeTemplate.fields.forEach(f => {
                            templateInitValues.measurements[f.key] = undefined;
                          });
                        } else {
                          templateInitValues.shoulder = undefined;
                          templateInitValues.chest = undefined;
                          templateInitValues.length = undefined;
                          templateInitValues.sleeve = undefined;
                        }
                        appendSizeChart(templateInitValues);
                      }}
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-[#a72b1f] transition-colors"
                    >
                      <Plus size={14} /> Add Size Row / Thêm hàng kích thước
                    </button>
                  </div>
                </div>

                {errors.sizeCharts?.message && (
                  <p className="text-xs font-bold text-red-600 mb-3">{errors.sizeCharts.message}</p>
                )}

                {/* Desktop View */}
                {(!isMounted || !isMobile) && (
                  <div className="hidden md:block overflow-x-auto border border-zinc-200">
                  <table className="w-full text-left text-xs bg-white min-w-[500px]">
                    <thead className="bg-zinc-100 uppercase tracking-wider text-zinc-700 font-bold border-b border-zinc-200">
                      <tr>
                        <th className="px-3 py-2.5 w-[90px]">Size / Size *</th>
                        {activeTemplate ? (
                          activeTemplate.fields.map((field) => (
                            <th className="px-3 py-2.5" key={field.key}>
                              {field.nameEn} / {field.nameVi}
                            </th>
                          ))
                        ) : (
                          <>
                            <th className="px-3 py-2.5">Shoulder / Vai</th>
                            <th className="px-3 py-2.5">Chest / Ngực</th>
                            <th className="px-3 py-2.5">Length / Dài</th>
                            <th className="px-3 py-2.5">Sleeve / Tay</th>
                          </>
                        )}
                        <th className="px-3 py-2.5 w-[95px]">Unit / Đơn vị</th>
                        <th className="px-3 py-2.5 w-[70px] text-center">Remove / Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {sizeChartFields.map((field, index) => (
                        <tr key={field.id} className="hover:bg-zinc-50/50">
                          <td className="p-2">
                            <input
                              className="field py-1 px-2 text-xs w-full"
                              placeholder="e.g. M"
                              {...register(`sizeCharts.${index}.size` as const)}
                            />
                            {errors.sizeCharts?.[index]?.size?.message && (
                              <p className="text-[10px] text-red-600 mt-0.5">{errors.sizeCharts[index].size.message}</p>
                            )}
                          </td>
                          {activeTemplate ? (
                            activeTemplate.fields.map((f) => (
                              <td className="p-2" key={f.key}>
                                <input
                                  type="number"
                                  step="any"
                                  className="field py-1 px-2 text-xs w-full"
                                  placeholder="cm / in"
                                  {...register(`sizeCharts.${index}.measurements.${f.key}` as const, {
                                    setValueAs: (value) => (value === "" || value === null || value === undefined ? undefined : Number(value))
                                  })}
                                />
                                {errors.sizeCharts?.[index]?.measurements?.[f.key]?.message && (
                                  <p className="text-[9px] text-red-600 mt-0.5">{errors.sizeCharts[index].measurements[f.key].message}</p>
                                )}
                              </td>
                            ))
                          ) : (
                            <>
                              <td className="p-2">
                                <input
                                  type="number"
                                  step="any"
                                  className="field py-1 px-2 text-xs w-full"
                                  placeholder="cm / in"
                                  {...register(`sizeCharts.${index}.shoulder` as const, {
                                    setValueAs: (value) => (value === "" || value === null || value === undefined ? undefined : Number(value))
                                  })}
                                />
                                {errors.sizeCharts?.[index]?.shoulder?.message && (
                                  <p className="text-[9px] text-red-600 mt-0.5">{errors.sizeCharts[index].shoulder.message}</p>
                                )}
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  step="any"
                                  className="field py-1 px-2 text-xs w-full"
                                  placeholder="cm / in"
                                  {...register(`sizeCharts.${index}.chest` as const, {
                                    setValueAs: (value) => (value === "" || value === null || value === undefined ? undefined : Number(value))
                                  })}
                                />
                                {errors.sizeCharts?.[index]?.chest?.message && (
                                  <p className="text-[9px] text-red-600 mt-0.5">{errors.sizeCharts[index].chest.message}</p>
                                )}
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  step="any"
                                  className="field py-1 px-2 text-xs w-full"
                                  placeholder="cm / in"
                                  {...register(`sizeCharts.${index}.length` as const, {
                                    setValueAs: (value) => (value === "" || value === null || value === undefined ? undefined : Number(value))
                                  })}
                                />
                                {errors.sizeCharts?.[index]?.length?.message && (
                                  <p className="text-[9px] text-red-600 mt-0.5">{errors.sizeCharts[index].length.message}</p>
                                )}
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  step="any"
                                  className="field py-1 px-2 text-xs w-full"
                                  placeholder="cm / in"
                                  {...register(`sizeCharts.${index}.sleeve` as const, {
                                    setValueAs: (value) => (value === "" || value === null || value === undefined ? undefined : Number(value))
                                  })}
                                />
                                {errors.sizeCharts?.[index]?.sleeve?.message && (
                                  <p className="text-[9px] text-red-600 mt-0.5">{errors.sizeCharts[index].sleeve.message}</p>
                                )}
                              </td>
                            </>
                          )}
                          <td className="p-2">
                            <select
                              className="field py-1 px-2 text-xs w-full font-bold"
                              {...register(`sizeCharts.${index}.unit` as const)}
                            >
                              <option value="cm">cm</option>
                              <option value="inch">inch</option>
                            </select>
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeSizeChart(index)}
                              className="text-zinc-400 hover:text-red-600 p-1 transition-colors inline-flex items-center justify-center"
                              title="Remove row"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sizeChartFields.length === 0 && (
                    <div className="p-6 text-center text-zinc-500 bg-white">
                      No size chart measurements added. Click &quot;Add Size Row&quot; to create one.
                    </div>
                  )}
                  </div>
                )}

                {/* Mobile View */}
                {isMounted && isMobile && (
                  <div className="block md:hidden space-y-3">
                  {sizeChartFields.map((field, index) => (
                    <div key={field.id} className="bg-white border border-zinc-200 p-4 rounded-md shadow-sm relative space-y-3">
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={() => removeSizeChart(index)}
                          className="text-zinc-400 hover:text-red-600 p-2 transition-colors inline-flex items-center justify-center bg-zinc-50 hover:bg-red-50 rounded-full"
                          title="Remove row"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="pr-10 grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-[10px] uppercase font-bold text-zinc-500">Size / Size *</span>
                          <input
                            className="field mt-1 py-1.5 px-2 text-xs w-full font-bold"
                            placeholder="e.g. M"
                            {...register(`sizeCharts.${index}.size` as const)}
                          />
                          {errors.sizeCharts?.[index]?.size?.message && (
                            <p className="text-[10px] text-red-600 mt-0.5">{errors.sizeCharts[index].size.message}</p>
                          )}
                        </label>
                        <label className="block">
                          <span className="text-[10px] uppercase font-bold text-zinc-500">Unit / Đơn vị</span>
                          <select
                            className="field mt-1 py-1.5 px-2 text-xs w-full font-bold"
                            {...register(`sizeCharts.${index}.unit` as const)}
                          >
                            <option value="cm">cm</option>
                            <option value="inch">inch</option>
                          </select>
                        </label>
                      </div>

                      {activeTemplate ? (
                        <div className="grid grid-cols-2 gap-3">
                          {activeTemplate.fields.map((f) => (
                            <label className="block" key={f.key}>
                              <span className="text-[10px] uppercase font-bold text-zinc-500">{f.nameEn} / {f.nameVi}</span>
                              <input
                                type="number"
                                step="any"
                                className="field mt-1 py-1.5 px-2 text-xs w-full"
                                placeholder="-"
                                {...register(`sizeCharts.${index}.measurements.${f.key}` as const, {
                                  setValueAs: (value) => (value === "" || value === null || value === undefined ? undefined : Number(value))
                                })}
                              />
                              {errors.sizeCharts?.[index]?.measurements?.[f.key]?.message && (
                                <p className="text-[10px] text-red-600 mt-0.5">{errors.sizeCharts[index].measurements[f.key].message}</p>
                              )}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                              <span className="text-[10px] uppercase font-bold text-zinc-500">Shoulder / Vai</span>
                              <input
                                type="number"
                                step="any"
                                className="field mt-1 py-1.5 px-2 text-xs w-full"
                                placeholder="-"
                                {...register(`sizeCharts.${index}.shoulder` as const, {
                                  setValueAs: (value) => (value === "" || value === null || value === undefined ? undefined : Number(value))
                                })}
                              />
                              {errors.sizeCharts?.[index]?.shoulder?.message && (
                                <p className="text-[10px] text-red-600 mt-0.5">{errors.sizeCharts[index].shoulder.message}</p>
                              )}
                            </label>
                            <label className="block">
                              <span className="text-[10px] uppercase font-bold text-zinc-500">Chest / Ngực</span>
                              <input
                                type="number"
                                step="any"
                                className="field mt-1 py-1.5 px-2 text-xs w-full"
                                placeholder="-"
                                {...register(`sizeCharts.${index}.chest` as const, {
                                  setValueAs: (value) => (value === "" || value === null || value === undefined ? undefined : Number(value))
                                })}
                              />
                              {errors.sizeCharts?.[index]?.chest?.message && (
                                <p className="text-[10px] text-red-600 mt-0.5">{errors.sizeCharts[index].chest.message}</p>
                              )}
                            </label>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                              <span className="text-[10px] uppercase font-bold text-zinc-500">Length / Dài</span>
                              <input
                                type="number"
                                step="any"
                                className="field mt-1 py-1.5 px-2 text-xs w-full"
                                placeholder="-"
                                {...register(`sizeCharts.${index}.length` as const, {
                                  setValueAs: (value) => (value === "" || value === null || value === undefined ? undefined : Number(value))
                                })}
                              />
                              {errors.sizeCharts?.[index]?.length?.message && (
                                <p className="text-[10px] text-red-600 mt-0.5">{errors.sizeCharts[index].length.message}</p>
                              )}
                            </label>
                            <label className="block">
                              <span className="text-[10px] uppercase font-bold text-zinc-500">Sleeve / Tay</span>
                              <input
                                type="number"
                                step="any"
                                className="field mt-1 py-1.5 px-2 text-xs w-full"
                                placeholder="-"
                                {...register(`sizeCharts.${index}.sleeve` as const, {
                                  setValueAs: (value) => (value === "" || value === null || value === undefined ? undefined : Number(value))
                                })}
                              />
                              {errors.sizeCharts?.[index]?.sleeve?.message && (
                                <p className="text-[10px] text-red-600 mt-0.5">{errors.sizeCharts[index].sleeve.message}</p>
                              )}
                            </label>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-end border-t border-zinc-100 pt-2">
                        <span className="text-[10px] text-zinc-400 font-bold">Size Chart #{index + 1}</span>
                      </div>
                    </div>
                  ))}
                  {sizeChartFields.length === 0 && (
                    <div className="p-6 text-center text-zinc-500 bg-white border border-dashed border-zinc-300 rounded-md">
                      No size chart measurements added. Click &quot;Add Size Row / Thêm hàng kích thước&quot; to create one.
                    </div>
                  )}
                  </div>
                )}
              </div>
              <AdminField label="Material (VI) / Chất liệu (Tiếng Việt)" error={errors.materialVi?.message}>
                <input className="field" {...register("materialVi")} />
              </AdminField>
              <AdminField label="Material (EN) / Chất liệu (Tiếng Anh)" error={errors.materialEn?.message}>
                <input className="field" {...register("materialEn")} />
              </AdminField>
              <AdminField label="Stock status / Trạng thái kho hàng" error={errors.stockStatus?.message}>
                <select className="field" {...register("stockStatus")}>
                  <option value="IN_STOCK">In stock / Còn hàng</option>
                  <option value="OUT_OF_STOCK">Out of stock / Hết hàng</option>
                </select>
              </AdminField>
              <div className="sm:col-span-2">
                <AdminField
                  label="Image URLs / Link hình ảnh (mỗi dòng một link hoặc upload phía dưới)"
                  error={errors.images?.message}
                >
                  <label
                    aria-disabled={isUploading || imageUploadLimitReached}
                    className={`mb-3 flex min-h-32 flex-col items-center justify-center border border-dashed p-5 text-center transition-colors ${
                      imageUploadLimitReached
                        ? "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
                        : "cursor-pointer border-zinc-300 bg-zinc-50 hover:border-[#a72b1f] hover:bg-red-50/40"
                    }`}
                  >
                    <ImagePlus className="text-[#a72b1f]" size={28} />
                    <span className="mt-3 text-sm font-bold">
                      {isUploading
                        ? "Uploading images... / Đang tải ảnh lên..."
                        : imageUploadLimitReached
                          ? "Image limit reached / Đã đạt giới hạn ảnh"
                          : "Upload product images / Tải ảnh sản phẩm"}
                    </span>
                    <span className="mt-1 text-xs text-zinc-500">
                      JPG, PNG or WebP. Max 5 MB per image. {imageUrls.length}/
                      {MAX_PRODUCT_IMAGES} images. / Định dạng JPG, PNG hoặc WebP. Tối đa 5 MB mỗi ảnh. {imageUrls.length}/{MAX_PRODUCT_IMAGES} ảnh.
                    </span>
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={isUploading || imageUploadLimitReached}
                      multiple
                      onChange={(event) => {
                        void uploadProductImages(event.target.files);
                        event.target.value = "";
                      }}
                      type="file"
                    />
                  </label>
                  {imageUrls.length > 0 && (
                    <div className="mb-3 grid gap-3 sm:grid-cols-2">
                      {imageUrls.map((url, index) => (
                        <div
                          className="grid gap-3 border border-zinc-200 bg-white p-2 sm:grid-cols-[96px_1fr]"
                          key={`${url}-${index}`}
                        >
                          <div className="relative aspect-square overflow-hidden bg-zinc-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt={`Product preview ${index + 1}`}
                              className="h-full w-full object-cover"
                              src={url}
                            />
                            {index === 0 ? (
                              <span className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-white">
                                Primary
                              </span>
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-zinc-900">
                              Image {index + 1}
                            </p>
                            <p className="mt-1 truncate text-[0.65rem] text-zinc-500">
                              {url}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                aria-label={`Move image ${index + 1} earlier`}
                                className="grid size-8 place-items-center border border-zinc-300 bg-white text-zinc-800 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-300"
                                disabled={index === 0}
                                onClick={() =>
                                  updateImageUrls(
                                    moveProductImageUrl(
                                      imageUrls,
                                      index,
                                      "earlier"
                                    )
                                  )
                                }
                                title="Move earlier"
                                type="button"
                              >
                                <ChevronLeft size={15} />
                              </button>
                              <button
                                aria-label={`Move image ${index + 1} later`}
                                className="grid size-8 place-items-center border border-zinc-300 bg-white text-zinc-800 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-300"
                                disabled={index === imageUrls.length - 1}
                                onClick={() =>
                                  updateImageUrls(
                                    moveProductImageUrl(
                                      imageUrls,
                                      index,
                                      "later"
                                    )
                                  )
                                }
                                title="Move later"
                                type="button"
                              >
                                <ChevronRight size={15} />
                              </button>
                              <button
                                aria-label={`Set image ${index + 1} as primary`}
                                className="min-h-8 border border-zinc-300 bg-white px-2 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-zinc-800 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-300"
                                disabled={index === 0}
                                onClick={() =>
                                  updateImageUrls(
                                    setPrimaryProductImageUrl(imageUrls, index)
                                  )
                                }
                                title="Set as primary"
                                type="button"
                              >
                                Primary
                              </button>
                              <button
                                aria-label={`Remove image ${index + 1}`}
                                className="grid size-8 place-items-center border border-red-200 bg-white text-red-700 transition-colors hover:border-red-700 hover:bg-red-700 hover:text-white"
                                onClick={() =>
                                  updateImageUrls(
                                    removeProductImageUrl(imageUrls, index)
                                  )
                                }
                                title="Remove image"
                                type="button"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea
                    className="field min-h-12 text-xs text-zinc-400"
                    placeholder="Image URLs (one per line) — or upload above"
                    {...register("images")}
                  />
                </AdminField>
              </div>
              <div className="sm:col-span-2">
                <Controller
                  control={control}
                  name="descriptionVi"
                  render={({ field }) => (
                    <AdminMarkdownEditor
                      label="Description (VI) / Mô tả sản phẩm (Tiếng Việt)"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.descriptionVi?.message}
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-2">
                <Controller
                  control={control}
                  name="descriptionEn"
                  render={({ field }) => (
                    <AdminMarkdownEditor
                      label="Description (EN) / Mô tả sản phẩm (Tiếng Anh)"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.descriptionEn?.message}
                    />
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3.5 sm:col-span-2 border border-zinc-200 bg-zinc-50/50 p-4 rounded-md">
                <div className="col-span-2 border-b border-zinc-200 pb-2 mb-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700">Trạng thái sản phẩm / Product Status</h3>
                </div>
                <label className="flex items-center justify-between border border-zinc-200 bg-white p-3 rounded cursor-pointer select-none transition-colors hover:bg-zinc-50 col-span-1">
                  <div className="flex flex-col pr-2">
                    <span className="text-xs font-bold text-zinc-800">Featured / Nổi bật</span>
                    <span className="text-[9px] text-zinc-500 font-medium leading-tight">Hiện trên trang chủ</span>
                  </div>
                  <div className="relative shrink-0">
                    <input type="checkbox" {...register("isFeatured")} className="sr-only peer" />
                    <div className="w-9 h-5.5 bg-zinc-350 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[14px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#a72b1f] transition-colors duration-200" />
                  </div>
                </label>
                <label className="flex items-center justify-between border border-zinc-200 bg-white p-3 rounded cursor-pointer select-none transition-colors hover:bg-zinc-50 col-span-1">
                  <div className="flex flex-col pr-2">
                    <span className="text-xs font-bold text-zinc-800">Active / Kích hoạt</span>
                    <span className="text-[9px] text-zinc-500 font-medium leading-tight">Cho phép khách mua</span>
                  </div>
                  <div className="relative shrink-0">
                    <input type="checkbox" {...register("isActive")} className="sr-only peer" />
                    <div className="w-9 h-5.5 bg-zinc-350 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[14px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#a72b1f] transition-colors duration-200" />
                  </div>
                </label>
              </div>
              {serverError ? (
                <p className="error-text sm:col-span-2">{serverError}</p>
              ) : null}
              <button
                className="inline-flex min-h-12 items-center justify-center bg-[#171715] px-6 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#a72b1f] disabled:cursor-wait disabled:bg-zinc-300 disabled:text-zinc-600 sm:col-span-2 sm:justify-self-start"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Saving... / Đang lưu..." : "Save product / Lưu sản phẩm"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* Size Templates Management Modal */}
      {templatesModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4">
          <div className="mx-auto my-8 w-full max-w-2xl border border-zinc-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
              <h2 className="text-xl font-black">Manage Size Templates / Quản lý Mẫu Bảng Size</h2>
              <button
                type="button"
                onClick={() => {
                  setTemplatesModalOpen(false);
                  setEditingTemplate(null);
                }}
                className="text-zinc-400 hover:text-black cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {templateFormError && (
              <p className="mb-4 text-xs font-bold text-red-600">{templateFormError}</p>
            )}

            {editingTemplate ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as HTMLFormElement;
                  const nameVi = (target.elements.namedItem("nameVi") as HTMLInputElement).value;
                  const nameEn = (target.elements.namedItem("nameEn") as HTMLInputElement).value;
                  
                  // Collect fields
                  const keys = target.querySelectorAll("[name^='field-key-']");
                  const fields: any[] = [];
                  keys.forEach((el: any) => {
                    const idx = el.name.replace("field-key-", "");
                    const nameViInput = target.querySelector(`[name='field-nameVi-${idx}']`) as HTMLInputElement;
                    const nameEnInput = target.querySelector(`[name='field-nameEn-${idx}']`) as HTMLInputElement;
                    if (el.value.trim()) {
                      fields.push({
                        key: el.value.trim().toLowerCase(),
                        nameVi: nameViInput.value.trim(),
                        nameEn: nameEnInput.value.trim()
                      });
                    }
                  });

                  if (!nameVi || !nameEn || fields.length === 0) {
                    setTemplateFormError("Please fill out names and add at least one valid field / Vui lòng điền tên và thêm ít nhất một trường");
                    return;
                  }

                  saveTemplate({
                    id: editingTemplate.id,
                    nameVi,
                    nameEn,
                    fields
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-zinc-700">Template Name (VI) / Tên mẫu (VI) *</span>
                    <input
                      name="nameVi"
                      required
                      defaultValue={editingTemplate.nameVi || ""}
                      className="field mt-1 text-xs"
                      placeholder="e.g. Quần"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-zinc-700">Template Name (EN) / Tên mẫu (EN) *</span>
                    <input
                      name="nameEn"
                      required
                      defaultValue={editingTemplate.nameEn || ""}
                      className="field mt-1 text-xs"
                      placeholder="e.g. Pants"
                    />
                  </label>
                </div>

                <div className="border border-zinc-200 p-4 bg-zinc-50 rounded">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-800">Fields / Các thông số đo *</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextFields = [...(editingTemplate.fields || []), { key: "", nameVi: "", nameEn: "" }];
                        setEditingTemplate({ ...editingTemplate, fields: nextFields });
                      }}
                      className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-[#a72b1f] transition-colors"
                    >
                      + Add Field / Thêm trường
                    </button>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {(editingTemplate.fields || []).map((field, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-white p-2 border border-zinc-200">
                        <input
                          name={`field-key-${idx}`}
                          required
                          defaultValue={field.key}
                          className="field text-xs flex-1"
                          placeholder="key (e.g. waist)"
                        />
                        <input
                          name={`field-nameVi-${idx}`}
                          required
                          defaultValue={field.nameVi}
                          className="field text-xs flex-1"
                          placeholder="Tên Tiếng Việt (Vòng eo)"
                        />
                        <input
                          name={`field-nameEn-${idx}`}
                          required
                          defaultValue={field.nameEn}
                          className="field text-xs flex-1"
                          placeholder="Tên Tiếng Anh (Waist)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextFields = (editingTemplate.fields || []).filter((_, i) => i !== idx);
                            setEditingTemplate({ ...editingTemplate, fields: nextFields });
                          }}
                          className="text-zinc-400 hover:text-red-650 p-1 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-300 hover:bg-zinc-50 cursor-pointer"
                  >
                    Cancel / Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#171715] text-white hover:bg-[#a72b1f] cursor-pointer"
                  >
                    Save Template / Lưu mẫu
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-500">List of created templates. / Danh sách mẫu đã tạo.</span>
                  <button
                    type="button"
                    onClick={() => setEditingTemplate({ nameVi: "", nameEn: "", fields: [{ key: "", nameVi: "", nameEn: "" }] })}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-[#a72b1f] transition-colors cursor-pointer"
                  >
                    + Create Template / Tạo mẫu mới
                  </button>
                </div>

                <div className="border border-zinc-200 overflow-x-auto">
                  <table className="w-full text-left text-xs bg-white">
                    <thead className="bg-zinc-100 font-bold border-b border-zinc-200">
                      <tr>
                        <th className="px-3 py-2">Name (EN) / Tên (EN)</th>
                        <th className="px-3 py-2">Name (VI) / Tên (VI)</th>
                        <th className="px-3 py-2">Fields / Các thông số</th>
                        <th className="px-3 py-2 text-center w-[120px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {templates.map((t) => (
                        <tr key={t.id} className="hover:bg-zinc-50/50">
                          <td className="px-3 py-2 font-bold">{t.nameEn}</td>
                          <td className="px-3 py-2">{t.nameVi}</td>
                          <td className="px-3 py-2 text-zinc-500 max-w-[200px] truncate">
                            {t.fields.map(f => f.nameEn).join(", ")}
                          </td>
                          <td className="px-3 py-2 text-center flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingTemplate(t)}
                              className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTemplate(t.id)}
                              className="text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {templates.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-zinc-500">
                            No size templates created yet. / Chưa có mẫu size nào được tạo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    SUKAJAN: "border-red-200 bg-red-50 text-red-800",
    BOMBER: "border-blue-200 bg-blue-50 text-blue-800",
    HOODIE: "border-violet-200 bg-violet-50 text-violet-800",
    JACKET: "border-amber-200 bg-amber-50 text-amber-800",
    SEASONAL: "border-emerald-200 bg-emerald-50 text-emerald-800",
    PANTS: "border-teal-200 bg-teal-50 text-teal-800",
    "T-SHIRT": "border-pink-200 bg-pink-50 text-pink-800",
    TSHIRT: "border-pink-200 bg-pink-50 text-pink-800",
    SWEATER: "border-indigo-200 bg-indigo-50 text-indigo-800"
  };

  const key = category.toUpperCase();

  return (
    <span
      className={`inline-flex border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
        styles[key] ?? "border-zinc-200 bg-zinc-50 text-zinc-700"
      }`}
    >
      {category}
    </span>
  );
}

function BooleanBadge({
  enabled,
  label
}: {
  enabled: boolean;
  label: string;
}) {
  return (
    <span
      className={`inline-flex border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
        enabled
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-zinc-200 bg-zinc-100 text-zinc-500"
      }`}
    >
      {enabled ? label : label === "Inactive" ? label : "No"}
    </span>
  );
}

function StockBadge({ status }: { status: string }) {
  const inStock = status === "IN_STOCK";
  return (
    <span
      className={`inline-flex border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
        inStock
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {inStock ? "In stock" : "Out of stock"}
    </span>
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

function AdminMarkdownEditor({
  label,
  value,
  onChange,
  error
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const parsedContent = useMemo(() => {
    return parseMarkdown(value);
  }, [value]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
        <span className="label mb-0">{label}</span>
        <div className="flex border border-zinc-350 bg-white">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={cn(
              "px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer",
              tab === "write"
                ? "bg-[#171715] text-white"
                : "bg-white text-zinc-600 hover:bg-zinc-100"
            )}
          >
            Sửa / Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={cn(
              "px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer",
              tab === "preview"
                ? "bg-[#171715] text-white"
                : "bg-white text-zinc-600 hover:bg-zinc-100"
            )}
          >
            Xem trước / Preview
          </button>
        </div>
      </div>

      {tab === "write" ? (
        <div className="mt-2 border border-zinc-300 bg-white">
          {/* Formatting bar */}
          <div className="flex items-center gap-1 bg-zinc-50 p-1.5 border-b border-zinc-200 overflow-x-auto">
            <button
              type="button"
              onClick={() => insertText("**", "**")}
              className="grid size-7 place-items-center text-xs font-bold text-zinc-700 hover:bg-zinc-200 hover:text-black rounded cursor-pointer"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertText("*", "*")}
              className="grid size-7 place-items-center text-xs italic text-zinc-700 hover:bg-zinc-200 hover:text-black rounded font-serif cursor-pointer"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => insertText("## ")}
              className="grid size-7 place-items-center text-[10px] font-black text-zinc-700 hover:bg-zinc-200 hover:text-black rounded cursor-pointer"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertText("### ")}
              className="grid size-7 place-items-center text-[10px] font-black text-zinc-700 hover:bg-zinc-200 hover:text-black rounded cursor-pointer"
              title="Heading 3"
            >
              H3
            </button>
            <span className="w-[1px] h-4 bg-zinc-300 mx-1 shrink-0" />
            <button
              type="button"
              onClick={() => insertText("[", "](url)")}
              className="px-2 py-1 text-[10px] font-bold text-zinc-700 hover:bg-zinc-200 hover:text-black rounded cursor-pointer shrink-0"
              title="Insert Link"
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => insertText("- ")}
              className="px-2 py-1 text-[10px] font-bold text-zinc-700 hover:bg-zinc-200 hover:text-black rounded cursor-pointer shrink-0"
              title="Bullet List"
            >
              List
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="field min-h-36 border-0 focus:ring-0 focus:outline-none"
            placeholder="Mô tả chi tiết sản phẩm... Hỗ trợ định dạng Markdown (Bold, Italic, List, Headings)."
          />
        </div>
      ) : (
        <div className="mt-2 min-h-[12.5rem] max-h-72 border border-zinc-300 bg-zinc-50 p-4 overflow-y-auto space-y-1">
          {value.trim() ? (
            parsedContent
          ) : (
            <p className="text-xs text-zinc-400 italic text-center py-10">
              Chưa có nội dung để xem trước / Nothing to preview yet
            </p>
          )}
        </div>
      )}
      {error && <span className="error-text mt-1">{error}</span>}
    </div>
  );
}
