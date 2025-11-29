import { motion } from "framer-motion";
import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AthleteIntake = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    sport: "",
    team: "",
    social: "",
    followers: "",
    bio: "",
    goals: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application Submitted!",
      description: "We'll review your profile and be in touch within 48 hours.",
    });
  };

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Athletic Background" },
    { number: 3, title: "Social Media" },
    { number: 4, title: "Goals" }
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
              ATHLETE <span className="text-primary">SIGNUP</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Join the premier platform for athlete-brand partnerships
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
                <h2 className="text-3xl font-bold mb-8">Personal Information</h2>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">FULL NAME</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    placeholder="your@email.com"
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
                <h2 className="text-3xl font-bold mb-8">Athletic Background</h2>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">SPORT</label>
                  <Input
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    placeholder="e.g., Basketball, Football, Soccer"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">TEAM/ORGANIZATION</label>
                  <Input
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    placeholder="Current team or organization"
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
                <h2 className="text-3xl font-bold mb-8">Social Media</h2>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">PRIMARY SOCIAL HANDLE</label>
                  <Input
                    value={formData.social}
                    onChange={(e) => setFormData({ ...formData, social: e.target.value })}
                    placeholder="@yourhandle"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">TOTAL FOLLOWERS</label>
                  <Input
                    value={formData.followers}
                    onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                    placeholder="Approximate total across all platforms"
                    required
                    className="bg-background"
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
                <h2 className="text-3xl font-bold mb-8">Your Goals</h2>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">TELL US ABOUT YOURSELF</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Share your story, achievements, and what makes you unique"
                    rows={4}
                    required
                    className="bg-background resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">PARTNERSHIP GOALS</label>
                  <Textarea
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    placeholder="What are you looking to achieve through brand partnerships?"
                    rows={4}
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
                  SUBMIT APPLICATION
                </Button>
              )}
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default AthleteIntake;
