import { useEffect, useRef, useState } from "react";
import { fetchContent, type SiteContent } from "@/lib/cms";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  Menu, X, ShieldCheck, FileText, Scale, Phone, Mail, MapPin,
  MessageCircle, Check, Upload, Star, ArrowLeft, ChevronDown,
  Award, Clock, Users, TrendingUp,
} from "lucide-react";

/* ─────────────────── Types ─────────────────── */
type Plan  = { id: string; title: string; description: string; price?: string|null; recommended: boolean; cta_label?: string|null; cta_url?: string|null; sort_order: number; enabled: boolean; };
type Step  = { id: string; title: string; description: string; sort_order: number; enabled: boolean; };
type Faq   = { id: string; question: string; answer: string; sort_order: number; enabled: boolean; };
type Video = { id: string; title: string; description: string; url: string; thumbnail_url?: string|null; sort_order: number; enabled: boolean; };

/* ─────────────────── Hooks ──────────────────── */
function useScrollReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Respect reduced-motion — reveal immediately */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const id = setTimeout(() => {
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
        { threshold: 0.12 }
      );
      obs.observe(el);
      return () => obs.disconnect();
    }, delay);

    return () => clearTimeout(id);
  }, [delay]);

  return { ref, visible };
}

function useCounter(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start || target === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let startTime = 0;
    const tick = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);          /* ease-out-cubic */
      setValue(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [start, target, duration]);

  return value;
}

function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

/* ─────────────────── Eyebrow ────────────────── */
/* Uses an explicit <span> for the accent line so RTL direction
   doesn't misplace a CSS ::before pseudo-element. */
function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`eyebrow ${className}`}>
      <span className="w-5 h-0.5 rounded-full bg-accent shrink-0 inline-block" aria-hidden />
      {children}
    </p>
  );
}

/* ─────────────────── Gold accent bar ───────────
   Replaces ::before pseudo on headings.          */
function GoldLine() {
  return <span className="gold-accent-line" aria-hidden />;
}

/* ─────────────────── Scroll reveal ─────────────
   Wraps children and fades them in when visible. */
