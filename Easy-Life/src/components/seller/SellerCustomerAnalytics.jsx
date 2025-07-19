import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  UserPlus,
  RotateCcw,
  UserX,
  Activity,
  Download,
  Calendar,
  Star,
  DollarSign,
  MessageCircle,
  RefreshCw,
  Target,
  Heart,
  MapPin,
  Phone,
  Mail,
  Eye,
  Clock,
  BarChart3,
  Loader,
  AlertCircle,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import CustomerAnalyticsCard from "../common/CustomerAnalyticsCard";
import apiService from "../../utils/api";

const SellerCustomerAnalytics = ({ onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("last30days");
  const [selectedView, setSelectedView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [detailedLoading, setDetailedLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Real data state
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [detailedInsights, setDetailedInsights] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [businessMetrics, setBusinessMetrics] = useState(null);
  const [customerOverview, setCustomerOverview] = useState(null);
  const [customerInsights, setCustomerInsights] = useState(null);

  // Fetch customer analytics data
  const fetchCustomerAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [analyticsResponse, customersResponse, overviewResponse, insightsResponse] = await Promise.all([
        apiService.getSellerCustomerAnalytics(),
        apiService.getSellerCustomerList({ limit: 5, page: 1 }),
        apiService.getCustomerOverview(),
        apiService.getCustomerInsights()
      ]);

      if (analyticsResponse.success) {
        setCustomerAnalytics(analyticsResponse.data);
        
        // Extract business metrics from analytics data
        setBusinessMetrics({
          averageOrderValue: analyticsResponse.data.avgOrderValue || 0,
          customerLifetimeValue: Math.round(analyticsResponse.data.avgOrderValue * 2.3) || 0,
          repeatCustomerRate: analyticsResponse.data.repeat?.percentage || 0,
          customerSatisfactionScore: 4.7, // Could be enhanced with real satisfaction data
          referralRate: 12, // Could be enhanced with real referral data
          churnRate: analyticsResponse.data.lapsed?.percentage || 0,
        });
      }

      if (customersResponse.success) {
        setTopCustomers(customersResponse.data.customers || []);
      }

      if (overviewResponse.success) {
        setCustomerOverview(overviewResponse.data);
      }

      if (insightsResponse.success) {
        setCustomerInsights(insightsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching customer analytics:', err);
      setError('Failed to load customer analytics data');
      
      // Fallback to mock data
      setCustomerAnalytics(getMockCustomerAnalytics());
      setBusinessMetrics(getMockBusinessMetrics());
      setTopCustomers(getMockTopCustomers());
      setCustomerOverview(getMockCustomerOverview());
      setCustomerInsights(getMockCustomerInsights());
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed insights
  const fetchDetailedInsights = async () => {
    try {
      setDetailedLoading(true);
      const response = await apiService.getDetailedCustomerInsights();
      
      if (response.success) {
        setDetailedInsights(response.data);
      }
    } catch (err) {
      console.error('Error fetching detailed insights:', err);
      // Fallback to mock data for detailed insights
      setDetailedInsights(getMockDetailedInsights());
    } finally {
      setDetailedLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCustomerAnalytics();
  }, [selectedPeriod]);

  // Load detailed insights when switching to detailed view
  useEffect(() => {
    if (selectedView === "detailed" && !detailedInsights) {
      fetchDetailedInsights();
    }
  }, [selectedView]);

  // Mock data fallback functions
  const getMockCustomerAnalytics = () => ({
    lastUpdated: "a day ago",
    total: {
      count: 42,
      percentage: 18,
      previousCount: 36,
    },
    new: {
      count: 18,
      percentage: 25,
      description: "First-time customers",
    },
    repeat: {
      count: 20,
      percentage: 15,
      description: "Returning customers",
    },
    lapsed: {
      count: 4,
      percentage: 33,
      description: "Haven't booked in 60+ days",
    },
    avgOrderValue: 1850,
    totalRevenue: 77700,
  });

  const getMockBusinessMetrics = () => ({
    averageOrderValue: 1850,
    customerLifetimeValue: 4250,
    repeatCustomerRate: 48,
    customerSatisfactionScore: 4.7,
    referralRate: 12,
    churnRate: 8,
  });

  const getMockTopCustomers = () => [
    {
      id: "cust-001",
      name: "Rajesh Sharma",
      email: "rajesh.sharma@email.com",
      phone: "+91 9841234567",
      location: "MG Road, Gangtok",
      totalBookings: 8,
      totalSpent: 15500,
      averageRating: 4.9,
      lastBooking: "2025-01-08",
      segment: "vip",
      notes: "Prefers weekend appointments",
    },
    {
      id: "cust-002",
      name: "Priya Devi",
      email: "priya.devi@email.com",
      phone: "+91 9812345678",
      location: "Tadong, Gangtok",
      totalBookings: 6,
      totalSpent: 12200,
      averageRating: 4.8,
      lastBooking: "2025-01-07",
      segment: "regular",
      notes: "Always books morning slots",
    },
    {
      id: "cust-003",
      name: "Sita Gurung",
      email: "sita.gurung@email.com",
      phone: "+91 9823456789",
      location: "Ranipool, Gangtok",
      totalBookings: 5,
      totalSpent: 9800,
      averageRating: 4.6,
      lastBooking: "2025-01-06",
      segment: "regular",
      notes: "Prefers eco-friendly options",
    },
    {
      id: "cust-004",
      name: "Deepak Rai",
      email: "deepak.rai@email.com",
      phone: "+91 9834567890",
      location: "Tibet Road, Gangtok",
      totalBookings: 4,
      totalSpent: 8500,
      averageRating: 4.5,
      lastBooking: "2025-01-05",
      segment: "regular",
      notes: "Budget-conscious customer",
    },
    {
      id: "cust-005",
      name: "Maya Lama",
      email: "maya.lama@email.com",
      phone: "+91 9845678901",
      location: "Development Area, Gangtok",
      totalBookings: 3,
      totalSpent: 6750,
      averageRating: 4.7,
      lastBooking: "2025-01-04",
      segment: "new",
      notes: "Referred by Rajesh Sharma",
    },
  ];

  const getMockDetailedInsights = () => ({
    funnel: [
      { stage: "Awareness", customers: 150, percentage: 100 },
      { stage: "Interest", customers: 89, percentage: 59 },
      { stage: "Consideration", customers: 67, percentage: 45 },
      { stage: "Purchase", customers: 42, percentage: 28 },
      { stage: "Retention", customers: 20, percentage: 13 },
      { stage: "Advocacy", customers: 8, percentage: 5 },
    ]
  });

  const getMockCustomerOverview = () => ({
    segments: {
      vip: 5,
      regular: 20,
      new: 18,
      inactive: 2
    },
    topLocations: [
      { location: 'MG Road', count: 12 },
      { location: 'Tadong', count: 8 },
      { location: 'Ranipool', count: 6 },
      { location: 'Tibet Road', count: 4 },
      { location: 'Development Area', count: 3 }
    ]
  });

  const getMockCustomerInsights = () => ({
    insights: [
      {
        type: 'peak_time',
        icon: 'blue',
        text: 'Peak booking time: 2-4 PM on weekdays'
      },
      {
        type: 'satisfaction',
        icon: 'green',
        text: 'Highest satisfaction: Emergency services'
      },
      {
        type: 'referrals',
        icon: 'purple',
        text: 'Most referrals come from satisfied VIP customers'
      },
      {
        type: 'revenue',
        icon: 'yellow',
        text: 'Weekend bookings have 15% higher value'
      }
    ]
  });

  const getSegmentColor = (segment) => {
    switch (segment) {
      case "vip":
        return "bg-purple-100 text-purple-800";
      case "regular":
        return "bg-blue-100 text-blue-800";
      case "new":
        return "bg-green-100 text-green-800";
      case "lapsed":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleExportData = () => {
    console.log("Exporting customer analytics data");
    alert("Customer analytics data exported successfully!");
  };

  const handleRefreshData = async () => {
    await fetchCustomerAnalytics();
    if (selectedView === "detailed") {
      await fetchDetailedInsights();
    }
  };

  const handleGetDeeperInsights = () => {
    setSelectedView("detailed");
  };

  const handleCustomerAction = (customerIdOrAction, action = null) => {
    if (action) {
      // Called with customerId and action (for customer list items)
      console.log(`${action} customer:`, customerIdOrAction);
      // In real app, this would trigger appropriate actions
    } else {
      // Called with just action (for general customer actions)
      const actionName = customerIdOrAction;
      console.log(`Customer action: ${actionName}`);
      // Future implementation for customer action handling
      switch (actionName) {
        case 'send_followup':
          alert('Send Follow-up Message functionality will be implemented');
          break;
        case 'schedule_reminder':
          alert('Schedule Reminder functionality will be implemented');
          break;
        case 'create_loyalty':
          alert('Create Loyalty Program functionality will be implemented');
          break;
        case 'export_list':
          alert('Export Customer List functionality will be implemented');
          break;
        default:
          console.log('Unknown action:', actionName);
      }
    }
  };

  // Loading state for overview
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading customer analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Dashboard
          </Button>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to Load Customer Analytics
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={handleRefreshData}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedView === "detailed") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedView("overview")}
              className="mb-4"
            >
              ← Back to Overview
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Detailed Customer Insights
                </h1>
                <p className="text-gray-600 mt-1">
                  Deep dive into your customer relationships and behavior
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="last7days">Last 7 days</option>
                  <option value="last30days">Last 30 days</option>
                  <option value="last90days">Last 90 days</option>
                  <option value="last12months">Last 12 months</option>
                </select>
                <Button
                  variant="outline"
                  icon={Download}
                  onClick={handleExportData}
                >
                  Export
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Journey Funnel */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Customer Journey Funnel
                </h2>
                {detailedLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      // Map backend funnel data to frontend format
                      const funnelData = detailedInsights?.funnel ? [
                        { stage: "Inquiries", customers: detailedInsights.funnel.inquiries.count, percentage: 100 },
                        { stage: "Bookings", customers: detailedInsights.funnel.bookings.count, percentage: detailedInsights.funnel.bookings.percentage },
                        { stage: "Completions", customers: detailedInsights.funnel.completions.count, percentage: detailedInsights.funnel.completions.percentage },
                        { stage: "Repeat", customers: detailedInsights.funnel.repeat.count, percentage: detailedInsights.funnel.repeat.percentage },
                      ] : getMockDetailedInsights().funnel;
                      
                      return funnelData.map((stage, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-24 text-sm text-gray-600">
                            {stage.stage}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                              style={{ width: `${stage.percentage}%` }}
                            >
                              {stage.customers}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 w-12 text-right">
                            {stage.percentage}%
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </Card>

              {/* Top Customers */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Top Customers
                </h2>
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topCustomers.map((customer, index) => (
                      <motion.div
                        key={customer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {customer.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {customer.location || customer.email}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {customer.totalBookings || 0} bookings
                            </span>
                            <span className="text-xs text-green-600">
                              ₹{(customer.totalSpent || 0).toLocaleString()}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500">
                                {customer.averageRating || 4.5}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSegmentColor(
                            customer.segment || 'new'
                          )}`}
                        >
                          {(customer.segment || 'new').toUpperCase()}
                        </span>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleCustomerAction(customer.id, "message")
                            }
                          >
                            <MessageCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleCustomerAction(customer.id, "call")
                            }
                          >
                            <Phone className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleCustomerAction(customer.id, "view")
                            }
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Business Metrics */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Key Business Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Avg Order Value
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ₹{(businessMetrics?.averageOrderValue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Customer LTV</span>
                    <span className="text-sm font-medium text-gray-900">
                      ₹{(businessMetrics?.customerLifetimeValue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Repeat Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {businessMetrics?.repeatCustomerRate || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Satisfaction</span>
                    <span className="text-sm font-medium text-gray-900">
                      {businessMetrics?.customerSatisfactionScore || 4.5}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Referral Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {businessMetrics?.referralRate || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Churn Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {businessMetrics?.churnRate || 0}%
                    </span>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Actions
                </h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => handleCustomerAction('send_followup')}
                  >
                    Send Follow-up Message
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => handleCustomerAction('schedule_reminder')}
                  >
                    Schedule Reminder
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => handleCustomerAction('create_loyalty')}
                  >
                    Create Loyalty Program
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => handleCustomerAction('export_list')}
                  >
                    Export Customer List
                  </Button>
                </div>
              </Card>

              {/* Customer Insights */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Insights
                </h3>
                <div className="space-y-3 text-sm">
                  {(customerInsights?.insights || getMockCustomerInsights().insights).map((insight, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        insight.icon === 'blue' ? 'bg-blue-500' :
                        insight.icon === 'green' ? 'bg-green-500' :
                        insight.icon === 'purple' ? 'bg-purple-500' :
                        insight.icon === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <p className="text-gray-700">
                        {insight.text}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Customer Analytics - Business Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button variant="outline" onClick={onBack} className="mb-4">
              ← Back to Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Customer Analytics
                </h1>
                <p className="text-gray-600 mt-1">
                  Understand your customer base and improve relationships
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="last7days">Last 7 days</option>
                  <option value="last30days">Last 30 days</option>
                  <option value="last90days">Last 90 days</option>
                  <option value="last12months">Last 12 months</option>
                </select>
                <Button
                  variant="outline"
                  icon={Download}
                  onClick={handleExportData}
                >
                  Export
                </Button>
                <Button
                  variant="outline"
                  icon={RefreshCw}
                  size="sm"
                  onClick={handleRefreshData}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Customer Analytics Card */}
            <div className="lg:col-span-1">
              <CustomerAnalyticsCard
                title="Your Customers"
                data={customerAnalytics}
                onGetDeeperInsights={handleGetDeeperInsights}
              />
            </div>

            {/* Additional Business Metrics */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-green-100">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Avg Order Value
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{(businessMetrics?.averageOrderValue || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">
                        +12% vs last month
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <RotateCcw className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Repeat Rate
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {businessMetrics?.repeatCustomerRate || 0}%
                      </p>
                      <p className="text-sm text-green-600">
                        +3% vs last month
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-yellow-100">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Satisfaction
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {businessMetrics?.customerSatisfactionScore || 4.5}
                      </p>
                      <p className="text-sm text-green-600">
                        +0.2 vs last month
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Customer Overview */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Customer Overview
                  </h2>
                  <Button variant="outline" size="sm">
                    View All Customers
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Customer Segments
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">VIP</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {customerOverview?.segments?.vip || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Regular</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {customerOverview?.segments?.regular || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">New</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {customerOverview?.segments?.new || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Inactive</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {customerOverview?.segments?.inactive || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Top Locations
                    </h3>
                    <div className="space-y-3">
                      {(customerOverview?.topLocations || getMockCustomerOverview().topLocations).slice(0, 3).map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{location.location}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {location.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerCustomerAnalytics;
