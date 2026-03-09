async function getReportData(id) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://aegisiq-research.netlify.app";

  const res = await fetch(
    `${baseUrl}/.netlify/functions/get-report-summary?id=${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function ReportRequestPage({ params }) {
  const data = await getReportData(params.id);

  if (!data) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <h1>Report Not Found</h1>
          <p>The requested AegisIQ report summary could not be found.</p>
        </div>
      </main>
    );
  }

  const { request, analytics, narrative } = data;

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 24 }}>
        <section style={heroStyle}>
          <div style={badgeStyle}>AegisIQ Research Summary</div>
          <h1 style={{ margin: "12px 0", fontSize: 42 }}>
            {request.ticker} · {request.period} Preliminary Equity View
          </h1>
          <p style={{ margin: 0, fontSize: 18, color: "rgba(255,255,255,0.84)" }}>
            {narrative.headline}
          </p>
        </section>

        <section style={highlightCardStyle}>
          <h2 style={{ marginTop: 0, color: "#0b1f3b" }}>Initial Thesis Snapshot</h2>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "#23344d" }}>
            {narrative.thesis}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
            <MetricCard label="Low Case" value={formatMoney(narrative.targetRange.low)} />
            <MetricCard label="Base Case" value={formatMoney(narrative.targetRange.base)} />
            <MetricCard label="High Case" value={formatMoney(narrative.targetRange.high)} />
          </div>
        </section>

        <section style={grid4}>
          <MetricCard label="Rows Saved" value={String(analytics.rows || 0)} />
          <MetricCard label="Period Return" value={formatPercent(analytics.percentChange)} />
          <MetricCard label="Annualized Volatility" value={formatPercent(analytics.volatilityAnnualized)} />
          <MetricCard label="Trend Signal" value={analytics.trend || "—"} />
        </section>

        <section style={grid4}>
          <MetricCard label="First Close" value={formatMoney(analytics.firstClose)} />
          <MetricCard label="Last Close" value={formatMoney(analytics.lastClose)} />
          <MetricCard label="SMA 20" value={formatMoney(analytics.sma20)} />
          <MetricCard label="SMA 50" value={formatMoney(analytics.sma50)} />
        </section>

        <section style={grid4}>
          <MetricCard label="Highest High" value={formatMoney(analytics.highMax)} />
          <MetricCard label="Lowest Low" value={formatMoney(analytics.lowMin)} />
          <MetricCard label="Average Volume" value={formatWhole(analytics.averageVolume)} />
          <MetricCard label="Range Position" value={formatPercent(analytics.pricePosition)} />
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Close Price Trend</h2>
          <MiniBars />
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Request Metadata</h2>
          <div style={{ display: "grid", gap: 8, color: "#23344d", lineHeight: 1.7 }}>
            <div><strong>Request ID:</strong> {request.id}</div>
            <div><strong>Status:</strong> {request.status}</div>
            <div><strong>Period:</strong> {request.period}</div>
            <div><strong>Original File:</strong> {request.original_filename || "—"}</div>
            <div><strong>Created:</strong> {formatDateTime(request.created_at)}</div>
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
      <div style={{ fontSize: 24, fontWeight: 800, color: "#0b1f3b" }}>{value}</div>
    </div>
  );
}

function MiniBars() {
  const bars = Array.from({ length: 24 }, (_, i) => 30 + ((i * 17) % 120));
  return (
    <div style={{ display: "flex", alignItems: "end", gap: 6, height: 220, paddingTop: 16 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h}px`,
            borderRadius: "8px 8px 0 0",
            background:
              i === bars.length - 1
                ? "linear-gradient(180deg, #2563eb 0%, #0b3d91 100%)"
                : "linear-gradient(180deg, #8db4ff 0%, #5d8fea 100%)",
          }}
        />
      ))}
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

const highlightCardStyle = {
  borderRadius: 20,
  padding: 28,
  background: "white",
  boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
  display: "grid",
  gap: 20,
};

const grid4 = {
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
