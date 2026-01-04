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
import { AthleteProfileResponse, AthleteProfileUpdateRequest, updateAthleteProfile } from "@/services/api";
import { X, Plus } from "lucide-react";

interface EditAthleteProfileProps {
  profile: AthleteProfileResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  token: string;
}

const SPORTS = [
  "BASKETBALL",
  "FOOTBALL",
  "BASEBALL",
  "SOCCER",
  "VOLLEYBALL",
  "TENNIS",
  "TRACK_AND_FIELD",
  "SWIMMING",
  "GOLF",
  "SOFTBALL",
  "LACROSSE",
  "WRESTLING",
  "GYMNASTICS",
  "OTHER",
];

const SOCIAL_PLATFORMS = [
  "INSTAGRAM",
  "TIKTOK",
  "TWITTER",
  "YOUTUBE",
  "FACEBOOK",
  "SNAPCHAT",
  "LINKEDIN",
];

const EditAthleteProfile = ({ profile, open, onOpenChange, onSuccess, token }: EditAthleteProfileProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AthleteProfileUpdateRequest>({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    sport: profile.sport?.toString() || "",
    position: profile.position || "",
    schoolName: profile.schoolName || "",
    conference: profile.conference || "",
    bio: profile.bio || "",
    hometown: profile.hometown || "",
    state: profile.homeState || "",
    dateOfBirth: profile.dateOfBirth || "",
    gender: profile.gender || "",
    teamRanking: profile.teamRanking,
    statsSummary: profile.statsSummary || "",
    awards: profile.awards || "",
    achievements: profile.achievements || "",
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
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        sport: profile.sport?.toString() || "",
        position: profile.position || "",
        schoolName: profile.schoolName || "",
        conference: profile.conference || "",
        bio: profile.bio || "",
        hometown: profile.hometown || "",
        state: profile.homeState || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        teamRanking: profile.teamRanking,
        statsSummary: profile.statsSummary || "",
        awards: profile.awards || "",
        achievements: profile.achievements || "",
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
      const formattedData: AthleteProfileUpdateRequest = {
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        sport: formData.sport || undefined,
        position: formData.position || undefined,
        schoolName: formData.schoolName || undefined,
        conference: formData.conference || undefined,
        bio: formData.bio || undefined,
        hometown: formData.hometown || undefined,
        state: formData.state || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        teamRanking: formData.teamRanking || undefined,
        statsSummary: formData.statsSummary || undefined,
        awards: formData.awards || undefined,
        achievements: formData.achievements || undefined,
        // Filter out empty social accounts and format them
        socialAccounts: formData.socialAccounts
          ?.filter(acc => acc.platform && acc.handle && acc.handle.trim() !== "")
          .map(acc => ({
            platform: acc.platform, // Backend will parse this using SocialPlatform.fromString()
            handle: acc.handle.trim(),
            profileUrl: acc.profileUrl,
            followers: acc.followers || 0,
          })),
      };

      console.log("Submitting profile update:", formattedData);
      await updateAthleteProfile(profile.id, formattedData, token);
      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
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
        { platform: "INSTAGRAM", handle: "", followers: 0 },
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your athlete profile information. All fields are optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender || ""}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Athletic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Athletic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sport">Sport</Label>
                <Select
                  value={formData.sport || ""}
                  onValueChange={(value) => setFormData({ ...formData, sport: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g., Point Guard, Quarterback"
                />
              </div>
              <div>
                <Label htmlFor="schoolName">School</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="e.g., Duke University"
                />
              </div>
              <div>
                <Label htmlFor="conference">Conference</Label>
                <Input
                  id="conference"
                  value={formData.conference}
                  onChange={(e) => setFormData({ ...formData, conference: e.target.value })}
                  placeholder="e.g., ACC, Big Ten"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hometown">Hometown</Label>
                <Input
                  id="hometown"
                  value={formData.hometown}
                  onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                  placeholder="e.g., Durham"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g., NC"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bio</h3>
            <div>
              <Label htmlFor="bio">Tell us about yourself</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your story, achievements, and what makes you unique..."
                rows={4}
              />
            </div>
          </div>

          {/* Performance & Recognition */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Performance & Recognition</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamRanking">Team Ranking</Label>
                <Input
                  id="teamRanking"
                  type="number"
                  value={formData.teamRanking || ""}
                  onChange={(e) => setFormData({ ...formData, teamRanking: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="e.g., 1, 5, 10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="statsSummary">Season Statistics</Label>
              <Textarea
                id="statsSummary"
                value={formData.statsSummary || ""}
                onChange={(e) => setFormData({ ...formData, statsSummary: e.target.value })}
                placeholder="Enter your season statistics (e.g., Points: 15.2 PPG, Rebounds: 8.5 RPG, Assists: 4.2 APG)"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can enter statistics in any format (e.g., JSON, plain text, or formatted)
              </p>
            </div>
            <div>
              <Label htmlFor="awards">Awards & Recognition</Label>
              <Textarea
                id="awards"
                value={formData.awards || ""}
                onChange={(e) => setFormData({ ...formData, awards: e.target.value })}
                placeholder="List your awards and recognition (e.g., All-Conference First Team, MVP, Player of the Year)"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can enter awards as a list, JSON array, or plain text
              </p>
            </div>
            <div>
              <Label htmlFor="achievements">Achievements</Label>
              <Textarea
                id="achievements"
                value={formData.achievements || ""}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                placeholder="Additional achievements and accomplishments"
                rows={3}
              />
            </div>
          </div>

          {/* Social Accounts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Social Media Accounts</h3>
              <Button type="button" variant="outline" size="sm" onClick={addSocialAccount}>
                <Plus size={14} className="mr-1" />
                Add Account
              </Button>
            </div>
            {formData.socialAccounts?.map((account, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3">
                  <Label>Platform</Label>
                  <Select
                    value={account.platform}
                    onValueChange={(value) => updateSocialAccount(index, "platform", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform.charAt(0) + platform.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-4">
                  <Label>Handle</Label>
                  <Input
                    value={account.handle}
                    onChange={(e) => updateSocialAccount(index, "handle", e.target.value)}
                    placeholder="@username"
                  />
                </div>
                <div className="col-span-3">
                  <Label>Followers</Label>
                  <Input
                    type="number"
                    value={account.followers || 0}
                    onChange={(e) => updateSocialAccount(index, "followers", parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSocialAccount(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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

export default EditAthleteProfile;

