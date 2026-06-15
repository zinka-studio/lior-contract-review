import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin", { replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("נרשמת בהצלחה. אם אישור אימייל מופעל, בדוק את תיבת הדואר.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/admin");
      }
    } catch (err: any) {
      toast.error(err.message || "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <form onSubmit={submit} className="card-elev p-8 w-full max-w-md space-y-5">
        <div className="text-center">
          <div className="text-accent eyebrow">פאנל ניהול</div>
          <h1 className="text-2xl font-bold mt-2">{mode === "signin" ? "התחברות" : "הרשמה"}</h1>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">אימייל</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">סיסמה</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "טוען..." : mode === "signin" ? "התחבר" : "הרשם"}
        </Button>
        <button type="button" className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "אין לך חשבון? הרשמה" : "כבר רשום? התחברות"}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          לאחר הרשמת המשתמש הראשון יש להעניק לו הרשאת admin בלוח Cloud.
        </p>
      </form>
    </div>
  );
}
