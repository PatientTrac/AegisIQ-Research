CREATE TABLE IF NOT EXISTS securities (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  company_name TEXT NULL,
  exchange TEXT NULL,
  country TEXT NULL,
  currency TEXT NULL,
  security_type TEXT NULL,
  sector TEXT NULL,
  industry TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS securities_symbol_idx
  ON securities (symbol);

CREATE INDEX IF NOT EXISTS securities_exchange_idx
  ON securities (exchange);

CREATE INDEX IF NOT EXISTS securities_country_idx
  ON securities (country);

CREATE INDEX IF NOT EXISTS securities_currency_idx
  ON securities (currency);

CREATE INDEX IF NOT EXISTS securities_security_type_idx
  ON securities (security_type);

CREATE INDEX IF NOT EXISTS securities_sector_idx
  ON securities (sector);

CREATE INDEX IF NOT EXISTS securities_industry_idx
  ON securities (industry);
