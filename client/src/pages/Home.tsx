import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Bot, ChevronLeft, ChevronRight, CircleDot, Copy, Cpu, Gauge, LockKeyhole, Menu, Play, Radio, ShieldCheck, Sparkles, TrendingUp, WalletCards, X, Zap } from "lucide-react";

const logoUrl = "/vectortrade-mark.svg";

const initialTicker = [
  ["BTC/USD", "$64,210.50", "+2.4%", "up"],
  ["ETH/USD", "$3,450.20", "-0.8%", "down"],
  ["EUR/USD", "1.0845", "+0.1%", "up"],
  ["AAPL 190C", "$8.40", "+14.2%", "up"],
  ["PEPE/USDT", "0.0000084", "+45.6%", "up"],
  ["SPY", "$512.40", "+1.1%", "up"],
  ["GOLD", "$2,340.10", "-0.2%", "down"],
  ["BONK/SOL", "0.000021", "+12.4%", "up"],
] as const;

const markets = [
  { eyebrow: "01 / ON-CHAIN", title: "Memecoin Sniping", copy: "Mempool intelligence for token launches with automated rug-pull protection and anti-MEV routing.", tags: ["RAYDIUM", "UNISWAP"], icon: Zap, color: "cyan" },
  { eyebrow: "02 / DERIVATIVES", title: "Stock Options", copy: "Options flow, dark-pool signals, and Greeks fused into multi-leg execution ideas.", tags: ["NYSE", "NASDAQ"], icon: TrendingUp, color: "violet" },
  { eyebrow: "03 / MACRO", title: "Forex Trading", copy: "Institutional-grade liquidity for major and minor pairs with sentiment-aware macro context.", tags: ["EUR/USD", "GBP/JPY"], icon: Gauge, color: "magenta" },
  { eyebrow: "04 / OUTCOMES", title: "Prediction Markets", copy: "Probability-aware intelligence for binary outcomes across politics, sports, and crypto.", tags: ["ORACLES", "EVENTS"], icon: CircleDot, color: "lime" },
];

