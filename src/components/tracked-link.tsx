"use client";

import React from "react";
import { trackEvent } from "@/lib/analytics";

interface TrackedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  eventName: string;
  eventParams?: Record<string, unknown>;
}

export function TrackedLink({
  eventName,
  eventParams,
  children,
  onClick,
  ...props
}: TrackedLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackEvent(eventName, eventParams);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
