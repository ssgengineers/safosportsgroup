import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@clerk/clerk-react";
import { getUserMe, getMyAthleteProfile, getAllBrandProfiles, UserResponse, AthleteProfileResponse, BrandProfileResponse } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Trophy,
  TrendingUp,
  Calendar,
  Settings,
  FileText,
  CheckCircle,
  Clock,
  Award,
  Target,
  School,
  MapPin,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  ExternalLink,
  Users,
  BarChart3,
  Star,
  LayoutDashboard,
  Handshake,
  Briefcase,
  MessageSquare,
  UserCircle,
  Zap,
  Sparkles,
  ChevronRight,
  Building2,
  Eye,
  Loader2,
  Save,
  Edit3,
  DollarSign,
  Heart,
  Video,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

// Type for brand display in the UI
type Brand = {
  id: string;
  companyName: string;
  industry?: string;
  companySize?: string;
  website?: string;
  description?: string;
  budgetRange?: string;
  targetAudience?: string;
  marketingGoals?: string;
};

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

const DEAL_TYPES = [
  "Sponsored Post",
  "Product Endorsement",
  "Brand Ambassador",
  "Event Appearance",
  "Content Creation",
  "Social Media Campaign",
  "Other"
];

const AthleteDashboard = () => {
  const { toast } = useToast();
  const { getToken, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Brand data
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);

  // Preferences editing state
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesData, setPreferencesData] = useState({
    preferredIndustries: [] as string[],
    preferredDealTypes: [] as string[],
    minBudget: "",
    maxBudget: "",
    interestAlignment: [] as string[],
    contentTypes: [] as string[],
    notes: "",
  });

  // AI Search state
  const [showAISearchModal, setShowAISearchModal] = useState(false);
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiSearchResults, setAISearchResults] = useState<Array<Brand & { matchScore: number; matchReasons: string[] }>>([]);
  const [savedBrands, setSavedBrands] = useState<string[]>([]);

  // Helper function to map API response to UI format
  const mapBrandProfileToUI = (profile: BrandProfileResponse): Brand => {
    return {
      id: profile.id,
      companyName: profile.companyName || "Unknown",
      industry: profile.industry,
      companySize: profile.companySize,
      website: profile.website,
      description: profile.description,
      budgetRange: profile.budgetRange,
      targetAudience: profile.targetAudience,
      marketingGoals: profile.marketingGoals,
    };
  };

  const fetchBrands = async () => {
    if (!authToken) {
      console.log("No auth token available, skipping brand fetch");
      return;
    }
    
    setBrandsLoading(true);
    try {
      const response = await getAllBrandProfiles(0, 100, authToken);
      
      if (!response.content || response.content.length === 0) {
        console.log("No brands found in response");
        setAllBrands([]);
        return;
      }
      
      const mappedBrands = response.content.map(mapBrandProfileToUI);
      setAllBrands(mappedBrands);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      toast({
        title: "Failed to load brands",
        description: error instanceof Error ? error.message : "Could not fetch brand profiles. Please try again later.",
        variant: "destructive",
      });
      setAllBrands([]);
    } finally {
      setBrandsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded) return;
      
      try {
        const token = await getToken();
        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        setAuthToken(token);

        // Fetch user data
        const userData = await getUserMe(token);
        setUser(userData);

        // Fetch athlete profile if user has one
        if (userData.hasAthleteProfile) {
          try {
            const profile = await getMyAthleteProfile(token);
            setAthleteProfile(profile);
          } catch (profileError) {
            console.error("Failed to fetch athlete profile:", profileError);
            // Don't set error if profile doesn't exist yet
            if (profileError instanceof Error && !profileError.message.includes('not found')) {
              setError(profileError.message);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error instanceof Error ? error.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, getToken]);

  // Fetch brands when auth token is available
  useEffect(() => {
    if (authToken && !loading && user && athleteProfile) {
      fetchBrands();
    }
  }, [authToken, loading, user, athleteProfile]);

  // AI Matching function for brands
  const calculateMatchScore = (brand: Brand, prefs: typeof preferencesData, athlete: AthleteProfileResponse | null): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];

    if (prefs.preferredIndustries.length > 0 && brand.industry) {
      if (prefs.preferredIndustries.some(ind => ind.toLowerCase() === brand.industry?.toLowerCase())) {
        score += 25;
        reasons.push(`Industry match: ${brand.industry}`);
      }
    }

    // Match based on athlete's sport if brand has preferences
    if (athlete?.sport && brand.targetAudience) {
      const targetLower = brand.targetAudience.toLowerCase();
      const sportLower = athlete.sport.toLowerCase();
      if (targetLower.includes(sportLower) || sportLower.includes(targetLower)) {
        score += 20;
        reasons.push(`Sport alignment: ${athlete.sport}`);
      }
    }

    // Budget range matching
    if (prefs.minBudget && prefs.maxBudget && brand.budgetRange) {
      // Simple budget matching (could be enhanced)
      score += 15;
      reasons.push(`Budget available: ${brand.budgetRange}`);
    }

    // Interest alignment (if brand has marketing goals that align)
    if (prefs.interestAlignment.length > 0 && brand.marketingGoals) {
      const goalsLower = brand.marketingGoals.toLowerCase();
      const interestMatches = prefs.interestAlignment.filter(interest =>
        goalsLower.includes(interest.toLowerCase())
      );
      if (interestMatches.length > 0) {
        const interestScore = Math.min(interestMatches.length * 10, 25);
        score += interestScore;
        reasons.push(`Interest alignment: ${interestMatches.slice(0, 2).join(", ")}`);
      }
    }

    // Content type matching
    if (prefs.contentTypes.length > 0 && brand.description) {
      const descLower = brand.description.toLowerCase();
      const contentMatches = prefs.contentTypes.filter(content =>
        descLower.includes(content.toLowerCase())
      );
      if (contentMatches.length > 0) {
        score += 15;
        reasons.push(`Content match: ${contentMatches[0]}`);
      }
    }

    return { score: Math.min(score, 100), reasons };
  };

  const runAISearch = () => {
    if (!athleteProfile) {
      toast({
        title: "Profile Required",
        description: "Please complete your profile before using AI matching.",
        variant: "destructive",
      });
      return;
    }

    setShowAISearchModal(true);
    setIsAISearching(true);
    setAISearchResults([]);

    setTimeout(() => {
      const scoredBrands = allBrands.map(brand => {
        const { score, reasons } = calculateMatchScore(brand, preferencesData, athleteProfile);
        return {
          ...brand,
          matchScore: score,
          matchReasons: reasons
        };
      });

      scoredBrands.sort((a, b) => b.matchScore - a.matchScore);
      setAISearchResults(scoredBrands);
      setIsAISearching(false);
    }, 2000);
  };

  const toggleSavedBrand = (brandId: string) => {
    setSavedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const isSaved = (brandId: string) => savedBrands.includes(brandId);

  const totalFollowers = athleteProfile?.socialAccounts?.reduce((sum, acc) => sum + (acc.followers || 0), 0) || 0;

  const stats = [
    { label: "Active Deals", value: 0, icon: Trophy, color: "text-primary" },
    { label: "Profile Views", value: 0, icon: TrendingUp, color: "text-blue-500" },
    { label: "Pending Requests", value: 0, icon: Clock, color: "text-yellow-500" },
    { label: "Profile Complete", value: athleteProfile?.profileCompletenessScore || athleteProfile?.completenessScore || 0, icon: Target, color: "text-green-500" },
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
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
                  {athleteProfile?.firstName?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-wider">
                    {athleteProfile?.firstName && athleteProfile?.lastName
                      ? `${athleteProfile.firstName.toUpperCase()} ${athleteProfile.lastName.toUpperCase()}`
                      : "ATHLETE DASHBOARD"}
                  </h1>
                  <p className="text-muted-foreground">
                    Welcome back, {athleteProfile?.firstName || user?.firstName || "Athlete"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/athlete-profile")}
              >
                <UserCircle size={16} className="mr-2" />
                Athlete Profile
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
                  <span className="text-3xl font-bold">{stat.value}{stat.label === "Profile Complete" ? "%" : ""}</span>
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
                <TabsTrigger value="deals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Handshake size={16} className="mr-2" />
                  Deals
                </TabsTrigger>
                <TabsTrigger value="opportunities" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Briefcase size={16} className="mr-2" />
                  Opportunities
                </TabsTrigger>
                <TabsTrigger value="applications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText size={16} className="mr-2" />
                  Applications
                </TabsTrigger>
                <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <MessageSquare size={16} className="mr-2" />
                  Messages
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
                        <h3 className="font-bold text-2xl">Find Your Perfect Brand Match</h3>
                        <p className="text-muted-foreground">AI-powered brand discovery based on your preferences</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
                      Our AI analyzes your preferences—industries, deal types, budget expectations, interests, and content types—to find brands that align with your values and career goals.
                    </p>

                    <div className="flex flex-wrap gap-4 items-center">
                      <Button 
                        size="lg" 
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 shadow-lg shadow-primary/30"
                        onClick={runAISearch}
                        disabled={!athleteProfile}
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
                        {preferencesData.preferredIndustries.length > 0 ? (
                          preferencesData.preferredIndustries.map((industry, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-background/50">{industry}</Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-background/50">No industries selected</Badge>
                        )}
                        {preferencesData.minBudget && preferencesData.maxBudget ? (
                          <Badge variant="secondary" className="text-xs bg-background/50">{preferencesData.minBudget} - {preferencesData.maxBudget}</Badge>
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

                {/* Profile Completeness */}
                {athleteProfile && (
                  <div className="bg-card p-6 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">Profile Completeness</h3>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/athlete-profile")}
                      >
                        <UserCircle size={16} className="mr-2" />
                        View Profile
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Completion</span>
                          <span className="text-sm font-bold text-primary">
                            {athleteProfile.profileCompletenessScore || athleteProfile.completenessScore || 0}%
                          </span>
                        </div>
                        <Progress 
                          value={athleteProfile.profileCompletenessScore || athleteProfile.completenessScore || 0} 
                          className="h-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {athleteProfile.sport && (
                          <div>
                            <p className="text-muted-foreground">Sport</p>
                            <p className="font-medium">{athleteProfile.sport}</p>
                          </div>
                        )}
                        {athleteProfile.position && (
                          <div>
                            <p className="text-muted-foreground">Position</p>
                            <p className="font-medium">{athleteProfile.position}</p>
                          </div>
                        )}
                        {athleteProfile.schoolName && (
                          <div>
                            <p className="text-muted-foreground">School</p>
                            <p className="font-medium">{athleteProfile.schoolName}</p>
                          </div>
                        )}
                        {athleteProfile.conference && (
                          <div>
                            <p className="text-muted-foreground">Conference</p>
                            <p className="font-medium">{athleteProfile.conference}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-2 hover:border-primary/50"
                    onClick={() => navigate("/athlete-profile")}
                  >
                    <UserCircle size={24} className="text-primary" />
                    <span>View Profile</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-2 hover:border-primary/50"
                    onClick={() => setActiveTab("opportunities")}
                  >
                    <Briefcase size={24} className="text-primary" />
                    <span>Browse Opportunities</span>
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

              {/* Deals Tab */}
              <TabsContent value="deals" className="space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-bold text-lg mb-4">Active Deals</h3>
                  <div className="text-center py-12 text-muted-foreground">
                    <Handshake size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No active deals yet</p>
                    <p className="text-sm mt-2">Your active partnerships will appear here</p>
                  </div>
                </div>
              </TabsContent>

              {/* Opportunities Tab */}
              <TabsContent value="opportunities" className="space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Available Opportunities</h3>
                    <Button
                      variant="outline"
                      onClick={runAISearch}
                      disabled={!athleteProfile}
                    >
                      <Sparkles size={16} className="mr-2" />
                      AI Match Brands
                    </Button>
                  </div>
                  {brandsLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Loader2 size={48} className="mx-auto mb-4 opacity-50 animate-spin" />
                      <p>Loading opportunities...</p>
                    </div>
                  ) : allBrands.length > 0 ? (
                    <div className="grid gap-4">
                      {allBrands.slice(0, 10).map((brand) => (
                        <div
                          key={brand.id}
                          className="p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{brand.companyName}</h4>
                              {brand.industry && (
                                <p className="text-sm text-muted-foreground mb-2">{brand.industry}</p>
                              )}
                              {brand.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{brand.description}</p>
                              )}
                              {brand.budgetRange && (
                                <Badge variant="secondary" className="mt-2">
                                  <DollarSign size={12} className="mr-1" />
                                  {brand.budgetRange}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleSavedBrand(brand.id)}
                                className={isSaved(brand.id) ? "text-primary" : "text-muted-foreground"}
                              >
                                {isSaved(brand.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye size={14} className="mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No opportunities available</p>
                      <p className="text-sm mt-2">NIL opportunities from brands will appear here</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Applications Tab */}
              <TabsContent value="applications" className="space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-bold text-lg mb-4">Your Applications</h3>
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No applications yet</p>
                    <p className="text-sm mt-2">Applications you submit will appear here</p>
                  </div>
                </div>
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages" className="space-y-6">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-bold text-lg mb-4">Messages</h3>
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm mt-2">Messages from brands will appear here</p>
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
                    Define what you're looking for in brand partnerships. Our AI will use these preferences to recommend the best matches.
                  </p>
                  
                  <div className="flex justify-end mb-6">
                    <Button 
                      variant={isEditingPreferences ? "default" : "outline"}
                      onClick={() => {
                        if (isEditingPreferences) {
                          // Save preferences (could be stored in athlete profile or separate storage)
                          setIsEditingPreferences(false);
                          toast({
                            title: "Preferences Saved",
                            description: "Your AI matching preferences have been saved successfully.",
                          });
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
                          <Building2 size={16} className="text-primary" />
                          Preferred Industries
                        </label>
                        {isEditingPreferences ? (
                          <Input
                            value={preferencesData.preferredIndustries.join(", ")}
                            onChange={(e) => setPreferencesData({...preferencesData, preferredIndustries: e.target.value.split(", ").map(i => i.trim()).filter(i => i)})}
                            className="bg-background"
                            placeholder="Sports & Fitness, Apparel & Fashion"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {preferencesData.preferredIndustries.length > 0 ? (
                              preferencesData.preferredIndustries.map((industry, i) => (
                                <Badge key={i} className="bg-primary/10 text-primary">{industry}</Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No industries selected</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-background/50 rounded-lg">
                        <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                          <Handshake size={16} className="text-primary" />
                          Preferred Deal Types
                        </label>
                        {isEditingPreferences ? (
                          <Input
                            value={preferencesData.preferredDealTypes.join(", ")}
                            onChange={(e) => setPreferencesData({...preferencesData, preferredDealTypes: e.target.value.split(", ").map(d => d.trim()).filter(d => d)})}
                            className="bg-background"
                            placeholder="Sponsored Post, Brand Ambassador"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {preferencesData.preferredDealTypes.length > 0 ? (
                              preferencesData.preferredDealTypes.map((deal, i) => (
                                <Badge key={i} variant="secondary">{deal}</Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No deal types selected</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-background/50 rounded-lg">
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
                              placeholder="Min (e.g., $1,000)"
                            />
                            <Input
                              value={preferencesData.maxBudget}
                              onChange={(e) => setPreferencesData({...preferencesData, maxBudget: e.target.value})}
                              className="bg-background"
                              placeholder="Max (e.g., $50,000)"
                            />
                          </div>
                        ) : (
                          <p className="font-medium">
                            {preferencesData.minBudget && preferencesData.maxBudget 
                              ? `${preferencesData.minBudget} - ${preferencesData.maxBudget}`
                              : <span className="text-muted-foreground">Not set</span>
                            }
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
                            value={preferencesData.contentTypes.join(", ")}
                            onChange={(e) => setPreferencesData({...preferencesData, contentTypes: e.target.value.split(", ").map(c => c.trim()).filter(c => c)})}
                            className="bg-background"
                            placeholder="Training Videos, Lifestyle"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {preferencesData.contentTypes.length > 0 ? (
                              preferencesData.contentTypes.map((content, i) => (
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
                Brands ranked by compatibility with your preferences
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
                <h3 className="text-xl font-bold mb-2">Analyzing Brands...</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Our AI is evaluating {allBrands.length} brands based on your preferences for industries, deal types, budget, interests, and content types.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {aiSearchResults.map((brand, index) => (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-5 rounded-xl border transition-all ${
                      index === 0 
                        ? "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30" 
                        : "bg-card border-border hover:border-primary/30"
                    }`}
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
                        {brand.companyName?.[0]?.toUpperCase() || "B"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-lg">{brand.companyName}</h4>
                          {index === 0 && (
                            <Badge className="bg-primary text-primary-foreground">
                              <Star size={12} className="mr-1" />
                              Top Match
                            </Badge>
                          )}
                        </div>
                        {brand.industry && (
                          <p className="text-muted-foreground mb-2">{brand.industry}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {brand.matchReasons.map((reason, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              <CheckCircle size={10} className="mr-1 text-green-500" />
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className={`text-3xl font-black ${
                          brand.matchScore >= 70 ? "text-green-500" :
                          brand.matchScore >= 50 ? "text-yellow-500" :
                          "text-muted-foreground"
                        }`}>
                          {brand.matchScore}%
                        </div>
                        <p className="text-xs text-muted-foreground">match score</p>
                        <div className="mt-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => toggleSavedBrand(brand.id)}
                          >
                            {isSaved(brand.id) ? (
                              <BookmarkCheck size={16} className="text-primary" />
                            ) : (
                              <Bookmark size={16} />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
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
                      Found {aiSearchResults.length} brands • Showing results from highest to lowest match
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

