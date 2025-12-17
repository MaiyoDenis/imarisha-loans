import React, { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Stack,
} from "@mui/material";
import {
  useChallenges,
  useUserChallenges,
  useJoinChallenge,
  useUpdateChallengeProgress,
} from "@/hooks/use-gamification";

interface ChallengesPanelProps {
  userId: number;
}

export const ChallengesPanel: React.FC<ChallengesPanelProps> = ({ userId }) => {
  const challengesQuery = useChallenges();
  const userChallengesQuery = useUserChallenges(userId);
  const joinChallengeMutation = useJoinChallenge();
  const updateProgressMutation = useUpdateChallengeProgress();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [progressAmount, setProgressAmount] = useState("");

  const handleJoinChallenge = (challengeId: number) => {
    joinChallengeMutation.mutate(challengeId, {
      onSuccess: () => {
        alert("Successfully joined challenge!");
      },
    });
  };

  const handleOpenProgressDialog = (challenge: any) => {
    setSelectedChallenge(challenge);
    setProgressAmount("");
    setOpenDialog(true);
  };

  const handleUpdateProgress = () => {
    if (selectedChallenge && progressAmount) {
      updateProgressMutation.mutate(
        {
          challengeId: selectedChallenge.id,
          progress: parseFloat(progressAmount),
        },
        {
          onSuccess: () => {
            setOpenDialog(false);
            alert("Progress updated!");
          },
        }
      );
    }
  };

  const userChallengeIds = new Set(
    userChallengesQuery.data?.map((uc: any) => uc.challengeId)
  );

  return (
    <Stack spacing={3}>
      {/* Active Challenges */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your Challenges
        </Typography>
        {userChallengesQuery.isLoading ? (
          <LinearProgress />
        ) : userChallengesQuery.data?.length > 0 ? (
          <Grid container spacing={2}>
            {userChallengesQuery.data?.map((uc: any) => (
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6">
                        {uc.challengeId}
                      </Typography>
                      <Chip
                        label={uc.status}
                        color={
                          uc.status === "completed" ? "success" : "primary"
                        }
                        size="small"
                      />
                    </Box>
                    <Typography color="textSecondary" variant="caption">
                      Progress
                    </Typography>
                    <Box sx={{ my: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          (parseFloat(uc.progress) / 100) * 100,
                          100
                        )}
                      />
                      <Typography variant="caption">
                        {uc.progress} / 100
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    {uc.status === "active" && (
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleOpenProgressDialog(uc)}
                      >
                        Update Progress
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="textSecondary">No active challenges.</Typography>
        )}
      </Paper>

      {/* Available Challenges */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Available Challenges
        </Typography>
        {challengesQuery.isLoading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={2}>
            {challengesQuery.data?.map((challenge: any) => {
              const isJoined = userChallengeIds.has(challenge.id);
              return (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {challenge.name}
                      </Typography>
                      <Typography
                        color="textSecondary"
                        variant="body2"
                        sx={{ mb: 1 }}
                      >
                        {challenge.description}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <Chip
                          label={`Target: ${challenge.targetValue}`}
                          size="small"
                        />
                        <Chip
                          label={`Reward: ${challenge.rewardPoints} pts`}
                          color="success"
                          size="small"
                        />
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        Type: {challenge.challengeType}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      {!isJoined && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleJoinChallenge(challenge.id)}
                          disabled={joinChallengeMutation.isPending}
                        >
                          Join Challenge
                        </Button>
                      )}
                      {isJoined && (
                        <Chip label="Already Joined" color="primary" />
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>

      {/* Progress Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Challenge Progress</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Progress Amount"
            type="number"
            fullWidth
            value={progressAmount}
            onChange={(e) => setProgressAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateProgress}
            variant="contained"
            disabled={updateProgressMutation.isPending || !progressAmount}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
