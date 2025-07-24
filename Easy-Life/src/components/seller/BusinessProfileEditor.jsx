import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Upload,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Camera,
  Edit,
  Plus,
  X,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import apiService from "../../utils/api";
import { compressImages, validateImageFile } from "../../utils/imageCompression";

const BusinessProfileEditor = ({ onBack }) => {
  const [businessData, setBusinessData] = useState({
    title: "Himalayan Delights Catering",
    businessName: "Himalayan Delights Catering",
    category: "Food & Catering",
    description:
      "Professional catering services for all occasions. We specialize in traditional Himalayan cuisine and modern fusion dishes.",
    location: {
      address: "MG Road, Near Mall, Gangtok, Sikkim 737101"
    },
    contact: {
      phone: "+91 98765 43210",
      email: "info@himalayandelights.com",
      website: "www.himalayandelights.com"
    },
    businessHours: {
      monday: { open: "09:00", close: "21:00", isOpen: true },
      tuesday: { open: "09:00", close: "21:00", isOpen: true },
      wednesday: { open: "09:00", close: "21:00", isOpen: true },
      thursday: { open: "09:00", close: "21:00", isOpen: true },
      friday: { open: "09:00", close: "22:00", isOpen: true },
      saturday: { open: "09:00", close: "22:00", isOpen: true },
      sunday: { open: "10:00", close: "20:00", isOpen: true },
    },
    services: [
      "Wedding Catering",
      "Corporate Events",
      "Private Parties",
      "Home Delivery",
    ],
    tags: [
      "Momo",
      "Thukpa",
      "Gundruk",
      "Sel Roti",
      "Traditional Sweets",
    ],
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [businessImages, setBusinessImages] = useState([]);

  // Mobile detection useEffect
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load existing business images on component mount
  useEffect(() => {
    const loadBusinessImages = async () => {
      try {
        console.log('Loading existing business images...');
        const businessResponse = await apiService.getMyBusiness();
        if (businessResponse.success && businessResponse.data && businessResponse.data.images) {
          const existingImages = businessResponse.data.images.map(img => ({
            id: img.publicId || img._id,
            url: img.url,
            publicId: img.publicId
          }));
          setBusinessImages(existingImages);
          console.log('Loaded existing images:', existingImages);
        }
      } catch (error) {
        console.error('Error loading business images:', error);
        // Don't show error to user as this is just for loading existing images
      }
    };

    loadBusinessImages();
  }, []);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested properties like "location.address" or "contact.phone"
      const [parent, child] = field.split('.');
      setBusinessData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setBusinessData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleHoursChange = (day, field, value) => {
    setBusinessData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }));
  };

  const addService = (newService) => {
    if (newService.trim()) {
      setBusinessData((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
    }
  };

  const removeService = (index) => {
    setBusinessData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const addSpecialty = (newSpecialty) => {
    if (newSpecialty.trim()) {
      setBusinessData((prev) => ({
        ...prev,
        tags: [...prev.tags, newSpecialty.trim()],
      }));
    }
  };

  const removeSpecialty = (index) => {
    setBusinessData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    console.log("Saving business data:", businessData);
    // In real app, this would make API call
    alert("Business profile updated successfully!");
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      console.log('=== FRONTEND IMAGE UPLOAD DEBUG ===');
      console.log('Files selected:', files.length);

      // Validate files
      for (const file of files) {
        validateImageFile(file);
        console.log('Validating file:', file.name, 'Size:', (file.size / 1024).toFixed(2), 'KB');
      }

      // Compress images
      console.log('Compressing images...');
      const compressedFiles = await compressImages(files, 700);
      console.log('Compression complete. Files:', compressedFiles.length);
      
      // Get business ID from user's business data
      let businessId = null;
      try {
        const businessResponse = await apiService.getMyBusiness();
        if (businessResponse.success && businessResponse.data) {
          businessId = businessResponse.data._id;
          console.log('Found business ID:', businessId);
        }
      } catch (error) {
        console.error('Error getting business ID:', error);
        throw new Error('Unable to find your business. Please make sure you have a business profile.');
      }

      if (!businessId) {
        throw new Error('Business ID not found. Please make sure you have a business profile.');
      }

      // Upload to backend/Cloudinary
      console.log('Uploading to backend with business ID:', businessId);
      console.log('Compressed files to upload:', compressedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      })));
      
      const response = await apiService.updateBusinessPhotos(businessId, compressedFiles);
      
      if (response.success) {
        console.log('Upload successful. Response:', response);
        console.log('Response data:', response.data);
        console.log('Images in response:', response.data.images);
        
        // Update local state with the uploaded images from Cloudinary
        const uploadedImages = response.data.images || [];
        const formattedImages = uploadedImages.map(img => ({
          id: img.publicId || img._id,
          url: img.url,
          publicId: img.publicId
        }));
        
        console.log('Formatted images for state:', formattedImages);
        setBusinessImages(formattedImages);
        alert('Images uploaded successfully to Cloudinary!');
      } else {
        console.error('Upload failed. Response:', response);
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Error: ' + (err.message || 'Failed to upload images'));
    } finally {
      setUploadingImages(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDeleteImage = async (imageIndex) => {
    try {
      const imageToDelete = businessImages[imageIndex];
      if (!imageToDelete || !imageToDelete.publicId) {
        // If no publicId, just remove from local state
        setBusinessImages(prev => prev.filter((_, index) => index !== imageIndex));
        return;
      }

      console.log('=== DELETE IMAGE DEBUG ===');
      console.log('Deleting image:', imageToDelete);

      // Get business ID
      const businessResponse = await apiService.getMyBusiness();
      if (!businessResponse.success || !businessResponse.data) {
        throw new Error('Unable to find your business.');
      }

      const businessId = businessResponse.data._id;
      console.log('Business ID:', businessId);

      // Delete from backend/Cloudinary
      const response = await apiService.deleteBusinessImage(businessId, imageToDelete.publicId);
      
      if (response.success) {
        console.log('Image deleted successfully from Cloudinary');
        // Update local state
        setBusinessImages(prev => prev.filter((_, index) => index !== imageIndex));
        alert('Image deleted successfully!');
      } else {
        throw new Error(response.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Image delete error:', error);
      alert('Error: ' + (error.message || 'Failed to delete image'));
    }
  };



  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact & Location" },
    { id: "hours", label: "Business Hours" },
    { id: "services", label: "Services & Specialties" },
    { id: "photos", label: "Photos & Media" },
  ];

  // Removed loading and error states to match original implementation

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Edit Profile
              </h1>
              <p className="text-sm text-gray-500">
                {businessData.businessName}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            icon={Save}
          >
            Save
          </Button>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="mt-4 flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Business Profile
              </h1>
              <p className="text-gray-600 mt-1">
                Update your business information and settings
              </p>
            </div>
          </div>

          {/* Desktop Tab Navigation */}
          <div className="flex space-x-1 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden p-4">
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <Input
                    type="text"
                    value={businessData.title}
                    onChange={(e) =>
                      handleInputChange("title", e.target.value)
                    }
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={businessData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Food & Catering">Food & Catering</option>
                    <option value="Home Services">Home Services</option>
                    <option value="Beauty & Wellness">Beauty & Wellness</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={businessData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    placeholder="Describe your business..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    type="text"
                    value={businessData.location.address}
                    onChange={(e) =>
                      handleInputChange("location.address", e.target.value)
                    }
                    placeholder="Business address"
                    icon={MapPin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={businessData.contact.phone}
                    onChange={(e) => handleInputChange("contact.phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    icon={Phone}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={businessData.contact.email}
                    onChange={(e) => handleInputChange("contact.email", e.target.value)}
                    placeholder="business@example.com"
                    icon={Mail}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    type="url"
                    value={businessData.contact.website}
                    onChange={(e) =>
                      handleInputChange("contact.website", e.target.value)
                    }
                    placeholder="www.yourbusiness.com"
                    icon={Globe}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Business Hours Tab */}
        {activeTab === "hours" && (
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Business Hours
              </h3>
              <div className="space-y-4">
                {Object.entries(businessData.businessHours).map(
                  ([day, hours]) => (
                    <div key={day} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {day}
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hours.isOpen}
                            onChange={(e) =>
                              handleHoursChange(
                                day,
                                "isOpen",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      {hours.isOpen && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Open
                            </label>
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) =>
                                handleHoursChange(day, "open", e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Close
                            </label>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) =>
                                handleHoursChange(day, "close", e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
              <div className="space-y-3">
                {businessData.services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm">{service}</span>
                    <button
                      onClick={() => removeService(index)}
                      className="p-1 hover:bg-gray-200 rounded text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newService = prompt("Enter service name:");
                    if (newService) addService(newService);
                  }}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
                >
                  <Plus className="w-4 h-4 mx-auto mb-1" />
                  Add Service
                </button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Specialties</h3>
              <div className="space-y-3">
                {businessData.tags.map((specialty, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm">{specialty}</span>
                    <button
                      onClick={() => removeSpecialty(index)}
                      className="p-1 hover:bg-gray-200 rounded text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newSpecialty = prompt("Enter specialty:");
                    if (newSpecialty) addSpecialty(newSpecialty);
                  }}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
                >
                  <Plus className="w-4 h-4 mx-auto mb-1" />
                  Add Specialty
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === "photos" && (
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Business Photos
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {Array.from({ length: 6 }, (_, i) => {
                  const image = businessImages[i];
                  return (
                    <div
                      key={i}
                      className="relative aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden group"
                    >
                      {image ? (
                        <>
                          <img
                            src={image.url}
                            alt={`Business photo ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleDeleteImage(i)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
              <input
                type="file"
                id="mobile-image-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="w-full" 
                icon={Upload}
                onClick={() => document.getElementById('mobile-image-upload').click()}
                disabled={uploadingImages}
              >
                {uploadingImages ? 'Uploading...' : 'Upload Photos'}
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Desktop Content */}
      <div className="hidden lg:block">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <Input
                      type="text"
                      value={businessData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={businessData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Food & Catering">Food & Catering</option>
                      <option value="Home Services">Home Services</option>
                      <option value="Beauty & Wellness">
                        Beauty & Wellness
                      </option>
                      <option value="Automotive">Automotive</option>
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={businessData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    placeholder="Describe your business..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === "contact" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      type="text"
                      value={businessData.location.address}
                      onChange={(e) =>
                        handleInputChange("location.address", e.target.value)
                      }
                      placeholder="Business address"
                      icon={MapPin}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      value={businessData.contact.phone}
                      onChange={(e) =>
                        handleInputChange("contact.phone", e.target.value)
                      }
                      placeholder="+91 98765 43210"
                      icon={Phone}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={businessData.contact.email}
                      onChange={(e) =>
                        handleInputChange("contact.email", e.target.value)
                      }
                      placeholder="business@example.com"
                      icon={Mail}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <Input
                      type="url"
                      value={businessData.contact.website}
                      onChange={(e) =>
                        handleInputChange("contact.website", e.target.value)
                      }
                      placeholder="www.yourbusiness.com"
                      icon={Globe}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Business Hours Tab */}
            {activeTab === "hours" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Business Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(businessData.businessHours).map(
                    ([day, hours]) => (
                      <div
                        key={day}
                        className="space-y-3 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 capitalize">
                            {day}
                          </label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hours.isOpen}
                              onChange={(e) =>
                                handleHoursChange(
                                  day,
                                  "isOpen",
                                  e.target.checked
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        {hours.isOpen && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Open
                              </label>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) =>
                                  handleHoursChange(day, "open", e.target.value)
                                }
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Close
                              </label>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) =>
                                  handleHoursChange(
                                    day,
                                    "close",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Services & Specialties
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Services
                    </h4>
                    <div className="space-y-3">
                      {businessData.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm">{service}</span>
                          <button
                            onClick={() => removeService(index)}
                            className="p-1 hover:bg-gray-200 rounded text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newService = prompt("Enter service name:");
                          if (newService) addService(newService);
                        }}
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Specialties
                    </h4>
                    <div className="space-y-3">
                      {businessData.tags.map((specialty, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm">{specialty}</span>
                          <button
                            onClick={() => removeSpecialty(index)}
                            className="p-1 hover:bg-gray-200 rounded text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newSpecialty = prompt("Enter specialty:");
                          if (newSpecialty) addSpecialty(newSpecialty);
                        }}
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Specialty
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === "photos" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Business Photos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {Array.from({ length: 6 }, (_, i) => {
                    const image = businessImages[i];
                    return (
                      <div
                        key={i}
                        className="relative aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer overflow-hidden group"
                      >
                        {image ? (
                          <>
                            <img
                              src={image.url}
                              alt={`Business photo ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleDeleteImage(i)}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <Camera className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center">
                  <input
                    type="file"
                    id="desktop-image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    icon={Upload}
                    onClick={() => document.getElementById('desktop-image-upload').click()}
                    disabled={uploadingImages}
                  >
                    {uploadingImages ? 'Uploading...' : 'Upload Photos'}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isLoading}
              icon={Save}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfileEditor;
