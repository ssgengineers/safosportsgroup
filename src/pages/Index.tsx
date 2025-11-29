import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import TriplePanelHero from "@/components/TriplePanelHero";
import PartnerLogoGrid from "@/components/PartnerLogoGrid";
import ServiceCard from "@/components/ServiceCard";
import ShopCarousel from "@/components/ShopCarousel";
import WhyWorkWithUs from "@/components/WhyWorkWithUs";
import AnimatedSection from "@/components/AnimatedSection";
import { Target, TrendingUp, Users, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const partners = [
    { name: "Partner 1", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop" },
    { name: "Partner 2", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop" },
    { name: "Partner 3", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop" },
    { name: "Partner 4", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop" },
    { name: "Partner 5", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop" },
    { name: "Partner 6", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop" },
    { name: "Partner 7", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop" },
    { name: "Partner 8", logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop" },
  ];

  const shopItems = [
    { 
      id: "1", 
      title: "SSG Jersey", 
      price: "$79.99",
      image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?w=600&h=600&fit=crop"
    },
    { 
      id: "2", 
      title: "SSG Cap", 
      price: "$29.99",
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop"
    },
    { 
      id: "3", 
      title: "SSG Hoodie", 
      price: "$89.99",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop"
    },
    { 
      id: "4", 
      title: "SSG Backpack", 
      price: "$59.99",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"
    },
    { 
      id: "5", 
      title: "SSG Water Bottle", 
      price: "$24.99",
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop"
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
        mainTitle="STUDENT SPONSOR GATEWAY"
        leftPanelText=""
        middlePanelText="BUILDING BRANDS"
        rightPanelText="ONE ATHLETE AT A TIME"
        ctaText="JOIN THE ROSTER"
        onCtaClick={() => navigate("/athlete-intake")}
      />

      {/* Why Work With Us - Yellow Typography + Image */}
      <WhyWorkWithUs 
        reasons={whyWorkReasons}
        image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=1000&fit=crop"
      />

      {/* Partner Logos Grid */}
      <PartnerLogoGrid partners={partners} autoScroll={false} />

      {/* Service Cards - 2x2 Grid with Hover Animations */}
      <AnimatedSection className="py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black tracking-wider uppercase">
              OUR <span className="text-primary">SERVICES</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <ServiceCard
              icon={<Target />}
              title="BRAND MATCHING"
              description="Connect with brands that align perfectly with your values, audience, and goals through our AI-powered matching system."
              delay={0}
              onClick={() => navigate("/ai-features")}
            />
            <ServiceCard
              icon={<TrendingUp />}
              title="CAMPAIGN MANAGEMENT"
              description="Launch, track, and optimize your sponsorship campaigns with real-time analytics and performance insights."
              delay={0.1}
            />
            <ServiceCard
              icon={<Users />}
              title="TALENT REPRESENTATION"
              description="Professional athlete management services including contract negotiation, brand strategy, and partnership development."
              delay={0.2}
            />
            <ServiceCard
              icon={<Zap />}
              title="CONTENT CREATION"
              description="End-to-end content production services to showcase athletes and maximize brand engagement across all platforms."
              delay={0.3}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Shop Section - Horizontal Carousel */}
      <ShopCarousel items={shopItems} />

      {/* Stats Section */}
      <AnimatedSection className="py-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <h3 className="text-6xl md:text-7xl font-black text-primary mb-4">5000+</h3>
              <p className="text-xl text-muted-foreground tracking-wider uppercase">Athletes</p>
            </div>
            <div>
              <h3 className="text-6xl md:text-7xl font-black text-primary mb-4">500+</h3>
              <p className="text-xl text-muted-foreground tracking-wider uppercase">Brands</p>
            </div>
            <div>
              <h3 className="text-6xl md:text-7xl font-black text-primary mb-4">$10M+</h3>
              <p className="text-xl text-muted-foreground tracking-wider uppercase">Deals Closed</p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Index;
