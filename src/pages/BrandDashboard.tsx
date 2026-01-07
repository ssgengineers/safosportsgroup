import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@clerk/clerk-react";
import { getUserMe, getMyBrandProfile, getAllAthleteProfiles, updateBrandProfile, findAthleteMatches, UserResponse, BrandProfileResponse, AthleteProfileResponse, AthleteMatchResult } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Search,
  Eye,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  School,
  Trophy,
  Instagram,
  TrendingUp,
  Star,
  DollarSign,
  Calendar,
  Video,
  Heart,
  Gamepad2,
  Shirt,
  Dumbbell,
  Camera,
  Laugh,
  Bookmark,
  BookmarkCheck,
  Filter,
  Users,
  Building2,
  Target,
  Sparkles,
  Edit3,
  Save,
  X,
  Send,
  MessageSquare,
  FileText,
  LayoutDashboard,
  UserSearch,
  Settings,
  Handshake,
  Loader2,
  Zap,
  ChevronRight,
  Twitter,
  Youtube,
  Facebook,
  Linkedin,
  ExternalLink,
} from "lucide-react";

// Type for athlete display in the UI
type Athlete = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  location?: string;
  dateOfBirth?: string;
  profileImage?: string;
  bio?: string;
  sport?: string;
  position?: string;
  school: string;
  conference?: string;
  teamRanking?: string;
  performanceLevel?: string;
  seasonStats: Record<string, any>;
  awards: string[];
  socialAccounts: Array<{
    platform: string;
    handle: string;
    followers: string | number;
  }>;
  totalFollowers: string;
  engagementRate?: string;
  interestTags: string[];
  contentTypes: string[];
  status: string;
};

