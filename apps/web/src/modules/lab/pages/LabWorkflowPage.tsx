import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { apiRequest } from "@/core/http";

const workflowTabs = [
  { id: "ordered", label: "Ordered", heading: "ORDERED (3)" },
  { id: "sample", label: "Sample Collected", heading: "SAMPLEE COLLECTED (3)" },
  { id: "processing", label: "Processing", heading: "PROCESSING (3)" },
  { id: "completed", label: "Completed", heading: "COMPLETED AND REPORTS GENERATED (3)" }
] as const;

type LabOrder = {
  id: string;
  order_code: string;
  category: string;
  tests: string[];
  first_name: string;
  last_name: string;
  sample_status: "pending" | "active" | "done";
  process_status: "pending" | "active" | "done";
  report_status: "pending" | "active" | "done";
};

export function LabWorkflowPage() {
  const [activeTab, setActiveTab] = useState<(typeof workflowTabs)[number]["id"]>("ordered");
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [stats, setStats] = useState({
    reports_completed: 0,
    in_processing: 0,
    pending_orders: 0,
    total_today: 0
  });

  useEffect(() => {
    apiRequest<LabOrder[]>("/lab/orders")
      .then(setOrders)
      .catch(() => undefined);
    apiRequest<{ reports_completed: number; in_processing: number; pending_orders: number; total_today: number }>("/dashboard/lab")
      .then(setStats)
      .catch(() => undefined);
  }, []);

  const activeConfig = workflowTabs.find((item) => item.id === activeTab) ?? workflowTabs[0];

  const rows = useMemo(() => {
    return orders
      .filter((order) => {
        if (activeTab === "ordered") return order.sample_status === "pending";
        if (activeTab === "sample") return order.sample_status === "done" || order.process_status === "active";
        if (activeTab === "processing") return order.process_status === "active";
        return order.report_status === "done";
      })
      .map((order) => ({
        id: order.order_code,
        patient: `${order.first_name} ${order.last_name}`,
        tests: order.category
      }));
  }, [activeTab, orders]);

  return (
    <section className="lab-workflow-page">
      <h1 className="lab-screen-title">Workflow</h1>
      <div className="lab-workflow-tabs">
        {workflowTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? "lab-workflow-tab lab-workflow-tab-active" : "lab-workflow-tab"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="lab-workflow-grid">
        <article className="lab-workflow-list-card">
          <p className="lab-workflow-list-head">{activeConfig.heading}</p>
          <div className="lab-workflow-list">
            {rows.map((row) => (
              <div key={row.id} className="lab-workflow-row">
                <div>
                  <p className="lab-workflow-patient">{row.patient}</p>
                  <p className="lab-workflow-tests">{row.tests}</p>
                  {activeTab === "sample" ? (
                    <p className="lab-workflow-subcopy">Sample Collected by Name</p>
                  ) : null}
                </div>
                <span className="lab-workflow-order-id">
                  <FileText size={13} />
                  {row.id.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </article>

        <aside className="lab-stats-column">
          {[
            { title: "Reports Completed", value: stats.reports_completed },
            { title: "Total In-processing", value: stats.in_processing },
            { title: "Total Pending Orders", value: stats.pending_orders },
            { title: "Total Tests Today", value: stats.total_today }
          ].map((item) => (
            <div key={item.title} className="lab-stat-card">
              <p>{item.title}</p>
              <strong>{item.value}</strong>
              <div>
                <span>{item.value}</span>
                <span>0</span>
                <span>0</span>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
