import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Users,
  Search,
  MoreVertical,
  UserCheck,
  Edit3,
  Mail,
  Phone,
  ArrowLeft,
  Download,
  Activity,
  Ban,
  RotateCcw,
  Loader,
  AlertTriangle,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import apiService from "../../utils/api";

const BannedUsers = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch banned users from API
  useEffect(() => {
    fetchBannedUsers();
  }, []);

  const fetchBannedUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching banned users...');
      const response = await apiService.getBannedUsers();
      console.log('Banned users response:', response);
      
      if (response.success) {
        // Transform the data to match the expected format
        const transformedUsers = (response.data.users || []).map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.profile?.avatar,
          status: "banned",
          bannedDate: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : 'Unknown',
          bannedReason: user.banReason || "Terms of service violation",
          type: user.userType || "customer",
          isBanned: user.isBanned,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }));
        console.log('Transformed banned users:', transformedUsers);
        setBannedUsers(transformedUsers);
      } else {
        setError('Failed to load banned users');
      }
    } catch (err) {
      console.error('Error fetching banned users:', err);
      setError(err.message || 'Failed to load banned users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = bannedUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bannedReason.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleUserAction = async (userId, action) => {
    try {
      if (action === "unban") {
        const response = await apiService.banUser(userId, false);
        if (response.success) {
          alert('User has been unbanned successfully');
          // Refresh the banned users list
          await fetchBannedUsers();
          // Remove from selected users if it was selected
          setSelectedUsers(prev => prev.filter(id => id !== userId));
        } else {
          alert('Failed to unban user. Please try again.');
        }
      } else if (action === "view") {
        // Handle view user details
        console.log('View user details:', userId);
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkUnban = async () => {
    if (selectedUsers.length === 0) return;
    
    const confirmUnban = window.confirm(
      `Are you sure you want to unban ${selectedUsers.length} user(s)?`
    );
    
    if (!confirmUnban) return;

    try {
      // Unban all selected users
      const promises = selectedUsers.map(userId => 
        apiService.banUser(userId, false)
      );
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;
      
      if (successful > 0) {
        alert(`Successfully unbanned ${successful} user(s)${failed > 0 ? `, ${failed} failed` : ''}`);
        // Refresh the banned users list
        await fetchBannedUsers();
        // Clear selected users
        setSelectedUsers([]);
      } else {
        alert('Failed to unban users. Please try again.');
      }
    } catch (error) {
      console.error('Error bulk unbanning users:', error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Banned Users - Easy Life Gangtok</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Banned Users
                </h1>
                <p className="text-gray-600">
                  View and manage users that have been banned from the platform
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" icon={Download} size="sm">
                  Export
                </Button>
                {selectedUsers.length > 0 && (
                  <Button 
                    variant="primary" 
                    icon={RotateCcw}
                    onClick={handleBulkUnban}
                  >
                    Bulk Unban ({selectedUsers.length})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-red-100">
                    <Ban className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Banned
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bannedUsers.length}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <Activity className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      This Week
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        bannedUsers.filter((u) => {
                          const bannedDate = new Date(u.bannedDate);
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return bannedDate >= weekAgo;
                        }).length
                      }
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <RotateCcw className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Can Unban
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bannedUsers.length}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Search */}
          <Card className="p-6 mb-8">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search banned users by name, email, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Banned Users Table */}
          <Card className="overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Banned Users ({loading ? '...' : filteredUsers.length})
                </h3>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {selectedUsers.length} selected
                    </span>
                    <Button size="sm" variant="outline">
                      Bulk Actions
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Loading banned users...
                </h3>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Error loading banned users
                </h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <Button onClick={fetchBannedUsers} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* Table Content - Only show when not loading and no error */}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map((u) => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Banned Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={
                              user.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name
                              )}&background=random`
                            }
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-red-100"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {user.phone || "Not provided"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                        {user.bannedDate}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="max-w-xs">
                          <p
                            className="text-sm text-gray-900 truncate"
                            title={user.bannedReason}
                          >
                            {user.bannedReason}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Banned
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUserAction(user.id, "view")}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, "unban")}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Unban User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                            title="More Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State */}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Ban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    No banned users found
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery
                      ? "Try adjusting your search criteria."
                      : "No users have been banned yet."}
                  </p>
                </div>
              )}
            </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default BannedUsers;