const BrandDashboard = () => {
  const { toast } = useToast();
  const { getToken, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [brandProfile, setBrandProfile] = useState<BrandProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [bookmarkedAthletes, setBookmarkedAthletes] = useState<string[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactAthlete, setContactAthlete] = useState<Athlete | null>(null);
  
  // Real athlete data from database
  const [allAthletes, setAllAthletes] = useState<Athlete[]>([]);
  const [athletesLoading, setAthletesLoading] = useState(false);
  
  // Filter states
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [conferenceFilter, setConferenceFilter] = useState<string>("all");
  const [followerFilter, setFollowerFilter] = useState<string>("all");

  // Preferences editing state
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesData, setPreferencesData] = useState({
    preferredSports: [] as string[],
    minFollowers: "",
    maxFollowers: "",
    preferredConferences: [] as string[],
    interestAlignment: [] as string[],
    contentPreferences: [] as string[],
    budgetPerAthlete: "",
    dealDuration: "",
    notes: "",
  });

  // AI Search state
  const [showAISearchModal, setShowAISearchModal] = useState(false);
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiSearchResults, setAISearchResults] = useState<Array<Athlete & { matchScore: number; matchReasons: string[] }>>([]);
  const [searchStats, setSearchStats] = useState<{ totalCandidates: number; passedFilters: number } | null>(null);

  // Helper function to map API response to UI format
  const mapAthleteProfileToUI = (profile: AthleteProfileResponse): Athlete => {
    const totalFollowers = profile.socialAccounts?.reduce((sum, acc) => sum + (acc.followers || 0), 0) || 0;
    const followersFormatted = totalFollowers >= 1000 
      ? `${(totalFollowers / 1000).toFixed(0)}K` 
      : totalFollowers.toString();
    
    // Parse awards from string if needed
    let awards: string[] = [];
    if (profile.awards) {
      try {
        awards = typeof profile.awards === 'string' 
          ? profile.awards.split('\n').filter(a => a.trim())
          : [];
      } catch {
        awards = [];
      }
    }

    // Parse stats summary if available
    const seasonStats: Record<string, any> = {};
    if (profile.statsSummary) {
      try {
        const stats = JSON.parse(profile.statsSummary);
        Object.assign(seasonStats, stats);
      } catch {
        // If not JSON, try to parse as text
        seasonStats.summary = profile.statsSummary;
      }
    }

    return {
      id: profile.id,
      firstName: profile.firstName || profile.user?.firstName || "Unknown",
      lastName: profile.lastName || profile.user?.lastName || "",
      email: profile.email || profile.user?.email,
      location: profile.hometown ? `${profile.hometown}${profile.homeState ? `, ${profile.homeState}` : ''}` : undefined,
      dateOfBirth: profile.dateOfBirth,
      bio: profile.bio,
      sport: profile.sport?.toString() || "N/A",
      position: profile.position || "N/A",
      school: profile.schoolName || "Unknown",
      conference: profile.conference?.toString(),
      teamRanking: profile.teamRanking ? `#${profile.teamRanking} National` : undefined,
      performanceLevel: "D1 Elite", // Default, could be enhanced
      seasonStats,
      awards,
      socialAccounts: profile.socialAccounts?.map(acc => ({
        platform: acc.platform?.toString() || "Unknown",
        handle: acc.handle || "",
        followers: acc.followers ? (acc.followers >= 1000 ? `${(acc.followers / 1000).toFixed(0)}K` : acc.followers.toString()) : "0"
      })) || [],
      totalFollowers: followersFormatted,
      engagementRate: totalFollowers > 0 ? "4.5%" : undefined, // Default, could be calculated if we have engagement data
      interestTags: [], // Not in current API response
      contentTypes: [], // Not in current API response
      status: profile.isActive ? "active" : "inactive",
    };
  };

  const fetchAthletes = async () => {
    if (!authToken) {
      console.log("No auth token available, skipping athlete fetch");
      return;
    }
    
    setAthletesLoading(true);
    try {
      console.log("Fetching athletes with token:", authToken.substring(0, 20) + "...");
      const response = await getAllAthleteProfiles(0, 100, authToken);
      console.log("Athletes API response:", response);
      console.log("Number of athletes received:", response.content?.length || 0);
      
      if (!response.content || response.content.length === 0) {
        console.log("No athletes found in response");
        setAllAthletes([]);
        return;
      }
      
      const mappedAthletes = response.content.map(mapAthleteProfileToUI);
      console.log("Mapped athletes:", mappedAthletes.length);
      setAllAthletes(mappedAthletes);
    } catch (error) {
      console.error("Failed to fetch athletes:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      toast({
        title: "Failed to load athletes",
        description: error instanceof Error ? error.message : "Could not fetch athlete profiles. Please try again later.",
        variant: "destructive",
      });
      setAllAthletes([]);
    } finally {
      setAthletesLoading(false);
    }
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
          
          // Load preferences from database
          if (profile) {
            try {
              const preferredSports = profile.preferredSports ? JSON.parse(profile.preferredSports) : [];
              const preferredConferences = profile.preferredConferences ? JSON.parse(profile.preferredConferences) : [];
              const interestAlignment = profile.interestAlignment ? JSON.parse(profile.interestAlignment) : [];
              const contentPreferences = profile.contentPreferences ? JSON.parse(profile.contentPreferences) : [];
              
              setPreferencesData({
                preferredSports: Array.isArray(preferredSports) ? preferredSports : [],
                minFollowers: profile.minFollowers || "",
                maxFollowers: profile.maxFollowers || "",
                preferredConferences: Array.isArray(preferredConferences) ? preferredConferences : [],
                interestAlignment: Array.isArray(interestAlignment) ? interestAlignment : [],
                contentPreferences: Array.isArray(contentPreferences) ? contentPreferences : [],
                budgetPerAthlete: profile.budgetPerAthlete || "",
                dealDuration: profile.dealDuration || "",
                notes: profile.matchingNotes || "",
              });
            } catch (parseError) {
              console.error("Failed to parse preferences from database:", parseError);
              // Keep default empty state if parsing fails
            }
          }
        } catch (profileError) {
          console.error("Failed to fetch brand profile:", profileError);
          if (profileError instanceof Error && !profileError.message.includes('not found')) {
            setError(profileError.message);
          }
        }
      }

      // Fetch athletes after token is set
      // Note: fetchAthletes uses authToken from state, so we need to wait for it to be set
      // We'll fetch athletes in the useEffect below
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError(error instanceof Error ? error.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoaded, getToken]);

  // Fetch athletes when auth token is available and user/brand profile are loaded
  useEffect(() => {
    if (authToken && !loading && user && brandProfile) {
      console.log("Auth token available, fetching athletes...");
      fetchAthletes();
    }
  }, [authToken, loading, user, brandProfile]);

  // Save preferences to database
  const handleSavePreferences = async () => {
    if (!brandProfile || !authToken) {
      toast({
        title: "Error",
        description: "Unable to save preferences. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingPreferences(true);
    try {
      await updateBrandProfile(brandProfile.id, {
        preferredSports: JSON.stringify(preferencesData.preferredSports),
        preferredConferences: JSON.stringify(preferencesData.preferredConferences),
        minFollowers: preferencesData.minFollowers,
        maxFollowers: preferencesData.maxFollowers,
        interestAlignment: JSON.stringify(preferencesData.interestAlignment),
        contentPreferences: JSON.stringify(preferencesData.contentPreferences),
        budgetPerAthlete: preferencesData.budgetPerAthlete,
        dealDuration: preferencesData.dealDuration,
        matchingNotes: preferencesData.notes,
      }, authToken);

      // Refresh brand profile to get updated data
      const updatedProfile = await getMyBrandProfile(authToken);
      setBrandProfile(updatedProfile);

      setIsEditingPreferences(false);
      toast({
        title: "Preferences Saved",
        description: "Your AI matching preferences have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const runAISearch = async () => {
    if (!brandProfile || !authToken) {
      toast({
        title: "Error",
        description: "Unable to perform AI search. Please ensure you're logged in and have a brand profile.",
        variant: "destructive",
      });
      return;
    }

    setShowAISearchModal(true);
    setIsAISearching(true);
    setAISearchResults([]);
    setSearchStats(null);

    try {
      // Parse preferences to numbers where needed
      const minFollowersNum = preferencesData.minFollowers 
        ? parseInt(preferencesData.minFollowers.replace(/[^0-9]/g, "")) * 1000 
        : undefined;
      const maxFollowersNum = preferencesData.maxFollowers 
        ? parseInt(preferencesData.maxFollowers.replace(/[^0-9]/g, "")) * 1000 
        : undefined;

      // Call AI service
      const response = await findAthleteMatches(
        brandProfile.id,
        {
          campaignRequirements: {
            sport_preferences: preferencesData.preferredSports.length > 0 ? preferencesData.preferredSports : undefined,
            conference_preferences: preferencesData.preferredConferences.length > 0 ? preferencesData.preferredConferences : undefined,
            min_followers: minFollowersNum,
            content_types: preferencesData.contentPreferences.length > 0 ? preferencesData.contentPreferences : undefined,
            budget_per_athlete: preferencesData.budgetPerAthlete 
              ? parseFloat(preferencesData.budgetPerAthlete.replace(/[^0-9.]/g, "")) 
              : undefined,
          },
          maxResults: 20,
          useHybrid: true, // Use hybrid matching for better performance
        },
        authToken
      );

      console.log("AI Matching Response:", response);
      
      // Store search statistics
      setSearchStats({
        totalCandidates: response?.total_candidates || 0,
        passedFilters: response?.passed_filters || 0,
      });
      
      // Check if response has matches
      if (!response || !response.matches || response.matches.length === 0) {
        setAISearchResults([]);
        return;
      }

      // Map AI service results to UI format
      const mappedResults = response.matches.map((match: AthleteMatchResult) => {
        // Find the original athlete data
        const originalAthlete = allAthletes.find(a => a.id === match.athlete_id);
        
        if (originalAthlete) {
          return {
            ...originalAthlete,
            matchScore: match.match_score,
            matchReasons: match.match_reasons || [],
          };
        } else {
          // If athlete not in local list, create a basic entry
          return {
            id: match.athlete_id,
            firstName: match.athlete_name?.split(' ')[0] || 'Unknown',
            lastName: match.athlete_name?.split(' ').slice(1).join(' ') || '',
            sport: match.sport || 'N/A',
            position: 'N/A',
            school: match.school || 'Unknown',
            conference: undefined,
            totalFollowers: match.estimated_reach ? `${Math.floor(match.estimated_reach / 1000)}K` : '0',
            engagementRate: undefined,
            socialAccounts: [],
            seasonStats: {},
            awards: [],
            interestTags: [],
            contentTypes: [],
            status: 'active',
            matchScore: match.match_score,
            matchReasons: match.match_reasons || [],
          };
        }
      });

      setAISearchResults(mappedResults);
    } catch (error) {
      console.error("Failed to perform AI search:", error);
      toast({
        title: "AI Search Failed",
        description: error instanceof Error ? error.message : "Failed to find athlete matches. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAISearching(false);
    }
  };

  const toggleBookmark = (athleteId: string) => {
    setBookmarkedAthletes(prev => 
      prev.includes(athleteId) 
        ? prev.filter(id => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  const isBookmarked = (athleteId: string) => bookmarkedAthletes.includes(athleteId);

  const filteredAthletes = allAthletes.filter(athlete => {
    const matchesSearch = 
      `${athlete.firstName} ${athlete.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.school.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSport = sportFilter === "all" || athlete.sport === sportFilter;
    const matchesConference = conferenceFilter === "all" || athlete.conference === conferenceFilter;
    
    let matchesFollowers = true;
    if (followerFilter !== "all") {
      const followers = parseInt(athlete.totalFollowers.replace(/[^0-9]/g, ""));
      if (followerFilter === "under100k") matchesFollowers = followers < 100000;
      else if (followerFilter === "100k-250k") matchesFollowers = followers >= 100000 && followers <= 250000;
      else if (followerFilter === "250k-500k") matchesFollowers = followers >= 250000 && followers <= 500000;
      else if (followerFilter === "over500k") matchesFollowers = followers > 500000;
    }

    return matchesSearch && matchesSport && matchesConference && matchesFollowers;
  });

  const bookmarkedAthletesList = allAthletes.filter(a => bookmarkedAthletes.includes(a.id));
  
  // Mock campaigns - will be replaced with real data later
  const mockCampaigns: any[] = [];

  const getTagIcon = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes("fashion") || tagLower.includes("style")) return <Shirt size={12} />;
    if (tagLower.includes("fitness") || tagLower.includes("training")) return <Dumbbell size={12} />;
    if (tagLower.includes("gaming")) return <Gamepad2 size={12} />;
    if (tagLower.includes("lifestyle") || tagLower.includes("wellness")) return <Heart size={12} />;
    if (tagLower.includes("comedy") || tagLower.includes("funny")) return <Laugh size={12} />;
    if (tagLower.includes("video") || tagLower.includes("reels") || tagLower.includes("vlog")) return <Video size={12} />;
    if (tagLower.includes("camera") || tagLower.includes("photo")) return <Camera size={12} />;
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-500 bg-green-500/10";
      case "pending": return "text-yellow-500 bg-yellow-500/10";
      case "completed": return "text-gray-500 bg-gray-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('instagram')) return <Instagram size={16} className="text-pink-500" />;
    if (platformLower.includes('twitter') || platformLower.includes('x')) return <Twitter size={16} className="text-blue-400" />;
    if (platformLower.includes('youtube')) return <Youtube size={16} className="text-red-500" />;
    if (platformLower.includes('facebook')) return <Facebook size={16} className="text-blue-600" />;
    if (platformLower.includes('linkedin')) return <Linkedin size={16} className="text-blue-700" />;
    return <Users size={16} />;
  };

  const uniqueSports = [...new Set(allAthletes.map(a => a.sport))];
  const uniqueConferences = [...new Set(allAthletes.map(a => a.conference))];

  const stats = [
    { label: "Total Athletes", value: allAthletes.length, icon: Users, color: "text-blue-500" },
    { label: "Bookmarked", value: bookmarkedAthletes.length, icon: BookmarkCheck, color: "text-primary" },
    { label: "Active Campaigns", value: 0, icon: Handshake, color: "text-green-500" },
    { label: "Pending Deals", value: 0, icon: Clock, color: "text-yellow-500" },
  ];

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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                  {brandProfile.companyName?.[0]?.toUpperCase() || "B"}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-wider">
                    {brandProfile.companyName?.toUpperCase() || "BRAND DASHBOARD"}
                  </h1>
                  <p className="text-muted-foreground">
                    Welcome back, {brandProfile.contactFirstName || user.firstName || "Brand"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/brand-profile")}
              >
                <Building2 size={16} className="mr-2" />
                Brand Profile
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="bg-card p-6 rounded-xl border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className={stat.color} size={24} />
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Main Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-card border border-border p-1 h-auto flex-wrap gap-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <LayoutDashboard size={16} className="mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserSearch size={16} className="mr-2" />
                  Find Athletes
                </TabsTrigger>
                <TabsTrigger value="saved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BookmarkCheck size={16} className="mr-2" />
                  Saved Athletes
                  {bookmarkedAthletes.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-xs">
                      {bookmarkedAthletes.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Handshake size={16} className="mr-2" />
                  Campaigns
                </TabsTrigger>
                <TabsTrigger value="preferences" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Target size={16} className="mr-2" />
                  AI Preferences
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* AI Search CTA */}
                <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-card p-8 rounded-xl border border-primary/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <Zap className="text-primary-foreground" size={28} />
                      </div>
                      <div>
                        <h3 className="font-bold text-2xl">Find Your Perfect Match</h3>
                        <p className="text-muted-foreground">AI-powered athlete discovery based on your preferences</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
                      Our AI analyzes your brand preferences—sports, conferences, follower range, interests, and content types—to find athletes that align with your brand values and campaign goals.
                    </p>

                    <div className="flex flex-wrap gap-4 items-center">
                      <Button 
                        size="lg" 
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 shadow-lg shadow-primary/30"
                        onClick={runAISearch}
                      >
                        <Sparkles size={20} className="mr-2" />
                        Find My Match
                        <ChevronRight size={20} className="ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("preferences")}
                        className="border-primary/30 hover:border-primary"
                      >
                        <Settings size={16} className="mr-2" />
                        Edit Preferences
                      </Button>
                    </div>

                    {/* Current preferences preview */}
                    <div className="mt-6 pt-6 border-t border-primary/20">
                      <p className="text-xs text-muted-foreground mb-2">Current search criteria:</p>
                      <div className="flex flex-wrap gap-2">
                        {preferencesData.preferredSports.length > 0 ? (
                          preferencesData.preferredSports.map((sport, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-background/50">{sport}</Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-background/50">No sports selected</Badge>
                        )}
                        {preferencesData.minFollowers && preferencesData.maxFollowers ? (
                          <Badge variant="secondary" className="text-xs bg-background/50">{preferencesData.minFollowers} - {preferencesData.maxFollowers} followers</Badge>
                        ) : null}
                        {preferencesData.interestAlignment.length > 0 ? (
                          <>
                            {preferencesData.interestAlignment.slice(0, 2).map((interest, i) => (
                              <Badge key={i} variant="secondary" className="text-xs bg-background/50">{interest}</Badge>
                            ))}
                            {preferencesData.interestAlignment.length > 2 && (
                              <Badge variant="outline" className="text-xs">+{preferencesData.interestAlignment.length - 2} more</Badge>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Campaigns */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Handshake size={20} className="text-primary" />
                    Active Campaigns
                  </h3>
                  {mockCampaigns.filter(c => c.status === "active").length > 0 ? (
                    <div className="space-y-4">
                      {mockCampaigns.filter(c => c.status === "active").map((campaign) => (
                        <div key={campaign.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold border-2 border-green-500/30">
                            {campaign.athleteName?.[0]}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{campaign.athleteName}</h4>
                            <p className="text-sm text-muted-foreground">{campaign.dealType} • {campaign.value}</p>
                            <div className="mt-2 w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${campaign.progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-green-500 font-semibold">{campaign.progress}%</span>
                            <p className="text-xs text-muted-foreground">complete</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No active campaigns yet</p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-2 hover:border-primary/50"
                    onClick={() => setActiveTab("search")}
                  >
                    <UserSearch size={24} className="text-primary" />
                    <span>Find Athletes</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-2 hover:border-primary/50"
                    onClick={() => setActiveTab("saved")}
                  >
                    <BookmarkCheck size={24} className="text-primary" />
                    <span>View Saved ({bookmarkedAthletes.length})</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-2 hover:border-primary/50"
                    onClick={() => setActiveTab("preferences")}
                  >
                    <Settings size={24} className="text-primary" />
                    <span>Update Preferences</span>
                  </Button>
                </div>
              </TabsContent>

              {/* Find Athletes Tab */}
              <TabsContent value="search" className="space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                      placeholder="Search by name, sport, or school..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-background"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Filters:</span>
                    </div>
                    <Select value={sportFilter} onValueChange={setSportFilter}>
                      <SelectTrigger className="w-40 bg-background">
                        <SelectValue placeholder="Sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sports</SelectItem>
                        {uniqueSports.map(sport => (
                          <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={conferenceFilter} onValueChange={setConferenceFilter}>
                      <SelectTrigger className="w-40 bg-background">
                        <SelectValue placeholder="Conference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Conferences</SelectItem>
                        {uniqueConferences.map(conf => (
                          <SelectItem key={conf} value={conf}>{conf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={followerFilter} onValueChange={setFollowerFilter}>
                      <SelectTrigger className="w-44 bg-background">
                        <SelectValue placeholder="Followers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Followers</SelectItem>
                        <SelectItem value="under100k">Under 100K</SelectItem>
                        <SelectItem value="100k-250k">100K - 250K</SelectItem>
                        <SelectItem value="250k-500k">250K - 500K</SelectItem>
                        <SelectItem value="over500k">Over 500K</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4">
                  {athletesLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Loader2 size={48} className="mx-auto mb-4 opacity-50 animate-spin" />
                      <p>Loading athletes...</p>
                    </div>
                  ) : filteredAthletes.length > 0 ? (
                    filteredAthletes.map((athlete) => (
                      <motion.div
                        key={athlete.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-6">
                          <div 
                            className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/30 cursor-pointer hover:border-primary transition-colors"
                            onClick={() => setSelectedAthlete(athlete)}
                          >
                            {athlete.firstName?.[0]}{athlete.lastName?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 
                                className="text-xl font-bold cursor-pointer hover:text-primary transition-colors"
                                onClick={() => setSelectedAthlete(athlete)}
                              >
                                {athlete.firstName} {athlete.lastName}
                              </h3>
                            </div>
                            <p className="text-muted-foreground mb-2">
                              {athlete.sport} • {athlete.position} • {athlete.school}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                <span className="text-foreground font-semibold">{athlete.totalFollowers}</span> followers
                              </span>
                              <span className="text-muted-foreground">
                                <span className="text-green-500 font-semibold">{athlete.engagementRate}</span> engagement
                              </span>
                            </div>
                          </div>

                          {athlete.socialAccounts && athlete.socialAccounts.length > 0 && (
                            <div className="hidden lg:flex flex-wrap gap-1 max-w-xs">
                              {athlete.socialAccounts.slice(0, 3).map((acc, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {getSocialIcon(acc.platform)}
                                  <span className="ml-1">{acc.platform}</span>
                                </Badge>
                              ))}
                              {athlete.socialAccounts.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{athlete.socialAccounts.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleBookmark(athlete.id)}
                              className={isBookmarked(athlete.id) ? "text-primary" : "text-muted-foreground"}
                            >
                              {isBookmarked(athlete.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedAthlete(athlete)}>
                              <Eye size={14} className="mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : allAthletes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <UserSearch size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">No athletes available</p>
                      <p className="text-sm">There are currently no athlete profiles in the system.</p>
                      <p className="text-sm mt-2">Athletes will appear here once they complete their sign-up and profile creation.</p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <UserSearch size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No athletes found matching your search criteria</p>
                      <p className="text-sm mt-2">Try adjusting your filters or search terms</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Saved Athletes Tab */}
              <TabsContent value="saved" className="space-y-6">
                {bookmarkedAthletesList.length > 0 ? (
                  <div className="grid gap-4">
                    {bookmarkedAthletesList.map((athlete) => (
                      <motion.div
                        key={athlete.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-6">
                          <div 
                            className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary cursor-pointer"
                            onClick={() => setSelectedAthlete(athlete)}
                          >
                            {athlete.firstName?.[0]}{athlete.lastName?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="text-xl font-bold cursor-pointer hover:text-primary transition-colors"
                              onClick={() => setSelectedAthlete(athlete)}
                            >
                              {athlete.firstName} {athlete.lastName}
                            </h3>
                            <p className="text-muted-foreground mb-2">
                              {athlete.sport} • {athlete.position} • {athlete.school}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                <span className="text-foreground font-semibold">{athlete.totalFollowers}</span> followers
                              </span>
                              {athlete.engagementRate && (
                                <span className="text-muted-foreground">
                                  <span className="text-green-500 font-semibold">{athlete.engagementRate}</span> engagement
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleBookmark(athlete.id)}
                              className="text-primary"
                            >
                              <BookmarkCheck size={20} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setContactAthlete(athlete);
                                setShowContactModal(true);
                              }}
                            >
                              <MessageSquare size={14} className="mr-1" />
                              Contact
                            </Button>
                            <Button variant="default" size="sm" onClick={() => setSelectedAthlete(athlete)}>
                              <Eye size={14} className="mr-1" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <Bookmark size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No saved athletes yet</h3>
                    <p className="mb-4">Browse athletes and bookmark the ones you're interested in</p>
                    <Button onClick={() => setActiveTab("search")}>
                      <UserSearch size={16} className="mr-2" />
                      Find Athletes
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Campaigns Tab */}
              <TabsContent value="campaigns" className="space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Your Campaigns</h3>
                    <Button className="bg-primary text-primary-foreground">
                      <FileText size={16} className="mr-2" />
                      New Campaign
                    </Button>
                  </div>
                  
                  {mockCampaigns.length > 0 ? (
                    <div className="space-y-4">
                      {mockCampaigns.map((campaign) => (
                        <div key={campaign.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold border-2 border-border">
                              {campaign.athleteName?.[0]}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-lg">{campaign.athleteName}</h4>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                  {campaign.status === "active" ? <CheckCircle size={12} /> : <Clock size={12} />}
                                  {campaign.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                <div>
                                  <p className="text-muted-foreground">Deal Type</p>
                                  <p className="font-medium">{campaign.dealType}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Value</p>
                                  <p className="font-medium text-green-500">{campaign.value}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Start Date</p>
                                  <p className="font-medium">{campaign.startDate}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">End Date</p>
                                  <p className="font-medium">{campaign.endDate}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">Deliverables:</p>
                                <div className="flex flex-wrap gap-2">
                                  {campaign.deliverables.map((item, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              {campaign.status === "active" && (
                                <div className="mt-4">
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{campaign.progress}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full transition-all"
                                      style={{ width: `${campaign.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Handshake size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No campaigns yet. Start by finding athletes to partner with!</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* AI Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                <div className="bg-gradient-to-br from-primary/5 via-card to-card p-6 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="text-primary" size={24} />
                    <h3 className="font-bold text-lg">AI Matching Preferences</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">
                    Define what you're looking for in athlete partners. Our AI will use these preferences to recommend the best matches.
                  </p>
                  
                  <div className="flex justify-end mb-6">
                    <Button 
                      variant={isEditingPreferences ? "default" : "outline"}
                      onClick={() => {
                        if (isEditingPreferences) {
                          handleSavePreferences();
                        } else {
                          setIsEditingPreferences(true);
                        }
                      }}
                      disabled={isSavingPreferences}
                    >
                      {isSavingPreferences ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : isEditingPreferences ? (
                        <>
                          <Save size={16} className="mr-2" />
                          Save Preferences
                        </>
                      ) : (
                        <>
                          <Edit3 size={16} className="mr-2" />
                          Edit Preferences
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-background/50 rounded-lg">
                        <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <Trophy size={16} className="text-primary" />
                          Preferred Sports
                        </label>
                        {isEditingPreferences ? (
                          <Input
                            value={preferencesData.preferredSports.join(", ")}
                            onChange={(e) => setPreferencesData({...preferencesData, preferredSports: e.target.value.split(", ").map(s => s.trim()).filter(s => s)})}
                            className="bg-background"
                            placeholder="Football, Basketball, Soccer"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {preferencesData.preferredSports.length > 0 ? (
                              preferencesData.preferredSports.map((sport, i) => (
                                <Badge key={i} className="bg-primary/10 text-primary">{sport}</Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No sports selected</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-background/50 rounded-lg">
                        <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <Users size={16} className="text-primary" />
                          Follower Range
                        </label>
                        {isEditingPreferences ? (
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={preferencesData.minFollowers}
                              onChange={(e) => setPreferencesData({...preferencesData, minFollowers: e.target.value})}
                              className="bg-background"
                              placeholder="Min (e.g., 50K)"
                            />
                            <Input
                              value={preferencesData.maxFollowers}
                              onChange={(e) => setPreferencesData({...preferencesData, maxFollowers: e.target.value})}
                              className="bg-background"
                              placeholder="Max (e.g., 500K)"
                            />
                          </div>
                        ) : (
                          <p className="font-medium">
                            {preferencesData.minFollowers && preferencesData.maxFollowers 
                              ? `${preferencesData.minFollowers} - ${preferencesData.maxFollowers}`
                              : <span className="text-muted-foreground">Not set</span>
                            }
                          </p>
                        )}
                      </div>

                      <div className="p-4 bg-background/50 rounded-lg">
                        <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <School size={16} className="text-primary" />
                          Preferred Conferences
                        </label>
                        {isEditingPreferences ? (
                          <Input
                            value={preferencesData.preferredConferences.join(", ")}
                            onChange={(e) => setPreferencesData({...preferencesData, preferredConferences: e.target.value.split(", ").map(c => c.trim()).filter(c => c)})}
                            className="bg-background"
                            placeholder="ACC, Big Ten, SEC"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {preferencesData.preferredConferences.length > 0 ? (
                              preferencesData.preferredConferences.map((conf, i) => (
                                <Badge key={i} variant="secondary">{conf}</Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No conferences selected</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-background/50 rounded-lg">
                        <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <DollarSign size={16} className="text-primary" />
                          Budget Per Athlete
                        </label>
                        {isEditingPreferences ? (
                          <Input
                            value={preferencesData.budgetPerAthlete}
                            onChange={(e) => setPreferencesData({...preferencesData, budgetPerAthlete: e.target.value})}
                            className="bg-background"
                            placeholder="$5,000 - $15,000"
                          />
                        ) : (
                          <p className="font-medium text-green-500">
                            {preferencesData.budgetPerAthlete || <span className="text-muted-foreground">Not set</span>}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-background/50 rounded-lg">
                        <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <Heart size={16} className="text-primary" />
                          Interest Alignment
                        </label>
                        {isEditingPreferences ? (
                          <Input
                            value={preferencesData.interestAlignment.join(", ")}
                            onChange={(e) => setPreferencesData({...preferencesData, interestAlignment: e.target.value.split(", ").map(i => i.trim()).filter(i => i)})}
                            className="bg-background"
                            placeholder="Fitness, Health, Wellness"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {preferencesData.interestAlignment.length > 0 ? (
                              preferencesData.interestAlignment.map((interest, i) => (
                                <Badge key={i} className="bg-primary/10 text-primary">{interest}</Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No interests selected</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-background/50 rounded-lg">
                        <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <Video size={16} className="text-primary" />
                          Content Preferences
                        </label>
                        {isEditingPreferences ? (
                          <Input
                            value={preferencesData.contentPreferences.join(", ")}
                            onChange={(e) => setPreferencesData({...preferencesData, contentPreferences: e.target.value.split(", ").map(c => c.trim()).filter(c => c)})}
                            className="bg-background"
                            placeholder="Training Videos, Lifestyle"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {preferencesData.contentPreferences.length > 0 ? (
                              preferencesData.contentPreferences.map((content, i) => (
                                <Badge key={i} variant="secondary">{content}</Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No content types selected</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-background/50 rounded-lg">
                        <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <Calendar size={16} className="text-primary" />
                          Preferred Deal Duration
                        </label>
                        {isEditingPreferences ? (
                          <Input
                            value={preferencesData.dealDuration}
                            onChange={(e) => setPreferencesData({...preferencesData, dealDuration: e.target.value})}
                            className="bg-background"
                            placeholder="3-6 months"
                          />
                        ) : (
                          <p className="font-medium">
                            {preferencesData.dealDuration || <span className="text-muted-foreground">Not set</span>}
                          </p>
                        )}
                      </div>

                      <div className="p-4 bg-background/50 rounded-lg">
                        <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <FileText size={16} className="text-primary" />
                          Additional Notes
                        </label>
                        {isEditingPreferences ? (
                          <Textarea
                            value={preferencesData.notes}
                            onChange={(e) => setPreferencesData({...preferencesData, notes: e.target.value})}
                            className="bg-background"
                            rows={3}
                            placeholder="Any other preferences..."
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {preferencesData.notes || "No additional notes"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Athlete Profile Modal - keeping the original modal structure */}
      <Dialog open={!!selectedAthlete} onOpenChange={() => setSelectedAthlete(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
          {selectedAthlete && (
            <>
              <div className="relative h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
                <div className="absolute -bottom-16 left-8">
                  <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center text-primary text-4xl font-bold border-4 border-background shadow-xl">
                    {selectedAthlete.firstName?.[0]}{selectedAthlete.lastName?.[0]}
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleBookmark(selectedAthlete.id)}
                    className={isBookmarked(selectedAthlete.id) ? "border-primary text-primary" : ""}
                  >
                    {isBookmarked(selectedAthlete.id) ? (
                      <>
                        <BookmarkCheck size={16} className="mr-1" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark size={16} className="mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="pt-20 px-8 pb-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-1">
                      {selectedAthlete.firstName} {selectedAthlete.lastName}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {selectedAthlete.sport} • {selectedAthlete.position}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{selectedAthlete.totalFollowers}</p>
                    <p className="text-sm text-muted-foreground">Total Followers</p>
                    <p className="text-sm text-green-500 mt-1">{selectedAthlete.engagementRate} engagement</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-muted rounded-xl">
                  <p className="text-sm leading-relaxed">{selectedAthlete.bio}</p>
                </div>

                <Tabs defaultValue="background" className="space-y-4">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="background">Background</TabsTrigger>
                    <TabsTrigger value="social">Social Media</TabsTrigger>
                    <TabsTrigger value="tags">Interests & Content</TabsTrigger>
                  </TabsList>

                  <TabsContent value="background" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-card rounded-xl border border-border">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <School size={18} className="text-primary" />
                          School & Conference
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">School</span>
                            <span className="font-medium">{selectedAthlete.school}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Conference</span>
                            <span className="font-medium">{selectedAthlete.conference}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Team Ranking</span>
                            <span className="font-medium text-primary">{selectedAthlete.teamRanking}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Level</span>
                            <span className="font-medium">{selectedAthlete.performanceLevel}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-card rounded-xl border border-border">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Trophy size={18} className="text-yellow-500" />
                          Awards & Recognition
                        </h4>
                        <ul className="space-y-2">
                          {selectedAthlete.awards.map((award, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Star size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span>{award}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {Object.keys(selectedAthlete.seasonStats).length > 0 && (
                      <div className="p-4 bg-card rounded-xl border border-border">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp size={18} className="text-green-500" />
                          Season Statistics
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(selectedAthlete.seasonStats).map(([key, value]) => (
                            <div key={key} className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-2xl font-bold">{value}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="social" className="space-y-4">
                    {selectedAthlete.socialAccounts && selectedAthlete.socialAccounts.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedAthlete.socialAccounts.map((account, i) => (
                            <div key={i} className="p-4 bg-card rounded-xl border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getSocialIcon(account.platform)}
                                  <span className="font-semibold">{account.platform}</span>
                                </div>
                                <span className="text-lg font-bold">{account.followers}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{account.handle}</p>
                            </div>
                          ))}
                        </div>
                        {selectedAthlete.engagementRate && (
                          <div className="p-4 bg-muted rounded-xl">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Overall Engagement Rate</span>
                              <span className="text-2xl font-bold text-green-500">{selectedAthlete.engagementRate}</span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No social media accounts available</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tags" className="space-y-6">
                    {selectedAthlete.socialAccounts && selectedAthlete.socialAccounts.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Users size={18} className="text-primary" />
                          Social Media Accounts
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedAthlete.socialAccounts.map((account, i) => (
                            <div key={i} className="p-4 bg-card rounded-xl border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getSocialIcon(account.platform)}
                                  <span className="font-semibold">{account.platform}</span>
                                </div>
                                <span className="text-lg font-bold">{account.followers}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{account.handle}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedAthlete.bio && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText size={18} className="text-blue-500" />
                          Bio
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedAthlete.bio}</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="mt-6 pt-6 border-t border-border flex gap-3">
                  <Button
                    className="flex-1 bg-primary text-primary-foreground"
                    onClick={() => {
                      setContactAthlete(selectedAthlete);
                      setSelectedAthlete(null);
                      setShowContactModal(true);
                    }}
                  >
                    <MessageSquare size={16} className="mr-2" />
                    Contact Athlete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toggleBookmark(selectedAthlete.id)}
                    className={isBookmarked(selectedAthlete.id) ? "border-primary text-primary" : ""}
                  >
                    {isBookmarked(selectedAthlete.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Athlete</DialogTitle>
            <DialogDescription>
              Send a partnership inquiry to {contactAthlete?.firstName} {contactAthlete?.lastName}
            </DialogDescription>
          </DialogHeader>
          {contactAthlete && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold border-2 border-primary">
                  {contactAthlete.firstName?.[0]}{contactAthlete.lastName?.[0]}
                </div>
                <div>
                  <h4 className="font-semibold">{contactAthlete.firstName} {contactAthlete.lastName}</h4>
                  <p className="text-sm text-muted-foreground">{contactAthlete.sport} • {contactAthlete.school}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Subject</label>
                <Input placeholder="Partnership Opportunity" className="bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Message</label>
                <Textarea 
                  placeholder="Tell them about your brand and the partnership opportunity..."
                  rows={5}
                  className="bg-background"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button className="bg-primary text-primary-foreground" onClick={() => {
              toast({
                title: "Message sent",
                description: `Your inquiry has been sent to ${contactAthlete?.firstName} ${contactAthlete?.lastName}`,
              });
              setShowContactModal(false);
            }}>
              <Send size={16} className="mr-2" />
              Send Inquiry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Search Results Modal */}
      <Dialog open={showAISearchModal} onOpenChange={setShowAISearchModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-card border-b border-border p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="text-primary-foreground" size={20} />
                </div>
                AI Match Results
              </DialogTitle>
              <DialogDescription>
                Athletes ranked by compatibility with your brand preferences
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6">
            {isAISearching ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/10 animate-ping" />
                </div>
                <h3 className="text-xl font-bold mb-2">Analyzing Athletes...</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Our AI is evaluating {allAthletes.length} athletes based on your preferences for sports, conferences, follower count, interests, and content types.
                </p>
              </div>
            ) : aiSearchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Matches Found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {searchStats ? (
                    <>
                      We searched <span className="font-semibold text-foreground">{searchStats.totalCandidates}</span> athletes, 
                      but <span className="font-semibold text-foreground">{searchStats.passedFilters}</span> passed your current filters.
                      <br /><br />
                      Try adjusting your preferences to find more matches:
                    </>
                  ) : (
                    "No athletes matched your current search criteria. Try adjusting your preferences to find more matches."
                  )}
                </p>
                <div className="flex flex-col gap-3 w-full max-w-md">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold mb-2">Suggestions:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Lower or remove minimum follower requirements</li>
                      <li>Expand your preferred sports or conferences</li>
                      <li>Adjust content type preferences</li>
                      <li>Check your budget per athlete settings</li>
                    </ul>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAISearchModal(false);
                        setActiveTab("preferences");
                      }}
                    >
                      <Settings size={16} className="mr-2" />
                      Edit Preferences
                    </Button>
                    <Button variant="default" onClick={() => setShowAISearchModal(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {aiSearchResults.map((athlete, index) => (
                  <motion.div
                    key={athlete.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-5 rounded-xl border transition-all cursor-pointer hover:shadow-lg ${
                      index === 0 
                        ? "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30" 
                        : "bg-card border-border hover:border-primary/30"
                    }`}
                    onClick={() => {
                      setShowAISearchModal(false);
                      setSelectedAthlete(athlete);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? "bg-primary text-primary-foreground" :
                        index === 1 ? "bg-gray-300 text-gray-700" :
                        index === 2 ? "bg-amber-600 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>

                      <div className={`w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold border-2 ${
                        index === 0 ? "border-primary" : "border-border"
                      }`}>
                        {athlete.firstName?.[0]}{athlete.lastName?.[0]}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-lg">{athlete.firstName} {athlete.lastName}</h4>
                          {index === 0 && (
                            <Badge className="bg-primary text-primary-foreground">
                              <Star size={12} className="mr-1" />
                              Top Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {athlete.sport} • {athlete.position} • {athlete.school}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {athlete.matchReasons.map((reason, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              <CheckCircle size={10} className="mr-1 text-green-500" />
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className={`text-3xl font-black ${
                          athlete.matchScore >= 70 ? "text-green-500" :
                          athlete.matchScore >= 50 ? "text-yellow-500" :
                          "text-muted-foreground"
                        }`}>
                          {athlete.matchScore}%
                        </div>
                        <p className="text-xs text-muted-foreground">match score</p>
                        <div className="mt-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(athlete.id);
                            }}
                          >
                            {isBookmarked(athlete.id) ? (
                              <BookmarkCheck size={16} className="text-primary" />
                            ) : (
                              <Bookmark size={16} />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAISearchModal(false);
                              setSelectedAthlete(athlete);
                            }}
                          >
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {aiSearchResults.length > 0 && (
                  <div className="pt-4 border-t border-border text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Found {aiSearchResults.length} athletes • Showing results from highest to lowest match
                    </p>
                    <Button variant="outline" onClick={() => setShowAISearchModal(false)}>
                      Close Results
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandDashboard;
