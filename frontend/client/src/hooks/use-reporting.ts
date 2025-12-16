import { useQuery, useMutation } from '@tanstack/react-query';

import { api } from '../lib/api';

interface ReportTemplate {
  name: string;
  description: string;
  columns: string[];
}

interface ReportData {
  report_type: string;
  generated_at: string;
  summary: Record<string, any>;
  [key: string]: any;
}


export const useReportTemplates = () => {
  return useQuery({
    queryKey: ['report-templates'],
    queryFn: () => api.get('/reports/templates'),
    staleTime: 10 * 60 * 1000,
  });
};

export const useComplianceReport = (branchId?: number) => {
  return useQuery({
    queryKey: ['compliance-report', branchId],
    queryFn: async () => {
      const params = branchId ? `?branch_id=${branchId}` : '';

      return api.get(`/reports/generate/compliance${params}`);
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useOperationsReport = (daysBack = 1, branchId?: number) => {
  return useQuery({
    queryKey: ['operations-report', daysBack, branchId],
    queryFn: async () => {
      const params = new URLSearchParams({
        days_back: daysBack.toString(),
        ...(branchId && { branch_id: branchId.toString() }),
      });

      return api.get(`/reports/generate/operations?${params}`);
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFinancialReport = (month?: number, branchId?: number) => {
  return useQuery({
    queryKey: ['financial-report', month, branchId],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(month && { month: month.toString() }),
        ...(branchId && { branch_id: branchId.toString() }),
      });

      return api.get(`/reports/generate/financial?${params}`);
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMemberReport = (branchId?: number) => {
  return useQuery({
    queryKey: ['member-report', branchId],
    queryFn: async () => {
      const params = branchId ? `?branch_id=${branchId}` : '';

      return api.get(`/reports/generate/members${params}`);
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRiskReport = (branchId?: number) => {
  return useQuery({
    queryKey: ['risk-report', branchId],
    queryFn: async () => {
      const params = branchId ? `?branch_id=${branchId}` : '';

      return api.get(`/reports/generate/risk${params}`);
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useExportReportPDF = () => {
  return useMutation({
    mutationFn: (data: { reportType: string; reportData: ReportData }) =>

      api.post(`/reports/export/${data.reportType}/pdf`, { report_data: data.reportData }),
  });
};

export const useExportReportExcel = () => {
  return useMutation({
    mutationFn: (data: { reportType: string; reportData: ReportData }) =>

      api.post(`/reports/export/${data.reportType}/excel`, { report_data: data.reportData }),
  });
};

export const useSendReportEmail = () => {
  return useMutation({
    mutationFn: (data: { recipients: string[]; subject: string; reportData: ReportData }) =>

      api.post('/reports/email-report', data),
  });
};
