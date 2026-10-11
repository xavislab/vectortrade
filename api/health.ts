export async function GET() {
  let database: "ok" | "unconfigured" | "error" = "unconfigured";
  try {
    const [{ getDb }, { sql }] = await Promise.all([import("../server/db.js"), import("drizzle-orm")]);
    const db = await getDb();
    if (db) { await db.execute(sql`select 1`); database = "ok"; }
  } catch (error) {
    console.error("[health] database check failed", error);
    database = "error";
  }
  return Response.json({ ok: true, service: "vectortrade-api", database });
}
