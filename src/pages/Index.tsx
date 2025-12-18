import { useNavigate } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import TriplePanelHero from "@/components/heros/TriplePanelHero";
import PartnerLogoGrid from "@/components/sections/PartnerLogoGrid";
import { ServicesSection } from "@/components/sections/ServicesSection";
import WhyWorkWithUs from "@/components/sections/WhyWorkWithUs";
import { ContactBar } from "@/components/sections/ContactBar";
import { Footer } from "@/components/layout/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Target, TrendingUp, Users, Zap, Brain, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const partners = [
    { name: "Pepsi", logo: "/PartnerLogos/pepsi-logo-png-transparent.png" },
    { name: "Under Armour", logo: "/PartnerLogos/Under_Armour-Logo.wine.png" },
    { name: "Owala", logo: "/PartnerLogos/Owala_Logo.svg.png" },
    { name: "Ledo Pizza", logo: "/PartnerLogos/Ledo_Pizza_logo.png" },
    { name: "SARDI's", logo: "/PartnerLogos/SARDIs-Logo-Horizontal.png" },
    { name: "Brusters", logo: "/PartnerLogos/brusters.png" },
    { name: "SS Logo", logo: "/PartnerLogos/SS Logo Black.png.avif" },
    { name: "Partner", logo: "/PartnerLogos/images.png" },
  ];

  const services = [
    {
      title: "AI-Powered Matching",
      description: "Connect with brands that align perfectly with your values, audience, and goals through our advanced AI matching system that analyzes thousands of data points.",
      icon: Brain,
    },
    {
      title: "Brand Partnerships",
      description: "Launch, track, and optimize your sponsorship campaigns with real-time analytics and performance insights that drive measurable results.",
      icon: TrendingUp,
    },
    {
      title: "Athlete Management",
      description: "Professional representation services including contract negotiation, brand strategy, and partnership development tailored to your unique goals.",
      icon: Users,
    },
    {
      title: "NIL Compliance",
      description: "Navigate the complex NIL landscape with confidence. Our compliance team ensures all partnerships meet NCAA, conference, and state regulations.",
      icon: Shield,
    },
    {
      title: "Content Creation",
      description: "End-to-end content production services to showcase athletes and maximize brand engagement across all social media platforms.",
      icon: Zap,
    },
    {
      title: "Deal Facilitation",
      description: "Streamlined processes for contract creation, negotiation, and payment processing to get deals done faster and more efficiently.",
      icon: Target,
    },
  ];

  const whyWorkReasons = [
    "The First Student-Focused NIL Marketing Agency",
    "Gen-Z Led and Operated",
    "Non-Exclusive Partnerships",
    "Certified Marketing Experts",
    "For Athletes and Brands Of All Sizes",
    "Comprehensive Support",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Triple Panel Hero - Exactly like Tykoon */}
      <TriplePanelHero
        mainTitle="Safo Sports Group"
        leftPanelText="EMPOWERING ATHLETES"
        middlePanelText="CONNECTING BRANDS"
        rightPanelText="BUILDING FUTURES"
        leftImage="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=1200&fit=crop&q=80"
        ctaText="GET STARTED"
        onCtaClick={() => navigate("/athlete-intake")}
      />

      {/* Why Work With Us - Yellow Typography + Image */}
      <WhyWorkWithUs
        reasons={whyWorkReasons}
        image="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=1000&fit=crop&q=80"
      />

      {/* Partner Logos Grid */}
      <PartnerLogoGrid partners={partners} autoScroll={false} />

      {/* Services Section - 3-column Grid with Enhanced Animations */}
      <ServicesSection
        title="WHAT WE OFFER"
        services={services}
        columns={3}
        backgroundColor="black"
      />

      {/* Stats Section with Animated Counters */}
      <AnimatedSection className="py-32 bg-primary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <h3 className="font-heading text-6xl md:text-7xl font-black text-background mb-4">5000+</h3>
              <p className="text-xl text-background/90 tracking-wider uppercase font-semibold">Athletes Connected</p>
            </div>
            <div>
              <h3 className="font-heading text-6xl md:text-7xl font-black text-background mb-4">500+</h3>
              <p className="text-xl text-background/90 tracking-wider uppercase font-semibold">Partner Brands</p>
            </div>
            <div>
              <h3 className="font-heading text-6xl md:text-7xl font-black text-background mb-4">$10M+</h3>
              <p className="text-xl text-background/90 tracking-wider uppercase font-semibold">In NIL Deals</p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-black tracking-wider uppercase text-background mb-6">
              SUCCESS <span className="text-primary">STORIES</span>
            </h2>
            <p className="text-xl text-background/70 max-w-3xl mx-auto">
              Hear from athletes and brands who have transformed their NIL game with SSG
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                quote: "SSG helped me land my first major brand deal. The AI matching is incredible!",
                author: "Jordan T.",
                role: "D1 Basketball Player",
              },
              {
                quote: "As a brand, we've never had such authentic partnerships with college athletes.",
                author: "Sarah M.",
                role: "Marketing Director",
              },
              {
                quote: "The compliance support gave our athletic department peace of mind.",
                author: "Coach Williams",
                role: "University AD",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-background p-8 rounded-2xl border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover-lift"
              >
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-bold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-primary">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <ContactBar
        title="READY TO ELEVATE YOUR GAME?"
        description="Join thousands of athletes and brands already using SSG to create meaningful partnerships and maximize NIL opportunities."
        primaryButtonText="Sign Up as Athlete"
        primaryButtonLink="/athlete-intake"
        secondaryButtonText="Sign Up as Brand"
        secondaryButtonLink="/brand-intake"
        backgroundColor="yellow"
      />

      <Footer />
    </div>
  );
};

export default Index;
