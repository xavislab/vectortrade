import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const source = "/home/ubuntu/vectortrade";
const root = "/home/ubuntu/vectortrade-variants";
const variants = [
  ["vectortrade", "VectorTrade", "#45e6ff", "#8d57ff"],
  ["pulsetrade", "PulseTrade", "#6df5b6", "#24a5ff"],
  ["nexustrade", "NexusTrade", "#ffc76d", "#ff5ca8"],
  ["axiomtrade", "AxiomTrade", "#b6f36a", "#735dff"],
  ["quantumtrade", "QuantumTrade", "#ff75d2", "#54e6ff"],
  ["orbittrade", "OrbitTrade", "#85ffed", "#7a61ff"],
  ["fluxtrade", "FluxTrade", "#ff9a64", "#ff51d8"],
  ["signaltrade", "SignalTrade", "#d2ff62", "#ff6b9f"],
  ["novatrade", "NovaTrade", "#f4f871", "#4bdcff"],
  ["apextrade", "ApexTrade", "#78f1ff", "#f15dff"],
];

const excluded = new Set(["node_modules", ".git", "dist", ".manus-logs"]);
const copyOptions = { recursive: true, filter: (entry) => !excluded.has(path.basename(entry)) };
const textExtensions = new Set([".tsx", ".ts", ".css", ".html", ".md", ".json"]);

function rewriteTree(directory, name, slug, accent, accent2) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) { rewriteTree(full, name, slug, accent, accent2); continue; }
    if (!textExtensions.has(path.extname(entry.name))) continue;
    let content = fs.readFileSync(full, "utf8");
    content = content
      .replaceAll("VectorTrade", name)
      .replaceAll("VECTORTRADE", name.toUpperCase())
      .replaceAll("vectortrade", slug)
      .replaceAll("#45e6ff", accent)
      .replaceAll("#8d57ff", accent2)
      .replaceAll("#8f74ff", accent2)
      .replaceAll("/manus-storage/vectortrade-logo_71937915.png", `/${slug}-mark.svg`)
      .replaceAll("/vectortrade-mark.svg", `/${slug}-mark.svg`);
    fs.writeFileSync(full, content);
  }
}

fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(path.join(root, "output"), { recursive: true });

for (const [slug, name, accent, accent2] of variants) {
  const destination = path.join(root, slug);
  fs.cpSync(source, destination, copyOptions);
  rewriteTree(destination, name, slug, accent, accent2);
  const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="16" fill="#09102a"/><path d="M14 16l13 32 8-16 8 16 13-32" stroke="${accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M35 32l21-16" stroke="${accent2}" stroke-width="7" stroke-linecap="round"/></svg>`;
  fs.writeFileSync(path.join(destination, "client", "public", `${slug}-mark.svg`), mark);
  const variantNotes = `# ${name} Variant\n\nThis archive is a branded variant of the VectorTrade demo foundation. It includes the expanded public landing page, user dashboard, demo wallet/deposit/withdrawal/KYC/referral/support/settings workflows, admin operations screens, ledger-oriented backend contracts, and explicit no-live-funds disclosures.\n`;
  fs.writeFileSync(path.join(destination, "VARIANT_NOTES.md"), variantNotes);
  execFileSync("zip", ["-qr", path.join(root, "output", `${slug}.zip`), "."], { cwd: destination });
}
console.log(`Generated and packaged ${variants.length} full-stack branded variants in ${path.join(root, "output")}`);
