import { motion } from "framer-motion";
import { useState } from "react";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Building2, 
  UserPlus, 
  BriefcaseIcon, 
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  School,
  Trophy,
  Instagram,
  ExternalLink,
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
  Target
} from "lucide-react";

// Enhanced athlete data with full profiles
const athletes = [
  {
    id: 1,
    // Basic Info
    firstName: "James",
    lastName: "Wilson",
    email: "james.w@duke.edu",
    phone: "(919) 555-0123",
    location: "Durham, NC",
    dateOfBirth: "2003-05-12",
    profileImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face",
    bio: "4-year starter at Duke, team captain for 2 seasons. Passionate about helping young athletes reach their potential through mentorship and creating authentic content that inspires. Currently pursuing a degree in Business Administration while maintaining a 3.6 GPA.",
    
    // Athletic Background
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
      fieldGoalPct: "45.2%",
      threePointPct: "38.7%"
    },
    awards: [
      "2024 ACC All-Conference First Team",
      "2023 ACC Tournament MVP",
      "2x ACC Player of the Week",
      "McDonald's All-American (HS)"
    ],
    
    // Social Media
    socialAccounts: [
      { platform: "Instagram", handle: "@jwilson_duke", followers: "125K" },
      { platform: "TikTok", handle: "@jameswilson", followers: "89K" },
      { platform: "Twitter/X", handle: "@jwilson2", followers: "45K" }
    ],
    totalFollowers: "259K",
    engagementRate: "4.8%",
    
    // Tags
    interestTags: ["Fashion", "Fitness", "Sneakers", "Music", "Mentorship", "Gaming"],
    contentTypes: ["Reels", "Training Videos", "Lifestyle", "Behind the Scenes", "Product Reviews"],
    
    // Deals
    deals: [
      {
        id: 1,
        brand: "Nike",
        brandLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png",
        dealType: "Ambassador",
        value: "$25,000",
        duration: "12 months",
        status: "active",
        startDate: "2024-01-15",
        endDate: "2025-01-15",
        deliverables: ["4 Instagram posts/month", "2 TikTok videos/month", "Event appearances"]
      },
      {
        id: 2,
        brand: "Gatorade",
        brandLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Gatorade_logo.svg/200px-Gatorade_logo.svg.png",
        dealType: "Sponsored Content",
        value: "$8,000",
        duration: "3 months",
        status: "active",
        startDate: "2024-11-01",
        endDate: "2025-02-01",
        deliverables: ["6 Instagram stories", "2 Reels", "Game day content"]
      },
      {
        id: 3,
        brand: "Beats by Dre",
        brandLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Beats_Electronics_logo.svg/200px-Beats_Electronics_logo.svg.png",
        dealType: "Product Partnership",
        value: "$5,000 + Products",
        duration: "6 months",
        status: "active",
        startDate: "2024-09-01",
        endDate: "2025-03-01",
        deliverables: ["Product features in content", "Unboxing video", "Workout playlist share"]
      }
    ],
    
    status: "active",
    joinedAt: "2024-08-15",
    profileCompleteness: 95
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
    bio: "Stanford Soccer standout and aspiring sports broadcaster. I love connecting with fans through authentic storytelling and showcasing the life of a student-athlete. When I'm not on the field, you'll find me creating content or studying Communications.",
    
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
      minutesPlayed: 1890
    },
    awards: [
      "2024 Pac-12 Offensive Player of the Year",
      "2023 All-American Third Team",
      "Stanford Female Athlete of the Year",
      "U-20 USWNT Call-up"
    ],
    
    socialAccounts: [
      { platform: "TikTok", handle: "@emmagoals", followers: "156K" },
      { platform: "Instagram", handle: "@emma_rodriguez", followers: "98K" },
      { platform: "YouTube", handle: "Emma Rodriguez", followers: "23K" }
    ],
    totalFollowers: "277K",
    engagementRate: "6.2%",
    
    interestTags: ["Travel", "Fashion", "Wellness", "Food", "Sustainability", "Women in Sports"],
    contentTypes: ["Vlogs", "Lifestyle", "Training", "Day in the Life", "Sitdown Interviews", "Comedy"],
    
    deals: [
      {
        id: 1,
        brand: "Adidas",
        brandLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/200px-Adidas_Logo.svg.png",
        dealType: "NIL Ambassador",
        value: "$40,000",
        duration: "24 months",
        status: "active",
        startDate: "2024-06-01",
        endDate: "2026-06-01",
        deliverables: ["Exclusive brand rep", "Monthly content", "2 commercial shoots"]
      },
      {
        id: 2,
        brand: "Chipotle",
        brandLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Chipotle_Mexican_Grill_logo.svg/200px-Chipotle_Mexican_Grill_logo.svg.png",
        dealType: "Social Campaign",
        value: "$12,000",
        duration: "4 months",
        status: "active",
        startDate: "2024-10-15",
        endDate: "2025-02-15",
        deliverables: ["TikTok series", "Instagram takeover", "In-store appearance"]
      },
      {
        id: 3,
        brand: "Oura Ring",
        brandLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Oura_logo.svg/200px-Oura_logo.svg.png",
        dealType: "Product Partnership",
        value: "$6,000 + Products",
        duration: "12 months",
        status: "active",
        startDate: "2024-08-01",
        endDate: "2025-08-01",
        deliverables: ["Recovery content", "Sleep tracking features", "Wellness tips"]
      },
      {
        id: 4,
        brand: "Fabletics",
        brandLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Fabletics_logo.svg/200px-Fabletics_logo.svg.png",
        dealType: "Affiliate",
        value: "$3,500 + Commission",
        duration: "6 months",
        status: "active",
        startDate: "2024-11-01",
        endDate: "2025-05-01",
        deliverables: ["Outfit features", "Discount code promotion", "Try-on content"]
      },
      {
        id: 5,
        brand: "Liquid I.V.",
        brandLogo: "",
        dealType: "Sponsored Posts",
        value: "$4,000",
        duration: "2 months",
        status: "completed",
        startDate: "2024-07-01",
        endDate: "2024-09-01",
        deliverables: ["3 Instagram posts", "Story series"]
      }
    ],
    
    status: "active",
    joinedAt: "2024-06-20",
    profileCompleteness: 100
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
    bio: "Ohio State QB1. Faith, family, football. I'm passionate about using my platform to inspire the next generation and give back to my community. Big into gaming and sneaker culture off the field.",
    
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
      interceptions: 6,
      completionPct: "68.4%",
      qbRating: 162.5,
      rushingYards: 456
    },
    awards: [
      "2024 Big Ten Offensive Player of the Year",
      "Heisman Trophy Finalist",
      "2x Big Ten Player of the Week",
      "5-Star Recruit (247Sports)"
    ],
    
    socialAccounts: [
      { platform: "Instagram", handle: "@mthompson_qb1", followers: "385K" },
      { platform: "TikTok", handle: "@marcusqb", followers: "220K" },
      { platform: "Twitter/X", handle: "@MarcusT_OSU", followers: "156K" },
      { platform: "Twitch", handle: "MarcusPlays", followers: "45K" }
    ],
    totalFollowers: "806K",
    engagementRate: "5.1%",
    
    interestTags: ["Gaming", "Sneakers", "Faith", "Community Service", "Fashion", "Cars", "Music Production"],
    contentTypes: ["Reels", "Gaming Streams", "Training", "Lifestyle", "Comedy", "Behind the Scenes"],
    
    deals: [
      {
        id: 1,
        brand: "Fanatics",
        brandLogo: "",
        dealType: "Exclusive NIL",
        value: "$150,000",
        duration: "24 months",
        status: "active",
        startDate: "2024-01-01",
        endDate: "2026-01-01",
        deliverables: ["Jersey sales royalties", "Autograph sessions", "Exclusive merchandise"]
      },
      {
        id: 2,
        brand: "EA Sports",
        brandLogo: "",
        dealType: "Gaming Partnership",
        value: "$75,000",
        duration: "12 months",
        status: "active",
        startDate: "2024-07-01",
        endDate: "2025-07-01",
        deliverables: ["College Football 25 promotion", "Twitch streams", "Tournament hosting"]
      },
      {
        id: 3,
        brand: "Oakley",
        brandLogo: "",
        dealType: "Ambassador",
        value: "$30,000",
        duration: "18 months",
        status: "active",
        startDate: "2024-03-15",
        endDate: "2025-09-15",
        deliverables: ["Eyewear features", "Game day content", "Training content"]
      },
      {
        id: 4,
        brand: "Raising Cane's",
        brandLogo: "",
        dealType: "Local Partnership",
        value: "$20,000",
        duration: "12 months",
        status: "active",
        startDate: "2024-08-01",
        endDate: "2025-08-01",
        deliverables: ["Store appearances", "Social content", "Team meal sponsorship"]
      },
      {
        id: 5,
        brand: "Sleep Number",
        brandLogo: "",
        dealType: "Product Partnership",
        value: "$15,000 + Products",
        duration: "12 months",
        status: "active",
        startDate: "2024-05-01",
        endDate: "2025-05-01",
        deliverables: ["Recovery content", "Sleep tracking features"]
      },
      {
        id: 6,
        brand: "StockX",
        brandLogo: "",
        dealType: "Affiliate",
        value: "$8,000 + Commission",
        duration: "Ongoing",
        status: "active",
        startDate: "2024-04-01",
        endDate: "2025-04-01",
        deliverables: ["Sneaker content", "Pickup videos", "Collection showcases"]
      },
      {
        id: 7,
        brand: "Pepsi",
        brandLogo: "",
        dealType: "Commercial",
        value: "$25,000",
        duration: "3 months",
        status: "completed",
        startDate: "2024-09-01",
        endDate: "2024-12-01",
        deliverables: ["TV Commercial", "Social campaign"]
      },
      {
        id: 8,
        brand: "Bose",
        brandLogo: "",
        dealType: "Product Partnership",
        value: "$10,000 + Products",
        duration: "6 months",
        status: "active",
        startDate: "2024-10-01",
        endDate: "2025-04-01",
        deliverables: ["Headphone features", "Pre-game ritual content"]
      }
    ],
    
    status: "active",
    joinedAt: "2024-01-10",
    profileCompleteness: 98
  }
];

