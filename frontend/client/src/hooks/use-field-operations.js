import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api";
export var useFieldVisits = function (userId, days) {
    if (days === void 0) { days = 30; }
    return useQuery({
        queryKey: ["field-visits", userId, days],
        queryFn: function () {
            return apiCall("/field-operations/visits?days=".concat(days), { method: "GET" });
        },
        enabled: !!userId,
        refetchInterval: 10 * 60 * 1000,
    });
};
export var useCreateVisit = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (data) {
            return apiCall("/field-operations/visits", {
                method: "POST",
                body: JSON.stringify(data),
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["field-visits"] });
        },
    });
};
export var useCompleteVisit = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (data) {
            return apiCall("/field-operations/visits/".concat(data.visitId, "/complete"), {
                method: "PUT",
                body: JSON.stringify({
                    notes: data.notes,
                    duration: data.duration,
                    feedback: data.feedback,
                }),
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["field-visits"] });
        },
    });
};
export var useVisitDetails = function (visitId) {
    return useQuery({
        queryKey: ["visit-details", visitId],
        queryFn: function () {
            return apiCall("/field-operations/visits/".concat(visitId), { method: "GET" });
        },
        enabled: !!visitId,
        refetchInterval: 5 * 60 * 1000,
    });
};
export var useCreateApplication = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (data) {
            return apiCall("/field-operations/applications", {
                method: "POST",
                body: JSON.stringify(data),
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["mobile-applications"] });
        },
    });
};
export var useUpdateApplicationStep = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (data) {
            return apiCall("/field-operations/applications/".concat(data.appId, "/step"), {
                method: "PUT",
                body: JSON.stringify({ step: data.step, formData: data.formData }),
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["mobile-applications"] });
        },
    });
};
export var useSubmitApplication = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (appId) {
            return apiCall("/field-operations/applications/".concat(appId, "/submit"), {
                method: "POST",
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["mobile-applications"] });
        },
    });
};
export var useMobileApplications = function (userId, status) {
    if (status === void 0) { status = "all"; }
    return useQuery({
        queryKey: ["mobile-applications", userId, status],
        queryFn: function () {
            return apiCall("/field-operations/applications?status=".concat(status), {
                method: "GET",
            });
        },
        enabled: !!userId,
        refetchInterval: 5 * 60 * 1000,
    });
};
export var useApplicationDetails = function (appId) {
    return useQuery({
        queryKey: ["application-details", appId],
        queryFn: function () {
            return apiCall("/field-operations/applications/".concat(appId), {
                method: "GET",
            });
        },
        enabled: !!appId,
    });
};
export var usePhotoCapture = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (data) {
            var formData = new FormData();
            formData.append("file", data.file);
            formData.append("entityType", data.entityType);
            formData.append("entityId", String(data.entityId));
            if (data.description)
                formData.append("description", data.description);
            if (data.gpsLatitude)
                formData.append("gpsLatitude", String(data.gpsLatitude));
            if (data.gpsLongitude)
                formData.append("gpsLongitude", String(data.gpsLongitude));
            if (data.tags) {
                data.tags.forEach(function (tag) { return formData.append("tags[]", tag); });
            }
            return apiCall("/field-operations/photos", {
                method: "POST",
                body: formData,
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["entity-photos"] });
        },
    });
};
export var usePhotos = function (entityType, entityId) {
    return useQuery({
        queryKey: ["entity-photos", entityType, entityId],
        queryFn: function () {
            return apiCall("/field-operations/".concat(entityType, "/").concat(entityId, "/photos"), {
                method: "GET",
            });
        },
        enabled: !!entityType && !!entityId,
        refetchInterval: 5 * 60 * 1000,
    });
};
export var useOfflineSync = function (userId) {
    return useQuery({
        queryKey: ["offline-sync", userId],
        queryFn: function () {
            return apiCall("/field-operations/sync/status", { method: "GET" });
        },
        enabled: !!userId,
        refetchInterval: 30 * 1000,
    });
};
export var useSyncQueue = function (userId) {
    return useQuery({
        queryKey: ["sync-queue", userId],
        queryFn: function () {
            return apiCall("/field-operations/sync/queue", { method: "GET" });
        },
        enabled: !!userId,
        refetchInterval: 30 * 1000,
    });
};
export var useProcessSync = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (items) {
            return apiCall("/field-operations/sync/process", {
                method: "POST",
                body: JSON.stringify({ items: items }),
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["sync-queue"] });
            queryClient.invalidateQueries({ queryKey: ["offline-sync"] });
        },
    });
};
export var useResolveConflict = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (data) {
            return apiCall("/field-operations/sync/conflicts/resolve", {
                method: "POST",
                body: JSON.stringify(data),
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["sync-queue"] });
        },
    });
};
export var useGeolocation = function () {
    var _a = React.useState(null), location = _a[0], setLocation = _a[1];
    var _b = React.useState(null), error = _b[0], setError = _b[1];
    var _c = React.useState(false), loading = _c[0], setLoading = _c[1];
    var getLocation = React.useCallback(function () {
        setLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                });
                setLoading(false);
            }, function (error) {
                setError(error.message);
                setLoading(false);
            });
        }
        else {
            setError("Geolocation not supported");
            setLoading(false);
        }
    }, []);
    return { location: location, error: error, loading: loading, getLocation: getLocation };
};
export var useOfficerPerformance = function (userId, period) {
    if (period === void 0) { period = "month"; }
    return useQuery({
        queryKey: ["officer-performance", userId, period],
        queryFn: function () {
            return apiCall("/field-operations/performance?period=".concat(period), {
                method: "GET",
            });
        },
        enabled: !!userId,
        refetchInterval: 24 * 60 * 60 * 1000,
    });
};
export var useTeamPerformance = function (branchId, period) {
    if (period === void 0) { period = "month"; }
    return useQuery({
        queryKey: ["team-performance", branchId, period],
        queryFn: function () {
            return apiCall("/field-operations/team-performance?branch_id=".concat(branchId, "&period=").concat(period), {
                method: "GET",
            });
        },
        enabled: !!branchId,
        refetchInterval: 24 * 60 * 60 * 1000,
    });
};
export var useBiometricAuth = function () {
    var _a = React.useState(false), supported = _a[0], setSupported = _a[1];
    React.useEffect(function () {
        if (window.PublicKeyCredential) {
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(function (available) { return setSupported(available); });
        }
    }, []);
    return { supported: supported };
};
export var useEnrollBiometric = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (data) {
            return apiCall("/field-operations/biometric/enroll", {
                method: "POST",
                body: JSON.stringify(data),
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["biometric-auth"] });
        },
    });
};
export var useUserBiometrics = function (userId) {
    return useQuery({
        queryKey: ["biometric-auth", userId],
        queryFn: function () {
            return apiCall("/field-operations/biometric", { method: "GET" });
        },
        enabled: !!userId,
    });
};
export var useOfflineData = function () {
    var getLocalData = React.useCallback(function (key) {
        var data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }, []);
    var setLocalData = React.useCallback(function (key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }, []);
    var clearLocalData = React.useCallback(function (key) {
        localStorage.removeItem(key);
    }, []);
    return { getLocalData: getLocalData, setLocalData: setLocalData, clearLocalData: clearLocalData };
};
