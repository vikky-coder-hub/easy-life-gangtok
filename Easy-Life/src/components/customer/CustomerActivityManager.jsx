import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Heart,
  MessageCircle,
  CheckCircle,
  Package,
  ExternalLink,
  Phone,
  Filter,
  Search,
  Calendar,
  MapPin,
  AlertCircle,
  Loader,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../utils/api";

const CustomerActivityManager = ({ onBack }) => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({});

  // Fetch customer activity data
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {};
        if (selectedFilter !== "all") {
          params.type = selectedFilter;
        }
        params.limit = 20;
        params.page = 1;

        const response = await apiService.getCustomerActivity(params);
        if (response.success) {
          setActivities(response.data.activities || []);
          setStats(response.data.stats || {});
          setPagination(response.data.pagination || {});
        } else {
          setError(response.message || 'Failed to load activity data');
        }
      } catch (err) {
        console.error('Activity fetch error:', err);
        setError(err.message || 'Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userType === "customer") {
      fetchActivity();
    }
  }, [user, selectedFilter]);

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
      case "order":
        return Package;
      default:
        return CheckCircle;
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
      case "order":
        return "bg-purple-100 text-purple-600";
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
      completed: "bg-green-100 text-green-800",
      delivered: "bg-green-100 text-green-800",
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesFilter =
      selectedFilter === "all" || activity.type === selectedFilter;
    const matchesSearch =
      activity.business.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Activity
          </h2>
          <p className="text-gray-600">
            Fetching your activity history...
          </p>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Activity
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">My Activity</h1>
          <p className="text-gray-600 mt-1">
            Track your interactions with local businesses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalBookings || 0}</div>
            <div className="text-sm text-gray-600">Bookings</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalReviews || 0}</div>
            <div className="text-sm text-gray-600">Reviews</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.totalSaved || 0}</div>
            <div className="text-sm text-gray-600">Saved</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalInquiries || 0}</div>
            <div className="text-sm text-gray-600">Inquiries</div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search businesses or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={Search}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {[
                { value: "all", label: "All" },
                { value: "review", label: "Reviews" },
                { value: "save", label: "Saved" },
                { value: "inquiry", label: "Inquiries" },
                { value: "booking", label: "Bookings" },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={
                    selectedFilter === filter.value ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedFilter(filter.value)}
                  className="whitespace-nowrap"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Activity List */}
        {filteredActivities.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Activity Found
            </h3>
            <p className="text-gray-600">
              {selectedFilter === "all" 
                ? "You haven't had any activity yet. Start by browsing local businesses!"
                : `No ${selectedFilter} activity found. Try a different filter.`
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Business Image */}
                      <div className="w-full sm:w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {activity.businessImage ? (
                          <img
                            src={activity.businessImage}
                            alt={activity.business}
                            className="w-full h-full object-cover transition-opacity duration-200"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                            onLoad={(e) => {
                              e.target.style.opacity = "1";
                            }}
                            style={{ opacity: 0 }}
                          />
                        ) : null}
                        {/* Fallback placeholder */}
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center"
                          style={{ display: activity.businessImage ? "none" : "flex" }}
                        >
                          <div className="text-primary-600 text-xs font-medium text-center">
                            {activity.business
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {/* Activity Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div
                              className={`p-2 rounded-full ${getActivityColor(
                                activity.type
                              )} flex-shrink-0`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {activity.business}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {activity.action} • {formatDate(activity.date)}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {activity.category}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {activity.location}
                                </span>
                                {getStatusBadge(activity)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Activity-specific content */}
                        {activity.type === "review" && activity.rating && (
                          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < activity.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-yellow-900">
                                {activity.rating}/5 Stars
                              </span>
                            </div>
                            {activity.reviewText && (
                              <p className="text-yellow-800 text-sm leading-relaxed">
                                "{activity.reviewText}"
                              </p>
                            )}
                          </div>
                        )}

                        {activity.type === "inquiry" && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">
                              Your Inquiry
                            </h4>
                            <p className="text-blue-800 text-sm leading-relaxed">
                              "{activity.inquiryText || 'Inquiry sent to business'}"
                            </p>
                            {activity.status === "responded" && (
                              <div className="mt-2 pt-2 border-t border-blue-200">
                                <p className="text-blue-700 text-xs">
                                  ✓ Business responded
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {activity.type === "booking" &&
                          activity.bookingDetails && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <h4 className="font-medium text-green-900 mb-2">
                                Booking Details
                              </h4>
                              <div className="text-green-800 text-sm space-y-1">
                                <p>📅 {activity.bookingDetails.scheduledDate}</p>
                                <p>⏰ {activity.bookingDetails.time}</p>
                                <p>🔧 {activity.bookingDetails.service}</p>
                                <p>🆔 {activity.bookingDetails.bookingId}</p>
                                {activity.bookingDetails.amount && (
                                  <p>💰 ₹{activity.bookingDetails.amount}</p>
                                )}
                              </div>
                            </div>
                          )}

                        {activity.type === "save" && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <div className="flex items-center space-x-2">
                              <Heart className="w-4 h-4 text-red-500 fill-current" />
                              <span className="text-sm font-medium text-red-900">
                                Saved to Favorites
                              </span>
                            </div>
                            <p className="text-red-800 text-sm mt-1">
                              Quick access from your saved businesses list.
                            </p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2 pt-2">
                          {activity.businessData?.phone && (
                            <Button size="sm" variant="outline">
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Business
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination info */}
        {pagination.totalPages > 1 && (
          <Card className="p-4 mt-6 text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredActivities.length} of {pagination.totalItems} activities
              {pagination.totalPages > 1 && (
                <span> • Page {pagination.currentPage} of {pagination.totalPages}</span>
              )}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default React.memo(CustomerActivityManager);
