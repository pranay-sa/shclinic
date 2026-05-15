import { useMemo, useState } from "react";
import { Clock3, Search, Trash2 } from "lucide-react";

type TagKind = "Aqua" | "Grey" | "Blue";

type QueueCard = {
  id: string;
  seq: number;
  appId: string;
  tag: TagKind;
  patient: string;
  patientId: string;
  visit: string;
  time: string;
  initials: string;
};

type DoctorCol = {
  id: string;
  name: string;
  spec: string;
  cards: QueueCard[];
};

const initialColumns: DoctorCol[] = [
  {
    id: "d1",
    name: "Dr. Sophia Patel",
    spec: "Orthopedics",
    cards: [
      {
        id: "c1",
        seq: 1,
        appId: "APP-8294",
        tag: "Aqua",
        patient: "Sarah Jenkins",
        patientId: "P-1022",
        visit: "New patient",
        time: "09:30 AM",
        initials: "SJ"
      },
      {
        id: "c2",
        seq: 2,
        appId: "APP-8295",
        tag: "Grey",
        patient: "Michael Chen",
        patientId: "P-1023",
        visit: "Follow up",
        time: "10:00 AM",
        initials: "MC"
      },
      {
        id: "c3",
        seq: 3,
        appId: "APP-8296",
        tag: "Blue",
        patient: "Emily Rodriguez",
        patientId: "P-1024",
        visit: "New patient",
        time: "10:30 AM",
        initials: "ER"
      }
    ]
  },
  {
    id: "d2",
    name: "Dr. Arjun Rao",
    spec: "Cardiology",
    cards: [
      {
        id: "c4",
        seq: 1,
        appId: "APP-8401",
        tag: "Aqua",
        patient: "James Wilson",
        patientId: "P-1101",
        visit: "Follow up",
        time: "09:15 AM",
        initials: "JW"
      },
      {
        id: "c5",
        seq: 2,
        appId: "APP-8402",
        tag: "Grey",
        patient: "Olivia Brown",
        patientId: "P-1102",
        visit: "New patient",
        time: "09:45 AM",
        initials: "OB"
      }
    ]
  },
  {
    id: "d3",
    name: "Dr. Meera Chopra",
    spec: "Endocrinology",
    cards: [
      {
        id: "c6",
        seq: 1,
        appId: "APP-8510",
        tag: "Blue",
        patient: "William Taylor",
        patientId: "P-1200",
        visit: "Follow up",
        time: "11:00 AM",
        initials: "WT"
      }
    ]
  },
  {
    id: "d4",
    name: "Dr. Neha Sharma",
    spec: "Dermatology",
    cards: [
      {
        id: "c7",
        seq: 1,
        appId: "APP-8600",
        tag: "Aqua",
        patient: "Sophia Martinez",
        patientId: "P-1305",
        visit: "New patient",
        time: "08:45 AM",
        initials: "SM"
      },
      {
        id: "c8",
        seq: 2,
        appId: "APP-8601",
        tag: "Grey",
        patient: "David Okonkwo",
        patientId: "P-1306",
        visit: "Follow up",
        time: "09:20 AM",
        initials: "DO"
      }
    ]
  }
];

function tagClass(t: TagKind): string {
  if (t === "Aqua") return "queue-tag queue-tag-aqua";
  if (t === "Grey") return "queue-tag queue-tag-grey";
  return "queue-tag queue-tag-blue";
}

export function QueueBoardPage() {
  const [search, setSearch] = useState("");
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [columns, setColumns] = useState<DoctorCol[]>(initialColumns);

  const visibleCols = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return columns;
    return columns.filter((c) => c.name.toLowerCase().includes(q) || c.spec.toLowerCase().includes(q) || c.id.includes(q));
  }, [search, columns]);

  function removeCard(doctorId: string, cardId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setActionKey(null);
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== doctorId) return col;
        const cards = col.cards.filter((c) => c.id !== cardId).map((c, i) => ({ ...c, seq: i + 1 }));
        return { ...col, cards };
      })
    );
  }

  return (
    <div className="screen-wrap calendar-screen doc-pat-screen queue-page">
      <div className="queue-search-wrap">
        <Search size={18} strokeWidth={2} className="queue-search-ico" aria-hidden />
        <input
          className="queue-search-input"
          placeholder="Search Doctors or IDs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="queue-board">
        {visibleCols.map((col) => (
          <section key={col.id} className="queue-col">
            <header className="queue-col-head">
              <h2 className="queue-doc-name">{col.name}</h2>
              <p className="queue-doc-spec">{col.spec}</p>
            </header>
            <div className="queue-col-cards">
              {col.cards.map((card) => {
                const key = `${col.id}-${card.id}`;
                return (
                  <div key={card.id} className="queue-card-slot">
                    <span className="queue-seq">{card.seq}</span>
                    <div className="queue-card-wrap">
                      <button
                        type="button"
                        className="queue-card"
                        onClick={() => setActionKey(key)}
                        aria-haspopup="dialog"
                        aria-expanded={actionKey === key}
                      >
                        <div className="queue-card-top">
                          <span className="queue-app-id">{card.appId}</span>
                          <div className="queue-card-top-right">
                            <span className={tagClass(card.tag)}>{card.tag}</span>
                            <button
                              type="button"
                              className="queue-trash"
                              aria-label="Remove from queue"
                              onClick={(e) => removeCard(col.id, card.id, e)}
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                        <div className="queue-card-mid">
                          <span className="queue-av">{card.initials}</span>
                          <div>
                            <strong className="queue-pname">{card.patient}</strong>
                            <span className="queue-pid">{card.patientId}</span>
                          </div>
                        </div>
                        <div className="queue-card-bot">
                          <div>
                            <span className="queue-lbl">VISIT INFO</span>
                            <span className="queue-val">{card.visit}</span>
                          </div>
                          <div>
                            <span className="queue-lbl">
                              <Clock3 size={11} strokeWidth={2} /> SCHEDULE
                            </span>
                            <span className="queue-val">{card.time}</span>
                          </div>
                        </div>
                      </button>

                      {actionKey === key && (
                        <div className="queue-card-overlay" role="dialog" aria-label="Queue actions">
                          <div className="queue-overlay-card">
                            <button type="button" className="pill-btn light queue-overlay-cancel" onClick={() => setActionKey(null)}>
                              Cancel
                            </button>
                            <button type="button" className="pill-btn dark pill-btn-navy queue-overlay-send" onClick={() => setActionKey(null)}>
                              Send to doctor
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
