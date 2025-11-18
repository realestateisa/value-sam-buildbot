import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import EmbedDemo from "./pages/EmbedDemo";
import WidgetOnly from "./pages/WidgetOnly";
import NotFound from "./pages/NotFound";
import { ChatWidget } from "./components/ChatWidget";

const queryClient = new QueryClient();

const RouteOverlay = () => {
  const location = useLocation();
  return location.pathname === "/embed-demo" ? <ChatWidget /> : null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/embed-demo" element={<EmbedDemo />} />
          <Route path="/widget" element={<WidgetOnly />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <RouteOverlay />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
