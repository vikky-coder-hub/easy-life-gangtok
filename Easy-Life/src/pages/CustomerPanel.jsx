import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Star,
  MessageCircle,
  ArrowLeft,
  ExternalLink,
  Heart,
  CheckCircle,
  Package,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import CustomerActivityManager from "../components/customer/CustomerActivityManager";
import BookingManager from "../components/customer/BookingManager";
import apiService from "../utils/api";

const CustomerPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCustomerDashboard();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userType === "customer") {
      fetchDashboardData();
    }
  }, [user]);

  // Handle navigation to activity manager
  const handleViewActivityManager = () => {
    setCurrentView("activity");
  };

  // Handle navigation to booking manager
  const handleViewBookingManager = () => {
    setCurrentView("bookings");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  // If showing activity manager, render it
  if (currentView === "activity") {
    return <CustomerActivityManager key="activity" onBack={handleBackToDashboard} />;
  }

  // If showing booking manager, render it
  if (currentView === "bookings") {
    return <BookingManager key="bookings" onBack={handleBackToDashboard} />;
  }

  if (!user || user.userType !== "customer") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in as a customer to access this page.
          </p>
          <Button onClick={() => navigate("/auth")} variant="primary">
            Log In
          </Button>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="primary">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // Use real data from backend or fallback to mock data
  const stats = [
    {
      label: "Saved",
      value: dashboardData?.stats?.savedBusinesses?.toString() || "0",
      icon: Heart,
      colorClass: "bg-red-100 text-red-600",
    },
    {
      label: "Bookings",
      value: dashboardData?.stats?.totalBookings?.toString() || "0",
      icon: Calendar,
      colorClass: "bg-blue-100 text-blue-600",
    },
    {
      label: "Reviews",
      value: dashboardData?.stats?.reviews?.toString() || "0",
      icon: Star,
      colorClass: "bg-yellow-100 text-yellow-600",
    },
  ];

  // Use real activity data from backend or fallback to mock data
  const recentActivity = dashboardData?.recentActivity || [
    {
      id: 1,
      type: "review",
      business: "Taste of Tibet Restaurant",
      action: "Left a review",
      date: "Dec 28, 2024",
      rating: 5,
    },
    {
      id: 2,
      type: "save",
      business: "Green Valley Photographers",
      action: "Saved business",
      date: "Dec 27, 2024",
    },
    {
      id: 3,
      type: "inquiry",
      business: "Mountain View AC Services",
      action: "Sent inquiry",
      date: "Dec 26, 2024",
      status: "responded",
    },
    {
      id: 4,
      type: "booking",
      business: "Himalayan Electricians",
      action: "Booked service",
      date: "Dec 25, 2024",
      status: "confirmed",
    },
  ];

  // Helper functions
  const getActivityIcon = (type) => {
    switch (type) {
      case "review":
        return Star;
      case "save":
        return Heart;
      case "inquiry":
        return MessageCircle;
      case "booking":
        return CheckCircle;
      default:
        return Package;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "review":
        return "bg-yellow-100 text-yellow-600";
      case "save":
        return "bg-red-100 text-red-600";
      case "inquiry":
        return "bg-blue-100 text-blue-600";
      case "booking":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusBadge = (activity) => {
    if (!activity.status) return null;

    const statusColors = {
      responded: "bg-green-100 text-green-800",
      confirmed: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
    };

    return (
      <span
        className={`inline-block px-2 py-1 text-xs rounded-full ${
          statusColors[activity.status] || statusColors.pending
        }`}
      >
        {activity.status}
      </span>
    );
  };

  return (
    <>
      <Helmet>
        <title>Customer Dashboard - Easy Life Gangtok</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          {/* Mobile-first Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Hi, {user.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Find local services in Gangtok
            </p>
          </div>

          {/* Mobile-optimized Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-3 sm:p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`p-2 rounded-lg ${
                        stat.colorClass.split(" ")[0]
                      }`}
                    >
                      <stat.icon
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          stat.colorClass.split(" ")[1]
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Mobile-first Single Column Layout */}
          <div className="space-y-6">
            {/* Recent Orders - Essential Mobile Feature */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Recent Orders
                </h2>
                <Button
                  onClick={() => navigate("/orders")}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {(dashboardData?.recentBookings || []).length > 0 ? (
                  dashboardData.recentBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking._id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={booking.businessId?.images?.[0] || "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=100"}
                          alt={booking.businessId?.name || 'Business'}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {booking.businessId?.name || 'Unknown Business'}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {booking.service}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              ₹{booking.amount}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              booking.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No recent orders found</p>
                    <Button
                      onClick={() => navigate("/listings")}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      Browse Services
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Activity - Most Important for Mobile */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Recent Activity
                </h2>
                <Button
                  onClick={handleViewActivityManager}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={handleViewActivityManager}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors active:bg-gray-200"
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-full ${getActivityColor(
                            activity.type
                          )} flex-shrink-0`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm leading-tight">
                            {activity.action}
                          </p>
                          <p className="text-primary-600 text-sm font-medium truncate">
                            {activity.business}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-500">
                              {activity.date}
                            </p>
                            {getStatusBadge(activity)}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                    </motion.div>
                  );
                })}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleViewBookingManager}
                  variant="primary"
                  className="justify-start"
                  icon={Calendar}
                >
                  My Bookings
                </Button>
                <Button
                  onClick={handleViewActivityManager}
                  variant="outline"
                  className="justify-start"
                  icon={Package}
                >
                  Activity History
                </Button>
                <Button
                  onClick={() => navigate("/saved-businesses")}
                  variant="outline"
                  className="justify-start"
                  icon={Heart}
                >
                  Saved Businesses
                </Button>
                <Button
                  onClick={() => navigate("/listings")}
                  variant="outline"
                  className="justify-start"
                  icon={Star}
                >
                  Browse Services
                </Button>
              </div>
            </Card>

            {/* Saved Businesses - Essential Mobile Feature */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Saved Businesses
                </h2>
                <Button
                  onClick={() => navigate("/saved-businesses")}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Browse
                </Button>
              </div>
              <div className="space-y-3">
                {(dashboardData?.savedBusinesses || []).length > 0 ? (
                  dashboardData.savedBusinesses.slice(0, 3).map((saved) => (
                    <motion.div
                      key={saved._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => navigate(`/business/${saved._id}`)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {saved.images && saved.images.length > 0 ? (
                            <img
                              src={saved.images[0]}
                              alt={saved.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                              {saved.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm leading-tight truncate">
                            {saved.name}
                          </p>
                          <p className="text-gray-600 text-xs truncate">
                            {saved.description || saved.category}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">
                                {saved.rating || 'N/A'}
                              </span>
                              {saved.reviewCount && (
                                <span className="text-xs text-gray-500">
                                  ({saved.reviewCount})
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">
                              {saved.category}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No saved businesses found</p>
                    <Button
                      onClick={() => navigate("/listings")}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      Browse Services
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Button
                  onClick={() => navigate("/saved-businesses")}
                  variant="outline"
                  size="sm"
                  className="w-full text-sm"
                >
                  View All Saved ({dashboardData?.stats?.savedBusinesses || 0})
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerPanel;
