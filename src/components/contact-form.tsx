"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ZALO_URL } from "@/lib/constants";

const contactSchema = z.object({
  name: z.string().trim().min(2),
  message: z.string().trim().min(5)
});
type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm({
  labels
}: {
  labels: { name: string; message: string; send: string };
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  function submit(values: ContactValues) {
    const text = encodeURIComponent(
      `Website contact from ${values.name}: ${values.message}`
    );
    window.open(`${ZALO_URL}?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      <label className="block">
        <span className="label">{labels.name}</span>
        <input className="field" {...register("name")} />
        {errors.name ? <span className="error-text">Required</span> : null}
      </label>
      <label className="block">
        <span className="label">{labels.message}</span>
        <textarea className="field min-h-32" {...register("message")} />
        {errors.message ? <span className="error-text">Required</span> : null}
      </label>
      <button className="button-primary" type="submit">
        <Send size={16} />
        {labels.send}
      </button>
    </form>
  );
}
