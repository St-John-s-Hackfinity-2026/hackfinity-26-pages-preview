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

export type GoogleAppsScriptPublicRegistration = {
  id: string;
  participationType: "group" | "individual";
  teamName: string;
  projectCategory: string;
  projectTitle: string;
  memberCount: number;
  submittedAt: string;
};

export function buildAppsScriptCountUrl(webAppUrl = GOOGLE_APPS_SCRIPT_URL, callbackName = "hackfinityCount") {
  const url = new URL(webAppUrl);
  url.searchParams.set("action", "count");
  url.searchParams.set("callback", callbackName);
  return url.toString();
}

export async function submitAppsScriptRegistration(registration: GoogleAppsScriptRegistration, webAppUrl = GOOGLE_APPS_SCRIPT_URL, responseWaitMs = 1_500) {
  const request = fetch(webAppUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ registration }),
  });

  const result = await Promise.race([
    request.then(() => true).catch(() => false),
    new Promise<boolean>(resolve => globalThis.setTimeout(() => resolve(true), responseWaitMs)),
  ]);

  if (!result) throw new Error("The registration request could not be started.");
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

export function loadAppsScriptPublicRegistrations(webAppUrl = GOOGLE_APPS_SCRIPT_URL): Promise<GoogleAppsScriptPublicRegistration[]> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("A browser is required to load the public organizer roster."));
      return;
    }

    const callbackName = `hackfinityRoster_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const windowCallbacks = window as typeof window & Record<string, (payload: { registrations?: unknown }) => void>;
    const timeout = window.setTimeout(() => cleanup(new Error("The public organizer roster did not respond.")), 9_000);

    const cleanup = (error?: Error, registrations?: GoogleAppsScriptPublicRegistration[]) => {
      window.clearTimeout(timeout);
      script.remove();
      delete windowCallbacks[callbackName];
      if (error) reject(error);
      else resolve(registrations ?? []);
    };

    windowCallbacks[callbackName] = (payload) => {
      const registrations = Array.isArray(payload.registrations) ? payload.registrations : [];
      cleanup(undefined, registrations.map((entry): GoogleAppsScriptPublicRegistration => {
        const record = entry as Partial<GoogleAppsScriptPublicRegistration>;
        return {
          id: String(record.id ?? ""),
          participationType: record.participationType === "individual" ? "individual" : "group",
          teamName: String(record.teamName ?? "Unnamed squad"),
          projectCategory: String(record.projectCategory ?? "Unassigned track"),
          projectTitle: String(record.projectTitle ?? "Untitled project"),
          memberCount: Math.max(1, Number(record.memberCount) || 1),
          submittedAt: String(record.submittedAt ?? ""),
        };
      }));
    };

    const url = new URL(webAppUrl);
    url.searchParams.set("action", "registrations");
    url.searchParams.set("callback", callbackName);
    script.async = true;
    script.src = url.toString();
    script.onerror = () => cleanup(new Error("The public organizer roster could not be loaded."));
    document.head.appendChild(script);
  });
}
