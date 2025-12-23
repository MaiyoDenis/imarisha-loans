import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AddCustomerModal({
  open,
  onOpenChange,
  groupId,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    idNumber: "",
  });
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data) => api.addMemberToGroup(data),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Customer added successfully. Member Code: ${data.memberCode}`,
      });
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        idNumber: "",
      });
      onOpenChange(false);
      onSuccess?.();
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

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (First Name, Last Name, Phone)",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      ...formData,
      groupId,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to this group. A unique member code will be generated automatically. 
            The customer will start with "pending" status and needs approval before becoming active.
          </DialogDescription>
        </DialogHeader>

        {mutation.error && (
          <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-red-800">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{mutation.error.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                disabled={mutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                disabled={mutation.isPending}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="0712345678"
                value={formData.phone}
                onChange={handleChange}
                disabled={mutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={mutation.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              name="idNumber"
              placeholder="12345678"
              value={formData.idNumber}
              onChange={handleChange}
              disabled={mutation.isPending}
            />
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-primary hover:bg-primary/80"
            >
              {mutation.isPending ? "Adding..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
