import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api";

export const useFieldVisits = (userId: number, days: number = 30) => {
  return useQuery({
    queryKey: ["field-visits", userId, days],
    queryFn: () =>
      apiCall(`/field-operations/visits?days=${days}`, { method: "GET" }),
    enabled: !!userId,
    refetchInterval: 10 * 60 * 1000,
  });
};

export const useCreateVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      memberId: number;
      purpose: string;
      latitude: number;
      longitude: number;
      notes?: string;
    }) =>
      apiCall("/field-operations/visits", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["field-visits"] });
    },
  });
};

export const useCompleteVisit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      visitId: number;
      notes: string;
      duration: number;
      feedback?: number;
    }) =>
      apiCall(`/field-operations/visits/${data.visitId}/complete`, {
        method: "PUT",
        body: JSON.stringify({
          notes: data.notes,
          duration: data.duration,
          feedback: data.feedback,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["field-visits"] });
    },
  });
};

export const useVisitDetails = (visitId: number) => {
  return useQuery({
    queryKey: ["visit-details", visitId],
    queryFn: () =>
      apiCall(`/field-operations/visits/${visitId}`, { method: "GET" }),
    enabled: !!visitId,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      memberId: number;
      loanTypeId: number;
      amount: number;
    }) =>
      apiCall("/field-operations/applications", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-applications"] });
    },
  });
};

export const useUpdateApplicationStep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      appId: number;
      step: number;
      formData: Record<string, any>;
    }) =>
      apiCall(`/field-operations/applications/${data.appId}/step`, {
        method: "PUT",
        body: JSON.stringify({ step: data.step, formData: data.formData }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-applications"] });
    },
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appId: number) =>
      apiCall(`/field-operations/applications/${appId}/submit`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-applications"] });
    },
  });
};

export const useMobileApplications = (
  userId: number,
  status: string = "all"
) => {
  return useQuery({
    queryKey: ["mobile-applications", userId, status],
    queryFn: () =>
      apiCall(`/field-operations/applications?status=${status}`, {
        method: "GET",
      }),
    enabled: !!userId,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useApplicationDetails = (appId: number) => {
  return useQuery({
    queryKey: ["application-details", appId],
    queryFn: () =>
      apiCall(`/field-operations/applications/${appId}`, {
        method: "GET",
      }),
    enabled: !!appId,
  });
};

export const usePhotoCapture = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      entityType: string;
      entityId: number;
      file: File;
      description?: string;
      gpsLatitude?: number;
      gpsLongitude?: number;
      tags?: string[];
    }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("entityType", data.entityType);
      formData.append("entityId", String(data.entityId));
      if (data.description) formData.append("description", data.description);
      if (data.gpsLatitude) formData.append("gpsLatitude", String(data.gpsLatitude));
      if (data.gpsLongitude) formData.append("gpsLongitude", String(data.gpsLongitude));
      if (data.tags) {
        data.tags.forEach((tag) => formData.append("tags[]", tag));
      }

      return apiCall("/field-operations/photos", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity-photos"] });
    },
  });
};

export const usePhotos = (entityType: string, entityId: number) => {
  return useQuery({
    queryKey: ["entity-photos", entityType, entityId],
    queryFn: () =>
      apiCall(`/field-operations/${entityType}/${entityId}/photos`, {
        method: "GET",
      }),
    enabled: !!entityType && !!entityId,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useOfflineSync = (userId: number) => {
  return useQuery({
    queryKey: ["offline-sync", userId],
    queryFn: () =>
      apiCall("/field-operations/sync/status", { method: "GET" }),
    enabled: !!userId,
    refetchInterval: 30 * 1000,
  });
};

export const useSyncQueue = (userId: number) => {
  return useQuery({
    queryKey: ["sync-queue", userId],
    queryFn: () =>
      apiCall("/field-operations/sync/queue", { method: "GET" }),
    enabled: !!userId,
    refetchInterval: 30 * 1000,
  });
};

export const useProcessSync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: Array<{ id: number }>) =>
      apiCall("/field-operations/sync/process", {
        method: "POST",
        body: JSON.stringify({ items }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync-queue"] });
      queryClient.invalidateQueries({ queryKey: ["offline-sync"] });
    },
  });
};

export const useResolveConflict = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      conflictId: number;
      resolution: "server" | "local" | "merge";
    }) =>
      apiCall("/field-operations/sync/conflicts/resolve", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync-queue"] });
    },
  });
};

export const useGeolocation = () => {
  const [location, setLocation] = React.useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const getLocation = React.useCallback(() => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
          setLoading(false);
        },
        (error) => {
          setError(error.message);
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation not supported");
      setLoading(false);
    }
  }, []);

  return { location, error, loading, getLocation };
};

export const useOfficerPerformance = (userId: number, period: string = "month") => {
  return useQuery({
    queryKey: ["officer-performance", userId, period],
    queryFn: () =>
      apiCall(`/field-operations/performance?period=${period}`, {
        method: "GET",
      }),
    enabled: !!userId,
    refetchInterval: 24 * 60 * 60 * 1000,
  });
};

export const useTeamPerformance = (branchId: number, period: string = "month") => {
  return useQuery({
    queryKey: ["team-performance", branchId, period],
    queryFn: () =>
      apiCall(`/field-operations/team-performance?branch_id=${branchId}&period=${period}`, {
        method: "GET",
      }),
    enabled: !!branchId,
    refetchInterval: 24 * 60 * 60 * 1000,
  });
};

export const useBiometricAuth = () => {
  const [supported, setSupported] = React.useState(false);

  React.useEffect(() => {
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(
        (available) => setSupported(available)
      );
    }
  }, []);

  return { supported };
};

export const useEnrollBiometric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { authType: string; deviceId: string }) =>
      apiCall("/field-operations/biometric/enroll", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-auth"] });
    },
  });
};

export const useUserBiometrics = (userId: number) => {
  return useQuery({
    queryKey: ["biometric-auth", userId],
    queryFn: () =>
      apiCall("/field-operations/biometric", { method: "GET" }),
    enabled: !!userId,
  });
};

export const useOfflineData = () => {
  const getLocalData = React.useCallback((key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }, []);

  const setLocalData = React.useCallback((key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, []);

  const clearLocalData = React.useCallback((key: string) => {
    localStorage.removeItem(key);
  }, []);

  return { getLocalData, setLocalData, clearLocalData };
};
