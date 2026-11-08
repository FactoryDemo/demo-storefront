import { registerOTel } from "@vercel/otel";

/**
 * Called once by Next.js when the server starts. Spans are only exported when
 * an exporter is configured (for example OTEL_EXPORTER_OTLP_ENDPOINT); without
 * one, tracing still runs in-process and log lines carry the trace id.
 */
export function register(): void {
  registerOTel({ serviceName: "bean-and-byte" });
}
