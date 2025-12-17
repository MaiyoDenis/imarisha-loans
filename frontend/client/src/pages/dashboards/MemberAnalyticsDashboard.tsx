import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, BarChart, Bar, LineChart, Line,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, TrendingUp, Target } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';

interface MemberData {
  timestamp: string;
  cohort_analysis: {
    cohorts: Record<string, { count: number; active: number }>;
    total_cohorts: number;
  };
  lifecycle_stages: {
    stages: Record<string, { count: number; percentage: number }>;
  };
  segmentation: {
    segments: Record<string, { count: number; percentage: number }>;
  };
  retention_trends: {
    active_members: number;
    inactive_members: number;
    retention_rate: number;
    churn_rate: number;
    average_lifespan_months: number;
  };
  journey_map: {
    stages: Array<{
      stage: string;
      average_duration: string;
      key_action: string;
    }>;
    success_rate: number;
  };
}

export default function MemberAnalyticsDashboard() {
  const { data: dashboard, isLoading } = useQuery<MemberData>({
    queryKey: ['memberAnalyticsDashboard'],
    queryFn: () => api.getMemberAnalyticsDashboard(),
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!dashboard) return null;

  const lifecycleData = Object.entries(dashboard.lifecycle_stages.stages).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').toUpperCase(),
    value: value.count,
    percentage: value.percentage
  }));

  const segmentData = Object.entries(dashboard.segmentation.segments).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').toUpperCase(),
    value: value.count,
    percentage: value.percentage
  }));

  const cohortData = Object.entries(dashboard.cohort_analysis.cohorts)
    .slice(-6)
    .map(([month, data]) => ({
      month,
      total: data.count,
      active: data.active
    }));

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Member Analytics Dashboard</h1>
        <p className="text-gray-600 mb-8">Understand your member base and growth patterns</p>

        {/* Retention Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Retention Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              title="Active Members"
              value={dashboard.retention_trends.active_members}
              icon={<Users size={24} />}
              status="success"
            />
            <KPICard
              title="Inactive Members"
              value={dashboard.retention_trends.inactive_members}
              status="warning"
            />
            <KPICard
              title="Retention Rate"
              value={`${dashboard.retention_trends.retention_rate.toFixed(1)}%`}
              status="success"
              icon={<TrendingUp size={24} />}
            />
            <KPICard
              title="Churn Rate"
              value={`${dashboard.retention_trends.churn_rate.toFixed(1)}%`}
              status={dashboard.retention_trends.churn_rate > 5 ? 'warning' : 'normal'}
            />
            <KPICard
              title="Avg Lifespan"
              value={`${dashboard.retention_trends.average_lifespan_months}`}
              unit="months"
            />
          </div>
        </div>

        {/* Lifecycle & Segmentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Lifecycle Stages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Member Lifecycle Stages</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={lifecycleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${((entry.value / lifecycleData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {lifecycleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Member Segments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Member Segmentation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={segmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cohort Analysis */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Cohort Analysis (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Members" />
              <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} name="Active Members" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Member Journey Map */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={24} />
            Member Journey Map
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboard.journey_map.stages.map((stageInfo, idx) => (
              <div key={idx} className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <h4 className="font-bold text-gray-900 text-lg">{stageInfo.stage}</h4>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Duration:</strong> {stageInfo.average_duration}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Key Action:</strong> {stageInfo.key_action}
                </p>
                {idx < dashboard.journey_map.stages.length - 1 && (
                  <div className="text-center mt-3 text-blue-500 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Journey Success Rate:</strong> {dashboard.journey_map.success_rate.toFixed(1)}% of members successfully progress through their lifecycle stages.
            </p>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}
