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
import MarketingDraft from "./pages/MarketingDraft";
import AthleteIntake from "./pages/AthleteIntake";
import BrandIntake from "./pages/BrandIntake";
import ForUniversities from "./pages/ForUniversities";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Admin from "./pages/Admin";
import BrandDashboard from "./pages/BrandDashboard";
import BrandProfile from "./pages/BrandProfile";
import AthleteDashboard from "./pages/AthleteDashboard";
import AthleteProfile from "./pages/AthleteProfile";
import NotFound from "./pages/NotFound";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedAthleteRoute from "./components/ProtectedAthleteRoute";
import ProtectedBrandRoute from "./components/ProtectedBrandRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MarketingDraft page="home" />} />
          <Route path="/about" element={<MarketingDraft page="about" />} />
          <Route path="/how-it-works" element={<MarketingDraft page="services" />} />
          <Route path="/services" element={<MarketingDraft page="services" />} />
          <Route path="/ai-features" element={<MarketingDraft page="ai" />} />
          <Route path="/safo-ai" element={<MarketingDraft page="ai" />} />
          <Route path="/timeline" element={<MarketingDraft page="about" />} />
          <Route path="/for-universities" element={<MarketingDraft page="brands" />} />
          <Route path="/for-brands" element={<MarketingDraft page="brands" />} />
          <Route path="/roster" element={<MarketingDraft page="roster" />} />
          <Route path="/news" element={<MarketingDraft page="news" />} />
          <Route path="/contact" element={<MarketingDraft page="contact" />} />
          <Route path="/legacy-home" element={<Index />} />
          <Route path="/legacy/about" element={<About />} />
          <Route path="/legacy/how-it-works" element={<HowItWorks />} />
          <Route path="/legacy/ai-features" element={<AIFeatures />} />
          <Route path="/legacy/timeline" element={<Timeline />} />
          <Route path="/legacy/contact" element={<Contact />} />
          <Route path="/legacy/for-universities" element={<ForUniversities />} />
          <Route path="/athlete-intake" element={<AthleteIntake />} />
          <Route path="/brand-intake" element={<BrandIntake />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />
          <Route path="/athlete-dashboard" element={<ProtectedAthleteRoute><AthleteDashboard /></ProtectedAthleteRoute>} />
          <Route path="/athlete-profile" element={<ProtectedAthleteRoute><AthleteProfile /></ProtectedAthleteRoute>} />
          <Route path="/brand-dashboard" element={<ProtectedBrandRoute><BrandDashboard /></ProtectedBrandRoute>} />
          <Route path="/brand-profile" element={<ProtectedBrandRoute><BrandProfile /></ProtectedBrandRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
