import LightningField from "@/components/LightningField";
import "./ReferenceTypography.css";
import "./ReferenceSections.css";
import "./MissionTimeline.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { loadAppsScriptSquadCount, submitAppsScriptRegistration } from "@/lib/googleAppsScript";
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
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
  X,
  Flag,
  Hammer,
} from "lucide-react";
import { CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const STATIC_PREVIEW = import.meta.env.VITE_STATIC_PREVIEW === "true";
const STATIC_ASSET_ORIGIN = STATIC_PREVIEW ? "https://neonreg-copxxdu4.manus.space" : "";
const ST_JOHNS_LOGO = `${STATIC_ASSET_ORIGIN}/manus-storage/st-johns-logo_dfa6a270.png`;
const TOOFAN_LOGO = `${STATIC_ASSET_ORIGIN}/manus-storage/toofan-logo_9c6f3908.png`;
const HOWNWHY_LOGO = `${STATIC_ASSET_ORIGIN}/manus-storage/hownwhy-logo_9c805a47.png`;
const MISSION_FIELD_IMAGE = `${STATIC_ASSET_ORIGIN}/manus-storage/hackfinity-mission-field_33c665f6.jpg`;
const LAUNCH_TIMESTAMP = new Date("2026-10-09T00:00:00+05:30").getTime();

type Member = { id: string; name: string; grade: string; email: string; phone: string };
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
  projectCategory: "Awareness Challenge",
  projectTitle: "",
  projectDescription: "",
};

const tracks = [
  ["01", "Awareness Challenge", "Develop innovative solutions that educate students, parents, teachers, and society about the dangers of substance abuse."],
  ["02", "Prevention Challenge", "Develop technologies that help prevent substance abuse through education, monitoring, and early intervention."],
  ["03", "Recovery & Rehabilitation Challenge", "Develop innovative solutions that support recovery, counselling, mental wellness, and rehabilitation."],
  ["04", "Innovation Challenge", "Create breakthrough ideas and futuristic technologies that could transform the fight against substance abuse."],
];

