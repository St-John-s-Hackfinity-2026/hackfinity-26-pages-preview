export const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxEJFpRfPZIWctqveV1xmbsmvWna9VPTLDP18iUorSLhaiMiLnFB_PBIxvHCd-HkeoH/exec";

export type GoogleAppsScriptMember = {
  name: string;
  grade: string;
  email: string;
  phone: string;
};

export type GoogleAppsScriptRegistration = {
  id: string;
  createdAt: string;
  participationType: "individual" | "group";
  teamName: string;
  leaderName: string;
  leaderClass: string;
  schoolName: string;
  email: string;
  phone: string;
  projectCategory: string;
  projectTitle: string;
  projectDescription: string;
  members: GoogleAppsScriptMember[];
};

export function buildAppsScriptCountUrl(webAppUrl = GOOGLE_APPS_SCRIPT_URL, callbackName = "hackfinityCount") {
  const url = new URL(webAppUrl);
  url.searchParams.set("action", "count");
  url.searchParams.set("callback", callbackName);
  return url.toString();
}

export async function submitAppsScriptRegistration(registration: GoogleAppsScriptRegistration, webAppUrl = GOOGLE_APPS_SCRIPT_URL) {
  await fetch(webAppUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ registration }),
  });
}

export function loadAppsScriptSquadCount(webAppUrl = GOOGLE_APPS_SCRIPT_URL): Promise<number> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("A browser is required to load the public squad count."));
      return;
    }

    const callbackName = `hackfinityCount_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const windowCallbacks = window as typeof window & Record<string, (payload: { count?: unknown }) => void>;
    const timeout = window.setTimeout(() => cleanup(new Error("The live squad count did not respond.")), 9_000);

    const cleanup = (error?: Error, count?: number) => {
      window.clearTimeout(timeout);
      script.remove();
      delete windowCallbacks[callbackName];
      if (error) reject(error);
      else resolve(count ?? 0);
    };

    windowCallbacks[callbackName] = (payload) => {
      const count = Number(payload.count);
      cleanup(undefined, Number.isFinite(count) && count >= 0 ? count : 0);
    };

    script.async = true;
    script.src = buildAppsScriptCountUrl(webAppUrl, callbackName);
    script.onerror = () => cleanup(new Error("The live squad count could not be loaded."));
    document.head.appendChild(script);
  });
}
