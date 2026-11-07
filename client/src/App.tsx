import { lazy, Suspense, useEffect } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { SiteFooter } from "./components/SiteFooter";
import { SiteNav } from "./components/SiteNav";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Everything but the landing page loads on demand.
const Docs = lazy(() => import("./pages/Docs"));
const Benchmarks = lazy(() => import("./pages/Benchmarks"));
const Downloads = lazy(() => import("./pages/Downloads"));

/**
 * wouter navigates with history.pushState, which never scrolls. Scroll to the top on
 * page changes, or to the element named by the #fragment once it exists (it may be
 * inside a page that is still loading).
 */
function useScrollOnNavigate() {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const onNavigate = () => {
      clearInterval(timer);
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) {
        window.scrollTo(0, 0);
        return;
      }
      let tries = 0;
      const attempt = () => {
        const target = document.getElementById(id);
        target?.scrollIntoView({ block: "start" });
        return target !== null || ++tries > 60;
      };
      if (!attempt()) {
        timer = setInterval(() => {
          if (attempt()) clearInterval(timer);
        }, 50);
      }
    };
    onNavigate();
    window.addEventListener("pushState", onNavigate);
    window.addEventListener("hashchange", onNavigate);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pushState", onNavigate);
      window.removeEventListener("hashchange", onNavigate);
    };
  }, []);
}

function Router() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/docs" component={Docs} />
        <Route path="/benchmarks" component={Benchmarks} />
        <Route path="/downloads" component={Downloads} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  useScrollOnNavigate();
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <SiteNav />
          <main className="flex-1">
            <Router />
          </main>
          <SiteFooter />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
