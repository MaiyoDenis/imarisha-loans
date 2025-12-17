import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LocationOn, Timer, Notes as NotesIcon } from "@mui/icons-material";
import {
  useFieldVisits,
  useCreateVisit,
  useCompleteVisit,
  useGeolocation,
} from "@/hooks/use-field-operations";

interface VisitTrackingProps {
  userId: number;
  memberId?: number;
}

export const VisitTracking: React.FC<VisitTrackingProps> = ({
  userId,
  memberId,
}) => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openComplete, setOpenComplete] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [formData, setFormData] = useState({
    purpose: "",
    notes: "",
    duration: "",
  });

  const { data: visits, isLoading } = useFieldVisits(userId);
  const createMutation = useCreateVisit();
  const completeMutation = useCompleteVisit();
  const { location, getLocation, loading: locationLoading } = useGeolocation();

  const handleCreateVisit = async () => {
    if (!location) {
      getLocation();
      return;
    }

    await createMutation.mutateAsync({
      memberId: memberId || 0,
      purpose: formData.purpose,
      latitude: location.latitude,
      longitude: location.longitude,
      notes: formData.notes,
    });

    setFormData({ purpose: "", notes: "", duration: "" });
    setOpenCreate(false);
  };

  const handleCompleteVisit = async () => {
    if (selectedVisit) {
      await completeMutation.mutateAsync({
        visitId: selectedVisit.id,
        notes: formData.notes,
        duration: parseInt(formData.duration || "0"),
      });

      setOpenComplete(false);
      setSelectedVisit(null);
      setFormData({ purpose: "", notes: "", duration: "" });
    }
  };

  const purposeOptions = [
    "Loan Application",
    "Loan Disbursement",
    "Repayment Collection",
    "Follow-up",
    "Problem Solving",
  ];

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Field Visits</Typography>
              <Button variant="contained" onClick={() => setOpenCreate(true)}>
                New Visit
              </Button>
            </Stack>

            {isLoading ? (
              <LinearProgress />
            ) : visits && visits.length > 0 ? (
              <List>
                {visits.map((visit: any) => (
                  <ListItemButton
                    key={visit.id}
                    onClick={() => {
                      setSelectedVisit(visit);
                      if (!visit.completed) {
                        setOpenComplete(true);
                      }
                    }}
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2">
                            {visit.visitPurpose}
                          </Typography>
                          <Chip
                            label={visit.completed ? "Completed" : "Active"}
                            color={visit.completed ? "success" : "warning"}
                            size="small"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LocationOn fontSize="small" />
                            <Typography variant="caption">
                              {visit.latitude}, {visit.longitude}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Timer fontSize="small" />
                            <Typography variant="caption">
                              {visit.durationMinutes || "In progress"} minutes
                            </Typography>
                          </Box>
                          {visit.notes && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <NotesIcon fontSize="small" />
                              <Typography variant="caption">
                                {visit.notes.substring(0, 50)}...
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">No visits yet</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Visit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Visit Purpose</InputLabel>
              <Select
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                label="Visit Purpose"
              >
                {purposeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              fullWidth
            />

            {location ? (
              <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="caption" display="block">
                  Current Location:
                </Typography>
                <Typography variant="body2" color="primary">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Accuracy: ±{Math.round(location.accuracy)} meters
                </Typography>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={getLocation}
                disabled={locationLoading}
              >
                {locationLoading ? "Getting Location..." : "Get Current Location"}
              </Button>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateVisit}
            disabled={!formData.purpose || createMutation.isPending}
          >
            Create Visit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openComplete} onClose={() => setOpenComplete(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Visit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <TextField
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              fullWidth
            />

            <TextField
              label="Final Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenComplete(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCompleteVisit}
            disabled={!formData.duration || completeMutation.isPending}
          >
            Complete Visit
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};
