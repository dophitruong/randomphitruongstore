import React from "react";

export function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-zinc-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic text-zinc-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-zinc-900 underline hover:text-[#a72b1f] transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

export function parseMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const paragraphs = text.split(/\n\n+/);
  return paragraphs
    .map((para, i) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith("### ")) {
        return (
          <h4
            key={i}
            className="mt-5 mb-2 text-xs font-black uppercase tracking-wider text-zinc-900"
          >
            {renderInlineMarkdown(trimmed.slice(4))}
          </h4>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3
            key={i}
            className="mt-6 mb-2.5 text-sm font-black uppercase tracking-wide text-zinc-900"
          >
            {renderInlineMarkdown(trimmed.slice(3))}
          </h3>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h2
            key={i}
            className="mt-7 mb-3 text-base font-black uppercase tracking-normal text-zinc-900"
          >
            {renderInlineMarkdown(trimmed.slice(2))}
          </h2>
        );
      }

      const lines = trimmed.split("\n");
      const isBulletList = lines.every((line) => {
        const l = line.trim();
        return l.startsWith("-") || l.startsWith("*") || l.startsWith("•");
      });

      if (isBulletList && lines.length > 0) {
        const items = lines.map((line) => {
          const l = line.trim();
          return l.replace(/^[-*•]\s*/, "");
        });
        return (
          <ul
            key={i}
            className="my-3 list-disc pl-5 text-sm space-y-1.5 text-zinc-600"
          >
            {items.map((item, j) => (
              <li key={j}>{renderInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
      }

      return (
        <p
          key={i}
          className="mt-3 text-sm leading-7 text-zinc-600 whitespace-pre-line"
        >
          {renderInlineMarkdown(trimmed)}
        </p>
      );
    })
    .filter(Boolean);
}
