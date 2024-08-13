import swagger from "@elysiajs/swagger";
import { config } from "../infrastructure/config";

export const swaggerPlugin = swagger({
  documentation: {
    info: {
      title: `API ${config.system.name}`,
      version: config.env.APPLICATION_VERSION,
      description: `API for ${config.system.name}?`
    }
  },
  exclude: [/^\/internal\//, /^\/[-a-z0-9]+\/api\/(track|swagger)/]
});
