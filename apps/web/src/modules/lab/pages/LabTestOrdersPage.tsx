import { Check, Clock3, FileText, Search, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/core/http";

type ActiveDialog = "none" | "confirm-collection" | "pending-report";

type StageStatus = "done" | "active" | "pending";

type OrderRow = {
  id: string;
  order_code: string;
  patientName: string;
  orderAt: string;
  eta: string;
  category: string;
  tests: string[];
  sampleId: string;
  sample: StageStatus;
  process: StageStatus;
  report: StageStatus;
};

function stageCircleClass(status: StageStatus) {
  if (status === "done" || status === "active") {
    return "lab-test-stage-circle lab-test-stage-circle-on";
  }
  return "lab-test-stage-circle";
}

export function LabTestOrdersPage() {
  const [dialog, setDialog] = useState<ActiveDialog>("none");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [collectorName, setCollectorName] = useState("");
  const [reportStaff, setReportStaff] = useState("");
  const [ordersData, setOrdersData] = useState<OrderRow[]>([]);

  useEffect(() => {
    apiRequest<
      Array<{
        id: string;
        order_code: string;
        first_name: string;
        last_name: string;
        ordered_at: string;
        eta_at: string;
        category: string;
        tests: string[];
        sample_id: string;
        sample_status: StageStatus;
        process_status: StageStatus;
        report_status: StageStatus;
      }>
    >("/lab/orders")
      .then((rows) =>
        setOrdersData(
          rows.map((row) => ({
            id: row.id,
            order_code: row.order_code,
            patientName: `${row.first_name} ${row.last_name}`,
            orderAt: new Date(row.ordered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            eta: new Date(row.eta_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            category: row.category,
            tests: row.tests,
            sampleId: row.sample_id,
            sample: row.sample_status,
            process: row.process_status,
            report: row.report_status
          }))
        )
      )
      .catch(() => undefined);
  }, []);

  const filteredOrders = useMemo(() => ordersData, [ordersData]);

  return (
    <section className="lab-test-page">
      <header className="lab-test-header">
        <h1 className="lab-test-title">Test Orders</h1>
        <label className="lab-test-search">
          <Search size={15} />
          <input placeholder="Search Patient / Order ID" />
        </label>
      </header>

      <div className="lab-test-list">
        {filteredOrders.map((row) => (
          <article key={row.id} className="lab-test-order-card">
            <div className="lab-test-left">
              <h2>{row.patientName}</h2>
              <p className="lab-test-id"># {row.order_code}</p>
              <p>
                <Clock3 size={13} />
                Order: {row.orderAt}
              </p>
              <p>
                <Clock3 size={13} />
                ETA: {row.eta}
              </p>
              <span className="lab-test-category-label">TEST CATEGORY</span>
              <strong>{row.category}</strong>
            </div>

            <div className="lab-test-center">
              <div className="lab-test-stages">
                <button
                  type="button"
                  className="lab-test-stage"
                  onClick={() => {
                    setActiveOrderId(row.id);
                    setDialog("confirm-collection");
                  }}
                >
                  <span className={stageCircleClass(row.sample)}>
                    <Check size={13} />
                  </span>
                  <strong>Sample</strong>
                  <small>08:20 am</small>
                </button>
                <button type="button" className="lab-test-stage">
                  <span className={stageCircleClass(row.process)}>
                    <Check size={13} />
                  </span>
                  <strong>Process</strong>
                  <small>{row.process === "active" ? "9:30 am" : "Pending"}</small>
                </button>
                <button
                  type="button"
                  className="lab-test-stage"
                  onClick={() => {
                    setActiveOrderId(row.id);
                    setDialog("pending-report");
                  }}
                >
                  <span className={stageCircleClass(row.report)}>
                    <FileText size={13} />
                  </span>
                  <strong>Report</strong>
                  <small>Pending</small>
                </button>
              </div>
            </div>

            <div className="lab-test-right">
              {row.tests.map((testName) => (
                <div key={testName} className="lab-test-item">
                  <span>{testName}</span>
                  <small>{row.sampleId}</small>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {dialog !== "none" ? <button type="button" className="lab-dialog-backdrop" onClick={() => setDialog("none")} /> : null}

      {dialog === "confirm-collection" ? (
        <article className="lab-dialog-card lab-dialog-collection">
          <header>
            <h3>Confirm Collection</h3>
            <button type="button" onClick={() => setDialog("none")} aria-label="Close dialog">
              <X size={14} />
            </button>
          </header>
          <p className="lab-dialog-copy">
            Are you sure you want to mark the CMP sample for Sylvia Plath as collected?
          </p>
          <p className="lab-dialog-copy-muted">
            This action will record the current timestamp and cannot be undone from this view.
          </p>
          <p className="lab-dialog-time">Nov 07, 2023 · 09:37 AM</p>
          <select value={collectorName} onChange={(event) => setCollectorName(event.target.value)}>
            <option value="">Phlebotomist staff name</option>
            <option value="anand">Anand Kulkarni</option>
            <option value="reena">Reena Shah</option>
            <option value="vivek">Vivek Sharma</option>
          </select>
          <button type="button" className="lab-dialog-light-btn" onClick={() => setDialog("none")}>
            Cancel
          </button>
          <button
            type="button"
            className="lab-dialog-dark-btn"
            onClick={async () => {
              if (activeOrderId) {
                await apiRequest(`/lab/orders/${activeOrderId}/stage`, {
                  method: "PATCH",
                  body: { sampleStatus: "done", processStatus: "active" }
                });
                setOrdersData((prev) =>
                  prev.map((order) =>
                    order.id === activeOrderId ? { ...order, sample: "done", process: "active" } : order
                  )
                );
              }
              setDialog("none");
            }}
          >
            Confirm collection &amp; Start Processing
          </button>
        </article>
      ) : null}

      {dialog === "pending-report" ? (
        <article className="lab-dialog-card lab-dialog-report">
          <header>
            <div>
              <p className="lab-report-kicker">Pending Report</p>
              <h3>Eleanor Vance</h3>
              <p className="lab-report-pid">PID-2024-8842</p>
            </div>
            <button type="button" onClick={() => setDialog("none")} aria-label="Close dialog">
              <X size={14} />
            </button>
          </header>
          <div className="lab-report-meta">
            <p>
              <span>TEST NAMES</span>
              Full Blood Count (FBC) with Differential
            </p>
            <p>
              <span>SAMPLE IDS</span>
              SMP-1046/SMP-1069
            </p>
            <p>
              <span>ORDER ID</span>
              ORD-2023108-882
            </p>
          </div>
          <div className="lab-report-controls">
            <p>Report Time: Oct 24, 2023 · 11:50 AM</p>
            <select value={reportStaff} onChange={(event) => setReportStaff(event.target.value)}>
              <option value="">Phlebotomist staff name</option>
              <option value="anand">Anand Kulkarni</option>
              <option value="reena">Reena Shah</option>
              <option value="vivek">Vivek Sharma</option>
            </select>
          </div>
          <div className="lab-report-tabs">
            <button type="button" className="lab-report-tab lab-report-tab-active">
              PDF Result
            </button>
            <button type="button" className="lab-report-tab">
              Image/Scan
            </button>
          </div>
          <label className="lab-report-dropzone">
            <Upload size={18} />
            <strong>Select PDF Document/Image (PDF/PNG,JPEG,JPG)</strong>
            <span>Max size: 10mb *no of files</span>
          </label>
          <ul className="lab-report-files">
            <li>
              <span>CBC/LP ORD-2023108-882.pdf</span>
              <small>RID-100520260098</small>
              <button type="button" aria-label="Remove file">
                <X size={12} />
              </button>
            </li>
            <li>
              <span>Liver function test.png</span>
              <small>RID-100520260098</small>
              <button type="button" aria-label="Remove file">
                <X size={12} />
              </button>
            </li>
            <li>
              <span>2decho.jpeg</span>
              <small>RID-100520260098</small>
              <button type="button" aria-label="Remove file">
                <X size={12} />
              </button>
            </li>
          </ul>
          <button
            type="button"
            className="lab-dialog-submit-btn"
            onClick={async () => {
              if (activeOrderId) {
                await apiRequest(`/lab/orders/${activeOrderId}/stage`, {
                  method: "PATCH",
                  body: { reportStatus: "done", processStatus: "done" }
                });
                setOrdersData((prev) =>
                  prev.map((order) =>
                    order.id === activeOrderId ? { ...order, report: "done", process: "done" } : order
                  )
                );
              }
              setDialog("none");
            }}
          >
            Generate Report &amp; Completed
          </button>
        </article>
      ) : null}
    </section>
  );
}
