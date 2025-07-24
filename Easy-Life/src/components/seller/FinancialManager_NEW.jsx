import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  FileText,
  PieChart,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Percent,
  ArrowLeft,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import apiService from "../../utils/api";

const FinancialManager = ({ onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState(null);

  // Fetch financial data from backend
  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSellerFinancialAnalytics(selectedPeriod);
      
      if (response.success) {
        setFinancialData(response.data);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError('Failed to load financial data');
      // Use fallback data
      setFinancialData(getMockFinancialData());
    } finally {
      setLoading(false);
    }
  };

  // Mock financial data (fallback)
  const getMockFinancialData = () => ({
    financialOverview: {
      currentMonth: {
        totalRevenue: 42500,
        platformFees: 6375,
        netRevenue: 36125,
        totalExpenses: 8500,
        profit: 27625,
        transactions: 28,
        averageOrderValue: 1518,
      },
      previousMonth: {
        totalRevenue: 38200,
        platformFees: 5730,
        netRevenue: 32470,
        totalExpenses: 7800,
        profit: 24670,
        transactions: 24,
        averageOrderValue: 1592,
      },
    },
    monthlyData: [
      { month: "Jan", revenue: 42500, expenses: 8500, profit: 27625 },
      { month: "Dec", revenue: 38200, expenses: 7800, profit: 24670 },
      { month: "Nov", revenue: 35800, expenses: 7200, profit: 22400 },
      { month: "Oct", revenue: 40100, expenses: 8100, profit: 25200 },
      { month: "Sep", revenue: 36900, expenses: 7600, profit: 23100 },
      { month: "Aug", revenue: 39500, expenses: 8000, profit: 24875 },
    ],
    transactions: [
      {
        id: "T001",
        invoiceNumber: "INV-2025-001",
        date: "Jan 15, 2025",
        customerName: "Rajesh Kumar",
        service: "Electrical Repair",
        amount: 2500,
        platformFee: 375,
        netAmount: 2125,
        status: "completed",
        paymentMethod: "UPI",
      },
      {
        id: "T002",
        invoiceNumber: "INV-2025-002",
        date: "Jan 14, 2025",
        customerName: "Priya Sharma",
        service: "Home Cleaning",
        amount: 1800,
        platformFee: 270,
        netAmount: 1530,
        status: "completed",
        paymentMethod: "Card",
      },
    ]
  });

  // Get the actual financial data or fallback to mock data
  const financialOverview = financialData?.financialOverview || getMockFinancialData().financialOverview;
  const monthlyData = financialData?.monthlyData || getMockFinancialData().monthlyData;
  const transactions = financialData?.transactions || getMockFinancialData().transactions;

  const calculateChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "pending":
        return AlertCircle;
      case "failed":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadInvoice = (transaction) => {
    console.log("Downloading invoice for:", transaction.invoiceNumber);
    alert(`Invoice ${transaction.invoiceNumber} would be downloaded`);
  };

  const handleDownloadReport = (type) => {
    console.log("Downloading report:", type);
    alert(`${type} report would be downloaded`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchFinancialData}>Try Again</Button>
          </Card>
        </div>
      </div>
    );
  }

  // Transaction detail view
  if (selectedTransaction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="outline" onClick={() => setSelectedTransaction(null)} className="mb-6">
            ← Back to Transactions
          </Button>
          
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
                <p className="text-gray-600">{selectedTransaction.invoiceNumber}</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => handleDownloadInvoice(selectedTransaction)} icon={Download}>
                  Download Invoice
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Customer Name:</span>
                    <span className="ml-2 font-medium">{selectedTransaction.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Service:</span>
                    <span className="ml-2 font-medium">{selectedTransaction.service}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">{selectedTransaction.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="ml-2 font-medium">{selectedTransaction.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Amount</span>
                    <span className="font-medium">₹{selectedTransaction.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-medium text-red-600">-₹{selectedTransaction.platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Net Amount</span>
                    <span className="font-bold text-green-600">₹{selectedTransaction.netAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Overview Tab
  if (activeTab === "overview") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button variant="outline" onClick={onBack} className="mb-4" icon={ArrowLeft}>
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
                <p className="text-gray-600 mt-1">Track revenue, expenses, and financial performance</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => handleDownloadReport("financial")} icon={Download}>
                  Download Report
                </Button>
                <Button variant="primary" onClick={() => setActiveTab("transactions")} icon={FileText}>
                  View Transactions
                </Button>
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Period:</span>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {["today", "week", "month"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 text-sm rounded-md transition-all capitalize ${
                        selectedPeriod === period
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {period === "month" ? "This Month" : period === "week" ? "This Week" : "Today"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Total Revenue",
                value: financialOverview.currentMonth.totalRevenue,
                previous: financialOverview.previousMonth.totalRevenue,
                icon: DollarSign,
                color: "bg-green-100 text-green-600",
                format: "currency",
              },
              {
                label: "Net Revenue",
                value: financialOverview.currentMonth.netRevenue,
                previous: financialOverview.previousMonth.netRevenue,
                icon: TrendingUp,
                color: "bg-blue-100 text-blue-600",
                format: "currency",
              },
              {
                label: "Platform Fees",
                value: financialOverview.currentMonth.platformFees,
                previous: financialOverview.previousMonth.platformFees,
                icon: Percent,
                color: "bg-orange-100 text-orange-600",
                format: "currency",
              },
              {
                label: "Profit",
                value: financialOverview.currentMonth.profit,
                previous: financialOverview.previousMonth.profit,
                icon: PieChart,
                color: "bg-purple-100 text-purple-600",
                format: "currency",
              },
            ].map((metric, index) => {
              const change = calculateChange(metric.value, metric.previous);
              const isPositive = change >= 0;

              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {metric.format === "currency" ? `₹${metric.value.toLocaleString()}` : metric.value}
                        </p>
                        <div className="flex items-center mt-2">
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isPositive ? "+" : ""}{change.toFixed(1)}%
                          </span>
                          <span className="text-sm text-gray-500 ml-1">vs last period</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${metric.color}`}>
                        <metric.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Trend */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={data.month} className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900 w-8">{data.month}</span>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-2 w-32">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(data.revenue / 50000) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{data.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{data.transactions || 0} txns</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Transactions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("transactions")}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 4).map((transaction) => {
                  const StatusIcon = getStatusIcon(transaction.status);
                  return (
                    <div key={transaction.id} className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(transaction.status).split(" ")[0]}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{transaction.customerName}</p>
                        <p className="text-xs text-gray-500">₹{transaction.netAmount.toLocaleString()} • {transaction.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Transactions Tab
  if (activeTab === "transactions") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button variant="outline" onClick={onBack} className="mb-4" icon={ArrowLeft}>
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                <p className="text-gray-600 mt-1">Detailed view of all payments and transactions</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setActiveTab("overview")}>
                  Back to Overview
                </Button>
                <Button variant="primary" onClick={() => handleDownloadReport("transactions")} icon={Download}>
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={Search}
                />
              </div>
            </div>
          </Card>

          {/* Transactions Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice / Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer / Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => {
                    const StatusIcon = getStatusIcon(transaction.status);
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.invoiceNumber}</div>
                            <div className="text-sm text-gray-500">{transaction.date}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.customerName}</div>
                            <div className="text-sm text-gray-500">{transaction.service}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{transaction.platformFee.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{transaction.netAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedTransaction(transaction)}
                              icon={Eye}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadInvoice(transaction)}
                              icon={Download}
                            >
                              Invoice
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search criteria." : "You haven't made any transactions yet."}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default FinancialManager;
