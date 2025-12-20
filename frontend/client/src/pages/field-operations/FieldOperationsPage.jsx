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
import { Box, Container, Grid, Paper, Tabs, Tab, Typography, Card, CardContent, Chip, Stack, Button, LinearProgress, } from "@mui/material";
import { LocationOn, Assessment, PhoneAndroid, Settings, } from "@mui/icons-material";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { MobileLoanWizard } from "@/components/field-operations/MobileLoanWizard";
import { PhotoCapture } from "@/components/field-operations/PhotoCapture";
import { VisitTracking } from "@/components/field-operations/VisitTracking";
import { OfflineSyncStatus } from "@/components/field-operations/OfflineSyncStatus";
import { BiometricAuthSetup } from "@/components/field-operations/BiometricAuthSetup";
import { useFieldVisits, useMobileApplications, useOfficerPerformance, useOfflineSync, } from "@/hooks/use-field-operations";
function TabPanel(props) {
    var children = props.children, value = props.value, index = props.index, other = __rest(props, ["children", "value", "index"]);
    return (<div role="tabpanel" hidden={value !== index} id={"field-ops-tabpanel-".concat(index)} aria-labelledby={"field-ops-tab-".concat(index)} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>);
}
export var FieldOperationsPage = function () {
    var _a = useState(0), tabValue = _a[0], setTabValue = _a[1];
    var _b = useAuth(), user = _b.user, isLoading = _b.isLoading;
    var userId = (user === null || user === void 0 ? void 0 : user.id) || 0;
    var _c = useFieldVisits(userId), visits = _c.data, visitsLoading = _c.isLoading;
    var applications = useMobileApplications(userId).data;
    var performance = useOfficerPerformance(userId).data;
    var syncStatus = useOfflineSync(userId).data;
    if (isLoading) {
        return (<Layout>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Typography>Loading...</Typography>
          </Box>
        </Container>
      </Layout>);
    }
    var draftApps = (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return app.applicationStatus === "draft"; })) || [];
    var submittedApps = (applications === null || applications === void 0 ? void 0 : applications.filter(function (app) { return app.applicationStatus === "submitted"; })) || [];
    var completedVisits = (visits === null || visits === void 0 ? void 0 : visits.filter(function (v) { return v.completed; })) || [];
    var activeVisits = (visits === null || visits === void 0 ? void 0 : visits.filter(function (v) { return !v.completed; })) || [];
    return (<Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{
            p: 3,
            mb: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
        }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
              Field Operations
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage your visits, applications, and field work efficiently
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip label={"".concat(activeVisits.length, " Active Visits")} color="primary" variant="outlined"/>
              <Chip label={"".concat(draftApps.length, " Draft Apps")} color="primary" variant="outlined"/>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <LocationOn color="primary" sx={{ fontSize: 40 }}/>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Total Visits
                  </Typography>
                  <Typography variant="h5">
                    {(visits === null || visits === void 0 ? void 0 : visits.length) || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <PhoneAndroid color="primary" sx={{ fontSize: 40 }}/>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Applications
                  </Typography>
                  <Typography variant="h5">
                    {(applications === null || applications === void 0 ? void 0 : applications.length) || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Assessment color="primary" sx={{ fontSize: 40 }}/>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Performance
                  </Typography>
                  <Typography variant="h5">
                    {(performance === null || performance === void 0 ? void 0 : performance.visitsCompleted) || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Settings color="primary" sx={{ fontSize: 40 }}/>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Sync Queue
                  </Typography>
                  <Typography variant="h5">
                    {(syncStatus === null || syncStatus === void 0 ? void 0 : syncStatus.pendingItems) || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <Tabs value={tabValue} onChange={function (e, newValue) { return setTabValue(newValue); }} aria-label="field operations tabs">
          <Tab label="Overview" id="field-ops-tab-0"/>
          <Tab label="Visits" id="field-ops-tab-1"/>
          <Tab label="Applications" id="field-ops-tab-2"/>
          <Tab label="Settings" id="field-ops-tab-3"/>
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <OfflineSyncStatus userId={userId}/>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Performance Metrics
                  </Typography>
                  {performance ? (<Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Visits Completed
                        </Typography>
                        <LinearProgress variant="determinate" value={Math.min(performance.visitsCompleted * 10, 100)}/>
                        <Typography variant="body2">
                          {performance.visitsCompleted}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Applications Submitted
                        </Typography>
                        <LinearProgress variant="determinate" value={Math.min(performance.applicationsSubmitted * 10, 100)}/>
                        <Typography variant="body2">
                          {performance.applicationsSubmitted}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Approval Rate
                        </Typography>
                        <LinearProgress variant="determinate" value={parseFloat(performance.approvalRate) || 0}/>
                        <Typography variant="body2">
                          {performance.approvalRate}%
                        </Typography>
                      </Box>
                    </Stack>) : (<Typography color="textSecondary">No data yet</Typography>)}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <VisitTracking userId={userId}/>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <MobileLoanWizard memberId={userId}/>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <PhotoCapture entityType="application" entityId={userId}/>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <BiometricAuthSetup userId={userId}/>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    App Settings
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2">Data Sync</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Automatic: Every 30 minutes
                      </Typography>
                      <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                        Manual Sync Now
                      </Button>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">Storage</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Local Data: 2.4 MB
                      </Typography>
                      <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                        Clear Cache
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      </Container>
    </Layout>);
};
