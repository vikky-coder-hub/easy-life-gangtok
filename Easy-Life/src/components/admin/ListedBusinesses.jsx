import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Store,
  Search,
  Filter,
  CheckCircle,
  X,
  Eye,
  MapPin,
  Phone,
  ArrowLeft,
  AlertTriangle,
  Ban,
  Clock,
  FileText,
  Calendar,
  Shield,
  ShieldOff,
  Loader,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import apiService from "../../utils/api";

const ListedBusinesses = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [listedBusinesses, setListedBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch listed businesses from backend
  useEffect(() => {
    fetchListedBusinesses();
  }, []);

  const fetchListedBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch both approved and banned businesses for the listed businesses section
      const [approvedResponse, bannedResponse] = await Promise.all([
        apiService.getAllBusinesses({ status: 'approved' }),
        apiService.getAllBusinesses({ status: 'banned' })
      ]);
      
      if (approvedResponse.success && bannedResponse.success) {
        // Combine approved and banned businesses
        const approvedBusinesses = approvedResponse.data.businesses || [];
        const bannedBusinesses = bannedResponse.data.businesses || [];
        const allBusinesses = [...approvedBusinesses, ...bannedBusinesses];
        
        console.log('Fetched businesses:', {
          approved: approvedBusinesses.length,
          banned: bannedBusinesses.length,
          total: allBusinesses.length,
          businesses: allBusinesses.map(b => ({ 
            id: b._id, 
            name: b.name || b.title, 
            status: b.status,
            images: b.images,
            imageCount: b.images ? b.images.length : 0
          }))
        });
        
        // Debug first business with images
        const businessWithImages = allBusinesses.find(b => b.images && b.images.length > 0);
        if (businessWithImages) {
          console.log('=== SAMPLE BUSINESS WITH IMAGES ===');
          console.log('Business:', businessWithImages.name || businessWithImages.title);
          console.log('Images array:', businessWithImages.images);
          console.log('First image:', businessWithImages.images[0]);
        }
        
        // Map backend status to listingStatus for UI consistency
        const businessesWithListingStatus = allBusinesses.map((business) => ({
          ...business,
          listingStatus: business.status === 'banned' ? 'banned' : 'active',
          banReason: business.status === 'banned' ? 'Business has been banned by admin' : null,
        }));
        setListedBusinesses(businessesWithListingStatus);
      } else {
        setError('Failed to load listed businesses');
      }
    } catch (err) {
      console.error('Error fetching listed businesses:', err);
      setError(err.message || 'Failed to load listed businesses');
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = listedBusinesses.filter((business) => {
    const businessName = business.title || business.name || '';
    const businessCategory = business.subcategory || business.category || '';
    const matchesSearch =
      businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      businessCategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || business.listingStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleBusinessAction = async (businessId, action, reason = "") => {
    try {
      let response;
      let message = "";

      switch (action) {
        case "ban":
          response = await apiService.banBusiness(businessId, reason);
          message = "Business has been banned and removed from listings";
          break;
        case "temp_ban":
          response = await apiService.tempBanBusiness(businessId, reason);
          message = "Business has been temporarily banned for review";
          break;
        case "unban":
          response = await apiService.unbanBusiness(businessId);
          message = "Business has been unbanned and restored to listings";
          break;
        default:
          message = "Action completed";
      }

      if (response && response.success) {
        alert(message);
        // Refresh the listed businesses list to reflect the changes
        await fetchListedBusinesses();
        
        // Update selectedBusiness if it's the same business that was acted upon
        if (selectedBusiness && selectedBusiness._id === businessId) {
          const updatedBusiness = {
            ...selectedBusiness,
            status: action === 'unban' ? 'approved' : 'banned',
            listingStatus: action === 'unban' ? 'active' : 'banned',
            banReason: action === 'unban' ? null : (reason || 'Business has been banned by admin')
          };
          setSelectedBusiness(updatedBusiness);
        }
      } else {
        alert("Failed to perform action. Please try again.");
      }
    } catch (error) {
      console.error('Error performing business action:', error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  const getListingStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "banned":
        return "bg-red-100 text-red-800";
      case "temp_banned":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getListingStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "banned":
        return <Ban className="w-4 h-4" />;
      case "temp_banned":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getListingStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "banned":
        return "Banned";
      case "temp_banned":
        return "Temporary Ban";
      default:
        return status;
    }
  };

  if (selectedBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedBusiness(null)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listed Businesses
          </button>

          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Business Details & Management
              </h1>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getListingStatusColor(
                    selectedBusiness.listingStatus
                  )}`}
                >
                  {getListingStatusIcon(selectedBusiness.listingStatus)}
                  <span className="ml-1">
                    {getListingStatusText(selectedBusiness.listingStatus)}
                  </span>
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Business Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Business Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name
                      </label>
                      <p className="text-gray-900">{selectedBusiness.title || selectedBusiness.name || 'Unnamed Business'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <p className="text-gray-900 capitalize">
                        {selectedBusiness.category} -{" "}
                        {selectedBusiness.subcategory}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900">{selectedBusiness.contact?.phone || selectedBusiness.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp
                      </label>
                      <p className="text-gray-900">
                        {selectedBusiness.whatsapp || "Not provided"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <p className="text-gray-900">
                        {selectedBusiness.location?.address || selectedBusiness.address || 'Address not provided'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <p className="text-gray-900">
                        {selectedBusiness.description}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Services & Pricing */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Services & Pricing
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Services Offered
                      </label>
                      <div className="flex flex-wrap gap-2">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pricing Range
                        </label>
                        <p className="text-gray-900">
                          {selectedBusiness.pricing}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Business Hours */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Business Hours
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedBusiness.businessHours || selectedBusiness.hours || {}).map(
                      ([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="text-gray-700 capitalize">{day}</span>
                          <span className="text-gray-900 font-medium">
                            {typeof hours === 'object' 
                              ? (hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed')
                              : hours || 'Not specified'
                            }
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </Card>

                {/* Performance & Reviews */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Performance Metrics
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedBusiness.rating}
                      </div>
                      <div className="text-sm text-gray-500">
                        Average Rating
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedBusiness.reviewCount}
                      </div>
                      <div className="text-sm text-gray-500">Total Reviews</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedBusiness.verified ? "✓" : "⚠"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Verification Status
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar - Admin Actions & Info */}
              <div className="space-y-6">
                {/* Current Status */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Listing Status
                  </h3>
                  <div className="space-y-4">
                    <div
                      className={`flex items-center px-3 py-2 rounded-lg ${getListingStatusColor(
                        selectedBusiness.listingStatus
                      )}`}
                    >
                      {getListingStatusIcon(selectedBusiness.listingStatus)}
                      <span className="ml-2 font-medium">
                        {getListingStatusText(selectedBusiness.listingStatus)}
                      </span>
                    </div>

                    {selectedBusiness.banReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-red-900 mb-1">
                          Ban Reason:
                        </p>
                        <p className="text-sm text-red-800">
                          {selectedBusiness.banReason}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Approved Date:</span>
                        <span className="text-gray-900">
                          {selectedBusiness.approvedDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Original Submission:
                        </span>
                        <span className="text-gray-900">
                          {selectedBusiness.submittedDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Admin Actions */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Admin Actions
                  </h3>
                  <div className="space-y-3">
                    {selectedBusiness.listingStatus === "active" && (
                      <>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-orange-600 border-orange-300 hover:bg-orange-50"
                          icon={Clock}
                          onClick={() => {
                            const reason = prompt("Reason for temporary ban:");
                            if (reason)
                              handleBusinessAction(
                                selectedBusiness._id,
                                "temp_ban",
                                reason
                              );
                          }}
                        >
                          Temporary Ban
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
                          icon={Ban}
                          onClick={() => {
                            const reason = prompt("Reason for ban:");
                            if (reason)
                              handleBusinessAction(
                                selectedBusiness._id,
                                "ban",
                                reason
                              );
                          }}
                        >
                          Ban Business
                        </Button>
                      </>
                    )}

                    {(selectedBusiness.listingStatus === "banned" ||
                      selectedBusiness.listingStatus === "temp_banned") && (
                      <Button
                        variant="primary"
                        className="w-full justify-start"
                        icon={Shield}
                        onClick={() =>
                          handleBusinessAction(selectedBusiness._id, "unban")
                        }
                      >
                        Unban Business
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Documents */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Submitted Documents
                  </h3>
                  <div className="space-y-2">
                    {selectedBusiness.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 text-sm">{doc}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600"
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Business Images */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Business Images
                    <span className="ml-2 text-sm text-gray-500">
                      ({selectedBusiness.images ? selectedBusiness.images.length : 0} images)
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedBusiness.images && selectedBusiness.images.length > 0 ? (
                      selectedBusiness.images
                        .slice(0, 4)
                        .map((image, index) => {
                          console.log('=== ADMIN BUSINESS IMAGE DEBUG ===');
                          console.log('Image object:', image);
                          console.log('Image URL:', image.url || image);
                          
                          // Handle both object format {url, publicId} and string format
                          const imageUrl = typeof image === 'object' ? image.url : image;
                          
                          if (!imageUrl) {
                            console.warn('No URL found for image:', image);
                            return null;
                          }
                          
                          return (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Business ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(imageUrl, "_blank")}
                                onError={(e) => {
                                  console.error('Image failed to load:', imageUrl);
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5QzEwLjM0IDkgOSAxMC4zNCA5IDEyQzkgMTMuNjYgMTAuMzQgMTUgMTIgMTVDMTMuNjYgMTUgMTUgMTMuNjYgMTUgMTJDMTUgMTAuMzQgMTMuNjYgOSAxMiA5WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                                  e.target.className = 'w-full h-20 object-cover rounded-lg bg-gray-100 flex items-center justify-center';
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', imageUrl);
                                }}
                              />
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                {index + 1}
                              </div>
                            </div>
                          );
                        }).filter(Boolean)
                    ) : (
                      <div className="col-span-2 text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <Store className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <div className="text-sm">No images uploaded</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Business owner hasn't uploaded any images yet
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedBusiness.images && selectedBusiness.images.length > 4 && (
                    <div className="mt-3 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View all {selectedBusiness.images.length} images
                      </button>
                    </div>
                  )}
                </Card>
              </div>
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
              Listed Businesses
            </h1>
            <p className="text-gray-600">
              Manage approved businesses and their listing status
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  {
                    listedBusinesses.filter((b) => b.listingStatus === "active")
                      .length
                  }{" "}
                  active listings
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search listed businesses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="temp_banned">Temporary Ban</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <Loader className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Loading listed businesses...
                    </h3>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Error loading businesses
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <Button onClick={fetchListedBusinesses} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : filteredBusinesses.length === 0 ? (
                  <div className="text-center py-12">
                    <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No businesses found
                    </h3>
                    <p className="text-gray-500">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "No approved businesses available"}
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
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getListingStatusColor(
                                business.listingStatus
                              )}`}
                            >
                              {getListingStatusIcon(business.listingStatus)}
                              <span className="ml-1">
                                {getListingStatusText(business.listingStatus)}
                              </span>
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
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {business.contact?.phone || 'Phone not provided'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-gray-600">
                                Rating: {business.rating || 'N/A'} ({business.reviewCount || 0} reviews)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Approved: {business.approvalDate ? new Date(business.approvalDate).toLocaleDateString() : new Date(business.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={Eye}
                            onClick={() => {
                              console.log('=== SELECTING BUSINESS FOR DETAILS ===');
                              console.log('Business object:', business);
                              console.log('Business images:', business.images);
                              console.log('Images count:', business.images ? business.images.length : 0);
                              if (business.images && business.images.length > 0) {
                                console.log('First image:', business.images[0]);
                                console.log('Image type:', typeof business.images[0]);
                              }
                              setSelectedBusiness(business);
                            }}
                          >
                            Manage
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
              <h3 className="font-semibold text-gray-900 mb-4">
                Listing Stats
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      listedBusinesses.filter(
                        (b) => b.listingStatus === "active"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-500">Active Listings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {
                      listedBusinesses.filter(
                        (b) => b.listingStatus === "temp_banned"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-500">Temporary Bans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {
                      listedBusinesses.filter(
                        (b) => b.listingStatus === "banned"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-500">Banned</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {[...new Set(listedBusinesses.map((b) => b.category))].map(
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
                          listedBusinesses.filter(
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

export default ListedBusinesses;
