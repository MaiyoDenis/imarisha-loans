"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const storage_1 = require("./storage");
const zod_1 = require("zod");
const bcrypt_1 = require("bcrypt");
const schema_1 = require("@shared/schema");
async function registerRoutes(httpServer, app) {
    // Auth
    app.post("/api/auth/login", async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await storage_1.storage.getUserByUsername(username);
            if (!user) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            const validPassword = await bcrypt_1.default.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            // Set session
            req.session.userId = user.id;
            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                }
            });
        }
        catch (error) {
            res.status(500).json({ error: "Login failed" });
        }
    });
    app.post("/api/auth/logout", (req, res) => {
        req.session.destroy(() => {
            res.json({ success: true });
        });
    });
    app.get("/api/auth/me", async (req, res) => {
        if (!req.session.userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const user = await storage_1.storage.getUser(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            }
        });
    });
    // Dashboard Stats
    app.get("/api/dashboard/stats", async (req, res) => {
        try {
            const stats = await storage_1.storage.getDashboardStats();
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch dashboard stats" });
        }
    });
    // Branches
    app.get("/api/branches", async (req, res) => {
        try {
            const branches = await storage_1.storage.getBranches();
            res.json(branches);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch branches" });
        }
    });
    app.get("/api/branches/:id", async (req, res) => {
        try {
            const branch = await storage_1.storage.getBranch(parseInt(req.params.id));
            if (!branch) {
                return res.status(404).json({ error: "Branch not found" });
            }
            res.json(branch);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch branch" });
        }
    });
    app.post("/api/branches", async (req, res) => {
        try {
            const data = schema_1.insertBranchSchema.parse(req.body);
            const branch = await storage_1.storage.createBranch(data);
            res.status(201).json(branch);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            res.status(500).json({ error: "Failed to create branch" });
        }
    });
    // Groups
    app.get("/api/groups", async (req, res) => {
        try {
            const groups = await storage_1.storage.getGroups();
            res.json(groups);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch groups" });
        }
    });
    app.post("/api/groups", async (req, res) => {
        try {
            const data = schema_1.insertGroupSchema.parse(req.body);
            const group = await storage_1.storage.createGroup(data);
            res.status(201).json(group);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            res.status(500).json({ error: "Failed to create group" });
        }
    });
    // Members
    app.get("/api/members", async (req, res) => {
        try {
            const members = await storage_1.storage.getMembers();
            res.json(members);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch members" });
        }
    });
    // Loan Products
    app.get("/api/loan-products", async (req, res) => {
        try {
            const products = await storage_1.storage.getLoanProducts();
            res.json(products);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch loan products" });
        }
    });
    app.get("/api/loan-products/:id", async (req, res) => {
        try {
            const product = await storage_1.storage.getLoanProduct(parseInt(req.params.id));
            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.json(product);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch product" });
        }
    });
    app.post("/api/loan-products", async (req, res) => {
        try {
            const data = schema_1.insertLoanProductSchema.parse(req.body);
            const product = await storage_1.storage.createLoanProduct(data);
            res.status(201).json(product);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            res.status(500).json({ error: "Failed to create product" });
        }
    });
    app.patch("/api/loan-products/:id", async (req, res) => {
        try {
            const product = await storage_1.storage.updateLoanProduct(parseInt(req.params.id), req.body);
            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.json(product);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to update product" });
        }
    });
    // Loan Types
    app.get("/api/loan-types", async (req, res) => {
        try {
            const loanTypes = await storage_1.storage.getLoanTypes();
            res.json(loanTypes);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch loan types" });
        }
    });
    app.post("/api/loan-types", async (req, res) => {
        try {
            const data = schema_1.insertLoanTypeSchema.parse(req.body);
            const loanType = await storage_1.storage.createLoanType(data);
            res.status(201).json(loanType);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            res.status(500).json({ error: "Failed to create loan type" });
        }
    });
    // Loans
    app.get("/api/loans", async (req, res) => {
        try {
            const { status } = req.query;
            let loans;
            if (status && typeof status === 'string') {
                loans = await storage_1.storage.getLoansByStatus(status);
            }
            else {
                loans = await storage_1.storage.getLoans();
            }
            res.json(loans);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch loans" });
        }
    });
    app.get("/api/loans/:id", async (req, res) => {
        try {
            const loan = await storage_1.storage.getLoan(parseInt(req.params.id));
            if (!loan) {
                return res.status(404).json({ error: "Loan not found" });
            }
            res.json(loan);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch loan" });
        }
    });
    // Transactions
    app.get("/api/transactions", async (req, res) => {
        try {
            const { memberId } = req.query;
            let transactions;
            if (memberId && typeof memberId === 'string') {
                transactions = await storage_1.storage.getTransactionsByMember(parseInt(memberId));
            }
            else {
                transactions = await storage_1.storage.getTransactions();
            }
            res.json(transactions);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch transactions" });
        }
    });
    return httpServer;
}
