import * as logsAPI from "@opentelemetry/api-logs";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { WinstonInstrumentation } from "@opentelemetry/instrumentation-winston";
import { ConsoleLogRecordExporter, LoggerProvider, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { createLogger, format, transports } from "winston";
import { config } from "./config";

const tracerProvider = new NodeTracerProvider();
tracerProvider.register();

const loggerProvider = new LoggerProvider();

loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(new ConsoleLogRecordExporter()));
logsAPI.logs.setGlobalLoggerProvider(loggerProvider);

registerInstrumentations({
  instrumentations: [new WinstonInstrumentation()]
});

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: config.isDevelopment ? format.combine(format.colorize(), format.simple()) : format.simple()
    })
  ],
  defaultMeta: { system: config.system.name, component: config.system.type }
});
