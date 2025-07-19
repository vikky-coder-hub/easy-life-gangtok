import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageCircle,
  DollarSign,
  Eye,
  Edit,
  Plus,
  Heart,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Tag,
  ArrowLeft,
  X,
  MoreVertical,
  Loader2,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import CustomerAnalyticsCard from "../common/CustomerAnalyticsCard";
import apiService from "../../utils/api";

const CRMManager = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [activeTab, setActiveTab] = useState("customers");

  // State for backend data
  const [customers, setCustomers] = useState([]);
  const [crmAnalytics, setCrmAnalytics] = useState(null);
  const [customerStats, setCustomerStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [pagination, setPagination] = useState({});

  // Fetch customer analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiService.getSellerCustomerAnalytics();
        if (response.success) {
          setCrmAnalytics(response.data);
          setCustomerStats({
            total: response.data.total.count,
            vip: response.data.segments.vip,
            regular: response.data.segments.regular,
            new: response.data.segments.new,
            inactive: response.data.segments.inactive,
            active: response.data.active.count,
          });
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load customer analytics');
      }
    };

    fetchAnalytics();
  }, []);

  // Fetch customer list
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await apiService.getSellerCustomerList({
          search: searchTerm,
          segment: selectedSegment === 'all' ? undefined : selectedSegment,
          page: 1,
          limit: 50,
        });
        
        if (response.success) {
          setCustomers(response.data.customers || []);
          setCategoryStats(response.data.categoryStats || []);
          setPagination(response.data.pagination || {});
        } else {
          setError(response.message || 'Failed to fetch customers');
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [searchTerm, selectedSegment]);

  // Fetch customer details
  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await apiService.getSellerCustomerDetails(customerId);
      if (response.success) {
        setSelectedCustomer(response.data);
      } else {
        setError('Failed to load customer details');
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError('Failed to load customer details');
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = !searchTerm || (
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesSegment =
      selectedSegment === "all" || customer.segment === selectedSegment;

    return matchesSearch && matchesSegment;
  });

  const getSegmentColor = (segment) => {
    switch (segment) {
      case "vip":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "regular":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "new":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSegmentIcon = (segment) => {
    switch (segment) {
      case "vip":
        return Award;
      case "regular":
        return Users;
      case "new":
        return Plus;
      case "inactive":
        return Clock;
      default:
        return Users;
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedCustomer) return;

    try {
      const response = await apiService.addCustomerNote(selectedCustomer.id, {
        note: newNote,
        type: 'general',
      });

      if (response.success) {
        // Update the selected customer's notes
        setSelectedCustomer(prev => ({
          ...prev,
          notes: [response.data, ...prev.notes]
        }));
        setNewNote("");
        setShowAddNote(false);
      } else {
        alert('Failed to add note: ' + response.message);
      }
    } catch (err) {
      console.error('Error adding note:', err);
      alert('Failed to add note. Please try again.');
    }
  };

  const handleSendMessage = async (customer) => {
    try {
      const message = prompt('Enter your message:');
      if (message) {
        const response = await apiService.sendCustomerMessage(customer.id || customer.customerId, {
          message,
          channel: 'app'
        });
        
        if (response.success) {
          alert('Message sent successfully!');
        } else {
          alert('Failed to send message: ' + response.message);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleScheduleFollowUp = async (customer) => {
    try {
      const followUpDate = prompt('Enter follow-up date (YYYY-MM-DD):');
      const reason = prompt('Enter follow-up reason:');
      
      if (followUpDate && reason) {
        const response = await apiService.scheduleCustomerFollowUp(customer.id || customer.customerId, {
          followUpDate,
          reason
        });
        
        if (response.success) {
          alert('Follow-up scheduled successfully!');
        } else {
          alert('Failed to schedule follow-up: ' + response.message);
        }
      }
    } catch (err) {
      console.error('Error scheduling follow-up:', err);
      alert('Failed to schedule follow-up. Please try again.');
    }
  };

  const handleAnalyticsInsights = () => {
    // Switch to analytics tab to show detailed customer insights
    setActiveTab("analytics");
  };

  const handleCustomerClick = (customer) => {
    fetchCustomerDetails(customer.customerId || customer.id);
  };

  // Mobile detection useEffect
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile && selectedCustomer) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Customer Details
                </h1>
                <p className="text-sm text-gray-500">{selectedCustomer.name}</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Content */}
        <div className="p-4 space-y-4">
          <Card className="p-4">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold">
                {selectedCustomer.name.charAt(0)}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCustomer.name}
              </h2>
              <div className="flex items-center justify-center space-x-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < selectedCustomer.rating
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  ({selectedCustomer.rating})
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">
                  {selectedCustomer.location}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Customer Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {selectedCustomer.totalBookings}
                </p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  ₹{selectedCustomer.totalSpent?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </Card>

          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1" icon={Phone}>
              Call
            </Button>
            <Button variant="outline" className="flex-1" icon={MessageCircle}>
              Message
            </Button>
            <Button variant="primary" className="flex-1" icon={Calendar}>
              Book Service
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCustomer) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => setSelectedCustomer(null)}
              >
                ← Back to Customers
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Customer Details
              </h1>
            </div>

            {/* Customer Header */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {selectedCustomer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedCustomer.name}
                  </h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedCustomer.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSegmentColor(
                      selectedCustomer.segment
                    )}`}
                  >
                    {React.createElement(
                      getSegmentIcon(selectedCustomer.segment),
                      { className: "w-4 h-4 mr-1" }
                    )}
                    {selectedCustomer.segment.toUpperCase()}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCustomer.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedCustomer.status.charAt(0).toUpperCase() +
                      selectedCustomer.status.slice(1)}
                  </span>
                </div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleSendMessage(selectedCustomer)}
                    icon={MessageCircle}
                  >
                    Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleScheduleFollowUp(selectedCustomer)}
                    icon={Calendar}
                  >
                    Follow Up
                  </Button>
                </div>
              </div>
            </div>

            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedCustomer.totalBookings}
                </div>
                <div className="text-sm text-blue-700">Total Bookings</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ₹{selectedCustomer.totalSpent.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Total Spent</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {selectedCustomer.averageRating}
                </div>
                <div className="text-sm text-yellow-700">Avg Rating</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ₹
                  {Math.round(
                    selectedCustomer.totalSpent / selectedCustomer.totalBookings
                  ).toLocaleString()}
                </div>
                <div className="text-sm text-purple-700">Avg Order Value</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Communication History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Communication History
                </h3>
                <div className="space-y-4">
                  {selectedCustomer.communicationHistory.map((comm) => (
                    <div key={comm.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              comm.type === "booking"
                                ? "bg-blue-100 text-blue-800"
                                : comm.type === "inquiry"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {comm.type.charAt(0).toUpperCase() +
                              comm.type.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {comm.date}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            comm.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : comm.status === "responded"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {comm.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comm.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddNote(true)}
                    icon={Plus}
                  >
                    Add Note
                  </Button>
                </div>

                {showAddNote && (
                  <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about this customer..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      rows={3}
                    />
                    <div className="flex space-x-2 mt-3">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleAddNote}
                      >
                        Save Note
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddNote(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedCustomer.notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            note.type === "general"
                              ? "bg-blue-100 text-blue-800"
                              : note.type === "follow-up"
                              ? "bg-orange-100 text-orange-800"
                              : note.type === "preference"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {note.type.charAt(0).toUpperCase() +
                            note.type.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {note.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Preferences
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedCustomer.preferences.map((preference, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {preference}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            variant="primary"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`max-w-7xl mx-auto ${
          isMobile ? "" : "px-4 sm:px-6 lg:px-8 py-8"
        }`}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">
                  Customer Management
                </h1>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="flex mt-4 space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("customers")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "customers"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "analytics"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="mb-6">
            <Button variant="outline" onClick={onBack} className="mb-4">
              ← Back to Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Customer Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage customer relationships and communication history
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div
          className={`grid grid-cols-2 lg:grid-cols-6 gap-4 ${
            isMobile ? "px-4 pb-4" : "mb-8"
          }`}
        >
          <Card className="p-4 lg:p-6">
            <div className="text-xl lg:text-2xl font-bold text-gray-900">
              {customerStats.total}
            </div>
            <div className="text-xs lg:text-sm text-gray-600">
              Total Customers
            </div>
          </Card>
          <Card className="p-4 lg:p-6">
            <div className="text-xl lg:text-2xl font-bold text-purple-600">
              {customerStats.vip}
            </div>
            <div className="text-xs lg:text-sm text-gray-600">VIP</div>
          </Card>
          <Card className="p-4 lg:p-6">
            <div className="text-xl lg:text-2xl font-bold text-blue-600">
              {customerStats.regular}
            </div>
            <div className="text-xs lg:text-sm text-gray-600">Regular</div>
          </Card>
          <Card className="p-4 lg:p-6">
            <div className="text-xl lg:text-2xl font-bold text-green-600">
              {customerStats.new}
            </div>
            <div className="text-xs lg:text-sm text-gray-600">New</div>
          </Card>
          <Card className="p-4 lg:p-6">
            <div className="text-xl lg:text-2xl font-bold text-gray-600">
              {customerStats.inactive}
            </div>
            <div className="text-xs lg:text-sm text-gray-600">Inactive</div>
          </Card>
          <Card className="p-4 lg:p-6">
            <div className="text-xl lg:text-2xl font-bold text-green-600">
              {customerStats.active}
            </div>
            <div className="text-xs lg:text-sm text-gray-600">Active</div>
          </Card>
        </div>

        {/* Tab Navigation for Desktop */}
        {!isMobile && (
          <div className="flex space-x-1 mb-8">
            <button
              onClick={() => setActiveTab("customers")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "customers"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "analytics"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Analytics
            </button>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === "customers" && (
          <>
            {/* Customer Analytics Integration */}
            <div
              className={`grid lg:grid-cols-4 gap-6 ${
                isMobile ? "px-4 mb-4" : "mb-8"
              }`}
            >
              <div className="lg:col-span-1">
                <CustomerAnalyticsCard
                  title="Customer Insights"
                  data={crmAnalytics}
                  onGetDeeperInsights={handleAnalyticsInsights}
                  variant="default"
                />
              </div>
              <div className="lg:col-span-3">
                {/* Filters */}
                <Card className={`${isMobile ? "mx-4" : ""} p-4 lg:p-6`}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={Search}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <div className="flex space-x-1 flex-wrap gap-2">
                        {[
                          {
                            key: "all",
                            label: "All",
                            count: customerStats.total,
                          },
                          {
                            key: "vip",
                            label: "VIP",
                            count: customerStats.vip,
                          },
                          {
                            key: "regular",
                            label: "Regular",
                            count: customerStats.regular,
                          },
                          {
                            key: "new",
                            label: "New",
                            count: customerStats.new,
                          },
                          {
                            key: "inactive",
                            label: "Inactive",
                            count: customerStats.inactive,
                          },
                        ].map((filter) => (
                          <button
                            key={filter.key}
                            onClick={() => setSelectedSegment(filter.key)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              selectedSegment === filter.key
                                ? "bg-primary-100 text-primary-700"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {filter.label} ({filter.count})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Customers List */}
            <div className={`${isMobile ? "px-4" : ""}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {filteredCustomers.map((customer) => {
                  const SegmentIcon = getSegmentIcon(customer.segment);

                  return (
                    <motion.div
                      key={customer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleCustomerClick(customer)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {customer.name}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span>{customer.location}</span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSegmentColor(
                            customer.segment
                          )}`}
                        >
                          <SegmentIcon className="w-3 h-3 mr-1" />
                          {customer.segment.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {customer.totalBookings}
                          </div>
                          <div className="text-xs text-gray-500">Bookings</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            ₹{(customer.totalSpent / 1000).toFixed(1)}k
                          </div>
                          <div className="text-xs text-gray-500">Spent</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-yellow-600 flex items-center justify-center">
                            {customer.averageRating}
                            <Star className="w-3 h-3 ml-1 fill-current" />
                          </div>
                          <div className="text-xs text-gray-500">Rating</div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <div className="flex items-center justify-between">
                          <span>Last Activity:</span>
                          <span>{customer.lastActivity}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Status:</span>
                          <span
                            className={`font-medium ${
                              customer.status === "active"
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            {customer.status.charAt(0).toUpperCase() +
                              customer.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => fetchCustomerDetails(customer.customerId || customer.id)}
                          icon={Eye}
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendMessage(customer)}
                          icon={MessageCircle}
                        >
                          Message
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredCustomers.length === 0 && (
                <Card className={`${isMobile ? "mx-4" : ""} p-12 text-center`}>
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No customers found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedSegment !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "You haven't acquired any customers yet."}
                  </p>
                </Card>
              )}
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div className={`${isMobile ? "px-4" : ""}`}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Analytics Dashboard
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {customerStats.total}
                  </div>
                  <div className="text-sm text-gray-600">Total Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ₹{crmAnalytics?.totalRevenue?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    ₹{crmAnalytics?.avgOrderValue || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Avg Order Value</div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Customer Segment Distribution
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {customerStats.vip}
                    </div>
                    <div className="text-sm text-gray-600">VIP</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {customerStats.regular}
                    </div>
                    <div className="text-sm text-gray-600">Regular</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {customerStats.new}
                    </div>
                    <div className="text-sm text-gray-600">New</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {customerStats.inactive}
                    </div>
                    <div className="text-sm text-gray-600">Inactive</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {customerStats.active}
                    </div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMManager;
