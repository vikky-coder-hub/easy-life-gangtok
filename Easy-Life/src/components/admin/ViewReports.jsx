import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Store,
  DollarSign,
  Eye,
  Download,
  Calendar,
  ArrowLeft,
  Filter,
  Loader,
  AlertCircle,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import apiService from "../../utils/api";

const ViewReports = ({ onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("last30days");
  const [selectedReport, setSelectedReport] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    overview: {
      totalUsers: 0,
      totalBusinesses: 0,
      totalRevenue: 0,
      pageViews: 0,
      userGrowth: 0,
      businessGrowth: 0,
      revenueGrowth: 0,
      viewsGrowth: 0,
    },
    userActivity: [],
    topBusinesses: [],
    categories: [],
  });
  const [financialData, setFinancialData] = useState(null);
  const [userActivityData, setUserActivityData] = useState(null);

  // Fetch analytics data from backend
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch platform analytics for overview
      const platformResponse = await apiService.getPlatformAnalytics(selectedPeriod);
      
      if (platformResponse.success) {
        const data = platformResponse.data;
        
        // Update report data with real backend data
        setReportData({
          overview: {
            totalUsers: data.overview?.totalUsers || 0,
            totalBusinesses: data.overview?.totalBusinesses || 0,
            totalRevenue: data.overview?.totalRevenue || 0,
            pageViews: data.overview?.pageViews || 0,
            userGrowth: data.overview?.userGrowth || 0,
            businessGrowth: data.overview?.businessGrowth || 0,
            revenueGrowth: data.overview?.revenueGrowth || 0,
            viewsGrowth: data.overview?.viewsGrowth || 0,
          },
          userActivity: data.userActivity || [],
          topBusinesses: data.topBusinesses || [],
          categories: data.categories || [],
        });
      }

      // Fetch financial reports
      const financialResponse = await apiService.getFinancialReports(selectedPeriod);
      if (financialResponse.success) {
        setFinancialData(financialResponse.data);
      }

      // Fetch user activity reports
      const userActivityResponse = await apiService.getUserActivityReports(selectedPeriod);
      if (userActivityResponse.success) {
        setUserActivityData(userActivityResponse.data);
      }

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to load analytics data');
      
      // Fallback to demo data if API fails
      setReportData({
        overview: {
          totalUsers: 1234,
          totalBusinesses: 156,
          totalRevenue: 45670,
          pageViews: 89542,
          userGrowth: 12.5,
          businessGrowth: 8.3,
          revenueGrowth: 15.7,
          viewsGrowth: 23.1,
        },
        userActivity: [
          { date: "2024-01-01", users: 45, businesses: 12 },
          { date: "2024-01-02", users: 52, businesses: 15 },
          { date: "2024-01-03", users: 48, businesses: 18 },
          { date: "2024-01-04", users: 61, businesses: 14 },
          { date: "2024-01-05", users: 55, businesses: 16 },
          { date: "2024-01-06", users: 67, businesses: 19 },
          { date: "2024-01-07", users: 72, businesses: 22 },
        ],
        topBusinesses: [
          { name: "Gangtok Coffee House", views: 1234, rating: 4.8, bookings: 89 },
          {
            name: "Mountain View Restaurant",
            views: 987,
            rating: 4.7,
            bookings: 76,
          },
          { name: "Tech Repair Center", views: 765, rating: 4.9, bookings: 54 },
          { name: "Himalayan Spa", views: 654, rating: 4.6, bookings: 43 },
          { name: "Local Grocery Store", views: 543, rating: 4.5, bookings: 32 },
        ],
        categories: [
          { name: "Restaurants", count: 45, percentage: 28.8 },
          { name: "Technology", count: 32, percentage: 20.5 },
          { name: "Health & Wellness", count: 28, percentage: 17.9 },
          { name: "Shopping", count: 25, percentage: 16.0 },
          { name: "Services", count: 26, percentage: 16.7 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
          <div className="flex items-center mt-2">
            <TrendingUp
              className={`w-4 h-4 mr-1 ${
                change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={reportData.overview.totalUsers}
          change={reportData.overview.userGrowth}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Businesses"
          value={reportData.overview.totalBusinesses}
          change={reportData.overview.businessGrowth}
          icon={Store}
          color="bg-green-500"
        />
        <StatCard
          title="Revenue"
          value={reportData.overview.totalRevenue}
          change={reportData.overview.revenueGrowth}
          icon={DollarSign}
          color="bg-purple-500"
        />
        <StatCard
          title="Page Views"
          value={reportData.overview.pageViews}
          change={reportData.overview.viewsGrowth}
          icon={Eye}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Placeholder */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Growth Trend
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart coming soon!</p>
              <p className="text-sm text-gray-500">
                User registration trends over time
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Business Distribution
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart coming soon!</p>
              <p className="text-sm text-gray-500">
                Business categories breakdown
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderUserReports = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          User Activity
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  New Users
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  New Businesses
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.userActivity.map((day, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {day.users}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {day.businesses}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {day.users + day.businesses}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderBusinessReports = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Performing Businesses
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Business
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Views
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bookings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.topBusinesses.map((business, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {business.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(business.views || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      {business.rating || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {business.bookings || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Business Categories
        </h3>
        <div className="space-y-4">
          {reportData.categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-primary-500 rounded"></div>
                <span className="text-sm font-medium text-gray-900">
                  {category.name}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {category.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const reportTypes = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "users", name: "User Reports", icon: Users },
    { id: "businesses", name: "Business Reports", icon: Store },
    { id: "financial", name: "Financial Reports", icon: DollarSign },
  ];

  const renderContent = () => {
    switch (selectedReport) {
      case "overview":
        return renderOverview();
      case "users":
        return renderUserReports();
      case "businesses":
        return renderBusinessReports();
      case "financial":
        return (
          <Card className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Financial Reports
            </h3>
            <p className="text-gray-600">Financial reporting coming soon!</p>
          </Card>
        );
      default:
        return renderOverview();
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="ghost" size="sm" icon={ArrowLeft}>
              Back to Dashboard
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Analytics & Reports
              </h2>
              <p className="text-gray-600">
                View detailed analytics and generate reports
              </p>
            </div>
          </div>
        </div>
        <Card className="p-12 text-center">
          <Loader className="w-8 h-8 text-primary-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading analytics data...
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch the latest analytics data.
          </p>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="ghost" size="sm" icon={ArrowLeft}>
              Back to Dashboard
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Analytics & Reports
              </h2>
              <p className="text-gray-600">
                View detailed analytics and generate reports
              </p>
            </div>
          </div>
        </div>
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchAnalyticsData} variant="primary">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="ghost" size="sm" icon={ArrowLeft}>
            Back to Dashboard
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Analytics & Reports
            </h2>
            <p className="text-gray-600">
              View detailed analytics and generate reports
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          >
            <option value="last7days">Last 7 days</option>
            <option value="last30days">Last 30 days</option>
            <option value="last90days">Last 90 days</option>
            <option value="lastyear">Last year</option>
          </select>
          <Button variant="primary" icon={Download} disabled={loading}>
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Report Types
            </h3>
            <nav className="space-y-2">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedReport(type.id)}
                  disabled={loading}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedReport === type.id
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <type.icon className="w-4 h-4 mr-3" />
                  {type.name}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4">
          <motion.div
            key={selectedReport}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ViewReports;
