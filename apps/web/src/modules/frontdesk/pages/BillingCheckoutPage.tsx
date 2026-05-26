import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Beaker,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Minus,
  Plus,
  Printer,
  Search,
  Stethoscope,
  Trash2,
  UserRound,
  Wallet
} from "lucide-react";
import { apiRequest } from "@/core/http";

type CartLine = {
  id: string;
  kind: "consult" | "lab";
  title: string;
  subtitle: string;
  price: number;
  qty: number;
};

const defaultLines: CartLine[] = [
  {
    id: "d1",
    kind: "consult",
    title: "General Physician Consultation",
    subtitle: "Dr. Aris Thorne",
    price: 1200,
    qty: 1
  },
  {
    id: "d2",
    kind: "lab",
    title: "Comprehensive Lipid Profile",
    subtitle: "Apollo Diagnostics Lab",
    price: 850,
    qty: 1
  },
  {
    id: "d3",
    kind: "lab",
    title: "Complete Blood Count (CBC)",
    subtitle: "Apollo Diagnostics Lab",
    price: 450,
    qty: 1
  }
];

type PatientLookup = { id: string; name: string; meta: string; initials: string };

type PayMode = "card" | "upi" | "cash";

export function BillingCheckoutPage() {
  const location = useLocation();
  const passed = (location.state as { lines?: CartLine[] } | null)?.lines;

  const [lines, setLines] = useState<CartLine[]>(() => (passed && passed.length ? passed : defaultLines));
  const [patientQuery, setPatientQuery] = useState("");
  const [patientOpen, setPatientOpen] = useState(false);
  const [patient, setPatient] = useState<{ name: string; meta: string; initials: string } | null>({
    name: "Michael Chen",
    meta: "34 Yrs, Male • +1 (555) 019-2834",
    initials: "MC"
  });
  const [coinInput, setCoinInput] = useState("50");
  const [payMode, setPayMode] = useState<PayMode>("card");
  const [patientResults, setPatientResults] = useState<PatientLookup[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  useEffect(() => {
    apiRequest<{
      items: Array<{
        id: string;
        first_name: string;
        last_name: string;
        mobile: string;
        gender: string;
        date_of_birth: string;
      }>;
    }>("/patients?page=1&pageSize=20")
      .then((resp) => {
        const mapped = resp.items.map((p) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          meta: `${p.gender} • ${p.mobile}`,
          initials: `${p.first_name[0] ?? ""}${p.last_name[0] ?? ""}`.toUpperCase()
        }));
        setPatientResults(mapped);
        if (mapped[0]) {
          setPatient({ name: mapped[0].name, meta: mapped[0].meta, initials: mapped[0].initials });
          setSelectedPatientId(mapped[0].id);
        }
      })
      .catch(() => undefined);
  }, []);

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.price * l.qty, 0), [lines]);
  const discount = 50;
  const coinsApplied = Math.min(Number(coinInput) || 0, 100, subtotal - discount);
  const total = Math.max(0, subtotal - discount - coinsApplied);

  const filteredPatients = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    if (!q) return patientResults;
    return patientResults.filter((p) => p.name.toLowerCase().includes(q));
  }, [patientQuery]);

  function setQty(id: string, delta: number) {
    setLines((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, qty: Math.max(1, l.qty + delta) } : l))
    );
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="screen-wrap calendar-screen doc-pat-screen bill-checkout-page">
      <header className="bill-co-head">
        <h1 className="bill-co-title">Checkout &amp; Billing</h1>
        <p className="bill-co-sub">Process payments for consultations, labs, and pharmacy items.</p>
      </header>

      <div className="bill-co-grid">
        <div className="bill-co-left">
          <section className="bill-co-card">
            <h2 className="bill-co-card-h">
              <UserRound size={18} strokeWidth={2} /> Patient Information
            </h2>
            <div className="bill-co-search-wrap">
              <Search size={18} strokeWidth={2} className="bill-co-search-ico" aria-hidden />
              <input
                className="bill-co-search-input"
                placeholder="Search Patient"
                value={patientQuery}
                onChange={(e) => {
                  setPatientQuery(e.target.value);
                  setPatientOpen(true);
                }}
                onFocus={() => setPatientOpen(true)}
              />
            </div>
            {patientOpen && patientQuery && (
              <ul className="bill-co-dd">
                {filteredPatients.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="bill-co-dd-item"
                      onClick={() => {
                        setPatient({ name: p.name, meta: p.meta, initials: p.initials });
                        setSelectedPatientId(p.id);
                        setPatientQuery("");
                        setPatientOpen(false);
                      }}
                    >
                      <span className="bill-co-dd-av">{p.initials}</span>
                      <span>{p.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {patient && (
              <div className="bill-co-patient-row">
                <span className="bill-co-p-av">{patient.initials}</span>
                <div>
                  <strong className="bill-co-p-name">{patient.name}</strong>
                  <span className="bill-co-p-meta">{patient.meta}</span>
                </div>
              </div>
            )}
          </section>

          <section className="bill-co-card">
            <div className="bill-co-card-head-row">
              <h2 className="bill-co-card-h">
                <FileText size={18} strokeWidth={2} /> Invoice Items
              </h2>
              <span className="bill-co-badge">{lines.length} Items</span>
            </div>
            <ul className="bill-co-lines">
              {lines.map((line) => (
                <li key={line.id} className="bill-co-line">
                  <div className="bill-co-line-ico">
                    {line.kind === "consult" ? <Stethoscope size={20} strokeWidth={2} /> : <Beaker size={20} strokeWidth={2} />}
                  </div>
                  <div className="bill-co-line-mid">
                    <strong>{line.title}</strong>
                    <span>{line.subtitle}</span>
                  </div>
                  <div className="bill-co-line-qty">
                    <button type="button" aria-label="Decrease" onClick={() => setQty(line.id, -1)}>
                      <Minus size={14} strokeWidth={2} />
                    </button>
                    <span>{line.qty}</span>
                    <button type="button" aria-label="Increase" onClick={() => setQty(line.id, 1)}>
                      <Plus size={14} strokeWidth={2} />
                    </button>
                  </div>
                  <span className="bill-co-line-price">₹{(line.price * line.qty).toLocaleString("en-IN")}</span>
                  <button type="button" className="bill-co-line-trash" aria-label="Remove" onClick={() => removeLine(line.id)}>
                    <Trash2 size={17} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="bill-co-right">
          <section className="bill-co-side-card">
            <h3 className="bill-co-side-h">INVOICE DETAILS</h3>
            <p>Bill no: BS/2025/09991</p>
            <p>Patient ID: PID-8842-991</p>
          </section>

          <section className="bill-co-side-card bill-co-coins">
            <span>Sugar Coins balance: 100</span>
            <input className="bill-co-coin-inp" placeholder="Enter amount" value={coinInput} onChange={(e) => setCoinInput(e.target.value)} />
          </section>

          <section className="bill-co-side-card">
            <h3 className="bill-co-side-h">PAYMENT SUMMARY</h3>
            <div className="bill-co-sum-row">
              <span>Subtotal ({lines.reduce((n, l) => n + l.qty, 0)} items)</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="bill-co-sum-row">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>
            <div className="bill-co-sum-row">
              <span>Sugarcoins</span>
              <span>-₹{coinsApplied}</span>
            </div>
            <div className="bill-co-sum-total">
              <span>Total Amount</span>
              <strong>₹{total.toFixed(2)}</strong>
            </div>
          </section>

          <section className="bill-co-side-card">
            <h3 className="bill-co-side-h">SELECT PAYMENT MODE</h3>
            <div className="bill-co-pay-grid">
              <button type="button" className={`bill-co-pay ${payMode === "card" ? "is-on" : ""}`} onClick={() => setPayMode("card")}>
                {payMode === "card" && <Check className="bill-co-pay-check" size={14} strokeWidth={3} />}
                <CreditCard size={22} strokeWidth={1.8} />
                Card
              </button>
              <button type="button" className={`bill-co-pay ${payMode === "upi" ? "is-on" : ""}`} onClick={() => setPayMode("upi")}>
                {payMode === "upi" && <Check className="bill-co-pay-check" size={14} strokeWidth={3} />}
                <Wallet size={22} strokeWidth={1.8} />
                UPI
              </button>
              <button type="button" className={`bill-co-pay ${payMode === "cash" ? "is-on" : ""}`} onClick={() => setPayMode("cash")}>
                {payMode === "cash" && <Check className="bill-co-pay-check" size={14} strokeWidth={3} />}
                Cash
              </button>
            </div>
          </section>

          <button
            type="button"
            className="bill-co-primary"
            onClick={async () => {
              if (!selectedPatientId) return;
              await apiRequest("/billing/checkout", {
                method: "POST",
                body: {
                  patientId: selectedPatientId,
                  lines: lines.map((line) => ({ title: line.title, qty: line.qty, price: line.price })),
                  discount,
                  coins: coinsApplied,
                  paymentMode: payMode
                }
              });
              setPaymentDone(true);
            }}
          >
            <CheckCircle2 size={20} strokeWidth={2} />
            {paymentDone ? "Payment confirmed" : "Confirm payment"}
          </button>
          <button type="button" className="bill-co-secondary">
            <Printer size={18} strokeWidth={2} />
            Save &amp; Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
