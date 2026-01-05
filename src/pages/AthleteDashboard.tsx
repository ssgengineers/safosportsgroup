import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@clerk/clerk-react";
import { getUserMe, getMyAthleteProfile, UserResponse, AthleteProfileResponse } from "@/services/api";
import EditAthleteProfile from "@/components/EditAthleteProfile";
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
} from "lucide-react";

const AthleteDashboard = () => {
  const { getToken, isLoaded } = useAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

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

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('instagram')) return <Instagram size={16} className="text-pink-500" />;
    if (platformLower.includes('twitter') || platformLower.includes('x')) return <Twitter size={16} className="text-blue-400" />;
    if (platformLower.includes('youtube')) return <Youtube size={16} className="text-red-500" />;
    if (platformLower.includes('facebook')) return <Facebook size={16} className="text-blue-600" />;
    return <Users size={16} />;
  };

  const totalFollowers = athleteProfile?.socialAccounts?.reduce((sum, acc) => sum + (acc.followers || 0), 0) || 0;

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
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome back, {athleteProfile?.firstName || user?.firstName || "Athlete"}!
            </h1>
            <p className="text-muted-foreground">
              {athleteProfile?.sport && athleteProfile?.position 
                ? `${athleteProfile.sport} • ${athleteProfile.position} • ${athleteProfile.schoolName || 'N/A'}`
                : "Manage your profile, track deals, and grow your NIL opportunities"}
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                  <Trophy className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No active partnerships</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Brands viewing your profile</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Complete</CardTitle>
                  <Target className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {athleteProfile?.profileCompletenessScore || athleteProfile?.completenessScore || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {athleteProfile ? "Profile completeness" : "Complete your profile"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Status */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile Status</CardTitle>
                  <CardDescription>
                    Your athlete profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {athleteProfile ? (
                    <div className="space-y-6">
                      {/* Profile Completeness */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Profile Completeness</span>
                          <span className="text-sm font-bold text-primary">
                            {athleteProfile.profileCompletenessScore || athleteProfile.completenessScore || 0}%
                          </span>
                        </div>
                        <Progress 
                          value={athleteProfile.profileCompletenessScore || athleteProfile.completenessScore || 0} 
                          className="h-2"
                        />
                      </div>

                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4">
                        {athleteProfile.sport && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Sport</p>
                            <p className="font-medium">{athleteProfile.sport}</p>
                          </div>
                        )}
                        {athleteProfile.position && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Position</p>
                            <p className="font-medium">{athleteProfile.position}</p>
                          </div>
                        )}
                        {athleteProfile.schoolName && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">School</p>
                            <p className="font-medium">{athleteProfile.schoolName}</p>
                          </div>
                        )}
                        {athleteProfile.conference && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Conference</p>
                            <p className="font-medium">{athleteProfile.conference}</p>
                          </div>
                        )}
                      </div>

                      {/* Bio */}
                      {athleteProfile.bio && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Bio</p>
                          <p className="text-sm leading-relaxed">{athleteProfile.bio}</p>
                        </div>
                      )}

                      {/* Social Accounts */}
                      {athleteProfile.socialAccounts && athleteProfile.socialAccounts.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Social Media</p>
                          <div className="space-y-2">
                            {athleteProfile.socialAccounts.map((account, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                  {getSocialIcon(account.platform.toString())}
                                  <span className="text-sm font-medium">{account.handle}</span>
                                </div>
                                {account.followers && (
                                  <span className="text-xs text-muted-foreground">
                                    {account.followers.toLocaleString()} followers
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      {athleteProfile.hometown && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={16} className="text-muted-foreground" />
                          <span>{athleteProfile.hometown}{athleteProfile.homeState ? `, ${athleteProfile.homeState}` : ''}</span>
                        </div>
                      )}

                      {/* Team Ranking */}
                      {athleteProfile.teamRanking && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Team Ranking</p>
                          <p className="text-sm font-medium">#{athleteProfile.teamRanking}</p>
                        </div>
                      )}

                      {/* Season Statistics */}
                      {athleteProfile.statsSummary && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Season Statistics</p>
                          <p className="text-sm whitespace-pre-wrap">{athleteProfile.statsSummary}</p>
                        </div>
                      )}

                      {/* Awards */}
                      {athleteProfile.awards && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Awards & Recognition</p>
                          <p className="text-sm whitespace-pre-wrap">{athleteProfile.awards}</p>
                        </div>
                      )}

                      {/* Achievements */}
                      {athleteProfile.achievements && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Achievements</p>
                          <p className="text-sm whitespace-pre-wrap">{athleteProfile.achievements}</p>
                        </div>
                      )}

                      <Button 
                        className="w-full"
                        onClick={() => setEditModalOpen(true)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </div>
                  ) : user?.hasAthleteProfile ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Profile Loading</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your athlete profile is being loaded. Please refresh if this persists.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Profile Pending</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your profile is being created from your intake form. 
                        This usually happens automatically after you sign in.
                      </p>
                      <Button variant="outline" className="w-full" disabled>
                        <Clock className="mr-2 h-4 w-4" />
                        Profile Creation In Progress
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setEditModalOpen(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    View Applications
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Performance & Recognition Section */}
          {athleteProfile && (athleteProfile.teamRanking || athleteProfile.statsSummary || athleteProfile.awards || athleteProfile.achievements) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Awards & Recognition */}
                {(athleteProfile.awards || athleteProfile.achievements) && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        <CardTitle>Awards & Recognition</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {athleteProfile.awards && (
                          <div>
                            <p className="text-sm font-medium mb-2">Awards</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{athleteProfile.awards}</p>
                          </div>
                        )}
                        {athleteProfile.achievements && (
                          <div>
                            <p className="text-sm font-medium mb-2">Achievements</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{athleteProfile.achievements}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Season Statistics */}
                {athleteProfile.statsSummary && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-500" />
                        <CardTitle>Season Statistics</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{athleteProfile.statsSummary}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          )}

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail size={14} />
                        Email:
                      </span>
                      <span className="text-sm font-medium">{user?.email || athleteProfile?.email || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <User size={14} />
                        Name:
                      </span>
                      <span className="text-sm font-medium">
                        {athleteProfile?.firstName && athleteProfile?.lastName
                          ? `${athleteProfile.firstName} ${athleteProfile.lastName}`
                          : user?.fullName || "N/A"}
                      </span>
                    </div>
                    {athleteProfile?.dateOfBirth && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar size={14} />
                          Date of Birth:
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(athleteProfile.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {athleteProfile?.teamRanking && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Target size={14} />
                          Team Ranking:
                        </span>
                        <span className="text-sm font-medium">#{athleteProfile.teamRanking}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={athleteProfile?.isActive ? "default" : "secondary"}>
                        {athleteProfile?.isActive ? "ACTIVE" : user?.status || "Unknown"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Roles:</span>
                      <div className="flex gap-1">
                        {user?.roles.map((role) => (
                          <Badge key={role} variant="outline">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {totalFollowers > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users size={14} />
                          Total Followers:
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {totalFollowers.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
          </motion.div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {athleteProfile && authToken && (
        <EditAthleteProfile
          profile={athleteProfile}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSuccess={async () => {
            // Refresh profile data after update
            try {
              const token = await getToken();
              if (token) {
                const updatedProfile = await getMyAthleteProfile(token);
                setAthleteProfile(updatedProfile);
              }
            } catch (error) {
              console.error("Failed to refresh profile:", error);
            }
          }}
          token={authToken}
        />
      )}
    </div>
  );
};

export default AthleteDashboard;

