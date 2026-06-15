import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchContent, saveContent } from "@/lib/cms";
import { LogOut, Plus, Trash2, Download, Save, ChevronUp, ChevronDown } from "lucide-react";

type Role = "loading" | "admin" | "no";

export default function Admin() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("loading");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const check = async (uid: string | null) => {
      if (!uid) { setRole("no"); return; }
      setUserId(uid);
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
      setRole(data ? "admin" : "no");
    };
    supabase.auth.getSession().then(({ data }) => check(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => check(session?.user.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (role === "loading") {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">טוען...</div>;
  }
  if (role === "no") {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="p-8 max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">גישה מוגבלת</h1>
          <p className="text-sm text-muted-foreground">
            יש להתחבר עם משתמש בעל הרשאת admin. אם זה השימוש הראשון, הירשם תחילה ב-/auth ולאחר מכן הוסף שורה לטבלת user_roles עם role=admin עבור המשתמש שלך (Cloud → Tables → user_roles).
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => navigate("/auth")}>התחברות</Button>
            <Button variant="outline" onClick={() => navigate("/")}>חזרה לאתר</Button>
            {userId && (
              <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); navigate("/auth"); }}>התנתק</Button>
            )}
          </div>
          {userId && (
            <p className="text-xs text-muted-foreground break-all">User ID: <span dir="ltr">{userId}</span></p>
          )}
        </Card>
      </div>
    );
  }
  return <AdminPanel />;
}

function AdminPanel() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container max-w-7xl flex items-center justify-between py-3">
          <h1 className="font-bold">פאנל ניהול - LIOR LEGAL</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")}>צפה באתר</Button>
            <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate("/auth"); }}>
              <LogOut className="w-4 h-4 ml-1" /> התנתק
            </Button>
          </div>
        </div>
      </header>
      <main className="container max-w-7xl py-6">
        <Tabs defaultValue="leads" dir="rtl">
          <TabsList className="flex-wrap h-auto justify-start">
            <TabsTrigger value="leads">פניות</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="floating">CTA צף</TabsTrigger>
            <TabsTrigger value="service">שירות</TabsTrigger>
            <TabsTrigger value="plans">מסלולים</TabsTrigger>
            <TabsTrigger value="process">תהליך</TabsTrigger>
            <TabsTrigger value="upload">טופס</TabsTrigger>
            <TabsTrigger value="videos">תוכן/סרטונים</TabsTrigger>
            <TabsTrigger value="faqs">שאלות</TabsTrigger>
            <TabsTrigger value="final">CTA סופי</TabsTrigger>
            <TabsTrigger value="contact">קשר</TabsTrigger>
            <TabsTrigger value="footer">פוטר</TabsTrigger>
            <TabsTrigger value="header">הדר</TabsTrigger>
          </TabsList>

          <TabsContent value="leads"><LeadsTab /></TabsContent>
          <TabsContent value="hero"><ContentEditor sectionKey="hero" fields={[
            ["eyebrow","תווית עליונה"],["headline","כותרת ראשית","textarea"],["body","גוף","textarea"],
            ["cta_primary","CTA ראשי"],["cta_secondary","CTA משני"],["cta_whatsapp","CTA WhatsApp"],
            ["note","הערה קטנה"],["image_alt","Alt לתמונה"],
          ]} /></TabsContent>
          <TabsContent value="floating"><ContentEditor sectionKey="floating_cta" fields={[
            ["enabled","פעיל","boolean"],["label","תווית"],["target","יעד (#upload או URL)"]
          ]} /></TabsContent>
          <TabsContent value="service"><ContentEditor sectionKey="service" fields={[
            ["title","כותרת"],["intro","תיאור","textarea"],["benefits","יתרונות (אחד בכל שורה)","stringlist"],
          ]} /></TabsContent>
          <TabsContent value="plans"><PlansTab /></TabsContent>
          <TabsContent value="process"><ProcessTab /></TabsContent>
          <TabsContent value="upload"><ContentEditor sectionKey="upload_section" fields={[
            ["title","כותרת"],["body","תיאור","textarea"],
            ["label_name","תווית שם"],["label_phone","תווית טלפון"],["label_email","תווית אימייל"],
            ["label_notes","תווית הערות"],["label_file","תווית קובץ"],
            ["submit","כפתור שליחה"],["success","הודעת הצלחה"],["error","הודעת שגיאה"],
            ["allowed_types","סוגי קבצים מותרים"],["admin_email","אימייל להתראות אדמין"],
          ]} /></TabsContent>
          <TabsContent value="videos"><VideosTab sectionKey="videos_section" /></TabsContent>
          <TabsContent value="faqs"><FaqsTab /></TabsContent>
          <TabsContent value="final"><ContentEditor sectionKey="final_cta" fields={[
            ["title","כותרת"],["body","תיאור","textarea"],["button","כפתור"],
          ]} /></TabsContent>
          <TabsContent value="contact"><ContentEditor sectionKey="contact" fields={[
            ["title","כותרת"],["body","תיאור","textarea"],
            ["phone","טלפון"],["email","אימייל"],["address","כתובת"],
            ["whatsapp","WhatsApp (פורמט בינלאומי, ללא +)"],["whatsapp_label","תווית WhatsApp"],
            ["show_phone","הצג טלפון","boolean"],["show_email","הצג אימייל","boolean"],
            ["show_address","הצג כתובת","boolean"],["show_whatsapp","הצג WhatsApp","boolean"],
          ]} /></TabsContent>
          <TabsContent value="footer"><ContentEditor sectionKey="footer" fields={[
            ["name","שם"],["statement","הצהרה","textarea"],
            ["phone","טלפון"],["email","אימייל"],["address","כתובת"],
            ["privacy_url","קישור מדיניות פרטיות"],["terms_url","קישור תנאי שימוש"],
          ]} /></TabsContent>
          <TabsContent value="header"><ContentEditor sectionKey="header" fields={[
            ["logo","שם המשרד"],["subtitle","כותרת משנה"],["cta_label","תווית כפתור CTA"],
          ]} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ---------- Generic content editor ---------- */
