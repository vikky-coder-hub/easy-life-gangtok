import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Users,
  Search,
  MoreVertical,
  UserX,
  Edit3,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  UserPlus,
  Download,
  Activity,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import apiService from "../../utils/api";

const ManageUsers = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    activeToday: 0,
  });

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminUsers({ search: searchQuery });
      
      if (response.success) {
        // Filter only customer users as per the original logic
        const customerUsers = response.data.users.filter(user => user.userType === 'customer');
        setAllUsers(customerUsers);
        
        // Calculate stats
        setUserStats({
          total: customerUsers.length,
          activeToday: Math.floor(customerUsers.filter(u => u.isActive).length * 0.3), // Approximate active today
        });
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Refetch when search query changes
  useEffect(() => {
    if (searchQuery.length > 2 || searchQuery.length === 0) {
      const timeoutId = setTimeout(() => {
        fetchUsers();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  const handleUserAction = async (userId, action) => {
    try {
      setActionLoading(true);
      let response;
      
      switch (action) {
        case 'edit':
          // For now, just log - could open edit modal
          console.log('Edit user:', userId);
          break;
        case 'suspend':
        case 'ban':
          const shouldBan = confirm('Are you sure you want to ban this user?');
          if (shouldBan) {
            response = await apiService.banUser(userId, true);
            if (response.success) {
              await fetchUsers(); // Refresh the list
              alert('User banned successfully');
            }
          }
          break;
        case 'unban':
          response = await apiService.banUser(userId, false);
          if (response.success) {
            await fetchUsers(); // Refresh the list
            alert('User unbanned successfully');
          }
          break;
        case 'delete':
          const shouldDelete = confirm('Are you sure you want to delete this user? This action cannot be undone.');
          if (shouldDelete) {
            response = await apiService.deleteUser(userId);
            if (response.success) {
              await fetchUsers(); // Refresh the list
              alert('User deleted successfully');
            }
          }
          break;
        default:
          console.log(`${action} user:`, userId);
      }
    } catch (error) {
      console.error('User action error:', error);
      alert('Failed to perform action: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <>
      <Helmet>
        <title>Manage Users - Easy Life Gangtok</title>
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
                  Manage Users
                </h1>
                <p className="text-gray-600">
                  View and manage all platform users
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" icon={Download} size="sm">
                  Export
                </Button>
                <Button variant="primary" icon={UserPlus}>
                  Add New User
                </Button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <Card className="p-12 text-center mb-8">
              <Loader className="w-8 h-8 text-primary-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading users...
              </h3>
              <p className="text-gray-600">
                Please wait while we fetch the user data.
              </p>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-12 text-center mb-8">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error Loading Users
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={fetchUsers} variant="primary">
                Try Again
              </Button>
            </Card>
          )}

          {/* Stats Cards */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userStats.total}
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
                    <div className="p-3 rounded-lg bg-orange-100">
                      <Activity className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Active Today
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userStats.activeToday}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Search */}
          <Card className="p-6 mb-8">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Users ({filteredUsers.length})
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
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
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
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
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
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Customer
                        </span>
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
                        {user.joinedDate || "Jan 2024"}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUserAction(user.id, "edit")}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit User"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, "suspend")}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Suspend User"
                          >
                            <UserX className="w-4 h-4" />
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
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default ManageUsers;
