import { AppInsightsContext, AppInsightsErrorBoundary, ReactPlugin } from "@microsoft/applicationinsights-react-js";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import type { ReactNode } from "react";

const reactPlugin = new ReactPlugin();
const ErrorFallback = () => <h1>Something went wrong, please try again</h1>;

export interface AppInsightsProviderProps {
  children: ReactNode;
}

export function ApplicationInsightsProvider({ children }: Readonly<AppInsightsProviderProps>) {
  return (
    <AppInsightsErrorBoundary onError={ErrorFallback} appInsights={reactPlugin}>
      <AppInsightsContext.Provider value={reactPlugin}>{children}</AppInsightsContext.Provider>
    </AppInsightsErrorBoundary>
  );
}

const applicationInsights = new ApplicationInsights({
  config: {
    // Set the application ID to the webapp and application
    appId: import.meta.build_env.APPLICATION_ID,
    // Set the instrumentation key to a dummy value as we are not using the default endpoint
    instrumentationKey: "webapp",
    disableInstrumentationKeyValidation: true,
    // Set the endpoint URL to our custom endpoint
    endpointUrl: `/${import.meta.runtime_env.SYSTEM_NAME}/api/track`,
    // Enable auto route tracking for React Router
    enableAutoRouteTracking: true,
    // Instrument error tracking
    autoExceptionInstrumented: true,
    autoUnhandledPromiseInstrumented: true,
    // Disable the page view tracking as we are not using the metrics
    autoTrackPageVisitTime: false,
    // Disable the beacon API we only support the fetch API
    isBeaconApiDisabled: true,
    extensions: [reactPlugin],
    // Disable dependency tracking
    disableFetchTracking: true,
    disableAjaxTracking: true,
    // Disable the unload event as it is not best practice
    disablePageUnloadEvents: ["unload"],
    extensionConfig: {
      AppInsightsCfgSyncPlugin: {
        // this will block fetching from default cdn
        cfgUrl: ""
      }
    }
  }
});

// Load the Application Insights script
applicationInsights.loadAppInsights();
// Track the initial page view
applicationInsights.trackPageView();