type FieldDef = [string, string] | [string, string, "textarea" | "boolean" | "stringlist"];

function ContentEditor({ sectionKey, fields }: { sectionKey: string; fields: FieldDef[] }) {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { fetchContent().then((c) => setData(c[sectionKey] ?? {})); }, [sectionKey]);
  if (!data) return <div className="p-6 text-muted-foreground">טוען...</div>;
  const onSave = async () => {
    setSaving(true);
    try { await saveContent(sectionKey, data); toast.success("נשמר"); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };
  return (
    <Card className="p-6 space-y-5 mt-4">
      {fields.map(([key, label, type]) => {
        const v = data[key];
        if (type === "boolean") {
          return (
            <div key={key} className="flex items-center justify-between">
              <Label>{label}</Label>
              <Switch checked={!!v} onCheckedChange={(c) => setData({ ...data, [key]: c })} />
            </div>
          );
        }
        if (type === "stringlist") {
          return (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Textarea rows={5} value={Array.isArray(v) ? v.join("\n") : ""}
                onChange={(e) => setData({ ...data, [key]: e.target.value.split("\n").filter(Boolean) })} />
            </div>
          );
        }
        if (type === "textarea") {
          return (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Textarea rows={3} value={v ?? ""} onChange={(e) => setData({ ...data, [key]: e.target.value })} />
            </div>
          );
        }
        return (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            <Input value={v ?? ""} onChange={(e) => setData({ ...data, [key]: e.target.value })} />
          </div>
        );
      })}
      <Button onClick={onSave} disabled={saving}><Save className="w-4 h-4 ml-1" />{saving ? "שומר..." : "שמירה"}</Button>
    </Card>
  );
}

/* ---------- Plans tab ---------- */
function PlansTab() {
  return <CrudTab table="plans" title="מסלולים"
    columns={[
      ["title", "כותרת", "text"],
      ["description", "תיאור", "textarea"],
      ["price", "מחיר (אופציונלי)", "text"],
      ["recommended", "מומלץ", "boolean"],
      ["cta_label", "תווית כפתור", "text"],
      ["cta_url", "URL כפתור", "text"],
      ["enabled", "פעיל", "boolean"],
    ]}
    newRow={{ title: "מסלול חדש", description: "", recommended: false, enabled: true }} />;
}

