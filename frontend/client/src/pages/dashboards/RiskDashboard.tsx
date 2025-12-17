import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Pie, BarChart, Bar, LineChart, Line,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AlertTriangle, Shield, TrendingDown } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';

interface RiskData {
  timestamp: string;
  risk_distribution: {
    low_risk: { count: number; percentage: number };
    medium_risk: { count: number; percentage: number };
    high_risk: { count: number; percentage: number };
    critical_risk: { count: number; percentage: number };
  };
  portfolio_concentration: {
    by_product: Array<{ product: string; amount: number; percentage: number }>;
    by_location: Array<{ location: string; amount: number; percentage: number }>;
    concentration_ratio: number;
  };
  fraud_detection: {
    active_investigations: number;
    suspicious_transactions: number;
    flagged_members: number;
    recent_incidents: any[];
  };
  early_warnings: Array<{
    member_id: number;
    member_name: string;
    risk_flags: string[];
    recommended_action: string;
  }>;
  scenario_analysis: {
    baseline: { npl_increase: number; npl_rate: number };
    stress_5pct: { npl_increase: number; npl_rate: number };
    stress_10pct: { npl_increase: number; npl_rate: number };
    stress_20pct: { npl_increase: number; npl_rate: number };
  };
}

export default function RiskDashboard() {
  const { data: dashboard, isLoading } = useQuery<RiskData>({
    queryKey: ['riskDashboard'],
    queryFn: () => api.getRiskDashboard(),
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!dashboard) return null;

  const riskData = [
    { name: 'Low Risk', value: dashboard.risk_distribution.low_risk.count, color: '#10b981' },
    { name: 'Medium Risk', value: dashboard.risk_distribution.medium_risk.count, color: '#f59e0b' },
    { name: 'High Risk', value: dashboard.risk_distribution.high_risk.count, color: '#ef5350' },
    { name: 'Critical', value: dashboard.risk_distribution.critical_risk.count, color: '#c62828' }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Management Dashboard</h1>
        <p className="text-gray-600 mb-8">Monitor portfolio risk and early warning indicators</p>

        {/* Risk Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Risk Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard
              title="Low Risk"
              value={dashboard.risk_distribution.low_risk.count}
              unit={`${dashboard.risk_distribution.low_risk.percentage.toFixed(1)}%`}
              status="success"
              icon={<Shield size={24} />}
            />
            <KPICard
              title="Medium Risk"
              value={dashboard.risk_distribution.medium_risk.count}
              unit={`${dashboard.risk_distribution.medium_risk.percentage.toFixed(1)}%`}
              status="normal"
            />
            <KPICard
              title="High Risk"
              value={dashboard.risk_distribution.high_risk.count}
              unit={`${dashboard.risk_distribution.high_risk.percentage.toFixed(1)}%`}
              status="warning"
            />
            <KPICard
              title="Critical Risk"
              value={dashboard.risk_distribution.critical_risk.count}
              unit={`${dashboard.risk_distribution.critical_risk.percentage.toFixed(1)}%`}
              status="critical"
              icon={<AlertTriangle size={24} />}
            />
          </div>
        </div>

        {/* Fraud Detection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Fraud Detection</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard
              title="Active Investigations"
              value={dashboard.fraud_detection.active_investigations}
              status={dashboard.fraud_detection.active_investigations > 0 ? 'warning' : 'normal'}
            />
            <KPICard
              title="Suspicious Transactions"
              value={dashboard.fraud_detection.suspicious_transactions}
              status={dashboard.fraud_detection.suspicious_transactions > 5 ? 'warning' : 'normal'}
            />
            <KPICard
              title="Flagged Members"
              value={dashboard.fraud_detection.flagged_members}
              status={dashboard.fraud_detection.flagged_members > 0 ? 'warning' : 'success'}
            />
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Member Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => {
                  const percent = entry.percent || 0;
                  return `${entry.name}: ${entry.value} (${(percent * 100).toFixed(0)}%)`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Concentration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* By Product */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Concentration by Product</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.portfolio_concentration.by_product}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="amount" fill="#3b82f6" />
                <Bar yAxisId="right" dataKey="percentage" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* By Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Concentration by Location</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboard.portfolio_concentration.by_location}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="amount" fill="#8b5cf6" />
                <Bar yAxisId="right" dataKey="percentage" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Stress Testing Scenarios</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { scenario: 'Baseline', npl: dashboard.scenario_analysis.baseline.npl_rate },
              { scenario: 'Stress 5%', npl: dashboard.scenario_analysis.stress_5pct.npl_rate },
              { scenario: 'Stress 10%', npl: dashboard.scenario_analysis.stress_10pct.npl_rate },
              { scenario: 'Stress 20%', npl: dashboard.scenario_analysis.stress_20pct.npl_rate }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scenario" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="npl" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Early Warnings */}
        {dashboard.early_warnings.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={24} className="text-yellow-600" />
              Early Warning Indicators
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboard.early_warnings.slice(0, 10).map((warning) => (
                <div
                  key={warning.member_id}
                  className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50 rounded"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{warning.member_name}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {warning.risk_flags.map((flag) => (
                          <span
                            key={flag}
                            className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs"
                          >
                            {flag.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Action:</strong> {warning.recommended_action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}
