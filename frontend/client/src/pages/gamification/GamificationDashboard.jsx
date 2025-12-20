var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { useState } from "react";
import { Container, Paper, Tabs, Tab, Box, Grid, Card, CardContent, Typography, LinearProgress, Stack, Chip, } from "@mui/material";
import Layout from "@/components/layout/Layout";
import { useGamificationSummary, useUserRank, usePoints } from "@/hooks/use-gamification";
import { LeaderboardChart } from "@/components/gamification/LeaderboardChart";
import { AchievementsPanel } from "@/components/gamification/AchievementsPanel";
import { ChallengesPanel } from "@/components/gamification/ChallengesPanel";
import { RewardsPanel } from "@/components/gamification/RewardsPanel";
import { useAuth } from "@/lib/auth";
function TabPanel(props) {
    var children = props.children, value = props.value, index = props.index, other = __rest(props, ["children", "value", "index"]);
    return (<div role="tabpanel" hidden={value !== index} id={"gamification-tabpanel-".concat(index)} aria-labelledby={"gamification-tab-".concat(index)} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>);
}
export var GamificationDashboard = function () {
    var user = useAuth().user;
    var _a = useState(0), tabValue = _a[0], setTabValue = _a[1];
    var userId = (user === null || user === void 0 ? void 0 : user.id) || 0;
    var summaryQuery = useGamificationSummary(userId);
    var rankQuery = useUserRank(userId);
    var pointsQuery = usePoints(userId);
    var getTierColor = function (tier) {
        switch (tier) {
            case "diamond":
                return "#0099ff";
            case "platinum":
                return "#e0e0e0";
            case "gold":
                return "#ffd700";
            case "silver":
                return "#c0c0c0";
            case "bronze":
                return "#cd7f32";
            default:
                return "#999";
        }
    };
    var getTierIcon = function (tier) {
        switch (tier) {
            case "diamond":
                return "💎";
            case "platinum":
                return "🏆";
            case "gold":
                return "⭐";
            case "silver":
                return "✨";
            case "bronze":
                return "🥉";
            default:
                return "📊";
        }
    };
    return (<Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper className="glass-card gradient-border hover-tilt relative overflow-hidden" sx={{ p: 3, mb: 3 }}>
        <Box className="aura"/>


        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }} className="text-gradient">
              Gamification Dashboard
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Earn points, unlock achievements, and compete with others!
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {summaryQuery.isLoading ? (<LinearProgress />) : (<Stack spacing={2}>
                {/* Points Card */}
                {pointsQuery.data && (<Card sx={{ background: "rgba(255,255,255,0.08)" }} className="hover-tilt relative overflow-hidden">
                    <Box className="aura"/>
                    <CardContent>
                      <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Total Points
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            {pointsQuery.data.totalPoints}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="h2" sx={{ mb: 1 }}>
                            {getTierIcon(pointsQuery.data.pointsTier)}
                          </Typography>
                          <Chip label={pointsQuery.data.pointsTier.toUpperCase()} sx={{
                    background: getTierColor(pointsQuery.data.pointsTier),
                    color: "white",
                }}/>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>)}

                {/* Rank Card */}
                {rankQuery.data && (<Card sx={{ background: "rgba(255,255,255,0.08)" }} className="hover-tilt relative overflow-hidden">
                    <Box className="aura"/>
                    <CardContent>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        Current Rank
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        #{rankQuery.data.rank}
                      </Typography>
                    </CardContent>
                  </Card>)}
              </Stack>)}
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Grid */}
      {summaryQuery.data && (<Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#667eea" }}>
                  {summaryQuery.data.totalAchievements}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Achievements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#764ba2" }}>
                  {summaryQuery.data.totalBadges}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Badges
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4ecdc4" }}>
                  {summaryQuery.data.activeChallengges}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Active Challenges
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#ff6b6b" }}>
                  {summaryQuery.data.earnedRewards}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Earned Rewards
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>)}

      {/* Tabs */}
      <Paper className="glass-card gradient-border hover-tilt relative overflow-hidden">
        <Box className="aura"/>
        <Tabs value={tabValue} onChange={function (e, newValue) { return setTabValue(newValue); }} aria-label="gamification tabs" sx={{
            borderBottom: 1,
            borderColor: "divider",
            background: "transparent",
        }}>
          <Tab label="Leaderboard" id="gamification-tab-0"/>
          <Tab label="Achievements & Badges" id="gamification-tab-1"/>
          <Tab label="Challenges" id="gamification-tab-2"/>
          <Tab label="Rewards" id="gamification-tab-3"/>
        </Tabs>

        {/* Leaderboard Tab */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3}>
            <LeaderboardChart />
            {(user === null || user === void 0 ? void 0 : user.branch_id) && (<LeaderboardChart branchId={user.branch_id}/>)}
          </Stack>
        </TabPanel>

        {/* Achievements & Badges Tab */}
        <TabPanel value={tabValue} index={1}>
          <AchievementsPanel userId={userId}/>
        </TabPanel>

        {/* Challenges Tab */}
        <TabPanel value={tabValue} index={2}>
          <ChallengesPanel userId={userId}/>
        </TabPanel>

        {/* Rewards Tab */}
        <TabPanel value={tabValue} index={3}>
          <RewardsPanel userId={userId}/>
        </TabPanel>
      </Paper>
      </Container>
    </Layout>);
};
