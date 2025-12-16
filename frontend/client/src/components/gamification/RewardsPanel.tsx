import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Grid,
  Button,
  LinearProgress,
  Typography,
  Box,
  Chip,
  Paper,
  Stack,
  Alert,
} from "@mui/material";
import {
  useRewards,
  useUserRewards,
  useRedeemReward,
} from "@/hooks/use-gamification";

interface RewardsPanelProps {
  userId: number;
}

export const RewardsPanel: React.FC<RewardsPanelProps> = ({ userId }) => {
  const rewardsQuery = useRewards(userId);
  const userRewardsQuery = useUserRewards(userId);
  const redeemRewardMutation = useRedeemReward();

  const handleRedeemReward = (rewardId: number) => {
    redeemRewardMutation.mutate(rewardId, {
      onSuccess: () => {
        alert("Reward redeemed successfully!");
      },
      onError: () => {
        alert("Failed to redeem reward.");
      },
    });
  };

  return (
    <Stack spacing={3}>
      {/* Available Rewards */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Available Rewards
        </Typography>
        {rewardsQuery.isLoading ? (
          <LinearProgress />
        ) : rewardsQuery.data?.length > 0 ? (
          <Grid container spacing={2}>
            {rewardsQuery.data?.map((reward: any) => (
              <Grid item xs={12} md={6} key={reward.id}>
                <Card
                  sx={{
                    background: reward.canRedeem
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
                    color: reward.canRedeem ? "white" : "#666",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {reward.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {reward.description}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={`${reward.pointsRequired} Points`}
                        size="small"
                        sx={{
                          backgroundColor: reward.canRedeem
                            ? "rgba(255,255,255,0.3)"
                            : "rgba(0,0,0,0.1)",
                        }}
                      />
                      <Chip
                        label={`${reward.discountPercentage}% Off`}
                        size="small"
                        sx={{
                          backgroundColor: reward.canRedeem
                            ? "rgba(255,255,255,0.3)"
                            : "rgba(0,0,0,0.1)",
                        }}
                      />
                      {reward.maxRedemptions && (
                        <Chip
                          label={`${reward.availableRedemptions} Left`}
                          size="small"
                          sx={{
                            backgroundColor: reward.canRedeem
                              ? "rgba(255,255,255,0.3)"
                              : "rgba(0,0,0,0.1)",
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    {reward.canRedeem ? (
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          backgroundColor: "white",
                          color: "#667eea",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                        onClick={() => handleRedeemReward(reward.id)}
                        disabled={redeemRewardMutation.isPending}
                      >
                        Redeem Now
                      </Button>
                    ) : (
                      <Typography variant="caption">
                        Insufficient points
                      </Typography>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="textSecondary">No rewards available.</Typography>
        )}
      </Paper>

      {/* Earned Rewards */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your Earned Rewards
        </Typography>
        {userRewardsQuery.isLoading ? (
          <LinearProgress />
        ) : userRewardsQuery.data?.length > 0 ? (
          <Grid container spacing={2}>
            {userRewardsQuery.data?.map((userReward: any) => (
              <Grid item xs={12} md={6} key={userReward.id}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6">
                        {userReward.reward?.name}
                      </Typography>
                      <Chip
                        label={userReward.status}
                        color={
                          userReward.status === "redeemed"
                            ? "success"
                            : "warning"
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {userReward.reward?.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="textSecondary">
                        {userReward.status === "redeemed"
                          ? `Redeemed: ${new Date(
                              userReward.redeemedAt
                            ).toLocaleDateString()}`
                          : `Earned: ${new Date(
                              userReward.earnedAt
                            ).toLocaleDateString()}`}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="textSecondary">No rewards earned yet.</Typography>
        )}
      </Paper>
    </Stack>
  );
};
