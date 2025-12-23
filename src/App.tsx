import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import EmbedDemo from "./pages/EmbedDemo";
import EmbedDemoCreekside from "./pages/EmbedDemoCreekside";
import WidgetHost from "./pages/WidgetHost";
import NotFound from "./pages/NotFound";
import { ChatWidget } from "./components/ChatWidget";
import { ChatWidgetCreekside } from "./components/ChatWidgetCreekside";

const queryClient = new QueryClient();

const RouteOverlay = () => {
  const location = useLocation();
  if (location.pathname === "/embed-demo") return <ChatWidget />;
  if (location.pathname === "/embed-demo-creekside") {
    return (
      <div className="creekside-theme">
        <style>{`
          .creekside-theme {
            --primary: 130 15% 32%;
            --primary-foreground: 0 0% 100%;
            --accent: 130 15% 32%;
            --accent-foreground: 0 0% 100%;
            --ring: 130 15% 32%;
            --chat-shadow: 0 4px 24px rgba(70, 94, 76, 0.15);
          }
        `}</style>
        <ChatWidgetCreekside />
      </div>
    );
  }
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/embed-demo" replace />} />
          <Route path="/embed-demo" element={<EmbedDemo />} />
          <Route path="/embed-demo-creekside" element={<EmbedDemoCreekside />} />
          <Route path="/widget" element={<WidgetHost />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <RouteOverlay />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
