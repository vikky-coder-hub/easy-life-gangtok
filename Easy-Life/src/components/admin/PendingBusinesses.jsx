import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Store,
  Search,
  CheckCircle,
  X,
  Eye,
  MapPin,
  Phone,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  Clock,
  Loader,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import apiService from "../../utils/api";

const PendingBusinesses = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pending businesses from backend
  useEffect(() => {
    fetchPendingBusinesses();
  }, []);

  const fetchPendingBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAllBusinesses({ status: 'pending' });
      
      if (response.success) {
        setPendingBusinesses(response.data.businesses || []);
      } else {
        setError('Failed to load pending businesses');
      }
    } catch (err) {
      console.error('Error fetching pending businesses:', err);
      setError(err.message || 'Failed to load pending businesses');
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = pendingBusinesses.filter((business) => {
    const businessName = business.title || business.name || '';
    const businessCategory = business.subcategory || business.category || '';
    const matchesSearch =
      businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      businessCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAction = async (businessId, action) => {
    try {
      let response;
      let message = "";

      switch (action) {
        case "approve":
          response = await apiService.approveBusiness(businessId);
          message = "Business has been approved and is now live on the platform";
          break;
        case "reject":
          response = await apiService.rejectBusiness(businessId);
          message = "Business application has been rejected";
          break;
        case "under_review":
          response = await apiService.updateBusinessStatus(businessId, 'under_review');
          message = "Business has been marked as under review for further verification";
          break;
        default:
          message = "Action completed";
      }

      if (response && response.success) {
        alert(message);
        // Refresh the pending businesses list
        await fetchPendingBusinesses();
        // Close the detail view
        setSelectedBusiness(null);
      } else {
        alert("Failed to perform action. Please try again.");
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert("An error occurred. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (submittedDate) => {
    const daysSinceSubmission = Math.floor(
      (new Date() - new Date(submittedDate)) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceSubmission > 7) return "text-red-600";
    if (daysSinceSubmission > 3) return "text-yellow-600";
    return "text-green-600";
  };

  if (selectedBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedBusiness(null)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pending Businesses
          </button>

          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Business Review Details
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  selectedBusiness.status
                )}`}
              >
                {selectedBusiness.status.replace("_", " ").toUpperCase()}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Business Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Business Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Business Name
                      </label>
                      <p className="text-gray-900">{selectedBusiness.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Category
                      </label>
                      <p className="text-gray-900 capitalize">
                        {selectedBusiness.category} -{" "}
                        {selectedBusiness.subcategory}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Description
                      </label>
                      <p className="text-gray-900">
                        {selectedBusiness.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {selectedBusiness.address}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {selectedBusiness.phone}
                      </span>
                    </div>
                    {selectedBusiness.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Email
                        </label>
                        <p className="text-gray-900">
                          {selectedBusiness.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Services & Pricing
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Services Offered
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedBusiness.services?.map((service, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedBusiness.pricing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Pricing Range
                        </label>
                        <p className="text-gray-900">
                          {selectedBusiness.pricing}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submission Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Submission Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Submitted Date
                        </label>
                        <p className="text-gray-900">
                          {selectedBusiness.submittedDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Required Documents
                  </h3>
                  <div className="space-y-2">
                    {selectedBusiness.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{doc}</span>
                        </div>
                        <span className="text-green-600 text-sm">
                          ✓ Uploaded
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Business Images
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedBusiness.images
                      ?.slice(0, 4)
                      .map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Business ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <Button
                variant="outline"
                icon={X}
                onClick={() => handleAction(selectedBusiness._id, "reject")}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Reject
              </Button>
              <Button
                variant="outline"
                icon={Clock}
                onClick={() =>
                  handleAction(selectedBusiness._id, "under_review")
                }
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Under Review
              </Button>
              <Button
                variant="primary"
                icon={CheckCircle}
                onClick={() => handleAction(selectedBusiness._id, "approve")}
              >
                Approve Business
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
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pending Businesses
            </h1>
            <p className="text-gray-600">
              Review, approve, or mark new business registrations for further
              verification
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">
                  {pendingBusinesses.length} businesses awaiting approval
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Info */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Business Review Workflow
                </h3>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Pending</span> →{" "}
                  <span className="font-medium">Under Review</span> (when you
                  need more time to verify documents) →{" "}
                  <span className="font-medium">Approve/Reject</span>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Use "Under Review" status when you need additional time to
                  verify business documents or contact the business owner.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search pending businesses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <Loader className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Loading pending businesses...
                    </h3>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Error loading businesses
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <Button onClick={fetchPendingBusinesses} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : filteredBusinesses.length === 0 ? (
                  <div className="text-center py-12">
                    <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No pending businesses found
                    </h3>
                    <p className="text-gray-500">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "All businesses have been reviewed"}
                    </p>
                  </div>
                ) : (
                  filteredBusinesses.map((business) => (
                    <motion.div
                      key={business._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {business.title || business.name || 'Unnamed Business'}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                business.status
                              )}`}
                            >
                              PENDING
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {business.description}
                          </p>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {business.location?.address || business.location?.city || 'Location not specified'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span
                                className={`${getPriorityColor(
                                  business.submittedDate || business.createdAt
                                )}`}
                              >
                                Submitted: {business.submittedDate ? new Date(business.submittedDate).toLocaleDateString() : new Date(business.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Store className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 capitalize">
                                {business.category}{business.subcategory ? ` - ${business.subcategory}` : ''}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {business.contact?.phone || 'Phone not provided'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={Eye}
                            onClick={() => setSelectedBusiness(business)}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {pendingBusinesses.length}
                  </div>
                  <div className="text-sm text-gray-500">Pending Approval</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {
                      pendingBusinesses.filter((business) => {
                        const daysSinceSubmission = Math.floor(
                          (new Date() - new Date(business.submittedDate)) /
                            (1000 * 60 * 60 * 24)
                        );
                        return daysSinceSubmission > 7;
                      }).length
                    }
                  </div>
                  <div className="text-sm text-gray-500">Overdue (7+ days)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      pendingBusinesses.filter((business) => {
                        const daysSinceSubmission = Math.floor(
                          (new Date() - new Date(business.submittedDate)) /
                            (1000 * 60 * 60 * 24)
                        );
                        return daysSinceSubmission <= 3;
                      }).length
                    }
                  </div>
                  <div className="text-sm text-gray-500">Recent (3 days)</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {[...new Set(pendingBusinesses.map((b) => b.category))].map(
                  (category) => (
                    <div
                      key={category}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600 capitalize">
                        {category}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {
                          pendingBusinesses.filter(
                            (b) => b.category === category
                          ).length
                        }
                      </span>
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingBusinesses;
