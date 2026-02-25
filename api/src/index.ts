import { router } from "./routes";

const PORT = Number(process.env.APP_PORT) || 3000;

Bun.serve({
  port: PORT,
  async fetch(req) {
    const response = await router(req);
    return response ?? new Response(null, { status: 404 });
  },
});

console.log(`Server running on port ${PORT}`);
