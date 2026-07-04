export const GOOGLE_TAG_ID = "AW-18283180920";

interface GtagWindow {
  gtag?: (
    type: "event",
    eventName: string,
    params?: Record<string, unknown>
  ) => void;
}

export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (typeof window !== "undefined") {
    const customWindow = window as unknown as GtagWindow;
    if (customWindow.gtag) {
      customWindow.gtag("event", eventName, {
        send_to: GOOGLE_TAG_ID,
        ...params,
      });
    }
  }
};
