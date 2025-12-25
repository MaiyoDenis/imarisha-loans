import React, { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Plus } from "lucide-react";
export function CreateLoanDialog() {
    var _a = useState(false), open = _a[0], setOpen = _a[1];
    var _b = useState(""), memberId = _b[0], setMemberId = _b[1];
    var _c = useState(""), productId = _c[0], setProductId = _c[1];
    var _d = useState(""), loanTypeId = _d[0], setLoanTypeId = _d[1];
    var _e = useState(""), amount = _e[0], setAmount = _e[1];
    var queryClient = useQueryClient();
    var toast = useToast().toast;
    var _f = useQuery({
        queryKey: ["loan-products"],
        queryFn: api.getLoanProducts,
    }).data, products = _f === void 0 ? [] : _f;
    var _g = useQuery({
        queryKey: ["loan-types"],
        queryFn: api.getLoanTypes,
    }).data, loanTypes = _g === void 0 ? [] : _g;
    var createLoanMutation = useMutation({
        mutationFn: api.createLoan,
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["loans"] });
            setOpen(false);
            setMemberId("");
            setProductId("");
            setLoanTypeId("");
            setAmount("");
            toast({
                title: "Success",
                description: "Loan application submitted successfully",
            });
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
        createLoanMutation.mutate({
            memberId: parseInt(memberId),
            productId: parseInt(productId),
            loanTypeId: parseInt(loanTypeId),
            amount: parseFloat(amount),
        });
    };
    return (<Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4"/> Apply for Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Loan Application</DialogTitle>
          <DialogDescription>
            Submit a new loan application for a member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="memberId" className="text-right">
                Member ID
              </Label>
              <Input id="memberId" type="number" value={memberId} onChange={function (e) { return setMemberId(e.target.value); }} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="loanType" className="text-right">
                Loan Type
              </Label>
              <Select onValueChange={setLoanTypeId} value={loanTypeId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select loan type"/>
                </SelectTrigger>
                <SelectContent>
                  {loanTypes.map(function (type) {
            return (<SelectItem key={type.id} value={type.id.toString()}>
                      {type.name} ({type.interestRate}%)
                    </SelectItem>);
        })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Loan Product
              </Label>
              <Select onValueChange={setProductId} value={productId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select loan product"/>
                </SelectTrigger>
                <SelectContent>
                  {products.map(function (product) {
            return (<SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - {product.stockQuantity} in stock
                    </SelectItem>);
        })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input id="amount" type="number" value={amount} onChange={function (e) { return setAmount(e.target.value); }} className="col-span-3" required/>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createLoanMutation.isPending}>
              {createLoanMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
