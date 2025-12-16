import React, { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useCreateApplication, useUpdateApplicationStep } from "@/hooks/use-field-operations";

interface MobileLoanWizardProps {
  memberId: number;
  onSuccess?: (appId: number) => void;
}

const steps = ["Select Loan Type", "Enter Amount", "Verification", "Collateral", "Review & Submit"];

export const MobileLoanWizard: React.FC<MobileLoanWizardProps> = ({
  memberId,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [appId, setAppId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createAppMutation = useCreateApplication();
  const updateStepMutation = useUpdateApplicationStep();

  const handleNext = async () => {
    try {
      if (activeStep === 0) {
        const result = await createAppMutation.mutateAsync({
          memberId,
          loanTypeId: parseInt(formData.loanTypeId || "0"),
          amount: parseFloat(formData.amount || "0"),
        });
        setAppId(result.id);
      } else if (appId) {
        await updateStepMutation.mutateAsync({
          appId,
          step: activeStep + 1,
          formData,
        });
      }
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    } catch (err: any) {
      setError(err.message || "Failed to proceed");
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Loan Application Wizard
        </Typography>

        <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          {activeStep === 0 && (
            <FormControl fullWidth>
              <InputLabel>Loan Type</InputLabel>
              <Select
                value={formData.loanTypeId || ""}
                onChange={(e) => handleChange("loanTypeId", e.target.value)}
                label="Loan Type"
              >
                <MenuItem value="1">Personal Loan</MenuItem>
                <MenuItem value="2">Business Loan</MenuItem>
                <MenuItem value="3">Agriculture Loan</MenuItem>
                <MenuItem value="4">Emergency Loan</MenuItem>
              </Select>
            </FormControl>
          )}

          {activeStep === 1 && (
            <Stack spacing={2}>
              <TextField
                label="Loan Amount"
                type="number"
                value={formData.amount || ""}
                onChange={(e) => handleChange("amount", e.target.value)}
                fullWidth
                inputProps={{ step: "100" }}
              />
              <TextField
                label="Purpose"
                multiline
                rows={3}
                value={formData.purpose || ""}
                onChange={(e) => handleChange("purpose", e.target.value)}
                fullWidth
              />
            </Stack>
          )}

          {activeStep === 2 && (
            <Stack spacing={2}>
              <TextField
                label="Identification Number"
                value={formData.idNumber || ""}
                onChange={(e) => handleChange("idNumber", e.target.value)}
                fullWidth
              />
              <TextField
                label="Phone Number"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                fullWidth
              />
              <Typography variant="caption" color="textSecondary">
                Photo ID will be captured in next step
              </Typography>
            </Stack>
          )}

          {activeStep === 3 && (
            <Stack spacing={2}>
              <TextField
                label="Collateral Description"
                multiline
                rows={3}
                value={formData.collateral || ""}
                onChange={(e) => handleChange("collateral", e.target.value)}
                fullWidth
              />
              <TextField
                label="Estimated Value (KES)"
                type="number"
                value={formData.collateralValue || ""}
                onChange={(e) => handleChange("collateralValue", e.target.value)}
                fullWidth
              />
            </Stack>
          )}

          {activeStep === 4 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Review Your Application:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Loan Type:</strong> {formData.loanTypeId}
                </Typography>
                <Typography variant="body2">
                  <strong>Amount:</strong> KES {parseFloat(formData.amount || "0").toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Purpose:</strong> {formData.purpose}
                </Typography>
                <Typography variant="body2">
                  <strong>Collateral:</strong> {formData.collateral}
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>

        <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={createAppMutation.isPending || updateStepMutation.isPending}
          >
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
