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
  ChevronRight
} from "lucide-react";

// Mock athlete data (same as Admin for consistency)
const allAthletes = [
  {
    id: 1,
    firstName: "James",
    lastName: "Wilson",
    email: "james.w@duke.edu",
    phone: "(919) 555-0123",
    location: "Durham, NC",
    dateOfBirth: "2003-05-12",
    profileImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face",
    bio: "4-year starter at Duke, team captain for 2 seasons. Passionate about helping young athletes reach their potential through mentorship and creating authentic content that inspires.",
    sport: "Basketball",
    position: "Shooting Guard",
    school: "Duke University",
    conference: "ACC",
    teamRanking: "#8 National",
    performanceLevel: "D1 Elite",
    seasonStats: {
      gamesPlayed: 28,
      pointsPerGame: 18.5,
      assistsPerGame: 4.2,
      reboundsPerGame: 3.8,
    },
    awards: [
      "2024 ACC All-Conference First Team",
      "2023 ACC Tournament MVP",
      "2x ACC Player of the Week",
    ],
    socialAccounts: [
      { platform: "Instagram", handle: "@jwilson_duke", followers: "125K" },
      { platform: "TikTok", handle: "@jameswilson", followers: "89K" },
      { platform: "Twitter/X", handle: "@jwilson2", followers: "45K" }
    ],
    totalFollowers: "259K",
    engagementRate: "4.8%",
    interestTags: ["Fashion", "Fitness", "Sneakers", "Music", "Mentorship", "Gaming"],
    contentTypes: ["Reels", "Training Videos", "Lifestyle", "Behind the Scenes"],
    status: "active",
  },
  {
    id: 2,
    firstName: "Emma",
    lastName: "Rodriguez",
    email: "emma.r@stanford.edu",
    phone: "(650) 555-0456",
    location: "Palo Alto, CA",
    dateOfBirth: "2004-02-28",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    bio: "Stanford Soccer standout and aspiring sports broadcaster. I love connecting with fans through authentic storytelling.",
    sport: "Soccer",
    position: "Forward",
    school: "Stanford University",
    conference: "Pac-12",
    teamRanking: "#3 National",
    performanceLevel: "D1 Elite",
    seasonStats: {
      gamesPlayed: 22,
      goals: 15,
      assists: 8,
      shotsOnGoal: 42,
    },
    awards: [
      "2024 Pac-12 Offensive Player of the Year",
      "2023 All-American Third Team",
      "Stanford Female Athlete of the Year",
    ],
    socialAccounts: [
      { platform: "TikTok", handle: "@emmagoals", followers: "156K" },
      { platform: "Instagram", handle: "@emma_rodriguez", followers: "98K" },
      { platform: "YouTube", handle: "Emma Rodriguez", followers: "23K" }
    ],
    totalFollowers: "277K",
    engagementRate: "6.2%",
    interestTags: ["Travel", "Fashion", "Wellness", "Food", "Sustainability", "Women in Sports"],
    contentTypes: ["Vlogs", "Lifestyle", "Training", "Day in the Life"],
    status: "active",
  },
  {
    id: 3,
    firstName: "Marcus",
    lastName: "Thompson",
    email: "marcus.t@ohiostate.edu",
    phone: "(614) 555-0789",
    location: "Columbus, OH",
    dateOfBirth: "2002-09-15",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "Ohio State QB1. Faith, family, football. I'm passionate about using my platform to inspire the next generation.",
    sport: "Football",
    position: "Quarterback",
    school: "Ohio State University",
    conference: "Big Ten",
    teamRanking: "#4 National",
    performanceLevel: "D1 Elite",
    seasonStats: {
      gamesPlayed: 12,
      passingYards: 3245,
      touchdowns: 32,
      completionPct: "68.4%",
    },
    awards: [
      "2024 Big Ten Offensive Player of the Year",
      "Heisman Trophy Finalist",
      "2x Big Ten Player of the Week",
    ],
    socialAccounts: [
      { platform: "Instagram", handle: "@mthompson_qb1", followers: "385K" },
      { platform: "TikTok", handle: "@marcusqb", followers: "220K" },
      { platform: "Twitter/X", handle: "@MarcusT_OSU", followers: "156K" },
    ],
    totalFollowers: "806K",
    engagementRate: "5.1%",
    interestTags: ["Gaming", "Sneakers", "Faith", "Community Service", "Fashion", "Cars"],
    contentTypes: ["Reels", "Gaming Streams", "Training", "Lifestyle", "Comedy"],
    status: "active",
  },
  {
    id: 4,
    firstName: "Sophia",
    lastName: "Chen",
    email: "sophia.c@usc.edu",
    phone: "(213) 555-0321",
    location: "Los Angeles, CA",
    dateOfBirth: "2003-11-08",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    bio: "USC Volleyball star. Combining athletic excellence with academic achievement. Love creating fitness content!",
    sport: "Volleyball",
    position: "Outside Hitter",
    school: "USC",
    conference: "Pac-12",
    teamRanking: "#5 National",
    performanceLevel: "D1 Elite",
    seasonStats: {
      gamesPlayed: 30,
      kills: 420,
      digs: 180,
      aces: 45,
    },
    awards: [
      "2024 Pac-12 Player of the Year",
      "All-American First Team",
    ],
    socialAccounts: [
      { platform: "Instagram", handle: "@sophiaspikes", followers: "95K" },
      { platform: "TikTok", handle: "@sophiachen", followers: "142K" },
    ],
    totalFollowers: "237K",
    engagementRate: "7.3%",
    interestTags: ["Fitness", "Health", "Beauty", "Fashion", "Academics", "Travel"],
    contentTypes: ["Workout Videos", "Get Ready With Me", "Day in the Life", "Study Tips"],
    status: "active",
  },
  {
    id: 5,
    firstName: "Tyler",
    lastName: "Brooks",
    email: "tyler.b@clemson.edu",
    phone: "(864) 555-0654",
    location: "Clemson, SC",
    dateOfBirth: "2002-06-20",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    bio: "Clemson Baseball pitcher. 95+ MPH fastball. Passionate about hunting, fishing, and the outdoors.",
    sport: "Baseball",
    position: "Pitcher",
    school: "Clemson University",
    conference: "ACC",
    teamRanking: "#12 National",
    performanceLevel: "D1 Elite",
    seasonStats: {
      gamesPlayed: 18,
      strikeouts: 156,
      era: "2.45",
      wins: 11,
    },
    awards: [
      "2024 ACC Pitcher of the Year",
      "Golden Spikes Award Semifinalist",
    ],
    socialAccounts: [
      { platform: "Instagram", handle: "@tylerbrooks_33", followers: "67K" },
      { platform: "YouTube", handle: "Tyler Brooks Outdoors", followers: "23K" },
    ],
    totalFollowers: "90K",
    engagementRate: "5.8%",
    interestTags: ["Outdoors", "Hunting", "Fishing", "Country Music", "Trucks", "Faith"],
    contentTypes: ["Pitching Tutorials", "Outdoor Adventures", "Lifestyle"],
    status: "active",
  },
];

