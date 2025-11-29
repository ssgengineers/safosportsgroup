import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import AnimatedSection from "@/components/AnimatedSection";
import { Users, Heart, Target, Award } from "lucide-react";

const About = () => {
  const team = [
    { name: "Alex Rivera", role: "CEO & Founder", image: "AR" },
    { name: "Jordan Chen", role: "CTO", image: "JC" },
    { name: "Taylor Morgan", role: "Head of Partnerships", image: "TM" },
    { name: "Casey Williams", role: "AI Lead", image: "CW" },
    { name: "Morgan Davis", role: "Marketing Director", image: "MD" },
    { name: "Sam Thompson", role: "Operations Manager", image: "ST" },
  ];

  const values = [
    {
      icon: <Target />,
      title: "Excellence",
      description: "We strive for perfection in every partnership, campaign, and interaction."
    },
    {
      icon: <Heart />,
      title: "Integrity",
      description: "Trust and transparency are the foundation of everything we do."
    },
    {
      icon: <Users />,
      title: "Community",
      description: "Building lasting relationships between athletes, brands, and fans."
    },
    {
      icon: <Award />,
      title: "Innovation",
      description: "Pushing boundaries with cutting-edge technology and creative solutions."
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
            <h1 className="text-6xl md:text-7xl font-black tracking-wider mb-6">
              ABOUT <span className="text-primary">SSG</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing the sports marketing industry by connecting exceptional athletes with visionary brands through the power of AI and human expertise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <AnimatedSection className="py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-black tracking-wider mb-8">
              OUR <span className="text-primary">MISSION</span>
            </h2>
            <p className="text-2xl text-muted-foreground leading-relaxed mb-12">
              To empower athletes to build their personal brands while helping companies connect authentically with their target audiences through strategic, data-driven partnerships.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              {[
                { num: "500+", label: "Athletes" },
                { num: "200+", label: "Brand Partners" },
                { num: "$50M+", label: "Campaign Value" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6"
                >
                  <div className="text-5xl font-black text-primary mb-2">{stat.num}</div>
                  <div className="text-lg text-muted-foreground tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Values */}
      <AnimatedSection className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black tracking-wider mb-6">
              OUR <span className="text-primary">VALUES</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-card p-8 rounded-xl border border-border text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="inline-block text-primary mb-4"
                >
                  {value.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Team */}
      <AnimatedSection className="py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black tracking-wider mb-6">
              MEET THE <span className="text-primary">TEAM</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Industry experts passionate about athlete success
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all cursor-pointer"
              >
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-6xl font-black text-primary">{member.image}</span>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default About;
