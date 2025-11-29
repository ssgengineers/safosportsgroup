import Navigation from "@/components/layout/Navigation";
import { UniversityHeroBlock } from "@/components/heros/UniversityHeroBlock";
import { AlternatingContentSection } from "@/components/sections/AlternatingContentSection";
import { ContactBar } from "@/components/sections/ContactBar";
import { Footer } from "@/components/layout/Footer";

const ForUniversities = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Block - Exactly like Tykoon's For Universities */}
      <UniversityHeroBlock
        title="FOR UNIVERSITIES"
        subtitle="– SSG"
        paragraphs={[
          "We partner with universities to create comprehensive NIL programs that benefit student-athletes, athletic departments, and institutional brands.",
          "Our platform provides the infrastructure, technology, and expertise needed to navigate the complex NIL landscape while maintaining compliance and maximizing opportunities.",
          "From athlete education to brand partnerships, we handle every aspect of your university's NIL program with professionalism and care."
        ]}
        images={[
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop&q=80",
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=600&fit=crop&q=80",
          "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop&q=80",
        ]}
        ctaText="Partner With Us"
        onCtaClick={() => window.location.href = "mailto:universities@ssg.com"}
      />

      {/* Alternating Sections Pattern - Exactly like Tykoon */}

      {/* Section 1: Text Left + Image Right (White Background) */}
      <AlternatingContentSection
        imagePosition="right"
        backgroundColor="white"
        image="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=600&fit=crop&q=80"
        imageAlt="Athlete Development"
        title="ATHLETE DEVELOPMENT"
        subtitle="– EDUCATION FIRST"
        content={
          <div className="space-y-4">
            <p>
              We provide comprehensive NIL education programs for student-athletes, teaching them how to build their personal brand, negotiate deals, and manage their finances.
            </p>
            <p>
              Our workshops and one-on-one coaching sessions ensure athletes are prepared to maximize their NIL opportunities while maintaining academic and athletic excellence.
            </p>
          </div>
        }
      />

      {/* Section 2: Image Left + Text Right (Yellow Background) */}
      <AlternatingContentSection
        imagePosition="left"
        backgroundColor="yellow"
        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80"
        imageAlt="Brand Partnerships"
        title="BRAND PARTNERSHIPS"
        subtitle="– AI-POWERED MATCHING"
        content={
          <div className="space-y-4">
            <p>
              Our AI-powered platform analyzes athlete profiles, social media metrics, and brand requirements to create perfect matches that drive real results.
            </p>
            <p>
              We've facilitated thousands of successful partnerships, helping brands connect with authentic voices and athletes monetize their influence.
            </p>
          </div>
        }
      />

      {/* Section 3: Text Left + Image Right (White Background) */}
      <AlternatingContentSection
        imagePosition="right"
        backgroundColor="white"
        image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80"
        imageAlt="Compliance & Support"
        title="COMPLIANCE & SUPPORT"
        subtitle="– PEACE OF MIND"
        content={
          <div className="space-y-4">
            <p>
              Our dedicated compliance team ensures all NIL activities align with NCAA regulations, conference rules, and state laws.
            </p>
            <p>
              We provide 24/7 support for athletic departments, offering guidance on deal structures, contract reviews, and policy implementation.
            </p>
            <p>
              With our platform, universities can confidently embrace NIL while protecting institutional integrity and student welfare.
            </p>
          </div>
        }
      />

      {/* Section 4: Image Left + Text Right (Yellow Background) */}
      <AlternatingContentSection
        imagePosition="left"
        backgroundColor="yellow"
        image="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop&q=80"
        imageAlt="Analytics & Insights"
        title="ANALYTICS & INSIGHTS"
        subtitle="– DATA-DRIVEN DECISIONS"
        content={
          <div className="space-y-4">
            <p>
              Track NIL activity, monitor compliance, and measure ROI with our comprehensive analytics dashboard built specifically for athletic departments.
            </p>
            <p>
              Real-time reporting helps you make informed decisions and demonstrate the value of your NIL program to stakeholders.
            </p>
          </div>
        }
      />

      {/* CTA Section */}
      <ContactBar
        title="PARTNER WITH SSG"
        description="Join leading universities already transforming their NIL programs with SSG's comprehensive platform and expert support."
        primaryButtonText="Contact Us"
        primaryButtonLink="/contact"
        secondaryButtonText="Learn More"
        secondaryButtonLink="/about"
        backgroundColor="black"
      />

      <Footer />
    </div>
  );
};

export default ForUniversities;
