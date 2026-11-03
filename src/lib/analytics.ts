declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

/** Pushes a custom event to Google Tag Manager; a no-op when GTM isn't loaded. */
export function track(event: string, params: Record<string, unknown> = {}) {
  window.dataLayer?.push({ event, ...params })
}
