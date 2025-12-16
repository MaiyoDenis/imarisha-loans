import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  ImageList,
  ImageListItem,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CameraAlt, Delete as DeleteIcon } from "@mui/icons-material";
import { usePhotoCapture, usePhotos, useGeolocation } from "@/hooks/use-field-operations";

interface PhotoCaptureProps {
  entityType: string;
  entityId: number;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  entityType,
  entityId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [openPreview, setOpenPreview] = useState(false);

  const uploadMutation = usePhotoCapture();
  const { data: photos } = usePhotos(entityType, entityId);
  const { location } = useGeolocation();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        setCapturedPhoto(canvasRef.current.toDataURL("image/jpeg"));
        setOpenPreview(true);
      }
    }
  };

  const uploadPhoto = async () => {
    if (capturedPhoto) {
      const blob = await fetch(capturedPhoto).then((r) => r.blob());
      const file = new File([blob], `photo_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      await uploadMutation.mutateAsync({
        entityType,
        entityId,
        file,
        description,
        gpsLatitude: location?.latitude,
        gpsLongitude: location?.longitude,
        tags,
      });

      setCapturedPhoto(null);
      setDescription("");
      setTags([]);
      setOpenPreview(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag("");
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Photo Documentation
        </Typography>

        {!cameraActive ? (
          <Button
            variant="contained"
            startIcon={<CameraAlt />}
            onClick={startCamera}
            fullWidth
            sx={{ mb: 2 }}
          >
            Open Camera
          </Button>
        ) : (
          <Stack spacing={2}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                paddingBottom: "75%",
                overflow: "hidden",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            </Box>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={takePhoto} fullWidth>
                Capture Photo
              </Button>
              <Button variant="outlined" onClick={stopCamera} fullWidth>
                Close Camera
              </Button>
            </Stack>
          </Stack>
        )}

        {capturedPhoto && (
          <Dialog open={openPreview} onClose={() => setOpenPreview(false)}>
            <DialogTitle>Photo Preview</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={capturedPhoto}
                  alt="Preview"
                />
              </Box>
              <TextField
                label="Description"
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Add Tag"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Box sx={{ mb: 2 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => setTags(tags.filter((t) => t !== tag))}
                    sx={{ mr: 1 }}
                  />
                ))}
              </Box>
              {location && (
                <Typography variant="caption" color="textSecondary">
                  GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenPreview(false)}>Cancel</Button>
              <Button
                onClick={uploadPhoto}
                variant="contained"
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {uploadMutation.isPending && <LinearProgress />}

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>
          Recent Photos ({photos?.length || 0})
        </Typography>

        {photos && photos.length > 0 ? (
          <ImageList cols={2} gap={8}>
            {photos.map((photo: any) => (
              <ImageListItem key={photo.id}>
                <CardMedia
                  component="img"
                  height="150"
                  image={photo.photoUrl}
                  alt={photo.description}
                  sx={{ objectFit: "cover" }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Typography color="textSecondary" variant="body2">
            No photos yet
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
