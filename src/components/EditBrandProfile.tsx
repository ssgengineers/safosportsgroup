import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BrandProfileResponse, BrandProfileUpdateRequest, updateBrandProfile } from "@/services/api";
import { X, Plus } from "lucide-react";

interface EditBrandProfileProps {
  profile: BrandProfileResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  token: string;
}

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

const EditBrandProfile = ({ profile, open, onOpenChange, onSuccess, token }: EditBrandProfileProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BrandProfileUpdateRequest>({
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

  useEffect(() => {
    if (open && profile) {
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
    }
  }, [open, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
            platform: acc.platform.toUpperCase().replace(/\s+/g, "_"), // Convert to enum format
            handle: acc.handle.trim(),
            profileUrl: acc.profileUrl,
            followers: acc.followers || 0,
          })),
      };

      console.log("Submitting brand profile update:", formattedData);
      await updateBrandProfile(profile.id, formattedData, token);
      toast({
        title: "Success!",
        description: "Your brand profile has been updated.",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update brand profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Brand Profile</DialogTitle>
          <DialogDescription>
            Update your brand profile information. All fields are optional.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Company Information */}
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry || ''}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                  name="website"
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactFirstName">First Name</Label>
                <Input
                  id="contactFirstName"
                  name="contactFirstName"
                  value={formData.contactFirstName || ''}
                  onChange={(e) => setFormData({ ...formData, contactFirstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactLastName">Last Name</Label>
                <Input
                  id="contactLastName"
                  name="contactLastName"
                  value={formData.contactLastName || ''}
                  onChange={(e) => setFormData({ ...formData, contactLastName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactTitle">Title</Label>
                <Input
                  id="contactTitle"
                  name="contactTitle"
                  value={formData.contactTitle || ''}
                  onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
                  placeholder="e.g., Marketing Director"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone || ''}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Marketing Information */}
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Marketing Information</h3>
            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Textarea
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience || ''}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                rows={3}
                placeholder="Describe your target audience..."
              />
            </div>
            <div>
              <Label htmlFor="marketingGoals">Marketing Goals</Label>
              <Textarea
                id="marketingGoals"
                name="marketingGoals"
                value={formData.marketingGoals || ''}
                onChange={(e) => setFormData({ ...formData, marketingGoals: e.target.value })}
                rows={3}
                placeholder="Describe your marketing goals..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgetRange">Budget Range</Label>
                <Select
                  value={formData.budgetRange || ''}
                  onValueChange={(value) => setFormData({ ...formData, budgetRange: value })}
                >
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                name="athletePreferences"
                value={formData.athletePreferences || ''}
                onChange={(e) => setFormData({ ...formData, athletePreferences: e.target.value })}
                rows={3}
                placeholder="Describe the type of athletes you're looking for..."
              />
            </div>
          </div>

          {/* Social Media Accounts */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Social Media Accounts</h3>
              <Button type="button" variant="outline" size="sm" onClick={addSocialAccount}>
                <Plus className="h-4 w-4 mr-1" />
                Add Account
              </Button>
            </div>
            {formData.socialAccounts?.map((account, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 md:col-span-3">
                  <Label>Platform</Label>
                  <Select
                    value={account.platform}
                    onValueChange={(value) => updateSocialAccount(index, 'platform', value)}
                  >
                    <SelectTrigger>
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
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <Label>Profile URL (optional)</Label>
                  <Input
                    value={account.profileUrl || ''}
                    onChange={(e) => updateSocialAccount(index, 'profileUrl', e.target.value)}
                    placeholder="https://..."
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
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBrandProfile;

