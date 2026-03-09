"use client";

import { useEffect, useState } from "react";

export default function ReportPage({ params }) {
const [data, setData] = useState(null);
const [aiReport, setAiReport] = useState("");
const [loading, setLoading] = useState(false);

const id = params.id;

useEffect(() => {
loadReport();
}, []);

async function loadReport() {
const res = await fetch(`/.netlify/functions/get-report-summary?id=${id}`);
const json = await res.json();
setData(json);
}

async function generateAIReport() {
setLoading(true);

```
const res = await fetch(`/.netlify/functions/generate-report?id=${id}`);
const json = await res.json();

setAiReport(json.report || "No report generated.");
setLoading(false);
```

}

if (!data) {
return ( <main style={pageStyle}> <div style={cardStyle}> <h2>Loading report...</h2> </div> </main>
);
}

const { request, analytics } = data;

return ( <main style={pageStyle}>
<div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 24 }}>

```
    <section style={heroStyle}>
      <h1 style={{ margin: 0 }}>
        {request.ticker} Research Summary
      </h1>

      <p style={{ marginTop: 10 }}>
        Period: {request.period} | Rows Uploaded: {analytics.rows}
      </p>
    </section>

    <section style={gridStyle}>
      <Metric label="First Close" value={formatMoney(analytics.firstClose)} />
      <Metric label="Last Close" value={formatMoney(analytics.lastClose)} />
      <Metric label="Return %" value={formatPercent(analytics.percentChange)} />
      <Metric label="Volatility" value={formatPercent(analytics.volatilityAnnualized)} />
    </section>

    <section style={gridStyle}>
      <Metric label="SMA 20" value={formatMoney(analytics.sma20)} />
      <Metric label="SMA 50" value={formatMoney(analytics.sma50)} />
      <Metric label="Highest High" value={formatMoney(analytics.highMax)} />
      <Metric label="Lowest Low" value={formatMoney(analytics.lowMin)} />
    </section>

    <section style={cardStyle}>
      <h2>AI Equity Research Report</h2>

      <button
        onClick={generateAIReport}
        style={buttonStyle}
      >
        {loading ? "Generating..." : "Generate AI Research Report"}
      </button>

      {aiReport && (
        <div style={reportBoxStyle}>
          <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {aiReport}
          </pre>
        </div>
      )}
    </section>

  </div>
</main>
```

);
}

function Metric({ label, value }) {
return ( <div style={metricCardStyle}>
<div style={{ fontSize: 12, color: "#6b7a90" }}>{label}</div>
<div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div> </div>
);
}

function formatMoney(v) {
const n = Number(v);
if (!Number.isFinite(n)) return "—";
return new Intl.NumberFormat("en-US", {
style: "currency",
currency: "USD"
}).format(n);
}

function formatPercent(v) {
const n = Number(v);
if (!Number.isFinite(n)) return "—";
return `${n.toFixed(2)}%`;
}

const pageStyle = {
minHeight: "100vh",
padding: 40,
background: "linear-gradient(135deg,#07111f,#0b1f3b)"
};

const heroStyle = {
color: "white",
padding: 30,
borderRadius: 20,
background: "rgba(255,255,255,0.08)"
};

const gridStyle = {
display: "grid",
gridTemplateColumns: "repeat(4,1fr)",
gap: 16
};

const cardStyle = {
background: "white",
padding: 28,
borderRadius: 18
};

const metricCardStyle = {
background: "white",
padding: 20,
borderRadius: 16
};

const buttonStyle = {
marginTop: 10,
padding: "12px 18px",
fontSize: 16,
background: "#0b3d91",
color: "white",
border: "none",
borderRadius: 8,
cursor: "pointer"
};

const reportBoxStyle = {
marginTop: 20,
padding: 20,
background: "#f6f8fb",
borderRadius: 10
};
