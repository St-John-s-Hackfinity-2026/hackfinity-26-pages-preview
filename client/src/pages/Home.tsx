import LightningField from "@/components/LightningField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowDownRight,
  Bolt,
  ChevronDown,
  Crosshair,
  Menu,
  Minus,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const ST_JOHNS_LOGO = "/manus-storage/st-johns-logo_dfa6a270.png";
const TOOFAN_LOGO = "/manus-storage/toofan-logo_9c6f3908.png";
const HOWNWHY_LOGO = "/manus-storage/hownwhy-logo_9c805a47.png";

type Member = { id: string; name: string; grade: string };
type RegistrationData = {
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
};

const initialForm: RegistrationData = {
  participationType: "group",
  teamName: "",
  leaderName: "",
  leaderClass: "",
  schoolName: "",
  email: "",
  phone: "",
  projectCategory: "Awareness & Education",
  projectTitle: "",
  projectDescription: "",
};

const tracks = [
  ["01", "Awareness & Education", "Build campaigns, experiences, and products that turn prevention education into active participation."],
  ["02", "AI & Detection", "Prototype intelligent early-warning and intervention systems with empathy and responsible safeguards."],
  ["03", "Community & Support", "Create connective tools that make trusted support visible, practical, and closer to students."],
  ["04", "Open Innovation", "Take an unconventional route. The strongest defence against a crisis can start anywhere."],
];

const timeline = [
  ["DAYS 01—03", "THE GATHERING STORM", "Form your squad, register for the hunt, and receive your mission briefing."],
  ["DAYS 04—10", "INTELLIGENCE PHASE", "Research the terrain, sharpen an insight, and make a plan worth building."],
  ["DAYS 11—20", "BUILD & ATTACK", "Code, prototype, test, and turn bold theory into a working solution."],
  ["DAYS 21—27", "FORTIFY & TEST", "Refine with feedback, strengthen your case, and prepare for the final hunt."],
  ["DAYS 28—30", "THE FINAL HUNT", "Take the stage, present to the panel, and let the strongest ideas rise."],
];

