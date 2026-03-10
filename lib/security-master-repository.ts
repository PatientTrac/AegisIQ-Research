import { db } from "@/lib/db";

export type SecurityMasterFilterOptionKey =
  | "sector"
  | "industry"
  | "exchange"
  | "country"
  | "currency"
  | "securityType";

export type SecurityMasterSupportedFilters = Record<
  SecurityMasterFilterOptionKey,
  string[]
>;

export type SecurityMasterRecord = {
  id: string;
  symbol: string;
  companyName?: string | null;
  name?: string | null;
  sector?: string | null;
  industry?: string | null;
  exchange?: string | null;
  country?: string | null;
  currency?: string | null;
  securityType?: string | null;
};

export async function getSecurityMasterCoverageCount(): Promise<number> {
  void db;
  return 0;
}

export async function getSecurityMasterSupportedFilters(): Promise<SecurityMasterSupportedFilters> {
  void db;

  return {
    sector: [],
    industry: [],
    exchange: [],
    country: [],
    currency: [],
    securityType: [],
  };
}

export async function querySecurityMaster(): Promise<SecurityMasterRecord[]> {
  void db;
  return [];
}