function ProcessTab() {
  return <CrudTab table="process_steps" title="שלבי תהליך"
    columns={[
      ["title", "כותרת", "text"],
      ["description", "תיאור", "textarea"],
      ["enabled", "פעיל", "boolean"],
    ]}
    newRow={{ title: "שלב חדש", description: "", enabled: true }} />;
}

function FaqsTab() {
  return <CrudTab table="faqs" title="שאלות נפוצות"
    columns={[
      ["question", "שאלה", "text"],
      ["answer", "תשובה", "textarea"],
      ["enabled", "פעיל", "boolean"],
    ]}
    newRow={{ question: "שאלה חדשה", answer: "", enabled: true }} />;
}

function VideosTab({ sectionKey }: { sectionKey: string }) {
  return (
    <div className="space-y-6 mt-4">
      <ContentEditor sectionKey={sectionKey} fields={[["title","כותרת"],["body","תיאור","textarea"]]} />
      <CrudTab table="videos" title="כרטיסי תוכן"
        columns={[
          ["title", "כותרת", "text"],
          ["description", "תיאור", "textarea"],
          ["url", "URL", "text"],
          ["thumbnail_url", "תמונה ממוזערת (URL)", "text"],
          ["enabled", "פעיל", "boolean"],
        ]}
        newRow={{ title: "סרטון חדש", description: "", url: "", enabled: true }} />
    </div>
  );
}

