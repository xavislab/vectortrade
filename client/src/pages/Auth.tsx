import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

const currencies = ["USD", "EUR", "GBP", "NGN", "CAD", "AUD"] as const;

export default function Auth() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState<(typeof currencies)[number]>("USD");
  const [error, setError] = useState("");
  const register = trpc.auth.register.useMutation();
  const login = trpc.auth.login.useMutation();

  useEffect(() => { if (user) setLocation("/terminal"); }, [user, setLocation]);
  const next = new URLSearchParams(window.location.search).get("next") || "/terminal";
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    try {
      if (mode === "register") {
        if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
        await register.mutateAsync({ name, email, password, preferredCurrency });
      } else await login.mutateAsync({ email, password });
      setLocation(next.startsWith("/") ? next : "/terminal");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to complete authentication."); }
  };
  const pending = register.isPending || login.isPending;
  return <main className="route-gate auth-page"><div className="auth-shell"><div className="auth-brand"><a href="/" className="brand-mark">VECTORTRADE</a><span className="app-kicker">PRIVATE MARKET NETWORK</span></div><div className="auth-card"><div className="auth-icon"><LockKeyhole size={20} /></div><p className="app-kicker">{mode === "register" ? "CREATE YOUR WORKSPACE" : "RETURN TO YOUR WORKSPACE"}</p><h1>{mode === "register" ? "Start with a zero-balance account." : "Welcome back, operator."}</h1><p className="auth-muted">{mode === "register" ? "Choose your display currency now. You can change it later in Account centre." : "Sign in to view your dashboard, paper portfolio, and deposit history."}</p><form onSubmit={submit} className="auth-form">{mode === "register" && <label>FULL NAME<input value={name} onChange={e => setName(e.target.value)} required minLength={2} placeholder="Alex Morgan" /></label>}<label>EMAIL ADDRESS<input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="you@example.com" /></label><label>PASSWORD<input value={password} onChange={e => setPassword(e.target.value)} required type="password" minLength={8} placeholder="At least 8 characters" /></label>{mode === "register" && <label>DISPLAY CURRENCY<select value={preferredCurrency} onChange={e => setPreferredCurrency(e.target.value as typeof preferredCurrency)}>{currencies.map(item => <option key={item}>{item}</option>)}</select></label>}{error && <div className="auth-error">{error}</div>}<button className="primary-cta auth-submit" disabled={pending}>{pending ? "SECURING SESSION…" : mode === "register" ? "CREATE ACCOUNT" : "SIGN IN"}<ArrowRight size={16} /></button></form><button className="text-link auth-switch" onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}>{mode === "register" ? "Already have an account? Sign in" : "Need an account? Register"}</button></div><div className="auth-footer"><span><ShieldCheck size={14} /> Session cookies are HTTP-only and expire automatically.</span><span>New accounts begin at {preferredCurrency} 0.00.</span></div></div></main>;
}
