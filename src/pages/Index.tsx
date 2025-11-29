import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import HeroVideo from "@/components/HeroVideo";
import AnimatedSection from "@/components/AnimatedSection";
import FeatureCard from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Target, 
  Zap, 
  Users, 
  TrendingUp, 
  Shield,
  Sparkles,
  ChevronRight
} from "lucide-react";

const Index = () => {
  const partners = [
    "GFUEL", "NBC SPORTS", "CVS", "ELECTROLIT", "XENITH", "CONCUSSION COLLAR"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <HeroVideo
        title={["CONNECTING", "ATHLETES &", "BRANDS"]}
        subtitle="Premium sports marketing solutions powered by next-generation technology"
        overlayOpacity={0.6}
        cta={
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/athlete-intake">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 py-6 tracking-wider group"
              >
                JOIN AS ATHLETE
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/brand-intake">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold text-lg px-8 py-6 tracking-wider"
              >
                PARTNER WITH US
              </Button>
            </Link>
          </div>
        }
      />

      {/* Why Work With Us Section */}
      <AnimatedSection className="py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-black tracking-wider mb-6">
              WHY <span className="text-primary">SSG</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The premier destination for athlete-brand partnerships in the digital age
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Trophy />}
              title="Premium Partnerships"
              description="Connect with top-tier brands and elite athletes through our exclusive network"
              delay={0.1}
            />
            <FeatureCard
              icon={<Sparkles />}
              title="AI-Powered Matching"
              description="Advanced algorithms ensure perfect brand-athlete alignment for maximum impact"
              delay={0.2}
            />
            <FeatureCard
              icon={<Target />}
              title="Data-Driven Results"
              description="Real-time analytics and insights to measure and optimize every campaign"
              delay={0.3}
            />
            <FeatureCard
              icon={<Users />}
              title="Expert Support"
              description="Dedicated team of marketing professionals guiding you every step"
              delay={0.4}
            />
            <FeatureCard
              icon={<TrendingUp />}
              title="Proven Growth"
              description="Our partnerships consistently deliver exponential brand growth and engagement"
              delay={0.5}
            />
            <FeatureCard
              icon={<Shield />}
              title="Trusted Platform"
              description="Secure, transparent, and compliant with all industry regulations"
              delay={0.6}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Partners Section */}
      <AnimatedSection className="py-32 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black tracking-wider mb-6">
              OUR <span className="text-primary">PARTNERS</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Trusted by industry leaders
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <motion.div
                key={partner}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="aspect-square bg-card border border-border rounded-lg flex items-center justify-center p-6 cursor-pointer"
              >
                <span className="font-bold text-sm text-center tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                  {partner}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-32 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-black tracking-wider mb-8">
              READY TO <span className="text-primary">ELEVATE</span> YOUR GAME?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join the platform that's revolutionizing athlete-brand partnerships
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/how-it-works">
                <Button 
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-12 py-7 tracking-wider"
                >
                  LEARN MORE
                </Button>
              </Link>
              <Link to="/contact">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-bold text-lg px-12 py-7 tracking-wider"
                >
                  GET IN TOUCH
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-black text-2xl mb-4 tracking-wider">
                SSG<span className="text-primary">.</span>
              </h3>
              <p className="text-muted-foreground">
                Premium sports marketing solutions
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 tracking-wider">COMPANY</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/timeline" className="hover:text-primary transition-colors">Timeline</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 tracking-wider">SERVICES</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                <li><Link to="/ai-features" className="hover:text-primary transition-colors">AI Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 tracking-wider">GET STARTED</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/athlete-intake" className="hover:text-primary transition-colors">Athlete Signup</Link></li>
                <li><Link to="/brand-intake" className="hover:text-primary transition-colors">Brand Signup</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2025 SSG. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
