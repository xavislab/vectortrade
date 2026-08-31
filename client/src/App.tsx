import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Terminal from "./pages/Terminal";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import MarketWorkspace from "./pages/MarketWorkspace";
import { useAuth } from "./_core/hooks/useAuth";
import { LockKeyhole, ShieldCheck } from "lucide-react";

function AdminGate() {
  const { user, loading, error } = useAuth();
  const [, navigate] = useLocation();
  if (loading) return <main className="route-gate"><div className="gate-card"><span className="gate-loader" /><p className="app-kicker">SECURE ROUTE / ADMIN</p><h1>Checking operator credentials</h1><p>Verifying your privileged session before loading the control plane.</p></div></main>;
  if (error || !user) return <main className="route-gate"><div className="gate-card"><LockKeyhole size={26} /><p className="app-kicker">AUTHENTICATION REQUIRED</p><h1>Admin access is protected.</h1><p>Sign in with an approved VectorTrade operator account to continue.</p><button className="primary-cta" onClick={() => navigate("/admin/login")}>SIGN IN TO CONTINUE</button><button className="text-link gate-back" onClick={() => navigate("/")}>RETURN TO PUBLIC SITE</button></div></main>;
  if (user.role !== "admin") return <main className="route-gate"><div className="gate-card"><ShieldCheck size={26} /><p className="app-kicker">403 / PRIVILEGED AREA</p><h1>Operator permissions required.</h1><p>Your account is signed in, but it does not have access to the operations console.</p><button className="text-link gate-back" onClick={() => navigate("/terminal")}>RETURN TO TERMINAL</button></div></main>;
  return <Admin />;
}
function PublicAuthRoute() { return <Auth />; }
function CryptoRoute() { return <MarketWorkspace market="crypto" />; }
function ForexRoute() { return <MarketWorkspace market="forex" />; }
function StocksRoute() { return <MarketWorkspace market="stocks" />; }
function MemecoinsRoute() { return <MarketWorkspace market="memecoins" />; }
function AdminLoginRoute() { return <Auth adminMode />; }
function Router() { return <Switch><Route path="/" component={Home} /><Route path="/auth" component={PublicAuthRoute} /><Route path="/terminal" component={Terminal} /><Route path="/crypto" component={CryptoRoute} /><Route path="/forex" component={ForexRoute} /><Route path="/stocks" component={StocksRoute} /><Route path="/memecoins" component={MemecoinsRoute} /><Route path="/admin/login" component={AdminLoginRoute} /><Route path="/admin" component={AdminGate} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export const adminRoutePolicy = { path: "/admin", requiredRole: "admin" as const };
