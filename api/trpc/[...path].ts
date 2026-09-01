import { appRouter } from "../../server/routers";

export function GET() {
  return Response.json({ ok: true, route: "trpc", router: Boolean(appRouter) });
}

export function POST() {
  return Response.json({ ok: true, route: "trpc", router: Boolean(appRouter) });
}
