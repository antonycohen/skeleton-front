// Axeptio global type declaration
declare global {
  interface Window {
    axeptioSettings?: {
      clientId: string;
      cookiesVersion: string;
    };
    _axcb?: Array<(axeptio: AxeptioSDK) => void>;
  }
}

interface AxeptioChoices {
  $$googleConsentMode?: {
    analytics_storage?: "granted" | "denied";
    ad_storage?: "granted" | "denied";
    ad_user_data?: "granted" | "denied";
    ad_personalization?: "granted" | "denied";
  };
  $$scope?: string;
  $$duration?: number;
}

interface AxeptioSDK {
  on: (event: string, callback: (choices: AxeptioChoices) => void) => void;
}

type UtmData = {
  first_utm?: Record<string, string>;
  last_utm?: Record<string, string>;
  first_referrer?: string;
  last_referrer?: string;
};

// Session storage key for UTM data before consent
const UTM_SESSION_KEY = "utm_data_pending";
const UTM_COOKIE_NAME = "utm_data";

const setCookie = (name: string, value: string, days: number): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const domain = window.location.hostname.split(".").slice(-2).join("."); // Get the root domain
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )};expires=${expires.toUTCString()};path=/;domain=.${domain}`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const c = cookies[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }

  return null;
};

function getQueryParam(url: string, param: string): string {
  param = param.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
  const regexS = `[?&]${param}=([^&#]*)`;
  const regex = new RegExp(regexS);
  const results = regex.exec(url);

  if (results === null || typeof results[1] !== "string") {
    return "";
  }
  return decodeURIComponent(results[1]).replace(/\W/gi, " ");
}

function getCampaignParams(): Record<string, string> {
  const campaignKeywords = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "utm_id",
    "fbclid",
    "gclid",
  ];
  const utmParams: Record<string, string> = {};

  for (const keyword of campaignKeywords) {
    const value = getQueryParam(document.URL, keyword);
    if (value.length) {
      utmParams[keyword] = value;
    }
  }

  return utmParams;
}

function buildUtmData(utmValues: Record<string, string>): UtmData {
  // Retrieve existing cookie or session data
  const existingCookie = getCookie(UTM_COOKIE_NAME);
  const pendingData = sessionStorage.getItem(UTM_SESSION_KEY);
  const utmData: UtmData = existingCookie
    ? JSON.parse(existingCookie)
    : pendingData
      ? JSON.parse(pendingData)
      : {};

  // Update First UTMs (only if not already set)
  if (!utmData.first_utm && Object.keys(utmValues).length > 0) {
    utmData.first_utm = utmValues;
  }

  if (!utmData.first_referrer && document.referrer) {
    utmData.first_referrer = document.referrer;
  }

  // Update Last UTMs (overwrite every time)
  if (Object.keys(utmValues).length > 0) {
    utmData.last_utm = utmValues;
  }

  if (document.referrer) {
    utmData.last_referrer = document.referrer;
  }

  return utmData;
}

function persistUtmToCookie(utmData: UtmData): void {
  setCookie(UTM_COOKIE_NAME, JSON.stringify(utmData), 365);
  // Clear session storage once persisted to cookie
  sessionStorage.removeItem(UTM_SESSION_KEY);
}

function storeUtmInSession(utmData: UtmData): void {
  sessionStorage.setItem(UTM_SESSION_KEY, JSON.stringify(utmData));
}

/**
 * Process UTM parameters with Axeptio consent v2 compliance.
 *
 * - Captures UTM params immediately and stores in sessionStorage (no consent required)
 * - Only persists to cookies after user gives consent via Axeptio
 * - Listens for consent changes to persist data when consent is granted
 */
export function processUtms(): void {
  const utmValues = getCampaignParams();
  const utmData = buildUtmData(utmValues);

  console.log(utmData);
  // Always store in session first (sessionStorage doesn't require consent)
  storeUtmInSession(utmData);

  // Check if Axeptio SDK is available and listen for consent
  window._axcb = window._axcb || [];
  window._axcb.push((axeptio) => {
    axeptio.on("cookies:complete", (choices) => {
      if (choices.$$googleConsentMode?.analytics_storage === "granted") {
        // User consented to analytics - persist UTM data to cookie
        const currentData = sessionStorage.getItem(UTM_SESSION_KEY);
        if (currentData) {
          persistUtmToCookie(JSON.parse(currentData));
        }
      }
    });
  });
}

/**
 * Get UTM data from either cookie (if consent given) or session storage.
 * Use this when you need to access UTM data for form submissions, etc.
 */
export function getUtmData(): UtmData | null {
  const cookieData = getCookie(UTM_COOKIE_NAME);
  if (cookieData) {
    return JSON.parse(cookieData);
  }

  const sessionData = sessionStorage.getItem(UTM_SESSION_KEY);
  if (sessionData) {
    return JSON.parse(sessionData);
  }

  return null;
}
