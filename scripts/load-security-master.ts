import fs from "node:fs/promises";
import path from "node:path";

import { sql } from "@/lib/db";

type SeedSecurity = {
  id: string;
  symbol: string;
  companyName?: string | null;
  exchange?: string | null;
  country?: string | null;
  currency?: string | null;
  securityType?: string | null;
  sector?: string | null;
  industry?: string | null;
};

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeSymbol(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized ? normalized.toUpperCase() : null;
}

function normalizeRow(input: unknown): SeedSecurity | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const row = input as Record<string, unknown>;
  const id = normalizeText(row.id);
  const symbol = normalizeSymbol(row.symbol);

  if (!id || !symbol) {
    return null;
  }

  return {
    id,
    symbol,
    companyName: normalizeText(row.companyName),
    exchange: normalizeText(row.exchange),
    country: normalizeText(row.country),
    currency: normalizeText(row.currency),
    securityType: normalizeText(row.securityType),
    sector: normalizeText(row.sector),
    industry: normalizeText(row.industry),
  };
}

async function loadSecurityMaster(): Promise<void> {
  const seedPath = path.join(process.cwd(), "data", "security-master.seed.json");
  const raw = await fs.readFile(seedPath, "utf8");
  const parsed = JSON.parse(raw) as unknown[];

  let processed = 0;
  let loaded = 0;
  let skipped = 0;

  for (const item of parsed) {
    processed += 1;

    const row = normalizeRow(item);
    if (!row) {
      skipped += 1;
      continue;
    }

    await sql.unsafe(
      `
        INSERT INTO securities (
          id,
          symbol,
          company_name,
          exchange,
          country,
          currency,
          security_type,
          sector,
          industry,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )
        ON CONFLICT (id)
        DO UPDATE SET
          symbol = EXCLUDED.symbol,
          company_name = EXCLUDED.company_name,
          exchange = EXCLUDED.exchange,
          country = EXCLUDED.country,
          currency = EXCLUDED.currency,
          security_type = EXCLUDED.security_type,
          sector = EXCLUDED.sector,
          industry = EXCLUDED.industry,
          updated_at = NOW()
      `,
      [
        row.id,
        row.symbol,
        row.companyName,
        row.exchange,
        row.country,
        row.currency,
        row.securityType,
        row.sector,
        row.industry,
      ],
    );

    loaded += 1;
  }

  const countRows = await sql.unsafe<Array<{ count: number | string }>>(
    `
      SELECT COUNT(*)::int AS count
      FROM securities
    `,
    [],
  );

  console.log("Security master load complete.");
  console.log(`Processed: ${processed}`);
  console.log(`Loaded: ${loaded}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total securities: ${String(countRows[0]?.count ?? 0)}`);
}

loadSecurityMaster()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("Failed to load security master", error);
    process.exit(1);
  });
