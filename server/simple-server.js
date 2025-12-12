import express from 'express';
import cors from 'cors';
import session from 'express-session';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(session({
  secret: 'imarisha-loan-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
  },
}));

// Mock data
const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', name: 'System Administrator' }
];

// Mock database
const mockData = {
  branches: [
    { id: 1, name: 'Main Branch', location: 'Nairobi', manager: 'John Doe' },
    { id: 2, name: 'West Branch', location: 'Kisumu', manager: 'Jane Smith' }
  ],
  groups: [
    { id: 1, name: 'Farmers Group A', branchId: 1, members: 15 },
    { id: 2, name: 'Women Group B', branchId: 2, members: 12 }
  ],
  members: [
    { id: 1, name: 'Alice Johnson', groupId: 1, joinDate: '2023-01-15' },
    { id: 2, name: 'Bob Wilson', groupId: 1, joinDate: '2023-02-20' },
    { id: 3, name: 'Carol Brown', groupId: 2, joinDate: '2023-03-10' }
  ],
  loanProducts: [
    { id: 1, name: 'Micro Loan', maxAmount: 50000, interestRate: 12 },
    { id: 2, name: 'Small Business Loan', maxAmount: 200000, interestRate: 10 }
  ],
  loans: [
    { id: 1, memberId: 1, productId: 1, amount: 25000, status: 'active' },
    { id: 2, memberId: 2, productId: 1, amount: 15000, status: 'active' }
  ]
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = mockUsers.find(u => u.username === username && u.password === password);
  
  if (user) {
    req.session.userId = user.id;
    res.json({ id: user.id, username: user.username, name: user.name });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const user = mockUsers.find(u => u.id === req.session.userId);
  if (user) {
    res.json({ id: user.id, username: user.username, name: user.name });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalMembers: mockData.members.length,
    activeLoans: mockData.loans.filter(l => l.status === 'active').length,
    totalBranches: mockData.branches.length,
    totalGroups: mockData.groups.length
  });
});

// Branches
app.get('/api/branches', (req, res) => {
  res.json(mockData.branches);
});

app.post('/api/branches', (req, res) => {
  const newBranch = {
    id: mockData.branches.length + 1,
    ...req.body
  };
  mockData.branches.push(newBranch);
  res.json(newBranch);
});

app.get('/api/branches/:id', (req, res) => {
  const branch = mockData.branches.find(b => b.id === parseInt(req.params.id));
  if (branch) {
    res.json(branch);
  } else {
    res.status(404).json({ error: 'Branch not found' });
  }
});

// Groups
app.get('/api/groups', (req, res) => {
  res.json(mockData.groups);
});

app.post('/api/groups', (req, res) => {
  const newGroup = {
    id: mockData.groups.length + 1,
    ...req.body
  };
  mockData.groups.push(newGroup);
  res.json(newGroup);
});

// Members
app.get('/api/members', (req, res) => {
  res.json(mockData.members);
});

// Loan Products
app.get('/api/loan-products', (req, res) => {
  res.json(mockData.loanProducts);
});

app.post('/api/loan-products', (req, res) => {
  const newProduct = {
    id: mockData.loanProducts.length + 1,
    ...req.body
  };
  mockData.loanProducts.push(newProduct);
  res.json(newProduct);
});

app.get('/api/loan-products/:id', (req, res) => {
  const product = mockData.loanProducts.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Loan product not found' });
  }
});

app.patch('/api/loan-products/:id', (req, res) => {
  const productIndex = mockData.loanProducts.findIndex(p => p.id === parseInt(req.params.id));
  if (productIndex !== -1) {
    mockData.loanProducts[productIndex] = { ...mockData.loanProducts[productIndex], ...req.body };
    res.json(mockData.loanProducts[productIndex]);
  } else {
    res.status(404).json({ error: 'Loan product not found' });
  }
});

// Loans
app.get('/api/loans', (req, res) => {
  const { status } = req.query;
  let loans = mockData.loans;
  if (status) {
    loans = loans.filter(l => l.status === status);
  }
  res.json(loans);
});

app.get('/api/loans/:id', (req, res) => {
  const loan = mockData.loans.find(l => l.id === parseInt(req.params.id));
  if (loan) {
    res.json(loan);
  } else {
    res.status(404).json({ error: 'Loan not found' });
  }
});

// Loan Types (if needed)
app.get('/api/loan-types', (req, res) => {
  res.json([
    { id: 1, name: 'Individual', description: 'Individual loan' },
    { id: 2, name: 'Group', description: 'Group loan' }
  ]);
});

app.post('/api/loan-types', (req, res) => {
  res.json({ id: Date.now(), ...req.body });
});

// Transactions
app.get('/api/transactions', (req, res) => {
  const { memberId } = req.query;
  let transactions = [
    { id: 1, memberId: 1, type: 'loan_disbursement', amount: 25000, date: '2023-06-01' },
    { id: 2, memberId: 1, type: 'repayment', amount: 2000, date: '2023-06-15' },
    { id: 3, memberId: 2, type: 'loan_disbursement', amount: 15000, date: '2023-06-05' }
  ];
  
  if (memberId) {
    transactions = transactions.filter(t => t.memberId === parseInt(memberId));
  }
  
  res.json(transactions);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

export default app;
