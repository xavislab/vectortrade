export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  adminAccessCode: process.env.ADMIN_ACCESS_CODE ?? "",
  twelveDataApiKey: process.env.TWELVE_DATA_API_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
