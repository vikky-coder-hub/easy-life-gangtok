import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  UserPlus,
  RotateCcw,
  UserX,
  Activity,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";

const CustomerAnalyticsCard = ({
  title = "Customers",
  data,
  onGetDeeperInsights,
  showInsightsButton = true,
  variant = "default", // default, compact, detailed
}) => {
  // Add null checks and default values
  if (!data) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Loading customer analytics...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Ensure data structure exists with defaults
  const safeData = {
    total: data.total || { count: 0, percentage: 0 },
    new: data.new || { count: 0, percentage: 0 },
    repeat: data.repeat || { count: 0, percentage: 0 },
    lapsed: data.lapsed || { count: 0, percentage: 0 },
    active: data.active || { count: 0, percentage: 0 },
    lastUpdated: data.lastUpdated || 'Just now'
  };

  const getPercentageColor = (percentage) => {
    if (percentage > 0) return "text-green-600";
    if (percentage < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getIcon = (type) => {
    switch (type) {
      case "new":
        return UserPlus;
      case "repeat":
        return RotateCcw;
      case "lapsed":
        return UserX;
      case "active":
        return Activity;
      default:
        return Users;
    }
  };

  if (variant === "compact") {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <TrendingUp className="w-4 h-4 text-gray-400" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">
                {safeData.total.count}
              </div>
              <div className="text-xs text-gray-500">Total customers</div>
            </div>
          </div>
          {safeData.total.percentage && (
            <div
              className={`text-xs font-medium ${getPercentageColor(
                safeData.total.percentage
              )}`}
            >
              {safeData.total.percentage > 0 ? "↗" : "↘"}{" "}
              {Math.abs(safeData.total.percentage)}%
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-xs text-gray-500">
          Last updated: {safeData.lastUpdated}
        </div>
      </div>

      {/* Main Total Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          {/* Donut Chart Background */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center relative">
            {/* Donut segments - simulating the pie chart */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: safeData.total.count > 0 ? `conic-gradient(
                from 0deg,
                #ef4444 0deg ${(safeData.new.count / safeData.total.count) * 360}deg,
                #8b5cf6 ${(safeData.new.count / safeData.total.count) * 360}deg ${
                  ((safeData.new.count + safeData.repeat.count) / safeData.total.count) *
                  360
                }deg,
                #3b82f6 ${
                  ((safeData.new.count + safeData.repeat.count) / safeData.total.count) *
                  360
                }deg 360deg
              )` : '#e5e7eb',
              }}
            >
              <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {safeData.total.count}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total with Percentage */}
      <div className="text-center mb-6">
        <div className="text-sm text-gray-600">Total customers</div>
        <div className="flex items-center justify-center space-x-2 mt-1">
          <span className="text-2xl font-bold text-gray-900">
            {safeData.total.count}
          </span>
          {safeData.total.percentage && (
            <span
              className={`text-sm font-medium ${getPercentageColor(
                safeData.total.percentage
              )}`}
            >
              {safeData.total.percentage > 0 ? "↗" : "↘"}{" "}
              {Math.abs(safeData.total.percentage)}%
            </span>
          )}
        </div>
      </div>

      {/* Customer Segments */}
      <div className="space-y-4">
        {/* New Customers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                New customers
              </div>
              <div className="text-xs text-gray-500">
                {safeData.new.description || 'First-time customers'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {safeData.new.count}
            </div>
            {safeData.new.percentage && (
              <div
                className={`text-xs font-medium ${getPercentageColor(
                  safeData.new.percentage
                )}`}
              >
                {safeData.new.percentage > 0 ? "↗" : "↘"}{" "}
                {Math.abs(safeData.new.percentage)}%
              </div>
            )}
          </div>
        </motion.div>

        {/* Repeat Customers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                Repeat customers
              </div>
              <div className="text-xs text-gray-500">
                {safeData.repeat.description || 'Returning customers'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {safeData.repeat.count}
            </div>
            {safeData.repeat.percentage && (
              <div
                className={`text-xs font-medium ${getPercentageColor(
                  safeData.repeat.percentage
                )}`}
              >
                {safeData.repeat.percentage > 0 ? "↗" : "↘"}{" "}
                {Math.abs(safeData.repeat.percentage)}%
              </div>
            )}
          </div>
        </motion.div>

        {/* Lapsed Customers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                Lapsed customers
              </div>
              <div className="text-xs text-gray-500">
                {safeData.lapsed.description || 'Inactive customers'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {safeData.lapsed.count}
            </div>
            {safeData.lapsed.percentage && (
              <div
                className={`text-xs font-medium ${getPercentageColor(
                  safeData.lapsed.percentage
                )}`}
              >
                {safeData.lapsed.percentage > 0 ? "↗" : "↘"}{" "}
                {Math.abs(safeData.lapsed.percentage)}%
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Get Deeper Insights Button */}
      {showInsightsButton && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            className="w-full"
            onClick={onGetDeeperInsights}
          >
            Get deeper insights
          </Button>
        </div>
      )}
    </Card>
  );
};

export default CustomerAnalyticsCard;
