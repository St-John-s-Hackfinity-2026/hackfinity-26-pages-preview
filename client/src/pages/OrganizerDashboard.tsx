import DashboardLayout from "@/components/DashboardLayout";
import "./OrganizerDashboard.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { loadAppsScriptPublicRegistrations, loadAppsScriptSquadCount, type GoogleAppsScriptPublicRegistration } from "@/lib/googleAppsScript";
import { trpc } from "@/lib/trpc";
import type { AppRouter } from "../../../server/routers";
import type { inferRouterOutputs } from "@trpc/server";
import { CheckCircle2, Copy, Database, ExternalLink, Eye, Loader2, Search, ShieldAlert, Sheet, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type RouterOutput = inferRouterOutputs<AppRouter>;
type Squad = RouterOutput["registrations"]["list"][number];
const STATIC_PREVIEW = import.meta.env.VITE_STATIC_PREVIEW === "true";
const HACKFINITY_SHEET_URL = "https://docs.google.com/spreadsheets/d/1kS6U80qy3ciQU7FExuJeH-SKVX-qY4B1aQymugmsyP0/edit";

export default function OrganizerDashboard() {
  if (STATIC_PREVIEW) return <StaticOrganizerHandoff />;

  const { user, loading } = useAuth();

  if (loading) return <div className="organizer-loading"><Loader2 className="animate-spin" /> Checking organizer access…</div>;
  if (!user) return <main className="organizer-gate"><ShieldAlert /><h1>Organizer access only</h1><p>Sign in with the owner account to open the registrations command center.</p><Button onClick={() => startLogin()}>Sign in securely</Button></main>;
  if (user.role !== "admin") return <main className="organizer-gate"><ShieldAlert /><h1>Access restricted</h1><p>This account is not assigned organizer privileges. Contact the site owner if you need access.</p></main>;

  return <DashboardLayout><OrganizerContent /></DashboardLayout>;
}

function StaticOrganizerHandoff() {
  const [count, setCount] = useState<number | null>(null);
  const [countError, setCountError] = useState(false);
  const [roster, setRoster] = useState<GoogleAppsScriptPublicRegistration[] | null>(null);
  const [rosterError, setRosterError] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void loadAppsScriptSquadCount()
      .then(value => { setCount(value); setCountError(false); })
      .catch(() => setCountError(true));
    void loadAppsScriptPublicRegistrations()
      .then(value => { setRoster(value); setRosterError(false); })
      .catch(() => setRosterError(true));
  }, []);

  const visibleRoster = (roster ?? []).filter((registration) => {
    const query = search.trim().toLowerCase();
    return !query || [registration.teamName, registration.projectTitle, registration.projectCategory, registration.participationType].some(value => value.toLowerCase().includes(query));
  });

  return <main className="static-organizer-shell">
    <aside className="static-organizer-sidebar">
      <div className="static-organizer-brand"><ShieldAlert /><span>Organizer Hub</span></div>
      <nav aria-label="Organizer navigation"><a href="#command"><UsersRound /> Organizer hub</a><a href="#records"><Sheet /> Registrations</a></nav>
      <div className="static-organizer-sidebar-note"><span>Private records</span><b>Google Sheet protected</b><p>Only authorized organizers can open student registration details.</p></div>
    </aside>
    <section className="static-organizer-content">
      <header className="static-command-hero" id="command"><div><p>Private organizer console</p><h1>Squad command center</h1><span>Live registration status and secure operational links.</span></div><div className="static-command-count"><UsersRound /><b>{countError ? "—" : count === null ? "··" : count}</b><span>Visible squads</span></div></header>
      <div className="static-command-metrics">
        <StaticMetric icon={<Database />} label="Total registered" value={countError ? "Reconnect" : count === null ? "Loading" : count} />
        <StaticMetric icon={<CheckCircle2 />} label="Sheet workflow" value="Active" />
        <StaticMetric icon={<ShieldAlert />} label="Record access" value="Protected" />
      </div>
      <section className="static-command-card" id="records"><div className="static-command-heading"><div><p>Google Sheets connection</p><h2>Registration command links</h2></div><span>Student data remains in the protected organizer Sheet.</span></div><div className="static-command-actions"><a href={HACKFINITY_SHEET_URL} target="_blank" rel="noreferrer"><Sheet /><span><b>Open registrations</b><small>View, search, and manage entries</small></span><ExternalLink /></a><a href="https://script.google.com/" target="_blank" rel="noreferrer"><Database /><span><b>Open Apps Script</b><small>Manage the registration service</small></span><ExternalLink /></a><a href="https://st-john-s-hackfinity-2026.github.io/hackfinity-26-pages-preview/" target="_blank" rel="noreferrer"><UsersRound /><span><b>Open public website</b><small>Check the registration experience</small></span><ExternalLink /></a></div><div className="static-command-protection"><ShieldAlert /><div><b>Protected registration records</b><p>The public website never displays names, contacts, or project details. Use the linked Google Sheet with an authorized organizer account to access those private records.</p></div></div></section>
      <section className="static-command-card static-registrations-card"><div className="static-command-heading"><div><p>Squad database</p><h2>Registrations</h2></div><div className="static-roster-search"><Search /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search squad, project, track…" /></div></div><p className="static-roster-disclosure">This operational list contains only squad name, format, project, battle track, member count, and submitted time. Open the protected Sheet for names and contact information.</p>{roster === null ? <div className="static-roster-state"><Loader2 className="animate-spin" /> Loading public squad roster…</div> : rosterError ? <div className="static-roster-state error">The public roster is unavailable. Use the protected Sheet to review registrations.</div> : visibleRoster.length === 0 ? <div className="static-roster-state">No public registrations match this search.</div> : <div className="static-roster-table-wrap"><table><thead><tr><th>Squad</th><th>Format</th><th>Project</th><th>Battle track</th><th>Members</th><th>Submitted</th><th>Full record</th></tr></thead><tbody>{visibleRoster.map(registration => <tr key={registration.id}><td><b>{registration.teamName}</b></td><td><span className="static-roster-type">{registration.participationType === "group" ? "Squad" : "Individual"}</span></td><td>{registration.projectTitle}</td><td>{registration.projectCategory}</td><td>{registration.memberCount}</td><td>{registration.submittedAt || "—"}</td><td><a className="static-roster-open" href={HACKFINITY_SHEET_URL} target="_blank" rel="noreferrer">Open Sheet <ExternalLink /></a></td></tr>)}</tbody></table></div>}</section>
    </section>
  </main>;
}

function StaticMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return <article className="static-command-metric">{icon}<div><span>{label}</span><b>{value}</b></div></article>;
}

function OrganizerContent() {
  const [search, setSearch] = useState("");
  const [webhook, setWebhook] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const registrations = trpc.registrations.list.useQuery({ search: search || undefined });
  const settings = trpc.organizer.getSettings.useQuery();
  const utils = trpc.useUtils();
  const saveWebhook = trpc.organizer.setGoogleSheetsWebhook.useMutation({
    onSuccess: () => {
      utils.organizer.getSettings.invalidate();
      toast.success("Google Sheets webhook saved.");
    },
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    if (settings.data?.googleSheetsWebhookUrl) setWebhook(settings.data.googleSheetsWebhookUrl);
  }, [settings.data?.googleSheetsWebhookUrl]);

  const squads = registrations.data ?? [];
  const synced = squads.filter(squad => squad.sheetSyncStatus === "synced").length;

  const copySetup = async () => {
    await navigator.clipboard.writeText(GOOGLE_SCRIPT_TEMPLATE);
    setCopied(true);
    toast.success("Apps Script template copied.");
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <div className="organizer-dashboard">
    <section className="dashboard-hero">
      <div><p>Private organizer console</p><h1>Squad command center</h1><span>Live registration records, searchable on demand.</span></div>
      <div className="dashboard-mark"><UsersRound /><b>{squads.length}</b><span>Visible squads</span></div>
    </section>
    <div className="dashboard-metrics">
      <Metric icon={<Database />} label="Total registered" value={squads.length} />
      <Metric icon={<CheckCircle2 />} label="Synced to Sheets" value={synced} />
      <Metric icon={<Sheet />} label="Webhook state" value={settings.data?.googleSheetsWebhookUrl ? "Active" : "Awaiting setup"} />
    </div>
    <section className="dashboard-card sheets-card">
      <div className="card-heading"><div><p>Google Sheets connection</p><h2>Apps Script webhook</h2></div><div className="dashboard-link-pair"><a href="https://docs.google.com/spreadsheets/d/1kS6U80qy3ciQU7FExuJeH-SKVX-qY4B1aQymugmsyP0/edit" target="_blank" rel="noreferrer">Open Hackfinity Registration <ExternalLink /></a><a href="https://script.google.com/" target="_blank" rel="noreferrer">Open Apps Script <ExternalLink /></a><a href="https://st-john-s-hackfinity-2026.github.io/hackfinity-26-pages-preview/" target="_blank" rel="noreferrer">Open public website <ExternalLink /></a><a href="https://github.com/St-John-s-Hackfinity-2026/hackfinity-26-website-source" target="_blank" rel="noreferrer">Open source repository <ExternalLink /></a></div></div>
      <p className="card-copy">The linked <strong>Hackfinity Registration</strong> sheet is ready for the supplied script. Deploy the Apps Script web app and paste its <code>/exec</code> URL below; every future registration is then sent to that spreadsheet automatically.</p>
      <div className="webhook-form"><div><Label>Deployed Apps Script URL</Label><Input value={webhook} onChange={event => setWebhook(event.target.value)} placeholder="https://script.google.com/macros/s/.../exec" /></div><Button onClick={() => saveWebhook.mutate({ googleSheetsWebhookUrl: webhook.trim() })} disabled={saveWebhook.isPending}>{saveWebhook.isPending ? "Saving…" : "Save webhook"}</Button></div>
      <div className="script-helper"><div><b>Need a starter script?</b><p>The copied script is already pre-filled for the shared <code>Hackfinity Registration</code> spreadsheet. Paste it into a blank Apps Script project, deploy it as a web app with access set to “Anyone”, then copy the deployed URL.</p></div><Button variant="outline" onClick={copySetup}>{copied ? "Copied" : "Copy script"} <Copy /></Button></div>
    </section>
    <section className="dashboard-card registrations-card">
      <div className="card-heading"><div><p>Squad database</p><h2>Registrations</h2></div><div className="search-box"><Search /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search squad, leader, school…" /></div></div>
      {registrations.isLoading ? <div className="table-state"><Loader2 className="animate-spin" /> Loading registered squads…</div> : registrations.error ? <div className="table-state error">Could not load registrations: {registrations.error.message}</div> : squads.length === 0 ? <div className="table-state">No squad registrations match this search yet.</div> : <div className="registration-table-wrap"><table><thead><tr><th>Squad</th><th>Leader</th><th>School</th><th>Project</th><th>Members</th><th>Submitted</th><th>Sheet sync</th><th>Details</th></tr></thead><tbody>{squads.map(squad => <tr key={squad.id}><td><b>{squad.teamName}</b><span>{squad.participationType}</span></td><td>{squad.leaderName}<span>{squad.email}<br />{squad.phone}</span></td><td>{squad.schoolName}<span>{squad.leaderClass}</span></td><td>{squad.projectTitle}<span>{squad.projectCategory}</span></td><td>{squad.members.length + 1}</td><td>{new Date(squad.createdAt).toLocaleString()}</td><td><span className={`sync-badge ${squad.sheetSyncStatus}`}>{squad.sheetSyncStatus.replace("_", " ")}</span></td><td><Button variant="outline" size="sm" className="view-detail" onClick={() => setSelectedSquad(squad)}><Eye /> View</Button></td></tr>)}</tbody></table></div>}
    </section>
    <RegistrationDetailDialog squad={selectedSquad} onOpenChange={open => !open && setSelectedSquad(null)} />
  </div>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return <article className="metric-card">{icon}<div><span>{label}</span><b>{value}</b></div></article>;
}

function RegistrationDetailDialog({ squad, onOpenChange }: { squad: Squad | null; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={Boolean(squad)} onOpenChange={onOpenChange}>
    <DialogContent className="registration-detail-dialog">
      {squad && <>
        <DialogHeader><p>Registration #{squad.id.toString().padStart(4, "0")}</p><DialogTitle>{squad.teamName}</DialogTitle><DialogDescription>{squad.participationType === "group" ? "Group registration" : "Individual registration"} · Submitted {new Date(squad.createdAt).toLocaleString()}</DialogDescription></DialogHeader>
        <div className="detail-grid"><Detail label="Leader" value={`${squad.leaderName} · ${squad.leaderClass}`} /><Detail label="Contact" value={`${squad.email} · ${squad.phone}`} /><Detail label="School" value={squad.schoolName} /><Detail label="Battle track" value={squad.projectCategory} /><Detail label="Project" value={squad.projectTitle} /><Detail label="Sheet sync" value={squad.sheetSyncStatus.replace("_", " ")} /></div>
        <div className="detail-block"><b>Project description</b><p>{squad.projectDescription}</p></div>
        <div className="detail-block"><b>Squad roster</b><ul><li><strong>{squad.leaderName}</strong><span>{squad.leaderClass} · leader · {squad.email} · {squad.phone}</span></li>{squad.members.map((member, index) => <li key={`${member.name}-${index}`}><strong>{member.name}</strong><span>{member.grade} · {member.email} · {member.phone}</span></li>)}</ul></div>
      </>}
    </DialogContent>
  </Dialog>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><b>{value}</b></div>;
}

const GOOGLE_SCRIPT_TEMPLATE = `const SHEET_ID = "1kS6U80qy3ciQU7FExuJeH-SKVX-qY4B1aQymugmsyP0";
const SHEET_NAME = "Registrations";

const HEADERS = [
  "Submitted Date & Time", "Registration ID", "Group / Individual", "Team Name", "Leader Name", "Leader Class / Grade", "School Name", "Leader Email", "Leader Phone Number", "Theme / Battle Track", "Project Title", "Project Description",
  "Member 2 Name", "Member 2 Class / Grade", "Member 2 Email", "Member 2 Phone Number",
  "Member 3 Name", "Member 3 Class / Grade", "Member 3 Email", "Member 3 Phone Number",
  "Member 4 Name", "Member 4 Class / Grade", "Member 4 Email", "Member 4 Phone Number",
  "Member 5 Name", "Member 5 Class / Grade", "Member 5 Email", "Member 5 Phone Number"
];

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const r = payload.registration;
  const sheet = getRegistrationsSheet();
  if (!r || !r.id || !r.createdAt) throw new Error("Invalid registration payload.");
  if (hasRegistrationId(sheet, r.id)) {
    return ContentService.createTextOutput(JSON.stringify({ ok: true, duplicate: true })).setMimeType(ContentService.MimeType.JSON);
  }
  const members = Array.isArray(r.members) ? r.members : [];
  const memberCells = [];
  for (let index = 0; index < 4; index += 1) {
    const member = members[index] || {};
    memberCells.push(member.name || "", member.grade || "", member.email || "", asPlainText(member.phone));
  }

  sheet.appendRow([
    new Date(r.createdAt), r.id, r.participationType === "group" ? "Group" : "Individual", r.teamName, r.leaderName, r.leaderClass, r.schoolName, r.email, asPlainText(r.phone), r.projectCategory, r.projectTitle, r.projectDescription,
    ...memberCells
  ]);
  sheet.getRange(sheet.getLastRow(), 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const sheet = getRegistrationsSheet();
  const action = String(e.parameter.action || "");
  let result;
  if (action === "count") {
    result = { ok: true, count: Math.max(0, sheet.getLastRow() - 1) };
  } else if (action === "registrations") {
    result = { ok: true, registrations: getPublicRegistrations(sheet) };
  } else {
    result = { ok: false, error: "Unsupported request." };
  }
  const callback = String(e.parameter.callback || "");
  if (/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function getPublicRegistrations(sheet) {
  const rows = sheet.getDataRange().getDisplayValues().slice(1).filter(row => row[1]);
  return rows.slice(-50).reverse().map(row => {
    const participationType = String(row[2]).toLowerCase() === "individual" ? "individual" : "group";
    const memberNames = [row[4], row[12], row[16], row[20], row[24]].filter(Boolean);
    return {
      id: String(row[1]),
      participationType,
      teamName: participationType === "individual" ? "Individual registration" : String(row[3] || "Unnamed squad"),
      projectCategory: String(row[9] || "Unassigned track"),
      projectTitle: String(row[10] || "Untitled project"),
      memberCount: Math.max(1, memberNames.length),
      submittedAt: String(row[0] || "")
    };
  });
}

function hasRegistrationId(sheet, registrationId) {
  const rowCount = sheet.getLastRow();
  if (rowCount < 2) return false;
  return sheet.getRange(2, 2, rowCount - 1, 1).getValues().flat().some(id => String(id) === String(registrationId));
}

function asPlainText(value) {
  const text = String(value || "");
  return text ? "'" + text : "";
}

function getRegistrationsSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#00dbe8").setFontColor("#061115").setWrap(true);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).createFilter();
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}`;
