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
import { LockKeyhole, ShieldCheck } from "lucide-react";

function AdminGate() { return <Admin />; }
function PublicAuthRoute() { return <Auth />; }
function CryptoRoute() { return <MarketWorkspace market="crypto" />; }
function ForexRoute() { return <MarketWorkspace market="forex" />; }
function StocksRoute() { return <MarketWorkspace market="stocks" />; }
function MemecoinsRoute() { return <MarketWorkspace market="memecoins" />; }
function AdminLoginRoute() { return <Admin />; }
function Router() { return <Switch><Route path="/" component={Home} /><Route path="/auth" component={PublicAuthRoute} /><Route path="/terminal" component={Terminal} /><Route path="/crypto" component={CryptoRoute} /><Route path="/forex" component={ForexRoute} /><Route path="/stocks" component={StocksRoute} /><Route path="/memecoins" component={MemecoinsRoute} /><Route path="/admin/login" component={AdminLoginRoute} /><Route path="/admin" component={AdminGate} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export const adminRoutePolicy = { path: "/admin", requiredRole: "admin" as const };
