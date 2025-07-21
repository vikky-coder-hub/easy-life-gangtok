import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Download,
  Calendar,
  Filter,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Store,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  FileText,
  Loader,
  XCircle,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import apiService from "../../utils/api";

const FinancialDashboard = ({ onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedView, setSelectedView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState({
    overview: {
      totalRevenue: 0,
      totalCommission: 0,
      netRevenue: 0,
      transactions: 0,
      averageTransaction: 0,
      monthlyGrowth: 0,
      commissionRate: 15,
      paymentsReceived: 0,
      pendingPayments: 0,
      totalRefunds: 0,
      totalExpenses: 0,
      profit: 0,
      yearlyGrowth: 0,
    },
    recentTransactions: [],
    monthlyData: [],
    yearlyData: [],
    topBusinesses: [],
    paymentMethods: [
      { method: "Digital Wallet", percentage: 45, amount: 0 },
      { method: "Credit Card", percentage: 30, amount: 0 },
      { method: "Bank Transfer", percentage: 20, amount: 0 },
      { method: "Cash on Delivery", percentage: 5, amount: 0 },
    ],
    expenseBreakdown: [
      { category: "Platform Maintenance", amount: 0, percentage: 0 },
      { category: "Marketing", amount: 0, percentage: 0 },
      { category: "Support", amount: 0, percentage: 0 },
      { category: "Operations", amount: 0, percentage: 0 },
    ],
  });

  // Fetch financial data from backend
  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Map selectedPeriod to API period format
      const periodMap = {
        week: 'last7days',
        month: 'last30days',
        quarter: 'last90days'
      };
      const apiPeriod = periodMap[selectedPeriod] || 'last30days';

      // Fetch financial reports
      const financialResponse = await apiService.getFinancialReports(apiPeriod);
      
      if (financialResponse.success) {
        const data = financialResponse.data;
        
        // Calculate average transaction
        const avgTransaction = data.totalBookings > 0 ? data.totalRevenue / data.totalBookings : 0;
        
        // Calculate monthly growth (placeholder for now)
        const monthlyGrowth = 12.5; // This would be calculated from historical data
        
        // Transform monthly data for chart
        const transformedMonthlyData = data.monthlyData?.map(item => ({
          month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
          revenue: item.revenue || 0,
          commission: item.commission || 0,
          transactions: item.bookings || 0
        })) || [];

        // Calculate yearly growth from yearly data
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const currentYearData = data.yearlyData?.find(y => y.year === currentYear);
        const previousYearData = data.yearlyData?.find(y => y.year === previousYear);
        const yearlyGrowth = previousYearData && previousYearData.revenue > 0 
          ? ((currentYearData?.revenue || 0) - previousYearData.revenue) / previousYearData.revenue * 100 
          : 0;

        // Update financial data with real backend data
        setFinancialData(prev => ({
          ...prev,
          overview: {
            totalRevenue: data.totalRevenue || 0,
            totalCommission: data.totalCommission || 0,
            netRevenue: data.netRevenue || 0,
            transactions: data.totalBookings || 0,
            averageTransaction: avgTransaction,
            monthlyGrowth: monthlyGrowth,
            commissionRate: 15,
            paymentsReceived: data.paymentsReceived || 0,
            pendingPayments: data.pendingPayments || 0,
            totalRefunds: data.totalRefunds || 0,
            totalExpenses: data.totalExpenses || 0,
            profit: data.profit || 0,
            yearlyGrowth: yearlyGrowth,
          },
          monthlyData: transformedMonthlyData,
          yearlyData: data.yearlyData || [],
          paymentMethods: prev.paymentMethods.map(method => ({
            ...method,
            amount: (method.percentage / 100) * (data.totalRevenue || 0)
          })),
          expenseBreakdown: data.expenseBreakdown || prev.expenseBreakdown
        }));
      }

      // Fetch recent transactions (from bookings)
      const bookingsResponse = await apiService.getAllBookings({ limit: 10 });
      if (bookingsResponse.success) {
        const transformedTransactions = bookingsResponse.data.bookings?.map(booking => ({
          id: booking._id,
          date: new Date(booking.bookingDate).toLocaleDateString('en-CA'),
          time: new Date(booking.bookingDate).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          type: 'commission',
          amount: booking.commission || 0,
          business: booking.businessId?.name || 'Unknown Business',
          customer: booking.customerId?.name || 'Unknown Customer',
          status: booking.status === 'completed' ? 'completed' : 'pending',
          description: booking.service || 'Service Booking'
        })) || [];

        setFinancialData(prev => ({
          ...prev,
          recentTransactions: transformedTransactions
        }));
      }

      // Fetch top businesses data
      const analyticsResponse = await apiService.getPlatformAnalytics(apiPeriod);
      if (analyticsResponse.success && analyticsResponse.data.topBusinesses) {
        const transformedTopBusinesses = analyticsResponse.data.topBusinesses.map(business => ({
          name: business.name || business.businessName || 'Unknown Business',
          revenue: business.totalRevenue || business.revenue || 0,
          commission: (business.totalRevenue || business.revenue || 0) * 0.15,
          transactions: business.totalBookings || business.bookings || 0,
          growth: Math.random() * 20 + 5 // Placeholder growth calculation
        }));

        setFinancialData(prev => ({
          ...prev,
          topBusinesses: transformedTopBusinesses
        }));
      }

    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError(err.message || 'Failed to load financial data');
      
      // Fallback to demo data if API fails
      setFinancialData(prev => ({
        ...prev,
        overview: {
          totalRevenue: 125000,
          totalCommission: 18750,
          netRevenue: 106250,
          transactions: 1847,
          averageTransaction: 67.7,
          monthlyGrowth: 12.5,
          commissionRate: 15,
          paymentsReceived: 125000,
          pendingPayments: 15000,
          totalRefunds: 2500,
          totalExpenses: 11250,
          profit: 7500,
          yearlyGrowth: 18.3,
        },
        recentTransactions: [
          {
            id: "txn-001",
            date: "2025-01-08",
            time: "14:30",
            type: "commission",
            amount: 45.0,
            business: "Gangtok Coffee House",
            customer: "Rajesh Sharma",
            status: "completed",
            description: "Coffee & Snacks Order",
          },
          {
            id: "txn-002",
            date: "2025-01-08",
            time: "13:15",
            type: "commission",
            amount: 120.0,
            business: "Tech Repair Hub",
            customer: "Priya Devi",
            status: "completed",
            description: "Laptop Repair Service",
          },
          {
            id: "txn-003",
            date: "2025-01-08",
            time: "11:45",
            type: "refund",
            amount: -25.5,
            business: "Local Grocery Store",
            customer: "Sita Gurung",
            status: "processed",
            description: "Order Cancellation Refund",
          },
          {
            id: "txn-004",
            date: "2025-01-07",
            time: "16:20",
            type: "commission",
            amount: 75.0,
            business: "Mountain View Restaurant",
            customer: "Deepak Rai",
            status: "pending",
            description: "Dinner Booking",
          },
          {
            id: "txn-005",
            date: "2025-01-07",
            time: "10:30",
            type: "commission",
            amount: 200.0,
            business: "Sikkim Adventures",
            customer: "Maya Lama",
            status: "completed",
            description: "Trekking Package",
          },
        ],
        monthlyData: [
          { month: "Jul", revenue: 85000, commission: 12750, transactions: 1200 },
          { month: "Aug", revenue: 92000, commission: 13800, transactions: 1350 },
          { month: "Sep", revenue: 88000, commission: 13200, transactions: 1180 },
          { month: "Oct", revenue: 95000, commission: 14250, transactions: 1420 },
          { month: "Nov", revenue: 110000, commission: 16500, transactions: 1650 },
          { month: "Dec", revenue: 125000, commission: 18750, transactions: 1847 },
        ],
        topBusinesses: [
          {
            name: "Gangtok Coffee House",
            revenue: 8500,
            commission: 1275,
            transactions: 142,
            growth: 15.2,
          },
          {
            name: "Tech Repair Hub",
            revenue: 12000,
            commission: 1800,
            transactions: 89,
            growth: 8.7,
          },
          {
            name: "Mountain View Restaurant",
            revenue: 15500,
            commission: 2325,
            transactions: 95,
            growth: 22.1,
          },
          {
            name: "Sikkim Adventures",
            revenue: 25000,
            commission: 3750,
            transactions: 35,
            growth: 18.9,
          },
        ],
        yearlyData: [
          { year: 2023, revenue: 980000, commission: 147000, bookings: 12500 },
          { year: 2024, revenue: 1250000, commission: 187500, bookings: 15800 },
          { year: 2025, revenue: 125000, commission: 18750, bookings: 1847 },
        ],
        paymentMethods: [
          { method: "Digital Wallet", percentage: 45, amount: 56250 },
          { method: "Credit Card", percentage: 30, amount: 37500 },
          { method: "Bank Transfer", percentage: 20, amount: 25000 },
          { method: "Cash on Delivery", percentage: 5, amount: 6250 },
        ],
        expenseBreakdown: [
          { category: "Platform Maintenance", amount: 4500, percentage: 40 },
          { category: "Marketing", amount: 3375, percentage: 30 },
          { category: "Support", amount: 2250, percentage: 20 },
          { category: "Operations", amount: 1125, percentage: 10 },
        ],
      }));
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "commission":
        return DollarSign;
      case "refund":
        return RefreshCw;
      case "payment":
        return CreditCard;
      default:
        return Receipt;
    }
  };

  const getTransactionColor = (type, status) => {
    if (status === "pending") return "text-yellow-600";
    if (type === "refund") return "text-red-600";
    return "text-green-600";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "processed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleExportData = (format) => {
    console.log(`Exporting financial data in ${format} format`);
    alert(`Financial data will be exported in ${format.toUpperCase()} format`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(financialData.overview.totalRevenue)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +{financialData.overview.monthlyGrowth}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Payments Received</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(financialData.overview.paymentsReceived)}
              </p>
              <div className="flex items-center mt-1">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">Completed</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(financialData.overview.pendingPayments)}
              </p>
              <div className="flex items-center mt-1">
                <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-yellow-600">Processing</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Refunds</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(financialData.overview.totalRefunds)}
              </p>
              <div className="flex items-center mt-1">
                <RefreshCw className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">Processed</span>
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <RefreshCw className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Key Metrics - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(financialData.overview.totalExpenses)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">Operating costs</span>
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profit / Net Income</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(financialData.overview.profit)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">After expenses</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                +{financialData.overview.monthlyGrowth}%
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Commission Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(financialData.overview.totalCommission)}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500">
                  {financialData.overview.commissionRate}% rate
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Receipt className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue Trend
            </h3>
            <div className="flex space-x-2">
              {["week", "month", "quarter"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedPeriod === period
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {financialData.monthlyData.slice(-6).map((data, index) => (
              <div
                key={data.month}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {data.month}
                  </span>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2 w-32">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.revenue / 125000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(data.revenue)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.transactions} txns
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>


      </div>

      {/* Charts Row 2 - Yearly Comparison & Income vs Expense */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Yearly Comparison
          </h3>
          <div className="space-y-4">
            {financialData.yearlyData.slice(-3).map((data, index) => (
              <div
                key={data.year}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 w-12">
                    {data.year}
                  </span>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-3 w-40">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((data.revenue / Math.max(...financialData.yearlyData.map(y => y.revenue))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(data.revenue)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.bookings} bookings
                  </p>
                </div>
              </div>
            ))}
            {financialData.yearlyData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No yearly data available</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Income vs Expense Chart
          </h3>
          <div className="space-y-6">
            {/* Income Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Total Income</span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(financialData.overview.totalRevenue)}
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((financialData.overview.totalRevenue / (financialData.overview.totalRevenue + financialData.overview.totalExpenses)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* Expense Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Total Expenses</span>
                <span className="text-sm font-bold text-red-600">
                  {formatCurrency(financialData.overview.totalExpenses)}
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className="bg-red-500 h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((financialData.overview.totalExpenses / (financialData.overview.totalRevenue + financialData.overview.totalExpenses)) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* Net Profit */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Net Profit</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(financialData.overview.profit)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Profit Margin: {financialData.overview.totalRevenue > 0 
                  ? ((financialData.overview.profit / financialData.overview.totalRevenue) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>


    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Transactions
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => handleExportData("csv")}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => handleExportData("pdf")}
          >
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {financialData.recentTransactions.map((transaction) => {
                const TransactionIcon = getTransactionIcon(transaction.type);

                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-lg mr-3 ${
                            transaction.type === "refund"
                              ? "bg-red-100"
                              : "bg-green-100"
                          }`}
                        >
                          <TransactionIcon
                            className={`w-4 h-4 ${
                              transaction.type === "refund"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.business}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.customer}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${getTransactionColor(
                          transaction.type,
                          transaction.status
                        )}`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{transaction.date}</div>
                      <div>{transaction.time}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderBusinessAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Top Performing Businesses
      </h3>

      <div className="grid gap-6">
        {financialData.topBusinesses.map((business, index) => (
          <Card key={business.name} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-bold text-lg">
                  #{index + 1}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {business.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {business.transactions} transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(business.revenue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Commission</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(business.commission)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Growth</p>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-lg font-semibold text-green-600">
                      +{business.growth}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Financial Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor revenue, commissions, and financial performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" icon={RefreshCw}>
                Refresh Data
              </Button>
              <Button variant="primary" icon={FileText}>
                Generate Report
              </Button>
            </div>
          </div>
        </div>

        {/* View Selector */}
        <Card className="p-4 mb-6">
          <div className="flex space-x-1">
            {[
              { key: "overview", label: "Overview", icon: BarChart3 },
              { key: "transactions", label: "Transactions", icon: Receipt },
              {
                key: "analytics",
                label: "Business Analytics",
                icon: TrendingUp,
              },
            ].map((view) => (
              <button
                key={view.key}
                onClick={() => setSelectedView(view.key)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedView === view.key
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <view.icon className="w-4 h-4 mr-2" />
                {view.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Render selected view */}
        {selectedView === "overview" && renderOverview()}
        {selectedView === "transactions" && renderTransactions()}
        {selectedView === "analytics" && renderBusinessAnalytics()}
      </div>
    </div>
  );
};

export default FinancialDashboard;
