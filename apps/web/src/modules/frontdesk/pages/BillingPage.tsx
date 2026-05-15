import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Truck
} from "lucide-react";

type BillMode = "consultation" | "labs";

type CartLine = {
  id: string;
  kind: "consult" | "lab";
  title: string;
  subtitle: string;
  price: number;
  qty: number;
};

const specialties = ["General Physician", "Cardiology", "Dermatology", "Neurology", "Pediatrics"] as const;

const labCategories = [
  {
    id: "cbc",
    name: "Complete Blood Count (CBC)",
    badge: "BOTH",
    rows: [
      { id: "cbc-apollo", lab: "Apollo Diagnostics", loc: "City Center", price: 450 },
      { id: "cbc-lal", lab: "Dr. Lal PathLabs", loc: "Andheri West", price: 420 },
      { id: "cbc-metro", lab: "Metropolis Healthcare", loc: "Bandra", price: 480 }
    ]
  },
  {
    id: "lipid",
    name: "Lipid Profile",
    badge: "BOTH",
    rows: [
      { id: "lip-apollo", lab: "Apollo Diagnostics", loc: "City Center", price: 850 },
      { id: "lip-lal", lab: "Dr. Lal PathLabs", loc: "Andheri West", price: 820 }
    ]
  }
];

const dateChips = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "wed", label: "Wed, 21" },
  { id: "thu", label: "Thu, 22" }
] as const;

const timeSlots = ["09:00 AM", "09:15 AM", "09:30 AM", "09:45 AM"];

