import { db } from "./db";
import {
  users,
  branches,
  productCategories,
  loanProducts,
  loanTypes,
  groups,
  members,
  savingsAccounts,
  drawdownAccounts,
} from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const [admin] = await db.insert(users).values({
    username: "admin",
    phone: "0712000000",
    password: hashedPassword,
    role: "admin",
    firstName: "System",
    lastName: "Administrator",
    isActive: true,
  }).returning();
  console.log("✓ Admin user created");

  // Create branches
  const [mainBranch] = await db.insert(branches).values({
    name: "Nairobi Main",
    location: "Nairobi CBD",
    managerId: admin.id,
    isActive: true,
  }).returning();

  const [mombasa] = await db.insert(branches).values({
    name: "Mombasa Branch",
    location: "Mombasa Town",
    managerId: admin.id,
    isActive: true,
  }).returning();
  console.log("✓ Branches created");

  // Create loan officer
  const [loanOfficer] = await db.insert(users).values({
    username: "james.mutua",
    phone: "0723456789",
    password: await bcrypt.hash("officer123", 10),
    role: "loan_officer",
    firstName: "James",
    lastName: "Mutua",
    branchId: mainBranch.id,
    isActive: true,
  }).returning();
  console.log("✓ Loan officer created");

  // Create product categories
  const [energyCat] = await db.insert(productCategories).values({
    name: "Energy",
    description: "Solar products and batteries",
  }).returning();

  const [electronicsCat] = await db.insert(productCategories).values({
    name: "Electronics",
    description: "Phones and electronic devices",
  }).returning();

  const [agricultureCat] = await db.insert(productCategories).values({
    name: "Agriculture",
    description: "Farming equipment and supplies",
  }).returning();
  console.log("✓ Product categories created");

  // Create loan products
  await db.insert(loanProducts).values([
    {
      name: "Solar Battery 200Ah",
      categoryId: energyCat.id,
      buyingPrice: "1200",
      sellingPrice: "1500",
      stockQuantity: 45,
      lowStockThreshold: 10,
      criticalStockThreshold: 5,
      isActive: true,
    },
    {
      name: "Samsung Galaxy A14",
      categoryId: electronicsCat.id,
      buyingPrice: "16000",
      sellingPrice: "18500",
      stockQuantity: 12,
      lowStockThreshold: 5,
      criticalStockThreshold: 2,
      isActive: true,
    },
    {
      name: "Solar Panel 150W",
      categoryId: energyCat.id,
      buyingPrice: "6500",
      sellingPrice: "8000",
      stockQuantity: 8,
      lowStockThreshold: 10,
      criticalStockThreshold: 5,
      isActive: true,
    },
    {
      name: "Water Pump",
      categoryId: agricultureCat.id,
      buyingPrice: "22000",
      sellingPrice: "25000",
      stockQuantity: 20,
      lowStockThreshold: 5,
      criticalStockThreshold: 2,
      isActive: true,
    },
  ]);
  console.log("✓ Loan products created");

  // Create loan types
  await db.insert(loanTypes).values([
    {
      name: "Quick Loan",
      interestRate: "2.00",
      interestType: "flat",
      chargeFeePercentage: "4.00",
      minAmount: "2000",
      maxAmount: "20000",
      durationMonths: 2,
      isActive: true,
    },
    {
      name: "Business Loan",
      interestRate: "3.50",
      interestType: "flat",
      chargeFeePercentage: "4.00",
      minAmount: "20000",
      maxAmount: "100000",
      durationMonths: 3,
      isActive: true,
    },
    {
      name: "Asset Finance",
      interestRate: "5.00",
      interestType: "reducing",
      chargeFeePercentage: "4.00",
      minAmount: "50000",
      maxAmount: "500000",
      durationMonths: 6,
      isActive: true,
    },
  ]);
  console.log("✓ Loan types created");

  // Create groups
  const [groupA] = await db.insert(groups).values({
    name: "Imarisha A",
    branchId: mainBranch.id,
    loanOfficerId: loanOfficer.id,
    maxMembers: 8,
    isActive: true,
  }).returning();

  await db.insert(groups).values({
    name: "Biashara B",
    branchId: mainBranch.id,
    loanOfficerId: loanOfficer.id,
    maxMembers: 8,
    isActive: true,
  });
  console.log("✓ Groups created");

  // Create sample members
  const [customerUser1] = await db.insert(users).values({
    username: "sarah.wanjiku",
    phone: "0722123456",
    password: await bcrypt.hash("customer123", 10),
    role: "customer",
    firstName: "Sarah",
    lastName: "Wanjiku",
    branchId: mainBranch.id,
    isActive: true,
  }).returning();

  const [member1] = await db.insert(members).values({
    userId: customerUser1.id,
    groupId: groupA.id,
    memberCode: "MB001",
    registrationFee: "800",
    registrationFeePaid: true,
    status: "active",
  }).returning();

  // Create savings and drawdown accounts
  await db.insert(savingsAccounts).values({
    memberId: member1.id,
    accountNumber: `SAV-${member1.memberCode}`,
    balance: "45000",
  });

  await db.insert(drawdownAccounts).values({
    memberId: member1.id,
    accountNumber: `DRW-${member1.memberCode}`,
    balance: "5000",
  });

  console.log("✓ Sample member created");
  console.log("\n✅ Database seeded successfully!");
  console.log("\n📝 Login credentials:");
  console.log("   Username: admin");
  console.log("   Password: admin123");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .then(() => process.exit(0));
