"use client";

import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

export default function HomePage() {
  const [ticker, setTicker] = useState("");
  const { user } = useUser();

  function handleGenerate() {
    if (!ticker) {
      alert("Please enter a ticker symbol");
      return;
    }

    window.location.href = `/report/new?ticker=${ticker}`;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "linear-gradient(135deg,#07111f,#0b1f3b,#123d6b)",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "60px",
        }}
      >
        <h2 style={{ margin: 0 }}>AegisIQ Research</h2>

        {/* LOGIN AREA */}
        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button
                style={{
                  padding: "10px 16px",
                  background: "#ffffff",
                  color: "#0b3d91",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "46px", marginBottom: "20px" }}>
          AegisIQ Equity Analysis & Research
        </h1>

        <p
          style={{
            fontSize: "20px",
            opacity: 0.85,
            marginBottom: "40px",
          }}
        >
          AI-powered institutional equity research platform.
        </p>

        {/* TICKER INPUT */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Enter ticker (AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            style={{
              padding: "14px",
              fontSize: "16px",
              borderRadius: "6px",
              border: "none",
              width: "260px",
            }}
          />

          <button
            onClick={handleGenerate}
            style={{
              padding: "14px 20px",
              fontSize: "16px",
              background: "#0B3D91",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Generate Research Report
          </button>
        </div>

        {/* USER INFO IF LOGGED IN */}
        <SignedIn>
          <p style={{ opacity: 0.8 }}>
            Logged in as {user?.primaryEmailAddress?.emailAddress}
          </p>
        </SignedIn>
      </section>
    </main>
  );
}
