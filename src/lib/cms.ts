import { supabase } from "@/integrations/supabase/client";

export type SiteContent = Record<string, any>;

export async function fetchContent(): Promise<SiteContent> {
  const { data } = await supabase.from("site_content").select("key,data");
  const out: SiteContent = {};
  (data ?? []).forEach((row: any) => { out[row.key] = row.data; });
  return out;
}

export async function saveContent(key: string, data: any) {
  const { error } = await supabase.from("site_content").upsert({ key, data, updated_at: new Date().toISOString() });
  if (error) throw error;
}
