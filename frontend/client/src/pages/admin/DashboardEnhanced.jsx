import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Activity,
  Zap,
  Target,
  ShoppingCart,
  CheckCircle2,
  Users,
  Building2,
  Clock,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Calendar,
  Filter,
  ChevronRight,
  AlertTriangle,
  CheckCheck,
  Loader,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as PieChartComp,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import KPICard from '@/components/dashboards/KPICard';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function StatCard({ label, value, change, icon: Icon, status = 'normal', trend = 'up' }) {
  const isPositive = trend === 'up';
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
            {change && (
              <p className={`text-xs mt-2 flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${
            status === 'success' ? 'bg-green-100' :
            status === 'warning' ? 'bg-amber-100' :
            'bg-blue-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              status === 'success' ? 'text-green-600' :
              status === 'warning' ? 'text-amber-600' :
              'text-blue-600'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertBox({ title, message, severity = 'info', actionLabel, onAction }) {
  return (
    <div className={`p-4 rounded-lg border flex items-start justify-between ${
      severity === 'high'
        ? 'bg-destructive/10 border-destructive/30'
        : severity === 'warning'
        ? 'bg-amber-50 border-amber-200'
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-start gap-3 flex-1">
        <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
          severity === 'high' ? 'text-destructive' :
          severity === 'warning' ? 'text-amber-600' :
          'text-blue-600'
        }`} />
        <div>
          <h3 className={`font-semibold text-sm ${
            severity === 'high' ? 'text-destructive' :
            severity === 'warning' ? 'text-amber-900' :
            'text-blue-900'
          }`}>
            {title}
          </h3>
          <p className={`text-xs mt-1 ${
            severity === 'high' ? 'text-destructive/80' :
            severity === 'warning' ? 'text-amber-800' :
            'text-blue-800'
          }`}>
            {message}
          </p>
        </div>
      </div>
      {actionLabel && onAction && (
        <Button
          size="sm"
          variant="outline"
          onClick={onAction}
          className="ml-4 flex-shrink-0"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

function RecentActivityItem({ icon: Icon, title, description, time, status = 'info' }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b last:border-b-0">
      <div className={`p-2 rounded-lg flex-shrink-0 ${
        status === 'success' ? 'bg-green-100' :
        status === 'warning' ? 'bg-amber-100' :
        'bg-blue-100'
      }`}>
        <Icon className={`w-4 h-4 ${
          status === 'success' ? 'text-green-600' :
          status === 'warning' ? 'text-amber-600' :
          'text-blue-600'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardEnhanced() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('month');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-KE').format(value);
  };

  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['adminDashboard', selectedBranch, dateRange],
    queryFn: () => api.getAdminDashboard(selectedBranch !== 'all' ? selectedBranch : undefined),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({ title: 'Dashboard refreshed', description: 'Data has been updated' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    if (!dashboard) return;
    const csvContent = `Admin Dashboard Export\nGenerated: ${new Date().toLocaleString()}\n\nKey Metrics\n${JSON.stringify(dashboard, null, 2)}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!dashboard) {
    return (
      <Layout>
        <div className="p-6">
          <AlertBox
            title="Failed to load dashboard"
            message="There was an error loading your dashboard data."
            severity="high"
            actionLabel="Retry"
            onAction={handleRefresh}
          />
        </div>
      </Layout>
    );
  }

  // Mock data for enhanced sections
  const memberGrowth = [
    { month: 'Jan', active: 450, pending: 120, approved: 340 },
    { month: 'Feb', active: 520, pending: 100, approved: 420 },
    { month: 'Mar', active: 680, pending: 85, approved: 580 },
    { month: 'Apr', active: 820, pending: 65, approved: 750 },
    { month: 'May', active: 950, pending: 50, approved: 920 },
    { month: 'Jun', active: 1100, pending: 40, approved: 1080 },
  ];

  const loanTrends = [
    { month: 'Jan', disbursed: 2400, repaid: 2210, defaulted: 120 },
    { month: 'Feb', disbursed: 2210, repaid: 2290, defaulted: 130 },
    { month: 'Mar', disbursed: 2290, repaid: 2000, defaulted: 118 },
    { month: 'Apr', disbursed: 2000, repaid: 2181, defaulted: 125 },
    { month: 'May', disbursed: 2181, repaid: 2500, defaulted: 110 },
    { month: 'Jun', disbursed: 2500, repaid: 2100, defaulted: 95 },
  ];

  const portfolioComposition = [
    { name: 'Education', value: 35, count: 350 },
    { name: 'Business', value: 25, count: 250 },
    { name: 'Agriculture', value: 20, count: 200 },
    { name: 'Healthcare', value: 12, count: 120 },
    { name: 'Housing', value: 8, count: 80 },
  ];

  const recentActivities = [
    { icon: CheckCircle2, title: 'Loan Approved', description: 'Member #12345 approved for KES 50,000', time: '2 mins ago', status: 'success' },
    { icon: Users, title: 'Member Registered', description: 'New member John Doe joined', time: '15 mins ago', status: 'success' },
    { icon: AlertTriangle, title: 'Overdue Loan', description: 'Member #98765 loan overdue by 5 days', time: '1 hour ago', status: 'warning' },
    { icon: DollarSign, title: 'Repayment Made', description: 'KES 25,000 received from member #54321', time: '3 hours ago', status: 'success' },
    { icon: Package, title: 'Inventory Alert', description: 'Product X stock below minimum threshold', time: '5 hours ago', status: 'warning' },
  ];

  const staffPerformance = [
    { name: 'James Kariuki', role: 'Field Officer', loansProcessed: 45, collection: 98.5, rating: 4.8 },
    { name: 'Mary Kipchoge', role: 'Loan Officer', loansProcessed: 38, collection: 96.2, rating: 4.7 },
    { name: 'David Mwangi', role: 'Field Officer', loansProcessed: 52, collection: 97.1, rating: 4.9 },
    { name: 'Sarah Johnson', role: 'Operations', loansProcessed: 25, collection: 94.3, rating: 4.5 },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-2">Complete overview of your lending operations</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="text-sm bg-background border border-border rounded px-3 py-2"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="text-sm bg-background border border-border rounded px-3 py-2"
              >
                <option value="all">All Branches</option>
                <option value="nairobi">Nairobi</option>
                <option value="mombasa">Mombasa</option>
                <option value="kisumu">Kisumu</option>
              </select>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Critical Alerts</h2>
            <AlertBox
              title="High Default Rate Alert"
              message="Default rate increased to 4.2% this month. Review at-risk members and implement collection strategies."
              severity="high"
              actionLabel="Review at-risk"
            />
            <AlertBox
              title="Low Stock Alert"
              message="3 products below minimum inventory threshold. Reorder recommended."
              severity="warning"
              actionLabel="Reorder"
            />
          </div>

          {/* Top-Level Summary Metrics */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Portfolio Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Portfolio Value"
                value={formatCurrency(dashboard?.lending_analytics?.total_borrowed_amount || 0)}
                change="+12.5% vs last month"
                icon={DollarSign}
                status="success"
              />
              <StatCard
                label="Active Members"
                value={formatNumber(1245)}
                change="+8.2% vs last month"
                icon={Users}
                status="success"
              />
              <StatCard
                label="Active Loans"
                value={formatNumber(dashboard?.lending_analytics?.total_loans_active || 0)}
                change="+5% vs last month"
                icon={CreditCard}
                status="success"
              />
              <StatCard
                label="Collections"
                value={formatCurrency(dashboard?.lending_analytics?.total_paid_amount || 0)}
                change="+15% vs last month"
                icon={CheckCheck}
                status="success"
              />
            </div>
          </div>

          {/* Risk & Compliance */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Risk & Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Default Rate"
                value={`${(dashboard?.repayment_tracking?.default_rate || 0).toFixed(1)}%`}
                change="↑ 0.3% vs last month"
                icon={AlertTriangle}
                status="warning"
                trend="down"
              />
              <StatCard
                label="At-Risk Loans"
                value={formatNumber(145)}
                change="↑ 12 new this week"
                icon={AlertCircle}
                status="warning"
              />
              <StatCard
                label="Overdue Amount"
                value={formatCurrency(285000)}
                change="↑ from last week"
                icon={Clock}
                status="warning"
                trend="down"
              />
              <StatCard
                label="Arrears Ratio"
                value={`${(dashboard?.repayment_tracking?.default_rate || 0).toFixed(1)}%`}
                change="Target: <3%"
                icon={TrendingDown}
                status="warning"
              />
            </div>
          </div>

          {/* Member & Customer Analytics */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Member & Customer Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Retention Rate"
                value="94.2%"
                change="+1.5% vs last quarter"
                icon={Users}
                status="success"
              />
              <StatCard
                label="Member Acquisition"
                value={formatNumber(284)}
                change="This month"
                icon={ArrowUpRight}
                status="success"
              />
              <StatCard
                label="Pending Approvals"
                value={formatNumber(45)}
                change="Avg wait: 2.5 days"
                icon={Clock}
              />
              <StatCard
                label="Member Lifetime Value"
                value={formatCurrency(85000)}
                change="Average per member"
                icon={DollarSign}
                status="success"
              />
            </div>
          </div>

          {/* Trends & Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Member Growth Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-primary" />
                  Member Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={memberGrowth}>
                    <defs>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="active" stroke="#3B82F6" fillOpacity={1} fill="url(#colorActive)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Loan Repayment vs Default */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Loan Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={loanTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="disbursed" fill="#3B82F6" name="Disbursed" />
                    <Bar dataKey="repaid" fill="#10B981" name="Repaid" />
                    <Bar dataKey="defaulted" fill="#EF4444" name="Defaulted" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Portfolio Composition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Portfolio Composition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChartComp>
                    <Pie data={portfolioComposition} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {portfolioComposition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChartComp>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Operational Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Operational Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Loan Approval Rate</span>
                      <span className="text-sm font-bold text-green-600">87.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Avg Processing Time</span>
                      <span className="text-sm font-bold">2.3 days</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Target: &lt;2 days</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Collection Rate</span>
                      <span className="text-sm font-bold text-green-600">96.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '96.8%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Staff Productivity</span>
                      <span className="text-sm font-bold">+12% vs target</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Avg 8.5 loans/staff/month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentActivities.map((activity, idx) => (
                  <RecentActivityItem key={idx} {...activity} />
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions & Pending Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">45 Loans Pending Review</p>
                      <p className="text-xs text-muted-foreground mt-1">Waiting for approval</p>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">28 Overdue Loans</p>
                      <p className="text-xs text-muted-foreground mt-1">KES 285,000 outstanding</p>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">12 Members Pending Approval</p>
                      <p className="text-xs text-muted-foreground mt-1">Avg wait: 2.5 days</p>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Generate Reports</p>
                      <p className="text-xs text-muted-foreground mt-1">Monthly/quarterly reports</p>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff Performance Board */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Staff Performance Board
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Staff Member</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-muted-foreground">Loans Processed</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-muted-foreground">Collection %</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-muted-foreground">Performance</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-muted-foreground">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {staffPerformance.map((staff, idx) => (
                      <tr key={idx} className="hover:bg-background transition">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{staff.name}</p>
                            <p className="text-xs text-muted-foreground">{staff.role}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium">{staff.loansProcessed}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${staff.collection}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{staff.collection.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            staff.loansProcessed > 45 ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {staff.loansProcessed > 45 ? 'Excellent' : 'Good'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-yellow-600">⭐ {staff.rating}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Existing Dashboard Content - Preserved */}
          {dashboard?.product_overview && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Product Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Total Products"
                  value={formatNumber(dashboard.product_overview.total_products)}
                  icon={<Package size={24} />}
                  status="success"
                />
                <KPICard
                  title="Inventory Value"
                  value={formatCurrency(dashboard.product_overview.total_inventory_value)}
                  icon={<DollarSign size={24} />}
                />
                <KPICard
                  title="Active Products"
                  value={formatNumber(dashboard.product_overview.active_products)}
                  status="success"
                />
                <KPICard
                  title="Low Stock Alerts"
                  value={formatNumber(dashboard.product_overview.low_stock_alerts)}
                  status={dashboard.product_overview.low_stock_alerts > 0 ? 'warning' : 'success'}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
