import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import AIFeatures from "./pages/AIFeatures";
import About from "./pages/About";
import Timeline from "./pages/Timeline";
import Contact from "./pages/Contact";
import AthleteIntake from "./pages/AthleteIntake";
import BrandIntake from "./pages/BrandIntake";
import ForUniversities from "./pages/ForUniversities";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/safosportsgroup">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/ai-features" element={<AIFeatures />} />
          <Route path="/about" element={<About />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/athlete-intake" element={<AthleteIntake />} />
          <Route path="/brand-intake" element={<BrandIntake />} />
          <Route path="/for-universities" element={<ForUniversities />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
