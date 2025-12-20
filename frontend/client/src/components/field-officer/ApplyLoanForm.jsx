import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export function ApplyLoanForm(_a) {
    var memberId = _a.memberId, onSuccess = _a.onSuccess;
    var _b = useState(""), amount = _b[0], setAmount = _b[1];
    var _c = useState(""), loanTypeId = _c[0], setLoanTypeId = _c[1];
    var toast = useToast().toast;
    var loanTypes = useQuery({
        queryKey: ["loanTypes"],
        queryFn: function () { return api.getLoanTypes(); },
    }).data;
    var mutation = useMutation({
        mutationFn: function (data) {
            return api.applyLoanForMember(memberId, {
                amount: parseFloat(data.amount),
                loanTypeId: data.loanTypeId,
            });
        },
        onSuccess: function () {
            toast({
                title: "Success",
                description: "Loan application created successfully",
            });
            setAmount("");
            setLoanTypeId("");
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!amount || !loanTypeId) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }
        mutation.mutate({
            amount: amount,
            loanTypeId: parseInt(loanTypeId),
        });
    };
    var selectedLoanType = loanTypes === null || loanTypes === void 0 ? void 0 : loanTypes.find(function (lt) { return lt.id === parseInt(loanTypeId); });
    return (<Card>
      <CardHeader>
        <CardTitle>Apply Loan on Behalf of Customer</CardTitle>
        <CardDescription>Submit a new loan application for this customer</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loanType">Loan Type</Label>
            <select id="loanType" value={loanTypeId} onChange={function (e) { return setLoanTypeId(e.target.value); }} className="w-full px-3 py-2 border border-input rounded-md bg-background">
              <option value="">Select a loan type</option>
              {loanTypes === null || loanTypes === void 0 ? void 0 : loanTypes.map(function (type) { return (<option key={type.id} value={type.id}>
                  {type.name} ({type.interestRate}% interest)
                </option>); })}
            </select>
          </div>

          {selectedLoanType && (<div className="text-sm bg-blue-50 p-3 rounded-md text-blue-900">
              <p>Min: KES {parseFloat(selectedLoanType.minAmount).toLocaleString()}</p>
              <p>Max: KES {parseFloat(selectedLoanType.maxAmount).toLocaleString()}</p>
              <p>Duration: {selectedLoanType.durationMonths} months</p>
            </div>)}

          <div className="space-y-2">
            <Label htmlFor="amount">Loan Amount (KES)</Label>
            <Input id="amount" type="number" placeholder="Enter loan amount" value={amount} onChange={function (e) { return setAmount(e.target.value); }} min={selectedLoanType ? parseFloat(selectedLoanType.minAmount) : 0} max={selectedLoanType ? parseFloat(selectedLoanType.maxAmount) : undefined}/>
          </div>

          {mutation.isPending && (<div className="flex items-center gap-2 text-blue-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"/>
              <span>Processing...</span>
            </div>)}

          {mutation.isSuccess && (<div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5"/>
              <span>Loan application created successfully</span>
            </div>)}

          {mutation.isError && (<div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5"/>
              <span>{mutation.error.message}</span>
            </div>)}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={mutation.isPending} className="flex-1">
              Apply Loan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>);
}
