import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent, setAnalyticsCollectionEnabled } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDVoXQ3Ih_xi5On9ewrd-oBPEfCDciFrmw",
  authDomain: "eat-me-9ff48.firebaseapp.com",
  projectId: "eat-me-9ff48",
  storageBucket: "eat-me-9ff48.firebasestorage.app",
  messagingSenderId: "216392788447",
  appId: "1:216392788447:web:fa5d31411cea55c7c17c6a",
  measurementId: "G-47VLL04KKZ"
};

const app = initializeApp(firebaseConfig);
const analytics: Analytics = getAnalytics(app);

// Disable collection by default until the user consents
setAnalyticsCollectionEnabled(analytics, false);

/**
 * Enable or disable analytics collection based on GDPR consent.
 */
export function setAnalyticsConsent(enabled: boolean): void {
  setAnalyticsCollectionEnabled(analytics, enabled);
}

/**
 * Log a custom analytics event. No-op if analytics collection is disabled by Firebase.
 *
 * Firebase Analytics expects event params to be strings or numbers. Any boolean values
 * provided at call sites are normalized to string representations before logging.
 */
export function trackEvent(eventName: string, params?: Record<string, string | number>): void {
  const normalizedParams =
    params &&
    Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key,
        typeof value === "boolean" ? (value ? "true" : "false") : value,
      ]),
    );

  logEvent(analytics, eventName, normalizedParams);
}
