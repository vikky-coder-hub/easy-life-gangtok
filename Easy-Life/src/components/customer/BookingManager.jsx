import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Search,
  Eye,
  Star,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../utils/api";

const BookingManager = ({ onBack }) => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  // Backend integration states
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bookings from backend
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCustomerBookings();
      if (response.success) {
        setBookings(response.data || []);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Filter and calculate stats based on real data
  const filteredBookings = (bookings || []).filter((booking) => {
    if (!booking) return false;
    
    const matchesSearch =
      (booking.businessId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.service || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking._id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || booking.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const bookingStats = {
    total: bookings?.length || 0,
    pending: bookings?.filter((b) => b?.status === "pending").length || 0,
    confirmed: bookings?.filter((b) => b?.status === "confirmed").length || 0,
    completed: bookings?.filter((b) => b?.status === "completed").length || 0,
    cancelled: bookings?.filter((b) => b?.status === "cancelled").length || 0,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return AlertCircle;
      case "confirmed":
        return CheckCircle;
      case "completed":
        return CheckCircle;
      case "cancelled":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
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
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancelBooking = () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    // In real app, this would make an API call
    console.log(`Cancelling booking ${selectedBooking._id}:`, cancelReason);

    setShowCancelModal(false);
    setSelectedBooking(null);
    setCancelReason("");

    // Show success message
    alert(
      "Booking cancelled successfully. You will receive a confirmation email shortly."
    );
  };

  const handleDownloadReceipt = (booking) => {
    // In real app, this would download the actual receipt
    console.log(`Downloading receipt for booking ${booking._id}`);
    alert(`Receipt for booking ${booking._id} would be downloaded`);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (selectedBooking) {
    const StatusIcon = getStatusIcon(selectedBooking.status);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => setSelectedBooking(null)}
              >
                ← Back to Bookings
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Booking Details
              </h1>
            </div>

            {/* Booking Header */}
            <div className="flex items-start space-x-4 mb-6 pb-6 border-b">
              <img
                src={selectedBooking.businessId?.profileImage || '/api/placeholder/64/64'}
                alt={selectedBooking.businessId?.name || 'Business'}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {selectedBooking.businessId?.name || 'Unknown Business'}
                </h2>
                <p className="text-gray-600 mb-2">{selectedBooking.service}</p>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      selectedBooking.status
                    )}`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {selectedBooking.status.charAt(0).toUpperCase() +
                      selectedBooking.status.slice(1)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                      selectedBooking.paymentStatus
                    )}`}
                  >
                    {selectedBooking.paymentStatus.charAt(0).toUpperCase() +
                      selectedBooking.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{selectedBooking.amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
            </div>

            {/* Service Details */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Service Information
                </h3>
                <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-600">
                        Service Date:
                      </span>
                      <span className="ml-2 font-medium">
                        {selectedBooking.eventDate ? new Date(selectedBooking.eventDate).toLocaleDateString() : 'Not set'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-600">Time:</span>
                      <span className="ml-2 font-medium">
                        {selectedBooking.eventTime || 'Not set'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="ml-2 font-medium">
                        {selectedBooking.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Service Provider
                </h3>
                <div className="space-y-3 bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">
                      {selectedBooking.businessId?.name || 'Not available'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`tel:${selectedBooking.businessId?.phone || ''}`}
                      className="text-primary-600 hover:underline"
                    >
                      {selectedBooking.businessId?.phone || 'Not available'}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a
                      href={`mailto:${selectedBooking.businessId?.email || ''}`}
                      className="text-primary-600 hover:underline"
                    >
                      {selectedBooking.businessId?.email || 'Not available'}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Special Requests
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {selectedBooking.specialRequests}
              </p>
            </div>

            {/* Payment Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Payment Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-sm">
                    {selectedBooking.paymentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">
                    ₹{selectedBooking.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(
                      selectedBooking.paymentStatus
                    )}`}
                  >
                    {selectedBooking.paymentStatus.charAt(0).toUpperCase() +
                      selectedBooking.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Info */}
            {selectedBooking.status === "cancelled" &&
              selectedBooking.cancellationReason && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Cancellation Information
                  </h3>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-red-700 mb-2">
                      {selectedBooking.cancellationReason}
                    </p>
                    {selectedBooking.cancellationDate && (
                      <p className="text-sm text-red-600">
                        Cancelled on: {selectedBooking.cancellationDate}
                      </p>
                    )}
                  </div>
                </div>
              )}

            {/* Review Section */}
            {selectedBooking.status === "completed" &&
              selectedBooking.rating && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Your Review
                  </h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {renderStars(selectedBooking.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({selectedBooking.rating}/5)
                      </span>
                    </div>
                    <p className="text-gray-700">{selectedBooking.review}</p>
                  </div>
                </div>
              )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-6 border-t">
              {selectedBooking.paymentStatus === 'paid' && (
                <Button
                  variant="outline"
                  onClick={() => handleDownloadReceipt(selectedBooking)}
                  icon={Download}
                >
                  Download Receipt
                </Button>
              )}

              {selectedBooking.canCancel &&
                selectedBooking.status !== "cancelled" && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelModal(true)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Cancel Booking
                  </Button>
                )}

              {selectedBooking.status === "completed" &&
                !selectedBooking.rating && (
                  <Button variant="primary">Write Review</Button>
                )}
            </div>
          </Card>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Cancel Booking
                </h3>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this booking? Please provide a
                reason:
              </p>

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={3}
              />

              <div className="flex space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1"
                >
                  Keep Booking
                </Button>
                <Button
                  onClick={handleCancelBooking}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          </div>
        )}
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
              ← Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading your bookings...</span>
          </div>
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
              ← Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          </div>
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load bookings
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchBookings} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your service bookings
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-gray-900">
              {bookingStats.total}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {bookingStats.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {bookingStats.confirmed}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {bookingStats.completed}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </Card>

          <Card className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {bookingStats.cancelled}
            </div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </Card>
        </div>

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
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-500 mb-4">
                {selectedStatus === "all" 
                  ? "You haven't made any bookings yet."
                  : `No ${selectedStatus} bookings found.`}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking, index) => {
              if (!booking) return null;
              const StatusIcon = getStatusIcon(booking.status);

              return (
                <div
                  key={booking._id || `booking-${index}`}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <img
                      src={booking.businessId?.profileImage || '/api/placeholder/64/64'}
                      alt={booking.businessId?.name || 'Business'}
                      className="w-16 h-16 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.businessId?.name || 'Unknown Business'}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-2">{booking.service}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'Not set'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{booking.eventTime || 'Not set'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      ₹{booking.amount.toLocaleString()}
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(
                        booking.paymentStatus
                      )}`}
                    >
                      {booking.paymentStatus.charAt(0).toUpperCase() +
                        booking.paymentStatus.slice(1)}
                    </span>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedBooking(booking)}
                        icon={Eye}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(BookingManager);
