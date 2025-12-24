import { motion } from "framer-motion";
import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, ChevronRight, Edit, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitBrandIntake } from "@/services/api";

const BrandIntake = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    contactFirstName: "",
    contactLastName: "",
    contactTitle: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    companySize: "",
    budget: "",
    targetAudience: "",
    description: "",
    goals: "",
    timeline: "",
    athletePreferences: ""
  });

  const industries = [
    "Sports & Fitness",
    "Food & Beverage",
    "Apparel & Fashion",
    "Technology",
    "Health & Wellness",
    "Financial Services",
    "Automotive",
    "Entertainment & Media",
    "Retail & E-commerce",
    "Travel & Hospitality",
    "Other"
  ];

  const companySizes = [
    "Startup (1-10 employees)",
    "Small (11-50 employees)",
    "Medium (51-200 employees)",
    "Large (201-1000 employees)",
    "Enterprise (1000+ employees)"
  ];

  const budgetRanges = [
    "Under $5,000",
    "$5,000 - $15,000",
    "$15,000 - $50,000",
    "$50,000 - $100,000",
    "$100,000 - $250,000",
    "$250,000+"
  ];

  const timelines = [
    "Immediate (within 1 month)",
    "Short-term (1-3 months)",
    "Medium-term (3-6 months)",
    "Long-term (6+ months)",
    "Ongoing/Flexible"
  ];

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    // Remove all non-digit characters and check if there are at least 10 digits
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  const validateStep1 = () => {
    return (
      formData.company.trim() !== "" &&
      formData.contactFirstName.trim() !== "" &&
      formData.contactLastName.trim() !== "" &&
      formData.contactTitle.trim() !== "" &&
      formData.email.trim() !== "" &&
      isValidEmail(formData.email) &&
      formData.phone.trim() !== "" &&
      isValidPhone(formData.phone)
    );
  };

  const validateStep2 = () => {
    return (
      formData.website.trim() !== "" &&
      formData.industry !== "" &&
      formData.companySize !== "" &&
      formData.budget !== ""
    );
  };

  const validateStep3 = () => {
    return (
      formData.description.trim() !== "" &&
      formData.targetAudience.trim() !== ""
    );
  };

  const validateStep4 = () => {
    return (
      formData.goals.trim() !== "" &&
      formData.timeline !== "" &&
      formData.athletePreferences.trim() !== ""
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1: return validateStep1();
      case 2: return validateStep2();
      case 3: return validateStep3();
      case 4: return validateStep4();
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (formData.email.trim() !== "" && !isValidEmail(formData.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive"
        });
        return;
      }
      if (formData.phone.trim() !== "" && !isValidPhone(formData.phone)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number (at least 10 digits).",
          variant: "destructive"
        });
        return;
      }
    }
    if (!canProceed()) {
      toast({
        title: "Please fill in all fields",
        description: "All fields are required before moving to the next step.",
        variant: "destructive"
      });
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) {
      toast({
        title: "Please fill in all fields",
        description: "All fields are required to submit your request.",
        variant: "destructive"
      });
      return;
    }
    setShowConfirmation(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await submitBrandIntake({
        company: formData.company,
        contactFirstName: formData.contactFirstName,
        contactLastName: formData.contactLastName,
        contactTitle: formData.contactTitle,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        industry: formData.industry,
        companySize: formData.companySize,
        budget: formData.budget,
        description: formData.description,
        targetAudience: formData.targetAudience,
        goals: formData.goals,
        timeline: formData.timeline,
        athletePreferences: formData.athletePreferences,
      });

      setShowConfirmation(false);
      setIsSubmitted(true);
      toast({
        title: "Partnership Request Submitted!",
        description: response.message || "Our team will reach out within 24 hours to discuss opportunities.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToStep = (targetStep: number) => {
    setShowConfirmation(false);
    setStep(targetStep);
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
                  <label className="text-sm font-semibold tracking-wider">
                    COMPANY NAME <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Your company name"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wider">
                      CONTACT FIRST NAME <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.contactFirstName}
                      onChange={(e) => setFormData({ ...formData, contactFirstName: e.target.value })}
                      placeholder="First name"
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wider">
                      CONTACT LAST NAME <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.contactLastName}
                      onChange={(e) => setFormData({ ...formData, contactLastName: e.target.value })}
                      placeholder="Last name"
                      required
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">
                    JOB TITLE <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.contactTitle}
                    onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
                    placeholder="e.g., Marketing Director, Brand Manager"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wider">
                      EMAIL <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="company@email.com"
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wider">
                      PHONE NUMBER <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      required
                      className="bg-background"
                    />
                  </div>
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
                  <label className="text-sm font-semibold tracking-wider">
                    WEBSITE <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourcompany.com"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wider">
                      INDUSTRY <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wider">
                      COMPANY SIZE <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.companySize}
                      onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">
                    MARKETING BUDGET RANGE <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.budget}
                    onValueChange={(value) => setFormData({ ...formData, budget: value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map((budget) => (
                        <SelectItem key={budget} value={budget}>
                          {budget}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <label className="text-sm font-semibold tracking-wider">
                    COMPANY DESCRIPTION <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about your company, products, and brand values"
                    rows={4}
                    required
                    className="bg-background resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">
                    TARGET AUDIENCE <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="Describe your ideal customer demographics, interests, and behaviors"
                    rows={4}
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
                  <label className="text-sm font-semibold tracking-wider">
                    CAMPAIGN GOALS <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    placeholder="What are your key objectives? (e.g., brand awareness, product launches, audience growth)"
                    rows={4}
                    required
                    className="bg-background resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">
                    CAMPAIGN TIMELINE <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.timeline}
                    onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {timelines.map((timeline) => (
                        <SelectItem key={timeline} value={timeline}>
                          {timeline}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">
                    ATHLETE PREFERENCES <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.athletePreferences}
                    onChange={(e) => setFormData({ ...formData, athletePreferences: e.target.value })}
                    placeholder="What type of athletes are you looking to partner with? (e.g., specific sports, follower count, demographics)"
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
                  onClick={handleNext}
                  className={`flex-1 font-bold group ${
                    canProceed()
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-primary/50 text-primary-foreground/70 cursor-not-allowed"
                  }`}
                >
                  NEXT
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className={`flex-1 font-bold ${
                    canProceed()
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-primary/50 text-primary-foreground/70"
                  }`}
                >
                  SUBMIT REQUEST
                </Button>
              )}
            </div>
          </motion.form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Review Your Request</DialogTitle>
            <DialogDescription>
              Please review your information before submitting. Click on any section to make changes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Company Info Summary */}
            <div 
              className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors group"
              onClick={() => goToStep(1)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Company Information</h3>
                <Edit size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-muted-foreground">Company:</span> {formData.company}</p>
                <p><span className="text-muted-foreground">Contact:</span> {formData.contactFirstName} {formData.contactLastName}</p>
                <p><span className="text-muted-foreground">Title:</span> {formData.contactTitle}</p>
                <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                <p><span className="text-muted-foreground">Phone:</span> {formData.phone}</p>
              </div>
            </div>

            {/* Industry & Budget Summary */}
            <div 
              className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors group"
              onClick={() => goToStep(2)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Industry & Budget</h3>
                <Edit size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-muted-foreground">Website:</span> {formData.website}</p>
                <p><span className="text-muted-foreground">Industry:</span> {formData.industry}</p>
                <p><span className="text-muted-foreground">Company Size:</span> {formData.companySize}</p>
                <p><span className="text-muted-foreground">Budget:</span> {formData.budget}</p>
              </div>
            </div>

            {/* Campaign Details Summary */}
            <div 
              className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors group"
              onClick={() => goToStep(3)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Campaign Details</h3>
                <Edit size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="line-clamp-2">{formData.description}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Target Audience:</span>
                  <p className="line-clamp-2">{formData.targetAudience}</p>
                </div>
              </div>
            </div>

            {/* Objectives Summary */}
            <div 
              className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors group"
              onClick={() => goToStep(4)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Partnership Objectives</h3>
                <Edit size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Goals:</span>
                  <p className="line-clamp-2">{formData.goals}</p>
                </div>
                <p><span className="text-muted-foreground">Timeline:</span> {formData.timeline}</p>
                <div>
                  <span className="text-muted-foreground">Athlete Preferences:</span>
                  <p className="line-clamp-2">{formData.athletePreferences}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="flex-1"
            >
              <Edit className="mr-2" size={18} />
              Make Changes
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2" size={18} />
                  Confirm & Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success State */}
      {isSubmitted && (
        <Dialog open={isSubmitted} onOpenChange={setIsSubmitted}>
          <DialogContent className="text-center">
            <DialogHeader>
              <div className="mx-auto mb-4 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <DialogTitle className="text-2xl font-bold">Request Submitted!</DialogTitle>
              <DialogDescription className="text-base">
                Thank you for your interest, {formData.contactFirstName}! Our team will reach out within 24 hours to discuss partnership opportunities.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center mt-4">
              <Button
                onClick={() => window.location.href = "/"}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Return Home
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BrandIntake;
