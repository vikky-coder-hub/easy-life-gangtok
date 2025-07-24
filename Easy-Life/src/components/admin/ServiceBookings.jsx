import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  MapPin,
  Phone,
  Mail,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Eye,
  Edit,
  Ban,
  MessageCircle,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import apiService from "../../utils/api";

const ServiceBookings = ({ onBack }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getAllBookings({
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          search: searchTerm || undefined,
          page: 1,
          limit: 100 // Get more bookings for admin view
        });
        
        if (response.success) {
          setBookings(response.data.bookings || []);
        } else {
          setError('Failed to load bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [selectedStatus, searchTerm]);

  // Since we're filtering on the backend, filteredBookings is just the bookings array
  const filteredBookings = bookings;

  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    totalRevenue: bookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.amount, 0),
    totalCommission: bookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.commission, 0),
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const handleAdminAction = async (bookingId, action) => {
    try {
      setActionLoading(true);
      let response;
      
      switch (action) {
        case 'force-cancel':
          const reason = prompt('Enter cancellation reason:');
          if (!reason) return;
          response = await apiService.adminCancelBooking(bookingId, reason);
          break;
        case 'confirm':
          response = await apiService.confirmBooking(bookingId);
          break;
        case 'complete':
          response = await apiService.completeBooking(bookingId);
          break;
        case 'refund':
          if (confirm('Are you sure you want to initiate a refund for this booking?')) {
            // Note: This would need a specific refund API endpoint
            console.log('Refund action would be implemented here');
            alert('Refund functionality would be implemented with payment gateway integration');
          }
          return;
        case 'view-seller':
          // Navigate to seller profile - this would need routing implementation
          console.log('Navigate to seller profile:', bookingId);
          alert('Seller profile navigation would be implemented');
          return;
        case 'contact':
          // Open contact modal or navigate to communication - this would need additional UI
          console.log('Contact parties for booking:', bookingId);
          alert('Contact functionality would be implemented');
          return;
        default:
          console.log(`Unknown action: ${action}`);
          return;
      }
      
      if (response && response.success) {
        alert(`Action ${action} completed successfully`);
        // Refresh bookings data
        window.location.reload();
      } else {
        alert(`Failed to ${action} booking`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
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
              Back to Admin Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Service Bookings</h1>
          </div>
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading service bookings...</p>
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
              Back to Admin Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Service Bookings</h1>
          </div>
          <Card className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Bookings
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="primary">
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedBooking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedBooking(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Service Bookings
            </Button>
          </div>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Booking #{selectedBooking.id}
                </h3>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedBooking.status)}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      selectedBooking.status
                    )}`}
                  >
                    {selectedBooking.status.charAt(0).toUpperCase() +
                      selectedBooking.status.slice(1)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                      selectedBooking.paymentStatus
                    )}`}
                  >
                    Payment:{" "}
                    {selectedBooking.paymentStatus.charAt(0).toUpperCase() +
                      selectedBooking.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  ₹{selectedBooking.amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Commission: ₹{selectedBooking.commission}
                </div>
              </div>
            </div>

            {/* Service & Seller Information */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Service Provider
                </h4>
                <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">
                      {selectedBooking.seller.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a
                      href={`mailto:${selectedBooking.seller.email}`}
                      className="text-primary-600 hover:underline"
                    >
                      {selectedBooking.seller.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`tel:${selectedBooking.seller.phone}`}
                      className="text-primary-600 hover:underline"
                    >
                      {selectedBooking.seller.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Customer Information
                </h4>
                <div className="space-y-3 bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">
                      {selectedBooking.customer.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a
                      href={`mailto:${selectedBooking.customer.email}`}
                      className="text-primary-600 hover:underline"
                    >
                      {selectedBooking.customer.email}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`tel:${selectedBooking.customer.phone}`}
                      className="text-primary-600 hover:underline"
                    >
                      {selectedBooking.customer.phone}
                    </a>
                  </div>
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
                  <span className="text-gray-700">
                    {selectedBooking.service}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">
                    {selectedBooking.eventDate}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">
                    {selectedBooking.eventTime}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">
                    {selectedBooking.location}
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
                {selectedBooking.specialRequests}
              </p>
            </div>

            {/* Payment Information */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Payment Information
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-sm">
                    {selectedBooking.paymentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Amount:</span>
                  <span className="font-semibold">
                    ₹{selectedBooking.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Platform Commission (15%):
                  </span>
                  <span className="font-semibold text-blue-600">
                    ₹{selectedBooking.commission}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Seller Payout:</span>
                  <span className="font-semibold">
                    ₹
                    {(
                      selectedBooking.amount - selectedBooking.commission
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Reason (if cancelled) */}
            {selectedBooking.status === "cancelled" &&
              selectedBooking.cancellationReason && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Cancellation Reason
                  </h4>
                  <p className="text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                    {selectedBooking.cancellationReason}
                  </p>
                </div>
              )}

            {/* Admin Actions */}
            <div className="flex flex-wrap gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() =>
                  handleAdminAction(selectedBooking.id, "view-seller")
                }
              >
                <Eye className="w-4 h-4 mr-2" />
                View Seller Profile
              </Button>

              {selectedBooking.status !== "cancelled" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    handleAdminAction(selectedBooking.id, "force-cancel")
                  }
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Force Cancel
                </Button>
              )}

              {selectedBooking.paymentStatus === "paid" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    handleAdminAction(selectedBooking.id, "refund")
                  }
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Initiate Refund
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => handleAdminAction(selectedBooking.id, "contact")}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Parties
              </Button>
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
            Back to Admin Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Service Bookings</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage all service bookings across the platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {bookingStats.total}
                </div>
                <div className="text-sm text-gray-600">Total Bookings</div>
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
                  ₹{bookingStats.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{bookingStats.totalCommission.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Platform Commission</div>
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
                  {bookingStats.pending}
                </div>
                <div className="text-sm text-gray-600">Pending Bookings</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Status Distribution */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Booking Status Distribution
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {bookingStats.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {bookingStats.confirmed}
              </div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {bookingStats.completed}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {bookingStats.cancelled}
              </div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search bookings..."
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
                  { key: "all", label: "All", count: bookingStats.total },
                  {
                    key: "pending",
                    label: "Pending",
                    count: bookingStats.pending,
                  },
                  {
                    key: "confirmed",
                    label: "Confirmed",
                    count: bookingStats.confirmed,
                  },
                  {
                    key: "completed",
                    label: "Completed",
                    count: bookingStats.completed,
                  },
                  {
                    key: "cancelled",
                    label: "Cancelled",
                    count: bookingStats.cancelled,
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

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      #{booking.id}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        booking.paymentStatus
                      )}`}
                    >
                      {booking.paymentStatus.charAt(0).toUpperCase() +
                        booking.paymentStatus.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-600">Service:</span>
                      <div className="font-medium text-gray-900">
                        {booking.service}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Provider:</span>
                      <div className="font-medium text-gray-900">
                        {booking.seller.name}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <div className="font-medium text-gray-900">
                        {booking.customer.name}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <div className="font-medium text-gray-900">
                        ₹{booking.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{booking.eventDate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Booked {booking.bookingDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    View Details
                  </Button>
                  {booking.status === "pending" && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      Manage
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Service bookings will appear here when customers book services."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ServiceBookings;
