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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Switch,
  Typography,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Fingerprint, Info, Lock } from "@mui/icons-material";
import {
  useBiometricAuth,
  useEnrollBiometric,
  useUserBiometrics,
} from "@/hooks/use-field-operations";

interface BiometricAuthSetupProps {
  userId: number;
}

export const BiometricAuthSetup: React.FC<BiometricAuthSetupProps> = ({
  userId,
}) => {
  const [openEnroll, setOpenEnroll] = useState(false);
  const [authType, setAuthType] = useState("fingerprint");
  const [deviceId, setDeviceId] = useState("");
  const [pinFallback, setPinFallback] = useState("");

  const { supported } = useBiometricAuth();
  const enrollMutation = useEnrollBiometric();
  const { data: userBiometrics } = useUserBiometrics(userId);

  const handleEnroll = async () => {
    if (authType && deviceId) {
      await enrollMutation.mutateAsync({ authType, deviceId });
      setAuthType("fingerprint");
      setDeviceId("");
      setPinFallback("");
      setOpenEnroll(false);
    }
  };

  const authTypeIcons: Record<string, React.ReactElement> = {
    fingerprint: <Fingerprint />,
    face: <Fingerprint />,
    iris: <Fingerprint />,
  };

  return (
    <>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Lock color="primary" />
            <Box>
              <Typography variant="h6">Biometric Authentication</Typography>
              <Typography variant="caption" color="textSecondary">
                {supported ? "Available on this device" : "Not available"}
              </Typography>
            </Box>
          </Stack>

          {!supported && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Biometric authentication is not available on this device. Please use PIN as fallback.
            </Alert>
          )}

          {userBiometrics && userBiometrics.length > 0 ? (
            <Stack spacing={2}>
              <Typography variant="subtitle2">Enrolled Methods:</Typography>
              <List>
                {userBiometrics.map((bio: any) => (
                  <ListItem key={bio.id}>
                    <ListItemIcon>
                      {authTypeIcons[bio.authType] || <Fingerprint />}
                    </ListItemIcon>
                    <ListItemText
                      primary={bio.authType.charAt(0).toUpperCase() + bio.authType.slice(1)}
                      secondary={`Device: ${bio.deviceId}`}
                    />
                    <Switch defaultChecked={bio.enabled} />
                  </ListItem>
                ))}
              </List>

              <Button
                variant="outlined"
                onClick={() => setOpenEnroll(true)}
                fullWidth
              >
                Add Another Method
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Typography variant="body2" color="textSecondary">
                No biometric methods enrolled yet.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setOpenEnroll(true)}
                disabled={!supported}
                fullWidth
              >
                Enroll Biometric
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      <Dialog open={openEnroll} onClose={() => setOpenEnroll(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enroll Biometric Authentication</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <Alert severity="info">
              <Typography variant="caption">
                <Info sx={{ mr: 1, fontSize: 16 }} />
                Follow the on-screen prompts to register your biometric. You'll need to repeat the action 3-5 times for best accuracy.
              </Typography>
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Authentication Type</InputLabel>
              <Select
                value={authType}
                onChange={(e) => setAuthType(e.target.value)}
                label="Authentication Type"
              >
                <MenuItem value="fingerprint">Fingerprint</MenuItem>
                <MenuItem value="face">Face Recognition</MenuItem>
                <MenuItem value="iris">Iris Scan</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Device Identifier"
              placeholder="e.g., iPhone 13, Galaxy A12"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              fullWidth
              helperText="Helps identify the device this was enrolled on"
            />

            <Box sx={{ p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Backup PIN (optional)
              </Typography>
              <TextField
                label="Set a PIN for backup"
                type="password"
                value={pinFallback}
                onChange={(e) => setPinFallback(e.target.value)}
                fullWidth
                helperText="Use if biometric fails"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEnroll(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEnroll}
            disabled={!authType || !deviceId || enrollMutation.isPending}
          >
            {enrollMutation.isPending ? "Enrolling..." : "Enroll"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
