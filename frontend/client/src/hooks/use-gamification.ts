import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/api";

export const useAchievements = (userId: number) => {
  return useQuery({
    queryKey: ["achievements", userId],
    queryFn: () =>
      apiCall("/gamification/achievements", {
        method: "GET",
      }),
    enabled: !!userId,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useBadges = (userId: number) => {
  return useQuery({
    queryKey: ["badges", userId],
    queryFn: () =>
      apiCall("/gamification/badges", {
        method: "GET",
      }),
    enabled: !!userId,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const usePoints = (userId: number) => {
  return useQuery({
    queryKey: ["points", userId],
    queryFn: () =>
      apiCall("/gamification/points", {
        method: "GET",
      }),
    enabled: !!userId,
    refetchInterval: 2 * 60 * 1000,
  });
};

export const useLeaderboard = (limit: number = 20) => {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: () =>
      apiCall(`/gamification/leaderboard?limit=${limit}`, {
        method: "GET",
      }),
    refetchInterval: 10 * 60 * 1000,
  });
};

export const useBranchLeaderboard = (branchId: number, limit: number = 20) => {
  return useQuery({
    queryKey: ["branch-leaderboard", branchId, limit],
    queryFn: () =>
      apiCall(`/gamification/leaderboard/branch/${branchId}?limit=${limit}`, {
        method: "GET",
      }),
    enabled: !!branchId,
    refetchInterval: 10 * 60 * 1000,
  });
};

export const useUserRank = (userId: number) => {
  return useQuery({
    queryKey: ["user-rank", userId],
    queryFn: () =>
      apiCall("/gamification/rank", {
        method: "GET",
      }),
    enabled: !!userId,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useChallenges = () => {
  return useQuery({
    queryKey: ["challenges"],
    queryFn: () =>
      apiCall("/gamification/challenges", {
        method: "GET",
      }),
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useUserChallenges = (userId: number) => {
  return useQuery({
    queryKey: ["user-challenges", userId],
    queryFn: () =>
      apiCall("/gamification/my-challenges", {
        method: "GET",
      }),
    enabled: !!userId,
    refetchInterval: 3 * 60 * 1000,
  });
};

export const useJoinChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (challengeId: number) =>
      apiCall(`/gamification/challenges/join/${challengeId}`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
    },
  });
};

export const useUpdateChallengeProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      challengeId,
      progress,
    }: {
      challengeId: number;
      progress: number;
    }) =>
      apiCall(`/gamification/challenges/${challengeId}/progress`, {
        method: "POST",
        body: JSON.stringify({ progress }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
      queryClient.invalidateQueries({ queryKey: ["points"] });
    },
  });
};

export const useRewards = (userId: number) => {
  return useQuery({
    queryKey: ["rewards", userId],
    queryFn: () =>
      apiCall("/gamification/rewards", {
        method: "GET",
      }),
    enabled: !!userId,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useUserRewards = (userId: number) => {
  return useQuery({
    queryKey: ["user-rewards", userId],
    queryFn: () =>
      apiCall("/gamification/my-rewards", {
        method: "GET",
      }),
    enabled: !!userId,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useRedeemReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rewardId: number) =>
      apiCall(`/gamification/rewards/${rewardId}/redeem`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["user-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["points"] });
    },
  });
};

export const useGamificationSummary = (userId: number) => {
  return useQuery({
    queryKey: ["gamification-summary", userId],
    queryFn: () =>
      apiCall("/gamification/summary", {
        method: "GET",
      }),
    enabled: !!userId,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useUpdateLeaderboards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiCall("/gamification/leaderboard/update", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["branch-leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["user-rank"] });
    },
  });
};
