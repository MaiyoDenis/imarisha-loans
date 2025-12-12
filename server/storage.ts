import {
  type User,
  type InsertUser,
  users,
  branches,
  groups,
  members,
  savingsAccounts,
  drawdownAccounts,
  productCategories,
  loanProducts,
  loanTypes,
  loans,
  loanProductItems,
  transactions,
  activityLogs,
  type Branch,
  type InsertBranch,
  type Group,
  type InsertGroup,
  type Member,
  type InsertMember,
  type LoanProduct,
  type InsertLoanProduct,
  type LoanType,
  type InsertLoanType,
  type Loan,
  type InsertLoan,
  type Transaction,
  type InsertTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersByBranch(branchId: number): Promise<User[]>;

  // Branches
  getBranches(): Promise<Branch[]>;
  getBranch(id: number): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch | undefined>;

  // Groups
  getGroups(): Promise<Group[]>;
  getGroupsByBranch(branchId: number): Promise<Group[]>;
  getGroupsByLoanOfficer(loanOfficerId: number): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group | undefined>;

  // Members
  getMembers(): Promise<Member[]>;
  getMembersByGroup(groupId: number): Promise<Member[]>;
  getMember(id: number): Promise<Member | undefined>;
  getMemberByCode(memberCode: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, member: Partial<InsertMember>): Promise<Member | undefined>;

  // Loan Products
  getLoanProducts(): Promise<LoanProduct[]>;
  getLoanProductsByCategory(categoryId: number): Promise<LoanProduct[]>;
  getLoanProduct(id: number): Promise<LoanProduct | undefined>;
  createLoanProduct(product: InsertLoanProduct): Promise<LoanProduct>;
  updateLoanProduct(id: number, product: Partial<InsertLoanProduct>): Promise<LoanProduct | undefined>;
  updateProductStock(id: number, quantity: number): Promise<LoanProduct | undefined>;

  // Loan Types
  getLoanTypes(): Promise<LoanType[]>;
  getLoanType(id: number): Promise<LoanType | undefined>;
  createLoanType(loanType: InsertLoanType): Promise<LoanType>;
  updateLoanType(id: number, loanType: Partial<InsertLoanType>): Promise<LoanType | undefined>;

  // Loans
  getLoans(): Promise<Loan[]>;
  getLoansByMember(memberId: number): Promise<Loan[]>;
  getLoansByStatus(status: string): Promise<Loan[]>;
  getLoan(id: number): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: number, loan: Partial<InsertLoan>): Promise<Loan | undefined>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByMember(memberId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    totalActiveLoans: string;
    totalSavings: string;
    activeMembers: number;
    arrearsCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, role));
  }

  async getUsersByBranch(branchId: number): Promise<User[]> {
    return db.select().from(users).where(eq(users.branchId, branchId));
  }

  // Branches
  async getBranches(): Promise<Branch[]> {
    return db.select().from(branches).orderBy(desc(branches.createdAt));
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch || undefined;
  }

  async createBranch(insertBranch: InsertBranch): Promise<Branch> {
    const [branch] = await db.insert(branches).values(insertBranch).returning();
    return branch;
  }

  async updateBranch(id: number, updateData: Partial<InsertBranch>): Promise<Branch | undefined> {
    const [branch] = await db.update(branches).set(updateData).where(eq(branches.id, id)).returning();
    return branch || undefined;
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    return db.select().from(groups).orderBy(desc(groups.createdAt));
  }

  async getGroupsByBranch(branchId: number): Promise<Group[]> {
    return db.select().from(groups).where(eq(groups.branchId, branchId));
  }

  async getGroupsByLoanOfficer(loanOfficerId: number): Promise<Group[]> {
    return db.select().from(groups).where(eq(groups.loanOfficerId, loanOfficerId));
  }

  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group || undefined;
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const [group] = await db.insert(groups).values(insertGroup).returning();
    return group;
  }

  async updateGroup(id: number, updateData: Partial<InsertGroup>): Promise<Group | undefined> {
    const [group] = await db.update(groups).set(updateData).where(eq(groups.id, id)).returning();
    return group || undefined;
  }

  // Members
  async getMembers(): Promise<Member[]> {
    return db.select().from(members).orderBy(desc(members.createdAt));
  }

  async getMembersByGroup(groupId: number): Promise<Member[]> {
    return db.select().from(members).where(eq(members.groupId, groupId));
  }

  async getMember(id: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member || undefined;
  }

  async getMemberByCode(memberCode: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.memberCode, memberCode));
    return member || undefined;
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const [member] = await db.insert(members).values(insertMember).returning();
    return member;
  }

  async updateMember(id: number, updateData: Partial<InsertMember>): Promise<Member | undefined> {
    const [member] = await db.update(members).set(updateData).where(eq(members.id, id)).returning();
    return member || undefined;
  }

  // Loan Products
  async getLoanProducts(): Promise<LoanProduct[]> {
    return db.select().from(loanProducts).where(eq(loanProducts.isActive, true));
  }

  async getLoanProductsByCategory(categoryId: number): Promise<LoanProduct[]> {
    return db.select().from(loanProducts).where(
      and(eq(loanProducts.categoryId, categoryId), eq(loanProducts.isActive, true))
    );
  }

  async getLoanProduct(id: number): Promise<LoanProduct | undefined> {
    const [product] = await db.select().from(loanProducts).where(eq(loanProducts.id, id));
    return product || undefined;
  }

  async createLoanProduct(insertProduct: InsertLoanProduct): Promise<LoanProduct> {
    const [product] = await db.insert(loanProducts).values(insertProduct).returning();
    return product;
  }

  async updateLoanProduct(id: number, updateData: Partial<InsertLoanProduct>): Promise<LoanProduct | undefined> {
    const [product] = await db.update(loanProducts).set(updateData).where(eq(loanProducts.id, id)).returning();
    return product || undefined;
  }

  async updateProductStock(id: number, quantity: number): Promise<LoanProduct | undefined> {
    const [product] = await db.update(loanProducts)
      .set({ stockQuantity: sql`${loanProducts.stockQuantity} + ${quantity}` })
      .where(eq(loanProducts.id, id))
      .returning();
    return product || undefined;
  }

  // Loan Types
  async getLoanTypes(): Promise<LoanType[]> {
    return db.select().from(loanTypes).where(eq(loanTypes.isActive, true));
  }

  async getLoanType(id: number): Promise<LoanType | undefined> {
    const [loanType] = await db.select().from(loanTypes).where(eq(loanTypes.id, id));
    return loanType || undefined;
  }

  async createLoanType(insertLoanType: InsertLoanType): Promise<LoanType> {
    const [loanType] = await db.insert(loanTypes).values(insertLoanType).returning();
    return loanType;
  }

  async updateLoanType(id: number, updateData: Partial<InsertLoanType>): Promise<LoanType | undefined> {
    const [loanType] = await db.update(loanTypes).set(updateData).where(eq(loanTypes.id, id)).returning();
    return loanType || undefined;
  }

  // Loans
  async getLoans(): Promise<Loan[]> {
    return db.select().from(loans).orderBy(desc(loans.createdAt));
  }

  async getLoansByMember(memberId: number): Promise<Loan[]> {
    return db.select().from(loans).where(eq(loans.memberId, memberId));
  }

  async getLoansByStatus(status: string): Promise<Loan[]> {
    return db.select().from(loans).where(eq(loans.status, status));
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, id));
    return loan || undefined;
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const [loan] = await db.insert(loans).values(insertLoan).returning();
    return loan;
  }

  async updateLoan(id: number, updateData: Partial<InsertLoan>): Promise<Loan | undefined> {
    const [loan] = await db.update(loans).set(updateData).where(eq(loans.id, id)).returning();
    return loan || undefined;
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(100);
  }

  async getTransactionsByMember(memberId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.memberId, memberId)).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    totalActiveLoans: string;
    totalSavings: string;
    activeMembers: number;
    arrearsCount: number;
  }> {
    // Get total active loans
    const [activeLoanSum] = await db.select({
      total: sql<string>`COALESCE(SUM(${loans.outstandingBalance}), 0)::text`
    }).from(loans).where(eq(loans.status, 'active'));

    // Get total savings
    const [savingsSum] = await db.select({
      total: sql<string>`COALESCE(SUM(${savingsAccounts.balance}), 0)::text`
    }).from(savingsAccounts);

    // Get active members count
    const [membersCount] = await db.select({
      count: sql<number>`COUNT(*)::int`
    }).from(members).where(eq(members.status, 'active'));

    // Get arrears count (loans overdue)
    const [arrearsCount] = await db.select({
      count: sql<number>`COUNT(*)::int`
    }).from(loans).where(
      and(
        eq(loans.status, 'active'),
        sql`${loans.dueDate} < NOW() - INTERVAL '7 days'`
      )
    );

    return {
      totalActiveLoans: activeLoanSum?.total || '0',
      totalSavings: savingsSum?.total || '0',
      activeMembers: membersCount?.count || 0,
      arrearsCount: arrearsCount?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
