import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  children: ReactNode;
};

export function Panel({ title, children }: PanelProps) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 16
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </section>
  );
}
