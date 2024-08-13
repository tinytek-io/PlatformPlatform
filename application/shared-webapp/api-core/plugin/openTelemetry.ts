import { Elysia } from "elysia";
import { opentelemetry } from "@elysiajs/opentelemetry";

import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { config } from "../infrastructure/config";

export const openTelemetryPlugin = new Elysia({
  name: "open-telemetry-plugin"
}).use(
  opentelemetry({
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          // url: config.env.OTEL_EXPORTER_OTLP_ENDPOINT
        })
      )
    ]
  })
);
