async function getReportRequest(id) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://aegisiq-research.netlify.app";

  const res = await fetch(
    `${baseUrl}/.netlify/functions/get-report-request?id=${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function ReportRequestPage({ params }) {
  const data = await getReportRequest(params.id);

  if (!data) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <h1>Report Request Not Found</h1>
          <p>The requested AegisIQ report intake record could not be found.</p>
        </div>
      </main>
    );
  }

  const { request, summary, history } = data;

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 24 }}>
        <section style={heroStyle}>
          <div style={badgeStyle}>AegisIQ Research Intake</div>
          <h1 style={{ margin: "10px 0 12px 0", fontSize: 42 }}>
            {request.ticker} · {request.period} Upload Summary
          </h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", fontSize: 18 }}>
            Uploaded file: {request.original_filename || "n/a"} · Status:{" "}
            {request.status}
          </p>
        </section>

        <section style={gridStyle}>
          <MetricCard label="Request ID" value={String(request.id)} />
          <MetricCard label="Rows Saved" value={String(summary.rows || 0)} />
          <MetricCard
            label="Period Return"
            value={formatPercent(summary.percentChange)}
          />
          <MetricCard
            label="Price Change"
            value={formatNumber(summary.absoluteChange)}
          />
        </section>

        <section style={gridStyle}>
          <MetricCard label="Start Date" value={formatDate(summary.firstDate)} />
          <MetricCard label="End Date" value={formatDate(summary.lastDate)} />
          <MetricCard label="First Close" value={formatMoney(summary.firstClose)} />
          <MetricCard label="Last Close" value={formatMoney(summary.lastClose)} />
        </section>

        <section style={gridStyle}>
          <MetricCard label="Highest High" value={formatMoney(summary.highMax)} />
          <MetricCard label="Lowest Low" value={formatMoney(summary.lowMin)} />
          <MetricCard
            label="Average Volume"
            value={formatWhole(summary.averageVolume)}
          />
          <MetricCard label="Created At" value={formatDateTime(request.created_at)} />
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Close Price Snapshot</h2>
          <MiniBars rows={history.slice(-30)} />
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Recent Daily History</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Open</th>
                  <th>High</th>
                  <th>Low</th>
                  <th>Close</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-20).reverse().map((row, index) => (
                  <tr key={`${row.trade_date}-${index}`}>
                    <td>{formatDate(row.trade_date)}</td>
                    <td>{formatMoney(row.open)}</td>
                    <td>{formatMoney(row.high)}</td>
                    <td>{formatMoney(row.low)}</td>
                    <td>{formatMoney(row.close)}</td>
                    <td>{formatWhole(row.volume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <div style={{ fontSize: 13, color: "#5d6b82", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#0b1f3b" }}>{value}</div>
    </div>
  );
}

function MiniBars({ rows }) {
  if (!rows.length) {
    return <p>No history available.</p>;
  }

  const closes = rows.map((r) => Number(r.close)).filter((n) => Number.isFinite(n));
  const max = Math.max(...closes);
  const min = Math.min(...closes);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "end",
        gap: 6,
        height: 220,
        paddingTop: 16,
      }}
    >
      {rows.map((row, index) => {
        const close = Number(row.close);
        const normalized = max === min ? 0.5 : (close - min) / (max - min);
        const height = `${Math.max(12, normalized * 180 + 20)}px`;

        return (
          <div
            key={`${row.trade_date}-${index}`}
            title={`${row.trade_date}: ${formatMoney(row.close)}`}
            style={{
              flex: 1,
              height,
              borderRadius: "8px 8px 0 0",
              background:
                index === rows.length - 1
                  ? "linear-gradient(180deg, #2563eb 0%, #0b3d91 100%)"
                  : "linear-gradient(180deg, #8db4ff 0%, #5d8fea 100%)",
            }}
          />
        );
      })}
    </div>
  );
}

function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(n);
}

function formatWhole(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(2)}%`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US");
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-US");
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #07111f 0%, #0b1f3b 45%, #123d6b 100%)",
  padding: "40px 20px",
};

const heroStyle = {
  borderRadius: 22,
  padding: 32,
  color: "white",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const badgeStyle = {
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.12)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 18,
};

const cardStyle = {
  borderRadius: 20,
  padding: 28,
  background: "white",
  boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
};

const metricCardStyle = {
  borderRadius: 18,
  padding: 22,
  background: "white",
  boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
};

const sectionTitleStyle = {
  marginTop: 0,
  color: "#0b1f3b",
  fontSize: 26,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};