// Sample data for requests
const athleteRequests = [
  {
    id: 1,
    firstName: "Jordan",
    lastName: "Lee",
    email: "jordan.l@university.edu",
    dateOfBirth: "2003-03-15",
    location: "Atlanta, GA",
    school: "Georgia Tech",
    sport: "Football",
    position: "Wide Receiver",
    primarySocial: { platform: "Instagram", handle: "@jordanl_wr" },
    bio: "4-star recruit, 2x All-State selection. Passionate about fitness and helping others achieve their goals.",
    goals: "Looking for partnerships with sports nutrition brands and athletic apparel companies.",
    status: "pending",
    submittedAt: "2024-12-18"
  },
  {
    id: 2,
    firstName: "Aaliyah",
    lastName: "Johnson",
    email: "aaliyah.j@college.edu",
    dateOfBirth: "2004-07-22",
    location: "Los Angeles, CA",
    school: "UCLA",
    sport: "Basketball",
    position: "Point Guard",
    primarySocial: { platform: "TikTok", handle: "@aaliyahhoops" },
    bio: "Team captain, 15 PPG average. Love creating content and connecting with fans.",
    goals: "Interested in lifestyle brands, beauty partnerships, and sports equipment deals.",
    status: "pending",
    submittedAt: "2024-12-19"
  }
];

