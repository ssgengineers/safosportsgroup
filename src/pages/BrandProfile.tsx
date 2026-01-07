import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@clerk/clerk-react";
import { getUserMe, getMyBrandProfile, updateBrandProfile, UserResponse, BrandProfileResponse, BrandProfileUpdateRequest } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Edit3,
  ExternalLink,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Linkedin,
  Users,
  ArrowLeft,
  LayoutDashboard,
  Save,
  X,
  Plus,
  Loader2,
} from "lucide-react";

const INDUSTRIES = [
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

const COMPANY_SIZES = [
  "Startup (1-10 employees)",
  "Small (11-50 employees)",
  "Medium (51-200 employees)",
  "Large (201-1000 employees)",
  "Enterprise (1000+ employees)"
];

const BUDGET_RANGES = [
  "Under $5,000",
  "$5,000 - $15,000",
  "$15,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000 - $250,000",
  "$250,000+"
];

const TIMELINES = [
  "Immediate (within 1 month)",
  "Short-term (1-3 months)",
  "Medium-term (3-6 months)",
  "Long-term (6+ months)",
  "Ongoing/Flexible"
];

const SOCIAL_PLATFORMS = [
  "INSTAGRAM",
  "TIKTOK",
  "TWITTER",
  "YOUTUBE",
  "FACEBOOK",
  "SNAPCHAT",
  "LINKEDIN",
  "THREADS",
  "OTHER"
];

const BrandProfile = () => {
  const { toast } = useToast();
  const { getToken, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<BrandProfileUpdateRequest>({
    companyName: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
    contactFirstName: "",
    contactLastName: "",
    contactTitle: "",
    contactEmail: "",
    contactPhone: "",
    targetAudience: "",
    marketingGoals: "",
    budgetRange: "",
    preferredTimeline: "",
    athletePreferences: "",
    socialAccounts: [],
  });

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('instagram')) return <Instagram size={16} className="text-pink-500" />;
    if (platformLower.includes('twitter') || platformLower.includes('x')) return <Twitter size={16} className="text-blue-400" />;
    if (platformLower.includes('youtube')) return <Youtube size={16} className="text-red-500" />;
    if (platformLower.includes('facebook')) return <Facebook size={16} className="text-blue-600" />;
    if (platformLower.includes('linkedin')) return <Linkedin size={16} className="text-blue-700" />;
    return <Users size={16} />;
  };

  const fetchData = async () => {
    if (!isLoaded) return;
    
    try {
      const token = await getToken();
      setAuthToken(token);
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      // Fetch user data
      const userData = await getUserMe(token);
      setUser(userData);

      // Try to fetch brand profile
      if (userData.hasBrandProfile || userData.roles.includes("BRAND")) {
        try {
          const profile = await getMyBrandProfile(token);
          setBrandProfile(profile);
          // Initialize form data
          setFormData({
            companyName: profile.companyName || "",
            industry: profile.industry || "",
            companySize: profile.companySize || "",
            website: profile.website || "",
            description: profile.description || "",
            contactFirstName: profile.contactFirstName || "",
            contactLastName: profile.contactLastName || "",
            contactTitle: profile.contactTitle || "",
            contactEmail: profile.contactEmail || "",
            contactPhone: profile.contactPhone || "",
            targetAudience: profile.targetAudience || "",
            marketingGoals: profile.marketingGoals || "",
            budgetRange: profile.budgetRange || "",
            preferredTimeline: profile.preferredTimeline || "",
            athletePreferences: profile.athletePreferences || "",
            socialAccounts: profile.socialAccounts?.map(acc => ({
              platform: acc.platform.toString(),
              handle: acc.handle,
              profileUrl: acc.profileUrl,
              followers: acc.followers,
            })) || [],
          });
        } catch (profileError) {
          console.error("Failed to fetch brand profile:", profileError);
          if (profileError instanceof Error && !profileError.message.includes('not found')) {
            setError(profileError.message);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError(error instanceof Error ? error.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoaded, getToken]);

  const handleSave = async () => {
    if (!brandProfile) {
      toast({
        title: "Error",
        description: "Unable to save profile. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Refresh token before update to ensure it's valid
      const freshToken = await getToken();
      if (!freshToken) {
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Format the data for the API
      const formattedData: BrandProfileUpdateRequest = {
        companyName: formData.companyName || undefined,
        industry: formData.industry || undefined,
        companySize: formData.companySize || undefined,
        website: formData.website || undefined,
        description: formData.description || undefined,
        contactFirstName: formData.contactFirstName || undefined,
        contactLastName: formData.contactLastName || undefined,
        contactTitle: formData.contactTitle || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        targetAudience: formData.targetAudience || undefined,
        marketingGoals: formData.marketingGoals || undefined,
        budgetRange: formData.budgetRange || undefined,
        preferredTimeline: formData.preferredTimeline || undefined,
        athletePreferences: formData.athletePreferences || undefined,
        // Filter out empty social accounts and format them
        socialAccounts: formData.socialAccounts
          ?.filter(acc => acc.platform && acc.handle && acc.handle.trim() !== "")
          .map(acc => ({
            platform: acc.platform.toUpperCase().replace(/\s+/g, "_"),
            handle: acc.handle.trim(),
            profileUrl: acc.profileUrl,
            followers: acc.followers || 0,
          })),
      };

      await updateBrandProfile(brandProfile.id, formattedData, freshToken);
      
      // Refresh profile data with fresh token
      const updatedToken = await getToken();
      const updatedProfile = await getMyBrandProfile(updatedToken || freshToken);
      setBrandProfile(updatedProfile);
      
      // Update auth token state
      if (updatedToken) {
        setAuthToken(updatedToken);
      }
      
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your brand profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to update brand profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current profile values
    if (brandProfile) {
      setFormData({
        companyName: brandProfile.companyName || "",
        industry: brandProfile.industry || "",
        companySize: brandProfile.companySize || "",
        website: brandProfile.website || "",
        description: brandProfile.description || "",
        contactFirstName: brandProfile.contactFirstName || "",
        contactLastName: brandProfile.contactLastName || "",
        contactTitle: brandProfile.contactTitle || "",
        contactEmail: brandProfile.contactEmail || "",
        contactPhone: brandProfile.contactPhone || "",
        targetAudience: brandProfile.targetAudience || "",
        marketingGoals: brandProfile.marketingGoals || "",
        budgetRange: brandProfile.budgetRange || "",
        preferredTimeline: brandProfile.preferredTimeline || "",
        athletePreferences: brandProfile.athletePreferences || "",
        socialAccounts: brandProfile.socialAccounts?.map(acc => ({
          platform: acc.platform.toString(),
          handle: acc.handle,
          profileUrl: acc.profileUrl,
          followers: acc.followers,
        })) || [],
      });
    }
    setIsEditing(false);
  };

  const addSocialAccount = () => {
    setFormData({
      ...formData,
      socialAccounts: [
        ...(formData.socialAccounts || []),
        { platform: "OTHER", handle: "", followers: 0 },
      ],
    });
  };

  const removeSocialAccount = (index: number) => {
    setFormData({
      ...formData,
      socialAccounts: formData.socialAccounts?.filter((_, i) => i !== index) || [],
    });
  };

  const updateSocialAccount = (index: number, field: string, value: string | number) => {
    const updated = [...(formData.socialAccounts || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, socialAccounts: updated });
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !user || !brandProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Profile Not Found</h1>
            <p className="text-foreground mb-2">It looks like your brand profile hasn't been fully set up yet.</p>
            <p className="text-muted-foreground text-sm mb-4">
              Your account has the BRAND role, but no profile was created.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">Refresh</Button>
              <Button onClick={() => navigate("/brand-dashboard")} variant="default">
                <ArrowLeft size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/brand-dashboard")}
                  className="mb-2"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Dashboard
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/brand-dashboard")}
              >
                <LayoutDashboard size={16} className="mr-2" />
                Dashboard
              </Button>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                {brandProfile.companyName?.[0]?.toUpperCase() || "B"}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-wider">
                  {brandProfile.companyName?.toUpperCase() || "BRAND PROFILE"}
                </h1>
                <p className="text-muted-foreground">
                  Manage your brand information and settings
                </p>
              </div>
            </div>
          </motion.div>

          {/* Brand Profile Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Brand Information</h3>
                {!isEditing ? (
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X size={16} className="mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                // View Mode
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Company Name</label>
                      <p className="mt-1 font-medium">{brandProfile.companyName || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">First Name</label>
                        <p className="mt-1 font-medium">{brandProfile.contactFirstName || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Last Name</label>
                        <p className="mt-1 font-medium">{brandProfile.contactLastName || "N/A"}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Job Title</label>
                      <p className="mt-1 font-medium">{brandProfile.contactTitle || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Email</label>
                      <p className="mt-1 font-medium">{brandProfile.contactEmail || brandProfile.email || user?.email || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Phone</label>
                      <p className="mt-1 font-medium">{brandProfile.contactPhone || "N/A"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Website</label>
                      {brandProfile.website ? (
                        <a 
                          href={brandProfile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-1 font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          {brandProfile.website}
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <p className="mt-1 font-medium text-muted-foreground">N/A</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Industry</label>
                      <p className="mt-1 font-medium">{brandProfile.industry || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Company Size</label>
                      <p className="mt-1 font-medium">{brandProfile.companySize || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Marketing Budget</label>
                      <p className="mt-1 font-medium text-green-500">{brandProfile.budgetRange || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Description</label>
                      <p className="mt-1 text-muted-foreground">{brandProfile.description || "N/A"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-6">
                  {/* Company Information */}
                  <div className="grid gap-4">
                    <h4 className="text-md font-semibold">Company Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName || ''}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                          value={formData.industry || ''}
                          onValueChange={(value) => setFormData({ ...formData, industry: value })}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select Industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRIES.map((ind) => (
                              <SelectItem key={ind} value={ind}>
                                {ind}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="companySize">Company Size</Label>
                        <Select
                          value={formData.companySize || ''}
                          onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select Company Size" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPANY_SIZES.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website || ''}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://example.com"
                          className="bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Company Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid gap-4 pt-4 border-t border-border">
                    <h4 className="text-md font-semibold">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactFirstName">First Name</Label>
                        <Input
                          id="contactFirstName"
                          value={formData.contactFirstName || ''}
                          onChange={(e) => setFormData({ ...formData, contactFirstName: e.target.value })}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactLastName">Last Name</Label>
                        <Input
                          id="contactLastName"
                          value={formData.contactLastName || ''}
                          onChange={(e) => setFormData({ ...formData, contactLastName: e.target.value })}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactTitle">Title</Label>
                        <Input
                          id="contactTitle"
                          value={formData.contactTitle || ''}
                          onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
                          placeholder="e.g., Marketing Director"
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactEmail">Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={formData.contactEmail || ''}
                          onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactPhone">Phone</Label>
                        <Input
                          id="contactPhone"
                          type="tel"
                          value={formData.contactPhone || ''}
                          onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Marketing Information */}
                  <div className="grid gap-4 pt-4 border-t border-border">
                    <h4 className="text-md font-semibold">Marketing Information</h4>
                    <div>
                      <Label htmlFor="targetAudience">Target Audience</Label>
                      <Textarea
                        id="targetAudience"
                        value={formData.targetAudience || ''}
                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        rows={3}
                        placeholder="Describe your target audience..."
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="marketingGoals">Marketing Goals</Label>
                      <Textarea
                        id="marketingGoals"
                        value={formData.marketingGoals || ''}
                        onChange={(e) => setFormData({ ...formData, marketingGoals: e.target.value })}
                        rows={3}
                        placeholder="Describe your marketing goals..."
                        className="bg-background"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budgetRange">Budget Range</Label>
                        <Select
                          value={formData.budgetRange || ''}
                          onValueChange={(value) => setFormData({ ...formData, budgetRange: value })}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select Budget Range" />
                          </SelectTrigger>
                          <SelectContent>
                            {BUDGET_RANGES.map((range) => (
                              <SelectItem key={range} value={range}>
                                {range}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="preferredTimeline">Preferred Timeline</Label>
                        <Select
                          value={formData.preferredTimeline || ''}
                          onValueChange={(value) => setFormData({ ...formData, preferredTimeline: value })}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select Timeline" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMELINES.map((timeline) => (
                              <SelectItem key={timeline} value={timeline}>
                                {timeline}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="athletePreferences">Athlete Preferences</Label>
                      <Textarea
                        id="athletePreferences"
                        value={formData.athletePreferences || ''}
                        onChange={(e) => setFormData({ ...formData, athletePreferences: e.target.value })}
                        rows={3}
                        placeholder="Describe the type of athletes you're looking for..."
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Info - Only shown in view mode, edit mode shows it in the form above */}
              {!isEditing && (brandProfile.targetAudience || brandProfile.marketingGoals || brandProfile.preferredTimeline) && (
                <div className="mt-6 pt-6 border-t border-border space-y-4">
                  {brandProfile.targetAudience && (
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Target Audience</label>
                      <p className="mt-1 text-muted-foreground">{brandProfile.targetAudience}</p>
                    </div>
                  )}
                  {brandProfile.marketingGoals && (
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Marketing Goals</label>
                      <p className="mt-1 text-muted-foreground">{brandProfile.marketingGoals}</p>
                    </div>
                  )}
                  {brandProfile.preferredTimeline && (
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Preferred Timeline</label>
                      <p className="mt-1 font-medium">{brandProfile.preferredTimeline}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Social Accounts */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-muted-foreground">Social Media Accounts</label>
                  {isEditing && (
                    <Button type="button" variant="outline" size="sm" onClick={addSocialAccount}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Account
                    </Button>
                  )}
                </div>
                {!isEditing ? (
                  // View Mode
                  brandProfile.socialAccounts && brandProfile.socialAccounts.length > 0 ? (
                    <div className="space-y-2">
                      {brandProfile.socialAccounts.map((account, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            {getSocialIcon(account.platform.toString())}
                            <span className="text-sm font-medium">{account.handle}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {account.followers && (
                              <span className="text-xs text-muted-foreground">
                                {account.followers.toLocaleString()} followers
                              </span>
                            )}
                            {account.profileUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={account.profileUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink size={14} />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No social media accounts added</p>
                  )
                ) : (
                  // Edit Mode
                  <div className="space-y-3">
                    {formData.socialAccounts?.map((account, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-12 md:col-span-3">
                          <Label>Platform</Label>
                          <Select
                            value={account.platform}
                            onValueChange={(value) => updateSocialAccount(index, 'platform', value)}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SOCIAL_PLATFORMS.map((platform) => (
                                <SelectItem key={platform} value={platform}>
                                  {platform.replace(/_/g, ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                          <Label>Handle</Label>
                          <Input
                            value={account.handle}
                            onChange={(e) => updateSocialAccount(index, 'handle', e.target.value)}
                            placeholder="@username"
                            className="bg-background"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                          <Label>Profile URL (optional)</Label>
                          <Input
                            value={account.profileUrl || ''}
                            onChange={(e) => updateSocialAccount(index, 'profileUrl', e.target.value)}
                            placeholder="https://..."
                            className="bg-background"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSocialAccount(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!formData.socialAccounts || formData.socialAccounts.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">No social media accounts. Click "Add Account" to add one.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default BrandProfile;

