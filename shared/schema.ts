import { z } from 'zod'

export const userSchema = z.object({
  id: z.number().optional(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true, updatedAt: true })

export const loanProductSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  interestRate: z.number(),
  maxAmount: z.number(),
  minAmount: z.number(),
  term: z.number(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const insertLoanProductSchema = loanProductSchema.omit({ id: true, createdAt: true, updatedAt: true })

export const loanSchema = z.object({
  id: z.number().optional(),
  memberId: z.number(),
  productId: z.number(),
  amount: z.number(),
  status: z.enum(['pending', 'approved', 'rejected', 'disbursed', 'repaid']),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const insertLoanSchema = loanSchema.omit({ id: true, createdAt: true, updatedAt: true })

export const memberSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  joinDate: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const insertMemberSchema = memberSchema.omit({ id: true, createdAt: true, updatedAt: true })

export type User = z.infer<typeof userSchema>
export type InsertUser = z.infer<typeof insertUserSchema>
export type LoanProduct = z.infer<typeof loanProductSchema>
export type InsertLoanProduct = z.infer<typeof insertLoanProductSchema>
export type Loan = z.infer<typeof loanSchema>
export type InsertLoan = z.infer<typeof insertLoanSchema>
export type Member = z.infer<typeof memberSchema>
export type InsertMember = z.infer<typeof insertMemberSchema>