export function BillingPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<BillMode>("consultation");
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(specialties.map((s) => [s, true]))
  );
  const [serviceModeLab, setServiceModeLab] = useState<"both" | "walk" | "home">("both");
  const [cart, setCart] = useState<CartLine[]>([]);

  const [docA, setDocA] = useState({ date: "today" as (typeof dateChips)[number]["id"], slot: timeSlots[0], visit: "Follow-up", place: "home" as "walk" | "home", qty: 1 });
  const [docB, setDocB] = useState({ date: "today" as (typeof dateChips)[number]["id"], slot: timeSlots[1], visit: "New", place: "home" as "walk" | "home" });

  const cartCount = useMemo(() => cart.reduce((n, l) => n + l.qty, 0), [cart]);

  function addConsult(name: string, spec: string, fee: number, qty = 1) {
    const id = `c-${Date.now()}`;
    setCart((prev) => [...prev, { id, kind: "consult", title: `${name} — ${spec}`, subtitle: "Consultation", price: fee, qty }]);
  }

  function addLabRow(testName: string, lab: string, price: number) {
    const id = `l-${Date.now()}`;
    setCart((prev) => [...prev, { id, kind: "lab", title: testName, subtitle: lab, price, qty: 1 }]);
  }

  function resetFilters() {
    if (mode === "consultation") {
      setSpecFilter(Object.fromEntries(specialties.map((s) => [s, true])));
    } else {
      setServiceModeLab("both");
    }
  }

  function checkout() {
    navigate("/frontdesk/billing/checkout", { state: { lines: cart } });
  }

  const filteredDocs = useMemo(() => {
    const docs = [
      { id: "aris", name: "Dr. Aris Thorne", spec: "Senior Cardiologist", fee: 1200, specKey: "Cardiology" as const },
      { id: "priya", name: "Dr. Priya Nair", spec: "Dermatologist", fee: 1200, specKey: "Dermatology" as const }
    ];
    const q = search.trim().toLowerCase();
    return docs.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q) && !d.spec.toLowerCase().includes(q)) return false;
      return specFilter[d.specKey];
    });
  }, [search, specFilter]);

  return (
    <div className="screen-wrap calendar-screen doc-pat-screen bill-page">
      <div className="bill-layout">
        <div className="bill-main">
          <div className="bill-search-wrap">
            <Search size={18} strokeWidth={2} className="bill-search-ico" aria-hidden />
            <input
              className="bill-search-input"
              placeholder={mode === "consultation" ? "Search Doctor" : "Search Test"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {mode === "consultation" ? (
            <div className="bill-doc-grid">
              {filteredDocs.map((d, idx) => (
                <article key={d.id} className="bill-doc-card">
                  <div className="bill-doc-left">
                    <span className="bill-doc-av" aria-hidden>
                      {d.name
                        .replace("Dr. ", "")
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </span>
                    <div>
                      <h3 className="bill-doc-name">{d.name}</h3>
                      <p className="bill-doc-spec">{d.spec}</p>
                      <span className="bill-fee-lbl">STANDARD FEE</span>
                      <p className="bill-fee-amt">₹{d.fee.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="bill-doc-right">
                    <div className="bill-date-row">
                      {dateChips.map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          className={`bill-chip-date ${(idx === 0 ? docA : docB).date === chip.id ? "is-on" : ""}`}
                          onClick={() => (idx === 0 ? setDocA((s) => ({ ...s, date: chip.id })) : setDocB((s) => ({ ...s, date: chip.id })))}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                    <div className="bill-slot-row">
                      {timeSlots.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`bill-chip-slot ${(idx === 0 ? docA : docB).slot === t ? "is-on" : ""}`}
                          onClick={() => (idx === 0 ? setDocA((s) => ({ ...s, slot: t })) : setDocB((s) => ({ ...s, slot: t })))}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <label className="bill-select-wrap">
                      <select
                        className="bill-select"
                        value={idx === 0 ? docA.visit : docB.visit}
                        onChange={(e) =>
                          idx === 0 ? setDocA((s) => ({ ...s, visit: e.target.value })) : setDocB((s) => ({ ...s, visit: e.target.value }))
                        }
                      >
                        <option>Follow-up</option>
                        <option>New</option>
                      </select>
                    </label>
                    <div className="bill-seg">
                      <button
                        type="button"
                        className={(idx === 0 ? docA : docB).place === "walk" ? "is-on" : ""}
                        onClick={() => (idx === 0 ? setDocA((s) => ({ ...s, place: "walk" })) : setDocB((s) => ({ ...s, place: "walk" })))}
                      >
                        Walk-in
                      </button>
                      <button
                        type="button"
                        className={(idx === 0 ? docA : docB).place === "home" ? "is-on" : ""}
                        onClick={() => (idx === 0 ? setDocA((s) => ({ ...s, place: "home" })) : setDocB((s) => ({ ...s, place: "home" })))}
                      >
                        Home
                      </button>
                    </div>
                    <div className="bill-doc-actions">
                      {idx === 0 ? (
                        <>
                          <div className="bill-qty-navy">
                            <button type="button" aria-label="Decrease" onClick={() => setDocA((s) => ({ ...s, qty: Math.max(1, s.qty - 1) }))}>
                              <Minus size={16} strokeWidth={2} />
                            </button>
                            <span>{docA.qty}</span>
                            <button type="button" aria-label="Increase" onClick={() => setDocA((s) => ({ ...s, qty: s.qty + 1 }))}>
                              <Plus size={16} strokeWidth={2} />
                            </button>
                          </div>
                          <button type="button" className="bill-add-cart" onClick={() => addConsult(d.name, d.spec, d.fee, docA.qty)}>
                            Add to Cart
                            <ArrowRight size={16} strokeWidth={2} />
                          </button>
                        </>
                      ) : (
                        <button type="button" className="bill-add-cart" onClick={() => addConsult(d.name, d.spec, d.fee)}>
                          Add to Cart
                          <ArrowRight size={16} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bill-lab-stack">
              {labCategories.map((cat) => (
                <section key={cat.id} className="bill-lab-cat">
                  <header className="bill-lab-cat-head">
                    <h3>{cat.name}</h3>
                    <span className="bill-lab-badge">{cat.badge}</span>
                  </header>
                  <ul className="bill-lab-rows">
                    {cat.rows.map((row) => (
                      <li key={row.id} className="bill-lab-row">
                        <div className="bill-lab-info">
                          <strong>{row.lab}</strong>
                          <span className="bill-lab-loc">
                            <MapPin size={12} strokeWidth={2} /> {row.loc}
                          </span>
                          <div className="bill-lab-modes">
                            <span className="bill-lab-pill">
                              <Truck size={12} strokeWidth={2} /> Home Pickup
                            </span>
                            <span className="bill-lab-pill">
                              <Building2 size={12} strokeWidth={2} /> Lab Walk-in
                            </span>
                          </div>
                        </div>
                        <div className="bill-lab-price-block">
                          <span className="bill-fee-lbl">PRICE</span>
                          <p className="bill-lab-price">₹{row.price}</p>
                        </div>
                        <button type="button" className="bill-add-cart sm" onClick={() => addLabRow(cat.name, row.lab, row.price)}>
                          Add to Cart
                          <ArrowRight size={14} strokeWidth={2} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        <aside className="bill-aside">
          <div className="bill-mode-pill">
            <button type="button" className={mode === "consultation" ? "is-on" : ""} onClick={() => setMode("consultation")}>
              Consultation
            </button>
            <button type="button" className={mode === "labs" ? "is-on" : ""} onClick={() => setMode("labs")}>
              Labs
            </button>
          </div>

          {mode === "consultation" ? (
            <div className="bill-aside-block">
              <h4 className="bill-aside-h">DOCTOR SPECIALITY</h4>
              <ul className="bill-check-list">
                {specialties.map((s) => (
                  <li key={s}>
                    <label className="bill-check">
                      <input type="checkbox" checked={specFilter[s]} onChange={() => setSpecFilter((prev) => ({ ...prev, [s]: !prev[s] }))} />
                      {s}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bill-aside-block">
              <h4 className="bill-aside-h">SERVICE MODE</h4>
              <ul className="bill-radio-list">
                {(
                  [
                    { id: "both" as const, label: "Both" },
                    { id: "walk" as const, label: "Walk-in" },
                    { id: "home" as const, label: "Home pickup" }
                  ] as const
                ).map((opt) => (
                  <li key={opt.id}>
                    <label className="bill-radio">
                      <input
                        type="radio"
                        name="svcMode"
                        checked={serviceModeLab === opt.id}
                        onChange={() => setServiceModeLab(opt.id)}
                      />
                      {opt.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button type="button" className="bill-reset" onClick={resetFilters}>
            Reset All Filters
          </button>

          <div className="bill-cart">
            <div className="bill-cart-head">
              <ShoppingCart size={18} strokeWidth={2} />
              <span>Cart</span>
              <span className="bill-cart-badge">{cartCount}</span>
            </div>
            <p className="bill-cart-meta">Total Items: {cartCount}</p>
            <button type="button" className="bill-checkout-btn" disabled={cartCount === 0} onClick={checkout}>
              Checkout
              <ArrowRight size={18} strokeWidth={2} />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
