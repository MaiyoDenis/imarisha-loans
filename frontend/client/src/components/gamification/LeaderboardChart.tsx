import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material";
import { useLeaderboard, useBranchLeaderboard } from "@/hooks/use-gamification";

interface LeaderboardChartProps {
  branchId?: number;
  limit?: number;
}

export const LeaderboardChart: React.FC<LeaderboardChartProps> = ({
  branchId,
  limit = 20,
}) => {
  const globalQuery = useLeaderboard(limit);
  const branchQuery = useBranchLeaderboard(branchId || 0, limit);

  const data = branchId ? branchQuery.data : globalQuery.data;
  const isLoading = branchId ? branchQuery.isLoading : globalQuery.isLoading;

  const medalColors: Record<number, string> = {
    1: "#FFD700",
    2: "#C0C0C0",
    3: "#CD7F32",
  };

  const getMedalEmoji = (rank: number): string => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}`;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {branchId ? "Branch" : "Global"} Leaderboard
      </Typography>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Member</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Branch</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Points
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((entry: any) => (
                <TableRow key={entry.id} hover>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor:
                          medalColors[entry.rank] || "#e0e0e0",
                        fontWeight: "bold",
                        color:
                          entry.rank <= 3
                            ? entry.rank === 1
                              ? "black"
                              : "white"
                            : "black",
                      }}
                    >
                      {getMedalEmoji(entry.rank)}
                    </Box>
                  </TableCell>
                  <TableCell>{entry.userName}</TableCell>
                  <TableCell>{entry.userBranch}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${entry.points} pts`}
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
};
