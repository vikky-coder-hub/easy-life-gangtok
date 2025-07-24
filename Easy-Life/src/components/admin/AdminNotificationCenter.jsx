import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BellRing,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Filter,
  Trash2,
  Settings,
  X,
  Clock,
  Users,
  Store,
  DollarSign,
  Activity,
  Search,
  Mail,
  Calendar,
  Shield,
  Globe,
  ArrowLeft,
  FileText,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import apiService from "../../utils/api";

const AdminNotificationCenter = ({ onBack }) => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications(1, 50);
      if (response.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Transform backend notification to match admin format
  const transformNotification = (notification) => {
    return {
      id: notification._id,
      type: notification.type || 'info',
      category: notification.category || 'system',
      title: notification.title,
      message: notification.message,
      timestamp: new Date(notification.createdAt).toLocaleString(),
      isRead: notification.isRead,
      priority: notification.priority || 'medium',
      source: notification.source || 'System',
      actions: notification.actions || [],
    };
  };

  const transformedNotifications = notifications.map(transformNotification);

  const notificationStats = {
    total: transformedNotifications.length,
    unread: transformedNotifications.filter((n) => !n.isRead).length,
    urgent: transformedNotifications.filter((n) => n.type === "urgent").length,
    high: transformedNotifications.filter((n) => n.priority === "high").length,
  };

  const filteredNotifications = transformedNotifications.filter((notification) => {
    const matchesFilter =
      selectedFilter === "all" ||
      notification.category === selectedFilter ||
      notification.type === selectedFilter ||
      notification.priority === selectedFilter;

    const matchesSearch =
      searchTerm === "" ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.source.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "urgent":
        return AlertTriangle;
      case "warning":
        return XCircle;
      case "success":
        return CheckCircle;
      case "info":
      default:
        return Info;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === "high") {
      return "border-l-red-500 bg-red-50";
    }
    switch (type) {
      case "urgent":
        return "border-l-red-500 bg-red-50";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "success":
        return "border-l-green-500 bg-green-50";
      case "info":
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "security":
        return Shield;
      case "content":
        return FileText;
      case "business":
        return Store;
      case "financial":
        return DollarSign;
      case "system":
        return Settings;
      case "users":
        return Users;
      default:
        return Bell;
    }
  };

  const handleNotificationAction = (notification, action) => {
    console.log(`Action: ${action} for notification: ${notification.id}`);
    alert(`${action} action would be performed for: ${notification.title}`);
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await apiService.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.filter(n => n._id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true }))
        );
        alert("All notifications marked as read!");
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearAllNotifications = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      console.log("Clearing all notifications");
      alert("All notifications cleared!");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedNotification) {
    const NotificationIcon = getNotificationIcon(selectedNotification.type);
    const CategoryIcon = getCategoryIcon(selectedNotification.category);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => setSelectedNotification(null)}
                icon={ArrowLeft}
              >
                Back to Notifications
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Notification Details
              </h1>
            </div>

            <div
              className={`border-l-4 p-6 rounded-lg ${getNotificationColor(
                selectedNotification.type,
                selectedNotification.priority
              )}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center space-x-2">
                    <NotificationIcon className="w-6 h-6" />
                    <CategoryIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedNotification.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {selectedNotification.timestamp}
                      </span>
                      <span className="flex items-center">
                        <Activity className="w-4 h-4 mr-1" />
                        {selectedNotification.source}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedNotification.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : selectedNotification.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {selectedNotification.priority.charAt(0).toUpperCase() +
                          selectedNotification.priority.slice(1)}{" "}
                        Priority
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!selectedNotification.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(selectedNotification.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteNotification(selectedNotification.id)}
                    icon={Trash2}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {selectedNotification.message}
                </p>
              </div>

              {selectedNotification.actions &&
                selectedNotification.actions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Available Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedNotification.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant={index === 0 ? "primary" : "outline"}
                          onClick={() =>
                            handleNotificationAction(
                              selectedNotification,
                              action
                            )
                          }
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="mb-4"
            icon={ArrowLeft}
          >
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Notification Center
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor system alerts, user activities, and platform
                notifications
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={markAllAsRead}
                icon={CheckCircle}
              >
                Mark All Read
              </Button>
              <Button
                variant="outline"
                onClick={clearAllNotifications}
                icon={Trash2}
              >
                Clear All
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-gray-900">
              {notificationStats.total}
            </div>
            <div className="text-sm text-gray-600">Total Notifications</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {notificationStats.unread}
            </div>
            <div className="text-sm text-gray-600">Unread</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {notificationStats.urgent}
            </div>
            <div className="text-sm text-gray-600">Urgent</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {notificationStats.high}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex space-x-1">
                {[
                  { key: "all", label: "All", count: notificationStats.total },
                  {
                    key: "urgent",
                    label: "Urgent",
                    count: notificationStats.urgent,
                  },
                  { key: "security", label: "Security" },
                  { key: "financial", label: "Financial" },
                  { key: "business", label: "Business" },
                  { key: "content", label: "Content" },
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
                    {filter.label} {filter.count && `(${filter.count})`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const NotificationIcon = getNotificationIcon(notification.type);
            const CategoryIcon = getCategoryIcon(notification.category);

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border-l-4 p-6 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getNotificationColor(
                  notification.type,
                  notification.priority
                )} ${!notification.isRead ? "ring-2 ring-blue-100" : ""}`}
                onClick={() => setSelectedNotification(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      <NotificationIcon className="w-5 h-5" />
                      <CategoryIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            !notification.isRead
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.timestamp}
                        </span>
                        <span className="flex items-center">
                          <Activity className="w-3 h-3 mr-1" />
                          {notification.source}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full font-medium ${
                            notification.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : notification.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {notification.actions &&
                      notification.actions.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {notification.actions.length} action
                          {notification.actions.length > 1 ? "s" : ""}
                        </span>
                      )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      icon={Trash2}
                    />
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
                ? "Try adjusting your search or filter criteria."
                : "You're all caught up! No new notifications at this time."}
            </p>
          </Card>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notification Settings
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSettings(false)}
                  icon={X}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Email Notifications
                  </span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Push Notifications
                  </span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    High Priority Only
                  </span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                    <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowSettings(false)}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationCenter;
