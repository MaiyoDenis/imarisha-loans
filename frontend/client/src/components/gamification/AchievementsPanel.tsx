import React from "react";
import {
  Grid,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Stack,
} from "@mui/material";
import { useAchievements, useBadges } from "@/hooks/use-gamification";

interface AchievementsPanelProps {
  userId: number;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  userId,
}) => {
  const achievementsQuery = useAchievements(userId);
  const badgesQuery = useBadges(userId);

  return (
    <Stack spacing={2}>
      {/* Achievements Section */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Achievements
        </Typography>
        {achievementsQuery.isLoading ? (
          <LinearProgress />
        ) : achievementsQuery.data?.length > 0 ? (
          <Grid container spacing={2}>
            {achievementsQuery.data?.map((achievement: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ textAlign: "center", mb: 1 }}>
                      {achievement.iconUrl && (
                        <img
                          src={achievement.iconUrl}
                          alt={achievement.name}
                          style={{
                            width: 48,
                            height: 48,
                            marginBottom: 8,
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      {achievement.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {achievement.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="primary">
                        +{achievement.points} pts
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="textSecondary">
            No achievements yet. Keep working!
          </Typography>
        )}
      </Paper>

      {/* Badges Section */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Badges
        </Typography>
        {badgesQuery.isLoading ? (
          <LinearProgress />
        ) : badgesQuery.data?.length > 0 ? (
          <Grid container spacing={2}>
            {badgesQuery.data?.map((badge: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${
                      badge.category === "milestone"
                        ? "#FFD700"
                        : badge.category === "expert"
                        ? "#FF6B6B"
                        : "#4ECDC4"
                    } 0%, ${
                      badge.category === "milestone"
                        ? "#FFA500"
                        : badge.category === "expert"
                        ? "#FF4444"
                        : "#44B4AA"
                    } 100%)`,
                    color: "white",
                  }}
                >
                  <CardContent>
                    <Box sx={{ textAlign: "center", mb: 1 }}>
                      {badge.iconUrl && (
                        <img
                          src={badge.iconUrl}
                          alt={badge.name}
                          style={{
                            width: 56,
                            height: 56,
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "bold", mb: 0.5 }}
                    >
                      {badge.name}
                    </Typography>
                    <Typography variant="caption">
                      {badge.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="textSecondary">No badges earned yet.</Typography>
        )}
      </Paper>
    </Stack>
  );
};
