import { motion } from "framer-motion";
import { useState } from "react";
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
import {
  LayoutDashboard,
  User,
  Briefcase,
  BarChart3,
  Settings,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Target,
  Star,
  Award,
  Instagram,
  MessageSquare,
  Eye,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  Bell,
  Mail,
  Phone,
  MapPin,
  School,
  Trophy,
  Camera,
  Image as ImageIcon,
  Video,
  FileText,
  Sparkles,
  Zap,
  ChevronRight,
  Loader2,
  Heart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  followers: string;
  engagementRate: string;
  verified: boolean;
}

interface ActivePartnership {
  id: string;
  brandName: string;
  brandLogo: string;
  dealType: string;
  value: string;
  status: string;
  startDate: string;
  endDate: string;
  progress: number;
  deliverables: string[];
}

interface Opportunity {
  id: string;
  brandName: string;
  brandLogo: string;
  description: string;
  budget: string;
  requirements: string[];
  matchScore?: number;
  matchReasons?: string[];
  deadline: string;
  sport?: string;
  duration?: string;
  industry?: string;
  brandCategory?: string;
  minFollowers?: string;
  maxFollowers?: string;
  preferredContentTypes?: string[];
  brandInterests?: string[];
  dealType?: string;
}

interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  thumbnail?: string;
  uploadedAt: string;
}

// Mock data
const mockAthleteProfile = {
  id: "1",
  firstName: "James",
  lastName: "Wilson",
  email: "james.w@duke.edu",
  profileImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face",
  bio: "4-year starter at Duke, team captain for 2 seasons. Passionate about helping young athletes reach their potential through mentorship and creating authentic content that inspires.",
  school: "Duke University",
  sport: "Basketball",
  position: "Shooting Guard",
  conference: "ACC",
  location: "Durham, NC",
  dateOfBirth: "2003-05-12",
  completenessScore: 85,
};

const mockSocialAccounts: SocialAccount[] = [
  {
    id: "1",
    platform: "Instagram",
    handle: "@jwilson_duke",
    followers: "125K",
    engagementRate: "4.8%",
    verified: true,
  },
  {
    id: "2",
    platform: "TikTok",
    handle: "@jameswilson",
    followers: "89K",
    engagementRate: "6.2%",
    verified: false,
  },
  {
    id: "3",
    platform: "Twitter/X",
    handle: "@jwilson2",
    followers: "45K",
    engagementRate: "3.5%",
    verified: false,
  },
];

const mockActivePartnerships: ActivePartnership[] = [
  {
    id: "1",
    brandName: "FitFuel Nutrition",
    brandLogo: "",
    dealType: "Sponsored Content",
    value: "$8,000",
    status: "active",
    startDate: "2024-11-01",
    endDate: "2025-02-01",
    progress: 65,
    deliverables: ["4 Instagram posts", "2 TikTok videos", "Story features"],
  },
  {
    id: "2",
    brandName: "SneakerBrand Co",
    brandLogo: "",
    dealType: "Ambassador",
    value: "$12,000",
    status: "active",
    startDate: "2024-10-15",
    endDate: "2025-04-15",
    progress: 40,
    deliverables: ["Monthly content", "Product features", "Event appearance"],
  },
];

