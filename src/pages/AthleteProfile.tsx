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
import { getUserMe, getMyAthleteProfile, updateAthleteProfile, UserResponse, AthleteProfileResponse, AthleteProfileUpdateRequest } from "@/services/api";
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
  MapPin,
  School,
  Trophy,
  BarChart3,
  Award,
} from "lucide-react";

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

const AthleteProfile = () => {
  const { toast } = useToast();
  const { getToken, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<AthleteProfileUpdateRequest>({
    firstName: "",
    lastName: "",
    sport: "",
    position: "",
    schoolName: "",
    conference: "",
    bio: "",
    hometown: "",
    state: "",
    dateOfBirth: "",
    gender: "",
    teamRanking: undefined,
    statsSummary: "",
    awards: "",
    achievements: "",
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

      // Try to fetch athlete profile
      if (userData.hasAthleteProfile || userData.roles.includes("ATHLETE")) {
        try {
          const profile = await getMyAthleteProfile(token);
          setAthleteProfile(profile);
          // Initialize form data
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
        } catch (profileError) {
          console.error("Failed to fetch athlete profile:", profileError);
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
    if (!athleteProfile) {
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
            platform: acc.platform,
            handle: acc.handle.trim(),
            profileUrl: acc.profileUrl,
            followers: acc.followers || 0,
          })),
      };

      await updateAthleteProfile(athleteProfile.id, formattedData, freshToken);
      
      // Refresh profile data with fresh token
      const updatedToken = await getToken();
      const updatedProfile = await getMyAthleteProfile(updatedToken || freshToken);
      setAthleteProfile(updatedProfile);
      
      // Update auth token state
      if (updatedToken) {
        setAuthToken(updatedToken);
      }
      
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your athlete profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to update athlete profile:", error);
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
    if (athleteProfile) {
      setFormData({
        firstName: athleteProfile.firstName || "",
        lastName: athleteProfile.lastName || "",
        sport: athleteProfile.sport?.toString() || "",
        position: athleteProfile.position || "",
        schoolName: athleteProfile.schoolName || "",
        conference: athleteProfile.conference || "",
        bio: athleteProfile.bio || "",
        hometown: athleteProfile.hometown || "",
        state: athleteProfile.homeState || "",
        dateOfBirth: athleteProfile.dateOfBirth || "",
        gender: athleteProfile.gender || "",
        teamRanking: athleteProfile.teamRanking,
        statsSummary: athleteProfile.statsSummary || "",
        awards: athleteProfile.awards || "",
        achievements: athleteProfile.achievements || "",
        socialAccounts: athleteProfile.socialAccounts?.map(acc => ({
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

  if (error || !user || !athleteProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Profile Not Found</h1>
            <p className="text-foreground mb-2">It looks like your athlete profile hasn't been fully set up yet.</p>
            <p className="text-muted-foreground text-sm mb-4">
              Your account has the ATHLETE role, but no profile was created.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">Refresh</Button>
              <Button onClick={() => navigate("/athlete-dashboard")} variant="default">
                <ArrowLeft size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalFollowers = athleteProfile.socialAccounts?.reduce((sum, acc) => sum + (acc.followers || 0), 0) || 0;

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
                  onClick={() => navigate("/athlete-dashboard")}
                  className="mb-2"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Dashboard
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/athlete-dashboard")}
              >
                <LayoutDashboard size={16} className="mr-2" />
                Dashboard
              </Button>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                {athleteProfile.firstName?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-wider">
                  {athleteProfile.firstName && athleteProfile.lastName
                    ? `${athleteProfile.firstName.toUpperCase()} ${athleteProfile.lastName.toUpperCase()}`
                    : "ATHLETE PROFILE"}
                </h1>
                <p className="text-muted-foreground">
                  Manage your athlete profile and information
                </p>
              </div>
            </div>
          </motion.div>

          {/* Athlete Profile Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Athlete Information</h3>
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
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">First Name</label>
                        <p className="mt-1 font-medium">{athleteProfile.firstName || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Last Name</label>
                        <p className="mt-1 font-medium">{athleteProfile.lastName || "N/A"}</p>
                      </div>
                      {athleteProfile.dateOfBirth && (
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground">Date of Birth</label>
                          <p className="mt-1 font-medium">
                            {new Date(athleteProfile.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {athleteProfile.gender && (
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground">Gender</label>
                          <p className="mt-1 font-medium">{athleteProfile.gender}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {athleteProfile.hometown && (
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <MapPin size={14} />
                            Location
                          </label>
                          <p className="mt-1 font-medium">
                            {athleteProfile.hometown}{athleteProfile.homeState ? `, ${athleteProfile.homeState}` : ''}
                          </p>
                        </div>
                      )}
                      {athleteProfile.email && (
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground">Email</label>
                          <p className="mt-1 font-medium">{athleteProfile.email || user?.email || "N/A"}</p>
                        </div>
                      )}
                      {totalFollowers > 0 && (
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground">Total Followers</label>
                          <p className="mt-1 font-medium text-primary">{totalFollowers.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Athletic Information */}
                  {(athleteProfile.sport || athleteProfile.position || athleteProfile.schoolName || athleteProfile.conference) && (
                    <div className="pt-6 border-t border-border">
                      <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                        <School size={18} className="text-primary" />
                        Athletic Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {athleteProfile.sport && (
                          <div>
                            <label className="text-sm font-semibold text-muted-foreground">Sport</label>
                            <p className="mt-1 font-medium">{athleteProfile.sport}</p>
                          </div>
                        )}
                        {athleteProfile.position && (
                          <div>
                            <label className="text-sm font-semibold text-muted-foreground">Position</label>
                            <p className="mt-1 font-medium">{athleteProfile.position}</p>
                          </div>
                        )}
                        {athleteProfile.schoolName && (
                          <div>
                            <label className="text-sm font-semibold text-muted-foreground">School</label>
                            <p className="mt-1 font-medium">{athleteProfile.schoolName}</p>
                          </div>
                        )}
                        {athleteProfile.conference && (
                          <div>
                            <label className="text-sm font-semibold text-muted-foreground">Conference</label>
                            <p className="mt-1 font-medium">{athleteProfile.conference}</p>
                          </div>
                        )}
                        {athleteProfile.teamRanking && (
                          <div>
                            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <Trophy size={14} className="text-yellow-500" />
                              Team Ranking
                            </label>
                            <p className="mt-1 font-medium">#{athleteProfile.teamRanking}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {athleteProfile.bio && (
                    <div className="pt-6 border-t border-border">
                      <label className="text-sm font-semibold text-muted-foreground">Bio</label>
                      <p className="mt-1 text-muted-foreground leading-relaxed">{athleteProfile.bio}</p>
                    </div>
                  )}

                  {/* Performance & Recognition */}
                  {(athleteProfile.statsSummary || athleteProfile.awards || athleteProfile.achievements) && (
                    <div className="pt-6 border-t border-border space-y-4">
                      <h4 className="text-md font-semibold flex items-center gap-2">
                        <BarChart3 size={18} className="text-green-500" />
                        Performance & Recognition
                      </h4>
                      {athleteProfile.statsSummary && (
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground">Season Statistics</label>
                          <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{athleteProfile.statsSummary}</p>
                        </div>
                      )}
                      {athleteProfile.awards && (
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <Award size={14} className="text-yellow-500" />
                            Awards & Recognition
                          </label>
                          <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{athleteProfile.awards}</p>
                        </div>
                      )}
                      {athleteProfile.achievements && (
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground">Achievements</label>
                          <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{athleteProfile.achievements}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid gap-4">
                    <h4 className="text-md font-semibold">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={formData.gender || ""}
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger className="bg-background">
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
                  <div className="grid gap-4 pt-4 border-t border-border">
                    <h4 className="text-md font-semibold">Athletic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sport">Sport</Label>
                        <Select
                          value={formData.sport || ""}
                          onValueChange={(value) => setFormData({ ...formData, sport: value })}
                        >
                          <SelectTrigger className="bg-background">
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
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor="schoolName">School</Label>
                        <Input
                          id="schoolName"
                          value={formData.schoolName}
                          onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                          placeholder="e.g., Duke University"
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor="conference">Conference</Label>
                        <Input
                          id="conference"
                          value={formData.conference}
                          onChange={(e) => setFormData({ ...formData, conference: e.target.value })}
                          placeholder="e.g., ACC, Big Ten"
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor="teamRanking">Team Ranking</Label>
                        <Input
                          id="teamRanking"
                          type="number"
                          value={formData.teamRanking || ""}
                          onChange={(e) => setFormData({ ...formData, teamRanking: e.target.value ? parseInt(e.target.value) : undefined })}
                          placeholder="e.g., 1, 5, 10"
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid gap-4 pt-4 border-t border-border">
                    <h4 className="text-md font-semibold">Location</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hometown">Hometown</Label>
                        <Input
                          id="hometown"
                          value={formData.hometown}
                          onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                          placeholder="e.g., Durham"
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="e.g., NC"
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="grid gap-4 pt-4 border-t border-border">
                    <h4 className="text-md font-semibold">Bio</h4>
                    <div>
                      <Label htmlFor="bio">Tell us about yourself</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Share your story, achievements, and what makes you unique..."
                        rows={4}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  {/* Performance & Recognition */}
                  <div className="grid gap-4 pt-4 border-t border-border">
                    <h4 className="text-md font-semibold">Performance & Recognition</h4>
                    <div>
                      <Label htmlFor="statsSummary">Season Statistics</Label>
                      <Textarea
                        id="statsSummary"
                        value={formData.statsSummary || ""}
                        onChange={(e) => setFormData({ ...formData, statsSummary: e.target.value })}
                        placeholder="Enter your season statistics (e.g., Points: 15.2 PPG, Rebounds: 8.5 RPG, Assists: 4.2 APG)"
                        rows={4}
                        className="bg-background"
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
                        className="bg-background"
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
                        className="bg-background"
                      />
                    </div>
                  </div>
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
                  athleteProfile.socialAccounts && athleteProfile.socialAccounts.length > 0 ? (
                    <div className="space-y-2">
                      {athleteProfile.socialAccounts.map((account, index) => (
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
                            onValueChange={(value) => updateSocialAccount(index, "platform", value)}
                          >
                            <SelectTrigger className="bg-background">
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
                        <div className="col-span-12 md:col-span-4">
                          <Label>Handle</Label>
                          <Input
                            value={account.handle}
                            onChange={(e) => updateSocialAccount(index, "handle", e.target.value)}
                            placeholder="@username"
                            className="bg-background"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-3">
                          <Label>Followers</Label>
                          <Input
                            type="number"
                            value={account.followers || 0}
                            onChange={(e) => updateSocialAccount(index, "followers", parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="bg-background"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-2">
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

export default AthleteProfile;

