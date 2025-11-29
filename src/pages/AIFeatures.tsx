import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import AnimatedSection from "@/components/AnimatedSection";
import { Brain, Target, BarChart, Zap, Shield, TrendingUp } from "lucide-react";

const AIFeatures = () => {
  const features = [
    {
      icon: <Brain />,
      title: "Intelligent Matching",
      description: "Our AI analyzes thousands of data points to connect athletes with brands that align perfectly with their values, audience, and goals."
    },
    {
      icon: <Target />,
      title: "Audience Analytics",
      description: "Deep insights into audience demographics, engagement patterns, and growth trends to maximize partnership potential."
    },
    {
      icon: <BarChart />,
      title: "Performance Prediction",
      description: "Forecast campaign success before launch using historical data and machine learning algorithms."
    },
    {
      icon: <Zap />,
      title: "Real-Time Optimization",
      description: "AI continuously monitors and adjusts strategies to ensure maximum ROI throughout the partnership."
    },
    {
      icon: <Shield />,
      title: "Brand Safety",
      description: "Automated content screening and sentiment analysis to protect brand reputation at all times."
    },
    {
      icon: <TrendingUp />,
      title: "Growth Insights",
      description: "Actionable recommendations powered by AI to accelerate audience growth and engagement."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-8"
            >
              <Brain className="text-primary" size={64} />
            </motion.div>
            <h1 className="text-6xl md:text-7xl font-black tracking-wider mb-6">
              AI-POWERED <span className="text-primary">INTELLIGENCE</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Cutting-edge artificial intelligence that transforms how athletes and brands connect, collaborate, and succeed together
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <AnimatedSection className="py-32">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-card p-8 rounded-xl border border-border hover:border-primary transition-all"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-block mb-6"
                >
                  <div className="text-primary text-5xl">
                    {feature.icon}
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Stats Section */}
      <AnimatedSection className="py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 text-center">
            {[
              { number: "99.8%", label: "Match Accuracy" },
              { number: "3.2x", label: "Avg ROI Increase" },
              { number: "48hrs", label: "Avg Match Time" },
              { number: "1M+", label: "Data Points Analyzed" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-5xl md:text-6xl font-black text-primary mb-4">
                  {stat.number}
                </div>
                <div className="text-lg text-muted-foreground tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* How It Works */}
      <AnimatedSection className="py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-black tracking-wider text-center mb-20">
              HOW OUR AI <span className="text-primary">WORKS</span>
            </h2>
            <div className="space-y-12">
              {[
                { step: "01", title: "Data Collection", desc: "Gather comprehensive data from profiles, social media, and market trends" },
                { step: "02", title: "Analysis", desc: "Process millions of data points through advanced machine learning models" },
                { step: "03", title: "Matching", desc: "Identify optimal partnerships based on compatibility scores and success probability" },
                { step: "04", title: "Optimization", desc: "Continuously learn and improve recommendations based on outcomes" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-start gap-6 p-6 rounded-xl bg-card border border-border"
                >
                  <div className="text-4xl font-black text-primary/30 min-w-[80px]">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default AIFeatures;
