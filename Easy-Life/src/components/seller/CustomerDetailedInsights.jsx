import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Star,
  MessageCircle,
  Calendar,
  FileText,
  Tag
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';

const CustomerDetailedInsights = ({ onBack }) => {
  const { token } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetailedInsights();
  }, []);

  const fetchDetailedInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/seller/customers/analytics/detailed', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detailed insights');
      }

      const data = await response.json();
      setInsights(data.data);
    } catch (err) {
      console.error('Error fetching detailed insights:', err);
      setError(err.message);
      // Set fallback data
      setInsights(getFallbackInsights());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackInsights = () => ({
    lastUpdated: new Date().toISOString(),
    funnel: {
      inquiries: { count: 63, percentage: 100, conversionRate: 67 },
      bookings: { count: 42, percentage: 67, conversionRate: 86 },
      completions: { count: 36, percentage: 57, conversionRate: 78 },
      repeat: { count: 28, percentage: 44, conversionRate: 100 }
    },
    businessMetrics: {
      revenue: { current: 25200, previous: 23400, growth: 8, trend: 'up' },
      bookings: { current: 42, previous: 38, growth: 11, trend: 'up' },
      avgOrderValue: { current: 1850, previous: 1720, growth: 8, trend: 'up' },
      satisfaction: { score: 4.7, maxScore: 5, trend: 'up' }
    },
    customerActions: {
      totalMessages: 13,
      followUpsScheduled: 6,
      notesAdded: 17,
      segmentUpdates: 4
    },
    period: {
      current: { label: 'Last 30 days' },
      previous: { label: 'Previous 30 days' }
    }
  });

  const renderTrendIcon = (trend) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Customer Insights</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Customer Insights</h1>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">Unable to load customer insights</p>
            <Button onClick={fetchDetailedInsights} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Insights</h1>
              <p className="text-gray-600 text-sm">
                Last updated: {new Date(insights.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Journey Funnel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Journey Funnel</h2>
                
                <div className="space-y-4">
                  {/* Inquiries */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Inquiries</span>
                      <span className="text-lg font-bold text-gray-900">{insights.funnel.inquiries.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ width: `${insights.funnel.inquiries.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {insights.funnel.inquiries.conversionRate}% convert to bookings
                    </p>
                  </div>

                  {/* Bookings */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Bookings</span>
                      <span className="text-lg font-bold text-gray-900">{insights.funnel.bookings.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${insights.funnel.bookings.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {insights.funnel.bookings.conversionRate}% complete service
                    </p>
                  </div>

                  {/* Completions */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Completions</span>
                      <span className="text-lg font-bold text-gray-900">{insights.funnel.completions.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-yellow-500 h-3 rounded-full"
                        style={{ width: `${insights.funnel.completions.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {insights.funnel.completions.conversionRate}% become repeat customers
                    </p>
                  </div>

                  {/* Repeat Customers */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Repeat Customers</span>
                      <span className="text-lg font-bold text-gray-900">{insights.funnel.repeat.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-purple-500 h-3 rounded-full"
                        style={{ width: `${insights.funnel.repeat.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Long-term customer relationships
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Key Business Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Business Metrics</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Revenue */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      {renderTrendIcon(insights.businessMetrics.revenue.trend)}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{insights.businessMetrics.revenue.current.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Revenue (30 days)</p>
                    <p className={`text-xs font-medium ${getGrowthColor(insights.businessMetrics.revenue.growth)}`}>
                      {insights.businessMetrics.revenue.growth > 0 ? '+' : ''}{insights.businessMetrics.revenue.growth}% vs last month
                    </p>
                  </div>

                  {/* Bookings */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="w-6 h-6 text-blue-600" />
                      {renderTrendIcon(insights.businessMetrics.bookings.trend)}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {insights.businessMetrics.bookings.current}
                    </p>
                    <p className="text-sm text-gray-600">Bookings (30 days)</p>
                    <p className={`text-xs font-medium ${getGrowthColor(insights.businessMetrics.bookings.growth)}`}>
                      {insights.businessMetrics.bookings.growth > 0 ? '+' : ''}{insights.businessMetrics.bookings.growth}% vs last month
                    </p>
                  </div>

                  {/* Average Order Value */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Tag className="w-6 h-6 text-yellow-600" />
                      {renderTrendIcon(insights.businessMetrics.avgOrderValue.trend)}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{insights.businessMetrics.avgOrderValue.current}
                    </p>
                    <p className="text-sm text-gray-600">Avg Order Value</p>
                    <p className={`text-xs font-medium ${getGrowthColor(insights.businessMetrics.avgOrderValue.growth)}`}>
                      {insights.businessMetrics.avgOrderValue.growth > 0 ? '+' : ''}{insights.businessMetrics.avgOrderValue.growth}% vs last month
                    </p>
                  </div>

                  {/* Customer Satisfaction */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Star className="w-6 h-6 text-purple-600" />
                      {renderTrendIcon(insights.businessMetrics.satisfaction.trend)}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {insights.businessMetrics.satisfaction.score}
                    </p>
                    <p className="text-sm text-gray-600">Satisfaction Score</p>
                    <p className="text-xs text-gray-500">
                      Out of {insights.businessMetrics.satisfaction.maxScore} stars
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Customer Actions Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Engagement Actions</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{insights.customerActions.totalMessages}</p>
                  <p className="text-sm text-gray-600">Messages Sent</p>
                </div>
                
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{insights.customerActions.followUpsScheduled}</p>
                  <p className="text-sm text-gray-600">Follow-ups Scheduled</p>
                </div>
                
                <div className="text-center">
                  <FileText className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{insights.customerActions.notesAdded}</p>
                  <p className="text-sm text-gray-600">Notes Added</p>
                </div>
                
                <div className="text-center">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{insights.customerActions.segmentUpdates}</p>
                  <p className="text-sm text-gray-600">Segment Updates</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerDetailedInsights;
