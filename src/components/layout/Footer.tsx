import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations";
import { Instagram, Twitter, Linkedin, Mail } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: "For Athletes",
    links: [
      { label: "Sign Up", href: "/athlete-intake" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Success Stories", href: "/about" },
      { label: "FAQ", href: "/contact" },
    ],
  },
  {
    title: "For Brands",
    links: [
      { label: "Get Started", href: "/brand-intake" },
      { label: "AI Matching", href: "/ai-features" },
      { label: "Pricing", href: "/contact" },
      { label: "Resources", href: "/about" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Timeline", href: "/timeline" },
      { label: "Contact", href: "/contact" },
      { label: "For Universities", href: "/for-universities" },
    ],
  },
];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "mailto:contact@ssg.com", label: "Email" },
];

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
        >
          {/* Brand Column */}
          <motion.div variants={staggerItem}>
            <h3 className="font-heading text-3xl font-black tracking-wider uppercase text-primary mb-4">
              SSG
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Student Sponsor Gateway connects college athletes with brands through AI-powered matching.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <motion.div key={section.title} variants={staggerItem}>
              <h4 className="font-heading text-lg font-bold tracking-wider uppercase text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block hover:translate-x-1 transform"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Student Sponsor Gateway. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