// Mock brand profile data
const mockBrandProfile = {
  company: "FitFuel Nutrition",
  contactFirstName: "Jennifer",
  contactLastName: "Martinez",
  contactTitle: "Marketing Director",
  email: "jennifer@fitfuel.com",
  phone: "(555) 123-4567",
  website: "https://fitfuel.com",
  industry: "Sports & Fitness",
  companySize: "Medium (51-200 employees)",
  budget: "$50,000 - $100,000",
  description: "Premium sports nutrition brand focused on clean, effective supplements for athletes.",
  targetAudience: "College athletes, fitness enthusiasts, health-conscious individuals aged 18-35",
  logo: null,
};

// Mock brand preferences for AI matching
const mockBrandPreferences = {
  preferredSports: ["Football", "Basketball", "Soccer"],
  minFollowers: "50K",
  maxFollowers: "500K",
  preferredConferences: ["ACC", "Big Ten", "SEC", "Pac-12"],
  interestAlignment: ["Fitness", "Health", "Wellness", "Training"],
  contentPreferences: ["Training Videos", "Lifestyle", "Product Reviews"],
  budgetPerAthlete: "$5,000 - $15,000",
  dealDuration: "3-6 months",
  notes: "Looking for athletes who embody a healthy, active lifestyle and have authentic engagement with their audience.",
};

// Mock active campaigns/deals
const mockCampaigns = [
  {
    id: 1,
    athleteName: "James Wilson",
    athleteImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face",
    dealType: "Sponsored Content",
    value: "$8,000",
    status: "active",
    startDate: "2024-11-01",
    endDate: "2025-02-01",
    deliverables: ["4 Instagram posts", "2 TikTok videos", "Story features"],
    progress: 65,
  },
  {
    id: 2,
    athleteName: "Emma Rodriguez",
    athleteImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    dealType: "Ambassador",
    value: "$15,000",
    status: "pending",
    startDate: "2025-01-15",
    endDate: "2025-07-15",
    deliverables: ["Monthly content", "Product features", "Event appearance"],
    progress: 0,
  },
];