const brandRequests = [
  {
    id: 1,
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
    goals: "Increase brand awareness among college athletes, launch new protein line",
    timeline: "Short-term (1-3 months)",
    athletePreferences: "Looking for athletes with strong social media presence, preferably in football, basketball, or fitness",
    status: "pending",
    submittedAt: "2024-12-17"
  },
  {
    id: 2,
    company: "GameDay Apparel",
    contactFirstName: "Michael",
    contactLastName: "Chen",
    contactTitle: "Brand Manager",
    email: "mchen@gamedayapparel.com",
    phone: "(555) 987-6543",
    website: "https://gamedayapparel.com",
    industry: "Apparel & Fashion",
    companySize: "Small (11-50 employees)",
    budget: "$15,000 - $50,000",
    description: "Trendy athletic wear for the modern college athlete. Streetwear meets performance.",
    targetAudience: "Gen Z athletes, fashion-forward sports fans",
    goals: "Build ambassador program, increase social media following, drive online sales",
    timeline: "Medium-term (3-6 months)",
    athletePreferences: "Athletes with unique style, strong TikTok or Instagram presence, any sport",
    status: "pending",
    submittedAt: "2024-12-19"
  }
];

const brands = [
  {
    id: 1,
    company: "Hydrate Pro",
    contactName: "Alex Rivera",
    email: "alex@hydratepro.com",
    industry: "Food & Beverage",
    budget: "$100,000 - $250,000",
    activeDeals: 4,
    status: "active",
    joinedAt: "2024-07-15"
  },
  {
    id: 2,
    company: "Peak Performance Gear",
    contactName: "Rachel Kim",
    email: "rachel@peakgear.com",
    industry: "Sports & Fitness",
    budget: "$50,000 - $100,000",
    activeDeals: 2,
    status: "active",
    joinedAt: "2024-09-01"
  }
];

