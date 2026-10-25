try {
  process.loadEnvFile();
} catch {
  // no .env file; fall back to defaults
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  upstreamUrl: process.env.UPSTREAM_URL ?? "https://jsonplaceholder.typicode.com",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