const prizeCards = [
  { rank: "2ND", accent: "silver", details: "RUNNER UP + CERTIFICATES", className: "from-right" },
  { rank: "1ST", accent: "gold", details: "GRAND TROPHY + INTERNSHIP", className: "first from-bottom" },
  { rank: "3RD", accent: "bronze", details: "SECOND RUNNER UP + CERTIFICATES", className: "from-left" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Counter({ value, isLoading, isError }: { value?: number; isLoading: boolean; isError: boolean }) {
  const formatted = isLoading ? "··" : isError ? "—" : (value ?? 0).toString().padStart(2, "0");
  const label = isLoading ? "Loading live squads" : isError ? "Live count reconnecting" : "Squads registered";
  return (
    <div className="squad-counter" aria-live="polite">
      <span className="counter-kicker"><Radio size={13} /> Live signal</span>
      <strong>{formatted}</strong>
      <span>{label}</span>
    </div>
  );
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.55, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pointer, setPointer] = useState({ x: -200, y: -200 });
  const [form, setForm] = useState<RegistrationData>(initialForm);
  const [members, setMembers] = useState<Member[]>([{ id: crypto.randomUUID(), name: "", grade: "" }]);
  const [submitted, setSubmitted] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 720], [0, 120]);
  const gridY = useTransform(scrollY, [0, 720], [0, -70]);
  const utilities = trpc.useUtils();
  const countQuery = trpc.registrations.count.useQuery(undefined, { refetchInterval: 7000, refetchOnWindowFocus: true });
  const createRegistration = trpc.registrations.create.useMutation({
    onSuccess: (result) => {
      setSubmitted(true);
      setForm(initialForm);
      setMembers([{ id: crypto.randomUUID(), name: "", grade: "" }]);
      utilities.registrations.count.invalidate();
      toast.success(result.syncStatus === "synced" ? "Squad registered and synced to the organizer sheet." : "Squad registered. The hunt has your signal.");
    },
    onError: (error) => toast.error(error.message || "Registration was not transmitted. Please retry."),
  });

  useEffect(() => {
    const updatePointer = (event: PointerEvent) => setPointer({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointer);
  }, []);

  const activeMembers = useMemo(
    () => members.filter(member => member.name.trim() || member.grade.trim()),
    [members],
  );

  const setField = <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => {
    setSubmitted(false);
    setForm(previous => ({ ...previous, [field]: value }));
  };

  const setMember = (id: string, field: "name" | "grade", value: string) => {
    setSubmitted(false);
    setMembers(previous => previous.map(member => (member.id === id ? { ...member, [field]: value } : member)));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const membersForSubmission = form.participationType === "group" ? activeMembers.map(({ name, grade }) => ({ name, grade })) : [];
    createRegistration.mutate({ ...form, members: membersForSubmission });
  };

  return (
    <main className="cyber-site">
      <LightningField />
      <div className="cursor-neon" style={{ transform: `translate3d(${pointer.x - 180}px, ${pointer.y - 180}px, 0)` }} aria-hidden="true" />
      <div className="noise" aria-hidden="true" />

      <header className="site-header">
        <button className="brand-lockup" onClick={() => scrollTo("top")} aria-label="Back to top">
          <span className="white-chip logo-chip"><img src={ST_JOHNS_LOGO} alt="St. John's School" /></span>
          <span className="wordmark">HACKFINITY<span>’26</span></span>
        </button>
        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Main navigation">
          {["Mission", "Timeline", "Tracks", "Bounty", "Register"].map(item => (
            <button key={item} onClick={() => { scrollTo(item.toLowerCase()); setMenuOpen(false); }}>{item}</button>
          ))}
        </nav>
        <div className="header-actions">
          <span className="white-chip toofan-chip"><img src={TOOFAN_LOGO} alt="TOOFAN" /></span>
          <Button className="register-cta" onClick={() => scrollTo("register")}><Bolt size={15} /> Register</Button>
          <button className="menu-toggle" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen} aria-label="Toggle navigation">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <section id="top" ref={heroRef} className="hero-section">
        <motion.div className="hero-grid" style={{ y: gridY }} aria-hidden="true" />
        <motion.div className="hero-content" style={{ y: heroY }}>
          <Reveal><div className="eyebrow"><span /> St. John&apos;s School, Anchal presents <span /></div></Reveal>
          <Reveal delay={0.08}><p className="mission-stamp">The force behind the storm</p></Reveal>
          <Reveal delay={0.15}>
            <h1>HACKFINITY <em>’26</em><small>TOOFAN — THE NARCO HUNT</small></h1>
          </Reveal>
          <Reveal delay={0.2}><p className="hero-copy">A 30-day school innovation challenge against substance abuse. Build bold solutions. Hunt down the crisis. Shape a drug-free future.</p></Reveal>
          <Reveal delay={0.25}><div className="hero-actions"><Button className="hunt-button" onClick={() => scrollTo("register")}>Join the hunt <ArrowDownRight /></Button><button className="ghost-link" onClick={() => scrollTo("mission")}>Explore mission <ChevronDown /></button></div></Reveal>
        </motion.div>
        <motion.aside className="hero-signal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.36, duration: 0.65 }}>
          <Counter value={countQuery.data} isLoading={countQuery.isLoading} isError={countQuery.isError} />
          <div className="signal-data"><span>Mission status</span><b>Registration open</b></div>
        </motion.aside>
        <div className="scroll-cue"><span /> Scroll to intercept</div>
      </section>

      <section id="mission" className="section mission-section">
        <SectionTitle number="01" title="A signal worth answering" kicker="The mission" />
        <div className="mission-layout">
          <Reveal className="mission-statement"><p className="giant-quote">Young minds <i>can</i> turn a crisis into a future.</p><p>Hackfinity brings together students ready to tackle substance abuse through technology, creativity, and fierce care for their communities.</p><div className="mission-credits"><span><ShieldCheck /> 30-day innovation sprint</span><span><Crosshair /> Impact-first outcomes</span></div></Reveal>
          <div className="mission-points">
            {[[Target, "Real impact", "Build work that moves beyond the classroom and helps a community respond."], [Sparkles, "Innovation first", "Take the problem seriously without putting limits on the imagination."], [Trophy, "Rewards with reach", "Earn recognition, mentorship, and a path to take your solution further."]].map(([Icon, title, text], index) => {
              const PointIcon = Icon as typeof Target;
              return <Reveal key={title as string} delay={index * 0.07}><article className="mission-point"><PointIcon /><div><b>{title as string}</b><p>{text as string}</p></div><span className="point-index">0{index + 1}</span></article></Reveal>;
            })}
          </div>
        </div>
      </section>

      <section id="timeline" className="section timeline-section">
        <SectionTitle number="02" title="The hunt timeline" kicker="Thirty days. Five phases. One mission." />
        <div className="timeline-rail">
          {timeline.map(([day, title, copy], index) => <Reveal key={title} delay={index * 0.05}><article className="timeline-node"><div className="node-orb"><span>{index + 1}</span></div><div className="timeline-panel"><p>{day}</p><h3>{title}</h3><span>{copy}</span></div></article></Reveal>)}
        </div>
      </section>

      <section id="tracks" className="section tracks-section">
        <SectionTitle number="03" title="Choose your battle track" kicker="No idea is too bold for the mission." />
        <div className="track-grid">
          {tracks.map(([number, title, copy], index) => <Reveal key={title} delay={index * 0.06}><article className="track-card"><span>{number}</span><ArrowDownRight /><h3>{title}</h3><p>{copy}</p></article></Reveal>)}
        </div>
      </section>

      <section id="bounty" className="section bounty-section">
        <SectionTitle number="04" title="The bounty" kicker="Great hunts deserve great rewards." />
        <div className="prize-grid">
          {prizeCards.map((prize, index) => <motion.article key={prize.rank} className={`prize-card ${prize.accent} ${prize.className}`} initial={{ opacity: 0, x: index === 0 ? -80 : index === 2 ? 80 : 0, y: index === 1 ? 55 : 0 }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.62, ease: [0.23, 1, 0.32, 1] }}><div className="rank-glitch">{prize.rank}</div><div className="prize-mark"><Trophy /></div><p>Prize pool</p><h3>₹ TBD</h3><span>{prize.details}</span><div className="card-hover-fill" /></motion.article>)}
        </div>
        <p className="bounty-note">Plus special category awards, participant goodies, and mentorship from industry experts.</p>
      </section>

      <section id="register" className="section register-section">
        <SectionTitle number="05" title="Transmit your squad" kicker="Registration channel is open." />
        <div className="registration-shell">
          <aside className="registration-aside"><div className="aside-orb"><Radio /></div><h3>Get on the map.</h3><p>Register solo or assemble a squad of up to five. Your data goes directly to the organizing team.</p><ul><li>Use a contact the organizers can reach</li><li>Choose the track closest to your solution</li><li>Describe your idea in your own words</li></ul></aside>
          <form className="registration-form" onSubmit={submit}>
            <div className="form-topline"><span>Encrypted registration uplink</span><span>Fields marked * are required</span></div>
            <div className="mode-switch" role="radiogroup" aria-label="Participation type"><button type="button" className={form.participationType === "group" ? "active" : ""} onClick={() => setField("participationType", "group")}><UsersRound /> Squad (2—5)</button><button type="button" className={form.participationType === "individual" ? "active" : ""} onClick={() => setField("participationType", "individual")}><Target /> Individual</button></div>
            <div className="form-grid">
              <Field label="Squad name" required><Input value={form.teamName} onChange={event => setField("teamName", event.target.value)} placeholder={form.participationType === "individual" ? "Your name / call sign" : "Enter your squad name"} required /></Field>
              <Field label="Leader name" required><Input value={form.leaderName} onChange={event => setField("leaderName", event.target.value)} placeholder="Your full name" required /></Field>
              <Field label="Class / grade" required><Input value={form.leaderClass} onChange={event => setField("leaderClass", event.target.value)} placeholder="e.g. Grade 11" required /></Field>
              <Field label="School name" required><Input value={form.schoolName} onChange={event => setField("schoolName", event.target.value)} placeholder="Your school" required /></Field>
              <Field label="Email address" required><Input type="email" value={form.email} onChange={event => setField("email", event.target.value)} placeholder="you@email.com" required /></Field>
              <Field label="Phone number" required><Input type="tel" value={form.phone} onChange={event => setField("phone", event.target.value)} placeholder="+91 98765 43210" required /></Field>
              <Field label="Battle track" required><select value={form.projectCategory} onChange={event => setField("projectCategory", event.target.value)}>{tracks.map(([, title]) => <option key={title}>{title}</option>)}<option>Recovery & Rehabilitation</option><option>Data & Analytics</option></select></Field>
              <Field label="Project title" required><Input value={form.projectTitle} onChange={event => setField("projectTitle", event.target.value)} placeholder="Name your project" required /></Field>
              {form.participationType === "group" && <div className="member-section"><div className="member-section-head"><div><Label>Squad members <span>*</span></Label><p>Add 1—4 additional hunters.</p></div><button type="button" onClick={() => setMembers(previous => previous.length < 4 ? [...previous, { id: crypto.randomUUID(), name: "", grade: "" }] : previous)} disabled={members.length >= 4}><Plus /> Add member</button></div>{members.map((member, index) => <div className="member-row" key={member.id}><span>{String(index + 2).padStart(2, "0")}</span><Input value={member.name} onChange={event => setMember(member.id, "name", event.target.value)} placeholder="Member name" required={index === 0} /><Input value={member.grade} onChange={event => setMember(member.id, "grade", event.target.value)} placeholder="Class / grade" required={index === 0} /><button type="button" onClick={() => setMembers(previous => previous.length > 1 ? previous.filter(item => item.id !== member.id) : previous)} aria-label="Remove member" disabled={members.length === 1}><Minus /></button></div>)}</div>}
              <Field className="full" label="Project description / abstract" required><Textarea value={form.projectDescription} onChange={event => setField("projectDescription", event.target.value)} placeholder="Briefly describe the problem your squad is addressing and the solution you want to build." required minLength={20} /></Field>
            </div>
            {submitted && <div className="form-success"><ShieldCheck /> Signal received. Your squad is now registered.</div>}
            <Button type="submit" className="submit-registration" disabled={createRegistration.isPending}>{createRegistration.isPending ? "Transmitting…" : "Submit registration"} <ArrowDownRight /></Button>
          </form>
        </div>
      </section>

      <footer className="site-footer"><div className="footer-grid"><div><span className="footer-kicker">Hackfinity ’26</span><p>Young Minds. Bold Ideas. Drug-Free Future.</p></div><div className="footer-partners"><span className="white-chip"><img src={ST_JOHNS_LOGO} alt="St. John's School" /></span><span className="white-chip"><img src={TOOFAN_LOGO} alt="TOOFAN" /></span></div><div className="powered-chip"><span className="white-chip"><img src={HOWNWHY_LOGO} alt="HowNWhy" /></span><p>Powered by HowNWhy</p></div></div><div className="footer-rule" /><p className="copyright">© 2026 St. John&apos;s School, Anchal. Organizer access is available at <a href="/organizer">/organizer</a>.</p></footer>
    </main>
  );
}

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return <div className={`field ${className}`}><Label>{label} {required && <span>*</span>}</Label>{children}</div>;
}

function SectionTitle({ number, title, kicker }: { number: string; title: string; kicker: string }) {
  return <Reveal className="section-heading"><div><span>{number}</span><p>{kicker}</p></div><h2>{title}</h2></Reveal>;
}
