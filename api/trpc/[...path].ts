async function diagnoseRouterImport() {
  try {
    const module = await import("../../server/routers");
    return Response.json({ ok: true, router: Boolean(module.appRouter) });
  } catch (error) {
    console.error("[tRPC] router import failed", error);
    return Response.json({ ok: false, error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined }, { status: 500 });
  }
}

export function GET() {
  return diagnoseRouterImport();
}

export function POST() {
  return diagnoseRouterImport();
}
