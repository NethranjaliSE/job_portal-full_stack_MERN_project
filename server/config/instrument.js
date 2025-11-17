// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node"
import {nodeProfilingIntegration} from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://7f51cfd996306b2ef4cd6cf1ae0e0a5d@o4510373536661504.ingest.us.sentry.io/4510373556781056",
  integrations: [
    nodeProfilingIntegration(),
    Sentry.mongooseIntegration(),
  ],
  //Tracing
  //tracesSampleRate:1.0,//Capture 100% of the transaction

});
 Sentry.profiler.startProfiler();