// API Configuration and Service Layer
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authentication headers
  getHeaders(isFormData = false) {
    const headers = {};
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.isFormData),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication APIs
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async signup(userData) {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async sendOTP(phone) {
    return await this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOTP(phone, otp) {
    return await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  }

  async loginWithOTP(phone, otp) {
    const response = await this.request('/auth/login-with-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  // Profile APIs
  async getProfile() {
    return await this.request('/auth/profile');
  }

  async updateProfile(profileData, profileImage = null) {
    console.log('=== FRONTEND PROFILE UPDATE DEBUG ===');
    console.log('Profile data being sent:', JSON.stringify(profileData, null, 2));
    console.log('Profile image:', profileImage);
    
    if (profileImage) {
      // Handle file upload with FormData
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== undefined && profileData[key] !== null) {
          if (typeof profileData[key] === 'object') {
            formData.append(key, JSON.stringify(profileData[key]));
          } else {
            formData.append(key, profileData[key]);
          }
        }
      });
      formData.append('avatar', profileImage); // Backend expects 'avatar' field

      return await this.request('/auth/profile', {
        method: 'PUT',
        body: formData,
        isFormData: true,
      });
    } else {
      // Regular JSON update
      return await this.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    }
  }

  // Separate method for profile image upload only
  async uploadProfileImage(imageFile) {
    console.log('=== FRONTEND PROFILE IMAGE UPLOAD ===');
    console.log('Image file:', imageFile);
    console.log('Image size:', (imageFile.size / 1024).toFixed(2), 'KB');
    console.log('Image type:', imageFile.type);
    console.log('Image name:', imageFile.name);
    
    // Create FormData and append the file
    const formData = new FormData();
    formData.append('avatar', imageFile, imageFile.name || 'profile-image.jpg');

    // Log FormData contents
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    return await this.request('/auth/profile', {
      method: 'PUT',
      body: formData,
      isFormData: true,
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.setToken(null);
    }
  }

  // Dashboard APIs
  async getCustomerDashboard() {
    return await this.request('/analytics/dashboard/customer');
  }

  async getSellerDashboard() {
    return await this.request('/analytics/dashboard/seller');
  }

  async getAdminDashboard() {
    return await this.request('/analytics/dashboard/admin');
  }

  // Customer Activity API
  async getCustomerActivity(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/activity/customer/me?${queryString}` : '/activity/customer/me';
    return await this.request(endpoint);
  }

  // Saved Business APIs
  async getSavedBusinesses() {
    return await this.request('/saved-businesses');
  }

  async saveBusiness(businessId) {
    return await this.request(`/saved-businesses/${businessId}`, {
      method: 'POST',
    });
  }

  async unsaveBusiness(businessId) {
    return await this.request(`/saved-businesses/${businessId}`, {
      method: 'DELETE',
    });
  }

  async checkIfBusinessSaved(businessId) {
    return await this.request(`/saved-businesses/check/${businessId}`);
  }

  // Booking APIs
  async getCustomerBookings() {
    return await this.request('/bookings/customer/me');
  }

  async getBookingById(bookingId) {
    return await this.request(`/bookings/${bookingId}`);
  }

  async createBooking(bookingData) {
    return await this.request('/bookings/service', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async cancelBooking(bookingId, reason) {
    return await this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Admin Booking APIs
  async getAllBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/bookings?${queryString}` : '/bookings';
    return await this.request(endpoint);
  }

  async confirmBooking(bookingId) {
    return await this.request(`/bookings/${bookingId}/confirm`, {
      method: 'PUT',
    });
  }

  async completeBooking(bookingId) {
    return await this.request(`/bookings/${bookingId}/complete`, {
      method: 'PUT',
    });
  }

  async adminCancelBooking(bookingId, cancellationReason) {
    return await this.request(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason }),
    });
  }

  // Seller Customer Management APIs
  async getSellerCustomerAnalytics() {
    return await this.request('/seller/customers/analytics');
  }

  async getDetailedCustomerInsights() {
    return await this.request('/seller/customers/analytics/detailed');
  }

  async getCustomerOverview() {
    return await this.request('/seller/customers/overview');
  }

  async getCustomerInsights() {
    return await this.request('/seller/customers/insights');
  }

  async getSellerCustomerList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/seller/customers/list?${queryString}` : '/seller/customers/list';
    return await this.request(endpoint);
  }

  async getSellerCustomerDetails(customerId) {
    return await this.request(`/seller/customers/${customerId}`);
  }

  async getCustomerCommunicationHistory(customerId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/seller/customers/${customerId}/communication-history?${queryString}` 
      : `/seller/customers/${customerId}/communication-history`;
    return await this.request(endpoint);
  }

  async getCustomerNotes(customerId) {
    return await this.request(`/seller/customers/${customerId}/notes`);
  }

  async addCustomerNote(customerId, noteData) {
    return await this.request(`/seller/customers/${customerId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateCustomerNote(noteId, noteData) {
    return await this.request(`/seller/customers/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteCustomerNote(noteId) {
    return await this.request(`/seller/customers/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  async sendCustomerMessage(customerId, messageData) {
    return await this.request(`/seller/customers/${customerId}/message`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async scheduleCustomerFollowUp(customerId, followUpData) {
    return await this.request(`/seller/customers/${customerId}/follow-up`, {
      method: 'POST',
      body: JSON.stringify(followUpData),
    });
  }

  async updateCustomerSegment(customerId, segment) {
    return await this.request(`/seller/customers/${customerId}/segment`, {
      method: 'PUT',
      body: JSON.stringify({ segment }),
    });
  }

  // Activity APIs
  async getCustomerActivity(params = {}) {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = queryString ? `/activity/customer/me?${queryString}` : '/activity/customer/me';
    return await this.request(url);
  }

  // Admin APIs
  async getAdminUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return await this.request(endpoint);
  }

  async getBannedUsers() {
    return await this.request('/users/banned');
  }

  async getUserById(userId) {
    return await this.request(`/users/${userId}`);
  }

  async updateUser(userId, userData, avatarFile = null) {
    if (avatarFile) {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined && userData[key] !== null) {
          if (typeof userData[key] === 'object') {
            formData.append(key, JSON.stringify(userData[key]));
          } else {
            formData.append(key, userData[key]);
          }
        }
      });
      formData.append('avatar', avatarFile);

      return await this.request(`/users/${userId}`, {
        method: 'PUT',
        body: formData,
        isFormData: true,
      });
    } else {
      return await this.request(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    }
  }

  async deleteUser(userId) {
    return await this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getPendingBusinesses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/businesses/pending?${queryString}` : '/admin/businesses/pending';
    return await this.request(endpoint);
  }

  async getUnderReviewBusinesses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/businesses/under-review?${queryString}` : '/admin/businesses/under-review';
    return await this.request(endpoint);
  }

  async approveBusiness(businessId) {
    return await this.request(`/admin/businesses/${businessId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectBusiness(businessId) {
    return await this.request(`/admin/businesses/${businessId}/reject`, {
      method: 'PUT',
    });
  }

  async getAdminSystemStats() {
    return await this.request('/admin/dashboard');
  }

  async getAdminSettlements(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/settlements?${queryString}` : '/admin/settlements';
    return await this.request(endpoint);
  }

  async banUser(userId, isBanned) {
    return await this.request(`/users/${userId}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ isBanned }),
    });
  }

  // Utility method to check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get current token
  getToken() {
    return this.token;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for convenience
export const {
  login,
  signup,
  sendOTP,
  verifyOTP,
  loginWithOTP,
  getProfile,
  updateProfile,
  uploadProfileImage,
  logout,
  isAuthenticated,
  getToken,
  setToken,
} = apiService;
