import { motion } from "framer-motion";
import Navigation from "@/components/layout/Navigation";
import AnimatedSection from "@/components/AnimatedSection";
import { CheckCircle, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Athletes and brands complete our streamlined intake process, showcasing your unique value proposition and goals.",
      side: "left"
    },
    {
      number: "02",
      title: "AI-Powered Matching",
      description: "Our advanced algorithms analyze your profile, audience, and objectives to find the perfect partnership opportunities.",
      side: "right"
    },
    {
      number: "03",
      title: "Connect & Collaborate",
      description: "Review matched opportunities, initiate conversations, and begin building powerful partnerships.",
      side: "left"
    },
    {
      number: "04",
      title: "Execute & Grow",
      description: "Launch campaigns with our support, track real-time performance, and watch your brand reach new heights.",
      side: "right"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-black tracking-wider mb-6">
              HOW IT <span className="text-primary">WORKS</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From profile to partnership in four seamless steps
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Steps */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border hidden lg:block" />

          <div className="space-y-32">
            {steps.map((step, index) => (
              <AnimatedSection key={index} delay={index * 0.2}>
                <div className={`flex flex-col lg:flex-row items-center gap-12 ${
                  step.side === "right" ? "lg:flex-row-reverse" : ""
                }`}>
                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, x: step.side === "left" ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 text-center lg:text-left"
                  >
                    <div className="inline-block mb-4">
                      <span className="text-7xl font-black text-primary opacity-20">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-wide">
                      {step.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
                      {step.description}
                    </p>
                  </motion.div>

                  {/* Center Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative z-10"
                  >
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-xl">
                      <CheckCircle className="text-primary-foreground" size={32} />
                    </div>
                  </motion.div>

                  {/* Spacer */}
                  <div className="flex-1 hidden lg:block" />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <AnimatedSection className="py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black tracking-wider mb-6">
              THE SSG <span className="text-primary">ADVANTAGE</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: "Fast Onboarding", desc: "Get started in minutes, not days" },
              { title: "Smart Matching", desc: "AI finds your perfect partners" },
              { title: "Full Transparency", desc: "Clear metrics and insights" },
              { title: "Expert Support", desc: "Dedicated team at your service" },
              { title: "Flexible Terms", desc: "Non-exclusive partnerships" },
              { title: "Proven Results", desc: "Track record of success" },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-card p-8 rounded-lg border border-border hover:border-primary transition-all cursor-pointer"
              >
                <ArrowRight className="text-primary mb-4" size={32} />
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default HowItWorks;