type Col = [string, string, "text" | "textarea" | "boolean"];
function CrudTab({ table, title, columns, newRow }: { table: string; title: string; columns: Col[]; newRow: any; }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from(table as any).select("*").order("sort_order");
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [table]);

  const update = (idx: number, patch: any) => {
    const next = [...rows]; next[idx] = { ...next[idx], ...patch }; setRows(next);
  };
  const save = async (row: any) => {
    const { id, ...rest } = row;
    const { error } = await supabase.from(table as any).update(rest).eq("id", id);
    if (error) toast.error(error.message); else toast.success("נשמר");
  };
  const del = async (id: string) => {
    if (!confirm("למחוק?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("נמחק"); load(); }
  };
  const add = async () => {
    const sort_order = (rows[rows.length - 1]?.sort_order ?? 0) + 1;
    const { error } = await supabase.from(table as any).insert({ ...newRow, sort_order });
    if (error) toast.error(error.message); else load();
  };
  const move = async (idx: number, dir: -1 | 1) => {
    const a = rows[idx], b = rows[idx + dir];
    if (!a || !b) return;
    await supabase.from(table as any).update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from(table as any).update({ sort_order: a.sort_order }).eq("id", b.id);
    load();
  };

  if (loading) return <div className="p-6 text-muted-foreground">טוען...</div>;
  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <Button onClick={add}><Plus className="w-4 h-4 ml-1" /> חדש</Button>
      </div>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <Card key={row.id} className="p-5 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              {columns.map(([key, label, type]) => (
                <div key={key} className={type === "textarea" ? "md:col-span-2 space-y-1.5" : "space-y-1.5"}>
                  <Label className="text-xs">{label}</Label>
                  {type === "boolean" ? (
                    <div><Switch checked={!!row[key]} onCheckedChange={(c) => update(i, { [key]: c })} /></div>
                  ) : type === "textarea" ? (
                    <Textarea rows={3} value={row[key] ?? ""} onChange={(e) => update(i, { [key]: e.target.value })} />
                  ) : (
                    <Input value={row[key] ?? ""} onChange={(e) => update(i, { [key]: e.target.value })} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button size="sm" onClick={() => save(row)}><Save className="w-4 h-4 ml-1" /> שמירה</Button>
              <Button size="sm" variant="outline" onClick={() => move(i, -1)} disabled={i === 0}><ChevronUp className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => move(i, 1)} disabled={i === rows.length - 1}><ChevronDown className="w-4 h-4" /></Button>
              <Button size="sm" variant="destructive" onClick={() => del(row.id)} className="mr-auto"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------- Leads tab ---------- */
const STATUSES = [
  { v: "new", l: "חדש" },
  { v: "reviewing", l: "בבדיקה" },
  { v: "quoted", l: "נשלחה הצעת מחיר" },
  { v: "won", l: "נסגר כלקוח" },
  { v: "irrelevant", l: "לא רלוונטי" },
];
function statusLabel(v: string) { return STATUSES.find(s => s.v === v)?.l ?? v; }

function LeadsTab() {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [l.full_name, l.phone, l.email].some((x) => (x ?? "").toLowerCase().includes(q));
  });

  const exportCsv = () => {
    const headers = ["שם", "טלפון", "אימייל", "סטטוס", "הערות", "תאריך"];
    const rows = filtered.map((l) => [l.full_name, l.phone, l.email, statusLabel(l.status), (l.notes ?? "").replace(/\n/g, " "), new Date(l.created_at).toLocaleString("he-IL")]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `leads-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFile = async (l: any) => {
    if (!l.file_path) return;
    const { data, error } = await supabase.storage.from("contracts").createSignedUrl(l.file_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input className="max-w-xs" placeholder="חיפוש לפי שם / טלפון / אימייל" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCsv}><Download className="w-4 h-4 ml-1" /> CSV</Button>
        <span className="text-sm text-muted-foreground mr-auto">{filtered.length} תוצאות</span>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="text-right">
              <th className="p-3">שם</th><th className="p-3">טלפון</th><th className="p-3">אימייל</th>
              <th className="p-3">סטטוס</th><th className="p-3">תאריך</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(l)}>
                <td className="p-3 font-medium">{l.full_name}</td>
                <td className="p-3" dir="ltr">{l.phone}</td>
                <td className="p-3" dir="ltr">{l.email}</td>
                <td className="p-3"><Badge variant="secondary">{statusLabel(l.status)}</Badge></td>
                <td className="p-3 text-muted-foreground">{new Date(l.created_at).toLocaleDateString("he-IL")}</td>
                <td className="p-3">פתח</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td className="p-8 text-center text-muted-foreground" colSpan={6}>אין פניות</td></tr>}
          </tbody>
        </table>
      </Card>

      {selected && (
        <LeadDetail lead={selected} onClose={() => setSelected(null)} onChange={() => { load(); }} onDownload={() => downloadFile(selected)} />
      )}
    </div>
  );
}

function LeadDetail({ lead, onClose, onChange, onDownload }: any) {
  const [status, setStatus] = useState(lead.status);
  const [internal, setInternal] = useState(lead.internal_notes ?? "");
  const save = async () => {
    const { error } = await supabase.from("leads").update({ status, internal_notes: internal }).eq("id", lead.id);
    if (error) toast.error(error.message);
    else { toast.success("נשמר"); onChange(); }
  };
  const del = async () => {
    if (!confirm("למחוק את הפנייה?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", lead.id);
    if (error) toast.error(error.message); else { toast.success("נמחק"); onChange(); onClose(); }
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={onClose}>
      <Card className="max-w-2xl w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{lead.full_name}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>סגור</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">טלפון: </span><span dir="ltr">{lead.phone}</span></div>
          <div><span className="text-muted-foreground">אימייל: </span><span dir="ltr">{lead.email}</span></div>
          <div className="sm:col-span-2"><span className="text-muted-foreground">נשלח: </span>{new Date(lead.created_at).toLocaleString("he-IL")}</div>
          {lead.notes && <div className="sm:col-span-2"><span className="text-muted-foreground">הערות הלקוח: </span>{lead.notes}</div>}
        </div>
        {lead.file_name && (
          <Button variant="outline" onClick={onDownload}>
            <Download className="w-4 h-4 ml-1" /> הורד: {lead.file_name}
          </Button>
        )}
        <div className="space-y-2">
          <Label>סטטוס</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>הערות פנימיות</Label>
          <Textarea rows={4} value={internal} onChange={(e) => setInternal(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button onClick={save}><Save className="w-4 h-4 ml-1" /> שמירה</Button>
          <Button variant="destructive" onClick={del} className="mr-auto"><Trash2 className="w-4 h-4 ml-1" /> מחק</Button>
        </div>
      </Card>
    </div>
  );
}
