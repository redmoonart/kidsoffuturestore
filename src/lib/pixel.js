import { STORE_CONFIG } from "../data/config";

// Meta (Facebook/Instagram) Pixel — يُحمَّل فقط إذا وُضع STORE_CONFIG.metaPixelId
let ready = false;

export function initPixel() {
  const id = STORE_CONFIG.metaPixelId;
  if (ready || !id || typeof window === "undefined") return;
  ready = true;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq("init", id);
}

export function track(event, params, eventId) {
  if (!ready || !window.fbq) return;
  window.fbq("track", event, params, eventId ? { eventID: eventId } : undefined);
}
