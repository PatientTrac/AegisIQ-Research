import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const securityMaster = pgTable(
  "security_master",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: text("workspace_id").notNull(),
    symbol: text("symbol").notNull(),
    companyName: text("company_name").notNull(),
    exchange: text("exchange"),
    sector: text("sector"),
    industry: text("industry"),
    country: text("country"),
    currency: text("currency"),
    securityType: text("security_type").notNull().default("equity"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    workspaceSymbolUnique: uniqueIndex(
      "security_master_workspace_symbol_unique"
    ).on(table.workspaceId, table.symbol),
    workspaceIdx: index("security_master_workspace_idx").on(table.workspaceId),
    workspaceSymbolIdx: index("security_master_workspace_symbol_idx").on(
      table.workspaceId,
      table.symbol
    ),
    workspaceCompanyIdx: index("security_master_workspace_company_idx").on(
      table.workspaceId,
      table.companyName
    ),
    workspaceSectorIdx: index("security_master_workspace_sector_idx").on(
      table.workspaceId,
      table.sector
    ),
    workspaceIndustryIdx: index("security_master_workspace_industry_idx").on(
      table.workspaceId,
      table.industry
    ),
    workspaceCountryIdx: index("security_master_workspace_country_idx").on(
      table.workspaceId,
      table.country
    ),
    workspaceExchangeIdx: index("security_master_workspace_exchange_idx").on(
      table.workspaceId,
      table.exchange
    ),
    workspaceSecurityTypeIdx: index(
      "security_master_workspace_security_type_idx"
    ).on(table.workspaceId, table.securityType),
    workspaceActiveIdx: index("security_master_workspace_active_idx").on(
      table.workspaceId,
      table.isActive
    ),
  })
);

export type SecurityMaster = typeof securityMaster.$inferSelect;
export type NewSecurityMaster = typeof securityMaster.$inferInsert;
