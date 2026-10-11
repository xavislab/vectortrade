import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ShieldCheck, X } from "lucide-react";
import { TESTNET_DEPOSIT_OPTIONS } from "@shared/testnets";

const statusLabel: Record<string, string> = { pending: "Pending review", approved: "Approved, sending", rejected: "Rejected", sent: "Sent" };

export default function WithdrawModal({ onClose, onNotify }: { onClose: () => void; onNotify: (message: string) => void }) {
  const [choice, setChoice] = useState(0);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { asset, network } = TESTNET_DEPOSIT_OPTIONS[choice];
  const history = trpc.withdrawals.listMine.useQuery();
  const create = trpc.withdrawals.create.useMutation({
    onSuccess: () => { setSubmitted(true); history.refetch(); onNotify("Withdrawal request submitted for review."); },
    onError: err => setError(err.message),
  });
  return <div className="deposit-overlay" onClick={onClose}><div className="deposit-modal" onClick={event => event.stopPropagation()}>
    <div className="modal-heading"><div><p className="app-kicker">WITHDRAW / TESTNET</p><h2>{submitted ? "Withdrawal requested" : "Request withdrawal"}</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div>
    {submitted ? <div className="deposit-state"><CheckCircle2 size={30} /><h3>Request received</h3><p>Your {amount} {asset} withdrawal on {network} is <b>pending review</b>. Once approved, it's sent to your address and the transaction hash appears in your history.</p><button className="modal-primary" onClick={onClose}>RETURN TO WALLET</button></div> : <>
      <label className="field-label">TESTNET ASSET<select value={choice} onChange={event => setChoice(Number(event.target.value))}>{TESTNET_DEPOSIT_OPTIONS.map((option, index) => <option key={`${option.asset}-${option.network}`} value={index}>{option.asset} · {option.network}</option>)}</select></label>
      <label className="field-label">AMOUNT<input value={amount} onChange={event => setAmount(event.target.value)} inputMode="decimal" placeholder="0.00" /></label>
      <label className="field-label">DESTINATION ADDRESS ({network.toUpperCase()})<input value={address} onChange={event => setAddress(event.target.value)} placeholder={network === "Bitcoin Testnet4" ? "tb1…" : network === "Solana Devnet" ? "Solana address" : "0x…"} /></label>
      {error && <div className="auth-error">{error}</div>}
      <p className="deposit-warning"><ShieldCheck size={14} />Each withdrawal is reviewed by an operator before it's sent.</p>
      <button className="modal-primary" disabled={create.isPending || !amount || !address} onClick={() => { setError(""); create.mutate({ asset, network, address, amount }); }}>{create.isPending ? "SUBMITTING…" : "SUBMIT WITHDRAWAL REQUEST"}</button>
    </>}
    {(history.data?.length ?? 0) > 0 && <div className="withdraw-history"><p className="address-label">YOUR WITHDRAWALS</p>{history.data!.slice(0, 5).map(row => <div className="row-lite" key={row.id}><span><b>{row.amount} {row.asset}</b><small>{row.network} · {new Date(row.createdAt).toLocaleDateString()}{row.txHash ? ` · ${row.txHash.slice(0, 10)}…` : ""}{row.status === "rejected" && row.reviewNote ? ` · ${row.reviewNote}` : ""}</small></span><span className="review-status under-review">{statusLabel[row.status] ?? row.status}</span></div>)}</div>}
  </div></div>;
}
