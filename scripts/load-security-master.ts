import fs from "node:fs/promises";
import path from "node:path";

import { sql } from "@/lib/db";

type SeedSecurity = {
  id: string;
  symbol: string;
  companyName: string | null;
  exchange: string | null;
  country: string | null;
  currency: string | null;
  securityType: string | null;
  sector: string | null;
  industry: string | null;
};

const BATCH_SIZE = 500;

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

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function upsertBatch(rows: SeedSecurity[]): Promise<void> {
  const values: Array<string | null> = [];
  const tuples: string[] = [];

  for (const row of rows) {
    const base = values.length;

    values.push(
      row.id,
      row.symbol,
      row.companyName,
      row.exchange,
      row.country,
      row.currency,
      row.securityType,
      row.sector,
      row.industry,
    );

    tuples.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, NOW(), NOW())`,
    );
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
      VALUES
        ${tuples.join(",\n")}
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
    values,
  );
}

async function loadSecurityMaster(): Promise<void> {
  const seedPath = path.join(process.cwd(), "data", "security-master.seed.json");
  const raw = await fs.readFile(seedPath, "utf8");
  const parsed = JSON.parse(raw) as unknown[];

  let processed = 0;
  let skipped = 0;

  const validRows: SeedSecurity[] = [];

  for (const item of parsed) {
    processed += 1;

    const row = normalizeRow(item);
    if (!row) {
      skipped += 1;
      continue;
    }

    validRows.push(row);
  }

  const batches = chunkArray(validRows, BATCH_SIZE);

  for (const batch of batches) {
    await upsertBatch(batch);
  }

  const countRows = await sql.unsafe<Array<{ count: number | string }>>(
    `
      SELECT COUNT(*)::int AS count
      FROM securities
    `,
    [],
  );

  console.log("Security master bulk load complete.");
  console.log(`Processed: ${processed}`);
  console.log(`Loaded: ${validRows.length}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Batches: ${batches.length}`);
  console.log(`Total securities: ${String(countRows[0]?.count ?? 0)}`);
}

loadSecurityMaster()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("Failed to bulk load security master", error);
    process.exit(1);
  });
