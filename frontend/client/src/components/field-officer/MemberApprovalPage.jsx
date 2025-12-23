import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, User, Phone, Users, Building, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { LoadingSpinner } from "@/components/ui/loading";

export function MemberApprovalPage() {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingMembers = [], isLoading, error } = useQuery({
    queryKey: ["pendingMembers"],
    queryFn: api.getPendingMembers,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const approveMutation = useMutation({
    mutationFn: (memberId) => api.approveMember(memberId),
    onSuccess: (data, memberId) => {
      toast({
        title: "Success",
        description: `Member ${memberId} approved successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["pendingMembers"] });
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (memberId) => api.rejectMember(memberId),
    onSuccess: (data, memberId) => {
      toast({
        title: "Success",
        description: `Member ${memberId} rejected`,
      });
      queryClient.invalidateQueries({ queryKey: ["pendingMembers"] });
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (memberIds) => api.bulkApproveMembers(memberIds),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["pendingMembers"] });
      setSelectedMembers([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectMember = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === pendingMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(pendingMembers.map(member => member.id));
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load pending members</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Member Approval
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and approve pending member applications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSelectAll}
              variant="outline"
              size="lg"
            >
              {selectedMembers.length === pendingMembers.length ? "Deselect All" : "Select All"}
            </Button>
            <Button
              onClick={() => bulkApproveMutation.mutate(selectedMembers)}
              disabled={selectedMembers.length === 0 || bulkApproveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Approve Selected ({selectedMembers.length})
            </Button>
          </div>
        </div>

        {pendingMembers.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No pending members
              </h3>
              <p className="text-muted-foreground text-center">
                All member applications have been reviewed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingMembers.map((member) => (
              <Card
                key={member.id}
                className={`hover:shadow-lg transition-all duration-300 border-2 cursor-pointer ${
                  selectedMembers.includes(member.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleSelectMember(member.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {member.user.firstName} {member.user.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Member Code: {member.memberCode}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{member.user.username}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{member.user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>ID: {member.idNumber || 'Not provided'}</span>
                        </div>
                      </div>

                      {member.group && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Group: {member.group.name}</span>
                        </div>
                      )}

                      {member.branch && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>Branch: {member.branch.name} - {member.branch.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          approveMutation.mutate(member.id);
                        }}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          rejectMutation.mutate(member.id);
                        }}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        variant="destructive"
                        size="sm"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
