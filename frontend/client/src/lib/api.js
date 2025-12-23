const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "https://imarisha-loans.onrender.com/api";

if (typeof window !== 'undefined') {
  console.log('[API] Configuration:', {
    'API Base': API_BASE,
    'VITE_API_URL': import.meta.env.VITE_API_URL,
    'VITE_BACKEND_URL': import.meta.env.VITE_BACKEND_URL,
    'Mode': import.meta.env.MODE,
    'Dev': import.meta.env.DEV
  });
}

async function fetchAPI(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || error.message || "Request failed");
  }

  return response.json();
}

export const apiCall = fetchAPI;

export const api = {
  // Generic methods
  get: (endpoint) => fetchAPI(endpoint),
  post: (endpoint, data) => fetchAPI(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  }),
  patch: (endpoint, data) => fetchAPI(endpoint, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  }),

  // Auth
  login: async (username, password) => {
    const data = await fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  
  register: (data) =>
    fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () => {
    localStorage.removeItem('user');
    return Promise.resolve({ status: 'success' });
  },
  
  me: () => fetchAPI("/auth/me"),

  // Dashboard
  getDashboardStats: () => fetchAPI("/dashboard/stats"),
  
  // Advanced Dashboards
  getExecutiveDashboard: (branchId) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/dashboards/executive${params}`);
  },
  getOperationsDashboard: (branchId) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/dashboards/operations${params}`);
  },
  getRiskDashboard: (branchId) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/dashboards/risk${params}`);
  },
  getMemberAnalyticsDashboard: (branchId) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/dashboards/member-analytics${params}`);
  },
  getForecastDashboard: (branchId) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/dashboards/forecast${params}`);
  },
  getDashboardSummary: (branchId) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/dashboards/summary${params}`);
  },
  getAdminDashboard: (branchId) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/dashboards/admin${params}`);
  },
  getKPI: (kpiName, branchId, period) => {
    const params = new URLSearchParams();
    if (branchId) params.append("branch_id", branchId.toString());
    if (period) params.append("period", period);
    return fetchAPI(`/dashboards/kpi/${kpiName}?${params}`);
  },
  refreshDashboardCache: (dashboardType = "all", branchId) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/dashboards/refresh${params}`, {
      method: "POST",
      body: JSON.stringify({ dashboard_type: dashboardType }),
    });
  },
  
  // AI Analytics
  getAIAnalytics: () => fetchAPI("/ai-analytics/summary"),
  getAIInsights: () => fetchAPI("/ai-analytics/insights"),
  getAIForecasts: () => fetchAPI("/ai-analytics/forecasts"),
  getArrearsForcast: (monthsAhead = 12, branchId) => {
    const params = new URLSearchParams();
    params.append("months_ahead", monthsAhead.toString());
    if (branchId) params.append("branch_id", branchId.toString());
    return fetchAPI(`/ai-analytics/arrears-forecast?${params}`);
  },
  getMemberBehavior: (branchId) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/ai-analytics/member-behavior${params}`);
  },
  getAtRiskMembers: (threshold = 0.6, branchId) => {
    const params = new URLSearchParams();
    params.append("threshold", threshold.toString());
    if (branchId) params.append("branch_id", branchId.toString());
    return fetchAPI(`/ai-analytics/at-risk-members?${params}`);
  },
  getCohortAnalysis: (branchId) => {
    const params = branchId ? `?branch_id=${branchId}` : "";
    return fetchAPI(`/ai-analytics/cohort-analysis${params}`);
  },

  // Branches
  getBranches: () => fetchAPI("/branches"),
  getBranch: (id) => fetchAPI(`/branches/${id}`),
  createBranch: (data) =>
    fetchAPI("/branches", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBranch: (id, data) =>
    fetchAPI(`/branches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteBranch: (id) =>
    fetchAPI(`/branches/${id}`, { method: "DELETE" }),
  getBranchStaff: (branchId) =>
    fetchAPI(`/branches/${branchId}/staff`),

  // Groups
  getGroups: () => fetchAPI("/groups"),
  getGroup: (id) => fetchAPI(`/groups/${id}`),
  createGroup: (data) =>
    fetchAPI("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateGroup: (id, data) =>
    fetchAPI(`/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteGroup: (id) =>
    fetchAPI(`/groups/${id}`, { method: "DELETE" }),

  // Members
  getMembers: () => fetchAPI("/members"),
  getMember: (id) => fetchAPI(`/members/${id}`),
  createMember: (data) =>
    fetchAPI("/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateMember: (id, data) =>
    fetchAPI(`/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteMember: (id) =>
    fetchAPI(`/members/${id}`, { method: "DELETE" }),

  // Loan Products
  getLoanProducts: () => fetchAPI("/loan-products"),
  getLoanProduct: (id) => fetchAPI(`/loan-products/${id}`),
  createLoanProduct: (data) =>
    fetchAPI("/loan-products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateLoanProduct: (id, data) =>
    fetchAPI(`/loan-products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Loan Types
  getLoanTypes: () => fetchAPI("/loan-types"),
  getLoanType: (id) => fetchAPI(`/loan-types/${id}`),
  createLoanType: (data) =>
    fetchAPI("/loan-types", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateLoanType: (id, data) =>
    fetchAPI(`/loan-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteLoanType: (id) =>
    fetchAPI(`/loan-types/${id}`, { method: "DELETE" }),

  // Loans
  getLoans: (status) => {
    const params = status ? `?status=${status}` : "";
    return fetchAPI(`/loans${params}`);
  },
  getLoan: (id) => fetchAPI(`/loans/${id}`),
  createLoan: (data) =>
    fetchAPI("/loans", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateLoan: (id, data) =>
    fetchAPI(`/loans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteLoan: (id) =>
    fetchAPI(`/loans/${id}`, { method: "DELETE" }),
  markLoanUnderReview: (id) =>
    fetchAPI(`/loans/${id}/under-review`, {
      method: "POST",
    }),
  approveLoan: (id, data) =>
    fetchAPI(`/loans/${id}/approve`, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  rejectLoan: (id, reason) =>
    fetchAPI(`/loans/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  disburseLoan: (id, data) =>
    fetchAPI(`/loans/${id}/disburse`, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  releaseLoan: (id) =>
    fetchAPI(`/loans/${id}/release`, {
      method: "POST",
    }),

  // Transactions
  getTransactions: (memberId) => {
    const params = memberId ? `?memberId=${memberId}` : "";
    return fetchAPI(`/transactions${params}`);
  },
  getTransaction: (id) => fetchAPI(`/transactions/${id}`),
  createTransaction: (data) =>
    fetchAPI("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTransaction: (id, data) =>
    fetchAPI(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteTransaction: (id) =>
    fetchAPI(`/transactions/${id}`, { method: "DELETE" }),
  approveDeposit: (transactionId) =>
    fetchAPI(`/transactions/${transactionId}/approve`, {
      method: "POST",
    }),
  rejectDeposit: (transactionId, reason) =>
    fetchAPI(`/transactions/${transactionId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  initiateStkPush: (data) =>
    fetchAPI("/transactions/stk-push", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Users (Admin Management)
  getUsers: (page, perPage, role, branchId) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (perPage) params.append("per_page", perPage.toString());
    if (role) params.append("role", role);
    if (branchId) params.append("branch_id", branchId.toString());
    return fetchAPI(`/users?${params}`);
  },
  getUser: (id) => fetchAPI(`/users/${id}`),
  createUser: (data) =>
    fetchAPI("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (id, data) =>
    fetchAPI(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteUser: (id) =>
    fetchAPI(`/users/${id}`, { method: "DELETE" }),
  activateUser: (id) =>
    fetchAPI(`/users/${id}/activate`, { method: "PUT" }),
  deactivateUser: (id) =>
    fetchAPI(`/users/${id}/deactivate`, { method: "PUT" }),

  // Suppliers
  getSuppliers: (page, perPage, isActive) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (perPage) params.append("per_page", perPage.toString());
    if (isActive !== undefined) params.append("is_active", isActive.toString());
    return fetchAPI(`/suppliers?${params}`);
  },
  getSupplier: (id) => fetchAPI(`/suppliers/${id}`),
  createSupplier: (data) =>
    fetchAPI("/suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSupplier: (id, data) =>
    fetchAPI(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteSupplier: (id) =>
    fetchAPI(`/suppliers/${id}`, { method: "DELETE" }),
  rateSupplier: (id, rating) =>
    fetchAPI(`/suppliers/${id}/rate`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    }),

  // Stock/Inventory
  getStock: (page, perPage) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (perPage) params.append("per_page", perPage.toString());
    return fetchAPI(`/stock?${params}`);
  },
  getStockItem: (id) => fetchAPI(`/stock/${id}`),
  createStockItem: (data) =>
    fetchAPI("/stock", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStockItem: (id, data) =>
    fetchAPI(`/stock/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteStockItem: (id) =>
    fetchAPI(`/stock/${id}`, { method: "DELETE" }),
  getLowStockProducts: () => fetchAPI("/stock/low-stock"),
  getCriticalStockProducts: () => fetchAPI("/stock/critical-stock"),

  // Reports
  getReports: () => fetchAPI("/reports"),
  getReport: (id) => fetchAPI(`/reports/${id}`),
  generateReport: (type, data) =>
    fetchAPI("/reports", {
      method: "POST",
      body: JSON.stringify({ type, ...data }),
    }),

  // Field Officer
  getFieldOfficerGroups: () => fetchAPI("/field-officer/groups"),
  getGroupMembers: (groupId) => fetchAPI(`/field-officer/groups/${groupId}/members`),
  getGroupStats: (groupId) => fetchAPI(`/field-officer/groups/${groupId}/stats`),
  getMemberDashboard: (memberId) => fetchAPI(`/field-officer/members/${memberId}/dashboard`),
  applyLoanForMember: (memberId, data) =>
    fetchAPI(`/field-officer/members/${memberId}/apply-loan`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  transferFunds: (memberId, data) =>
    fetchAPI(`/field-officer/members/${memberId}/transfer`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createFieldOfficerGroup: (data) =>
    fetchAPI("/field-officer/groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  addMemberToGroup: (data) => fetchAPI("/field-officer/members", {
      method: "POST",
      body: JSON.stringify(data),
  }),

  // Member Approval
  getPendingMembers: () => fetchAPI("/field-officer/members/pending-approval"),
  approveMember: (memberId) =>
    fetchAPI(`/field-officer/members/${memberId}/approve`, {
      method: "POST",
    }),
  rejectMember: (memberId) =>
    fetchAPI(`/field-officer/members/${memberId}/reject`, {
      method: "POST",
    }),
  bulkApproveMembers: (memberIds) =>
    fetchAPI("/field-officer/members/bulk-approve", {
      method: "POST",
      body: JSON.stringify({ memberIds }),
    }),

  // First Deposit Processing
  processFirstDeposit: (data) =>
    fetchAPI("/field-officer/transactions/first-deposit", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Member Management
  getMemberLoanLimit: (memberId) =>
    fetchAPI(`/members/${memberId}/loan-limit`),

  // Enhanced Member Creation (for procurement officer flow)
  createMemberWithApproval: (data) =>
    fetchAPI("/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Member Status Management
  getPendingMemberApprovals: () => 
    fetchAPI("/members/pending-approval"),

  approveMemberById: (memberId) =>
    fetchAPI(`/members/${memberId}/approve`, {
      method: "POST",
    }),

  processRegistrationFee: (memberId) =>
    fetchAPI(`/members/${memberId}/process-registration-fee`, {
      method: "POST",
    }),

  getSchedule: async () => {
    // Mock data for now, simulating API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        date: new Date().toISOString(),
        groupName: 'Nairobi West Group',
        location: 'Westlands Community Hall',
        time: '10:00 AM',
        status: 'in-progress',
        type: 'meeting',
        contactPerson: 'John Doe',
        phone: '+254 712 345 678'
      },
      {
        id: '2',
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        groupName: 'South C Savings Group',
        location: 'South C Market',
        time: '2:00 PM',
        status: 'pending',
        type: 'collection',
        contactPerson: 'Jane Smith',
        phone: '+254 722 123 456'
      },
      {
        id: '3',
        date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        groupName: 'Kilimani Business Group',
        location: 'Kilimani Plaza',
        time: '3:30 PM',
        status: 'pending',
        type: 'disbursement',
        contactPerson: 'Michael Johnson',
        phone: '+254 733 987 654'
      },
      {
        id: '4',
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        groupName: 'Langata Women Group',
        location: 'Langata Primary School',
        time: '11:00 AM',
        status: 'completed',
        type: 'visit',
        contactPerson: 'Sarah Williams',
        phone: '+254 711 222 333'
      }
    ];
  },
};

