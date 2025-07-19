import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ProfileImageUpload from "../components/ProfileImageUpload";

const Profile = () => {
  const { user, updateProfile, uploadProfileImage, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.profile?.bio || "",
    address: {
      street: user?.profile?.address?.street || "",
      city: user?.profile?.address?.city || "",
      state: user?.profile?.address?.state || "",
      pincode: user?.profile?.address?.pincode || "",
    }
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.profile?.bio || "",
        address: {
          street: user.profile?.address?.street || "",
          city: user.profile?.address?.city || "",
          state: user.profile?.address?.state || "",
          pincode: user.profile?.address?.pincode || "",
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        profile: {
          bio: formData.bio,
          address: formData.address,
        }
      });

      if (result.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error("Update failed:", error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (imageFile) => {
    setImageUploading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await uploadProfileImage(imageFile);
      
      if (result.success) {
        setSuccess('Profile picture updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      setError(error.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.profile?.bio || "",
      address: {
        street: user?.profile?.address?.street || "",
        city: user?.profile?.address?.city || "",
        state: user?.profile?.address?.state || "",
        pincode: user?.profile?.address?.pincode || "",
      }
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Please Log In
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your profile.
          </p>
          <Button onClick={() => navigate("/auth")} variant="primary">
            Log In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Profile - Easy Life Gangtok</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 text-center">
                <div className="mb-4">
                  <ProfileImageUpload
                    currentImage={user.profile?.avatar}
                    onImageUpload={handleImageUpload}
                    loading={imageUploading}
                  />
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {user.name}
                </h2>
                <p className="text-gray-600 mb-1">{user.email}</p>
                <p className="text-sm text-gray-500 mb-4 capitalize">
                  {user.userType} Account
                </p>

                {user.isVerified && (
                  <span className="inline-flex items-center bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                    <User className="w-4 h-4 mr-1" />
                    Verified
                  </span>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "primary"}
                    className="w-full"
                    icon={isEditing ? Settings : User}
                  >
                    {isEditing ? "Cancel Edit" : "Edit Profile"}
                  </Button>

                  <Button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Logout
                  </Button>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Account Info
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">
                      {user.joinDate || "Recently"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type</span>
                    <span className="font-medium capitalize">{user.userType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`font-medium ${
                        user.verified ? "text-green-600" : "text-yellow-600"
                      }`}
                    >
                      {user.verified ? "Verified" : "Pending Verification"}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Profile Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h3>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="ghost"
                      size="sm"
                      icon={Settings}
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                  </div>
                )}

                {isEditing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      icon={User}
                    />

                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      icon={Mail}
                      disabled={true}
                      className="bg-gray-50"
                    />

                    <Input
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      icon={Phone}
                    />

                    {/* Address Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Street Address"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        icon={MapPin}
                      />
                      <Input
                        label="City"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        icon={MapPin}
                      />
                      <Input
                        label="State"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        icon={MapPin}
                      />
                      <Input
                        label="Pin Code"
                        name="address.pincode"
                        value={formData.address.pincode}
                        onChange={handleInputChange}
                        icon={MapPin}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        onClick={handleSave}
                        variant="primary"
                        loading={loading}
                        icon={Save}
                      >
                        Save Changes
                      </Button>
                      <Button onClick={handleCancel} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <p className="text-gray-900">{user.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <p className="text-gray-900">
                          {user.phone || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <p className="text-gray-900">
                          {user.profile?.address?.street && (
                            <>
                              {user.profile.address.street}
                              {user.profile.address.city && `, ${user.profile.address.city}`}
                              {user.profile.address.state && `, ${user.profile.address.state}`}
                              {user.profile.address.pincode && ` - ${user.profile.address.pincode}`}
                            </>
                          ) || "Not provided"}
                        </p>
                      </div>
                    </div>
                    {user.profile?.bio && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <p className="text-gray-900">{user.profile.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Dashboard Link for Business Owners */}
              {user.userType === "seller" && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Business Dashboard
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Manage your business listings, view customer inquiries, and
                    track performance.
                  </p>
                  <Button
                    onClick={() => navigate("/seller-panel")}
                    variant="primary"
                  >
                    Go to Dashboard
                  </Button>
                </Card>
              )}

              {/* Customer Features */}
              {user.userType === "customer" && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Your Activity
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary-600 mb-1">
                        0
                      </div>
                      <div className="text-sm text-gray-600">
                        Saved Businesses
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary-600 mb-1">
                        0
                      </div>
                      <div className="text-sm text-gray-600">
                        Reviews Posted
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
