import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Smartphone, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DepositForm({ memberId, defaultAccountType = "savings", onSuccess }) {
  const [accountType, setAccountType] = useState(defaultAccountType);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [isInitiatingStkPush, setIsInitiatingStkPush] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) =>
      api.createTransaction({
        memberId,
        accountType: data.accountType,
        transactionType: "deposit",
        amount: parseFloat(data.amount),
        reference: data.reference,
        mpesaCode: data.mpesaCode,
      }),
    onSuccess: (data) => {
      toast({
        title: "Deposit Created",
        description: "Deposit is pending approval. Awaiting M-Pesa confirmation.",
      });
      setPendingTransaction(data);
      setAmount("");
      setReference("");
      setMpesaCode("");
      queryClient.invalidateQueries({ queryKey: ["memberDashboard", memberId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stkPushMutation = useMutation({
    mutationFn: (data) =>
      api.initiateStkPush({
        memberId,
        amount: parseFloat(data.amount),
        accountType: data.accountType,
      }),
    onSuccess: (data) => {
      toast({
        title: "STK Push Sent",
        description: `M-Pesa prompt sent to customer's phone (${data.phone}). They have 2 minutes to complete payment.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive",
      });
      return;
    }
    if (parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    if (!mpesaCode.trim()) {
      toast({
        title: "Error",
        description: "M-Pesa code is required for record keeping",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate({
      accountType,
      amount,
      reference,
      mpesaCode,
    });
  };

  const handleStkPush = () => {
    if (!amount) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive",
      });
      return;
    }
    if (parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    setIsInitiatingStkPush(true);
    stkPushMutation.mutate({
      amount,
      accountType,
    }, {
      onSettled: () => setIsInitiatingStkPush(false),
    });
  };

  if (pendingTransaction) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
            <div>
              <CardTitle>Deposit Pending Approval</CardTitle>
              <CardDescription>
                Transaction ID: {pendingTransaction.transactionId}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm font-semibold text-orange-900 mb-2">Status: PENDING</p>
            <p className="text-sm text-orange-800 mb-4">
              This deposit is awaiting approval from the procurement officer. Once the M-Pesa payment is confirmed, the balance will be updated.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-orange-700">Amount:</span>
                <span className="font-semibold">KES {parseFloat(pendingTransaction.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Account:</span>
                <span className="font-semibold capitalize">{pendingTransaction.accountType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">M-Pesa Code:</span>
                <span className="font-mono">{pendingTransaction.mpesaCode}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setPendingTransaction(null);
                setAmount("");
                onSuccess?.();
              }}
              className="flex-1"
              variant="outline"
            >
              Done
            </Button>
            <Button
              onClick={() => setPendingTransaction(null)}
              className="flex-1"
              variant="secondary"
            >
              Create Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Deposit</CardTitle>
        <CardDescription>Add funds to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountType">Deposit To</Label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="savings">Savings Account</option>
              <option value="drawdown">Drawdown Account</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter deposit amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mpesaCode">
              M-Pesa Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mpesaCode"
              type="text"
              placeholder="Enter M-Pesa transaction code (e.g., ABC123DEF456)"
              value={mpesaCode}
              onChange={(e) => setMpesaCode(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Required for audit trail and record keeping</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference/Notes (Optional)</Label>
            <Input
              id="reference"
              type="text"
              placeholder="Enter reference or notes"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          {mutation.isPending && (
            <div className="flex items-center gap-2 text-primary">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span>Processing deposit...</span>
            </div>
          )}

          {mutation.isSuccess && (
            <div className="flex items-center gap-2 text-secondary">
              <CheckCircle className="h-5 w-5" />
              <span>Deposit recorded successfully</span>
            </div>
          )}

          {mutation.isError && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{mutation.error.message}</span>
            </div>
          )}

          <div className="pt-4 space-y-3">
            <Button type="submit" disabled={mutation.isPending} className="flex-1">
              {mutation.isPending ? "Processing..." : "Record Deposit"}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleStkPush}
              disabled={isInitiatingStkPush || stkPushMutation.isPending || !amount}
              variant="outline"
              className="w-full flex-1 gap-2"
            >
              <Smartphone className="h-4 w-4" />
              {isInitiatingStkPush || stkPushMutation.isPending ? "Sending Prompt..." : "Send STK Push to Customer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
