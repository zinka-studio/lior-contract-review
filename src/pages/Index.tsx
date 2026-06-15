import { useEffect, useState } from "react";
import { fetchContent, type SiteContent } from "@/lib/cms";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import heroImg from "@/assets/hero.jpg";
import {
  Menu, X, ShieldCheck, FileText, Scale, Phone, Mail, MapPin, MessageCircle, Check, Upload, Star,
} from "lucide-react";

type Plan = { id: string; title: string; description: string; price?: string|null; recommended: boolean; cta_label?: string|null; cta_url?: string|null; sort_order: number; enabled: boolean; };
type Step = { id: string; title: string; description: string; sort_order: number; enabled: boolean; };
type Faq = { id: string; question: string; answer: string; sort_order: number; enabled: boolean; };
type Video = { id: string; title: string; description: string; url: string; thumbnail_url?: string|null; sort_order: number; enabled: boolean; };

export default function Index() {
  const [c, setC] = useState<SiteContent>({});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
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
      setFaqs((f.data as any) ?? []);
      setVideos((v.data as any) ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header c={c} />
      <main>
        <Hero c={c} />
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

/* ---------- Header ---------- */
function Header({ c }: { c: SiteContent }) {
  const h = c.header ?? {};
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#service", label: "השירות" },
    { href: "#process", label: "התהליך" },
    { href: "#contact", label: "יצירת קשר" },
    { href: "#faq", label: "שאלות נפוצות" },
    { href: "#upload", label: "העלאת חוזה" },
  ];
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-border">
      <div className="container-narrow flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2 group">
          <span className="w-9 h-9 rounded-md bg-gradient-cta grid place-items-center text-primary-foreground">
            <Scale className="w-5 h-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-bold text-base">{h.logo || "ליאור - בדיקת חוזה קבלן"}</span>
            <span className="hidden md:block text-[11px] text-muted-foreground">{h.subtitle}</span>
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm">
          {links.slice(0, -1).map((l) => (
            <a key={l.href} href={l.href} className="text-foreground/80 hover:text-primary transition-colors">{l.label}</a>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button asChild><a href="#upload">{h.cta_label || "העלאת חוזה"}</a></Button>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="תפריט">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container-narrow py-4 flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2 text-foreground/80">{l.label}</a>
            ))}
            <Button asChild className="mt-2"><a href="#upload" onClick={() => setOpen(false)}>{h.cta_label || "העלאת חוזה"}</a></Button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero({ c }: { c: SiteContent }) {
  const h = c.hero ?? {};
  const contact = c.contact ?? {};
  const wa = contact.whatsapp ? `https://wa.me/${contact.whatsapp}` : "#";
  return (
    <section className="bg-gradient-hero">
      <div className="container-narrow grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 md:py-24">
        <div className="space-y-6">
          <span className="eyebrow">{h.eyebrow}</span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
            {h.headline}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
            {h.body}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild><a href="#upload"><Upload className="w-4 h-4 ml-2" />{h.cta_primary}</a></Button>
            <Button size="lg" variant="outline" asChild><a href="#videos">{h.cta_secondary}</a></Button>
            <Button size="lg" variant="ghost" asChild><a href={wa} target="_blank" rel="noopener"><MessageCircle className="w-4 h-4 ml-2" />{h.cta_whatsapp}</a></Button>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            {h.note}
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-accent/10 rounded-2xl blur-2xl" />
          <img
            src={heroImg}
            alt={h.image_alt || "עורך דין בודק חוזה"}
            className="relative rounded-xl shadow-elev w-full object-cover aspect-[4/5] md:aspect-[5/6]"
            width={1024} height={1280}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- Service ---------- */
function Service({ c }: { c: SiteContent }) {
  const s = c.service ?? {};
  const benefits: string[] = s.benefits ?? [];
  return (
    <section id="service" className="section">
      <div className="container-narrow grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-4">
          <span className="eyebrow">השירות</span>
          <h2 className="text-3xl md:text-4xl font-bold">{s.title}</h2>
          <p className="text-muted-foreground leading-relaxed">{s.intro}</p>
        </div>
        <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
          {benefits.map((b, i) => (
            <div key={i} className="card-elev p-5 flex gap-3">
              <span className="shrink-0 w-9 h-9 rounded-md bg-accent-soft text-accent grid place-items-center">
                <Check className="w-5 h-5" />
              </span>
              <p className="leading-relaxed text-sm">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Plans ---------- */
function Plans({ c, plans }: { c: SiteContent; plans: Plan[] }) {
  const t = c.plans_section ?? {};
  return (
    <section id="plans" className="section bg-secondary/40">
      <div className="container-narrow">
        <div className="text-center mb-12">
          <span className="eyebrow">מסלולים</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">{t.title || "שלושה מסלולי שירות"}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className={`relative card-elev p-7 flex flex-col ${p.recommended ? "ring-2 ring-accent shadow-elev" : ""}`}>
              {p.recommended && (
                <span className="absolute -top-3 right-6 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> מומלץ
                </span>
              )}
              <h3 className="text-xl font-bold">{p.title}</h3>
              {p.price && <div className="mt-2 text-2xl font-bold text-primary">{p.price}</div>}
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed flex-1">{p.description}</p>
              <Button asChild className="mt-6" variant={p.recommended ? "default" : "outline"}>
                <a href={p.cta_url || "#upload"}>{p.cta_label || "העלאת חוזה לבדיקה"}</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Process ---------- */
function Process({ c, steps }: { c: SiteContent; steps: Step[] }) {
  const t = c.process_section ?? {};
  return (
    <section id="process" className="section">
      <div className="container-narrow">
        <div className="text-center mb-12">
          <span className="eyebrow">התהליך</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">{t.title || "איך התהליך עובד"}</h2>
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <li key={s.id} className="card-elev p-6 relative">
              <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold grid place-items-center text-sm">
                {i + 1}
              </span>
              <h3 className="font-bold mt-4">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Upload form ---------- */
function UploadForm({ c }: { c: SiteContent }) {
  const u = c.upload_section ?? {};
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

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

  return (
    <section id="upload" className="section bg-secondary/40">
      <div className="container-narrow grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-4">
          <span className="eyebrow">העלאת חוזה</span>
          <h2 className="text-3xl md:text-4xl font-bold">{u.title}</h2>
          <p className="text-muted-foreground leading-relaxed">{u.body}</p>
          <ul className="text-sm text-muted-foreground space-y-2 mt-6">
            <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-accent" /> שמירה מאובטחת של המסמכים</li>
            <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /> סוגי קבצים: {u.allowed_types}</li>
            <li className="flex items-center gap-2"><Scale className="w-4 h-4 text-accent" /> השירות בתשלום, ניתן על ידי עורך דין</li>
          </ul>
        </div>
        <form onSubmit={submit} className="card-elev p-6 md:p-8 space-y-4">
          {/* honeypot */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <div className="space-y-2">
            <Label htmlFor="full_name">{u.label_name} *</Label>
            <Input id="full_name" name="full_name" required maxLength={120} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{u.label_phone} *</Label>
              <Input id="phone" name="phone" required dir="ltr" maxLength={40} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{u.label_email} *</Label>
              <Input id="email" name="email" type="email" required dir="ltr" maxLength={200} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{u.label_notes}</Label>
            <Textarea id="notes" name="notes" maxLength={2000} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">{u.label_file} *</Label>
            <Input id="file" name="file" type="file" required accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
            <p className="text-xs text-muted-foreground">{u.allowed_types} · עד 15MB</p>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading || done}>
            {loading ? "שולח..." : done ? "נשלח ✓" : (u.submit || "שליחת חוזה לבדיקה")}
          </Button>
        </form>
      </div>
    </section>
  );
}

/* ---------- Videos ---------- */
function Videos({ c, videos }: { c: SiteContent; videos: Video[] }) {
  const t = c.videos_section ?? {};
  return (
    <section id="videos" className="section">
      <div className="container-narrow">
        <div className="max-w-2xl mb-10">
          <span className="eyebrow">תוכן מקצועי</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">{t.title}</h2>
          <p className="text-muted-foreground mt-3">{t.body}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {videos.map((v) => (
            <a key={v.id} href={v.url} target="_blank" rel="noopener" className="card-elev overflow-hidden group">
              {v.thumbnail_url ? (
                <img src={v.thumbnail_url} alt={v.title} className="w-full aspect-video object-cover group-hover:opacity-90" loading="lazy" />
              ) : <div className="w-full aspect-video bg-secondary" />}
              <div className="p-5">
                <h3 className="font-bold">{v.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{v.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQs ---------- */
function Faqs({ c, faqs }: { c: SiteContent; faqs: Faq[] }) {
  const t = c.faq_section ?? {};
  return (
    <section id="faq" className="section bg-secondary/40">
      <div className="container-narrow max-w-3xl">
        <div className="text-center mb-10">
          <span className="eyebrow">שאלות נפוצות</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">{t.title || "שאלות נפוצות"}</h2>
        </div>
        <Accordion type="single" collapsible className="bg-card rounded-lg border border-border divide-y">
          {faqs.map((f) => (
            <AccordionItem key={f.id} value={f.id} className="px-5">
              <AccordionTrigger className="text-right text-base font-semibold hover:no-underline">{f.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
function FinalCta({ c }: { c: SiteContent }) {
  const t = c.final_cta ?? {};
  return (
    <section className="section">
      <div className="container-narrow">
        <div className="bg-gradient-cta rounded-2xl p-10 md:p-16 text-center text-primary-foreground shadow-elev">
          <h2 className="text-3xl md:text-4xl font-bold">{t.title}</h2>
          <p className="mt-4 max-w-xl mx-auto opacity-90">{t.body}</p>
          <Button size="lg" variant="secondary" asChild className="mt-8">
            <a href="#upload">{t.button}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Contact ---------- */
function Contact({ c }: { c: SiteContent }) {
  const t = c.contact ?? {};
  const items = [
    t.show_phone && { icon: Phone, label: "טלפון", value: t.phone, href: `tel:${t.phone}` },
    t.show_email && { icon: Mail, label: "אימייל", value: t.email, href: `mailto:${t.email}` },
    t.show_address && { icon: MapPin, label: "כתובת", value: t.address, href: "#" },
    t.show_whatsapp && { icon: MessageCircle, label: "WhatsApp", value: t.whatsapp_label, href: `https://wa.me/${t.whatsapp}` },
  ].filter(Boolean) as { icon: any; label: string; value: string; href: string }[];
  return (
    <section id="contact" className="section">
      <div className="container-narrow">
        <div className="max-w-2xl mb-10">
          <span className="eyebrow">יצירת קשר</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">{t.title}</h2>
          <p className="text-muted-foreground mt-3">{t.body}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it, i) => (
            <a key={i} href={it.href} className="card-elev p-5 hover:shadow-elev transition-shadow flex items-start gap-3" target={it.href.startsWith("http") ? "_blank" : undefined} rel="noopener">
              <span className="shrink-0 w-9 h-9 rounded-md bg-accent-soft text-accent grid place-items-center">
                <it.icon className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs text-muted-foreground">{it.label}</div>
                <div className="font-semibold mt-0.5 break-all" dir="ltr">{it.value}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer({ c }: { c: SiteContent }) {
  const f = c.footer ?? {};
  return (
    <footer className="bg-primary text-primary-foreground mt-10">
      <div className="container-narrow py-12 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="font-bold text-base">{f.name}</div>
          <p className="opacity-80 mt-2">{f.statement}</p>
        </div>
        <div className="space-y-1 opacity-90">
          {f.phone && <div>טלפון: <span dir="ltr">{f.phone}</span></div>}
          {f.email && <div>אימייל: <span dir="ltr">{f.email}</span></div>}
          {f.address && <div>כתובת: {f.address}</div>}
        </div>
        <div className="space-y-1 opacity-90">
          {f.privacy_url && <a href={f.privacy_url} className="block hover:underline">מדיניות פרטיות</a>}
          {f.terms_url && <a href={f.terms_url} className="block hover:underline">תנאי שימוש</a>}
          <a href="/admin" className="block hover:underline opacity-60">כניסת ניהול</a>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} {f.name}
      </div>
    </footer>
  );
}

/* ---------- Floating CTA ---------- */
function FloatingCta({ c }: { c: SiteContent }) {
  const f = c.floating_cta ?? {};
  if (!f.enabled) return null;
  return (
    <>
      <a href={f.target || "#upload"}
        className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-30 bg-accent text-accent-foreground font-bold px-5 py-3 rounded-l-lg shadow-elev hover:bg-accent/90 transition-all">
        {f.label || "בדיקת חוזה"}
      </a>
      <a href={f.target || "#upload"}
        className="md:hidden fixed bottom-4 inset-x-4 z-30 bg-accent text-accent-foreground font-bold py-3 rounded-lg shadow-elev text-center">
        {f.label || "בדיקת חוזה"}
      </a>
    </>
  );
}