const gradeOptions = Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`);

const timeline = [
  ["DAYS 01—03", "THE GATHERING STORM", "Form your squad, register for the hunt, and receive your mission briefing."],
  ["DAYS 04—10", "INTELLIGENCE PHASE", "Research the terrain, sharpen an insight, and make a plan worth building."],
  ["DAYS 11—20", "BUILD & ATTACK", "Code, prototype, test, and turn bold theory into a working solution."],
  ["DAYS 21—27", "FORTIFY & TEST", "Refine with feedback, strengthen your case, and prepare for the final hunt."],
  ["DAYS 28—30", "THE FINAL HUNT", "Take the stage, present to the panel, and let the strongest ideas rise."],
];

const missionPanels = [
  ["01", "The Crisis", "Substance abuse is stealing futures in our own classrooms, streets, and homes. Silence is its greatest ally — and we refuse to stay silent."],
  ["02", "The Hunt", "For 30 days, young minds weaponize code, design, data, and raw creativity against one enemy. No idea is too bold when the mission is this critical."],
  ["03", "The Future", "Winning projects don't die on demo day. The best solutions get implemented at school level — real tools, real communities, real impact."],
];

const prizeCards = [
  { rank: "02", title: "Runner Up", accent: "silver", details: "Runner Up + Certificates", badge: "" },
  { rank: "01", title: "Champion", accent: "gold", details: "Grand Prize + Trophy + Internship", badge: "Top bounty" },
  { rank: "03", title: "2nd Runner Up", accent: "bronze", details: "Second Runner Up + Certificates", badge: "" },
];

const faqs = [
  ["Who can participate?", "Students who are ready to build a meaningful solution can participate individually or in a squad of two to five members."],
  ["Is there a registration fee?", "No. Hackfinity ’26 is designed as an open school innovation challenge, and there is no registration fee."],
  ["Do I need to know coding?", "No. Coding is welcome but not required. Research, design, storytelling, data, community work, and product thinking are all valuable to a strong squad."],
  ["What are the important dates?", "The hunt runs for thirty days. The timeline above outlines registration, research, building, testing, and the final presentation period."],
  ["What should we build?", "Build a practical, thoughtful idea that helps prevent substance abuse, supports young people, or strengthens awareness and community response."],
  ["What do winners get?", "The prize pool will be revealed soon. Winning squads receive recognition, certificates, mentorship opportunities, and the chance to take their work further."],
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

function getTimeRemaining() {
  const difference = Math.max(0, LAUNCH_TIMESTAMP - Date.now());
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

function LaunchCountdown() {
  const [remaining, setRemaining] = useState(getTimeRemaining);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getTimeRemaining()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return <div className="launch-countdown" aria-label="Countdown to the storm launch">
    <p>The storm lands — 09.10.2026</p>
    <div>{Object.entries(remaining).map(([label, value]) => <span key={label}><b>{String(value).padStart(2, "0")}</b><small>{label}</small></span>)}</div>
  </div>;
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
  const [cursorDepth, setCursorDepth] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState<RegistrationData>(initialForm);
  const [members, setMembers] = useState<Member[]>([{ id: crypto.randomUUID(), name: "", grade: "", email: "", phone: "" }]);
  const [submitted, setSubmitted] = useState(false);
  const [staticCount, setStaticCount] = useState<number | undefined>(undefined);
  const [staticCountLoading, setStaticCountLoading] = useState(STATIC_PREVIEW);
  const [staticCountError, setStaticCountError] = useState(false);
  const [staticSubmitting, setStaticSubmitting] = useState(false);
  const [activeTimelineIndex, setActiveTimelineIndex] = useState<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const timelineEntryRefs = useRef<(HTMLElement | null)[]>([]);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 720], [0, 120]);
  const gridY = useTransform(scrollY, [0, 720], [0, -70]);
  const countdownOpacity = useTransform(scrollY, [0, 210, 560], [1, 0.68, 0]);
  const countdownY = useTransform(scrollY, [0, 560], [0, -56]);
  const countdownScale = useTransform(scrollY, [0, 560], [1, 0.94]);
  const utilities = trpc.useUtils();
  const countQuery = trpc.registrations.count.useQuery(undefined, { enabled: !STATIC_PREVIEW, refetchInterval: 7000, refetchOnWindowFocus: true });
  const createRegistration = trpc.registrations.create.useMutation({
    onSuccess: (result) => {
      setSubmitted(true);
      setForm(initialForm);
      setMembers([{ id: crypto.randomUUID(), name: "", grade: "", email: "", phone: "" }]);
      utilities.registrations.count.setData(undefined, currentCount => (currentCount ?? 0) + 1);
      utilities.registrations.count.invalidate();
      toast.success(result.syncStatus === "synced" ? "Registration Successful — your entry is saved and synced to the organizer sheet." : "Registration Successful — your entry is safely recorded.");
    },
    onError: (error) => toast.error(error.message || "Registration was not transmitted. Please retry."),
  });

  const refreshStaticCount = async () => {
    if (!STATIC_PREVIEW) return;
    setStaticCountLoading(true);
    try {
      setStaticCount(await loadAppsScriptSquadCount());
      setStaticCountError(false);
    } catch {
      setStaticCountError(true);
    } finally {
      setStaticCountLoading(false);
    }
  };

  useEffect(() => {
    if (!STATIC_PREVIEW) return;
    void refreshStaticCount();
    const timer = window.setInterval(() => void refreshStaticCount(), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let previousPoint = { x: -200, y: -200 };
    let resetTimer = 0;
    const updatePointer = (event: PointerEvent) => {
      const nextPoint = { x: event.clientX, y: event.clientY };
      const distance = Math.hypot(nextPoint.x - previousPoint.x, nextPoint.y - previousPoint.y);
      previousPoint = nextPoint;
      setPointer(nextPoint);
      setCursorDepth(Math.min(1, distance / 44));
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => setCursorDepth(0), 120);
    };
    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => {
      window.clearTimeout(resetTimer);
      window.removeEventListener("pointermove", updatePointer);
    };
  }, []);

  useEffect(() => {
    let previousScroll = window.scrollY;
    let ticking = false;
    const updateDirection = () => {
      const nextScroll = window.scrollY;
      if (Math.abs(nextScroll - previousScroll) > 4) setScrollDirection(nextScroll > previousScroll ? "down" : "up");
      previousScroll = nextScroll;
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateDirection);
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const touchViewport = window.matchMedia("(hover: none), (pointer: coarse)");
    if (!touchViewport.matches || typeof IntersectionObserver === "undefined") return;

    const visibleEntries = new Map<number, HTMLElement>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = Number(entry.target.getAttribute("data-timeline-index"));
        if (entry.isIntersecting) visibleEntries.set(index, entry.target as HTMLElement);
        else visibleEntries.delete(index);
      });

      const nextActive = Array.from(visibleEntries.entries())
        .sort(([, first], [, second]) => Math.abs(first.getBoundingClientRect().top - window.innerHeight * 0.43) - Math.abs(second.getBoundingClientRect().top - window.innerHeight * 0.43))[0]?.[0] ?? null;
      setActiveTimelineIndex(nextActive);
    }, { rootMargin: "-18% 0px -34% 0px", threshold: 0.18 });

    timelineEntryRefs.current.forEach((entry) => entry && observer.observe(entry));
    return () => observer.disconnect();
  }, []);

  const activeMembers = useMemo(
    () => members.filter(member => member.name.trim() || member.grade.trim() || member.email.trim() || member.phone.trim()),
    [members],
  );

  const setField = <K extends keyof RegistrationData>(field: K, value: RegistrationData[K]) => {
    setSubmitted(false);
    setForm(previous => ({ ...previous, [field]: value }));
  };

  const setMember = (id: string, field: keyof Omit<Member, "id">, value: string) => {
    setSubmitted(false);
    setMembers(previous => previous.map(member => (member.id === id ? { ...member, [field]: value } : member)));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (STATIC_PREVIEW) {
      const membersForSubmission = form.participationType === "group" ? activeMembers.map(({ name, grade, email, phone }) => ({ name, grade, email, phone })) : [];
      setStaticSubmitting(true);
      try {
        await submitAppsScriptRegistration({
          ...form,
          id: `GH-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
          createdAt: new Date().toISOString(),
          members: membersForSubmission,
        });
        setSubmitted(true);
        setForm(initialForm);
        setMembers([{ id: crypto.randomUUID(), name: "", grade: "", email: "", phone: "" }]);
        setStaticCount(current => (current ?? 0) + 1);
        void window.setTimeout(() => void refreshStaticCount(), 1_500);
        toast.success("Registration Successful — your entry has been sent to the organizing team.");
      } catch {
        toast.error("Registration could not be sent. Check your connection and retry.");
      } finally {
        setStaticSubmitting(false);
      }
      return;
    }
    const membersForSubmission = form.participationType === "group" ? activeMembers.map(({ name, grade, email, phone }) => ({ name, grade, email, phone })) : [];
    createRegistration.mutate({ ...form, members: membersForSubmission });
  };

  return (
    <main className={`cyber-site scroll-${scrollDirection}`} style={{ "--cursor-depth": cursorDepth } as CSSProperties}>
      <LightningField />
      <div className="cursor-neon" style={{ transform: `translate3d(${pointer.x - 180}px, ${pointer.y - 180}px, 0)` }} aria-hidden="true" />
      <div className="cursor-parallax-orb" style={{ transform: `translate3d(${pointer.x * 0.08 - 70}px, ${pointer.y * 0.07 - 70}px, 0)` }} aria-hidden="true" />
      <div className="noise" aria-hidden="true" />

      <header className="site-header">
        <button className="brand-lockup" onClick={() => scrollTo("top")} aria-label="Back to top">
          <span className="white-chip logo-chip"><img src={ST_JOHNS_LOGO} alt="St. John's School" /></span>
          <span className="wordmark">HACKFINITY<span>’26</span></span>
        </button>
        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Main navigation">
          {["Mission", "Timeline", "Tracks", "Bounty", "FAQ", "Register"].map(item => (
            <button key={item} onClick={() => { scrollTo(item.toLowerCase()); setMenuOpen(false); }}>{item}</button>
          ))}
        </nav>
        <div className="header-actions">
          <Button className="register-cta" onClick={() => scrollTo("register")}><Bolt size={15} /> Register</Button>
          <span className="white-chip toofan-chip"><img src={TOOFAN_LOGO} alt="TOOFAN" /></span>
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
            <h1><span className="hero-title-word">HACKFINITY</span> <em>’26</em><small>TOOFAN — THE NARCO HUNT</small></h1>
          </Reveal>
          <Reveal delay={0.2}><p className="hero-copy">A 30-day school innovation challenge against substance abuse. Build bold solutions. Hunt down the crisis. Shape a drug-free future.</p></Reveal>
          <Reveal delay={0.22}><p className="hero-motto"><Sparkles aria-hidden="true" /> Innovate Today. Protect Tomorrow. Build a Drug-Free Future.</p></Reveal>
          <Reveal delay={0.25}><div className="hero-actions"><Button className="hunt-button" onClick={() => scrollTo("register")}>Join the hunt <ArrowDownRight /></Button><button className="ghost-link" onClick={() => scrollTo("mission")}>Explore mission <ChevronDown /></button></div></Reveal>
          <motion.div className="countdown-scroll-fade" style={{ opacity: countdownOpacity, y: countdownY, scale: countdownScale }}><Reveal delay={0.3}><LaunchCountdown /></Reveal></motion.div>
        </motion.div>
        <motion.aside className="hero-signal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.36, duration: 0.65 }}>
          <Counter value={STATIC_PREVIEW ? staticCount : countQuery.data} isLoading={STATIC_PREVIEW ? staticCountLoading : countQuery.isLoading} isError={STATIC_PREVIEW ? staticCountError : countQuery.isError} />
          <div className="signal-data"><span>Mission status</span><b>Registration open</b></div>
        </motion.aside>
        <div className="scroll-cue"><span /> Scroll to intercept</div>
      </section>

      <section className="mission-ticker" aria-label="Hackfinity mission statements">
        <div className="ticker-track">
          {["DRUG-FREE TOMORROW", "HUNT THE CRISIS", "BUILD THE FUTURE", "YOUNG MINDS", "BOLD IDEAS", "DRUG-FREE TOMORROW", "HUNT THE CRISIS", "BUILD THE FUTURE", "YOUNG MINDS", "BOLD IDEAS"].map((item, index) => <span key={`${item}-${index}`}>{item}<i>◆</i></span>)}
        </div>
      </section>

      <section id="mission" className="mission-command">
        <div className="mission-panels">
          {missionPanels.map(([number, title, copy], index) => <motion.article key={title} className={`mission-command-panel panel-${index + 1}`} initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .28 }} transition={{ duration: .55, delay: index * .08, ease: [0.23, 1, 0.32, 1] }}><span>{number} /</span><h2>{title}</h2><p>{copy}</p></motion.article>)}
        </div>
        <div className="mission-field-image" style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 8, 10, .8), rgba(7, 8, 10, .18)), url(${MISSION_FIELD_IMAGE})` }}><div><p>Field unit — Hack Club SJA</p><h2>30 days. 5 phases. One mission.</h2></div></div>
      </section>

      <section id="timeline" className="timeline-command">
        <div className="timeline-command-heading"><p>The mission timeline</p><h2>Five phases. One mission.</h2><span>Track your journey through the storm.</span><i /></div>
        <div className="timeline-command-rail">
          {timeline.map(([day, title, copy], index) => {
            const icons = [Crosshair, Search, Hammer, ShieldCheck, Flag];
            const StageIcon = icons[index] ?? Target;
            const isMobileActive = activeTimelineIndex === index;
            return <motion.article key={title} ref={entry => { timelineEntryRefs.current[index] = entry; }} data-timeline-index={index} className={`timeline-command-entry ${isMobileActive ? "is-mobile-active" : ""}`} initial={{ opacity: 0, x: -25 }} whileInView={{ opacity: 1, x: 0 }} whileHover={{ y: -3 }} onTap={() => setActiveTimelineIndex(current => current === index ? null : index)} viewport={{ once: false, amount: .58 }} transition={{ duration: .46, ease: [0.23, 1, 0.32, 1] }}><div className="timeline-icon"><StageIcon /></div><div className="timeline-copy"><p>{day}</p><h3>{title}</h3><span>{copy}</span></div><b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b></motion.article>;
          })}
        </div>
      </section>

      <section id="tracks" className="section tracks-section">
        <SectionTitle number="03" title="Choose your battle track" kicker="No idea is too bold for the mission." />
        <div className="track-grid">
          {tracks.map(([number, title, copy], index) => <Reveal key={title} delay={index * 0.06}><article className="track-card"><span>{number}</span><ArrowDownRight /><h3>{title}</h3><p>{copy}</p></article></Reveal>)}
        </div>
      </section>

      <section id="bounty" className="reference-bounty">
        <div className="bounty-intro">
          <span className="bounty-ghost" aria-hidden="true">BOUNTY</span>
          <p>The bounty</p>
          <h2>Great hunts deserve<br />great rewards</h2>
          <span>Prize pool to be revealed — but glory, mentorship, and real-world implementation are guaranteed.</span>
          <i />
        </div>
        <div className="reference-prize-grid">
          {prizeCards.map((prize, index) => <motion.article key={prize.rank} className={`reference-prize-card ${prize.accent} ${prize.rank === "01" ? "champion" : ""}`} initial={{ opacity: 0, x: index === 0 ? -70 : index === 2 ? 70 : 0, y: index === 1 ? 40 : 0 }} whileInView={{ opacity: 1, x: 0, y: 0 }} whileHover={{ y: -12, scale: 1.025 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.58, ease: [0.23, 1, 0.32, 1] }}><span className="prize-number" aria-hidden="true">{prize.rank}</span><div className="prize-symbol"><Trophy /></div><small>{prize.title}</small><h3>₹ TBD</h3><p>{prize.details}</p>{prize.badge && <b>{prize.badge}</b>}</motion.article>)}
        </div>
        <p className="reference-bounty-note">+ Special category awards <i>/</i> Goodies for all participants <i>/</i> Mentorship from industry experts</p>
      </section>

      <section id="faq" className="reference-faq">
        <div className="faq-intro"><span className="faq-ghost" aria-hidden="true">FAQ</span><p>Intel desk</p><h2>Questions<br />before the<br />hunt?</h2><span>Everything you need to know before you deploy. Still stuck? Reach out to the Hack Club at St. John&apos;s School, Anchal.</span><i /></div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => {
            const isOpen = openFaq === index;
            return <article key={question} className={isOpen ? "faq-item open" : "faq-item"}><button onClick={() => setOpenFaq(isOpen ? null : index)} aria-expanded={isOpen}><span>{String(index + 1).padStart(2, "0")}</span><b>{question}</b><ChevronDown /></button><div className="faq-answer"><p>{answer}</p></div></article>;
          })}
        </div>
      </section>

      <section id="register" className="section register-section">
        <SectionTitle number="05" title="Transmit your squad" kicker="Registration channel is open." />
        <div className="registration-shell">
          <aside className="registration-aside"><div className="aside-orb"><Radio /></div><h3>Get on the map.</h3><p>Register solo or assemble a squad of up to five. Your data goes directly to the organizing team.</p><ul><li>Use a contact the organizers can reach</li><li>Choose the track closest to your solution</li><li>Describe your idea in your own words</li></ul></aside>
          <form className="registration-form" onSubmit={submit}>
            {STATIC_PREVIEW && <div className="static-preview-notice"><ShieldCheck /> <span>Official Hackfinity ’26 website. Submit your squad here. Registration records are securely delivered to the organizing team’s Google Sheet.</span></div>}
            <div className="form-topline"><span>Encrypted registration uplink</span><span>Fields marked * are required</span></div>
            <div className="mode-switch" role="radiogroup" aria-label="Participation type"><button type="button" className={form.participationType === "group" ? "active" : ""} onClick={() => setField("participationType", "group")}><UsersRound /> Squad (2—5)</button><button type="button" className={form.participationType === "individual" ? "active" : ""} onClick={() => setField("participationType", "individual")}><Target /> Individual</button></div>
            <div className="form-grid">
              <Field label="Squad name" required><Input value={form.teamName} onChange={event => setField("teamName", event.target.value)} placeholder={form.participationType === "individual" ? "Your name / call sign" : "Enter your squad name"} required /></Field>
              <Field label="Leader name" required><Input value={form.leaderName} onChange={event => setField("leaderName", event.target.value)} placeholder="Your full name" required /></Field>
              <Field label="Class / grade" required><select value={form.leaderClass} onChange={event => setField("leaderClass", event.target.value)} required><option value="" disabled>Select your class</option>{gradeOptions.map(grade => <option key={grade} value={grade}>{grade}</option>)}</select></Field>
              <Field label="School name" required><Input value={form.schoolName} onChange={event => setField("schoolName", event.target.value)} placeholder="Your school" required /></Field>
              <Field label="Email address" required><Input type="email" value={form.email} onChange={event => setField("email", event.target.value)} placeholder="you@email.com" required /></Field>
              <Field label="Phone number" required><Input type="tel" value={form.phone} onChange={event => setField("phone", event.target.value)} placeholder="+91 98765 43210" required /></Field>
              <Field label="Battle track" required><select value={form.projectCategory} onChange={event => setField("projectCategory", event.target.value)}>{tracks.map(([, title]) => <option key={title}>{title}</option>)}</select></Field>
              <Field label="Project title" required><Input value={form.projectTitle} onChange={event => setField("projectTitle", event.target.value)} placeholder="Name your project" required /></Field>
              {form.participationType === "group" && <div className="member-section"><div className="member-section-head"><div><Label>Squad members <span>*</span></Label><p>Add 1—4 additional hunters with a contact email and number.</p></div><button type="button" onClick={() => setMembers(previous => previous.length < 4 ? [...previous, { id: crypto.randomUUID(), name: "", grade: "", email: "", phone: "" }] : previous)} disabled={members.length >= 4}><Plus /> Add member</button></div>{members.map((member, index) => <div className="member-row" key={member.id}><span>{String(index + 2).padStart(2, "0")}</span><div className="member-fields"><Input className="member-name" value={member.name} onChange={event => setMember(member.id, "name", event.target.value)} placeholder="Member name" required={index === 0} /><select className="member-grade" value={member.grade} onChange={event => setMember(member.id, "grade", event.target.value)} required={index === 0} aria-label={`Class or grade for member ${index + 2}`}><option value="" disabled>Select class</option>{gradeOptions.map(grade => <option key={grade} value={grade}>{grade}</option>)}</select><Input className="member-email" type="email" value={member.email} onChange={event => setMember(member.id, "email", event.target.value)} placeholder="Member email address" required={index === 0} /><Input className="member-phone" type="tel" value={member.phone} onChange={event => setMember(member.id, "phone", event.target.value)} placeholder="Member phone number" required={index === 0} /></div><button type="button" onClick={() => setMembers(previous => previous.length > 1 ? previous.filter(item => item.id !== member.id) : previous)} aria-label="Remove member" disabled={members.length === 1}><Minus /></button></div>)}</div>}
              <Field className="full" label="Project description / abstract" required><Textarea value={form.projectDescription} onChange={event => setField("projectDescription", event.target.value)} placeholder="Briefly describe the problem your squad is addressing and the solution you want to build." required minLength={20} /></Field>
            </div>
            {submitted && <div className="form-success" role="status"><ShieldCheck /> <span><b>Registration Successful.</b> Your entry is confirmed and the live squad count has been updated.</span></div>}
            <Button type="submit" className="submit-registration" disabled={STATIC_PREVIEW ? staticSubmitting : createRegistration.isPending}>{STATIC_PREVIEW ? staticSubmitting ? "Transmitting…" : "Submit registration" : createRegistration.isPending ? "Transmitting…" : "Submit registration"} <ArrowDownRight /></Button>
          </form>
        </div>
      </section>

      <footer className="site-footer"><div className="footer-grid"><div><span className="footer-kicker">Hackfinity ’26</span><p>Young Minds. Bold Ideas. Drug-Free Future.</p></div><div className="footer-partners"><span className="white-chip"><img src={ST_JOHNS_LOGO} alt="St. John's School" /></span><span className="white-chip"><img src={TOOFAN_LOGO} alt="TOOFAN" /></span></div><div className="powered-chip"><span className="white-chip"><img src={HOWNWHY_LOGO} alt="HowNWhy" /></span><p>Powered by HowNWhy</p></div></div><div className="footer-rule" /><p className="copyright">© 2026 St. John&apos;s School, Anchal. {STATIC_PREVIEW ? "Organizer records are managed securely in the Hackfinity Registration Google Sheet." : <>Organizer access is available at <a href="/organizer">/organizer</a>.</>}</p></footer>
    </main>
  );
}

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return <div className={`field ${className}`}><Label>{label} {required && <span>*</span>}</Label>{children}</div>;
}

function SectionTitle({ number, title, kicker }: { number: string; title: string; kicker: string }) {
  return <Reveal className="section-heading"><div><span>{number}</span><p>{kicker}</p></div><h2>{title}</h2></Reveal>;
}
