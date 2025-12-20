import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api";
export var useAchievements = function (userId) {
    return useQuery({
        queryKey: ["achievements", userId],
        queryFn: function () {
            return apiCall("/gamification/achievements", {
                method: "GET",
            });
        },
        enabled: !!userId,
        refetchInterval: 5 * 60 * 1000,
    });
};
export var useBadges = function (userId) {
    return useQuery({
        queryKey: ["badges", userId],
        queryFn: function () {
            return apiCall("/gamification/badges", {
                method: "GET",
            });
        },
        enabled: !!userId,
        refetchInterval: 5 * 60 * 1000,
    });
};
export var usePoints = function (userId) {
    return useQuery({
        queryKey: ["points", userId],
        queryFn: function () {
            return apiCall("/gamification/points", {
                method: "GET",
            });
        },
        enabled: !!userId,
        refetchInterval: 2 * 60 * 1000,
    });
};
export var useLeaderboard = function (limit) {
    if (limit === void 0) { limit = 20; }
    return useQuery({
        queryKey: ["leaderboard", limit],
        queryFn: function () {
            return apiCall("/gamification/leaderboard?limit=".concat(limit), {
                method: "GET",
            });
        },
        refetchInterval: 10 * 60 * 1000,
    });
};
export var useBranchLeaderboard = function (branchId, limit) {
    if (limit === void 0) { limit = 20; }
    return useQuery({
        queryKey: ["branch-leaderboard", branchId, limit],
        queryFn: function () {
            return apiCall("/gamification/leaderboard/branch/".concat(branchId, "?limit=").concat(limit), {
                method: "GET",
            });
        },
        enabled: !!branchId,
        refetchInterval: 10 * 60 * 1000,
    });
};
export var useUserRank = function (userId) {
    return useQuery({
        queryKey: ["user-rank", userId],
        queryFn: function () {
            return apiCall("/gamification/rank", {
                method: "GET",
            });
        },
        enabled: !!userId,
        refetchInterval: 5 * 60 * 1000,
    });
};
export var useChallenges = function () {
    return useQuery({
        queryKey: ["challenges"],
        queryFn: function () {
            return apiCall("/gamification/challenges", {
                method: "GET",
            });
        },
        refetchInterval: 5 * 60 * 1000,
    });
};
export var useUserChallenges = function (userId) {
    return useQuery({
        queryKey: ["user-challenges", userId],
        queryFn: function () {
            return apiCall("/gamification/my-challenges", {
                method: "GET",
            });
        },
        enabled: !!userId,
        refetchInterval: 3 * 60 * 1000,
    });
};
export var useJoinChallenge = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (challengeId) {
            return apiCall("/gamification/challenges/join/".concat(challengeId), {
                method: "POST",
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["challenges"] });
            queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
        },
    });
};
export var useUpdateChallengeProgress = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (_a) {
            var challengeId = _a.challengeId, progress = _a.progress;
            return apiCall("/gamification/challenges/".concat(challengeId, "/progress"), {
                method: "POST",
                body: JSON.stringify({ progress: progress }),
                headers: { "Content-Type": "application/json" },
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
            queryClient.invalidateQueries({ queryKey: ["points"] });
        },
    });
};
export var useRewards = function (userId) {
    return useQuery({
        queryKey: ["rewards", userId],
        queryFn: function () {
            return apiCall("/gamification/rewards", {
                method: "GET",
            });
        },
        enabled: !!userId,
        refetchInterval: 5 * 60 * 1000,
    });
};
export var useUserRewards = function (userId) {
    return useQuery({
        queryKey: ["user-rewards", userId],
        queryFn: function () {
            return apiCall("/gamification/my-rewards", {
                method: "GET",
            });
        },
        enabled: !!userId,
        refetchInterval: 5 * 60 * 1000,
    });
};
export var useRedeemReward = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (rewardId) {
            return apiCall("/gamification/rewards/".concat(rewardId, "/redeem"), {
                method: "POST",
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["rewards"] });
            queryClient.invalidateQueries({ queryKey: ["user-rewards"] });
            queryClient.invalidateQueries({ queryKey: ["points"] });
        },
    });
};
export var useGamificationSummary = function (userId) {
    return useQuery({
        queryKey: ["gamification-summary", userId],
        queryFn: function () {
            return apiCall("/gamification/summary", {
                method: "GET",
            });
        },
        enabled: !!userId,
        refetchInterval: 5 * 60 * 1000,
    });
};
export var useUpdateLeaderboards = function () {
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function () {
            return apiCall("/gamification/leaderboard/update", {
                method: "POST",
            });
        },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
            queryClient.invalidateQueries({ queryKey: ["branch-leaderboard"] });
            queryClient.invalidateQueries({ queryKey: ["user-rank"] });
        },
    });
};
