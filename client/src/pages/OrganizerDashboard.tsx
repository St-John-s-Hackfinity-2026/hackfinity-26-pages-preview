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
  return <main className="static-organizer-handoff">
    <div className="static-organizer-mark"><ShieldAlert /></div>
    <p>Organizer access</p>
    <h1>Secure squad command center</h1>
    <span>Registration records are managed in the protected Hackfinity Registration Google Sheet.</span>
    <Button asChild><a href={HACKFINITY_SHEET_URL} target="_blank" rel="noreferrer">Open organizer spreadsheet <ExternalLink /></a></Button>
    <a className="static-organizer-source" href="https://github.com/St-John-s-Hackfinity-2026/hackfinity-26-website-source" target="_blank" rel="noreferrer">View organization source <ExternalLink /></a>
  </main>;
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
  if (e.parameter.action !== "count") {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Unsupported request." })).setMimeType(ContentService.MimeType.JSON);
  }
  const sheet = getRegistrationsSheet();
  const result = { ok: true, count: Math.max(0, sheet.getLastRow() - 1) };
  const callback = String(e.parameter.callback || "");
  if (/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
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
