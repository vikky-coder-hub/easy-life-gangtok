import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BellRing,
  Calendar,
  MessageCircle,
  Star,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Mail,
  Trash2,
  Settings,
  X,
  ArrowLeft,
  Search,
  MoreVertical,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import apiService from "../../utils/api";

const NotificationManager = ({ onBack }) => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    urgent: 0,
    today: 0
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      bookings: true,
      payments: true,
      reviews: true,
      system: false,
    },
    pushNotifications: {
      bookings: true,
      payments: true,
      reviews: false,
      system: false,
    },
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  });

  useEffect(() => {
    fetchNotifications();
    fetchNotificationStats();
  }, []);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications(1, 50); // Get more notifications
      if (response.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to empty array on error
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const response = await apiService.getNotificationStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  // Transform backend notification to match frontend format
  const transformNotification = (notification) => {
    const iconMap = {
      'booking': Calendar,
      'payment': DollarSign,
      'review': Star,
      'inquiry': MessageCircle,
      'system': Bell,
      'urgent': AlertTriangle,
      'success': CheckCircle,
    };

    const colorMap = {
      'booking': 'bg-blue-100 text-blue-600',
      'payment': 'bg-green-100 text-green-600',
      'review': 'bg-yellow-100 text-yellow-600',
      'inquiry': 'bg-purple-100 text-purple-600',
      'system': 'bg-gray-100 text-gray-600',
      'urgent': 'bg-red-100 text-red-600',
      'success': 'bg-green-100 text-green-600',
    };

    return {
      id: notification._id,
      type: notification.type,
      priority: notification.priority || 'medium',
      title: notification.title,
      message: notification.message,
      customer: notification.customer || null,
      timestamp: new Date(notification.createdAt).toLocaleString(),
      isRead: notification.isRead,
      actionRequired: notification.actionRequired || false,
      relatedId: notification.relatedId,
      amount: notification.amount || null,
      icon: iconMap[notification.type] || Bell,
      color: colorMap[notification.type] || 'bg-gray-100 text-gray-600',
    };
  };

  // Filter notifications based on current filter and search term
  const filteredNotifications = notifications.map(transformNotification).filter((notification) => {
    const matchesFilter =
      selectedFilter === "all" ||
      selectedFilter === "unread" && !notification.isRead ||
      selectedFilter === "urgent" && notification.priority === "high" ||
      selectedFilter === notification.type;

    const matchesSearch =
      searchTerm === "" ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.customer &&
        notification.customer.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const urgentCount = notifications.filter(
    (n) => n.priority === "high" && !n.isRead
  ).length;

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        fetchNotificationStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true }))
        );
        fetchNotificationStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await apiService.deleteNotification(notificationId);
      if (response.success) {
        // Remove from local state
        setNotifications(prev => 
          prev.filter(n => n._id !== notificationId)
        );
        fetchNotificationStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationAction = (notification) => {
    switch (notification.type) {
      case "booking":
        // Navigate to booking details
        console.log(`Opening booking ${notification.relatedId}`);
        break;
      case "inquiry":
        // Navigate to inquiries
        console.log(`Opening inquiry ${notification.relatedId}`);
        break;
      case "review":
        // Navigate to reviews
        console.log(`Opening review ${notification.relatedId}`);
        break;
      case "payment":
        // Navigate to financial dashboard
        console.log(`Opening payment ${notification.relatedId}`);
        break;
      default:
        break;
    }
  };

  const handleNotificationClick = (notification) => {
    if (isMobile) {
      setSelectedNotification(notification);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </Card>
        </div>
      </div>
    );
  }

  // Mobile Notification Detail View
  if (isMobile && selectedNotification) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-start space-x-3 mb-4">
              <div
                className={`p-3 rounded-lg ${
                  selectedNotification.color.split(" ")[0]
                }`}
              >
                <selectedNotification.icon
                  className={`w-5 h-5 ${
                    selectedNotification.color.split(" ")[1]
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedNotification.title}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(
                      selectedNotification.priority
                    )}`}
                  >
                    {selectedNotification.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{selectedNotification.timestamp}</span>
              </div>
              {selectedNotification.customer && (
                <span>from {selectedNotification.customer}</span>
              )}
            </div>

            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedNotification(null)}
                className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              {selectedNotification.actionRequired && (
                <button
                  onClick={() => handleNotificationAction(selectedNotification)}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedNotification.type === "booking" ? "Review" : "Respond"}
                </button>
              )}
            </div>
          </Card>

          {/* Notification Actions */}
          <Card className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Actions</h3>
            <div className="space-y-2">
              {!selectedNotification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(selectedNotification.id)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Mark as Read</span>
                </button>
              )}
              <button
                onClick={() => handleDeleteNotification(selectedNotification.id)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Notification</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Settings Modal
  if (showSettings) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Notification Settings
            </h2>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Email Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Email Notifications
              </h3>
              <div className="space-y-3">
                {Object.entries(notificationSettings.emailNotifications).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          value=""
                          className="sr-only peer"
                          checked={value}
                          onChange={(e) =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              emailNotifications: {
                                ...prev.emailNotifications,
                                [key]: e.target.checked,
                              },
                            }))
                          }
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Push Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Push Notifications
              </h3>
              <div className="space-y-3">
                {Object.entries(notificationSettings.pushNotifications).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          value=""
                          className="sr-only peer"
                          checked={value}
                          onChange={(e) =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              pushNotifications: {
                                ...prev.pushNotifications,
                                [key]: e.target.checked,
                              },
                            }))
                          }
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Quiet Hours */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quiet Hours
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Enable Quiet Hours</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value=""
                      className="sr-only peer"
                      checked={notificationSettings.quietHours.enabled}
                      onChange={(e) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          quietHours: {
                            ...prev.quietHours,
                            enabled: e.target.checked,
                          },
                        }))
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                {notificationSettings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={notificationSettings.quietHours.start}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            quietHours: {
                              ...prev.quietHours,
                              start: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={notificationSettings.quietHours.end}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            quietHours: {
                              ...prev.quietHours,
                              end: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                console.log("Saving notification settings:", notificationSettings);
                setShowSettings(false);
              }}
              className="flex-1"
            >
              Save Settings
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Notifications
              </h1>
              <p className="text-sm text-gray-500">
                {unreadCount} unread • {urgentCount} urgent
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Search & Filter */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-1">
            {[
              "all",
              "unread",
              "urgent",
              "booking",
              "payment",
              "review",
              "system",
            ].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                  selectedFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button variant="outline" onClick={onBack} className="mb-4">
              ← Back to Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-gray-600 mt-1">
                  Stay updated with your business activities
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  icon={CheckCircle}
                >
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  icon={Settings}
                >
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Search & Filter */}
          <Card className="p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Types</option>
                  <option value="booking">Bookings</option>
                  <option value="payment">Payments</option>
                  <option value="review">Reviews</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Desktop Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="text-2xl font-bold text-gray-900">
                {filteredNotifications.length}
              </div>
              <div className="text-sm text-gray-600">Total Notifications</div>
            </Card>
            <Card className="p-6">
              <div className="text-2xl font-bold text-blue-600">
                {unreadCount}
              </div>
              <div className="text-sm text-gray-600">Unread</div>
            </Card>
            <Card className="p-6">
              <div className="text-2xl font-bold text-red-600">
                {urgentCount}
              </div>
              <div className="text-sm text-gray-600">Urgent</div>
            </Card>
            <Card className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {
                  filteredNotifications.filter(
                    (n) => n.actionRequired && !n.isRead
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Action Required</div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All", count: notifications.length },
                  { key: "unread", label: "Unread", count: unreadCount },
                  { key: "urgent", label: "Urgent", count: urgentCount },
                  {
                    key: "booking",
                    label: "Bookings",
                    count: notifications.filter((n) => n.type === "booking")
                      .length,
                  },
                  {
                    key: "payment",
                    label: "Payments",
                    count: notifications.filter((n) => n.type === "payment")
                      .length,
                  },
                  {
                    key: "review",
                    label: "Reviews",
                    count: notifications.filter((n) => n.type === "review")
                      .length,
                  },
                  {
                    key: "inquiry",
                    label: "Inquiries",
                    count: notifications.filter((n) => n.type === "inquiry")
                      .length,
                  },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedFilter(filter.key)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      selectedFilter === filter.key
                        ? "bg-primary-100 text-primary-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Search Bar - New Addition */}
          <div className="mb-6">
            <Card className="p-4">
              <div className="flex items-center">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent outline-none placeholder-gray-400"
                />
              </div>
            </Card>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const IconComponent = notification.icon;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
                    !notification.isRead
                      ? "border-l-4 border-l-blue-500"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${notification.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full border ${getPriorityBadge(
                              notification.priority
                            )}`}
                          >
                            {notification.priority}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>

                        <p className="text-gray-600 mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{notification.timestamp}</span>
                          </div>
                          {notification.customer && (
                            <span>from {notification.customer}</span>
                          )}
                          {notification.amount && (
                            <span
                              className={`font-medium ${
                                notification.amount > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {notification.amount > 0 ? "+" : ""}₹
                              {Math.abs(notification.amount).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {notification.actionRequired && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleNotificationAction(notification)}
                        >
                          {notification.type === "booking"
                            ? "Review"
                            : "Respond"}
                        </Button>
                      )}

                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(notification.id)}
                          icon={Mail}
                        >
                          Mark Read
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                        icon={Trash2}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredNotifications.length === 0 && (
            <Card className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "All caught up! No new notifications."}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile Notifications List */}
      <div className="lg:hidden p-4 space-y-3">
        {filteredNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-all ${
                !notification.isRead
                  ? "border-l-4 border-blue-500 bg-blue-50"
                  : "hover:shadow-md"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    notification.color.split(" ")[0]
                  } flex-shrink-0`}
                >
                  <notification.icon
                    className={`w-4 h-4 ${
                      notification.color.split(" ")[1]
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(
                        notification.priority
                      )}`}
                    >
                      {notification.priority.toUpperCase()}
                    </span>
                  </div>
                  {notification.amount && (
                    <span
                      className={`text-sm font-bold ${
                        notification.amount > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {notification.amount > 0 ? "+" : ""}₹
                      {Math.abs(notification.amount).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {filteredNotifications.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">
                No notifications found
              </h3>
              <p className="text-sm">
                {searchTerm || selectedFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "All caught up! No new notifications."}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotificationManager;
