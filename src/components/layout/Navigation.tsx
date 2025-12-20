import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "SERVICES", path: "/how-it-works" },
    { name: "FOR UNIVERSITIES", path: "/for-universities" },
    { name: "AI FEATURES", path: "/ai-features" },
    { name: "ABOUT", path: "/about" },
    { name: "CONTACT", path: "/contact" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-background/95 backdrop-blur-lg shadow-lg py-3" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-black tracking-wider"
              >
                <span className="text-foreground">SSG</span>
                <span className="text-primary">.</span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold tracking-widest transition-colors hover:text-primary ${
                    location.pathname === link.path ? "text-primary" : "text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-foreground hover:text-primary font-semibold">
                    SIGN IN
                  </Button>
                </SignInButton>
                <Link to="/athlete-intake">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    ATHLETE SIGNUP
                  </Button>
                </Link>
                <Link to="/brand-intake">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                    BRAND SIGNUP
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/athlete-intake">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    ATHLETE SIGNUP
                  </Button>
                </Link>
                <Link to="/brand-intake">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                    BRAND SIGNUP
                  </Button>
                </Link>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              </SignedIn>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-foreground p-2"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-card border-l border-border z-50 lg:hidden"
            >
              <div className="flex flex-col h-full p-8 pt-24">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block py-4 text-lg font-bold tracking-wider border-b border-border hover:text-primary transition-colors ${
                        location.pathname === link.path ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-8 space-y-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button variant="ghost" className="w-full text-foreground hover:text-primary font-semibold">
                        SIGN IN
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex justify-center mb-4">
                      <UserButton 
                        afterSignOutUrl="/"
                        appearance={{
                          elements: {
                            avatarBox: "w-12 h-12"
                          }
                        }}
                      />
                    </div>
                  </SignedIn>
                  <Link to="/athlete-intake" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-primary text-primary">
                      ATHLETE SIGNUP
                    </Button>
                  </Link>
                  <Link to="/brand-intake" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground font-bold">
                      BRAND SIGNUP
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