const mockOpportunities: Opportunity[] = [
  {
    id: "1",
    brandName: "SportsTech App",
    brandLogo: "",
    description: "Looking for college athletes to promote our fitness tracking app",
    budget: "$5,000 - $10,000",
    requirements: ["Instagram 50K+", "Basketball player", "Active content creator"],
    deadline: "2024-12-15",
    sport: "Basketball",
    duration: "3 months",
    industry: "Technology",
    brandCategory: "Fitness & Health",
    minFollowers: "50K",
    maxFollowers: "500K",
    preferredContentTypes: ["Training Videos", "Product Reviews", "Lifestyle"],
    brandInterests: ["Fitness", "Health", "Technology", "Training"],
    dealType: "Sponsored Content",
  },
  {
    id: "2",
    brandName: "Energy Drink Co",
    brandLogo: "",
    description: "Seeking athletes for energy drink campaign targeting college students",
    budget: "$3,000 - $7,000",
    requirements: ["Multi-platform presence", "Engagement rate 4%+", "College athlete"],
    deadline: "2024-12-20",
    sport: "Any",
    duration: "2 months",
    industry: "Beverages",
    brandCategory: "Sports & Fitness",
    minFollowers: "25K",
    maxFollowers: "300K",
    preferredContentTypes: ["Lifestyle", "Behind the Scenes", "Reels"],
    brandInterests: ["Sports", "Lifestyle", "Energy", "Performance"],
    dealType: "Campaign",
  },
  {
    id: "3",
    brandName: "Fashion Brand",
    brandLogo: "",
    description: "Athlete ambassador program for new athletic wear line",
    budget: "$10,000 - $15,000",
    requirements: ["Fashion interest", "High engagement", "Authentic content"],
    deadline: "2025-01-05",
    sport: "Any",
    duration: "6 months",
    industry: "Fashion",
    brandCategory: "Apparel",
    minFollowers: "75K",
    maxFollowers: "1M",
    preferredContentTypes: ["Fashion", "Lifestyle", "Get Ready With Me"],
    brandInterests: ["Fashion", "Style", "Athletic Wear", "Lifestyle"],
    dealType: "Ambassador",
  },
  {
    id: "4",
    brandName: "Nutrition Supplements",
    brandLogo: "",
    description: "Looking for athletes to promote premium protein and supplements",
    budget: "$8,000 - $12,000",
    requirements: ["Fitness content", "Health-focused", "50K+ followers"],
    deadline: "2025-01-10",
    sport: "Any",
    duration: "4 months",
    industry: "Health & Wellness",
    brandCategory: "Supplements",
    minFollowers: "50K",
    maxFollowers: "400K",
    preferredContentTypes: ["Training Videos", "Product Reviews", "Health Tips"],
    brandInterests: ["Fitness", "Health", "Nutrition", "Wellness"],
    dealType: "Sponsored Content",
  },
  {
    id: "5",
    brandName: "Gaming Platform",
    brandLogo: "",
    description: "Seeking athletes who are also gamers for streaming partnerships",
    budget: "$6,000 - $10,000",
    requirements: ["Gaming interest", "Streaming experience", "Multi-platform"],
    deadline: "2025-01-15",
    sport: "Any",
    duration: "3 months",
    industry: "Gaming",
    brandCategory: "Entertainment",
    minFollowers: "40K",
    maxFollowers: "500K",
    preferredContentTypes: ["Gaming Streams", "Lifestyle", "Behind the Scenes"],
    brandInterests: ["Gaming", "Entertainment", "Streaming", "Esports"],
    dealType: "Partnership",
  },
  {
    id: "6",
    brandName: "Sneaker Company",
    brandLogo: "",
    description: "Athlete collaboration for limited edition sneaker release",
    budget: "$15,000 - $25,000",
    requirements: ["Sneaker culture interest", "High engagement", "Fashion sense"],
    deadline: "2025-01-20",
    sport: "Basketball",
    duration: "6 months",
    industry: "Footwear",
    brandCategory: "Sneakers",
    minFollowers: "100K",
    maxFollowers: "1M",
    preferredContentTypes: ["Fashion", "Sneaker Content", "Lifestyle"],
    brandInterests: ["Sneakers", "Fashion", "Streetwear", "Culture"],
    dealType: "Ambassador",
  },
];

// Mock athlete preferences for AI matching
const mockAthletePreferences = {
  preferredBrandCategories: ["Fitness & Health", "Technology", "Fashion", "Sports & Fitness"],
  minBudget: "$5,000",
  maxBudget: "$20,000",
  preferredDealDuration: "3-6 months",
  preferredContentTypes: ["Training Videos", "Lifestyle", "Product Reviews"],
  brandInterests: ["Fitness", "Health", "Fashion", "Technology"],
  notes: "Looking for brands that align with my values of health, fitness, and authentic content creation.",
};

const mockMedia: MediaItem[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400",
    type: "image",
    uploadedAt: "2024-11-15",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    type: "image",
    uploadedAt: "2024-11-10",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400",
    uploadedAt: "2024-11-05",
  },
];

const AthleteDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(mockAthleteProfile);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(mockSocialAccounts);
  const [activePartnerships, setActivePartnerships] = useState<ActivePartnership[]>(mockActivePartnerships);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities);
  const [bookmarkedOpportunities, setBookmarkedOpportunities] = useState<string[]>(["1"]);
  const [media, setMedia] = useState<MediaItem[]>(mockMedia);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showAddSocialModal, setShowAddSocialModal] = useState(false);
  const [newSocialAccount, setNewSocialAccount] = useState({ platform: "", handle: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("all");
  
  // AI Search state
  const [showAISearchModal, setShowAISearchModal] = useState(false);
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiSearchResults, setAISearchResults] = useState<Array<Opportunity & { matchScore: number; matchReasons: string[] }>>([]);
  
  // Preferences editing state
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [preferencesData, setPreferencesData] = useState(mockAthletePreferences);

  // Calculate total followers from social accounts
  const getTotalFollowers = () => {
    return socialAccounts.reduce((total, account) => {
      const followers = parseInt(account.followers.replace(/[^0-9]/g, "")) * (account.followers.includes("K") ? 1000 : 1);
      return total + followers;
    }, 0);
  };

  // AI Matching function - calculates match score based on athlete profile and preferences
  const calculateOpportunityMatchScore = (opportunity: Opportunity, athleteProfile: typeof mockAthleteProfile, prefs: typeof preferencesData): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];
    const totalFollowers = getTotalFollowers();

    // Sport match: +25 points
    if (opportunity.sport === "Any" || opportunity.sport?.toLowerCase() === athleteProfile.sport.toLowerCase()) {
      score += 25;
      reasons.push(`Sport match: ${athleteProfile.sport}`);
    }

    // Budget range check: +20 points
    const minBudget = parseInt(prefs.minBudget.replace(/[^0-9]/g, "")) * 1000;
    const maxBudget = parseInt(prefs.maxBudget.replace(/[^0-9]/g, "")) * 1000;
    const oppMinBudget = parseInt(opportunity.budget.split("-")[0].replace(/[^0-9]/g, "")) * 1000;
    const oppMaxBudget = parseInt(opportunity.budget.split("-")[1]?.replace(/[^0-9]/g, "") || opportunity.budget.replace(/[^0-9]/g, "")) * 1000;
    
    if ((oppMinBudget >= minBudget && oppMinBudget <= maxBudget) || 
        (oppMaxBudget >= minBudget && oppMaxBudget <= maxBudget) ||
        (oppMinBudget <= minBudget && oppMaxBudget >= maxBudget)) {
      score += 20;
      reasons.push(`Budget in range: ${opportunity.budget}`);
    }

    // Follower range check: +15 points
    if (opportunity.minFollowers && opportunity.maxFollowers) {
      const oppMin = parseInt(opportunity.minFollowers.replace(/[^0-9]/g, "")) * 1000;
      const oppMax = parseInt(opportunity.maxFollowers.replace(/[^0-9]/g, "")) * 1000;
      if (totalFollowers >= oppMin && totalFollowers <= oppMax) {
        score += 15;
        reasons.push(`Followers in range: ${Math.round(totalFollowers / 1000)}K`);
      }
    }

    // Brand category match: up to +20 points
    if (opportunity.brandCategory) {
      const categoryMatches = prefs.preferredBrandCategories.filter(cat =>
        opportunity.brandCategory?.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(opportunity.brandCategory?.toLowerCase() || "")
      );
      if (categoryMatches.length > 0) {
        const categoryScore = Math.min(categoryMatches.length * 10, 20);
        score += categoryScore;
        reasons.push(`Category match: ${opportunity.brandCategory}`);
      }
    }

    // Brand interests alignment: up to +15 points
    if (opportunity.brandInterests && prefs.brandInterests) {
      const interestMatches = opportunity.brandInterests.filter(interest =>
        prefs.brandInterests.some(pref =>
          interest.toLowerCase().includes(pref.toLowerCase()) ||
          pref.toLowerCase().includes(interest.toLowerCase())
        )
      );
      if (interestMatches.length > 0) {
        const interestScore = Math.min(interestMatches.length * 5, 15);
        score += interestScore;
        reasons.push(`Interest alignment: ${interestMatches.slice(0, 2).join(", ")}`);
      }
    }

    // Content type match: up to +15 points
    if (opportunity.preferredContentTypes && prefs.preferredContentTypes) {
      const contentMatches = opportunity.preferredContentTypes.filter(type =>
        prefs.preferredContentTypes.some(pref =>
          type.toLowerCase().includes(pref.toLowerCase()) ||
          pref.toLowerCase().includes(type.toLowerCase())
        )
      );
      if (contentMatches.length > 0) {
        const contentScore = Math.min(contentMatches.length * 5, 15);
        score += contentScore;
        reasons.push(`Content match: ${contentMatches.slice(0, 2).join(", ")}`);
      }
    }

    // Deal duration match: +10 points
    if (opportunity.duration && prefs.preferredDealDuration) {
      const oppDuration = opportunity.duration.toLowerCase();
      const prefDuration = prefs.preferredDealDuration.toLowerCase();
      if (oppDuration.includes("3") && prefDuration.includes("3")) {
        score += 10;
        reasons.push("Duration match: 3 months");
      } else if (oppDuration.includes("6") && prefDuration.includes("6")) {
        score += 10;
        reasons.push("Duration match: 6 months");
      }
    }

    return { score: Math.min(score, 100), reasons };
  };

  // Run AI Search
  const runAISearch = () => {
    setShowAISearchModal(true);
    setIsAISearching(true);
    setAISearchResults([]);

    // Simulate AI processing delay
    setTimeout(() => {
      // Calculate scores for all opportunities
      const scoredOpportunities = mockOpportunities.map(opportunity => {
        const { score, reasons } = calculateOpportunityMatchScore(opportunity, profileData, preferencesData);
        return {
          ...opportunity,
          matchScore: score,
          matchReasons: reasons
        };
      });

      // Sort by score descending
      scoredOpportunities.sort((a, b) => b.matchScore - a.matchScore);

      setAISearchResults(scoredOpportunities);
      setIsAISearching(false);
    }, 2000); // 2 second delay to simulate AI processing
  };

  const stats = [
    { 
      label: "Total Followers", 
      value: "259K", 
      icon: Users, 
      color: "text-blue-500" 
    },
    { 
      label: "Active Partnerships", 
      value: activePartnerships.length.toString(), 
      icon: Briefcase, 
      color: "text-green-500" 
    },
    { 
      label: "Pending Opportunities", 
      value: "3", 
      icon: Clock, 
      color: "text-yellow-500" 
    },
    { 
      label: "Profile Completeness", 
      value: `${profileData.completenessScore}%`, 
      icon: Target, 
      color: "text-primary" 
    },
  ];

  const toggleBookmark = (opportunityId: string) => {
    setBookmarkedOpportunities(prev =>
      prev.includes(opportunityId)
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  const isBookmarked = (opportunityId: string) => bookmarkedOpportunities.includes(opportunityId);

  const handleAddSocialAccount = () => {
    if (newSocialAccount.platform && newSocialAccount.handle) {
      const newAccount: SocialAccount = {
        id: Date.now().toString(),
        platform: newSocialAccount.platform,
        handle: newSocialAccount.handle,
        followers: "0",
        engagementRate: "0%",
        verified: false,
      };
      setSocialAccounts([...socialAccounts, newAccount]);
      setNewSocialAccount({ platform: "", handle: "" });
      setShowAddSocialModal(false);
      toast({
        title: "Social Account Added",
        description: `${newSocialAccount.platform} account added successfully.`,
      });
    }
  };

  const handleRemoveSocialAccount = (id: string) => {
    setSocialAccounts(socialAccounts.filter(acc => acc.id !== id));
    toast({
      title: "Social Account Removed",
      description: "Social account has been removed.",
    });
  };

  // Calculate match scores for all opportunities
  const opportunitiesWithScores = opportunities.map(opp => {
    const { score, reasons } = calculateOpportunityMatchScore(opp, profileData, preferencesData);
    return {
      ...opp,
      matchScore: score,
      matchReasons: reasons
    };
  });

  const filteredOpportunities = opportunitiesWithScores.filter(opp => {
    const matchesSearch = 
      opp.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === "all" || opp.sport === sportFilter || opp.sport === "Any";
    return matchesSearch && matchesSport;
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-500 bg-green-500/10";
      case "pending": return "text-yellow-500 bg-yellow-500/10";
      case "completed": return "text-gray-500 bg-gray-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const socialPlatforms = [
    "Instagram",
    "TikTok",
    "Twitter/X",
    "YouTube",
    "Facebook",
    "Snapchat",
    "LinkedIn",
    "Twitch",
  ];

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
            <div className="flex items-center gap-4 mb-2">
              <img
                src={profileData.profileImage}
                alt={`${profileData.firstName} ${profileData.lastName}`}
                className="w-14 h-14 rounded-xl object-cover border-2 border-primary/30"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-wider">
                  {profileData.firstName.toUpperCase()} {profileData.lastName.toUpperCase()}
                </h1>
                <p className="text-muted-foreground">
                  {profileData.sport} • {profileData.position} • {profileData.school}
                </p>
              </div>
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
                <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <User size={16} className="mr-2" />
                  My Profile
                </TabsTrigger>
                <TabsTrigger value="opportunities" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Briefcase size={16} className="mr-2" />
                  Opportunities
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BarChart3 size={16} className="mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Settings size={16} className="mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* AI Search CTA */}
                <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-card p-8 rounded-xl border border-primary/30 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <Zap className="text-primary-foreground" size={28} />
                      </div>
                      <div>
                        <h3 className="font-bold text-2xl">Find Your Perfect Match</h3>
                        <p className="text-muted-foreground">AI-powered brand opportunity discovery based on your profile and preferences</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
                      Our AI analyzes your profile—sport, followers, engagement, interests, and preferences—to find brand opportunities that align with your goals and values.
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
                        onClick={() => setActiveTab("settings")}
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
                        {preferencesData.preferredBrandCategories.slice(0, 3).map((category, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-background/50">{category}</Badge>
                        ))}
                        <Badge variant="secondary" className="text-xs bg-background/50">{preferencesData.minBudget} - {preferencesData.maxBudget} budget</Badge>
                        {preferencesData.brandInterests.slice(0, 2).map((interest, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-background/50">{interest}</Badge>
                        ))}
                        {preferencesData.preferredBrandCategories.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{preferencesData.preferredBrandCategories.length - 3} more</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Partnerships */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Briefcase size={20} className="text-primary" />
                    Active Partnerships
                  </h3>
                  {activePartnerships.length > 0 ? (
                    <div className="space-y-4">
                      {activePartnerships.map((partnership) => (
                        <div key={partnership.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                            {partnership.brandName[0]}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{partnership.brandName}</h4>
                            <p className="text-sm text-muted-foreground">{partnership.dealType} • {partnership.value}</p>
                            <div className="mt-2 w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${partnership.progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-green-500 font-semibold">{partnership.progress}%</span>
                            <p className="text-xs text-muted-foreground">complete</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No active partnerships yet</p>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Bell size={20} className="text-primary" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle size={16} className="text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New opportunity from SportsTech App</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Trophy size={16} className="text-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Partnership milestone reached: 65% complete</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <TrendingUp size={16} className="text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Follower count increased by 2.5K</p>
                        <p className="text-xs text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* My Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Profile Information</h3>
                    <Button
                      variant={isEditingProfile ? "default" : "outline"}
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      {isEditingProfile ? (
                        <>
                          <Save size={16} className="mr-2" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Edit3 size={16} className="mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">First Name</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Last Name</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.lastName}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Email</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Location</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.location}
                            onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.location}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">School</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.school}
                            onChange={(e) => setProfileData({...profileData, school: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.school}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Sport</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.sport}
                            onChange={(e) => setProfileData({...profileData, sport: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.sport}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Position</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.position}
                            onChange={(e) => setProfileData({...profileData, position: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.position}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Conference</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.conference}
                            onChange={(e) => setProfileData({...profileData, conference: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.conference}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="text-sm font-semibold text-muted-foreground">Bio</label>
                    {isEditingProfile ? (
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        className="mt-1 bg-background"
                        rows={4}
                      />
                    ) : (
                      <p className="mt-1 text-muted-foreground">{profileData.bio}</p>
                    )}
                  </div>

                  {/* Profile Completeness */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">Profile Completeness</span>
                      <span className="text-sm font-bold text-primary">{profileData.completenessScore}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${profileData.completenessScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Add more social accounts and media to increase your profile score
                    </p>
                  </div>
                </div>

                {/* Social Media Accounts */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Social Media Accounts</h3>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddSocialModal(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Account
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {socialAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <Instagram size={20} className="text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{account.platform}</span>
                              {account.verified && (
                                <Badge variant="secondary" className="text-xs">Verified</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{account.handle}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>{account.followers} followers</span>
                              <span>{account.engagementRate} engagement</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSocialAccount(account.id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Media Gallery */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Media Gallery</h3>
                    <Button variant="outline">
                      <Upload size={16} className="mr-2" />
                      Upload Media
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {media.map((item) => (
                      <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden border border-border group cursor-pointer">
                        {item.type === "image" ? (
                          <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Video size={24} className="text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" className="text-white">
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Opportunities Tab */}
              <TabsContent value="opportunities" className="space-y-6">
                {/* Search & Filters */}
                <div className="bg-card p-6 rounded-xl border border-border space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                      placeholder="Search opportunities..."
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
                        <SelectItem value="Basketball">Basketball</SelectItem>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Soccer">Soccer</SelectItem>
                        <SelectItem value="Any">Any</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* AI Matched Opportunities */}
                {filteredOpportunities.filter(opp => (opp.matchScore || 0) >= 70).length > 0 && (
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-card p-6 rounded-xl border border-primary/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="text-primary" size={24} />
                      <h3 className="font-bold text-lg">AI Matched Opportunities</h3>
                      <Badge className="bg-primary text-primary-foreground">
                        {filteredOpportunities.filter(opp => (opp.matchScore || 0) >= 70).length} matches
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      These opportunities have a high compatibility score with your profile and preferences
                    </p>
                    <div className="space-y-4">
                      {filteredOpportunities.filter(opp => (opp.matchScore || 0) >= 70).map((opp) => (
                        <div
                          key={opp.id}
                          className="p-5 rounded-xl border border-primary/30 bg-card hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold border-2 border-primary/30">
                                {opp.brandName[0]}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-lg">{opp.brandName}</h4>
                                  <Badge className="bg-primary/20 text-primary border-primary/30">
                                    <Star size={12} className="mr-1" />
                                    Top Match
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{opp.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right mr-2">
                                <div className={`text-2xl font-black ${
                                  (opp.matchScore || 0) >= 70 ? "text-green-500" :
                                  (opp.matchScore || 0) >= 50 ? "text-yellow-500" :
                                  "text-muted-foreground"
                                }`}>
                                  {opp.matchScore}%
                                </div>
                                <p className="text-xs text-muted-foreground">match</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleBookmark(opp.id)}
                                className={isBookmarked(opp.id) ? "text-primary" : ""}
                              >
                                {isBookmarked(opp.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOpportunity(opp)}
                              >
                                <Eye size={14} className="mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground">Budget</p>
                              <p className="font-semibold text-green-500">{opp.budget}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-semibold">{opp.duration}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Deadline</p>
                              <p className="font-semibold">{opp.deadline}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Industry</p>
                              <p className="font-semibold">{opp.industry}</p>
                            </div>
                          </div>
                          {opp.matchReasons && opp.matchReasons.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-primary/20">
                              <p className="text-xs text-muted-foreground mb-2">Why this is a good match:</p>
                              <div className="flex flex-wrap gap-2">
                                {opp.matchReasons.slice(0, 3).map((reason, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    <CheckCircle size={10} className="mr-1 text-green-500" />
                                    {reason}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Available Opportunities */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">All Opportunities</h3>
                    <Badge variant="secondary">
                      Sorted by match score
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {filteredOpportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="p-5 rounded-xl border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                              {opp.brandName[0]}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{opp.brandName}</h4>
                              <p className="text-sm text-muted-foreground">{opp.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-2 hidden md:block">
                              <div className={`text-xl font-bold ${
                                (opp.matchScore || 0) >= 70 ? "text-green-500" :
                                (opp.matchScore || 0) >= 50 ? "text-yellow-500" :
                                "text-muted-foreground"
                              }`}>
                                {opp.matchScore}%
                              </div>
                              <p className="text-xs text-muted-foreground">match</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleBookmark(opp.id)}
                              className={isBookmarked(opp.id) ? "text-primary" : ""}
                            >
                              {isBookmarked(opp.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOpportunity(opp)}
                            >
                              <Eye size={14} className="mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Budget</p>
                            <p className="font-semibold text-green-500">{opp.budget}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Match Score</p>
                            <p className={`font-semibold ${
                              (opp.matchScore || 0) >= 70 ? "text-green-500" :
                              (opp.matchScore || 0) >= 50 ? "text-yellow-500" :
                              "text-primary"
                            }`}>
                              {opp.matchScore}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-semibold">{opp.duration}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Deadline</p>
                            <p className="font-semibold">{opp.deadline}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {opp.requirements.map((req, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Partnerships */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-bold text-lg mb-4">Active Partnerships</h3>
                  {activePartnerships.length > 0 ? (
                    <div className="space-y-4">
                      {activePartnerships.map((partnership) => (
                        <div key={partnership.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg">{partnership.brandName}</h4>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(partnership.status)}`}>
                              {partnership.status === "active" ? <CheckCircle size={12} /> : <Clock size={12} />}
                              {partnership.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground">Deal Type</p>
                              <p className="font-medium">{partnership.dealType}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Value</p>
                              <p className="font-medium text-green-500">{partnership.value}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Start Date</p>
                              <p className="font-medium">{partnership.startDate}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">End Date</p>
                              <p className="font-medium">{partnership.endDate}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Deliverables:</p>
                            <div className="flex flex-wrap gap-2">
                              {partnership.deliverables.map((item, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {partnership.status === "active" && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{partnership.progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all"
                                  style={{ width: `${partnership.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No active partnerships</p>
                  )}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                {/* Social Media Metrics */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-bold text-lg mb-6">Social Media Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {socialAccounts.map((account) => (
                      <div key={account.id} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Instagram size={20} className="text-primary" />
                          <span className="font-semibold">{account.platform}</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Followers</p>
                            <p className="text-2xl font-bold">{account.followers}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Engagement Rate</p>
                            <p className="text-lg font-semibold text-green-500">{account.engagementRate}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Partnership Performance */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-bold text-lg mb-6">Partnership Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <DollarSign size={20} className="text-green-500" />
                        <span className="font-semibold">Total Revenue</span>
                      </div>
                      <p className="text-3xl font-bold">$20,000</p>
                      <p className="text-xs text-muted-foreground mt-2">From active partnerships</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Briefcase size={20} className="text-blue-500" />
                        <span className="font-semibold">Active Deals</span>
                      </div>
                      <p className="text-3xl font-bold">{activePartnerships.length}</p>
                      <p className="text-xs text-muted-foreground mt-2">Partnerships in progress</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <TrendingUp size={20} className="text-primary" />
                        <span className="font-semibold">Growth Rate</span>
                      </div>
                      <p className="text-3xl font-bold">+12.5%</p>
                      <p className="text-xs text-muted-foreground mt-2">Follower growth this month</p>
                    </div>
                  </div>
                </div>

                {/* Audience Insights */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-bold text-lg mb-6">Audience Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-3">Top Demographics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age 18-24</span>
                          <span className="font-medium">45%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age 25-34</span>
                          <span className="font-medium">30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Age 35-44</span>
                          <span className="font-medium">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Other</span>
                          <span className="font-medium">10%</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-3">Geographic Distribution</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">United States</span>
                          <span className="font-medium">78%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Canada</span>
                          <span className="font-medium">12%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Other</span>
                          <span className="font-medium">10%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                {/* Account Settings */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-bold text-lg mb-6">Account Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-semibold">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive email updates about opportunities</p>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-semibold">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Get notified about new opportunities</p>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-semibold">Profile Visibility</p>
                        <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                      </div>
                      <Select defaultValue="public">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Partnership Preferences */}
                <div className="bg-gradient-to-br from-primary/5 via-card to-card p-6 rounded-xl border border-primary/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Sparkles className="text-primary" size={24} />
                      <h3 className="font-bold text-lg">AI Matching Preferences</h3>
                    </div>
                    <Button 
                      variant={isEditingPreferences ? "default" : "outline"}
                      onClick={() => setIsEditingPreferences(!isEditingPreferences)}
                    >
                      {isEditingPreferences ? (
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
                  <p className="text-muted-foreground text-sm mb-6">
                    Define what you're looking for in brand partnerships. Our AI will use these preferences to recommend the best opportunities.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Briefcase size={16} className="text-primary" />
                        Preferred Brand Categories
                      </label>
                      {isEditingPreferences ? (
                        <Input
                          value={preferencesData.preferredBrandCategories.join(", ")}
                          onChange={(e) => setPreferencesData({...preferencesData, preferredBrandCategories: e.target.value.split(", ").map(s => s.trim())})}
                          className="bg-background"
                          placeholder="Fitness & Health, Technology, Fashion"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {preferencesData.preferredBrandCategories.map((category, i) => (
                            <Badge key={i} className="bg-primary/10 text-primary">{category}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <DollarSign size={16} className="text-primary" />
                        Budget Range
                      </label>
                      {isEditingPreferences ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={preferencesData.minBudget}
                            onChange={(e) => setPreferencesData({...preferencesData, minBudget: e.target.value})}
                            className="bg-background"
                            placeholder="Min (e.g., $5,000)"
                          />
                          <Input
                            value={preferencesData.maxBudget}
                            onChange={(e) => setPreferencesData({...preferencesData, maxBudget: e.target.value})}
                            className="bg-background"
                            placeholder="Max (e.g., $20,000)"
                          />
                        </div>
                      ) : (
                        <p className="font-medium text-green-500">{preferencesData.minBudget} - {preferencesData.maxBudget}</p>
                      )}
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-primary" />
                        Preferred Deal Duration
                      </label>
                      {isEditingPreferences ? (
                        <Input
                          value={preferencesData.preferredDealDuration}
                          onChange={(e) => setPreferencesData({...preferencesData, preferredDealDuration: e.target.value})}
                          className="bg-background"
                          placeholder="3-6 months"
                        />
                      ) : (
                        <p className="font-medium">{preferencesData.preferredDealDuration}</p>
                      )}
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Video size={16} className="text-primary" />
                        Preferred Content Types
                      </label>
                      {isEditingPreferences ? (
                        <Input
                          value={preferencesData.preferredContentTypes.join(", ")}
                          onChange={(e) => setPreferencesData({...preferencesData, preferredContentTypes: e.target.value.split(", ").map(s => s.trim())})}
                          className="bg-background"
                          placeholder="Training Videos, Lifestyle, Product Reviews"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {preferencesData.preferredContentTypes.map((content, i) => (
                            <Badge key={i} variant="secondary">{content}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Heart size={16} className="text-primary" />
                        Brand Interests Alignment
                      </label>
                      {isEditingPreferences ? (
                        <Input
                          value={preferencesData.brandInterests.join(", ")}
                          onChange={(e) => setPreferencesData({...preferencesData, brandInterests: e.target.value.split(", ").map(s => s.trim())})}
                          className="bg-background"
                          placeholder="Fitness, Health, Fashion"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {preferencesData.brandInterests.map((interest, i) => (
                            <Badge key={i} className="bg-primary/10 text-primary">{interest}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
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
                          placeholder="Any other preferences or requirements..."
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{preferencesData.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Add Social Account Modal */}
      <Dialog open={showAddSocialModal} onOpenChange={setShowAddSocialModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Social Media Account</DialogTitle>
            <DialogDescription>
              Connect a new social media account to your profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Platform</label>
              <Select
                value={newSocialAccount.platform}
                onValueChange={(value) => setNewSocialAccount({...newSocialAccount, platform: value})}
              >
                <SelectTrigger>
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
            <div>
              <label className="text-sm font-semibold mb-2 block">Handle</label>
              <Input
                value={newSocialAccount.handle}
                onChange={(e) => setNewSocialAccount({...newSocialAccount, handle: e.target.value})}
                placeholder="@yourhandle"
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSocialModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSocialAccount}>
              Add Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Opportunity Details Modal */}
      <Dialog open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
        <DialogContent className="max-w-2xl">
          {selectedOpportunity && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedOpportunity.brandName}</DialogTitle>
                <DialogDescription>{selectedOpportunity.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-semibold text-green-500">{selectedOpportunity.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Match Score</p>
                    <p className="font-semibold text-primary">{selectedOpportunity.matchScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{selectedOpportunity.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-semibold">{selectedOpportunity.deadline}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Requirements</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpportunity.requirements.map((req, i) => (
                      <Badge key={i} variant="secondary">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedOpportunity(null)}>
                  Close
                </Button>
                <Button className="bg-primary text-primary-foreground">
                  Apply Now
                </Button>
              </DialogFooter>
            </>
          )}
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
                Brand opportunities ranked by compatibility with your profile and preferences
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
                <h3 className="text-xl font-bold mb-2">Analyzing Opportunities...</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Our AI is evaluating {mockOpportunities.length} brand opportunities based on your profile, preferences, and goals.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {aiSearchResults.map((opportunity, index) => (
                  <motion.div
                    key={opportunity.id}
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
                      setSelectedOpportunity(opportunity);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank Badge */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? "bg-primary text-primary-foreground" :
                        index === 1 ? "bg-gray-300 text-gray-700" :
                        index === 2 ? "bg-amber-600 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>

                      {/* Brand Logo/Initial */}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 ${
                        index === 0 ? "border-primary bg-primary/10" : "border-border bg-muted"
                      }`}>
                        {opportunity.brandName[0]}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-lg">{opportunity.brandName}</h4>
                          {index === 0 && (
                            <Badge className="bg-primary text-primary-foreground">
                              <Star size={12} className="mr-1" />
                              Top Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {opportunity.description}
                        </p>
                        
                        {/* Match Reasons */}
                        <div className="flex flex-wrap gap-2">
                          {opportunity.matchReasons?.map((reason, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              <CheckCircle size={10} className="mr-1 text-green-500" />
                              {reason}
                            </Badge>
                          ))}
                        </div>

                        {/* Opportunity Details */}
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Budget</p>
                            <p className="font-semibold text-green-500">{opportunity.budget}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-semibold">{opportunity.duration}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Deadline</p>
                            <p className="font-semibold">{opportunity.deadline}</p>
                          </div>
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="flex-shrink-0 text-right">
                        <div className={`text-3xl font-black ${
                          opportunity.matchScore >= 70 ? "text-green-500" :
                          opportunity.matchScore >= 50 ? "text-yellow-500" :
                          "text-muted-foreground"
                        }`}>
                          {opportunity.matchScore}%
                        </div>
                        <p className="text-xs text-muted-foreground">match score</p>
                        <div className="mt-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(opportunity.id);
                            }}
                          >
                            {isBookmarked(opportunity.id) ? (
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
                              setSelectedOpportunity(opportunity);
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
                      Found {aiSearchResults.length} opportunities • Showing results from highest to lowest match
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

export default AthleteDashboard;
