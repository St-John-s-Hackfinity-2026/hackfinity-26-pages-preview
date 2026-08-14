import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import OrganizerDashboard from "./pages/OrganizerDashboard";

const STATIC_PREVIEW_BASE = import.meta.env.VITE_STATIC_PREVIEW === "true" ? "/hackfinity-26-pages-preview" : "";
const IS_STATIC_PREVIEW_HOME =
  STATIC_PREVIEW_BASE.length > 0 &&
  typeof window !== "undefined" &&
  (window.location.pathname === STATIC_PREVIEW_BASE || window.location.pathname === `${STATIC_PREVIEW_BASE}/`);
const IS_STATIC_ORGANIZER_VIEW =
  IS_STATIC_PREVIEW_HOME &&
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("view") === "organizer";

function SiteRoutes() {
  // make sure to consider if you need authentication for certain routes
  if (IS_STATIC_ORGANIZER_VIEW) return <OrganizerDashboard />;
  if (IS_STATIC_PREVIEW_HOME) return <Home />;

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/organizer"} component={OrganizerDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <WouterRouter base={STATIC_PREVIEW_BASE}>
            <SiteRoutes />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
