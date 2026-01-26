import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ProfileProvider } from "@/contexts/profile-context";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import PlayPage from "@/pages/play";
import BadgesPage from "@/pages/badges";
import DashboardPage from "@/pages/dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/play" component={PlayPage} />
      <Route path="/badges" component={BadgesPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Starfield() {
  return (
    <div className="starfield">
      <div className="nebula" />
      <div className="galaxy" />
      <div className="stars" />
      <div className="stars-twinkle" />
      <div className="stars-twinkle-2" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="typing-quest-theme">
      <QueryClientProvider client={queryClient}>
        <ProfileProvider>
          <TooltipProvider>
            <Starfield />
            <div className="min-h-screen bg-transparent text-foreground relative z-0">
              <Router />
            </div>
            <Toaster />
          </TooltipProvider>
        </ProfileProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
