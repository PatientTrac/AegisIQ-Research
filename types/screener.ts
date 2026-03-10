export type ScreenerNumericRange = {
  min: number | null;
  max: number | null;
};

export type ScreenerFilters = {
  queryText: string;
  sector: string | null;
  industry: string | null;
  country: string | null;
  exchange: string | null;
  marketCap: ScreenerNumericRange;
  price: ScreenerNumericRange;
  peRatio: ScreenerNumericRange;
};

export type ScreenerFilterFieldSupport = {
  key:
    | "queryText"
    | "sector"
    | "industry"
    | "country"
    | "exchange"
    | "marketCap"
    | "price"
    | "peRatio";
  label: string;
  supported: boolean;
  reason?: string;
};

export type ScreenerSupportedFilterMetadata = {
  dataSource: string;
  supportsCompanyName: boolean;
  supportsSector: boolean;
  supportsIndustry: boolean;
  supportsCountry: boolean;
  supportsExchange: boolean;
  supportsMarketCap: boolean;
  supportsPrice: boolean;
  supportsPeRatio: boolean;
  fields: ScreenerFilterFieldSupport[];
};

export type ScreenerResultRow = {
  symbol: string;
  companyName: string | null;
  sector: string | null;
  industry: string | null;
  country: string | null;
  exchange: string | null;
  marketCap: number | null;
  price: number | null;
  peRatio: number | null;
};

export type ScreenerRunRequest = {
  filters: ScreenerFilters;
  limit?: number;
};

export type ScreenerRunResponse = {
  ok: boolean;
  filters: ScreenerFilters;
  results: ScreenerResultRow[];
  total: number;
  limit: number;
  metadata: ScreenerSupportedFilterMetadata & {
    appliedFilters: string[];
    unsupportedRequestedFilters: string[];
    message: string;
  };
  error?: string;
};

export type ScreenerPresetRecord = {
  id: string;
  name: string;
  filters: ScreenerFilters;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type WatchlistOption = {
  id: string;
  name: string;
};

export const EMPTY_SCREENER_FILTERS: ScreenerFilters = {
  queryText: "",
  sector: null,
  industry: null,
  country: null,
  exchange: null,
  marketCap: { min: null, max: null },
  price: { min: null, max: null },
  peRatio: { min: null, max: null },
};
