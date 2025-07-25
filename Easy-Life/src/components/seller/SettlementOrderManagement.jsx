import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Activity,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Search,
  User,
  MapPin,
  Phone,
  Mail,
  XCircle,
  MessageCircle,
  Download,
  Banknote,
  Edit,
  Bell,
  Package,
  Truck,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import apiService from "../../utils/api";

const SettlementOrderManagement = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Real data state management
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch settlement orders and stats on component mount
  useEffect(() => {
    fetchSettlementOrdersAndStats();
  }, []);

  const fetchSettlementOrdersAndStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll use the same API as regular orders but filter for settlement-related ones
      // TODO: Create specific settlement order API endpoints
      const [ordersResponse, statsResponse] = await Promise.all([
        apiService.getSellerOrders({ status: 'completed' }), // Only completed orders have settlements
        apiService.getSellerOrderStats()
      ]);

      if (ordersResponse.success) {
        // Filter for orders that have settlement information
        const settlementOrders = (ordersResponse.data || []).filter(order => 
          order.status === 'completed' && order.paymentStatus === 'paid'
        );
        setOrders(settlementOrders);
      } else {
        throw new Error(ordersResponse.message || 'Failed to fetch settlement orders');
      }

      if (statsResponse.success) {
        // Calculate settlement-specific stats
        const allOrders = ordersResponse.data || [];
        const completedOrders = allOrders.filter(o => o.status === 'completed' && o.paymentStatus === 'paid');
        
        setOrderStats({
          total: completedOrders.length,
          totalRevenue: completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
          totalEarnings: completedOrders.reduce((sum, o) => sum + (o.netAmount || 0), 0),
          platformFees: completedOrders.reduce((sum, o) => sum + (o.platformFee || 0), 0),
          pendingSettlements: completedOrders.filter(o => !o.settlementCompleted).length,
          completedSettlements: completedOrders.filter(o => o.settlementCompleted).length,
        });
      } else {
        console.warn('Failed to fetch settlement stats:', statsResponse.message);
        setOrderStats({
          total: 0,
          totalRevenue: 0,
          totalEarnings: 0,
          platformFees: 0,
          pendingSettlements: 0,
          completedSettlements: 0,
        });
      }
    } catch (err) {
      console.error('Error fetching settlement orders:', err);
      setError(err.message || 'Failed to load settlement orders');
      setOrders([]);
      setOrderStats(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === "all" || 
      (selectedStatus === "pending" && !order.settlementCompleted) ||
      (selectedStatus === "completed" && order.settlementCompleted);

    return matchesSearch && matchesStatus;
  });

  const getSettlementStatusIcon = (order) => {
    if (order.settlementCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <Clock className="w-5 h-5 text-orange-500" />;
    }
  };

  const getSettlementStatusColor = (order) => {
    if (order.settlementCompleted) {
      return "bg-green-100 text-green-800";
    } else {
      return "bg-orange-100 text-orange-800";
    }
  };

  const getSettlementStatusText = (order) => {
    if (order.settlementCompleted) {
      return "Settled";
    } else {
      return "Pending Settlement";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button variant="outline" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settlement orders...</p>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button variant="outline" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Error Loading Settlement Orders
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchSettlementOrdersAndStats} variant="primary">
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Settlement Order Management
              </h1>
              <p className="text-gray-600 mt-1">
                Track your completed orders and settlement payments
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {/* TODO: Implement download */}}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>

              <div className="bg-green-100 px-3 py-2 rounded-lg">
                <div className="text-sm text-green-800">
                  <span className="font-medium">Total Earnings:</span> ₹
                  {orderStats?.totalEarnings?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {orderStats?.total || 0}
                </div>
                <div className="text-sm text-gray-600">Completed Orders</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {orderStats?.pendingSettlements || 0}
                </div>
                <div className="text-sm text-gray-600">Pending Settlements</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{orderStats?.totalRevenue?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Banknote className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{orderStats?.totalEarnings?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600">Net Earnings</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Filter:</span>
              </div>
              <div className="flex space-x-1">
                {[
                  { key: "all", label: "All", count: orderStats?.total || 0 },
                  { key: "pending", label: "Pending", count: orderStats?.pendingSettlements || 0 },
                  { key: "completed", label: "Settled", count: orderStats?.completedSettlements || 0 },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedStatus(filter.key)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      selectedStatus === filter.key
                        ? "bg-primary-100 text-primary-700 border border-primary-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Orders List */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Settlement Orders
            </h3>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No settlement orders found
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Complete some orders to see settlement information here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {order.service}
                        </h4>
                        {getSettlementStatusIcon(order)}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSettlementStatusColor(order)}`}
                        >
                          {getSettlementStatusText(order)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{order.customer?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{order.eventDate || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{order.location || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-lg font-semibold text-gray-900">
                        ₹{order.amount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-green-600">
                        Earnings: ₹{order.netAmount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Fee: ₹{order.platformFee?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SettlementOrderManagement;