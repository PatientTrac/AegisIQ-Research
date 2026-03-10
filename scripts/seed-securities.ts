import { sql } from "@/lib/db";

type SeedSecurity = {
  id: string;
  symbol: string;
  companyName: string;
  exchange: string;
  country: string;
  currency: string;
  securityType: string;
  sector: string;
  industry: string;
};

const SEED_SECURITIES: SeedSecurity[] = [
  {
    id: "sec_aapl",
    symbol: "AAPL",
    companyName: "Apple Inc.",
    exchange: "NASDAQ",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Technology",
    industry: "Consumer Electronics",
  },
  {
    id: "sec_msft",
    symbol: "MSFT",
    companyName: "Microsoft Corporation",
    exchange: "NASDAQ",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Technology",
    industry: "Software",
  },
  {
    id: "sec_nvda",
    symbol: "NVDA",
    companyName: "NVIDIA Corporation",
    exchange: "NASDAQ",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Technology",
    industry: "Semiconductors",
  },
  {
    id: "sec_googl",
    symbol: "GOOGL",
    companyName: "Alphabet Inc.",
    exchange: "NASDAQ",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Communication Services",
    industry: "Internet Content & Information",
  },
  {
    id: "sec_amzn",
    symbol: "AMZN",
    companyName: "Amazon.com, Inc.",
    exchange: "NASDAQ",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Consumer Discretionary",
    industry: "Internet Retail",
  },
  {
    id: "sec_meta",
    symbol: "META",
    companyName: "Meta Platforms, Inc.",
    exchange: "NASDAQ",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Communication Services",
    industry: "Internet Content & Information",
  },
  {
    id: "sec_tsla",
    symbol: "TSLA",
    companyName: "Tesla, Inc.",
    exchange: "NASDAQ",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Consumer Discretionary",
    industry: "Auto Manufacturers",
  },
  {
    id: "sec_brkb",
    symbol: "BRK.B",
    companyName: "Berkshire Hathaway Inc.",
    exchange: "NYSE",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Financial Services",
    industry: "Insurance - Diversified",
  },
  {
    id: "sec_jpm",
    symbol: "JPM",
    companyName: "JPMorgan Chase & Co.",
    exchange: "NYSE",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Financial Services",
    industry: "Banks - Diversified",
  },
  {
    id: "sec_v",
    symbol: "V",
    companyName: "Visa Inc.",
    exchange: "NYSE",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Financial Services",
    industry: "Credit Services",
  },
  {
    id: "sec_ma",
    symbol: "MA",
    companyName: "Mastercard Incorporated",
    exchange: "NYSE",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Financial Services",
    industry: "Credit Services",
  },
  {
    id: "sec_xom",
    symbol: "XOM",
    companyName: "Exxon Mobil Corporation",
    exchange: "NYSE",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Energy",
    industry: "Oil & Gas Integrated",
  },
  {
    id: "sec_cvx",
    symbol: "CVX",
    companyName: "Chevron Corporation",
    exchange: "NYSE",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Energy",
    industry: "Oil & Gas Integrated",
  },
  {
    id: "sec_ko",
    symbol: "KO",
    companyName: "The Coca-Cola Company",
    exchange: "NYSE",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Consumer Defensive",
    industry: "Beverages - Non-Alcoholic",
  },
  {
    id: "sec_pep",
    symbol: "PEP",
    companyName: "PepsiCo, Inc.",
    exchange: "NASDAQ",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Consumer Defensive",
    industry: "Beverages - Non-Alcoholic",
  },
  {
    id: "sec_unh",
    symbol: "UNH",
    companyName: "UnitedHealth Group Incorporated",
    exchange: "NYSE",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Healthcare",
    industry: "Healthcare Plans",
  },
  {
    id: "sec_jnj",
    symbol: "JNJ",
    companyName: "Johnson & Johnson",
    exchange: "NYSE",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Healthcare",
    industry: "Drug Manufacturers - General",
  },
  {
    id: "sec_pfe",
    symbol: "PFE",
    companyName: "Pfizer Inc.",
    exchange: "NYSE",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Healthcare",
    industry: "Drug Manufacturers - General",
  },
  {
    id: "sec_lly",
    symbol: "LLY",
    companyName: "Eli Lilly and Company",
    exchange: "NYSE",
    country: "United States",
    currency: "USD",
    securityType: "Equity",
    sector: "Healthcare",
    industry: "Drug Manufacturers - General",
  }
];

async function seedSecurities(): Promise<void> {
  for (const security of SEED_SECURITIES) {
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
          $1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW()
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
        security.id,
        security.symbol,
        security.companyName,
        security.exchange,
        security.country,
        security.currency,
        security.securityType,
        security.sector,
        security.industry
      ]
    );
  }

  const result = await sql.unsafe<Array<{ count: number | string }>>(
    `SELECT COUNT(*)::int AS count FROM securities`,
    []
  );

  console.log(`Seed complete. securities count = ${String(result[0]?.count ?? 0)}`);
}

seedSecurities()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("Failed to seed securities", error);
    process.exit(1);
  });