function Reveal({
  children,
  className = "",
  dir = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  dir?: "up" | "left" | "right" | "scale";
  delay?: number;
}) {
  const { ref, visible } = useScrollReveal(delay);
  const base =
    dir === "left"  ? "reveal-left"  :
    dir === "right" ? "reveal-right" :
    dir === "scale" ? "reveal-scale" :
    "reveal";

  return (
    <div
      ref={ref}
      className={`${base} ${visible ? "visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ─────────────────── Images ─────────────────── */
const HERO_IMAGE    = "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1920&q=85";
const SERVICE_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80";
const CTA_IMAGE     = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=75";

/* ═══════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════ */
export default function Index() {
  const [c, setC] = useState<SiteContent>({});
  const [plans, setPlans]   = useState<Plan[]>([]);
  const [steps, setSteps]   = useState<Step[]>([]);
  const [faqs,  setFaqs]    = useState<Faq[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    (async () => {
      const [content, p, s, f, v] = await Promise.all([
        fetchContent(),
        supabase.from("plans").select("*").eq("enabled", true).order("sort_order"),
        supabase.from("process_steps").select("*").eq("enabled", true).order("sort_order"),
        supabase.from("faqs").select("*").eq("enabled", true).order("sort_order"),
        supabase.from("videos").select("*").eq("enabled", true).order("sort_order"),
      ]);
      setC(content);
      setPlans((p.data as any) ?? []);
      setSteps((s.data as any) ?? []);
      setFaqs((f.data as any)  ?? []);
      setVideos((v.data as any) ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header c={c} />
      <main>
        <Hero c={c} />
        <StatsBar />
        <Service c={c} />
        <Plans c={c} plans={plans} />
        <Process c={c} steps={steps} />
        <UploadForm c={c} />
        {videos.length > 0 && <Videos c={c} videos={videos} />}
        <Faqs c={c} faqs={faqs} />
        <FinalCta c={c} />
        <Contact c={c} />
      </main>
      <Footer c={c} />
      <FloatingCta c={c} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════ */
function Header({ c }: { c: SiteContent }) {
  const h = c.header ?? {};
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(60);

  const links = [
    { href: "#service", label: "השירות" },
    { href: "#process", label: "התהליך" },
    { href: "#plans",   label: "מסלולים" },
    { href: "#faq",     label: "שאלות נפוצות" },
    { href: "#contact", label: "יצירת קשר" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/96 backdrop-blur-xl shadow-[0_2px_20px_oklch(13%_0.022_225_/_0.07)]"
          : "bg-transparent"
      }`}
    >
      <div className="container-narrow flex items-center justify-between h-16">
        {/* Logo — SVG inverted to white on dark hero, natural on white header */}
        <a href="#" className="flex items-center" aria-label="חזרה לדף הבית">
          <img
            src="/logo.svg"
            alt="ליאור ראם — בדיקת חוזה קבלן"
            className={`h-9 md:h-11 w-auto transition-all duration-500 ${
              scrolled ? "" : "brightness-0 invert"
            }`}
            style={scrolled ? {} : { filter: "brightness(0) invert(1)" }}
          />
        </a>

        {/* Desktop nav */}
        <nav aria-label="ניווט ראשי" className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`font-medium transition-colors duration-200 hover:text-accent ${
                scrolled ? "text-foreground/75" : "text-white/75"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Upload CTA */}
        <div className="hidden md:block">
          <a
            href="#upload"
            className="inline-flex items-center gap-2 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-[var(--shadow-gold)] hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: "var(--gradient-gold)", color: "oklch(99% 0.003 80)" }}
          >
            <Upload className="w-4 h-4" aria-hidden />
            {h.cta_label || "העלאת חוזה"}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${
            scrolled ? "text-foreground" : "text-white"
          }`}
          onClick={() => setOpen(!open)}
          aria-label={open ? "סגור תפריט" : "פתח תפריט"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="ניווט נייד"
          className="md:hidden bg-white/97 backdrop-blur-xl border-t border-border animate-fade-in"
        >
          <div className="container-narrow py-4 flex flex-col gap-0.5">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 px-4 rounded-xl text-foreground/80 hover:text-accent hover:bg-accent-soft font-medium transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#upload"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 font-semibold py-3 px-5 rounded-xl text-sm"
              style={{ background: "var(--gradient-gold)", color: "oklch(99% 0.003 80)" }}
            >
              <Upload className="w-4 h-4" aria-hidden />
              {h.cta_label || "העלאת חוזה"}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

/* ═══════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════ */
function Hero({ c }: { c: SiteContent }) {
  const h = c.hero ?? {};
  const contact = c.contact ?? {};
  const wa = contact.whatsapp ? `https://wa.me/${contact.whatsapp}` : "#";

  return (
    <section className="hero-section min-h-screen flex flex-col justify-center" aria-label="כותרת ראשית">
      {/* Luxury house — slow pan, reduced-motion-safe via CSS */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover animate-hero-pan"
          style={{ transformOrigin: "center center" }}
          fetchPriority="high"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 hero-overlay" />
        {/* Bottom fade into warm cream background */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container-narrow relative z-10 grid lg:grid-cols-2 gap-14 items-center pt-28 pb-24 md:pt-36 md:pb-28">
        {/* Text */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Eyebrow badge */}
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 border border-white/18 text-white/85 text-[11px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded-full bg-white/8">
              <span className="w-1.5 h-1.5 bg-accent rounded-full" aria-hidden />
              {h.eyebrow || "שירות משפטי מקצועי"}
            </span>
          </div>

          {/* Headline — accent word in solid gold, NOT gradient */}
          <h1 className="text-4xl md:text-[3.25rem] lg:text-[3.75rem] font-bold leading-[1.08] text-white animate-fade-in-up delay-100">
            {h.headline ?? (
              <>
                בדיקת חוזה קבלן<br />
                <span className="text-accent">לפני שחותמים</span>
              </>
            )}
          </h1>

          <p className="text-base md:text-lg text-white/68 leading-relaxed max-w-[52ch] animate-fade-in-up delay-200">
            {h.body || "שירות משפטי מקצועי לבדיקת חוזי רכישה מקבלן. הגנו על ההשקעה הגדולה בחייכם לפני החתימה."}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 animate-fade-in-up delay-300">
            <a
              href="#upload"
              className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-xl text-base transition-all duration-300 hover:shadow-[var(--shadow-gold)] hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: "var(--gradient-gold)", color: "oklch(99% 0.003 80)" }}
            >
              <Upload className="w-4 h-4" aria-hidden />
              {h.cta_primary || "העלאת חוזה לבדיקה"}
            </a>

            {h.cta_whatsapp && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-white/22 text-white font-semibold px-6 py-3.5 rounded-xl text-base transition-all duration-300 hover:bg-white/12 hover:border-white/38"
              >
                <MessageCircle className="w-4 h-4" aria-hidden />
                {h.cta_whatsapp}
              </a>
            )}

            {h.cta_secondary && (
              <a
                href="#videos"
                className="inline-flex items-center gap-1.5 text-white/60 font-medium px-3 py-3.5 text-sm hover:text-white/90 transition-colors"
              >
                {h.cta_secondary}
                <ChevronDown className="w-4 h-4" aria-hidden />
              </a>
            )}
          </div>

          {h.note && (
            <p className="flex items-center gap-2 text-xs text-white/48 animate-fade-in-up delay-400">
              <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden />
              {h.note}
            </p>
          )}
        </div>

        {/* Floating stats card — glassmorphism, used once */}
        <div className="order-1 lg:order-2 flex justify-center lg:justify-start animate-scale-in delay-300">
          <div className="glass-hero-card rounded-3xl p-6 md:p-8 max-w-[280px] w-full animate-float">
            <div
              className="w-12 h-12 rounded-xl grid place-items-center mb-4"
              style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold)" }}
            >
              <ShieldCheck className="w-6 h-6 text-white" aria-hidden />
            </div>

            <p className="text-white font-bold text-lg mb-1.5">בדיקה מקצועית</p>
            <p className="text-white/55 text-sm leading-relaxed mb-5 max-w-[38ch]">
              עורך דין בודק כל סעיף, מזהה סיכונים ומגן על האינטרס שלך
            </p>

            <dl className="grid grid-cols-2 gap-2.5">
              {([
                { dt: "חוזים נבדקו", dd: "500+" },
                { dt: "שנות ניסיון", dd: "10+" },
                { dt: "לקוחות מרוצים", dd: "98%" },
                { dt: "זמן מענה", dd: "24h" },
              ] as const).map(({ dt, dd }) => (
                <div key={dt} className="rounded-xl px-3 py-2.5 text-center" style={{ background: "oklch(100% 0 0 / 0.07)" }}>
                  <dd className="text-accent font-bold text-base">{dd}</dd>
                  <dt className="text-white/45 text-[11px] mt-0.5">{dt}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-fade-in delay-700" aria-hidden>
        <span className="text-white/35 text-[10px] tracking-widest uppercase">גלול</span>
        <div className="w-5 h-8 border border-white/22 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full animate-bounce-dot" style={{ background: "oklch(64% 0.118 72 / 0.9)" }} />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   STATS BAR
═══════════════════════════════════════════════ */
const STATS = [
  { Icon: Award,      n: 500, suffix: "+", label: "חוזים נבדקו" },
  { Icon: Clock,      n: 10,  suffix: "+", label: "שנות ניסיון" },
  { Icon: Users,      n: 98,  suffix: "%", label: "לקוחות מרוצים" },
  { Icon: TrendingUp, n: 24,  suffix: "h", label: "זמן מענה ממוצע" },
] as const;

function StatItem({ Icon, n, suffix, label }: typeof STATS[number]) {
  const { ref, visible } = useScrollReveal();
  const val = useCounter(n, 1800, visible);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "visible" : ""} flex items-center gap-4 px-6 py-5`}
    >
      <span className="shrink-0 w-10 h-10 rounded-xl bg-accent/10 text-accent grid place-items-center" aria-hidden>
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-foreground tabular-nums" aria-live="polite">
          {visible ? val : 0}{suffix}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function StatsBar() {
  return (
    <section aria-label="נתוני שירות" className="relative z-10 -mt-px bg-card border-y border-border shadow-[var(--shadow-elev)]">
      <div className="container-narrow">
        {/* RTL-aware dividers: divide-x-reverse flips which side gets the border */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-x-reverse divide-border">
          {STATS.map((s) => <StatItem key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   SERVICE
═══════════════════════════════════════════════ */
function Service({ c }: { c: SiteContent }) {
  const s = c.service ?? {};
  const benefits: string[] = s.benefits ?? [];

  return (
    <section id="service" className="section">
      <div className="container-narrow">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Photo column */}
          <Reveal dir="right" className="relative order-2 lg:order-1">
            <div className="absolute -inset-6 rounded-3xl pointer-events-none" style={{ background: "oklch(64% 0.118 72 / 0.05)", filter: "blur(40px)" }} aria-hidden />
            <img
              src={SERVICE_IMAGE}
              alt="עורך דין בוחן מסמכי נדל&quot;ן"
              className="relative rounded-2xl shadow-[var(--shadow-elev)] w-full object-cover aspect-[4/3]"
              loading="lazy"
              width={900}
              height={675}
            />

            {/* Floating badge — glassmorphism, used once */}
            <div className="absolute -bottom-5 -right-4 glass-badge rounded-2xl px-5 py-3 flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold)" }}
                aria-hidden
              >
                <Scale className="w-5 h-5 text-white" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">בדיקה על ידי</p>
                <p className="font-bold text-sm text-foreground">עורך דין מוסמך</p>
              </div>
            </div>
          </Reveal>

          {/* Text column */}
          <div className="order-1 lg:order-2 space-y-6">
            <Reveal>
              <Eyebrow>השירות</Eyebrow>
              <GoldLine />
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mt-2">
                {s.title || "מה כוללת הבדיקה?"}
              </h2>
              <p className="text-muted-foreground leading-relaxed mt-4 max-w-[58ch]">
                {s.intro || "בדיקה מקיפה של כל סעיפי החוזה על ידי עורך דין מנוסה בתחום הנדל״ן."}
              </p>
            </Reveal>

            <ul className="grid sm:grid-cols-2 gap-3 mt-6" aria-label="יתרות השירות">
              {benefits.map((b, i) => (
                <Reveal key={i} delay={i * 70}>
                  <li className="card-elev p-4 flex gap-3 group">
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 text-accent grid place-items-center transition-all duration-300 group-hover:bg-accent group-hover:text-white" aria-hidden>
                      <Check className="w-4 h-4" />
                    </span>
                    <p className="text-sm leading-relaxed pt-0.5">{b}</p>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   PLANS
═══════════════════════════════════════════════ */
function Plans({ c, plans }: { c: SiteContent; plans: Plan[] }) {
  const t = c.plans_section ?? {};

  return (
    <section id="plans" className="section relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(145deg, oklch(93% 0.007 80) 0%, oklch(97% 0.005 75) 60%, oklch(93% 0.007 80) 100%)" }} aria-hidden />
      <div className="absolute top-0 inset-x-0 h-px bg-border pointer-events-none" aria-hidden />

      <div className="container-narrow relative">
        <Reveal className="text-center mb-14">
          <Eyebrow className="justify-center">מסלולים</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold mt-4">
            {t.title || "בחרו את המסלול המתאים"}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-[52ch] mx-auto">שלושה מסלולים מותאמים לצרכים שונים</p>
        </Reveal>

        {/* Grid: items-stretch so cards fill height equally */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, i) => (
            <Reveal key={p.id} dir="scale" delay={i * 100}>
              <div
                className={`relative rounded-2xl p-7 flex flex-col h-full transition-all duration-300 ${
                  p.recommended
                    ? "shadow-[0_20px_60px_oklch(29%_0.082_155_/_0.28)]"
                    : "card-luxury"
                }`}
                style={p.recommended ? {
                  background: "oklch(29% 0.082 155)",
                  color: "oklch(97% 0.005 75)",
                  outline: "2px solid oklch(64% 0.118 72)",
                  outlineOffset: "0px",
                } : undefined}
              >
                {p.recommended && (
                  <span
                    className="absolute -top-3.5 right-6 inline-flex items-center gap-1 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-[var(--shadow-gold)]"
                    style={{ background: "var(--gradient-gold)" }}
                  >
                    <Star className="w-3 h-3 fill-current" aria-hidden /> מומלץ
                  </span>
                )}

                <p className="text-[11px] font-bold uppercase tracking-widest mb-2 text-accent">
                  מסלול {i + 1}
                </p>
                <h3 className="text-xl font-bold">{p.title}</h3>

                {p.price && (
                  <p className="mt-3">
                    <span className="text-3xl font-extrabold text-accent">{p.price}</span>
                  </p>
                )}

                <p className={`mt-4 text-sm leading-relaxed flex-1 ${
                  p.recommended ? "text-[oklch(97%_0.005_75_/_0.72)]" : "text-muted-foreground"
                }`}>
                  {p.description}
                </p>

                <div className={`mt-5 pt-5 border-t ${p.recommended ? "border-white/12" : "border-border"}`} />

                <a
                  href={p.cta_url || "#upload"}
                  className={`mt-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    p.recommended
                      ? "text-white hover:shadow-[var(--shadow-gold)] hover:-translate-y-0.5"
                      : "border-2 border-primary/20 text-primary hover:border-primary hover:bg-primary hover:text-white"
                  }`}
                  style={p.recommended ? { background: "var(--gradient-gold)" } : undefined}
                >
                  {p.cta_label || "בחר מסלול"}
                  <ArrowLeft className="w-4 h-4" aria-hidden />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   PROCESS
═══════════════════════════════════════════════ */
function Process({ c, steps }: { c: SiteContent; steps: Step[] }) {
  const t = c.process_section ?? {};

  return (
    <section id="process" className="section process-section relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" style={{ background: "oklch(64% 0.118 72 / 0.08)" }} aria-hidden />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2" style={{ background: "oklch(100% 0 0 / 0.04)" }} aria-hidden />

      <div className="container-narrow relative">
        <Reveal className="text-center mb-16">
          <Eyebrow className="justify-center" style={{ color: "oklch(64% 0.118 72)" } as React.CSSProperties}>
            התהליך
          </Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-4">
            {t.title || "איך זה עובד?"}
          </h2>
        </Reveal>

        {/* Connector line (desktop only) */}
        <div className="relative">
          <div
            className="hidden lg:block absolute top-8 right-[calc(12.5%+20px)] left-[calc(12.5%+20px)] h-px pointer-events-none"
            style={{ background: "oklch(100% 0 0 / 0.12)" }}
            aria-hidden
          />

          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10" aria-label="שלבי התהליך">
            {steps.map((s, i) => (
              <Reveal key={s.id} dir="scale" delay={i * 110}>
                <li className="text-center group">
                  <div className="relative inline-flex mb-5">
                    <div
                      className="w-16 h-16 rounded-2xl grid place-items-center text-2xl font-extrabold text-white transition-all duration-300 group-hover:-translate-y-1"
                      style={{
                        background: "oklch(100% 0 0 / 0.10)",
                        border: "1px solid oklch(100% 0 0 / 0.18)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--gradient-gold)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "oklch(100% 0 0 / 0.10)")}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                  <p className="text-sm leading-relaxed max-w-[28ch] mx-auto" style={{ color: "oklch(97% 0.005 75 / 0.58)" }}>
                    {s.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   UPLOAD FORM
═══════════════════════════════════════════════ */
function UploadForm({ c }: { c: SiteContent }) {
  const u = c.upload_section ?? {};
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-lead`;
      const res = await fetch(url, {
        method: "POST",
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "error");
      setDone(true);
      toast.success(u.success || "המסמכים נשלחו בהצלחה.");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error(err.message || u.error || "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  const trustItems = [
    { Icon: ShieldCheck, text: "שמירה מאובטחת של המסמכים" },
    { Icon: FileText,    text: `סוגי קבצים: ${u.allowed_types || "PDF, DOC, DOCX, JPG, PNG"}` },
    { Icon: Scale,       text: "השירות בתשלום, ניתן על ידי עורך דין" },
    { Icon: Clock,       text: "מענה בתוך 24 שעות עסקיות" },
  ];

  return (
    <section id="upload" className="section relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(145deg, oklch(93% 0.007 80 / 0.5) 0%, oklch(97% 0.005 75) 100%)" }}
        aria-hidden
      />
      <div className="container-narrow relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Info */}
          <Reveal dir="right">
            <Eyebrow>העלאת חוזה</Eyebrow>
            <GoldLine />
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              {u.title || "שלחו את החוזה לבדיקה"}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-[56ch]">
              {u.body || "מלאו את הפרטים ועלו את החוזה. נחזור אליכם בהקדם עם חוות דעת מקצועית."}
            </p>

            <ul className="space-y-4" aria-label="פרטי שירות">
              {trustItems.map(({ Icon, text }, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 text-accent grid place-items-center" aria-hidden>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-muted-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Form */}
          <Reveal dir="left">
            <form onSubmit={submit} className="card-luxury p-7 md:p-9 space-y-5" noValidate>
              {/* Honeypot */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-sm font-semibold">
                  {u.label_name || "שם מלא"} <span aria-hidden className="text-accent">*</span>
                </Label>
                <Input
                  id="full_name" name="full_name" required maxLength={120}
                  autoComplete="name"
                  className="h-11 rounded-xl"
                  aria-required="true"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-semibold">
                    {u.label_phone || "טלפון"} <span aria-hidden className="text-accent">*</span>
                  </Label>
                  <Input
                    id="phone" name="phone" required dir="ltr" maxLength={40}
                    type="tel" autoComplete="tel"
                    className="h-11 rounded-xl"
                    aria-required="true"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    {u.label_email || "אימייל"} <span aria-hidden className="text-accent">*</span>
                  </Label>
                  <Input
                    id="email" name="email" type="email" required dir="ltr" maxLength={200}
                    autoComplete="email"
                    className="h-11 rounded-xl"
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm font-semibold">
                  {u.label_notes || "הערות"}
                </Label>
                <Textarea
                  id="notes" name="notes" maxLength={2000} rows={3}
                  className="rounded-xl resize-none"
                />
              </div>

              {/* Drag-and-drop file zone */}
              <div className="space-y-1.5">
                <Label htmlFor="file" className="text-sm font-semibold">
                  {u.label_file || "קובץ החוזה"} <span aria-hidden className="text-accent">*</span>
                </Label>
                <label
                  htmlFor="file"
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); }}
                  className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-7 px-4 cursor-pointer transition-all duration-200 ${
                    dragOver
                      ? "border-accent bg-accent-soft"
                      : "border-border hover:border-accent/50 hover:bg-muted/50"
                  }`}
                >
                  <Upload className={`w-5 h-5 transition-colors ${dragOver ? "text-accent" : "text-muted-foreground"}`} aria-hidden />
                  <span className="text-sm font-medium text-muted-foreground">
                    גרור קובץ לכאן או{" "}
                    <span className="text-accent">לחץ לבחירה</span>
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {u.allowed_types || "PDF, DOC, DOCX, JPG, PNG"} · עד 15MB
                  </span>
                  <input
                    id="file" name="file" type="file" required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="sr-only"
                    aria-required="true"
                    aria-label={u.label_file || "קובץ החוזה"}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || done}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={done
                  ? { background: "oklch(56% 0.15 145)", color: "white" }
                  : { background: "var(--gradient-gold)", color: "oklch(99% 0.003 80)", boxShadow: done ? "none" : undefined }
                }
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
                    שולח...
                  </>
                ) : done ? (
                  <><Check className="w-5 h-5" aria-hidden /> נשלח בהצלחה!</>
                ) : (
                  <><Upload className="w-4 h-4" aria-hidden /> {u.submit || "שליחת חוזה לבדיקה"}</>
                )}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   VIDEOS
═══════════════════════════════════════════════ */
function Videos({ c, videos }: { c: SiteContent; videos: Video[] }) {
  const t = c.videos_section ?? {};

  return (
    <section id="videos" className="section" style={{ background: "oklch(93% 0.007 80 / 0.35)" }}>
      <div className="container-narrow">
        <Reveal className="mb-12">
          <Eyebrow>תוכן מקצועי</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold mt-4">{t.title}</h2>
          {t.body && <p className="text-muted-foreground mt-3 max-w-[58ch]">{t.body}</p>}
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {videos.map((v, i) => (
            <Reveal key={v.id} dir="scale" delay={i * 90}>
              <a
                href={v.url} target="_blank" rel="noopener noreferrer"
                className="card-luxury overflow-hidden group block"
                aria-label={`צפה בסרטון: ${v.title}`}
              >
                <div className="relative overflow-hidden aspect-video bg-secondary">
                  {v.thumbnail_url ? (
                    <img
                      src={v.thumbnail_url} alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : null}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/38 transition-colors duration-300 grid place-items-center">
                    <span className="w-12 h-12 bg-white/90 rounded-full grid place-items-center shadow-lg transition-transform duration-300 group-hover:scale-110" aria-hidden>
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary fill-current ms-0.5"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold">{v.title}</h3>
                  {v.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{v.description}</p>}
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FAQs
═══════════════════════════════════════════════ */
function Faqs({ c, faqs }: { c: SiteContent; faqs: Faq[] }) {
  const t = c.faq_section ?? {};

  return (
    <section id="faq" className="section">
      <div className="container-narrow max-w-3xl">
        <Reveal className="text-center mb-12">
          <Eyebrow className="justify-center">שאלות נפוצות</Eyebrow>
          <h2 className="text-3xl md:text-4xl font-bold mt-4">{t.title || "שאלות נפוצות"}</h2>
        </Reveal>

        <Reveal>
          <Accordion type="single" collapsible className="space-y-2.5">
            {faqs.map((f) => (
              <AccordionItem
                key={f.id} value={f.id}
                className="card-elev px-6 py-0.5 rounded-xl border border-border/60 data-[state=open]:border-accent/30 transition-all duration-300"
              >
                <AccordionTrigger className="text-right text-base font-semibold hover:no-underline py-4 hover:text-accent transition-colors [&>svg]:text-accent">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line pb-4 max-w-[72ch]">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FINAL CTA
═══════════════════════════════════════════════ */
function FinalCta({ c }: { c: SiteContent }) {
  const t = c.final_cta ?? {};

  return (
    <section className="section" style={{ background: "oklch(93% 0.007 80 / 0.35)" }}>
      <div className="container-narrow">
        <Reveal dir="scale">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} aria-hidden />
            <img
              src={CTA_IMAGE}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover opacity-18"
              loading="lazy"
              width={1400}
              height={933}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(12% 0.040 263 / 0.80) 0%, oklch(12% 0.040 263 / 0.35) 100%)" }} aria-hidden />

            <div className="relative z-10 text-center px-8 py-16 md:py-20">
              <div
                className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-6"
                style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold)" }}
                aria-hidden
              >
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                {t.title || "מוכנים להגן על עצמכם?"}
              </h2>
              <p className="mt-4 max-w-[54ch] mx-auto text-base md:text-lg leading-relaxed" style={{ color: "oklch(97% 0.005 75 / 0.68)" }}>
                {t.body || "אל תחתמו על חוזה בלי בדיקה מקצועית. פנו אלינו עוד היום."}
              </p>

              <a
                href="#upload"
                className="inline-flex items-center gap-2 mt-8 font-bold px-8 py-4 rounded-xl text-base transition-all duration-300 hover:-translate-y-0.5 animate-pulse-gold"
                style={{ background: "var(--gradient-gold)", color: "oklch(99% 0.003 80)" }}
              >
                <Upload className="w-5 h-5" aria-hidden />
                {t.button || "העלאת חוזה לבדיקה"}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   CONTACT
═══════════════════════════════════════════════ */
function Contact({ c }: { c: SiteContent }) {
  const t = c.contact ?? {};
  const items = [
    t.show_phone    && { Icon: Phone,         label: "טלפון",    value: t.phone,          href: `tel:${t.phone}` },
    t.show_email    && { Icon: Mail,          label: "אימייל",   value: t.email,          href: `mailto:${t.email}` },
    t.show_address  && { Icon: MapPin,        label: "כתובת",    value: t.address,        href: "#" },
    t.show_whatsapp && { Icon: MessageCircle, label: "WhatsApp", value: t.whatsapp_label, href: `https://wa.me/${t.whatsapp}` },
  ].filter(Boolean) as { Icon: any; label: string; value: string; href: string }[];

  return (
    <section id="contact" className="section">
      <div className="container-narrow">
        <Reveal className="max-w-2xl mb-12">
          <Eyebrow>יצירת קשר</Eyebrow>
          <GoldLine />
          <h2 className="text-3xl md:text-4xl font-bold mt-2">{t.title}</h2>
          {t.body && <p className="text-muted-foreground mt-4 max-w-[58ch]">{t.body}</p>}
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it, i) => (
            <Reveal key={i} dir="scale" delay={i * 70}>
              <a
                href={it.href}
                target={it.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="card-luxury p-5 flex items-start gap-4 group hover:border-accent/30"
                aria-label={`${it.label}: ${it.value}`}
              >
                <span
                  className="shrink-0 w-10 h-10 rounded-xl bg-accent/10 text-accent grid place-items-center transition-all duration-300 group-hover:text-white"
                  aria-hidden
                  style={{ transition: "background 0.3s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--gradient-gold)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <it.Icon className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{it.label}</p>
                  <p className="font-semibold mt-0.5 text-sm break-all" dir="ltr">{it.value}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════ */
function Footer({ c }: { c: SiteContent }) {
  const f = c.footer ?? {};

  return (
    <footer style={{ background: "oklch(12% 0.040 263)", color: "oklch(97.4% 0.006 78)" }}>
      {/* Gold accent line */}
      <div className="h-px" style={{ background: "var(--gradient-gold)" }} aria-hidden />

      <div className="container-narrow py-14 grid md:grid-cols-3 gap-10 text-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: "oklch(100% 0 0 / 0.10)" }}>
              <Scale className="w-4 h-4 text-accent" aria-hidden />
            </div>
            <span className="font-bold text-base text-white">{f.name}</span>
          </div>
          <p style={{ color: "oklch(97% 0.005 75 / 0.62)" }} className="leading-relaxed max-w-[42ch]">
            {f.statement}
          </p>
        </div>

        <address className="not-italic space-y-2.5" style={{ color: "oklch(97% 0.005 75 / 0.72)" }}>
          <p className="font-semibold text-white mb-3 not-italic">פרטי קשר</p>
          {f.phone   && <p className="flex items-center gap-2"><Phone   className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden /><span dir="ltr">{f.phone}</span></p>}
          {f.email   && <p className="flex items-center gap-2"><Mail    className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden /><span dir="ltr">{f.email}</span></p>}
          {f.address && <p className="flex items-center gap-2"><MapPin  className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden />{f.address}</p>}
        </address>

        <nav aria-label="ניווט footer" className="space-y-2.5">
          <p className="font-semibold text-white mb-3">ניווט מהיר</p>
          <div className="space-y-2" style={{ color: "oklch(97% 0.005 75 / 0.65)" }}>
            {f.privacy_url && <a href={f.privacy_url} className="block hover:text-accent transition-colors">מדיניות פרטיות</a>}
            {f.terms_url   && <a href={f.terms_url}   className="block hover:text-accent transition-colors">תנאי שימוש</a>}
            <a href="/admin" className="block hover:text-accent transition-colors" style={{ opacity: 0.4 }}>כניסת ניהול</a>
          </div>
        </nav>
      </div>

      <div className="py-5 text-center text-xs" style={{ borderTop: "1px solid oklch(100% 0 0 / 0.08)", color: "oklch(97% 0.005 75 / 0.42)" }}>
        © {new Date().getFullYear()} {f.name || "ליאור — בדיקת חוזה קבלן"}. כל הזכויות שמורות.
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════
   FLOATING CTA
═══════════════════════════════════════════════ */
function FloatingCta({ c }: { c: SiteContent }) {
  const f = c.floating_cta ?? {};
  const scrolled = useScrolled(400);
  if (!f.enabled) return null;

  return (
    <>
      {/* Desktop: vertical pill on the right edge */}
      <a
        href={f.target || "#upload"}
        aria-label={f.label || "בדיקת חוזה"}
        className={`hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 items-center gap-2 font-bold px-4 py-4 rounded-l-2xl transition-all duration-500 ${
          scrolled ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{
          background: "var(--gradient-gold)",
          color: "oklch(99% 0.003 80)",
          boxShadow: "var(--shadow-gold)",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
        }}
      >
        {f.label || "בדיקת חוזה"}
      </a>

      {/* Mobile: bottom bar with native safe-area support */}
      <div
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 transition-all duration-500 ${
          scrolled ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="p-3 bg-background/85 backdrop-blur border-t border-border">
          <a
            href={f.target || "#upload"}
            className="flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl w-full"
            style={{ background: "var(--gradient-gold)", color: "oklch(99% 0.003 80)", boxShadow: "var(--shadow-gold)" }}
          >
            <Upload className="w-4 h-4" aria-hidden />
            {f.label || "בדיקת חוזה"}
          </a>
        </div>
      </div>
    </>
  );
}