export default function Home() {
  const [ticker, setTicker] = useState<Array<(typeof initialTicker)[number]>>([...initialTicker]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [marketIndex, setMarketIndex] = useState(0);
  const [accountOpen, setAccountOpen] = useState(false);
  const [tickerStatus, setTickerStatus] = useState<"live" | "delayed" | "stale">("live");

  useEffect(() => {
    let cycle = 0;
    const interval = window.setInterval(() => {
      cycle += 1;
      setTicker((current) => [...current]);
      setTickerStatus(cycle % 7 === 0 ? "stale" : cycle % 4 === 0 ? "delayed" : "live");
    }, 4200);
    return () => window.clearInterval(interval);
  }, []);

  const visibleMarkets = useMemo(() => {
    return [0, 1, 2].map((offset) => markets[(marketIndex + offset) % markets.length]);
  }, [marketIndex]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050817] text-white">
      <div className="ambient-grid" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />

      <div className="ticker-bar">
        <div className="ticker-health"><span className={`status-dot ticker-${tickerStatus}`} /> {tickerStatus.toUpperCase()} FEED</div>
        <div className="ticker-track">
          {[...ticker, ...ticker].map(([symbol, price, change, direction], index) => (
            <div key={`${symbol}-${index}`} className="ticker-item">
              <span className="ticker-symbol">{symbol}</span>
              <span className="ticker-price">{price}</span>
              <span className={direction === "up" ? "ticker-up" : "ticker-down"}>{change}</span>
            </div>
          ))}
        </div>
      </div>

      <header className="site-header">
        <Link href="/" className="brand-lockup">
          <span className="brand-mark"><img src={logoUrl} alt="" /></span>
          <span>VECTOR<span className="brand-accent">TRADE</span></span>
        </Link>
        <nav className={menuOpen ? "desktop-nav mobile-open" : "desktop-nav"}>
          <a href="#markets" onClick={() => setMenuOpen(false)}>MARKETS</a>
          <a href="#ai-core" onClick={() => setMenuOpen(false)}>AI CORE</a>
          <a href="#copytrade" onClick={() => setMenuOpen(false)}>COPYTRADE</a>
          <a href="#roadmap" onClick={() => setMenuOpen(false)}>ROADMAP</a>
        </nav>
        <div className="header-actions">
          <Link href="/terminal" className="login-button">LOGIN</Link>
          <Link href="/terminal" className="launch-button">LAUNCH APP <ArrowUpRight size={15} /></Link>
          <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="hero-content">
          <div className="status-pill"><span className="status-dot" /> NETWORK STATUS: ACTIVE &amp; LEARNING</div>
          <p className="section-kicker">NEURAL EXECUTION / 001</p>
          <h1>TRADE EVERY ASSET.<br /><span>MASTER EVERY MARKET.</span></h1>
          <p className="hero-copy">One intelligent terminal for memecoin sniping, options flow, forex liquidity, and prediction markets. Powered by real-time signals and a neural trading core.</p>
          <div className="hero-actions">
            <Link href="/terminal" className="primary-cta">START TRADING <ArrowUpRight size={18} /></Link>
            <button className="secondary-cta" onClick={() => setAccountOpen(true)}><Play size={15} fill="currentColor" /> WATCH ACCOUNT</button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true"><img src="/media/vectortrade-neural-grid.png" alt="" /></div><div className="hero-side-card">
          <div className="side-card-top"><span><Radio size={14} /> AUTOPILOT</span><span className="live-label">LIVE</span></div>
          <div className="signal-line"><span className="signal-icon"><Bot size={15} /></span><div><strong>Neural Assist</strong><small>Listening to 15+ venues</small></div></div>
          <div className="mini-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <p>Volume anomaly detected in <b>$NVDA</b>. Options flow suggests aggressive call accumulation.</p>
        </div>
      </section>

      <section className="metrics-strip container-wide">
        {[ ["0.01ms", "SNIPING LATENCY", Zap], ["15+", "EXCHANGES LINKED", Copy], ["4.2B", "AI TRADE VOLUME", Cpu], ["99%", "MIRROR ACCURACY", ShieldCheck] ].map(([value, label, Icon]) => (
          <div className="metric" key={label as string}><Icon size={15} /><strong>{value as string}</strong><span>{label as string}</span></div>
        ))}
      </section>

      <section id="markets" className="section-shell container-wide">
        <div className="section-heading-row"><div><p className="section-kicker">UNIVERSAL COVERAGE</p><h2>OMNI-CHANNEL <em>MARKETS</em></h2></div><div className="slider-controls"><button onClick={() => setMarketIndex((marketIndex + markets.length - 1) % markets.length)} aria-label="Previous market"><ChevronLeft size={18} /></button><button onClick={() => setMarketIndex((marketIndex + 1) % markets.length)} aria-label="Next market"><ChevronRight size={18} /></button></div></div>
        <div className="market-grid">
          {visibleMarkets.map((market) => { const Icon = market.icon; return <article key={market.title} className={`market-card card-${market.color}`}><div className="market-icon"><Icon size={20} /></div><p className="card-eyebrow">{market.eyebrow}</p><h3>{market.title}</h3><p>{market.copy}</p><div className="tag-row">{market.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>; })}
        </div>
        <div className="slider-dots">{markets.map((market, index) => <button key={market.title} className={index === marketIndex ? "active" : ""} onClick={() => setMarketIndex(index)} aria-label={`Go to ${market.title}`} />)}</div>
      </section>

      <section id="ai-core" className="section-shell container-wide ai-section">
        <div className="ai-copy"><p className="section-kicker">AUTOPILOT ENGAGED</p><h2>AI ASSIST &amp;<br /><span>COPYTRADE MESH</span></h2><p>Why trade alone when you can harness swarm intelligence? VectorTrade fuses market sentiment, liquidity signals, and verified trader behavior into one responsive execution layer.</p><div className="feature-list"><div><span><Sparkles size={16} /></span><div><h3>AI Trade Assistant</h3><p>Build a portfolio, analyze earnings, or set volatility-aware risk controls from a natural-language prompt.</p></div></div><div id="copytrade"><span><Copy size={16} /></span><div><h3>Alpha Copytrading</h3><p>Follow ranked strategies across crypto, forex, and options with transparent sizing and performance context.</p></div></div></div><Link href="/terminal" className="text-link">VIEW LIVE TERMINAL <ArrowUpRight size={16} /></Link></div>
        <div className="terminal-window"><div className="terminal-header"><span className="terminal-brand"><span className="terminal-led" /> VECTOR AI / NEURAL ASSIST</span><span className="terminal-status">CONNECTED</span></div><div className="terminal-body"><div className="terminal-message assistant"><span className="terminal-avatar"><Bot size={14} /></span><div><small>VECTOR AI · 09:41:18</small><p>Detecting massive volume spike in <b>$NVDA</b> dark pools. Options flow suggests heavy call buying for next Friday.</p></div></div><div className="terminal-message action"><span className="terminal-avatar"><Zap size={14} /></span><div><small>ACTION PROPOSED</small><p>Mirror the top Options trader in the network for this play. Size: <b>5% of portfolio.</b></p><div className="action-row"><button>APPROVE MIRROR</button><span>Risk: MODERATE</span></div></div></div><div className="terminal-feed"><span /><span /><span /><span /> trade executing on NASDAQ...</div></div></div>
      </section>

      <section id="security" className="section-shell container-wide security-section"><div className="section-heading-row"><div><p className="section-kicker">TRUST BY DESIGN</p><h2>CONTROLLED BY<br /><em>TRANSPARENT SYSTEMS.</em></h2></div><p className="roadmap-intro">Every automated flow is clearly labeled, approval-aware, and designed to keep customers in control of their decisions.</p></div><div className="security-grid"><article><span className="security-icon"><ShieldCheck size={18} /></span><h3>Verified wallet routing</h3><p>Wallet destinations are reviewed before any settlement step.</p></article><article><span className="security-icon"><LockKeyhole size={18} /></span><h3>Role-aware operations</h3><p>Privileged workflows are separated from the customer experience and protected by server-side authorization.</p></article><article><span className="security-icon"><WalletCards size={18} /></span><h3>Ledger-minded flows</h3><p>Deposit review, account activity, and approvals are designed around traceable, append-only events.</p></article></div></section><section id="roadmap" className="section-shell container-wide roadmap-section"><div className="section-heading-row"><div><p className="section-kicker">PROTOCOL EVOLUTION</p><h2>THE ROADMAP TO<br /><em>AUTONOMOUS ALPHA.</em></h2></div><p className="roadmap-intro">A measured path from high-speed execution to a more intelligent, more transparent trading network.</p></div><div className="roadmap-grid">{[["01", "Alpha Core", "LIVE", "High-speed memecoin routing and options analytics are online."], ["02", "The Hive", "Q3 2026", "Verified traders monetize strategies through the copytrade marketplace."], ["03", "Autonomous AGI", "Q1 2027", "Prediction markets and portfolio rebalancing become context-aware." ]].map(([number, title, time, copy], index) => <div className={`roadmap-item ${index === 0 ? "current" : ""}`} key={number}><span className="roadmap-number">{number}</span><div><div className="roadmap-title"><h3>{title}</h3><span>{time}</span></div><p>{copy}</p></div></div>)}</div></section>

      <footer className="site-footer container-wide"><div className="footer-brand"><Link href="/" className="brand-lockup"><span className="brand-mark"><img src={logoUrl} alt="" /></span><span>VECTOR<span className="brand-accent">TRADE</span></span></Link><p>The neural network terminal for the next generation of market operators.</p><span className="footer-status"><span className="status-dot" /> ALL SYSTEMS OPERATIONAL</span></div><div className="footer-links"><div><p>MARKETS</p><a href="#markets">Crypto &amp; Memecoins</a><a href="#markets">Stock Options</a><a href="#markets">Forex Pairs</a><a href="#markets">Prediction Markets</a></div><div><p>PLATFORM</p><Link href="/terminal">AI Assistant</Link><Link href="/terminal">Copytrade Terminal</Link><Link href="/terminal">Portfolio Dashboard</Link><a href="#security">Risk &amp; security</a></div></div><div className="footer-bottom"><span>© 2026 VectorTrade Terminal. Account environment.</span><span>PRIVACY / TERMS / RISK DISCLOSURE</span></div></footer>

      {accountOpen && <div className="modal-backdrop" onClick={() => setAccountOpen(false)}><div className="auth-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setAccountOpen(false)}><X size={18} /></button><div className="account-play"><Play size={28} fill="currentColor" /></div><p className="section-kicker">VECTORTRADE SIGNAL LOOP</p><h2>See the terminal think in real time.</h2><p>This account panel is ready for a connected market-data feed. The current environment uses clearly labeled automated market values.</p><Link href="/terminal" className="primary-cta" onClick={() => setAccountOpen(false)}>OPEN ACCOUNT TERMINAL <ArrowUpRight size={18} /></Link></div></div>}
    </main>
  );
}
