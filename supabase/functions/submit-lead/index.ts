import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_EXT = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
const ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const form = await req.formData();
    const full_name = String(form.get("full_name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const email = String(form.get("email") || "").trim();
    const notes = String(form.get("notes") || "").trim();
    const honeypot = String(form.get("website") || "").trim(); // spam trap
    const file = form.get("file") as File | null;

    if (honeypot) {
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!full_name || full_name.length > 120) return bad("שם לא תקין");
    if (!phone || phone.length > 40) return bad("טלפון לא תקין");
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return bad("אימייל לא תקין");
    if (notes.length > 2000) return bad("הערות ארוכות מדי");
    if (!file || !(file instanceof File) || file.size === 0) return bad("נא לצרף קובץ");
    if (file.size > MAX_BYTES) return bad("הקובץ גדול מ-15MB");
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return bad("סוג קובץ לא נתמך");
    if (file.type && !ALLOWED_MIME.includes(file.type)) return bad("סוג קובץ לא נתמך");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
    const filePath = `${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}-${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: upErr } = await supabase.storage.from("contracts").upload(filePath, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (upErr) {
      console.error("upload", upErr);
      return bad("שגיאה בהעלאת הקובץ", 500);
    }

    const { data: lead, error: insErr } = await supabase.from("leads").insert({
      full_name, phone, email, notes: notes || null,
      file_path: filePath, file_name: file.name,
    }).select("id").single();

    if (insErr) {
      console.error("insert", insErr);
      return bad("שגיאה בשמירת הפנייה", 500);
    }

    return new Response(JSON.stringify({ ok: true, id: lead.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return bad("שגיאה לא צפויה", 500);
  }
});

function bad(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
