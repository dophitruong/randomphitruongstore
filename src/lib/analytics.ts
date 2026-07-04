export const GOOGLE_TAG_ID = "AW-18283180920";

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, {
      send_to: GOOGLE_TAG_ID,
      ...params,
    });
  }
};
