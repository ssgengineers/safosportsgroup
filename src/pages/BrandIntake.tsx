import { motion } from "framer-motion";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BrandIntake = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company: "",
    contact: "",
    email: "",
    website: "",
    industry: "",
    budget: "",
    description: "",
    goals: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Partnership Request Submitted!",
      description: "Our team will reach out within 24 hours to discuss opportunities.",
    });
  };

  const steps = [
    { number: 1, title: "Company Info" },
    { number: 2, title: "Industry & Budget" },
    { number: 3, title: "Campaign Details" },
    { number: 4, title: "Objectives" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-black tracking-wider mb-6">
              BRAND <span className="text-primary">PARTNERSHIP</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect with elite athletes who align with your brand
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <div className="flex justify-between mb-12">
            {steps.map((s) => (
              <motion.div
                key={s.number}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: s.number * 0.1 }}
                className="flex flex-col items-center flex-1"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${
                  step >= s.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground"
                }`}>
                  {step > s.number ? <CheckCircle size={24} /> : s.number}
                </div>
                <span className="text-xs text-muted-foreground text-center hidden sm:block">
                  {s.title}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card p-8 md:p-12 rounded-2xl border border-border"
          >
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-8">Company Information</h2>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">COMPANY NAME</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Your company name"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">CONTACT NAME</label>
                  <Input
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Your full name"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">EMAIL</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="company@email.com"
                    required
                    className="bg-background"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-8">Industry & Budget</h2>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">WEBSITE</label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourcompany.com"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">INDUSTRY</label>
                  <Input
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., Sports Nutrition, Apparel, Tech"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">MARKETING BUDGET RANGE</label>
                  <Input
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g., $10k-$50k, $50k-$100k, $100k+"
                    required
                    className="bg-background"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-8">Campaign Details</h2>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">COMPANY DESCRIPTION</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about your company, products, and target audience"
                    rows={5}
                    required
                    className="bg-background resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold mb-8">Partnership Objectives</h2>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">CAMPAIGN GOALS</label>
                  <Textarea
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    placeholder="What are your key objectives? (e.g., brand awareness, product launches, audience growth)"
                    rows={6}
                    required
                    className="bg-background resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-12">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="flex-1"
                >
                  BACK
                </Button>
              )}
              {step < 4 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold group"
                >
                  NEXT
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                >
                  SUBMIT REQUEST
                </Button>
              )}
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default BrandIntake;
