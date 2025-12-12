"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const schema_1 = require("@shared/schema");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
class DatabaseStorage {
    // Users
    async getUser(id) {
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        return user || undefined;
    }
    async getUserByUsername(username) {
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
        return user || undefined;
    }
    async getUserByPhone(phone) {
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.phone, phone));
        return user || undefined;
    }
    async createUser(insertUser) {
        const [user] = await db_1.db.insert(schema_1.users).values(insertUser).returning();
        return user;
    }
    async updateUser(id, updateData) {
        const [user] = await db_1.db.update(schema_1.users).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).returning();
        return user || undefined;
    }
    async getUsersByRole(role) {
        return db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.role, role));
    }
    async getUsersByBranch(branchId) {
        return db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.branchId, branchId));
    }
    // Branches
    async getBranches() {
        return db_1.db.select().from(schema_1.branches).orderBy((0, drizzle_orm_1.desc)(schema_1.branches.createdAt));
    }
    async getBranch(id) {
        const [branch] = await db_1.db.select().from(schema_1.branches).where((0, drizzle_orm_1.eq)(schema_1.branches.id, id));
        return branch || undefined;
    }
    async createBranch(insertBranch) {
        const [branch] = await db_1.db.insert(schema_1.branches).values(insertBranch).returning();
        return branch;
    }
    async updateBranch(id, updateData) {
        const [branch] = await db_1.db.update(schema_1.branches).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.branches.id, id)).returning();
        return branch || undefined;
    }
    // Groups
    async getGroups() {
        return db_1.db.select().from(schema_1.groups).orderBy((0, drizzle_orm_1.desc)(schema_1.groups.createdAt));
    }
    async getGroupsByBranch(branchId) {
        return db_1.db.select().from(schema_1.groups).where((0, drizzle_orm_1.eq)(schema_1.groups.branchId, branchId));
    }
    async getGroupsByLoanOfficer(loanOfficerId) {
        return db_1.db.select().from(schema_1.groups).where((0, drizzle_orm_1.eq)(schema_1.groups.loanOfficerId, loanOfficerId));
    }
    async getGroup(id) {
        const [group] = await db_1.db.select().from(schema_1.groups).where((0, drizzle_orm_1.eq)(schema_1.groups.id, id));
        return group || undefined;
    }
    async createGroup(insertGroup) {
        const [group] = await db_1.db.insert(schema_1.groups).values(insertGroup).returning();
        return group;
    }
    async updateGroup(id, updateData) {
        const [group] = await db_1.db.update(schema_1.groups).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.groups.id, id)).returning();
        return group || undefined;
    }
    // Members
    async getMembers() {
        return db_1.db.select().from(schema_1.members).orderBy((0, drizzle_orm_1.desc)(schema_1.members.createdAt));
    }
    async getMembersByGroup(groupId) {
        return db_1.db.select().from(schema_1.members).where((0, drizzle_orm_1.eq)(schema_1.members.groupId, groupId));
    }
    async getMember(id) {
        const [member] = await db_1.db.select().from(schema_1.members).where((0, drizzle_orm_1.eq)(schema_1.members.id, id));
        return member || undefined;
    }
    async getMemberByCode(memberCode) {
        const [member] = await db_1.db.select().from(schema_1.members).where((0, drizzle_orm_1.eq)(schema_1.members.memberCode, memberCode));
        return member || undefined;
    }
    async createMember(insertMember) {
        const [member] = await db_1.db.insert(schema_1.members).values(insertMember).returning();
        return member;
    }
    async updateMember(id, updateData) {
        const [member] = await db_1.db.update(schema_1.members).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.members.id, id)).returning();
        return member || undefined;
    }
    // Loan Products
    async getLoanProducts() {
        return db_1.db.select().from(schema_1.loanProducts).where((0, drizzle_orm_1.eq)(schema_1.loanProducts.isActive, true));
    }
    async getLoanProductsByCategory(categoryId) {
        return db_1.db.select().from(schema_1.loanProducts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.loanProducts.categoryId, categoryId), (0, drizzle_orm_1.eq)(schema_1.loanProducts.isActive, true)));
    }
    async getLoanProduct(id) {
        const [product] = await db_1.db.select().from(schema_1.loanProducts).where((0, drizzle_orm_1.eq)(schema_1.loanProducts.id, id));
        return product || undefined;
    }
    async createLoanProduct(insertProduct) {
        const [product] = await db_1.db.insert(schema_1.loanProducts).values(insertProduct).returning();
        return product;
    }
    async updateLoanProduct(id, updateData) {
        const [product] = await db_1.db.update(schema_1.loanProducts).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.loanProducts.id, id)).returning();
        return product || undefined;
    }
    async updateProductStock(id, quantity) {
        const [product] = await db_1.db.update(schema_1.loanProducts)
            .set({ stockQuantity: (0, drizzle_orm_1.sql) `${schema_1.loanProducts.stockQuantity} + ${quantity}` })
            .where((0, drizzle_orm_1.eq)(schema_1.loanProducts.id, id))
            .returning();
        return product || undefined;
    }
    // Loan Types
    async getLoanTypes() {
        return db_1.db.select().from(schema_1.loanTypes).where((0, drizzle_orm_1.eq)(schema_1.loanTypes.isActive, true));
    }
    async getLoanType(id) {
        const [loanType] = await db_1.db.select().from(schema_1.loanTypes).where((0, drizzle_orm_1.eq)(schema_1.loanTypes.id, id));
        return loanType || undefined;
    }
    async createLoanType(insertLoanType) {
        const [loanType] = await db_1.db.insert(schema_1.loanTypes).values(insertLoanType).returning();
        return loanType;
    }
    async updateLoanType(id, updateData) {
        const [loanType] = await db_1.db.update(schema_1.loanTypes).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.loanTypes.id, id)).returning();
        return loanType || undefined;
    }
    // Loans
    async getLoans() {
        return db_1.db.select().from(schema_1.loans).orderBy((0, drizzle_orm_1.desc)(schema_1.loans.createdAt));
    }
    async getLoansByMember(memberId) {
        return db_1.db.select().from(schema_1.loans).where((0, drizzle_orm_1.eq)(schema_1.loans.memberId, memberId));
    }
    async getLoansByStatus(status) {
        return db_1.db.select().from(schema_1.loans).where((0, drizzle_orm_1.eq)(schema_1.loans.status, status));
    }
    async getLoan(id) {
        const [loan] = await db_1.db.select().from(schema_1.loans).where((0, drizzle_orm_1.eq)(schema_1.loans.id, id));
        return loan || undefined;
    }
    async createLoan(insertLoan) {
        const [loan] = await db_1.db.insert(schema_1.loans).values(insertLoan).returning();
        return loan;
    }
    async updateLoan(id, updateData) {
        const [loan] = await db_1.db.update(schema_1.loans).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.loans.id, id)).returning();
        return loan || undefined;
    }
    // Transactions
    async getTransactions() {
        return db_1.db.select().from(schema_1.transactions).orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.createdAt)).limit(100);
    }
    async getTransactionsByMember(memberId) {
        return db_1.db.select().from(schema_1.transactions).where((0, drizzle_orm_1.eq)(schema_1.transactions.memberId, memberId)).orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.createdAt));
    }
    async createTransaction(insertTransaction) {
        const [transaction] = await db_1.db.insert(schema_1.transactions).values(insertTransaction).returning();
        return transaction;
    }
    // Dashboard Stats
    async getDashboardStats() {
        // Get total active loans
        const [activeLoanSum] = await db_1.db.select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.loans.outstandingBalance}), 0)::text`
        }).from(schema_1.loans).where((0, drizzle_orm_1.eq)(schema_1.loans.status, 'active'));
        // Get total savings
        const [savingsSum] = await db_1.db.select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_1.savingsAccounts.balance}), 0)::text`
        }).from(schema_1.savingsAccounts);
        // Get active members count
        const [membersCount] = await db_1.db.select({
            count: (0, drizzle_orm_1.sql) `COUNT(*)::int`
        }).from(schema_1.members).where((0, drizzle_orm_1.eq)(schema_1.members.status, 'active'));
        // Get arrears count (loans overdue)
        const [arrearsCount] = await db_1.db.select({
            count: (0, drizzle_orm_1.sql) `COUNT(*)::int`
        }).from(schema_1.loans).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.loans.status, 'active'), (0, drizzle_orm_1.sql) `${schema_1.loans.dueDate} < NOW() - INTERVAL '7 days'`));
        return {
            totalActiveLoans: activeLoanSum?.total || '0',
            totalSavings: savingsSum?.total || '0',
            activeMembers: membersCount?.count || 0,
            arrearsCount: arrearsCount?.count || 0,
        };
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
