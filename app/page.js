"use client";

import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";

export default function HomePage() {
  const [ticker, setTicker] = useState("");
  const [period, setPeriod] = useState("1Y");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");

    if (!ticker.trim()) {
      setStatus("Please enter a ticker.");
      return;
    }

    if (!file) {
      setStatus("Please upload an Excel file.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("ticker", ticker.toUpperCase().trim());
      formData.append("period", period);
      formData.append("file", file);
      formData.append("userId", user?.id || "");
      formData.append("customerEmail", user?.primaryEmailAddress?.emailAddress || "");

      const response = await fetch("/.netlify/functions/create-report-request", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      window.location.href = `/report/${data.requestId}`;
    } catch (error) {
      setStatus(error.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #07111f 0%, #0b1f3b 45%, #123d6b 100%)",
        color: "#ffffff",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gap: "28px" }}>
        <section style={heroStyle}>
          <div style={badgeStyle}>AegisIQ Equity Analysis & Research</div>
          <h1 style={{ fontSize: "46px", lineHeight: 1.05, margin: "0 0 14px 0" }}>
            Private equity research workspace with billing and report ownership.
          </h1>
          <p style={heroTextStyle}>
            Upload historical price data, enrich it with live market inputs, run valuation,
            generate AI reports, and publish institutional-style research.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 22 }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button style={heroPrimaryButton}>Sign in to start</button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <a href="#new-request" style={heroPrimaryLink}>Create New Request</a>
            </SignedIn>

            <a href="/pricing" style={heroSecondaryLink}>View Pricing</a>
            <a href="/dashboard" style={heroSecondaryLink}>Dashboard</a>
          </div>
        </section>

        <SignedOut>
          <section style={panelStyle}>
            <h2 style={{ marginTop: 0, color: "#0b1f3b" }}>Sign in required</h2>
            <p style={{ color: "#24364f", lineHeight: 1.7 }}>
              Sign in to create private reports, save uploads, run AI research generation,
              and access your dashboard.
            </p>
          </section>
        </SignedOut>

        <SignedIn>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr 0.85fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <div id="new-request" style={panelStyle}>
              <h2 style={{ marginTop: 0, fontSize: "28px", color: "#0b1f3b" }}>New Report Request</h2>

              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
                <div>
                  <label htmlFor="ticker" style={labelStyle}>Stock ticker</label>
                  <input
                    id="ticker"
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder="AAPL"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="period" style={labelStyle}>History period</label>
                  <select
                    id="period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="1Y">1 Year</option>
                    <option value="3Y">3 Years</option>
                    <option value="5Y">5 Years</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="excel-file" style={labelStyle}>Investor.com Excel file</label>
                  <input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={fileInputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    marginTop: "6px",
                    padding: "14px 18px",
                    fontSize: "16px",
                    fontWeight: 700,
                    background: submitting ? "#7f8aa3" : "#0b3d91",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Submitting..." : "Generate Report Request"}
                </button>
              </form>

              {status ? (
                <div style={statusStyle}>
                  {status}
                </div>
              ) : null}
            </div>

            <div style={{ display: "grid", gap: "24px" }}>
              <div style={sidePanelStyle}>
                <h3 style={{ marginTop: 0, fontSize: "24px" }}>Your workspace includes</h3>
                <div style={{ display: "grid", gap: "12px", lineHeight: 1.6 }}>
                  <div>Private report ownership</div>
                  <div>Excel upload intake</div>
                  <div>Live market refresh</div>
                  <div>Valuation engine</div>
                  <div>AI research narrative</div>
                  <div>PDF export and publishing</div>
                </div>
              </div>

              <div style={sidePanelStyle}>
                <h3 style={{ marginTop: 0, fontSize: "24px" }}>Next product layer</h3>
                <div style={{ display: "grid", gap: "12px", lineHeight: 1.6 }}>
                  <div>Single-report checkout</div>
                  <div>Pro subscription plan</div>
                  <div>Institutional tier</div>
                  <div>Saved watchlists</div>
                </div>

                <a href="/pricing" style={sideLinkStyle}>
                  Open pricing →
                </a>
              </div>
            </div>
          </section>
        </SignedIn>
      </div>
    </main>
  );
}

const heroStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "20px",
  padding: "36px",
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(8px)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};

const badgeStyle = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.1)",
  fontSize: "12px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: "18px",
};

const heroTextStyle = {
  fontSize: "18px",
  lineHeight: 1.6,
  maxWidth: "820px",
  color: "rgba(255,255,255,0.82)",
  margin: 0,
};

const heroPrimaryButton = {
  padding: "12px 18px",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#0b3d91",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
};

const heroPrimaryLink = {
  display: "inline-block",
  padding: "12px 18px",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#0b3d91",
  textDecoration: "none",
  fontWeight: 700,
};

const heroSecondaryLink = {
  display: "inline-block",
  padding: "12px 18px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.08)",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
  border: "1px solid rgba(255,255,255,0.14)",
};

const panelStyle = {
  borderRadius: "20px",
  padding: "28px",
  background: "#ffffff",
  color: "#0b1f3b",
  boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
};

const sidePanelStyle = {
  borderRadius: "20px",
  padding: "28px",
  background: "rgba(255,255,255,0.08)",
  color: "#ffffff",
  border: "1px solid rgba(255,255,255,0.12)",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  padding: "14px 14px",
  borderRadius: "12px",
  border: "1px solid #c9d4e5",
  fontSize: "16px",
  boxSizing: "border-box",
};

const fileInputStyle = {
  ...inputStyle,
  padding: "12px",
  background: "#ffffff",
};

const statusStyle = {
  marginTop: "18px",
  padding: "14px 16px",
  borderRadius: "12px",
  background: "#edf4ff",
  color: "#103a71",
  fontWeight: 600,
};

const sideLinkStyle = {
  display: "inline-block",
  marginTop: "18px",
  color: "#ffffff",
  fontWeight: 700,
  textDecoration: "none",
};