type Athlete = typeof allAthletes[0];

const BrandDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [bookmarkedAthletes, setBookmarkedAthletes] = useState<number[]>([1, 2]); // Mock some bookmarked
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactAthlete, setContactAthlete] = useState<Athlete | null>(null);
  
  // Filter states
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [conferenceFilter, setConferenceFilter] = useState<string>("all");
  const [followerFilter, setFollowerFilter] = useState<string>("all");

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(mockBrandProfile);
  
  // Preferences editing state
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [preferencesData, setPreferencesData] = useState(mockBrandPreferences);

  // AI Search state
  const [showAISearchModal, setShowAISearchModal] = useState(false);
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiSearchResults, setAISearchResults] = useState<Array<Athlete & { matchScore: number; matchReasons: string[] }>>([]);

  // AI Matching function - calculates match score based on brand preferences
  const calculateMatchScore = (athlete: Athlete, prefs: typeof preferencesData): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];

    // Sport match: +25 points
    if (prefs.preferredSports.some(s => s.toLowerCase() === athlete.sport.toLowerCase())) {
      score += 25;
      reasons.push(`Sport match: ${athlete.sport}`);
    }

    // Conference match: +15 points
    if (prefs.preferredConferences.some(c => c.toLowerCase() === athlete.conference.toLowerCase())) {
      score += 15;
      reasons.push(`Conference: ${athlete.conference}`);
    }

    // Follower range check: +20 points
    const athleteFollowers = parseInt(athlete.totalFollowers.replace(/[^0-9]/g, "")) * 1000;
    const minFollowers = parseInt(prefs.minFollowers.replace(/[^0-9]/g, "")) * 1000;
    const maxFollowers = parseInt(prefs.maxFollowers.replace(/[^0-9]/g, "")) * 1000;
    if (athleteFollowers >= minFollowers && athleteFollowers <= maxFollowers) {
      score += 20;
      reasons.push(`Followers in range: ${athlete.totalFollowers}`);
    }

    // Interest alignment: up to +25 points
    const interestMatches = athlete.interestTags.filter(tag =>
      prefs.interestAlignment.some(interest => 
        tag.toLowerCase().includes(interest.toLowerCase()) || 
        interest.toLowerCase().includes(tag.toLowerCase())
      )
    );
    if (interestMatches.length > 0) {
      const interestScore = Math.min(interestMatches.length * 8, 25);
      score += interestScore;
      reasons.push(`Interest alignment: ${interestMatches.slice(0, 3).join(", ")}`);
    }

    // Content type match: up to +15 points
    const contentMatches = athlete.contentTypes.filter(type =>
      prefs.contentPreferences.some(pref => 
        type.toLowerCase().includes(pref.toLowerCase()) || 
        pref.toLowerCase().includes(type.toLowerCase())
      )
    );
    if (contentMatches.length > 0) {
      const contentScore = Math.min(contentMatches.length * 5, 15);
      score += contentScore;
      reasons.push(`Content match: ${contentMatches.slice(0, 2).join(", ")}`);
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
      // Calculate scores for all athletes
      const scoredAthletes = allAthletes.map(athlete => {
        const { score, reasons } = calculateMatchScore(athlete, preferencesData);
        return {
          ...athlete,
          matchScore: score,
          matchReasons: reasons
        };
      });

      // Sort by score descending
      scoredAthletes.sort((a, b) => b.matchScore - a.matchScore);

      setAISearchResults(scoredAthletes);
      setIsAISearching(false);
    }, 2000); // 2 second delay to simulate AI processing
  };

  const toggleBookmark = (athleteId: number) => {
    setBookmarkedAthletes(prev => 
      prev.includes(athleteId) 
        ? prev.filter(id => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  const isBookmarked = (athleteId: number) => bookmarkedAthletes.includes(athleteId);

  // Filter athletes based on search and filters
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

  const uniqueSports = [...new Set(allAthletes.map(a => a.sport))];
  const uniqueConferences = [...new Set(allAthletes.map(a => a.conference))];

  const stats = [
    { label: "Total Athletes", value: allAthletes.length, icon: Users, color: "text-blue-500" },
    { label: "Bookmarked", value: bookmarkedAthletes.length, icon: BookmarkCheck, color: "text-primary" },
    { label: "Active Campaigns", value: mockCampaigns.filter(c => c.status === "active").length, icon: Handshake, color: "text-green-500" },
    { label: "Pending Deals", value: mockCampaigns.filter(c => c.status === "pending").length, icon: Clock, color: "text-yellow-500" },
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
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                {profileData.company[0]}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-wider">
                  {profileData.company.toUpperCase()}
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {profileData.contactFirstName}
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
                <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Building2 size={16} className="mr-2" />
                  Brand Profile
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
                        {preferencesData.preferredSports.map((sport, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-background/50">{sport}</Badge>
                        ))}
                        <Badge variant="secondary" className="text-xs bg-background/50">{preferencesData.minFollowers} - {preferencesData.maxFollowers} followers</Badge>
                        {preferencesData.interestAlignment.slice(0, 2).map((interest, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-background/50">{interest}</Badge>
                        ))}
                        {preferencesData.interestAlignment.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{preferencesData.interestAlignment.length - 2} more</Badge>
                        )}
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
                          <img
                            src={campaign.athleteImage}
                            alt={campaign.athleteName}
                            className="w-14 h-14 rounded-full object-cover border-2 border-green-500/30"
                          />
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
                {/* Search & Filters */}
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

                {/* Results */}
                <div className="grid gap-4">
                  {filteredAthletes.length > 0 ? (
                    filteredAthletes.map((athlete) => (
                      <motion.div
                        key={athlete.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-6">
                          <img
                            src={athlete.profileImage}
                            alt={`${athlete.firstName} ${athlete.lastName}`}
                            className="w-20 h-20 rounded-full object-cover border-2 border-primary/30 cursor-pointer hover:border-primary transition-colors"
                            onClick={() => setSelectedAthlete(athlete)}
                          />
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

                          <div className="hidden lg:flex flex-wrap gap-1 max-w-xs">
                            {athlete.interestTags.slice(0, 4).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {athlete.interestTags.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{athlete.interestTags.length - 4}
                              </Badge>
                            )}
                          </div>

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
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <UserSearch size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No athletes found matching your criteria</p>
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
                          <img
                            src={athlete.profileImage}
                            alt={`${athlete.firstName} ${athlete.lastName}`}
                            className="w-20 h-20 rounded-full object-cover border-2 border-primary cursor-pointer"
                            onClick={() => setSelectedAthlete(athlete)}
                          />
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
                              <span className="text-muted-foreground">
                                <span className="text-green-500 font-semibold">{athlete.engagementRate}</span> engagement
                              </span>
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
                            <img
                              src={campaign.athleteImage}
                              alt={campaign.athleteName}
                              className="w-16 h-16 rounded-full object-cover border-2 border-border"
                            />
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

              {/* Brand Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Brand Information</h3>
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
                        <label className="text-sm font-semibold text-muted-foreground">Company Name</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.company}
                            onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.company}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground">First Name</label>
                          {isEditingProfile ? (
                            <Input
                              value={profileData.contactFirstName}
                              onChange={(e) => setProfileData({...profileData, contactFirstName: e.target.value})}
                              className="mt-1 bg-background"
                            />
                          ) : (
                            <p className="mt-1 font-medium">{profileData.contactFirstName}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-muted-foreground">Last Name</label>
                          {isEditingProfile ? (
                            <Input
                              value={profileData.contactLastName}
                              onChange={(e) => setProfileData({...profileData, contactLastName: e.target.value})}
                              className="mt-1 bg-background"
                            />
                          ) : (
                            <p className="mt-1 font-medium">{profileData.contactLastName}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Job Title</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.contactTitle}
                            onChange={(e) => setProfileData({...profileData, contactTitle: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.contactTitle}</p>
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
                        <label className="text-sm font-semibold text-muted-foreground">Phone</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Website</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.website}
                            onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium text-primary">{profileData.website}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Industry</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.industry}
                            onChange={(e) => setProfileData({...profileData, industry: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.industry}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Company Size</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.companySize}
                            onChange={(e) => setProfileData({...profileData, companySize: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium">{profileData.companySize}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Marketing Budget</label>
                        {isEditingProfile ? (
                          <Input
                            value={profileData.budget}
                            onChange={(e) => setProfileData({...profileData, budget: e.target.value})}
                            className="mt-1 bg-background"
                          />
                        ) : (
                          <p className="mt-1 font-medium text-green-500">{profileData.budget}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">Description</label>
                        {isEditingProfile ? (
                          <Textarea
                            value={profileData.description}
                            onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                            className="mt-1 bg-background"
                            rows={3}
                          />
                        ) : (
                          <p className="mt-1 text-muted-foreground">{profileData.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
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
                            onChange={(e) => setPreferencesData({...preferencesData, preferredSports: e.target.value.split(", ")})}
                            className="bg-background"
                            placeholder="Football, Basketball, Soccer"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {preferencesData.preferredSports.map((sport, i) => (
                              <Badge key={i} className="bg-primary/10 text-primary">{sport}</Badge>
                            ))}
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
                          <p className="font-medium">{preferencesData.minFollowers} - {preferencesData.maxFollowers}</p>
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
                            onChange={(e) => setPreferencesData({...preferencesData, preferredConferences: e.target.value.split(", ")})}
                            className="bg-background"
                            placeholder="ACC, Big Ten, SEC"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {preferencesData.preferredConferences.map((conf, i) => (
                              <Badge key={i} variant="secondary">{conf}</Badge>
                            ))}
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
                          <p className="font-medium text-green-500">{preferencesData.budgetPerAthlete}</p>
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
                            onChange={(e) => setPreferencesData({...preferencesData, interestAlignment: e.target.value.split(", ")})}
                            className="bg-background"
                            placeholder="Fitness, Health, Wellness"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {preferencesData.interestAlignment.map((interest, i) => (
                              <Badge key={i} className="bg-primary/10 text-primary">{interest}</Badge>
                            ))}
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
                            onChange={(e) => setPreferencesData({...preferencesData, contentPreferences: e.target.value.split(", ")})}
                            className="bg-background"
                            placeholder="Training Videos, Lifestyle"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {preferencesData.contentPreferences.map((content, i) => (
                              <Badge key={i} variant="secondary">{content}</Badge>
                            ))}
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
                          <p className="font-medium">{preferencesData.dealDuration}</p>
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
                          <p className="text-sm text-muted-foreground">{preferencesData.notes}</p>
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

      {/* Athlete Profile Modal */}
      <Dialog open={!!selectedAthlete} onOpenChange={() => setSelectedAthlete(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
          {selectedAthlete && (
            <>
              <div className="relative h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
                <div className="absolute -bottom-16 left-8">
                  <img
                    src={selectedAthlete.profileImage}
                    alt={`${selectedAthlete.firstName} ${selectedAthlete.lastName}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl"
                  />
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
                  </TabsContent>

                  <TabsContent value="social" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedAthlete.socialAccounts.map((account, i) => (
                        <div key={i} className="p-4 bg-card rounded-xl border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Instagram size={20} className="text-primary" />
                              <span className="font-semibold">{account.platform}</span>
                            </div>
                            <span className="text-lg font-bold">{account.followers}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{account.handle}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-muted rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Overall Engagement Rate</span>
                        <span className="text-2xl font-bold text-green-500">{selectedAthlete.engagementRate}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tags" className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Heart size={18} className="text-red-500" />
                        Interest Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAthlete.interestTags.map((tag, i) => (
                          <Badge key={i} className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
                            {getTagIcon(tag)}
                            <span className="ml-1">{tag}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Video size={18} className="text-blue-500" />
                        Content Types
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAthlete.contentTypes.map((type, i) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1 text-sm">
                            {getTagIcon(type)}
                            <span className="ml-1">{type}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
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
                <img
                  src={contactAthlete.profileImage}
                  alt={contactAthlete.firstName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary"
                />
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
            <Button className="bg-primary text-primary-foreground" onClick={() => setShowContactModal(false)}>
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
                      {/* Rank Badge */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? "bg-primary text-primary-foreground" :
                        index === 1 ? "bg-gray-300 text-gray-700" :
                        index === 2 ? "bg-amber-600 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>

                      {/* Profile Image */}
                      <img
                        src={athlete.profileImage}
                        alt={athlete.firstName}
                        className={`w-16 h-16 rounded-full object-cover border-2 ${
                          index === 0 ? "border-primary" : "border-border"
                        }`}
                      />

                      {/* Info */}
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
                        
                        {/* Match Reasons */}
                        <div className="flex flex-wrap gap-2">
                          {athlete.matchReasons.map((reason, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              <CheckCircle size={10} className="mr-1 text-green-500" />
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Match Score */}
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

