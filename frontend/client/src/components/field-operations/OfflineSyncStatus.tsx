import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import {
  CloudSync,
  CloudOff,
  Error as ErrorIcon,
  Refresh,
} from "@mui/icons-material";
import {
  useOfflineSync,
  useSyncQueue,
  useProcessSync,
  useResolveConflict,
} from "@/hooks/use-field-operations";

interface OfflineSyncStatusProps {
  userId: number;
}

export const OfflineSyncStatus: React.FC<OfflineSyncStatusProps> = ({
  userId,
}) => {
  const [openDetails, setOpenDetails] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { data: syncStatus } = useOfflineSync(userId);
  const { data: queue } = useSyncQueue(userId);
  const processMutation = useProcessSync();
  const resolveMutation = useResolveConflict();

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (queue && queue.length > 0) {
      const pendingItems = queue.filter((item: any) => item.status === "pending");
      await processMutation.mutateAsync(
        pendingItems.map((item: any) => ({ id: item.id }))
      );
    }
  };

  const handleResolveConflict = async (syncId: number) => {
    await resolveMutation.mutateAsync({
      conflictId: syncId,
      resolution: "server",
    });
  };

  const pendingCount = syncStatus?.pendingItems || 0;
  const failedCount = syncStatus?.failedItems || 0;
  const totalItems = pendingCount + failedCount;

  return (
    <>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isOnline ? (
                <>
                  <CloudSync color="success" />
                  <Typography variant="subtitle2">Online</Typography>
                </>
              ) : (
                <>
                  <CloudOff color="warning" />
                  <Typography variant="subtitle2">Offline</Typography>
                </>
              )}
            </Box>

            {totalItems > 0 && (
              <Chip
                icon={<Refresh />}
                label={`${totalItems} pending`}
                color={failedCount > 0 ? "error" : "warning"}
                variant="outlined"
              />
            )}
          </Stack>

          {!isOnline && (
            <Alert severity="info" sx={{ mb: 2 }}>
              You are offline. Changes are being saved locally and will sync when you're back online.
            </Alert>
          )}

          {failedCount > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {failedCount} items failed to sync. Click "Retry" to try again.
            </Alert>
          )}

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="textSecondary" display="block">
                Last Sync: {syncStatus?.lastSync ? new Date(syncStatus.lastSync).toLocaleTimeString() : "Never"}
              </Typography>
            </Box>

            {pendingCount > 0 && (
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleSync}
                disabled={processMutation.isPending || !isOnline}
                fullWidth
              >
                {processMutation.isPending ? "Syncing..." : "Sync Now"}
              </Button>
            )}

            {totalItems > 0 && (
              <Button
                variant="outlined"
                onClick={() => setOpenDetails(true)}
                fullWidth
              >
                View Queue Details
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sync Queue Details</DialogTitle>
        <DialogContent>
          {queue && queue.length > 0 ? (
            <List>
              {queue.map((item: any) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    item.status === "failed" && (
                      <Button
                        edge="end"
                        size="small"
                        onClick={() => handleResolveConflict(item.id)}
                      >
                        Retry
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2">
                          {item.entityType}: {item.operation}
                        </Typography>
                        <Chip
                          label={item.status}
                          size="small"
                          color={
                            item.status === "synced"
                              ? "success"
                              : item.status === "failed"
                              ? "error"
                              : "warning"
                          }
                        />
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption">
                        Attempts: {item.retryCount}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="textSecondary">Queue is empty</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
