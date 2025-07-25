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
import { useAuth } from "../../context/AuthContext";

const ServiceManagement = ({ onBack, initialTab = "orders" }) => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // "orders" or "settlements"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  
  // Real data state management
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders and stats on component mount
  useEffect(() => {
    if (isAuthenticated && isSeller) {
      fetchOrdersAndStats();
    }
  }, [isAuthenticated, isSeller]);

  const fetchOrdersAndStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check authentication
      if (!isAuthenticated || !isSeller) {
        throw new Error('You must be logged in as a seller to view orders');
      }

      console.log('Fetching orders for user:', user);
      console.log('API token:', apiService.getToken());
      console.log('User type:', user?.userType);
      
      // First check if seller has a business
      let businessResponse;
      try {
        businessResponse = await apiService.getMyBusiness();
        console.log('Business response:', businessResponse);
        
        if (!businessResponse.success || !businessResponse.data) {
          throw new Error('You need to create a business profile first to view orders. Please complete your business setup.');
        }
      } catch (businessError) {
        console.error('Business check error:', businessError);
        throw new Error('You need to create a business profile first to view orders. Please complete your business setup.');
      }
      
      // Fetch orders and stats in parallel
      const [ordersResponse, statsResponse] = await Promise.all([
        apiService.getSellerOrders(),
        apiService.getSellerOrderStats()
      ]);

      console.log('Orders response:', ordersResponse);
      console.log('Stats response:', statsResponse);

      if (ordersResponse.success) {
        const ordersData = ordersResponse.data || [];
        setOrders(ordersData);
        console.log('Orders loaded:', ordersData.length);
        if (ordersData.length > 0) {
          console.log('Sample order:', ordersData[0]);
        }
      } else {
        throw new Error(ordersResponse.message || 'Failed to fetch orders');
      }

      if (statsResponse.success) {
        setOrderStats(statsResponse.data);
      } else {
        console.warn('Failed to fetch order stats:', statsResponse.message);
        // Calculate basic stats from orders if API fails
        const ordersData = ordersResponse.data || [];
        setOrderStats({
          total: ordersData.length,
          pending: ordersData.filter(o => o.status === 'pending').length,
          confirmed: ordersData.filter(o => o.status === 'confirmed').length,
          inProgress: ordersData.filter(o => o.status === 'in-progress').length,
          completed: ordersData.filter(o => o.status === 'completed').length,
          cancelled: ordersData.filter(o => o.status === 'cancelled').length,
          rejected: ordersData.filter(o => o.status === 'rejected').length,
          totalRevenue: ordersData
            .filter(o => o.paymentStatus === 'paid')
            .reduce((sum, o) => sum + (o.amount || 0), 0),
          totalEarnings: ordersData
            .filter(o => o.paymentStatus === 'paid')
            .reduce((sum, o) => sum + (o.netAmount || 0), 0),
        });
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
      setOrders([]);
      setOrderStats(null);
    } finally {
      setLoading(false);
    }
  };



  // Real settlements data state management
  const [settlements, setSettlements] = useState([]);
  const [settlementStats, setSettlementStats] = useState(null);

  // Fetch settlements data (for now, we'll derive from orders until we have a dedicated settlements API)
  useEffect(() => {
    if (orders.length > 0) {
      // Generate settlement data from completed orders
      const completedOrders = orders.filter(order => order.status === 'completed' && order.paymentStatus === 'paid');
      const settlementData = completedOrders.map(order => ({
        id: `STL${order.id}`,
        orderId: order.id,
        customer: order.customer?.name || 'N/A',
        service: order.service,
        transactionDate: order.orderDate || order.eventDate,
        settlementDate: order.settlementDate || 'Pending',
        actualSettlementDate: order.actualSettlementDate || null,
        grossAmount: order.amount || 0,
        platformFee: order.platformFee || 0,
        taxDeduction: 0,
        netAmount: order.netAmount || 0,
        status: order.settlementStatus || 'pending',
        paymentMode: 'Bank Transfer',
        utrNumber: order.utrNumber || null,
        bankAccount: 'SBI ****1234',
        processingDays: 4,
        settlementCycle: 'T+4',
        razorpayOrderId: order.paymentId || null,
        settlementType: 'automatic',
        estimatedSettlement: order.estimatedSettlement || 'Processing',
      }));
      
      setSettlements(settlementData);
      
      // Calculate settlement stats
      setSettlementStats({
        total: settlementData.length,
        pending: settlementData.filter(s => s.status === 'pending').length,
        processing: settlementData.filter(s => s.status === 'processing').length,
        completed: settlementData.filter(s => s.status === 'completed').length,
        failed: settlementData.filter(s => s.status === 'failed').length,
        onHold: settlementData.filter(s => s.status === 'on-hold').length,
        totalPending: settlementData
          .filter(s => s.status === 'pending')
          .reduce((sum, s) => sum + s.netAmount, 0),
        totalCompleted: settlementData
          .filter(s => s.status === 'completed')
          .reduce((sum, s) => sum + s.netAmount, 0),
      });
    }
  }, [orders]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.service || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredSettlements = settlements.filter((settlement) => {
    const matchesSearch =
      (settlement.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (settlement.service || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (settlement.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (settlement.orderId || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || settlement.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // orderStats is now fetched from API in fetchOrdersAndStats()
  // settlementStats is now calculated from real data in useEffect

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "in-progress":
        return <Package className="w-5 h-5 text-purple-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "rejected":
        return "bg-red-100 text-red-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSettlementStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "processing":
        return <Activity className="w-5 h-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "on-hold":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSettlementStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Order Management Functions
  const handleOrderAction = (orderId, action, reason = null) => {
    console.log(
      `${action} order ${orderId}`,
      reason ? `Reason: ${reason}` : ""
    );

    // Simulate API call
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        const updatedOrder = { ...order };

        switch (action) {
          case "approve":
            updatedOrder.status = "confirmed";
            updatedOrder.notifications = [
              ...(order.notifications || []),
              "Order approved by seller",
            ];
            break;
          case "reject":
            updatedOrder.status = "rejected";
            updatedOrder.rejectionReason = reason;
            updatedOrder.notifications = [
              ...(order.notifications || []),
              "Order rejected by seller",
            ];
            break;
          case "start":
            updatedOrder.status = "in-progress";
            updatedOrder.startTime = new Date().toISOString();
            updatedOrder.notifications = [
              ...(order.notifications || []),
              "Work started",
            ];
            break;
          case "complete":
            updatedOrder.status = "completed";
            updatedOrder.completionTime = new Date().toISOString();
            updatedOrder.notifications = [
              ...(order.notifications || []),
              "Service completed",
            ];
            break;
          case "cancel":
            updatedOrder.status = "cancelled";
            updatedOrder.cancellationReason = reason;
            updatedOrder.notifications = [
              ...(order.notifications || []),
              "Order cancelled",
            ];
            break;
          default:
            break;
        }

        return updatedOrder;
      }
      return order;
    });

    // In real app, this would update the state and make API call
    setSelectedOrder(null);
    alert(`Order ${action}ed successfully!`);
  };

  const handleSendMessage = (orderId, message) => {
    console.log(`Sending message to order ${orderId}:`, message);
    // In real app, this would send message to customer
    alert("Message sent to customer!");
  };

  const handleNotificationAction = (notification) => {
    console.log("Handling notification:", notification);
    // Mark notification as read or take appropriate action
  };

  const downloadSettlementReport = () => {
    console.log("Downloading settlement report...");
    // In real app, this would generate and download a report
    alert("Settlement report downloaded!");
  };

  const handleContactCustomer = (customerPhone) => {
    window.open(`tel:${customerPhone}`);
  };

  // Render Order Detail View
  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedOrder(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </div>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Order #{selectedOrder.id}
                </h3>
                <div className="flex items-center space-x-3">
                  {getOrderStatusIcon(selectedOrder.status)}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  ₹{selectedOrder.amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  You earn: ₹{selectedOrder.netAmount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Customer Information
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">
                    {selectedOrder.customer.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a
                    href={`mailto:${selectedOrder.customer.email}`}
                    className="text-primary-600 hover:underline"
                  >
                    {selectedOrder.customer.email}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a
                    href={`tel:${selectedOrder.customer.phone}`}
                    className="text-primary-600 hover:underline"
                  >
                    {selectedOrder.customer.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Service Details
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900">Service:</span>
                  <span className="text-gray-700">{selectedOrder.service}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">
                    {selectedOrder.eventDate}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">
                    {selectedOrder.eventTime}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">
                    {selectedOrder.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Special Requests
              </h4>
              <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                {selectedOrder.specialRequests}
              </p>
            </div>

            {/* Payment Breakdown */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Payment Breakdown
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Amount:</span>
                  <span className="font-semibold">
                    ₹{selectedOrder.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee (15%):</span>
                  <span className="font-semibold text-red-600">
                    -₹{selectedOrder.platformFee}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Your Earnings:</span>
                  <span className="font-semibold text-green-600">
                    ₹{selectedOrder.netAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Review (if completed) */}
            {selectedOrder.status === "completed" &&
              selectedOrder.customerReview && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Customer Review
                  </h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      {[...Array(selectedOrder.customerRating)].map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 bg-yellow-400 rounded-sm"
                        ></div>
                      ))}
                      <span className="text-sm text-gray-600">
                        ({selectedOrder.customerRating}/5)
                      </span>
                    </div>
                    <p className="text-gray-700">
                      {selectedOrder.customerReview}
                    </p>
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-6 border-t">
              {selectedOrder.status === "pending" && (
                <>
                  <Button
                    variant="primary"
                    onClick={() =>
                      handleOrderAction(selectedOrder.id, "accept")
                    }
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Order
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleOrderAction(selectedOrder.id, "reject")
                    }
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Order
                  </Button>
                </>
              )}

              {selectedOrder.status === "confirmed" && (
                <Button
                  variant="primary"
                  onClick={() =>
                    handleOrderAction(selectedOrder.id, "complete")
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Completed
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() =>
                  handleContactCustomer(selectedOrder.customer.phone)
                }
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Customer
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  window.open(`mailto:${selectedOrder.customer.email}`)
                }
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Customer
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Render Settlement Detail View
  if (selectedSettlement) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedSettlement(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settlements
            </Button>
          </div>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Settlement #{selectedSettlement.id}
                </h3>
                <div className="flex items-center space-x-3">
                  {getSettlementStatusIcon(selectedSettlement.status)}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSettlementStatusColor(
                      selectedSettlement.status
                    )}`}
                  >
                    {selectedSettlement.status.charAt(0).toUpperCase() +
                      selectedSettlement.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">
                  ₹{selectedSettlement.netAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Settlement Amount</div>
              </div>
            </div>

            {/* Settlement Details */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Transaction Details
                </h4>
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono text-sm">
                      {selectedSettlement.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">
                      {selectedSettlement.customer}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">
                      {selectedSettlement.service}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Date:</span>
                    <span className="font-medium">
                      {selectedSettlement.transactionDate}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Payment Details
                </h4>
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Settlement Date:</span>
                    <span className="font-medium">
                      {selectedSettlement.settlementDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Mode:</span>
                    <span className="font-medium">
                      {selectedSettlement.paymentMode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Account:</span>
                    <span className="font-mono text-sm">
                      {selectedSettlement.bankAccount}
                    </span>
                  </div>
                  {selectedSettlement.utrNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">UTR Number:</span>
                      <span className="font-mono text-sm">
                        {selectedSettlement.utrNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Breakdown */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Amount Breakdown
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Amount:</span>
                  <span className="font-semibold">
                    ₹{selectedSettlement.grossAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee (15%):</span>
                  <span className="font-semibold text-red-600">
                    -₹{selectedSettlement.platformFee}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Net Settlement:</span>
                  <span className="font-semibold text-green-600">
                    ₹{selectedSettlement.netAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Processing Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">
                Processing Information
              </h4>
              <p className="text-sm text-yellow-800">
                Settlements are processed within 4 business days after service
                completion. Current processing time:{" "}
                {selectedSettlement.processingDays} days.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show authentication error
  if (!isAuthenticated || !isSeller) {
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
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You must be logged in as a seller to access this page.
            </p>
          </Card>
        </div>
      </div>
    );
  }

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
            <p className="text-gray-600">Loading orders...</p>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    const isBusinessSetupError = error.includes('business profile');
    
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
            <div className="mb-4">
              {isBusinessSetupError ? (
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto" />
              ) : (
                <XCircle className="w-12 h-12 text-red-500 mx-auto" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {isBusinessSetupError ? 'Business Setup Required' : 'Error Loading Orders'}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              {isBusinessSetupError ? (
                <Button 
                  onClick={() => {
                    // Navigate to business setup - you might need to implement this
                    console.log('Navigate to business setup');
                  }} 
                  variant="primary"
                >
                  Set Up Business Profile
                </Button>
              ) : (
                <Button onClick={fetchOrdersAndStats} variant="primary">
                  Retry
                </Button>
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
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Service Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your orders and track settlement payments
              </p>
            </div>

            <div className="flex space-x-3">
              {activeTab === "settlements" && (
                <Button
                  variant="outline"
                  onClick={downloadSettlementReport}
                  className="flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              )}

              <div className="bg-green-100 px-3 py-2 rounded-lg">
                <div className="text-sm text-green-800">
                  <span className="font-medium">Total Earnings:</span> ₹
                  {orderStats?.totalEarnings?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "orders"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Order Management ({orderStats?.total || 0})
            </button>
            <button
              onClick={() => setActiveTab("settlements")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "settlements"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CreditCard className="w-4 h-4 inline mr-2" />
              Settlement Tracker ({settlementStats?.total || 0})
            </button>
          </div>

          {activeTab === "orders" && (orderStats?.pending || 0) > 0 && (
            <div className="bg-orange-100 border border-orange-200 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  <span className="font-medium">{orderStats?.pending || 0}</span>{" "}
                  orders awaiting your response
                </span>
              </div>
            </div>
          )}

          {activeTab === "settlements" && (settlementStats?.pending || 0) > 0 && (
            <div className="bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  ₹{settlementStats?.totalPending?.toLocaleString() || '0'} pending
                  settlement
                </span>
              </div>
            </div>
          )}
        </div>

        {activeTab === "orders" ? (
          <>
            {/* Order Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {orderStats?.total || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {orderStats?.pending || 0}
                    </div>
                    <div className="text-sm text-gray-600">Pending Orders</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{orderStats?.totalRevenue?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Banknote className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{orderStats?.totalEarnings?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600">Your Earnings</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    icon={Search}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <div className="flex space-x-1">
                    {[
                      { key: "all", label: "All", count: orderStats?.total || 0 },
                      {
                        key: "pending",
                        label: "Pending",
                        count: orderStats?.pending || 0,
                      },
                      {
                        key: "confirmed",
                        label: "Confirmed",
                        count: orderStats?.confirmed || 0,
                      },
                      {
                        key: "in-progress",
                        label: "In Progress",
                        count: orderStats?.inProgress || 0,
                      },
                      {
                        key: "completed",
                        label: "Completed",
                        count: orderStats?.completed || 0,
                      },
                      {
                        key: "cancelled",
                        label: "Cancelled",
                        count: orderStats?.cancelled || 0,
                      },
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => setSelectedStatus(filter.key)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          selectedStatus === filter.key
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

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {order.service}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                            order.status
                          )}`}
                        >
                          {getOrderStatusIcon(order.status)}
                          <span className="ml-1">
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1).replace("-", " ")}
                          </span>
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            order.priority
                          )}`}
                        >
                          {order.priority.charAt(0).toUpperCase() +
                            order.priority.slice(1)}{" "}
                          Priority
                        </span>
                        {order.requiresApproval && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Bell className="w-3 h-3 mr-1" />
                            Approval Required
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Order ID:</span>
                          <div className="font-medium text-gray-900">
                            {order.id}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Customer:</span>
                          <div className="font-medium text-gray-900">
                            {order.customer.name}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Service Type:</span>
                          <div className="font-medium text-gray-900">
                            {order.serviceType}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Event Date:</span>
                          <div className="font-medium text-gray-900">
                            {order.eventDate}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Your Earnings:</span>
                          <div className="font-medium text-green-600">
                            ₹{order.netAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{order.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{order.estimatedDuration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Ordered {order.orderDate}</span>
                          </div>
                        </div>

                        {order.notifications &&
                          order.notifications.length > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-blue-600">
                              <Bell className="w-3 h-3" />
                              <span>
                                {order.notifications.length} notifications
                              </span>
                            </div>
                          )}
                      </div>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {order.description || order.specialRequests}
                      </p>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </Button>

                      {order.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              handleOrderAction(order.id, "approve")
                            }
                            className="flex-1"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleOrderAction(
                                order.id,
                                "reject",
                                "Cannot accommodate this request"
                              )
                            }
                            className="flex-1"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {order.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOrderAction(order.id, "start")}
                        >
                          <Package className="w-3 h-3 mr-1" />
                          Start Work
                        </Button>
                      )}

                      {order.status === "in-progress" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            handleOrderAction(order.id, "complete")
                          }
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Mark Complete
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(`tel:${order.customer.phone}`)
                        }
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Settlement Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {settlementStats?.total || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Settlements
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{settlementStats?.totalPending?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600">Pending Amount</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{settlementStats?.totalCompleted?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600">Settled Amount</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {settlementStats?.processing || 0}
                    </div>
                    <div className="text-sm text-gray-600">Processing</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Settlement Info */}
            <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Settlement Information
              </h3>
              <p className="text-blue-800 text-sm">
                🕒 Settlements are processed automatically within 4 business
                days after service completion.
                <br />
                💳 Payments are transferred directly to your registered bank
                account.
                <br />
                📧 You'll receive email notifications for each settlement status
                update.
              </p>
            </Card>

            {/* Settlement Filters */}
            <Card className="p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search settlements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    icon={Search}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <div className="flex space-x-1">
                    {[
                      {
                        key: "all",
                        label: "All",
                        count: settlementStats?.total || 0,
                      },
                      {
                        key: "pending",
                        label: "Pending",
                        count: settlementStats?.pending || 0,
                      },
                      {
                        key: "processing",
                        label: "Processing",
                        count: settlementStats?.processing || 0,
                      },
                      {
                        key: "completed",
                        label: "Completed",
                        count: settlementStats?.completed || 0,
                      },
                      {
                        key: "on-hold",
                        label: "On Hold",
                        count: settlementStats?.onHold || 0,
                      },
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => setSelectedStatus(filter.key)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          selectedStatus === filter.key
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

            {/* Settlements List */}
            <div className="space-y-4">
              {filteredSettlements.map((settlement) => (
                <motion.div
                  key={settlement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {settlement.service}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSettlementStatusColor(
                            settlement.status
                          )}`}
                        >
                          {getSettlementStatusIcon(settlement.status)}
                          <span className="ml-1">
                            {settlement.status.charAt(0).toUpperCase() +
                              settlement.status.slice(1).replace("-", " ")}
                          </span>
                        </span>
                        {settlement.settlementType === "manual_review" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Manual Review
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Settlement ID:</span>
                          <div className="font-medium text-gray-900">
                            {settlement.id}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Order ID:</span>
                          <div className="font-medium text-gray-900">
                            {settlement.orderId}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Customer:</span>
                          <div className="font-medium text-gray-900">
                            {settlement.customer}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Transaction Date:
                          </span>
                          <div className="font-medium text-gray-900">
                            {settlement.transactionDate}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Net Amount:</span>
                          <div className="font-medium text-green-600">
                            ₹{settlement.netAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Gross Amount:</span>
                            <div className="font-medium text-gray-900">
                              ₹{settlement.grossAmount.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Platform Fee:</span>
                            <div className="font-medium text-red-600">
                              -₹{settlement.platformFee}
                            </div>
                          </div>
                          {settlement.taxDeduction > 0 && (
                            <div>
                              <span className="text-gray-600">
                                Tax Deduction:
                              </span>
                              <div className="font-medium text-red-600">
                                -₹{settlement.taxDeduction}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <CreditCard className="w-4 h-4" />
                            <span>{settlement.paymentMode}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Banknote className="w-4 h-4" />
                            <span>{settlement.bankAccount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{settlement.settlementCycle}</span>
                          </div>
                          {settlement.utrNumber && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>UTR: {settlement.utrNumber}</span>
                            </div>
                          )}
                        </div>

                        {settlement.status === "pending" &&
                          settlement.estimatedSettlement && (
                            <div className="text-xs text-blue-600">
                              Expected: {settlement.estimatedSettlement}
                            </div>
                          )}

                        {settlement.status === "on-hold" &&
                          settlement.holdReason && (
                            <div className="text-xs text-yellow-600">
                              Hold: {settlement.holdReason}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSettlement(settlement)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      {settlement.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log("Download receipt")}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {((activeTab === "orders" && filteredOrders.length === 0) ||
          (activeTab === "settlements" &&
            filteredSettlements.length === 0)) && (
          <Card className="p-12 text-center">
            {activeTab === "orders" ? (
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            ) : (
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab === "orders" ? "orders" : "settlements"} found
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : activeTab === "orders"
                ? "Customer orders will appear here when they book your services."
                : "Settlement records will appear here after you complete services."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ServiceManagement;
