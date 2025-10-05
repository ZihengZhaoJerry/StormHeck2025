import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/PerfoermerDashBoard";
import UserRequestPage from "@/pages/UserRequestPage";
import LoginPage from "@/pages/LoginPage";
import QRCodePage from "@/pages/QRCodePage";
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={() => (
          <LoginPage />
        )}/>
      <Route path="/" component={() => (
        <ProtectedRoute>
          <LandingPage />
        </ProtectedRoute>
      )} />
      <Route path="/request" component={() => (
        <UserRequestPage />
      )} />
      <Route path="/performer" component={() => (
        <ProtectedRoute>
          <PerformerDashboard />
        </ProtectedRoute>
      )} />
      <Route path="/qr-code" component={() => (
        <QRCodePage />
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
