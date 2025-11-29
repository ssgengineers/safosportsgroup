import Navigation from "@/components/Navigation";
import UniversitiesSection from "@/components/UniversitiesSection";
import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";

const ForUniversities = () => {
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
            <h1 className="text-6xl md:text-7xl font-black tracking-wider mb-6 uppercase">
              FOR <span className="text-primary">UNIVERSITIES</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering student-athletes and building university brands through strategic partnerships
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Universities Section - Text Left, Slideshow Right */}
      <UniversitiesSection
        title="FOR UNIVERSITIES"
        subtitle="SSG PLATFORM"
        paragraphs={[
          "We partner with universities to create comprehensive NIL programs that benefit student-athletes, athletic departments, and institutional brands.",
          "Our platform provides the infrastructure, technology, and expertise needed to navigate the complex NIL landscape while maintaining compliance and maximizing opportunities.",
          "From athlete education to brand partnerships, we handle every aspect of your university's NIL program with professionalism and care."
        ]}
        images={[
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=1000&fit=crop",
        ]}
        imagePosition="right"
        backgroundColor="white"
      />

      {/* Section 2 - Image Left, Text Right, Yellow Background */}
      <UniversitiesSection
        title="ATHLETE DEVELOPMENT"
        subtitle="EDUCATION FIRST"
        paragraphs={[
          "We provide comprehensive NIL education programs for student-athletes, teaching them how to build their personal brand, negotiate deals, and manage their finances.",
          "Our workshops and one-on-one coaching sessions ensure athletes are prepared to maximize their NIL opportunities while maintaining academic and athletic excellence.",
        ]}
        images={[
          "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=1000&fit=crop",
        ]}
        imagePosition="left"
        backgroundColor="yellow"
      />

      {/* Section 3 - Text Left, Image Right, White Background */}
      <UniversitiesSection
        title="COMPLIANCE & SUPPORT"
        subtitle="PEACE OF MIND"
        paragraphs={[
          "Our dedicated compliance team ensures all NIL activities align with NCAA regulations, conference rules, and state laws.",
          "We provide 24/7 support for athletic departments, offering guidance on deal structures, contract reviews, and policy implementation.",
          "With our platform, universities can confidently embrace NIL while protecting institutional integrity and student welfare.",
        ]}
        images={[
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=1000&fit=crop",
        ]}
        imagePosition="right"
        backgroundColor="white"
      />

      {/* CTA Section */}
      <AnimatedSection className="py-32 bg-primary/10">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-black tracking-wider mb-8 uppercase"
          >
            PARTNER WITH <span className="text-primary">SSG</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Join leading universities already transforming their NIL programs with SSG
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <a 
              href="mailto:universities@ssg.com"
              className="inline-block bg-primary text-primary-foreground px-12 py-4 rounded-lg font-bold text-lg tracking-wider uppercase hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,211,0,0.5)]"
            >
              CONTACT US
            </a>
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default ForUniversities;
