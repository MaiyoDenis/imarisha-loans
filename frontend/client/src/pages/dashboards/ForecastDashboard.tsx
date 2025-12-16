import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import KPICard from '@/components/dashboards/KPICard';

interface ForecastData {
  timestamp: string;
  revenue_forecast: {
    forecast_months: string[];
    values: number[];
    confidence_interval: [number, number];
  };
  loan_volume_forecast: {
    forecast_months: string[];
    applications: number[];
    approvals: number[];
    trend: string;
  };
  cash_flow_forecast: {
    forecast_months: string[];
    inflows: number[];
    outflows: number[];
    net_flow: number[];
  };
  arrears_forecast: {
    forecast_months: string[];
    predicted_rate: number[];
    confidence_level: number;
  };
  budget_variance: {
    revenue: { budgeted: number; actual: number; variance: number; variance_pct: number };
    expenses: { budgeted: number; actual: number; variance: number; variance_pct: number };
    profit: { budgeted: number; actual: number; variance: number; variance_pct: number };
  };
}

export default function ForecastDashboard() {
  const { data: dashboard, isLoading } = useQuery<ForecastData>({
    queryKey: ['forecastDashboard'],
    queryFn: () => api.getForecastDashboard(),
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!dashboard) return null;

  const revenueData = dashboard.revenue_forecast.forecast_months.map((month, idx) => ({
    month,
    revenue: dashboard.revenue_forecast.values[idx],
    lower: dashboard.revenue_forecast.confidence_interval[0],
    upper: dashboard.revenue_forecast.confidence_interval[1]
  }));

  const loanData = dashboard.loan_volume_forecast.forecast_months.map((month, idx) => ({
    month,
    applications: dashboard.loan_volume_forecast.applications[idx],
    approvals: dashboard.loan_volume_forecast.approvals[idx]
  }));

  const cashFlowData = dashboard.cash_flow_forecast.forecast_months.map((month, idx) => ({
    month,
    inflows: dashboard.cash_flow_forecast.inflows[idx],
    outflows: dashboard.cash_flow_forecast.outflows[idx],
    net_flow: dashboard.cash_flow_forecast.net_flow[idx]
  }));

  const arrearsData = dashboard.arrears_forecast.forecast_months.map((month, idx) => ({
    month,
    rate: dashboard.arrears_forecast.predicted_rate[idx]
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Forecast Dashboard</h1>
        <p className="text-gray-600 mb-8">12-month projections and scenario planning</p>

        {/* Budget Variance Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Budget vs Actual (YTD)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Revenue</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(dashboard.budget_variance.revenue.actual)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Target: {formatCurrency(dashboard.budget_variance.revenue.budgeted)}
                </span>
                <span className={`text-sm font-semibold ${
                  dashboard.budget_variance.revenue.variance_pct < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {dashboard.budget_variance.revenue.variance_pct > 0 ? '+' : ''}
                  {dashboard.budget_variance.revenue.variance_pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((dashboard.budget_variance.revenue.actual / dashboard.budget_variance.revenue.budgeted) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Expenses</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(dashboard.budget_variance.expenses.actual)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Budget: {formatCurrency(dashboard.budget_variance.expenses.budgeted)}
                </span>
                <span className={`text-sm font-semibold ${
                  dashboard.budget_variance.expenses.variance_pct > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {dashboard.budget_variance.expenses.variance_pct > 0 ? '+' : ''}
                  {dashboard.budget_variance.expenses.variance_pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((dashboard.budget_variance.expenses.actual / dashboard.budget_variance.expenses.budgeted) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Profit</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(dashboard.budget_variance.profit.actual)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Target: {formatCurrency(dashboard.budget_variance.profit.budgeted)}
                </span>
                <span className={`text-sm font-semibold ${
                  dashboard.budget_variance.profit.variance_pct < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {dashboard.budget_variance.profit.variance_pct > 0 ? '+' : ''}
                  {dashboard.budget_variance.profit.variance_pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((dashboard.budget_variance.profit.actual / dashboard.budget_variance.profit.budgeted) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            12-Month Revenue Forecast
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Volume & Cash Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Loan Volume */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Loan Volume Forecast</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loanData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#3b82f6" name="Applications" />
                <Bar dataKey="approvals" fill="#10b981" name="Approvals" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cash Flow */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Cash Flow Forecast</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="inflows" fill="#10b981" name="Inflows" />
                <Bar dataKey="outflows" fill="#ef4444" name="Outflows" />
                <Line type="monotone" dataKey="net_flow" stroke="#f59e0b" strokeWidth={2} name="Net Flow" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Arrears Forecast */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-600" />
            Arrears Rate Forecast (Confidence: {(dashboard.arrears_forecast.confidence_level * 100).toFixed(0)}%)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={arrearsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Arrears %', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
                name="Predicted Arrears Rate"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              <strong>Insight:</strong> Arrears rate is expected to trend {
                arrearsData[arrearsData.length - 1].rate > arrearsData[0].rate ? 'upward' : 'downward'
              } over the forecast period. Monitor collections activities accordingly.
            </p>
          </div>
        </div>

        {/* Loan Volume Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            Loan Volume Trend: <span className="text-green-600 uppercase text-sm ml-2">{dashboard.loan_volume_forecast.trend}</span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Based on current trends, loan applications are expected to {dashboard.loan_volume_forecast.trend} throughout the forecast period.
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={loanData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    </Layout>
  );
}
