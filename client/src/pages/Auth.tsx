import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

const currencies = ["USD", "EUR", "GBP", "NGN", "CAD", "AUD"] as const;

type Mode = "login" | "register";

export default function Auth({ adminMode = false }: { adminMode?: boolean }) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>(adminMode ? "login" : "register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState<(typeof currencies)[number]>("USD");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const register = trpc.auth.register.useMutation();
  const login = trpc.auth.login.useMutation();
  const adminCodeLogin = trpc.auth.adminCodeLogin.useMutation();
  const next = adminMode ? "/admin" : "/terminal";

  useEffect(() => { if (user) setLocation(next.startsWith("/") ? next : "/terminal"); }, [user, next, setLocation]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setNotice("");
    try {
      if (adminMode) {
        await adminCodeLogin.mutateAsync({ accessCode });
        setLocation("/admin");
        return;
      }
      if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
      if (mode === "register" && !adminMode) {
        const { error: supabaseError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, preferred_currency: preferredCurrency } } });
        if (supabaseError) throw supabaseError;
        await register.mutateAsync({ name, email, password, preferredCurrency });
      } else {
        await login.mutateAsync({ email, password });
        await supabase.auth.signInWithPassword({ email, password });
      }
      setLocation(next.startsWith("/") ? next : "/terminal");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to complete authentication."); }
  };

  const pending = register.isPending || login.isPending || adminCodeLogin.isPending;
  return <main className="route-gate auth-page"><div className="auth-shell"><div className="auth-brand"><a href="/" className="auth-brand-lockup"><span className="brand-mark"><img src="/vectortrade-mark.svg" alt="VectorTrade" /></span><span>VECTOR<span className="brand-accent">TRADE</span></span></a><span className="app-kicker">PRIVATE MARKET NETWORK</span></div><div className="auth-card"><div className="auth-icon"><LockKeyhole size={20} /></div><p className="app-kicker">{adminMode ? "OPERATOR ACCESS" : mode === "register" ? "CREATE YOUR WORKSPACE" : "RETURN TO YOUR WORKSPACE"}</p><h1>{adminMode ? "Enter the operations console." : mode === "register" ? "Build your market workspace." : "Welcome back, operator."}</h1><p className="auth-muted">{adminMode ? "Use the approved administrator account. Public registration is unavailable on this route." : mode === "register" ? "Choose your display currency to open your account." : "Sign in to view your charts, plans, account activity, and verification status."}</p>{notice && <div className="auth-notice"><CheckCircle2 size={15} />{notice}</div>}<form onSubmit={submit} className="auth-form">{adminMode ? <label>PRIVATE ACCESS CODE<input value={accessCode} onChange={e => setAccessCode(e.target.value)} required minLength={6} maxLength={128} type="password" autoComplete="one-time-code" placeholder="Enter private access code" /></label> : <><>{mode === "register" && <label>FULL NAME<input value={name} onChange={e => setName(e.target.value)} required minLength={2} placeholder="Alex Morgan" /></label>}</><label>EMAIL ADDRESS<input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="you@example.com" /></label><label>PASSWORD<input value={password} onChange={e => setPassword(e.target.value)} required type="password" minLength={8} placeholder="At least 8 characters" /></label>{mode === "register" && <label>DISPLAY CURRENCY<select value={preferredCurrency} onChange={e => setPreferredCurrency(e.target.value as typeof preferredCurrency)}>{currencies.map(item => <option key={item}>{item}</option>)}</select></label>}</>}{error && <div className="auth-error">{error}</div>}<button className="primary-cta auth-submit" disabled={pending}>{pending ? "SECURING ACCOUNT…" : adminMode ? "OPEN ADMIN CONSOLE" : mode === "register" ? "CREATE ACCOUNT" : "SIGN IN"}<ArrowRight size={16} /></button></form>{!adminMode && <button className="text-link auth-switch" onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); setNotice(""); }}>{mode === "register" ? "Already have an account? Sign in" : "Need an account? Register"}</button>}</div><div className="auth-footer"><span><ShieldCheck size={14} /> Account verification can be completed after sign-in.</span><span>{adminMode ? "Administrator access is role-restricted." : `New accounts begin at ${preferredCurrency} 0.00.`}</span></div></div></main>;
}
