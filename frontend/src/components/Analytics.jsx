import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

export default function Analytics() {
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('6months');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/admin/dashboard');
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || 'Failed to load analytics data';
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [showToast]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center text-gray-500">
        Loading analytics data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-red-100 shadow-sm text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center text-gray-500">
        No analytics data available.
      </div>
    );
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const inventoryByGroup = bloodGroups.map(bg => ({
    group: bg,
    units: analytics.bloodInventory?.[bg] || 0
  }));

  // Calculate statistics
  const totalTransactions = (analytics.recentDonations?.length || 0) + (analytics.recentRequests?.length || 0);
  const fulfillmentRate = analytics.recentRequests?.length > 0 
    ? Math.round((analytics.recentRequests.filter(r => r.status === 'fulfilled' || r.status === 'completed').length / analytics.recentRequests.length) * 100)
    : 0;

  const mostNeededBloodGroup = inventoryByGroup.length > 0
    ? inventoryByGroup.reduce((min, current) => 
        current.units < min.units ? current : min
      ).group
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Total Donors</h3>
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalDonors || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Registered donors</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Active Recipients</h3>
            <span className="text-2xl">🤝</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalRecipients || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Registered recipients</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Available Units</h3>
            <span className="text-2xl">🩸</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalUnits || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Total in inventory</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500">Active Alerts</h3>
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.activeAlerts || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Pending requests</p>
        </div>
      </div>

      {/* Donation Trend */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Donation Trend</h2>
            <p className="text-sm text-gray-500">Last 6 months of completed donations</p>
          </div>
        </div>
        <div className="flex items-end justify-between h-64 gap-2">
          {analytics.trend && analytics.trend.length > 0 ? (
            analytics.trend.map((item, index) => {
              const maxCount = Math.max(...analytics.trend.map(t => t.count), 1);
              const heightPercent = (item.count / maxCount) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t" style={{ height: `${heightPercent}%`, minHeight: '4px' }}></div>
                  <span className="text-xs font-semibold text-gray-600">{item.month}</span>
                  <span className="text-xs text-gray-500">{item.count} donations</span>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No donation data available</p>
          )}
        </div>
      </div>

      {/* Blood Inventory by Group */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Inventory by Blood Group</h2>
            <p className="text-sm text-gray-500">Current stock levels</p>
          </div>
          <div className="space-y-3">
            {inventoryByGroup.map((item) => {
              const maxUnits = Math.max(...inventoryByGroup.map(i => i.units), 1);
              const widthPercent = (item.units / maxUnits) * 100;
              const getColorClass = (units) => {
                if (units === 0) return 'bg-red-500';
                if (units < 5) return 'bg-orange-500';
                if (units < 10) return 'bg-yellow-500';
                return 'bg-green-500';
              };
              return (
                <div key={item.group} className="flex items-center gap-4">
                  <span className="w-12 font-semibold text-gray-700">{item.group}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full flex items-center justify-center text-white text-xs font-semibold ${getColorClass(item.units)}`}
                      style={{ width: `${Math.max(widthPercent, 10)}%` }}
                    >
                      {item.units > 0 && item.units}
                    </div>
                  </div>
                  <span className="w-12 text-right font-semibold text-gray-900">{item.units} units</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Analytics Summary</h2>
            <p className="text-sm text-gray-500">Key insights and metrics</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Most Needed Blood Group</span>
              <span className="font-bold text-red-600 text-lg">{mostNeededBloodGroup}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Fulfillment Rate</span>
              <span className="font-bold text-green-600 text-lg">{fulfillmentRate}%</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Recent Transactions</span>
              <span className="font-bold text-blue-600 text-lg">{totalTransactions}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Donor Participation</span>
              <span className="font-bold text-purple-600 text-lg">{analytics.totalDonors || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Critical Stock (Under 5 units)</span>
              <span className="font-bold text-orange-600 text-lg">
                {inventoryByGroup.filter(item => item.units < 5).length} groups
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donations */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Donations</h2>
            <p className="text-sm text-gray-500">Last 5 completed donations</p>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analytics.recentDonations && analytics.recentDonations.length > 0 ? (
              analytics.recentDonations.map((donation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">{donation.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(donation.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                    {donation.bloodGroup}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent donations</p>
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Requests</h2>
            <p className="text-sm text-gray-500">Last 5 blood requests</p>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analytics.recentRequests && analytics.recentRequests.length > 0 ? (
              analytics.recentRequests.map((request, index) => {
                const getStatusColor = (status) => {
                  switch (status) {
                    case 'fulfilled':
                    case 'completed':
                      return 'bg-green-100 text-green-700';
                    case 'pending':
                      return 'bg-yellow-100 text-yellow-700';
                    case 'cancelled':
                      return 'bg-red-100 text-red-700';
                    case 'approved':
                      return 'bg-blue-100 text-blue-700';
                    default:
                      return 'bg-gray-100 text-gray-700';
                  }
                };
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900">{request.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                        {request.bloodGroup}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-8">No recent requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
