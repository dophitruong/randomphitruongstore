"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ImageUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { ZALO_URL } from "@/lib/constants";
import { ZaloIcon } from "./brand-icons";
import { TrackedLink } from "./tracked-link";

const requestFormSchema = z.object({
  fullName: z.string().trim().min(2, "Required"),
  phone: z.string().trim().min(9, "Required"),
  socialContact: z.string().trim().min(2, "Required"),
  desiredSize: z.string().trim().min(1, "Required"),
  desiredColor: z.string().trim().min(1, "Required"),
  note: z.string().max(1000).optional()
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export function ProductInquiryForm({
  labels
}: {
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema)
  });

  async function onSubmit(values: RequestFormValues) {
    setError("");
    if (!user) {
      router.push("/login");
      return;
    }

    if (!image) {
      setError("Please select an inspiration image.");
      return;
    }

    const intentResponse = await fetch("/api/upload/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "PRODUCT_INQUIRY_IMAGE" })
    });
    const intentResult = await intentResponse.json();
    if (!intentResponse.ok) {
      setError(intentResult.error ?? "Unable to prepare upload");
      return;
    }

    const uploadData = new FormData();
    uploadData.set("file", image);
    uploadData.set("purpose", "PRODUCT_INQUIRY_IMAGE");
    uploadData.set("intentToken", intentResult.data.token);
    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: uploadData
    });
    const uploadResult = await uploadResponse.json();
    if (!uploadResponse.ok) {
      setError(uploadResult.error ?? "Upload failed");
      return;
    }

    const response = await fetch("/api/order-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        inspirationUrl: uploadResult.url
      })
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to submit request");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="border border-black bg-white p-8">
        <p className="eyebrow text-zinc-500">{labels.success}</p>
        <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600">
          {labels.successBody}
        </p>
        <TrackedLink
          className="button-primary mt-6"
          eventName="click_zalo"
          href={ZALO_URL}
          rel="noreferrer"
          target="_blank"
        >
          <ZaloIcon size={17} />
          Zalo
        </TrackedLink>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 border border-zinc-300 bg-white p-5 sm:grid-cols-2 sm:p-8"
      onSubmit={handleSubmit(onSubmit)}
    >
      {!authLoading && !user ? (
        <div className="border border-amber-300 bg-amber-50 p-4 text-amber-950 sm:col-span-2">
          <div className="flex items-start gap-2.5 text-sm font-medium leading-6">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p>
                {labels.loginNotice ||
                  "⚠️ Bạn cần đăng nhập hoặc đăng ký tài khoản trước khi gửi yêu cầu. Sau khi đăng nhập, bạn có thể theo dõi trạng thái yêu cầu của mình."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <Link
                  className="inline-block bg-black px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800"
                  href="/login"
                >
                  {labels.loginButton || "Đăng nhập ngay"}
                </Link>
                <Link
                  className="inline-block border border-black bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-100"
                  href="/register"
                >
                  {labels.registerButton || "Đăng ký tài khoản"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <RequestField
        error={errors.fullName?.message}
        label={labels.fullName}
        registration={register("fullName")}
      />
      <RequestField
        error={errors.phone?.message}
        label={labels.phone}
        registration={register("phone")}
      />
      <RequestField
        error={errors.socialContact?.message}
        label={labels.social}
        registration={register("socialContact")}
      />
      <label>
        <span className="label">{labels.image}</span>
        <span className="flex min-h-12 cursor-pointer items-center gap-2 border border-zinc-300 px-3 text-sm">
          <ImageUp size={17} className="translate-y-[-0.5px]" />
          {image?.name ?? "JPG, PNG, WebP - max 5 MB"}
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => setImage(event.target.files?.[0] ?? null)}
            type="file"
          />
        </span>
      </label>
      <RequestField
        error={errors.desiredSize?.message}
        label={labels.size}
        registration={register("desiredSize")}
      />
      <RequestField
        error={errors.desiredColor?.message}
        label={labels.color}
        registration={register("desiredColor")}
      />
      <label className="sm:col-span-2">
        <span className="label">{labels.note}</span>
        <textarea className="field min-h-28" {...register("note")} />
      </label>
      {error ? <p className="error-text sm:col-span-2">{error}</p> : null}
      <button
        className="button-primary sm:col-span-2 sm:justify-self-start"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? labels.loading : labels.submit}
      </button>
    </form>
  );
}

function RequestField({
  label,
  error,
  registration
}: {
  label: string;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm<RequestFormValues>>["register"]>;
}) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="field" {...registration} />
      {error ? <span className="error-text">{error}</span> : null}
    </label>
  );
}
