import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CounterPicker from './pages/CounterPicker';
import MatchAnalysis from "./components/MatchAnalysis";

const queryClient = new QueryClient();

const MatchAnalysisPage = () => {
  const { match_id } = useParams<{ match_id: string }>();
  const navigate = useNavigate();

  if (!match_id) {
    return <NotFound />;
  }

  return <MatchAnalysis matchId={match_id} onBack={() => navigate('/')} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/matches/:match_id" element={<MatchAnalysisPage />} />
          <Route path="/counter-picker" element={<CounterPicker />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
