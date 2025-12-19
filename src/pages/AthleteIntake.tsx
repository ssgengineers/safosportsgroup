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
import { CheckCircle, ChevronRight, Plus, X, Edit, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialAccount {
  platform: string;
  handle: string;
}

const AthleteIntake = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    location: "",
    school: "",
    sport: "",
    position: "",
    bio: "",
    goals: ""
  });

  const [primarySocial, setPrimarySocial] = useState<SocialAccount>({
    platform: "",
    handle: ""
  });

  const [additionalSocials, setAdditionalSocials] = useState<SocialAccount[]>([]);

  const socialPlatforms = [
    "Instagram",
    "TikTok",
    "Twitter/X",
    "YouTube",
    "Facebook",
    "Snapchat",
    "LinkedIn",
    "Twitch"
  ];

  const addSocialAccount = () => {
    setAdditionalSocials([...additionalSocials, { platform: "", handle: "" }]);
  };

  const removeSocialAccount = (index: number) => {
    setAdditionalSocials(additionalSocials.filter((_, i) => i !== index));
  };

  const updateAdditionalSocial = (index: number, field: keyof SocialAccount, value: string) => {
    const updated = [...additionalSocials];
    updated[index][field] = value;
    setAdditionalSocials(updated);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      isValidEmail(formData.email) &&
      formData.dateOfBirth.trim() !== "" &&
      formData.location.trim() !== ""
    );
  };

  const validateStep2 = () => {
    return (
      formData.school.trim() !== "" &&
      formData.sport.trim() !== "" &&
      formData.position.trim() !== ""
    );
  };

  const validateStep3 = () => {
    return (
      primarySocial.platform !== "" &&
      primarySocial.handle.trim() !== ""
    );
  };

  const validateStep4 = () => {
    return (
      formData.bio.trim() !== "" &&
      formData.goals.trim() !== ""
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
    if (step === 1 && formData.email.trim() !== "" && !isValidEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
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
        description: "All fields are required to submit your application.",
        variant: "destructive"
      });
      return;
    }
    setShowConfirmation(true);
  };

  const handleFinalSubmit = () => {
    setShowConfirmation(false);
    setIsSubmitted(true);
    toast({
      title: "Application Submitted!",
      description: "We'll review your profile and be in touch within 48 hours.",
    });
    
    window.location.href = "/";
  };

  const goToStep = (targetStep: number) => {
    setShowConfirmation(false);
    setStep(targetStep);
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wider">
                      FIRST NAME <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="First name"
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wider">
                      LAST NAME <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Last name"
                      required
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">
                    EMAIL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wider">
                      DATE OF BIRTH <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wider">
                      WHERE DO YOU RESIDE? <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, State/Country"
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
                <h2 className="text-3xl font-bold mb-8">Athletic Background</h2>
                <div className="space-y-2">
                  <label className="text-sm font-semibold tracking-wider">
                    SCHOOL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    placeholder="Your school or university"
                    required
                    className="bg-background"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wider">
                      SPORT <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.sport}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      placeholder="e.g., Basketball, Football, Soccer"
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-wider">
                      POSITION(S) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g., Point Guard, Quarterback"
                      required
                      className="bg-background"
                    />
                  </div>
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
                
                {/* Primary Social Account */}
                <div className="p-6 bg-background rounded-xl border border-border">
                  <h3 className="text-lg font-semibold mb-4">Primary Social Account <span className="text-red-500">*</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold tracking-wider">PLATFORM</label>
                      <Select
                        value={primarySocial.platform}
                        onValueChange={(value) => setPrimarySocial({ ...primarySocial, platform: value })}
                      >
                        <SelectTrigger className="bg-card">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {socialPlatforms.map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {platform}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold tracking-wider">HANDLE</label>
                      <Input
                        value={primarySocial.handle}
                        onChange={(e) => setPrimarySocial({ ...primarySocial, handle: e.target.value })}
                        placeholder="@yourhandle"
                        className="bg-card"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Social Accounts */}
                {additionalSocials.map((social, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-background rounded-xl border border-border relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeSocialAccount(index)}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <h3 className="text-lg font-semibold mb-4">Additional Account {index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold tracking-wider">PLATFORM</label>
                        <Select
                          value={social.platform}
                          onValueChange={(value) => updateAdditionalSocial(index, "platform", value)}
                        >
                          <SelectTrigger className="bg-card">
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {socialPlatforms.map((platform) => (
                              <SelectItem key={platform} value={platform}>
                                {platform}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold tracking-wider">HANDLE</label>
                        <Input
                          value={social.handle}
                          onChange={(e) => updateAdditionalSocial(index, "handle", e.target.value)}
                          placeholder="@yourhandle"
                          className="bg-card"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Add More Button */}
                <Button
                  type="button"
                  onClick={addSocialAccount}
                  variant="outline"
                  className="w-full border-dashed border-2 hover:border-primary hover:text-primary"
                >
                  <Plus className="mr-2" size={20} />
                  Add Another Social Account
                </Button>
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
                  <label className="text-sm font-semibold tracking-wider">
                    TELL US ABOUT YOURSELF <span className="text-red-500">*</span>
                  </label>
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
                  <label className="text-sm font-semibold tracking-wider">
                    PARTNERSHIP GOALS <span className="text-red-500">*</span>
                  </label>
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
                  SUBMIT APPLICATION
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
            <DialogTitle className="text-2xl font-bold">Review Your Application</DialogTitle>
            <DialogDescription>
              Please review your information before submitting. Click on any section to make changes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Personal Info Summary */}
            <div 
              className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors group"
              onClick={() => goToStep(1)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <Edit size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-muted-foreground">Name:</span> {formData.firstName} {formData.lastName}</p>
                <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                <p><span className="text-muted-foreground">DOB:</span> {formData.dateOfBirth}</p>
                <p><span className="text-muted-foreground">From:</span> {formData.location}</p>
              </div>
            </div>

            {/* Athletic Background Summary */}
            <div 
              className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors group"
              onClick={() => goToStep(2)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Athletic Background</h3>
                <Edit size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-muted-foreground">School:</span> {formData.school}</p>
                <p><span className="text-muted-foreground">Sport:</span> {formData.sport}</p>
                <p><span className="text-muted-foreground">Position:</span> {formData.position}</p>
              </div>
            </div>

            {/* Social Media Summary */}
            <div 
              className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors group"
              onClick={() => goToStep(3)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Social Media</h3>
                <Edit size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Primary:</span> {primarySocial.platform} - {primarySocial.handle}</p>
                {additionalSocials.map((social, index) => (
                  social.platform && social.handle && (
                    <p key={index}><span className="text-muted-foreground">Additional:</span> {social.platform} - {social.handle}</p>
                  )
                ))}
              </div>
            </div>

            {/* Goals Summary */}
            <div 
              className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors group"
              onClick={() => goToStep(4)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Goals</h3>
                <Edit size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">About:</span>
                  <p className="line-clamp-2">{formData.bio}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Partnership Goals:</span>
                  <p className="line-clamp-2">{formData.goals}</p>
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
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="mr-2" size={18} />
              Confirm & Submit
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
              <DialogTitle className="text-2xl font-bold">Application Submitted!</DialogTitle>
              <DialogDescription className="text-base">
                Thank you for applying, {formData.firstName}! We'll review your profile and be in touch within 48 hours.
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

export default AthleteIntake;
