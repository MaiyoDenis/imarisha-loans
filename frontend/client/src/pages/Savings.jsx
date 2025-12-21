var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MoreHorizontal, Download, Wallet, ArrowUpRight, ArrowDownLeft, CreditCard } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
export default function Savings() {
    var _this = this;
    var _a = useQuery({
        queryKey: ["savings-accounts"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Simulate savings account data - in real implementation you'd have an endpoint
                return [2 /*return*/, [
                        {
                            id: 1,
                            memberId: 1,
                            accountNumber: "SAV-001234",
                            balance: "25000.00",
                            createdAt: "2024-01-15T10:30:00Z",
                            member: { firstName: "John", lastName: "Doe", memberCode: "M001" }
                        },
                        {
                            id: 2,
                            memberId: 2,
                            accountNumber: "SAV-001235",
                            balance: "15000.50",
                            createdAt: "2024-01-20T14:15:00Z",
                            member: { firstName: "Jane", lastName: "Smith", memberCode: "M002" }
                        },
                        {
                            id: 3,
                            memberId: 3,
                            accountNumber: "SAV-001236",
                            balance: "8750.25",
                            createdAt: "2024-02-01T09:45:00Z",
                            member: { firstName: "Mike", lastName: "Johnson", memberCode: "M003" }
                        }
                    ]];
            });
        }); },
    }), _b = _a.data, savingsAccounts = _b === void 0 ? [] : _b, savingsLoading = _a.isLoading;
    var _c = useQuery({
        queryKey: ["savings-transactions"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Simulate transactions data - in real implementation you'd have an endpoint
                return [2 /*return*/, [
                        {
                            id: 1,
                            transactionId: "TXN-2024-001",
                            memberId: 1,
                            accountType: "savings",
                            transactionType: "deposit",
                            amount: "5000.00",
                            balanceBefore: "20000.00",
                            balanceAfter: "25000.00",
                            reference: "M-PESA DEPOSIT",
                            createdAt: "2024-03-15T10:30:00Z",
                            member: { firstName: "John", lastName: "Doe" }
                        },
                        {
                            id: 2,
                            transactionId: "TXN-2024-002",
                            memberId: 1,
                            accountType: "savings",
                            transactionType: "withdrawal",
                            amount: "2000.00",
                            balanceBefore: "27000.00",
                            balanceAfter: "25000.00",
                            reference: "ATM WITHDRAWAL",
                            createdAt: "2024-03-14T15:45:00Z",
                            member: { firstName: "John", lastName: "Doe" }
                        },
                        {
                            id: 3,
                            transactionId: "TXN-2024-003",
                            memberId: 2,
                            accountType: "savings",
                            transactionType: "deposit",
                            amount: "3000.00",
                            balanceBefore: "12000.50",
                            balanceAfter: "15000.50",
                            reference: "CASH DEPOSIT",
                            createdAt: "2024-03-13T11:20:00Z",
                            member: { firstName: "Jane", lastName: "Smith" }
                        }
                    ]];
            });
        }); },
    }), _d = _c.data, transactions = _d === void 0 ? [] : _d, transactionsLoading = _c.isLoading;
    var _e = useState(""), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = useState(""), typeFilter = _f[0], setTypeFilter = _f[1];
    var _g = useState(false), isDepositOpen = _g[0], setIsDepositOpen = _g[1];
    var _h = useState(false), isWithdrawOpen = _h[0], setIsWithdrawOpen = _h[1];
    var toast = useToast().toast;
    var _j = useState({
        accountNumber: "",
        amount: "",
        reference: "",
    }), depositForm = _j[0], setDepositForm = _j[1];
    var _k = useState({
        accountNumber: "",
        amount: "",
        reference: "",
    }), withdrawForm = _k[0], setWithdrawForm = _k[1];
    var filteredTransactions = transactions.filter(function (txn) {
        var _a, _b, _c, _d, _e;
        var matchesSearch = ((_b = (_a = txn.member) === null || _a === void 0 ? void 0 : _a.firstName) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((_d = (_c = txn.member) === null || _c === void 0 ? void 0 : _c.lastName) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(searchTerm.toLowerCase())) ||
            txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ((_e = txn.reference) === null || _e === void 0 ? void 0 : _e.includes(searchTerm));
        var matchesType = typeFilter === "all" || !typeFilter || txn.transactionType === typeFilter;
        return matchesSearch && matchesType;
    });
    var handleDeposit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            try {
                // In real implementation, you'd call api.createTransaction
                toast({
                    title: "Success",
                    description: "Deposit of KES ".concat(depositForm.amount, " processed successfully"),
                });
                setIsDepositOpen(false);
                setDepositForm({
                    accountNumber: "",
                    amount: "",
                    reference: "",
                });
            }
            catch (error) {
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to process deposit",
                    variant: "destructive",
                });
            }
            return [2 /*return*/];
        });
    }); };
    var handleWithdraw = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            try {
                // In real implementation, you'd call api.createTransaction
                toast({
                    title: "Success",
                    description: "Withdrawal of KES ".concat(withdrawForm.amount, " processed successfully"),
                });
                setIsWithdrawOpen(false);
                setWithdrawForm({
                    accountNumber: "",
                    amount: "",
                    reference: "",
                });
            }
            catch (error) {
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to process withdrawal",
                    variant: "destructive",
                });
            }
            return [2 /*return*/];
        });
    }); };
    var getTransactionIcon = function (type) {
        switch (type) {
            case 'deposit':
                return <ArrowDownLeft className="h-4 w-4 text-secondary"/>;
            case 'withdrawal':
                return <ArrowUpRight className="h-4 w-4 text-destructive"/>;
            case 'transfer':
                return <CreditCard className="h-4 w-4 text-primary"/>;
            default:
                return <Wallet className="h-4 w-4 text-muted-foreground"/>;
        }
    };
    var getTransactionColor = function (type) {
        switch (type) {
            case 'deposit':
                return "text-secondary";
            case 'withdrawal':
                return "text-destructive";
            case 'transfer':
                return "text-primary";
            default:
                return "text-muted-foreground";
        }
    };
    var totalSavings = savingsAccounts.reduce(function (sum, account) {
        return sum + parseFloat(account.balance);
    }, 0);
    return (<Layout>
        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Savings Accounts</h1>
              <p className="text-muted-foreground mt-1">Manage member savings and transactions.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4"/> Export
              </Button>
              <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <ArrowDownLeft className="mr-2 h-4 w-4"/> Deposit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Make Deposit</DialogTitle>
                    <DialogDescription>
                      Add funds to a member's savings account.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="depositAccount">Account Number</Label>
                      <Select value={depositForm.accountNumber} onValueChange={function (value) { return setDepositForm(__assign(__assign({}, depositForm), { accountNumber: value })); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account"/>
                        </SelectTrigger>
                        <SelectContent>
                          {savingsAccounts.map(function (account) {
            var _a, _b;
            return (<SelectItem key={account.id} value={account.accountNumber}>
                              {account.accountNumber} - {(_a = account.member) === null || _a === void 0 ? void 0 : _a.firstName} {(_b = account.member) === null || _b === void 0 ? void 0 : _b.lastName}
                            </SelectItem>);
        })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depositAmount">Amount (KES)</Label>
                      <Input id="depositAmount" type="number" step="0.01" value={depositForm.amount} onChange={function (e) { return setDepositForm(__assign(__assign({}, depositForm), { amount: e.target.value })); }} required/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depositReference">Reference</Label>
                      <Input id="depositReference" value={depositForm.reference} onChange={function (e) { return setDepositForm(__assign(__assign({}, depositForm), { reference: e.target.value })); }} placeholder="M-PESA, Cash, etc."/>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Process Deposit</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ArrowUpRight className="mr-2 h-4 w-4"/> Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Process Withdrawal</DialogTitle>
                    <DialogDescription>
                      Withdraw funds from a member's savings account.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdrawAccount">Account Number</Label>
                      <Select value={withdrawForm.accountNumber} onValueChange={function (value) { return setWithdrawForm(__assign(__assign({}, withdrawForm), { accountNumber: value })); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account"/>
                        </SelectTrigger>
                        <SelectContent>
                          {savingsAccounts.map(function (account) {
            var _a, _b;
            return (<SelectItem key={account.id} value={account.accountNumber}>
                              {account.accountNumber} - {(_a = account.member) === null || _a === void 0 ? void 0 : _a.firstName} {(_b = account.member) === null || _b === void 0 ? void 0 : _b.lastName} (KES {parseFloat(account.balance).toLocaleString()})
                            </SelectItem>);
        })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdrawAmount">Amount (KES)</Label>
                      <Input id="withdrawAmount" type="number" step="0.01" value={withdrawForm.amount} onChange={function (e) { return setWithdrawForm(__assign(__assign({}, withdrawForm), { amount: e.target.value })); }} required/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdrawReference">Reference</Label>
                      <Input id="withdrawReference" value={withdrawForm.reference} onChange={function (e) { return setWithdrawForm(__assign(__assign({}, withdrawForm), { reference: e.target.value })); }} placeholder="ATM, Cash, etc."/>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Process Withdrawal</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border/50 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
              <Input placeholder="Search by name, account number, or transaction ID..." className="pl-9 bg-background" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }}/>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2"/>
                <SelectValue placeholder="Filter by type"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground"/>

              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {totalSavings.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savingsAccounts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Deposits</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-secondary"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">
                  {transactions.filter(function (t) {
            return t.transactionType === 'deposit' &&
                new Date(t.createdAt).toDateString() === new Date().toDateString();
        }).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Withdrawals</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-destructive"/>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {transactions.filter(function (t) {
            return t.transactionType === 'withdrawal' &&
                new Date(t.createdAt).toDateString() === new Date().toDateString();
        }).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Accounts Table */}
          <div className="rounded-md border border-border bg-card">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Savings Accounts</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savingsAccounts.map(function (account) {
            var _a, _b, _c;
            return (<TableRow key={account.id}>
                    <TableCell className="font-medium">{account.accountNumber}</TableCell>
                    <TableCell>
                      {(_a = account.member) === null || _a === void 0 ? void 0 : _a.firstName} {(_b = account.member) === null || _b === void 0 ? void 0 : _b.lastName}
                      <div className="text-sm text-muted-foreground">{(_c = account.member) === null || _c === void 0 ? void 0 : _c.memberCode}</div>
                    </TableCell>
                    <TableCell className="font-mono">KES {parseFloat(account.balance).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell>{new Date(account.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4"/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View account</DropdownMenuItem>
                          <DropdownMenuItem>View transactions</DropdownMenuItem>
                          <DropdownMenuItem>Transfer funds</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Freeze account</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>);
        })}
              </TableBody>
            </Table>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-md border border-border bg-card">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance After</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.slice(0, 10).map(function (transaction) {
            var _a, _b;
            return (<TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">{transaction.transactionId}</TableCell>
                    <TableCell>
                      {(_a = transaction.member) === null || _a === void 0 ? void 0 : _a.firstName} {(_b = transaction.member) === null || _b === void 0 ? void 0 : _b.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.transactionType)}
                        <span className="capitalize">{transaction.transactionType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={getTransactionColor(transaction.transactionType)}>
                        {transaction.transactionType === 'deposit' ? '+' : '-'}KES {parseFloat(transaction.amount).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">KES {parseFloat(transaction.balanceAfter).toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{transaction.reference}</TableCell>
                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>);
        })}
              </TableBody>
            </Table>
          </div>
        </div>
    </Layout>);
}
