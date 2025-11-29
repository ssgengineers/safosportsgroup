import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import AnimatedSection from "@/components/AnimatedSection";
import { Calendar } from "lucide-react";

const Timeline = () => {
  const milestones = [
    {
      year: "2020",
      title: "Foundation",
      description: "SSG was founded with a vision to transform athlete-brand partnerships through technology.",
      highlight: true
    },
    {
      year: "2021",
      title: "First 100 Athletes",
      description: "Onboarded our first 100 athletes and launched 50+ successful campaigns.",
      highlight: false
    },
    {
      year: "2021",
      title: "AI Integration",
      description: "Introduced proprietary AI matching algorithm, increasing partnership success rate by 300%.",
      highlight: true
    },
    {
      year: "2022",
      title: "Series A Funding",
      description: "Raised $25M in Series A funding to accelerate growth and technology development.",
      highlight: false
    },
    {
      year: "2023",
      title: "500+ Athletes",
      description: "Reached 500+ athletes and 200+ brand partners, facilitating $50M+ in campaign value.",
      highlight: true
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded operations to Europe and Asia, becoming a truly global platform.",
      highlight: false
    },
    {
      year: "2025",
      title: "Industry Leader",
      description: "Recognized as the #1 AI-powered athlete marketing platform worldwide.",
      highlight: true
    }
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
            <Calendar className="inline-block text-primary mb-6" size={64} />
            <h1 className="text-6xl md:text-7xl font-black tracking-wider mb-6">
              OUR <span className="text-primary">JOURNEY</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From startup to industry leader - the SSG story
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary to-transparent hidden lg:block" />

          <div className="space-y-24">
            {milestones.map((milestone, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${
                    index % 2 === 0 ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`p-8 rounded-2xl ${
                        milestone.highlight
                          ? "bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary"
                          : "bg-card border border-border"
                      }`}
                    >
                      <div className={`text-5xl font-black mb-4 ${
                        milestone.highlight ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {milestone.year}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-wide">
                        {milestone.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {milestone.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Center Dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="relative z-10 hidden lg:block"
                  >
                    <div className={`w-6 h-6 rounded-full ${
                      milestone.highlight ? "bg-primary ring-4 ring-primary/30" : "bg-border"
                    }`} />
                  </motion.div>

                  {/* Spacer */}
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <AnimatedSection className="py-32 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl font-black tracking-wider mb-8">
              LOOKING <span className="text-primary">AHEAD</span>
            </h2>
            <p className="text-2xl text-muted-foreground leading-relaxed mb-12">
              We're just getting started. Our vision is to become the global standard for athlete-brand partnerships, empowering thousands of athletes and brands to achieve unprecedented success together.
            </p>
            <div className="inline-block px-8 py-4 bg-primary/10 border-2 border-primary rounded-full">
              <span className="text-3xl font-black text-primary">The Future is Bright</span>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Timeline;
