import {
  querySecurityMaster,
  type SecurityMasterRecord,
} from "@/lib/security-master-repository";

export type SecurityMasterScreenerFilters = {
  symbol?: string;
  search?: string;
  sector?: string;
  industry?: string;
  exchange?: string;
  country?: string;
  currency?: string;
  securityType?: string;
};

export type RunSecurityMasterScreenerQueryArgs = {
  workspaceId: string;
  filters?: SecurityMasterScreenerFilters;
  limit?: number;
};

export type SecurityMasterScreenerResult = {
  results: SecurityMasterRecord[];
  total: number;
};

function applyLimit(
  records: SecurityMasterRecord[],
  limit?: number,
): SecurityMasterRecord[] {
  if (typeof limit !== "number" || !Number.isFinite(limit) || limit <= 0) {
    return records;
  }

  return records.slice(0, limit);
}

export async function runSecurityMasterScreenerQuery(
  args: RunSecurityMasterScreenerQueryArgs,
): Promise<SecurityMasterScreenerResult> {
  const records = await querySecurityMaster(args.workspaceId);

  const limitedRecords = applyLimit(records, args.limit);

  return {
    results: limitedRecords,
    total: limitedRecords.length,
  };
}

export const runSecurityMasterScreener = runSecurityMasterScreenerQuery;