type Athlete = typeof athletes[0];
type AthleteRequest = typeof athleteRequests[0];
type BrandRequest = typeof brandRequests[0];
type Brand = typeof brands[0];

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAthleteRequest, setSelectedAthleteRequest] = useState<AthleteRequest | null>(null);
  const [selectedBrandRequest, setSelectedBrandRequest] = useState<BrandRequest | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "text-green-500 bg-green-500/10";
      case "pending":
        return "text-yellow-500 bg-yellow-500/10";
      case "rejected":
      case "completed":
        return "text-gray-500 bg-gray-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return <CheckCircle size={14} />;
      case "pending":
        return <Clock size={14} />;
      case "rejected":
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

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

  const stats = [
    { label: "Athlete Requests", value: athleteRequests.filter(a => a.status === "pending").length, icon: UserPlus, color: "text-blue-500" },
    { label: "Brand Requests", value: brandRequests.filter(b => b.status === "pending").length, icon: BriefcaseIcon, color: "text-purple-500" },
    { label: "Total Athletes", value: athletes.length, icon: Users, color: "text-green-500" },
    { label: "Total Brands", value: brands.length, icon: Building2, color: "text-orange-500" },
  ];

  const calculateTotalDealValue = (athlete: Athlete) => {
    let total = 0;
    athlete.deals.forEach(deal => {
      const match = deal.value.match(/\$?([\d,]+)/);
      if (match) {
        total += parseInt(match[1].replace(",", ""));
      }
    });
    return total.toLocaleString();
  };

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
            <h1 className="text-4xl font-black tracking-wider mb-2">
              ADMIN <span className="text-primary">DASHBOARD</span>
            </h1>
            <p className="text-muted-foreground">
              Manage athletes, brands, and partnership requests
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="bg-card p-6 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className={stat.color} size={24} />
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search athletes, brands, or requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-card"
              />
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="athletes" className="space-y-6">
              <TabsList className="bg-card border border-border p-1 h-auto flex-wrap">
                <TabsTrigger value="athletes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Users size={16} className="mr-2" />
                  Athletes
                </TabsTrigger>
                <TabsTrigger value="brands" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Building2 size={16} className="mr-2" />
                  Brands
                </TabsTrigger>
                <TabsTrigger value="athlete-requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UserPlus size={16} className="mr-2" />
                  Athlete Requests
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-xs">
                    {athleteRequests.filter(a => a.status === "pending").length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="brand-requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BriefcaseIcon size={16} className="mr-2" />
                  Brand Requests
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-xs">
                    {brandRequests.filter(b => b.status === "pending").length}
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Athletes Tab */}
              <TabsContent value="athletes">
                <div className="grid gap-4">
                  {athletes.map((athlete) => (
                    <motion.div
                      key={athlete.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedAthlete(athlete)}
                    >
                      <div className="flex items-start gap-6">
                        {/* Profile Image */}
                        <img
                          src={athlete.profileImage}
                          alt={`${athlete.firstName} ${athlete.lastName}`}
                          className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                        />
                        
                        {/* Basic Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold">{athlete.firstName} {athlete.lastName}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(athlete.status)}`}>
                              {getStatusIcon(athlete.status)}
                              {athlete.status}
                            </span>
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {athlete.sport} • {athlete.position} • {athlete.school}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              <span className="text-foreground font-semibold">{athlete.totalFollowers}</span> followers
                            </span>
                            <span className="text-muted-foreground">
                              <span className="text-primary font-semibold">{athlete.deals.filter(d => d.status === "active").length}</span> active deals
                            </span>
                            <span className="text-muted-foreground">
                              <span className="text-green-500 font-semibold">${calculateTotalDealValue(athlete)}</span> total value
                            </span>
                          </div>
                        </div>

                        {/* Tags Preview */}
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

                        {/* View Button */}
                        <Button variant="outline" size="sm">
                          <Eye size={14} className="mr-1" />
                          View Profile
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Brands Tab */}
              <TabsContent value="brands">
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-semibold">Company</th>
                          <th className="text-left p-4 font-semibold">Contact</th>
                          <th className="text-left p-4 font-semibold">Industry</th>
                          <th className="text-left p-4 font-semibold">Budget</th>
                          <th className="text-left p-4 font-semibold">Active Deals</th>
                          <th className="text-left p-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brands.map((brand) => (
                          <tr key={brand.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold">
                                  {brand.company[0]}
                                </div>
                                <p className="font-medium">{brand.company}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{brand.contactName}</p>
                                <p className="text-sm text-muted-foreground">{brand.email}</p>
                              </div>
                            </td>
                            <td className="p-4">{brand.industry}</td>
                            <td className="p-4">{brand.budget}</td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-500 text-sm font-medium">
                                {brand.activeDeals} deals
                              </span>
                            </td>
                            <td className="p-4">
                              <Button size="sm" variant="outline" onClick={() => setSelectedBrand(brand)}>
                                <Eye size={14} className="mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* Athlete Requests Tab */}
              <TabsContent value="athlete-requests">
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-semibold">Name</th>
                          <th className="text-left p-4 font-semibold">School</th>
                          <th className="text-left p-4 font-semibold">Sport</th>
                          <th className="text-left p-4 font-semibold">Status</th>
                          <th className="text-left p-4 font-semibold">Submitted</th>
                          <th className="text-left p-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {athleteRequests.map((request) => (
                          <tr key={request.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{request.firstName} {request.lastName}</p>
                                <p className="text-sm text-muted-foreground">{request.email}</p>
                              </div>
                            </td>
                            <td className="p-4">{request.school}</td>
                            <td className="p-4">{request.sport} - {request.position}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {getStatusIcon(request.status)}
                                {request.status}
                              </span>
                            </td>
                            <td className="p-4 text-muted-foreground">{request.submittedAt}</td>
                            <td className="p-4">
                              <Button size="sm" variant="outline" onClick={() => setSelectedAthleteRequest(request)}>
                                <Eye size={14} className="mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* Brand Requests Tab */}
              <TabsContent value="brand-requests">
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-semibold">Company</th>
                          <th className="text-left p-4 font-semibold">Contact</th>
                          <th className="text-left p-4 font-semibold">Industry</th>
                          <th className="text-left p-4 font-semibold">Budget</th>
                          <th className="text-left p-4 font-semibold">Status</th>
                          <th className="text-left p-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brandRequests.map((request) => (
                          <tr key={request.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{request.company}</p>
                                <p className="text-sm text-muted-foreground">{request.website}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{request.contactFirstName} {request.contactLastName}</p>
                                <p className="text-sm text-muted-foreground">{request.contactTitle}</p>
                              </div>
                            </td>
                            <td className="p-4">{request.industry}</td>
                            <td className="p-4">{request.budget}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {getStatusIcon(request.status)}
                                {request.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <Button size="sm" variant="outline" onClick={() => setSelectedBrandRequest(request)}>
                                <Eye size={14} className="mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Athlete Profile Modal */}
      <Dialog open={!!selectedAthlete} onOpenChange={() => setSelectedAthlete(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
          {selectedAthlete && (
            <>
              {/* Header Banner */}
              <div className="relative h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
                <div className="absolute -bottom-16 left-8">
                  <img
                    src={selectedAthlete.profileImage}
                    alt={`${selectedAthlete.firstName} ${selectedAthlete.lastName}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl"
                  />
                </div>
              </div>

              <div className="pt-20 px-8 pb-8">
                {/* Name and Basic Info */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-1">
                      {selectedAthlete.firstName} {selectedAthlete.lastName}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {selectedAthlete.sport} • {selectedAthlete.position}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAthlete.status)}`}>
                        {getStatusIcon(selectedAthlete.status)}
                        {selectedAthlete.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {selectedAthlete.profileCompleteness}% profile complete
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{selectedAthlete.totalFollowers}</p>
                    <p className="text-sm text-muted-foreground">Total Followers</p>
                    <p className="text-sm text-green-500 mt-1">{selectedAthlete.engagementRate} engagement</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6 p-4 bg-muted rounded-xl">
                  <p className="text-sm leading-relaxed">{selectedAthlete.bio}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-card p-4 rounded-xl border border-border text-center">
                    <p className="text-2xl font-bold text-primary">{selectedAthlete.deals.filter(d => d.status === "active").length}</p>
                    <p className="text-xs text-muted-foreground">Active Deals</p>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border text-center">
                    <p className="text-2xl font-bold text-green-500">${calculateTotalDealValue(selectedAthlete)}</p>
                    <p className="text-xs text-muted-foreground">Deal Value</p>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border text-center">
                    <p className="text-2xl font-bold">{selectedAthlete.socialAccounts.length}</p>
                    <p className="text-xs text-muted-foreground">Platforms</p>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border text-center">
                    <p className="text-2xl font-bold">{selectedAthlete.awards.length}</p>
                    <p className="text-xs text-muted-foreground">Awards</p>
                  </div>
                </div>

                <Tabs defaultValue="background" className="space-y-4">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="background">Athletic Background</TabsTrigger>
                    <TabsTrigger value="deals">Deals ({selectedAthlete.deals.length})</TabsTrigger>
                    <TabsTrigger value="social">Social Media</TabsTrigger>
                    <TabsTrigger value="tags">Tags & Interests</TabsTrigger>
                    <TabsTrigger value="contact">Contact Info</TabsTrigger>
                  </TabsList>

                  {/* Athletic Background Tab */}
                  <TabsContent value="background" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
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
                        <div className="space-y-3">
                          {Object.entries(selectedAthlete.seasonStats).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className="font-bold text-lg">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Deals Tab */}
                  <TabsContent value="deals" className="space-y-4">
                    {selectedAthlete.deals.map((deal) => (
                      <div key={deal.id} className={`p-4 rounded-xl border ${deal.status === "active" ? "bg-card border-border" : "bg-muted/50 border-border/50"}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center p-2">
                              {deal.brandLogo ? (
                                <img src={deal.brandLogo} alt={deal.brand} className="max-w-full max-h-full object-contain" />
                              ) : (
                                <span className="text-lg font-bold text-gray-900">{deal.brand[0]}</span>
                              )}
                            </div>
                            <div>
                              <h5 className="font-bold">{deal.brand}</h5>
                              <p className="text-sm text-muted-foreground">{deal.dealType}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-green-500">{deal.value}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                              {deal.status}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-muted-foreground" />
                            <span>{deal.startDate} → {deal.endDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-muted-foreground" />
                            <span>{deal.duration}</span>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2">Deliverables:</p>
                          <div className="flex flex-wrap gap-2">
                            {deal.deliverables.map((item, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Social Media Tab */}
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

                  {/* Tags Tab */}
                  <TabsContent value="tags" className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Heart size={18} className="text-red-500" />
                        Interest Tags
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">What brands can align with this athlete on</p>
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
                      <p className="text-sm text-muted-foreground mb-3">Types of content this athlete creates</p>
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

                  {/* Contact Tab */}
                  <TabsContent value="contact" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-card rounded-xl border border-border">
                        <div className="flex items-center gap-3 mb-2">
                          <Mail size={18} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Email</span>
                        </div>
                        <p className="font-medium">{selectedAthlete.email}</p>
                      </div>
                      <div className="p-4 bg-card rounded-xl border border-border">
                        <div className="flex items-center gap-3 mb-2">
                          <Phone size={18} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Phone</span>
                        </div>
                        <p className="font-medium">{selectedAthlete.phone}</p>
                      </div>
                      <div className="p-4 bg-card rounded-xl border border-border">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin size={18} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Location</span>
                        </div>
                        <p className="font-medium">{selectedAthlete.location}</p>
                      </div>
                      <div className="p-4 bg-card rounded-xl border border-border">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar size={18} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Member Since</span>
                        </div>
                        <p className="font-medium">{selectedAthlete.joinedAt}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Athlete Request Modal */}
      <Dialog open={!!selectedAthleteRequest} onOpenChange={() => setSelectedAthleteRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Athlete Application</DialogTitle>
            <DialogDescription>Review this athlete's signup request</DialogDescription>
          </DialogHeader>
          {selectedAthleteRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                  {selectedAthleteRequest.firstName[0]}{selectedAthleteRequest.lastName[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedAthleteRequest.firstName} {selectedAthleteRequest.lastName}</h3>
                  <p className="text-muted-foreground">{selectedAthleteRequest.school} • {selectedAthleteRequest.sport}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Email:</span> {selectedAthleteRequest.email}</div>
                <div><span className="text-muted-foreground">Location:</span> {selectedAthleteRequest.location}</div>
                <div><span className="text-muted-foreground">Position:</span> {selectedAthleteRequest.position}</div>
                <div><span className="text-muted-foreground">Social:</span> {selectedAthleteRequest.primarySocial.handle}</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Bio</h4>
                <p className="text-sm">{selectedAthleteRequest.bio}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Goals</h4>
                <p className="text-sm">{selectedAthleteRequest.goals}</p>
              </div>
              {selectedAthleteRequest.status === "pending" && (
                <div className="flex gap-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle size={16} className="mr-2" /> Approve
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    <XCircle size={16} className="mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Brand Request Modal */}
      <Dialog open={!!selectedBrandRequest} onOpenChange={() => setSelectedBrandRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Brand Partnership Request</DialogTitle>
            <DialogDescription>Review this brand's partnership application</DialogDescription>
          </DialogHeader>
          {selectedBrandRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 text-xl font-bold">
                  {selectedBrandRequest.company[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedBrandRequest.company}</h3>
                  <p className="text-muted-foreground">{selectedBrandRequest.industry}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Contact:</span> {selectedBrandRequest.contactFirstName} {selectedBrandRequest.contactLastName}</div>
                <div><span className="text-muted-foreground">Title:</span> {selectedBrandRequest.contactTitle}</div>
                <div><span className="text-muted-foreground">Email:</span> {selectedBrandRequest.email}</div>
                <div><span className="text-muted-foreground">Budget:</span> <span className="text-primary font-semibold">{selectedBrandRequest.budget}</span></div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm">{selectedBrandRequest.description}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Athlete Preferences</h4>
                <p className="text-sm">{selectedBrandRequest.athletePreferences}</p>
              </div>
              {selectedBrandRequest.status === "pending" && (
                <div className="flex gap-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle size={16} className="mr-2" /> Approve
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    <XCircle size={16} className="mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Brand Profile Modal */}
      <Dialog open={!!selectedBrand} onOpenChange={() => setSelectedBrand(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Brand Profile</DialogTitle>
          </DialogHeader>
          {selectedBrand && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 text-2xl font-bold">
                  {selectedBrand.company[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedBrand.company}</h3>
                  <p className="text-muted-foreground">{selectedBrand.industry}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-500">{selectedBrand.activeDeals}</p>
                  <p className="text-sm text-muted-foreground">Active Deals</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-lg font-bold text-purple-500">{selectedBrand.budget}</p>
                  <p className="text-sm text-muted-foreground">Budget</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-muted-foreground" />
                  <span>{selectedBrand.contactName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-muted-foreground" />
                  <span>{selectedBrand.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span>Joined: {selectedBrand.joinedAt}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
