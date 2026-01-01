'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { adminAPI } from '@/lib/api';
import { 
  BarChart3, Users, MessageSquare, Gift, Image, 
  TrendingUp, MapPin, Calendar, Activity, Shield,
  ArrowLeft, RefreshCw, Download, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AnalyticsOverview {
  period_days: number;
  users: {
    total: number;
    active: number;
    new_in_period: number;
    growth_rate: number;
  };
  engagement: {
    total_rooms: number;
    active_rooms: number;
    messages_in_period: number;
    gifts_sent_in_period: number;
    walls_created_in_period: number;
    todays_celebrants: number;
  };
  moderation: {
    pending_flags: number;
    actions_in_period: number;
  };
}

interface Activity {
  type: string;
  timestamp: string;
  user_id?: number;
  user_name?: string;
  details: string;
  [key: string]: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'activities'>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [engagement, setEngagement] = useState<any>(null);
  const [geographic, setGeographic] = useState<any>(null);
  const [tribes, setTribes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState(30);
  const [activityFilter, setActivityFilter] = useState<string>('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, periodDays]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load overview analytics
      const overviewRes = await adminAPI.getAnalyticsOverview(periodDays);
      setAnalytics(overviewRes.data);

      // Load activities
      const activitiesRes = await adminAPI.getRecentActivities(100, activityFilter || undefined);
      setActivities(activitiesRes.data.activities || []);

      // Load user growth
      const growthRes = await adminAPI.getUserGrowth(periodDays);
      setUserGrowth(growthRes.data.daily_registrations || []);

      // Load engagement metrics
      const engagementRes = await adminAPI.getEngagementMetrics(periodDays);
      setEngagement(engagementRes.data);

      // Load geographic analytics
      const geoRes = await adminAPI.getGeographicAnalytics();
      setGeographic(geoRes.data);

      // Load tribe analytics
      try {
        const tribeRes = await adminAPI.getTribeAnalytics();
        setTribes(tribeRes.data);
      } catch (tribeError) {
        console.error('Error loading tribe analytics:', tribeError);
        // Set empty data if tribe analytics fails
        setTribes({ top_tribes: [], average_tribe_size: 0, total_tribes: 0 });
      }
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Platform monitoring & analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </div>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'activities'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activities
            </div>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && analytics && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-8 h-8 text-primary-600" />
                      <span className="text-2xl font-bold gradient-text">
                        {analytics.users.total.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-xs text-green-600 mt-1">
                      +{analytics.users.new_in_period} new ({analytics.users.growth_rate}%)
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-effect rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <MessageSquare className="w-8 h-8 text-blue-600" />
                      <span className="text-2xl font-bold gradient-text">
                        {analytics.engagement.messages_in_period.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Messages ({periodDays}d)</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analytics.engagement.active_rooms} active rooms
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-effect rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Gift className="w-8 h-8 text-pink-600" />
                      <span className="text-2xl font-bold gradient-text">
                        {analytics.engagement.gifts_sent_in_period.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Gifts Sent ({periodDays}d)</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analytics.engagement.walls_created_in_period} walls created
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-effect rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="w-8 h-8 text-red-600" />
                      <span className="text-2xl font-bold gradient-text">
                        {analytics.moderation.pending_flags}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Pending Flags</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analytics.moderation.actions_in_period} actions taken
                    </p>
                  </motion.div>
                </div>

                {/* Today's Celebrants */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-6 h-6 text-primary-600" />
                    <h2 className="text-xl font-bold">Today&apos;s Celebrants</h2>
                  </div>
                  <div className="text-4xl font-black gradient-text">
                    {analytics.engagement.todays_celebrants.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    People celebrating their birthday today worldwide
                  </p>
                </motion.div>

                {/* Engagement Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-effect rounded-xl p-6">
                    <h3 className="font-semibold mb-3">Rooms</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total</span>
                        <span className="font-bold">{analytics.engagement.total_rooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active</span>
                        <span className="font-bold text-green-600">
                          {analytics.engagement.active_rooms}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-effect rounded-xl p-6">
                    <h3 className="font-semibold mb-3">User Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active</span>
                        <span className="font-bold text-green-600">
                          {analytics.users.active.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">New ({periodDays}d)</span>
                        <span className="font-bold">{analytics.users.new_in_period.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-effect rounded-xl p-6">
                    <h3 className="font-semibold mb-3">Content</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Walls</span>
                        <span className="font-bold">{analytics.engagement.walls_created_in_period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gifts</span>
                        <span className="font-bold">{analytics.engagement.gifts_sent_in_period}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* User Growth Chart */}
                {userGrowth.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect rounded-xl p-6"
                  >
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      User Growth
                    </h2>
                    <div className="h-64 flex items-end gap-2">
                      {userGrowth.map((day, index) => {
                        const maxCount = Math.max(...userGrowth.map(d => d.count));
                        const height = (day.count / maxCount) * 100;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all hover:opacity-80"
                              style={{ height: `${height}%` }}
                              title={`${day.date}: ${day.count} users`}
                            />
                            <span className="text-xs text-gray-600 mt-2">
                              {new Date(day.date).getDate()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 text-sm text-gray-600 text-center">
                      Total: {userGrowth.reduce((sum, day) => sum + day.count, 0)} new users
                    </div>
                  </motion.div>
                )}

                {/* Geographic Distribution */}
                {geographic && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-effect rounded-xl p-6"
                    >
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Top Countries
                      </h3>
                      <div className="space-y-2">
                        {geographic.top_countries?.slice(0, 10).map((country: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{country.country}</span>
                            <span className="font-bold">{country.user_count.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-effect rounded-xl p-6"
                    >
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Top States
                      </h3>
                      <div className="space-y-2">
                        {geographic.top_states?.slice(0, 10).map((state: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{state.state}, {state.country}</span>
                            <span className="font-bold">{state.user_count.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Tribe Analytics */}
                {tribes && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect rounded-xl p-6"
                  >
                    <h3 className="text-lg font-bold mb-4">Tribe Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Tribes</p>
                        <p className="text-2xl font-bold">{tribes.total_tribes}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Avg. Tribe Size</p>
                        <p className="text-2xl font-bold">{tribes.average_tribe_size}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Top Tribes by Size</p>
                      <div className="space-y-2">
                        {tribes.top_tribes?.slice(0, 10).map((tribe: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">Tribe {tribe.tribe_id}</span>
                            <span className="font-bold">{tribe.member_count} members</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Engagement Metrics */}
                {engagement && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect rounded-xl p-6"
                  >
                    <h3 className="text-lg font-bold mb-4">Engagement Over Time</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Messages</p>
                        <div className="h-32 flex items-end gap-1">
                          {engagement.daily_messages?.slice(-14).map((msg: any, index: number) => {
                            const maxCount = Math.max(...engagement.daily_messages.map((m: any) => m.count));
                            const height = (msg.count / maxCount) * 100;
                            return (
                              <div
                                key={index}
                                className="flex-1 bg-blue-500 rounded-t"
                                style={{ height: `${height}%` }}
                                title={`${msg.date}: ${msg.count}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Gifts</p>
                        <div className="h-32 flex items-end gap-1">
                          {engagement.daily_gifts?.slice(-14).map((gift: any, index: number) => {
                            const maxCount = Math.max(...engagement.daily_gifts.map((g: any) => g.count));
                            const height = (gift.count / maxCount) * 100;
                            return (
                              <div
                                key={index}
                                className="flex-1 bg-pink-500 rounded-t"
                                style={{ height: `${height}%` }}
                                title={`${gift.date}: ${gift.count}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Walls</p>
                        <div className="h-32 flex items-end gap-1">
                          {engagement.daily_walls?.slice(-14).map((wall: any, index: number) => {
                            const maxCount = Math.max(...engagement.daily_walls.map((w: any) => w.count));
                            const height = (wall.count / maxCount) * 100;
                            return (
                              <div
                                key={index}
                                className="flex-1 bg-purple-500 rounded-t"
                                style={{ height: `${height}%` }}
                                title={`${wall.date}: ${wall.count}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div className="space-y-6">
                {/* Activity Filter */}
                <div className="glass-effect rounded-xl p-4 flex items-center gap-4">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <select
                    value={activityFilter}
                    onChange={(e) => {
                      setActivityFilter(e.target.value);
                      loadDashboardData();
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white"
                  >
                    <option value="">All Activities</option>
                    <option value="signup">User Signups</option>
                    <option value="message">Messages</option>
                    <option value="gift">Gifts</option>
                    <option value="wall">Birthday Walls</option>
                    <option value="moderation">Moderation Actions</option>
                  </select>
                </div>

                {/* Activities List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-xl p-6"
                >
                  <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {activities.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No activities found</p>
                    ) : (
                      activities.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="mt-1">
                            {activity.type === 'user_signup' && <Users className="w-5 h-5 text-primary-600" />}
                            {activity.type === 'message_sent' && <MessageSquare className="w-5 h-5 text-blue-600" />}
                            {activity.type === 'gift_sent' && <Gift className="w-5 h-5 text-pink-600" />}
                            {activity.type === 'wall_created' && <Image className="w-5 h-5 text-purple-600" />}
                            {activity.type === 'moderation_action' && <Shield className="w-5 h-5 text-red-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.details}</p>
                            {activity.user_name && (
                              <p className="text-xs text-gray-500 mt-1">User: {activity.user_name}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimestamp(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

