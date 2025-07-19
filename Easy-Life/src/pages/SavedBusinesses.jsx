import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  Phone,
  ExternalLink,
  Search,
  Filter,
  Grid,
  List,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import apiService from "../utils/api";

const SavedBusinesses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [savedBusinesses, setSavedBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch saved businesses from backend
  useEffect(() => {
    const fetchSavedBusinesses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getSavedBusinesses();
        
        if (response.success) {
          setSavedBusinesses(response.data.savedBusinesses || []);
          setCategories(response.data.categoryStats || []);
        } else {
          setError(response.message || 'Failed to fetch saved businesses');
        }
      } catch (err) {
        console.error('Error fetching saved businesses:', err);
        setError('Failed to load saved businesses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedBusinesses();
  }, []);

  // Handle unsaving a business
  const handleRemoveFromSaved = async (businessId, e) => {
    e.stopPropagation();
    try {
      const response = await apiService.unsaveBusiness(businessId);
      if (response.success) {
        // Remove from local state
        setSavedBusinesses(prev => prev.filter(business => business.id !== businessId));
        // Update categories
        const updatedBusinesses = savedBusinesses.filter(business => business.id !== businessId);
        updateCategories(updatedBusinesses);
      } else {
        console.error('Failed to unsave business:', response.message);
      }
    } catch (err) {
      console.error('Error unsaving business:', err);
    }
  };

  // Update categories based on current businesses
  const updateCategories = (businesses) => {
    const categoryMap = {};
    businesses.forEach(business => {
      if (categoryMap[business.category]) {
        categoryMap[business.category]++;
      } else {
        categoryMap[business.category] = 1;
      }
    });

    const updatedCategories = [
      { id: "all", label: "All Categories", count: businesses.length },
      ...Object.keys(categoryMap).map(cat => ({
        id: cat,
        label: cat,
        count: categoryMap[cat]
      }))
    ];
    setCategories(updatedCategories);
  };

  const filteredBusinesses = savedBusinesses.filter((business) => {
    const matchesCategory =
      selectedCategory === "all" || business.category === selectedCategory;
    const businessName = business.name || business.business || '';
    const businessSpeciality = business.speciality || business.description || '';
    const matchesSearch =
      businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      businessSpeciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const BusinessCard = ({ business, index }) => (
    <div>
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div
          onClick={() => navigate(`/business/${business.businessId || business.id}`)}
          className="flex items-start space-x-4"
        >
          {/* Business Image */}
          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={business.image || business.profilePicture}
              alt={business.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 items-center justify-center text-white font-bold text-lg hidden">
              {business.name?.charAt(0) || business.business?.charAt(0)}
            </div>
          </div>

          {/* Business Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {business.name || business.business}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {business.speciality || business.description}
                </p>
              </div>
              <button
                onClick={(e) => handleRemoveFromSaved(business.id, e)}
                className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors"
                title="Remove from saved"
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Rating and Status */}
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-700">
                  {business.rating}
                </span>
                <span className="text-sm text-gray-500">
                  ({business.reviewCount} reviews)
                </span>
              </div>
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full ${
                  business.isOpen !== false
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {business.isOpen !== false ? "Open" : "Closed"}
              </span>
            </div>

            {/* Location and Services */}
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {business.address || business.location}
              </div>
              <div className="flex flex-wrap gap-1">
                {(business.services || []).slice(0, 2).map((service, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded"
                  >
                    {service}
                  </span>
                ))}
                {(business.services || []).length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{(business.services || []).length - 2} more
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">
                Saved on {business.savedDate || business.savedAt || 'Recently'}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${business.phone}`);
                  }}
                  icon={Phone}
                  className="text-xs"
                >
                  Call
                </Button>
                <Button variant="primary" size="sm" className="text-xs">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Saved Businesses - Easy Life Gangtok</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Saved Businesses
                </h1>
                <p className="text-gray-600 text-sm">
                  {filteredBusinesses.length} saved businesses
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input
                  icon={Search}
                  placeholder="Search saved businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary-100 text-primary-600 border border-primary-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {loading ? (
              <Card className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading your saved businesses...</p>
              </Card>
            ) : error ? (
              <Card className="p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error Loading Saved Businesses
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="primary"
                >
                  Try Again
                </Button>
              </Card>
            ) : filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((business, index) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  index={index}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No saved businesses found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filters"
                    : "You haven't saved any businesses yet"}
                </p>
                <Button onClick={() => navigate("/listings")} variant="primary">
                  Discover Businesses
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SavedBusinesses;
